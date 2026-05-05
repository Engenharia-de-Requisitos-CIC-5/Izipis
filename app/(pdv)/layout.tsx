'use client';

import React from 'react';

export default function PDVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="h-screen overflow-hidden">
        {children}
      </main>
    </div>
  );
}
