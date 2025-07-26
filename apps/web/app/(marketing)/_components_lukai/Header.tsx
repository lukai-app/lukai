import { Button } from '@/components/ui/button';
import { MessageCircle, Menu } from 'lucide-react';
import { LoginOrGoButton } from '../_components_v2/login-or-go-button';
import { getWhatsappBotLinkWithMessage } from '@/lib/constants/chat';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 bg-lukai-primary rounded-md flex items-center justify-center">
            <img
              src="/logos/logo-white.svg"
              alt="LukAI Logo"
              className="w-8 h-8"
            />
          </div>
          <span className="text-2xl font-semibold text-lukai-primary">
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
            href="https://github.com/lukai-app/lukai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-lukai-primary transition-smooth text-sm font-medium"
          >
            GitHub
          </a>
        </nav>

        <div className="flex items-center space-x-3">
          <a
            href={getWhatsappBotLinkWithMessage('hola!! soy nuevo en la app')}
            target="_blank"
            className="hidden md:block"
          >
            <Button className="bg-white text-sm text-black hover:bg-white/90">
              Start for free
            </Button>
          </a>
          <LoginOrGoButton />
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
