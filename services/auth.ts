import { User, UserRole } from '@/lib/types';

const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin Izipis',
    email: 'admin@izipis.com',
    role: 'ADMIN',
  },
  {
    id: '2',
    name: 'Vendedor João',
    email: 'joao@izipis.com',
    role: 'VENDOR',
  },
];

export async function login(email: string, password: string): Promise<User | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const user = MOCK_USERS.find((u) => u.email === email);
  
  // For demo purposes, any password works if email exists
  if (user && password.length > 0) {
    return user;
  }

  return null;
}

export async function getCurrentUser(): Promise<User | null> {
  // In a real app, this would check a cookie or token
  return null;
}
