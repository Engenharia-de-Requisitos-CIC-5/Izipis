import { User, UserRole } from '@/lib/types';

const USERS: User[] = [
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

  const user = USERS.find((u) => u.email === email);
  
  // For demo purposes, any password works if email exists
  if (user && password.length > 0) {
    return user;
  }

  return null;
}

export async function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('izipis_user');
    const isProd = process.env.NODE_ENV === 'production';
    const basePath = isProd ? '/Izipis' : '';
    window.location.href = `${basePath}/login`;
  }
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('izipis_user');
  return stored ? JSON.parse(stored) : null;
}
