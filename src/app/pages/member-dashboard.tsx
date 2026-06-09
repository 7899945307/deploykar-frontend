import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { DashboardHeader } from '../components/dashboard-header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { ExternalLink, Clock, Check, X, Activity, TrendingUp } from 'lucide-react';
import { useUser } from '../context/user-context';
import { api } from '../services/api';

export default function MemberDashboard() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  // Check role on mount — redirect owners/admins to lead dashboard
  useEffect(() => {
    if (!user?.accessToken) {
      navigate('/login');
      return;
    }
    api.getProfile(user.accessToken).then((data: any) => {
      const role = data?.team?.role;
      if (role === 'OWNER' || role === 'ADMIN') {
        navigate('/dashboard/lead');
        return;
      }
      // Update user context with real data from backend
      setUser({
        ...user,
        name: data?.user?.name || user.name,
        email: data?.user?.email || user.email,
        organizationName: data?.team?.name,
        role: role,
      });
    }).catch(() => {});
  }, []);

  const [selectedProject, setSelectedProject] = useState(0);

  const permissions = [
    { label: 'Deploy Access', allowed: true },
    { label: 'View Logs', allowed: true },
    { label: 'Manage Team', allowed: false },
    { label: 'Billing', allowed: false },
  ];

  const assignedProjects = [
    {
      name: 'Marketing Website',
      framework: 'React',
      status: 'active',
      lastDeployed: '2 hours ago',
      url: 'https://marketing.acme.com',
      deployments: 45,
      uptime: '99.9%',
    },
    {
      name: 'API Server',
      framework: 'Node.js',
      status: 'active',
      lastDeployed: '1 day ago',
      url: 'https://api.acme.com',
      deployments: 123,
      uptime: '99.8%',
    },
    {
      name: 'Mobile Backend',
      framework: 'Express',
      status: 'building',
      lastDeployed: '3 days ago',
      url: 'https://mobile-api.acme.com',
      deployments: 78,
      uptime: '99.5%',
    },
  ];

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'bg-green-500/10 text-green-600 dark:text-green-400';
    if (status === 'building') return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
    return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  };

  const activeProject = assignedProjects[selectedProject];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {user?.name || 'Member'}
          </h1>
          <p className="text-muted-foreground">
            Role: <span className="font-semibold text-foreground capitalize">{user?.role?.toLowerCase() || 'Developer'}</span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Assigned Projects List */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <Card className="border-border">
              <CardHeader className="border-b border-border p-4">
                <h2 className="text-sm font-semibold text-card-foreground">Assigned Projects</h2>
              </CardHeader>
              <ScrollArea className="h-[600px]">
                <div className="p-2">
                  {assignedProjects.map((project, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedProject(index)}
                      className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                        selectedProject === index
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted border border-transparent'
                      }`}
                    >
                      <div className="font-medium text-sm text-card-foreground mb-1">
                        {project.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs py-0">
                          {project.framework}
                        </Badge>
                        <Badge className={`text-xs py-0 ${getStatusColor(project.status)}`}>
                          {project.status}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Center - Active Project Status */}
          <div className="flex-1 min-w-0 space-y-6">
            <Card className="border-border">
              <CardHeader className="border-b border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-card-foreground">
                      {activeProject.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">{activeProject.url}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-primary" />
                      <div className="text-sm text-muted-foreground">Status</div>
                    </div>
                    <div className="text-2xl font-bold text-foreground capitalize">
                      {activeProject.status}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <div className="text-sm text-muted-foreground">Uptime</div>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {activeProject.uptime}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <div className="text-sm text-muted-foreground">Last Deploy</div>
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                      {activeProject.lastDeployed}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <ExternalLink className="w-4 h-4 text-primary" />
                      <div className="text-sm text-muted-foreground">Deployments</div>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {activeProject.deployments}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1">Deploy Now</Button>
                  <Button variant="outline" className="flex-1">View Logs</Button>
                </div>
              </CardContent>
            </Card>

            {/* Permissions Section */}
            <Card className="border-border">
              <CardHeader className="border-b border-border p-6">
                <h2 className="text-lg font-semibold text-card-foreground">Your Permissions</h2>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {permissions.map((permission, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <span className="text-sm text-card-foreground">{permission.label}</span>
                      {permission.allowed ? (
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
