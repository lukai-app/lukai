import { Button } from '@/components/ui/button';
import { MessageCircle, Menu } from 'lucide-react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 bg-lukai-primary rounded-md flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-semibold text-lukai-primary">
            LukAI
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="#features"
            className="text-muted-foreground hover:text-lukai-primary transition-smooth text-sm font-medium"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-muted-foreground hover:text-lukai-primary transition-smooth text-sm font-medium"
          >
            Pricing
          </a>
          <a
            href="#about"
            className="text-muted-foreground hover:text-lukai-primary transition-smooth text-sm font-medium"
          >
            About
          </a>
          <a
            href="https://github.com/lukai/lukai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-lukai-primary transition-smooth text-sm font-medium"
          >
            GitHub
          </a>
        </nav>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" className="hidden md:inline-flex text-sm">
            Sign In
          </Button>
          <Button variant="default" size="sm">
            Get Started
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
