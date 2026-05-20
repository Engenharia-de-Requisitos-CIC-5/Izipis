import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function arraysEqualBy<T>(current: T[], next: T[], getKey: (item: T) => string, compare: (current: T, next: T) => boolean) {
  if (current.length !== next.length) return false;

  const currentMap = new Map(current.map((item) => [getKey(item), item]));
  for (const nextItem of next) {
    const currentItem = currentMap.get(getKey(nextItem));
    if (!currentItem || !compare(currentItem, nextItem)) return false;
  }

  return true;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
