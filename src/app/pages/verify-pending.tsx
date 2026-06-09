import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Header } from '../components/header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Mail, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../context/user-context';

export default function VerifyPending() {
  const { user } = useUser();
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!user?.email || cooldown > 0) return;
    setResending(true);
    try {
      await api.resendVerification(user.email);
      setCooldown(30);
    } catch {
      // silently fail
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-md px-6 py-20">
        <Card className="border-border">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              Verify Your Email
            </h1>
            <p className="text-muted-foreground mb-6">
              We've sent a verification link to{' '}
              <span className="font-medium text-foreground">{user?.email || 'your email'}</span>.
              Please check your inbox and click the link to activate your account.
            </p>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleResend}
                disabled={resending || cooldown > 0}
              >
                <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}
              </Button>

              <Link to="/login" className="block">
                <Button className="w-full">
                  I've Verified — Go to Login
                </Button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
