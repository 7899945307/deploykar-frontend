import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Moon, Sun, LogOut, User, Mail, Shield, Calendar, Building2, Link2 } from 'lucide-react';
import { useTheme } from './theme-provider';
import { useUser } from '../context/user-context';
import { Button } from './ui/button';

export function DashboardHeader() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold text-foreground">
            Deploy<span className="text-primary">Kar</span>
          </Link>

          <div className="flex items-center gap-8">
            <Link to="/" className="text-sm text-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/" className="text-sm text-foreground hover:text-primary transition-colors">
              Product
            </Link>
            <Link to="/pricing" className="text-sm text-foreground hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link to="/billing" className="text-sm text-foreground hover:text-primary transition-colors">
              Billing
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-foreground" />
              )}
            </button>

            {/* Profile Section */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">{user?.name || 'Guest'}</div>
                  <div className="text-xs text-muted-foreground">{user?.email || ''}</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">{initials}</span>
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfile && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-border bg-card shadow-lg z-50">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">{initials}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{user?.name || 'Guest'}</div>
                        <div className="text-xs text-muted-foreground">{user?.email || ''}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Name</div>
                        <div>{user?.name || '-'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Email</div>
                        <div>{user?.email || '-'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Plan</div>
                        <div className="capitalize">{user?.plan?.toLowerCase() || 'Free'}</div>
                      </div>
                    </div>
                    {user?.organizationName && (
                      <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Organization</div>
                          <div>{user.organizationName}</div>
                        </div>
                      </div>
                    )}
                    {user?.slug && (
                      <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground">
                        <Link2 className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Slug</div>
                          <div className="font-mono text-xs">{user.slug}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">User ID</div>
                        <div className="text-xs font-mono">{user?.id || '-'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border-t border-border">
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full gap-2"
                      size="sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
