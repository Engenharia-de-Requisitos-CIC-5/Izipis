'use client';

import { useEffect } from 'react';

export default function DevSeed() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Dynamically import services so this runs only in the browser
    (async () => {
      try {
        const prod = await import('@/services/products');
        const sales = await import('@/services/sales');
        // calling getters will seed localStorage if missing
        await prod.getProducts();
        await sales.getSales();
        // also users/auth seeding if available
        try {
          const auth = await import('@/services/auth');
          if (auth && auth.getUsers) await auth.getUsers();
        } catch (_) {}
      } catch (e) {
        // ignore in dev seeding
        // eslint-disable-next-line no-console
        console.warn('DevSeed: failed to seed mocks', e);
      }
    })();
  }, []);

  return null;
}
