import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entity/Users';
import { RegisterDto, LoginDto, AuthResponse, JwtPayload } from '../types';

const userRepo = () => AppDataSource.getRepository(User);

export async function register(dto: RegisterDto): Promise<AuthResponse> {
  const existing = await userRepo().findOneBy({ email: dto.email });
  if (existing) throw new Error('Email already in use');

  const hashed = await bcrypt.hash(dto.password, 12);
  const user = userRepo().create({ ...dto, password: hashed });
  await userRepo().save(user);

  const token = signToken({ userId: user.id, email: user.email });
  return { token, user: { id: user.id, email: user.email, name: user.name } };
}

export async function login(dto: LoginDto): Promise<AuthResponse> {
  const user = await userRepo().findOneBy({ email: dto.email });
  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(dto.password, user.password);
  if (!valid) throw new Error('Invalid credentials');

  const token = signToken({ userId: user.id, email: user.email });
  return { token, user: { id: user.id, email: user.email, name: user.name } };
}

export async function getProfile(userId: string): Promise<Omit<User, 'password'>> {
  const user = await userRepo().findOneBy({ id: userId });
  if (!user) throw new Error('User not found');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...profile } = user;
  return profile as Omit<User, 'password'>;
}

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
}