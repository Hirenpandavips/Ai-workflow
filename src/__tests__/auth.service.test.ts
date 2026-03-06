import bcrypt from 'bcryptjs';
import { register, login, getProfile } from '../services/auth.service';
import { AppDataSource } from '../config/database';
import { User } from '../entity/Users';

// Mock the DataSource so tests don't need a real DB
jest.mock('../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

const mockUser: Partial<User> = {
  id: 'uuid-123',
  email: 'test@example.com',
  password: '',
  name: 'Test User',
};

const mockRepo = {
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);
});

describe('AuthService - register', () => {
  it('should register a new user and return token', async () => {
    mockRepo.findOneBy.mockResolvedValue(null);
    mockRepo.create.mockReturnValue(mockUser);
    mockRepo.save.mockResolvedValue(mockUser);

    const result = await register({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('test@example.com');
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should throw if email already exists', async () => {
    mockRepo.findOneBy.mockResolvedValue(mockUser);

    await expect(
      register({ email: 'test@example.com', password: 'password123' }),
    ).rejects.toThrow('Email already in use');
  });
});

describe('AuthService - login', () => {
  it('should login with correct credentials', async () => {
    const hashed = await bcrypt.hash('password123', 12);
    mockRepo.findOneBy.mockResolvedValue({ ...mockUser, password: hashed });

    const result = await login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('test@example.com');
  });

  it('should throw on wrong password', async () => {
    const hashed = await bcrypt.hash('correctpassword', 12);
    mockRepo.findOneBy.mockResolvedValue({ ...mockUser, password: hashed });

    await expect(
      login({ email: 'test@example.com', password: 'wrongpassword' }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('should throw if user not found', async () => {
    mockRepo.findOneBy.mockResolvedValue(null);

    await expect(
      login({ email: 'nobody@example.com', password: 'password' }),
    ).rejects.toThrow('Invalid credentials');
  });
});

describe('AuthService - getProfile', () => {
  it('should return user without password', async () => {
    const hashed = await bcrypt.hash('pass', 12);
    mockRepo.findOneBy.mockResolvedValue({ ...mockUser, password: hashed });

    const profile = await getProfile('uuid-123');

    expect(profile).not.toHaveProperty('password');
    expect(profile.email).toBe('test@example.com');
  });

  it('should throw if user not found', async () => {
    mockRepo.findOneBy.mockResolvedValue(null);

    await expect(getProfile('bad-uuid')).rejects.toThrow('User not found');
  });
});