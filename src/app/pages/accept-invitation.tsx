import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Header } from '../components/header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2, UserPlus } from 'lucide-react';
import { api } from '../services/api';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || new URLSearchParams(window.location.search).get('token');

  // Decode token to get email and role
  const tokenPayload = token ? (() => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')));
    } catch { return null; }
  })() : null;

  const memberEmail = tokenPayload?.email || '';
  const memberRole = tokenPayload?.role || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid invitation link. No token found.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const name = memberEmail.split('@')[0];
      await api.acceptInvitation({ token, name, password });
      setSuccess(true);
    } catch (err: unknown) {
      const apiErr = err as { detail?: { msg: string }[] | string; message?: string };
      if (apiErr.message) {
        setError(apiErr.message);
      } else if (apiErr.detail) {
        if (Array.isArray(apiErr.detail)) {
          setError(apiErr.detail.map(d => d.msg).join(', '));
        } else {
          setError(String(apiErr.detail));
        }
      } else {
        setError('Failed to accept invitation. The link may have expired.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-md px-6 py-20">
          <Card className="border-border">
            <CardContent className="p-8 text-center">
              <h1 className="text-xl font-bold text-foreground mb-2">Invalid Link</h1>
              <p className="text-muted-foreground">This invitation link is invalid or missing a token.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-md px-6 py-20">
          <Card className="border-border">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-xl font-bold text-foreground mb-2">You're In!</h1>
              <p className="text-muted-foreground mb-6">
                Your account has been created and you've been added to the team.
              </p>
              <Button className="w-full" onClick={() => navigate('/login')}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-md px-6 py-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Accept Invitation</h1>
          <p className="text-muted-foreground">Set your password to join the team</p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={memberEmail}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div>
                <Label>Role</Label>
                <Input
                  type="text"
                  value={memberRole}
                  disabled
                  className="bg-muted capitalize"
                />
              </div>

              <div>
                <Label htmlFor="password">Set Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Join Team
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
