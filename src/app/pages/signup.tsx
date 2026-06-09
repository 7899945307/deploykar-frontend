import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Header } from '../components/header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { User, Building2, ArrowLeft, Loader2 } from 'lucide-react';
import { Github, GitBranch } from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../context/user-context';

type AccountType = 'individual' | 'organization' | null;

export default function Signup() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [formData, setFormData] = useState({
    name: '',
    organizationName: '',
    slug: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOAuthSignup = (provider: string) => {
    // OAuth signup - to be implemented with provider SDKs
    console.log(`OAuth signup with ${provider} as ${accountType}`);
    navigate('/dashboard/lead');
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (accountType === 'individual') {
        const res = await api.registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          plan: 'INDIVIDUAL',
        });
        // Try to login immediately to get token
        let accessToken: string | undefined;
        try {
          const loginRes = await api.login({ email: formData.email, password: formData.password });
          accessToken = loginRes.access_token;
        } catch { /* email may need verification first */ }
        setUser({ name: res.name, email: res.email, id: res.id, plan: res.plan, accessToken });
      } else {
        const res = await api.registerTeam({
          team_name: formData.organizationName,
          owner_name: formData.name,
          owner_email: formData.email,
          owner_password: formData.password,
        });
        // Try to login immediately to get token
        let accessToken: string | undefined;
        try {
          const loginRes = await api.login({ email: formData.email, password: formData.password });
          accessToken = loginRes.access_token;
        } catch { /* email may need verification first */ }
        setUser({ name: formData.name, email: res.owner_email, id: res.owner_user_id, plan: 'TEAM', organizationName: formData.organizationName, slug: res.slug, teamId: res.team_id, accessToken });
      }
      navigate('/verify-pending');
    } catch (err: unknown) {
      const apiErr = err as { detail?: { msg: string }[] | string };
      if (apiErr.detail) {
        if (Array.isArray(apiErr.detail)) {
          setError(apiErr.detail.map(d => d.msg).join(', '));
        } else {
          setError(String(apiErr.detail));
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const oauthProviders = [
    {
      name: 'Google',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      )
    },
    {
      name: 'GitHub',
      icon: <Github className="w-5 h-5" />
    },
    {
      name: 'GitLab',
      icon: <GitBranch className="w-5 h-5" />
    },
    {
      name: 'Microsoft',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
        </svg>
      )
    },
    {
      name: 'Bitbucket',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 00.77-.646l3.27-20.03a.768.768 0 00-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z"/>
        </svg>
      )
    },
  ];

  // Step 1: Account Type Selection
  if (!accountType) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <div className="mx-auto max-w-md px-6 py-20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
            <p className="text-muted-foreground">Choose your account type</p>
          </div>

          <div className="space-y-4">
            <Card
              className="border-border bg-card hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => setAccountType('individual')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-card-foreground mb-1">
                      Individual Account
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      For personal projects and solo developers
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="border-border bg-card hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => setAccountType('organization')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-card-foreground mb-1">
                      Organization Account
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      For teams and companies with multiple members
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Signup Form
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-md px-6 py-20">
        <Button
          variant="ghost"
          onClick={() => setAccountType(null)}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {accountType === 'individual' ? 'Individual Account' : 'Organization Account'}
          </h1>
          <p className="text-muted-foreground">
            {accountType === 'individual'
              ? 'Create your personal account'
              : 'Create an account for your team'}
          </p>
        </div>

        <Card className="border-border">
          <CardHeader className="border-b border-border p-6">
            <h2 className="text-lg font-semibold text-card-foreground">
              Get Started
            </h2>
          </CardHeader>
          <CardContent className="p-6">
            {/* OAuth Buttons */}
            <div className="space-y-2 mb-6">
              {oauthProviders.map((provider) => (
                <Button
                  key={provider.name}
                  onClick={() => handleOAuthSignup(provider.name)}
                  className="w-full"
                  variant="outline"
                >
                  {provider.icon}
                  Continue with {provider.name}
                </Button>
              ))}
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              {accountType === 'individual' && (
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              )}

              {accountType === 'organization' && (
                <>
                  <div>
                    <Label htmlFor="organizationName">Organization Name</Label>
                    <Input
                      id="organizationName"
                      type="text"
                      placeholder="Acme Inc."
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Your Name (Owner)</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create {accountType === 'individual' ? 'Individual' : 'Organization'} Account
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
