"use client";
import Link from 'next/link';
import { MessageSquareText } from 'lucide-react';

const AppHeader = () => {
  return (
    <header className="py-4 border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary hover:text-primary/90 transition-colors">
          <MessageSquareText size={28} />
          <span>WhisperLink</span>
        </Link>
        {/* Add navigation or user profile icon here if needed in the future */}
      </div>
    </header>
  );
};

export default AppHeader;
