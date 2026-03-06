import {
  getUserProfile,
  updateUserProfile,
} from '../services/user-profile.service';
import { AppDataSource } from '../config/database';
import { User } from '../entity/Users';

jest.mock('../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

const now = new Date();

const mockUser: User = {
  id: 'uuid-123',
  email: 'test@example.com',
  password: 'hashed-password',
  name: 'Test User',
  createdAt: now,
  updatedAt: now,
};

const mockRepo = {
  findOneBy: jest.fn(),
  save: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);
});

describe('UserProfileService - getUserProfile', () => {
  it('should return user profile without password', async () => {
    mockRepo.findOneBy.mockResolvedValue(mockUser);

    const profile = await getUserProfile('uuid-123');

    expect(profile).toEqual({
      id: 'uuid-123',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: now,
      updatedAt: now,
    });
    expect(profile).not.toHaveProperty('password');
    expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 'uuid-123' });
  });

  it('should throw if user not found', async () => {
    mockRepo.findOneBy.mockResolvedValue(null);

    await expect(getUserProfile('bad-uuid')).rejects.toThrow('User not found');
  });
});

describe('UserProfileService - updateUserProfile', () => {
  it('should update name successfully', async () => {
    const updatedUser = { ...mockUser, name: 'New Name', updatedAt: new Date() };
    mockRepo.findOneBy.mockResolvedValue({ ...mockUser });
    mockRepo.save.mockResolvedValue(updatedUser);

    const result = await updateUserProfile('uuid-123', { name: 'New Name' });

    expect(result.name).toBe('New Name');
    expect(result).not.toHaveProperty('password');
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should update email successfully when not taken', async () => {
    const updatedUser = {
      ...mockUser,
      email: 'new@example.com',
      updatedAt: new Date(),
    };
    mockRepo.findOneBy
      .mockResolvedValueOnce({ ...mockUser }) // find user by id
      .mockResolvedValueOnce(null); // email not taken
    mockRepo.save.mockResolvedValue(updatedUser);

    const result = await updateUserProfile('uuid-123', {
      email: 'new@example.com',
    });

    expect(result.email).toBe('new@example.com');
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should skip email uniqueness check when email unchanged', async () => {
    mockRepo.findOneBy.mockResolvedValueOnce({ ...mockUser });
    mockRepo.save.mockResolvedValue({ ...mockUser, name: 'Updated' });

    await updateUserProfile('uuid-123', { email: 'test@example.com' });

    // findOneBy called only once (to find user), not twice (no email check)
    expect(mockRepo.findOneBy).toHaveBeenCalledTimes(1);
  });

  it('should throw if user not found', async () => {
    mockRepo.findOneBy.mockResolvedValue(null);

    await expect(
      updateUserProfile('bad-uuid', { name: 'New Name' }),
    ).rejects.toThrow('User not found');
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should throw if new email is already taken', async () => {
    const otherUser = { ...mockUser, id: 'uuid-other', email: 'taken@example.com' };
    mockRepo.findOneBy
      .mockResolvedValueOnce({ ...mockUser }) // find user by id
      .mockResolvedValueOnce(otherUser); // email taken by another user

    await expect(
      updateUserProfile('uuid-123', { email: 'taken@example.com' }),
    ).rejects.toThrow('Email already in use');
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should update both name and email', async () => {
    const updatedUser = {
      ...mockUser,
      name: 'New Name',
      email: 'new@example.com',
      updatedAt: new Date(),
    };
    mockRepo.findOneBy
      .mockResolvedValueOnce({ ...mockUser }) // find user by id
      .mockResolvedValueOnce(null); // email not taken
    mockRepo.save.mockResolvedValue(updatedUser);

    const result = await updateUserProfile('uuid-123', {
      name: 'New Name',
      email: 'new@example.com',
    });

    expect(result.name).toBe('New Name');
    expect(result.email).toBe('new@example.com');
    expect(result).not.toHaveProperty('password');
  });
});
