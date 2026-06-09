import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { DashboardHeader } from '../components/dashboard-header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CreditCard, ArrowUpRight, Loader2, XCircle } from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../context/user-context';

export default function BillingUser() {
  const { user } = useUser();
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (!user?.accessToken) return;
    api.getBillingStatus(user.accessToken)
      .then((data: any) => setBilling(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.accessToken]);

  const handleCancel = async () => {
    if (!user?.accessToken) return;
    setCancelling(true);
    try {
      await api.cancelSubscription(user.accessToken);
      setBilling((prev: any) => ({ ...prev, status: 'cancelled' }));
      setShowCancelConfirm(false);
    } catch {}
    finally { setCancelling(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Billing</h1>
          <p className="text-muted-foreground">Manage your subscription.</p>
        </div>

        {/* Current Plan */}
        <Card className="border-border mb-6">
          <CardHeader className="border-b border-border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-card-foreground">Subscription</h2>
              </div>
              <Badge className={billing?.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-600'}>
                {billing?.status || 'No subscription'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {billing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Plan</div>
                    <div className="text-lg font-bold text-foreground capitalize">{billing.plan || billing.billing_cycle || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Billing Cycle</div>
                    <div className="text-lg font-bold text-foreground capitalize">{billing.billing_cycle || 'N/A'}</div>
                  </div>
                  {billing.next_billing_date && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Next Billing</div>
                      <div className="text-lg font-bold text-foreground">{new Date(billing.next_billing_date).toLocaleDateString()}</div>
                    </div>
                  )}
                  {billing.amount && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Amount</div>
                      <div className="text-lg font-bold text-foreground">${billing.amount}</div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <Link to="/pricing">
                    <Button variant="outline" size="sm">
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Change Plan
                    </Button>
                  </Link>
                  {billing.status === 'active' && (
                    <>
                      {!showCancelConfirm ? (
                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setShowCancelConfirm(true)}>
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel Subscription
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button variant="destructive" size="sm" onClick={handleCancel} disabled={cancelling}>
                            {cancelling ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                            Yes, Cancel
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setShowCancelConfirm(false)}>
                            No
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No active subscription</p>
                <Link to="/pricing">
                  <Button>View Plans</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
