import { Link } from 'react-router';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';
import { Button } from './ui/button';

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-foreground tracking-tight">
            Deploy<span className="text-primary">Kar</span>
          </Link>
          
          <div className="flex items-center gap-8">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Product
            </Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Sun className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            <Link to="/get-started">
              <Button size="sm" className="h-9 px-5">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
