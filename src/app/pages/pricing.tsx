import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Check, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../context/user-context';

type UserType = 'individual' | 'organization';
type BillingPeriod = 'monthly' | '6months' | 'yearly';

export default function Pricing() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<UserType>('individual');
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [backendPlans, setBackendPlans] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Fetch pricing from backend
  useEffect(() => {
    api.getPricing()
      .then((data: any) => {
        setBackendPlans(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSelectPlan = async (planName: string) => {
    if (!user?.accessToken) {
      navigate('/signup');
      return;
    }
    setSelectedPlan(planName);
    try {
      await api.subscribe(user.accessToken, billingPeriod);
      navigate('/billing');
    } catch {
      // If subscribe fails, still show selected
    }
  };

  const individualPlans = [
    {
      name: 'Starter',
      price: { monthly: 0, '6months': 0, yearly: 0 },
      features: [
        '3 projects',
        '100 GB bandwidth',
        '100 build minutes',
        'Community support',
        'Automatic SSL',
        'Basic monitoring',
      ],
    },
    {
      name: 'Pro',
      price: { monthly: 19, '6months': 95, yearly: 180 },
      features: [
        'Unlimited projects',
        '1 TB bandwidth',
        '1,000 build minutes',
        'Priority support',
        'Automatic SSL',
        'Advanced monitoring',
        'Custom domains',
        'Team collaboration (5 members)',
      ],
    },
    {
      name: 'Enterprise',
      price: { monthly: 99, '6months': 495, yearly: 950 },
      features: [
        'Unlimited everything',
        'Unlimited bandwidth',
        'Unlimited build minutes',
        '24/7 dedicated support',
        'Automatic SSL',
        'Real-time analytics',
        'Custom domains',
        'Unlimited team members',
        'SLA guarantee',
        'Advanced security',
      ],
    },
  ];

  const organizationPlans = [
    {
      name: 'Team',
      price: { monthly: 49, '6months': 245, yearly: 470 },
      features: [
        '20 projects',
        '2 TB bandwidth',
        '2,000 build minutes',
        'Priority support',
        'Automatic SSL',
        'Advanced monitoring',
        'Custom domains',
        'Team collaboration (15 members)',
        'Role-based access control',
      ],
    },
    {
      name: 'Business',
      price: { monthly: 149, '6months': 745, yearly: 1430 },
      features: [
        'Unlimited projects',
        '10 TB bandwidth',
        '10,000 build minutes',
        '24/7 support',
        'Automatic SSL',
        'Real-time analytics',
        'Custom domains',
        'Team collaboration (50 members)',
        'Advanced RBAC',
        'Audit logs',
        'SSO integration',
      ],
    },
    {
      name: 'Enterprise',
      price: { monthly: 499, '6months': 2495, yearly: 4790 },
      features: [
        'Unlimited everything',
        'Unlimited bandwidth',
        'Unlimited build minutes',
        'Dedicated account manager',
        'Automatic SSL',
        'Custom analytics',
        'Custom domains',
        'Unlimited team members',
        'Enterprise RBAC',
        'Advanced audit logs',
        'Custom SSO',
        'SLA guarantee',
        'On-premise option',
      ],
    },
  ];

  const plans = userType === 'individual' ? individualPlans : organizationPlans;

  const getPeriodLabel = (period: BillingPeriod) => {
    if (period === 'monthly') return '/mo';
    if (period === '6months') return '/6 months';
    return '/year';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Simple, Transparent Pricing
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose the plan that fits your needs
          </p>
        </div>

        {/* User Type Toggle */}
        <div className="flex justify-center mb-6">
          <Tabs value={userType} onValueChange={(v) => setUserType(v as UserType)}>
            <TabsList className="bg-muted">
              <TabsTrigger value="individual">Individual</TabsTrigger>
              <TabsTrigger value="organization">Organization</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-12">
          <Tabs value={billingPeriod} onValueChange={(v) => setBillingPeriod(v as BillingPeriod)}>
            <TabsList className="bg-muted">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="6months">6 Months</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`border-border ${index === 1 ? 'ring-2 ring-primary' : ''}`}
            >
              <CardHeader className="border-b border-border p-6">
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    ${plan.price[billingPeriod]}
                  </span>
                  <span className="text-muted-foreground">
                    {getPeriodLabel(billingPeriod)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-card-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full"
                  variant={index === 1 ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan.name)}
                >
                  {selectedPlan === plan.name ? '✓ Selected' : (user?.accessToken ? 'Select Plan' : 'Get Started')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
