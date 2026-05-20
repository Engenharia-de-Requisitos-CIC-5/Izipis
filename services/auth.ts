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
    name: 'João',
    email: 'joao@izipis.com',
    role: 'VENDOR',
  },
];

function getStoredUsers(): User[] {
  if (typeof window === 'undefined') return USERS;
  const stored = localStorage.getItem('izipis_users_list');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('izipis_users_list', JSON.stringify(USERS));
  return USERS;
}

export async function getUsers(): Promise<User[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return getStoredUsers();
}

export async function createUser(name: string, email: string, role: UserRole): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const users = getStoredUsers();
  const newUser: User = {
    id: `u${Date.now()}`,
    name,
    email,
    role,
  };
  users.push(newUser);
  if (typeof window !== 'undefined') {
    localStorage.setItem('izipis_users_list', JSON.stringify(users));
  }
  return newUser;
}

export async function deleteUser(id: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const users = getStoredUsers();
  const filtered = users.filter(u => u.id !== id);
  if (filtered.length !== users.length) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('izipis_users_list', JSON.stringify(filtered));
    }
    return true;
  }
  return false;
}

export async function login(email: string, password: string): Promise<User | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const users = getStoredUsers();
  const user = users.find((u) => u.email === email);
  
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

