import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Header } from '../components/header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found.');
      return;
    }

    api.verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      })
      .catch(() => {
        setStatus('error');
        setMessage('Verification failed. The link may have expired.');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-md px-6 py-20">
        <Card className="border-border">
          <CardContent className="p-8 text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <h1 className="text-xl font-bold text-foreground">Verifying your email...</h1>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h1 className="text-xl font-bold text-foreground mb-2">Email Verified!</h1>
                <p className="text-muted-foreground mb-6">{message}</p>
                <Link to="/login">
                  <Button className="w-full">Continue to Login</Button>
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
                <h1 className="text-xl font-bold text-foreground mb-2">Verification Failed</h1>
                <p className="text-muted-foreground mb-6">{message}</p>
                <Link to="/signup">
                  <Button variant="outline" className="w-full">Back to Signup</Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
