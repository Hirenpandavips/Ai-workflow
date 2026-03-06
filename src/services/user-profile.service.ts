import { Not, Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../entity/Users';
import { UpdateProfileDto, UserProfileResponse } from '../types';

const userRepo = (): Repository<User> => AppDataSource.getRepository(User);

function toProfileResponse(user: User): UserProfileResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function getUserProfile(
  userId: string,
): Promise<UserProfileResponse> {
  const user = await userRepo().findOneBy({ id: userId });
  if (!user) throw new Error('User not found');
  return toProfileResponse(user);
}

export async function updateUserProfile(
  userId: string,
  dto: UpdateProfileDto,
): Promise<UserProfileResponse> {
  const user = await userRepo().findOneBy({ id: userId });
  if (!user) throw new Error('User not found');

  if (dto.email !== undefined && dto.email !== user.email) {
    const emailTaken = await userRepo().findOneBy({
      email: dto.email,
      id: Not(userId),
    });
    if (emailTaken) throw new Error('Email already in use');
    user.email = dto.email;
  }

  if (dto.name !== undefined) {
    user.name = dto.name;
  }

  const saved = await userRepo().save(user);
  return toProfileResponse(saved);
}
