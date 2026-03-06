export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface UpdateProfileDto {
  name?: string;
  email?: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}