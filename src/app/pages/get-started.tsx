import { Link, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react';

export default function GetStarted() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Get Started
          </h1>
          <p className="text-muted-foreground">
            Choose how you'd like to continue
          </p>
        </div>

        <div className="space-y-6">
          {/* Sign In Section */}
          <div className="space-y-3">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Already have an account?
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Sign in to access your dashboard
              </p>
            </div>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => navigate('/login')}
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </Button>
          </div>

          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-3 text-sm text-muted-foreground">
                or
              </span>
            </div>
          </div>

          {/* Sign Up Section */}
          <div className="space-y-3">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground mb-1">
                New to Deploy<span className="text-primary">Kar</span>?
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Create an account to start deploying
              </p>
            </div>
            <Button
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate('/signup')}
            >
              <UserPlus className="w-5 h-5" />
              Create Account
            </Button>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Button>
        </div>
      </div>
    </div>
  );
}
