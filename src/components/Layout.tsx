import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  categories?: Array<{ name: string; icon: any; color: string }>;
  onGroupAdded?: (group: any) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, categories, onGroupAdded }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header categories={categories || []} onGroupAdded={onGroupAdded} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};