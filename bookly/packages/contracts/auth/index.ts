export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}
