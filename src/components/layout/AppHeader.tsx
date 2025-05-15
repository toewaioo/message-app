"use client";
import Link from 'next/link';
import { MessageSquareText, Zap } from 'lucide-react'; // Added Zap for a bit of flair

const AppHeader = () => {
  return (
    <header className="py-4 border-b border-border/50 sticky top-0 z-50 bg-gradient-to-b from-background via-background/90 to-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-semibold text-primary hover:text-primary/80 transition-colors duration-300 group">
          <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <MessageSquareText size={28} className="text-primary transition-transform group-hover:scale-110" />
          </div>
          <span className="tracking-tight">WhisperLink</span>
          <Zap size={16} className="text-primary/70 group-hover:text-primary transition-opacity duration-300 opacity-0 group-hover:opacity-100 -ml-1" />
        </Link>
        {/* Add navigation or user profile icon here if needed in the future */}
      </div>
    </header>
  );
};

export default AppHeader;
