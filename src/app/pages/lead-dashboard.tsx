import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { DashboardHeader } from '../components/dashboard-header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Input } from '../components/ui/input';
import { Plus, ExternalLink, Clock, Users, Activity, TrendingUp, ChevronDown, ChevronRight, X, FolderOpen, GitBranch, Search, Loader2, Layers } from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../context/user-context';

export default function LeadDashboard() {
  const { user, setUser, refreshAccessToken } = useUser();
  const navigate = useNavigate();
  const [userName, setUserName] = useState(user?.name || '');
  const [orgName, setOrgName] = useState(user?.organizationName || '');
  const [teamSlug, setTeamSlug] = useState(user?.slug || '');

  // Fetch profile on mount — get real user data from backend
  useEffect(() => {
    if (!user?.accessToken) {
      navigate('/login');
      return;
    }

    const fetchProfile = async (token: string) => {
      try {
        const data = await api.getProfile(token) as any;
        const role = data?.team?.role;
        if (role && role !== 'OWNER' && role !== 'ADMIN') {
          navigate('/dashboard/member');
          return;
        }
        setUserName(data?.user?.name || '');
        setOrgName(data?.team?.name || '');
        setTeamSlug(data?.team?.slug || '');
        setUser({
          ...user,
          name: data?.user?.name || user.name,
          email: data?.user?.email || user.email,
          organizationName: data?.team?.name,
          slug: data?.team?.slug,
          role: role,
          accessToken: token,
        });
      } catch (err: any) {
        // If 401, try refresh
        if (err?.code === 'ERR_401_04' || err?.code === 'ERR_401_03') {
          const newToken = await refreshAccessToken();
          if (newToken) {
            fetchProfile(newToken);
          } else {
            navigate('/login');
          }
        }
      }
    };

    fetchProfile(user.accessToken);
  }, []);

  const userInfo = {
    name: userName || user?.name || 'User',
    organization: orgName || user?.organizationName || 'My Org',
    plan: user?.plan || 'Pro',
    userId: user?.id || '',
    orgId: user?.teamId || '',
    email: user?.email || '',
  };

  const [selectedProject, setSelectedProject] = useState(0);
  const [isTeamExpanded, setIsTeamExpanded] = useState(false);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);
  const [isReposExpanded, setIsReposExpanded] = useState(false);
  const [isTeamsExpanded, setIsTeamsExpanded] = useState(false);
  const [teams, setTeams] = useState<{ name: string; slug: string; members?: any[] }[]>([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [createTeamLoading, setCreateTeamLoading] = useState(false);
  const [createTeamError, setCreateTeamError] = useState<string | null>(null);
  const [connectedProvider, setConnectedProvider] = useState<'github' | 'gitlab' | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [repoSearch, setRepoSearch] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('DEVELOPER');
  const [teamMembers, setTeamMembers] = useState<{name: string; memberId: string; email: string; originalEmail?: string; role: string; status: string}[]>([]);

  // Fetch team members from backend on mount
  useEffect(() => {
    if (user?.accessToken) {
      api.getDashboard(user.accessToken).then((data: any) => {
        const allMembers: any[] = [];

        // Add accepted members (from team_members table)
        if (data?.members) {
          data.members.forEach((m: any) => {
            allMembers.push({
              name: m.name || m.email.split('@')[0],
              memberId: m.user_id || m.email,
              email: m.email,
              role: m.role,
              status: 'active',
            });
          });
        }

        // Add pending invitations (invited but not yet accepted)
        if (data?.pending_invitations) {
          data.pending_invitations.forEach((inv: any) => {
            allMembers.push({
              name: inv.email.split('@')[0],
              memberId: inv.email,
              email: inv.email,
              role: inv.role || 'DEVELOPER',
              status: 'pending',
            });
          });
        }

        setTeamMembers(allMembers);
      }).catch(() => {});

      // Fetch teams
      api.listTeams(user.accessToken).then((data: any) => {
        if (Array.isArray(data)) {
          setTeams(data.map((t: any) => ({ name: t.name || t.team_name, slug: t.slug, members: t.members || [] })));
        } else if (data?.teams) {
          setTeams(data.teams.map((t: any) => ({ name: t.name || t.team_name, slug: t.slug, members: t.members || [] })));
        }
      }).catch(() => {});
    }
  }, [user?.accessToken]);

  const projects = [
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
    {
      name: 'Admin Dashboard',
      framework: 'Next.js',
      status: 'active',
      lastDeployed: '5 hours ago',
      url: 'https://admin.acme.com',
      deployments: 34,
      uptime: '100%',
    },
  ];

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'bg-green-500/10 text-green-600 dark:text-green-400';
    if (status === 'building') return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
    if (status === 'pending') return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  };

  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [teamMode, setTeamMode] = useState<'normal' | 'edit' | 'delete'>('normal');
  const [memberSearch, setMemberSearch] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [originalMembers, setOriginalMembers] = useState<typeof teamMembers>([]);

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;
    setInviteLoading(true);
    setInviteError(null);

    try {
      const token = user?.accessToken;
      if (!token) {
        setInviteError('Not authenticated. Please log in again.');
        setInviteLoading(false);
        return;
      }
      await api.inviteTeamMembers(
        { invitations: [{ email: newMemberEmail, role: newMemberRole }] },
        token
      );

      const updatedMembers = [
        ...teamMembers,
        {
          name: newMemberName || newMemberEmail.split('@')[0],
          memberId: `mem-${Date.now()}`,
          email: newMemberEmail,
          role: newMemberRole,
          status: 'pending',
        },
      ];
      setTeamMembers(updatedMembers);
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberRole('DEVELOPER');
      setShowConfirm(false);
      setShowAddMember(false);
    } catch (err: unknown) {
      const apiErr = err as { detail?: { msg: string }[] | string };
      if (apiErr.detail) {
        if (Array.isArray(apiErr.detail)) {
          setInviteError(apiErr.detail.map(d => d.msg).join(', '));
        } else {
          setInviteError(String(apiErr.detail));
        }
      } else {
        setInviteError('Failed to invite member.');
      }
    } finally {
      setInviteLoading(false);
    }
  };

  const mockRepos: Record<string, { name: string; fullName: string; branches: string[]; isPrivate: boolean }[]> = {
    github: [
      { name: 'marketing-site', fullName: 'acme-corp/marketing-site', branches: ['main', 'develop', 'feature/redesign', 'hotfix/nav'], isPrivate: false },
      { name: 'api-server', fullName: 'acme-corp/api-server', branches: ['main', 'develop', 'staging', 'feature/auth-v2'], isPrivate: true },
      { name: 'mobile-app', fullName: 'acme-corp/mobile-app', branches: ['main', 'develop', 'release/1.2.0'], isPrivate: true },
      { name: 'design-system', fullName: 'acme-corp/design-system', branches: ['main', 'develop', 'feature/tokens'], isPrivate: false },
      { name: 'infra-terraform', fullName: 'acme-corp/infra-terraform', branches: ['main', 'staging', 'production'], isPrivate: true },
    ],
    gitlab: [
      { name: 'backend-services', fullName: 'acme/backend-services', branches: ['main', 'develop', 'feature/microservices'], isPrivate: true },
      { name: 'frontend-monorepo', fullName: 'acme/frontend-monorepo', branches: ['main', 'develop', 'feature/next-migration'], isPrivate: false },
      { name: 'ci-pipelines', fullName: 'acme/ci-pipelines', branches: ['main', 'experiment/docker'], isPrivate: true },
      { name: 'docs-site', fullName: 'acme/docs-site', branches: ['main', 'develop'], isPrivate: false },
    ],
  };

  const filteredRepos = connectedProvider
    ? mockRepos[connectedProvider].filter(repo =>
        repo.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
        repo.fullName.toLowerCase().includes(repoSearch.toLowerCase())
      )
    : [];

  const selectedRepoData = connectedProvider
    ? mockRepos[connectedProvider].find(r => r.fullName === selectedRepo)
    : null;

  const activeProject = projects[selectedProject];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {userInfo.name}
          </h1>
          <p className="text-muted-foreground">
            Organization: <span className="font-semibold text-foreground">{userInfo.organization}</span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Projects & Team */}
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-4">
            <Card className="border-border">
              <CardHeader className="border-b border-border p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    {isProjectsExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    <FolderOpen className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-semibold text-card-foreground">Projects</h2>
                    <Badge variant="outline" className="text-xs ml-1">{projects.length}</Badge>
                  </button>
                  <Link to="/new-project">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              {isProjectsExpanded && (
                <ScrollArea className="max-h-[300px]">
                  <div className="p-2">
                    {projects.map((project, index) => (
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
              )}
            </Card>

            {/* Team Section - Collapsible */}
            <Card className="border-border">
              <CardHeader className="border-b border-border p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setIsTeamExpanded(!isTeamExpanded)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    {isTeamExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    <Users className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-semibold text-card-foreground">Members</h2>
                    <Badge variant="outline" className="text-xs ml-1">{teamMembers.length}</Badge>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors ${
                        showAddMember ? 'bg-primary text-primary-foreground' : 'text-primary hover:bg-muted'
                      }`}
                      onClick={() => { setIsTeamExpanded(true); setShowAddMember(!showAddMember); }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    {/* 3-dot menu */}
                    <div className="relative">
                      <button
                        className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors ${
                          openMenuId === 'team-header' ? 'bg-primary text-primary-foreground' : 'text-primary hover:bg-muted'
                        }`}
                        onClick={() => setOpenMenuId(openMenuId === 'team-header' ? null : 'team-header')}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                      </button>
                      {openMenuId === 'team-header' && (
                        <div className="absolute right-0 top-9 w-36 rounded-lg border border-border bg-card shadow-xl z-50 py-1.5">
                          <button
                            className="w-full text-left px-4 py-2 text-xs hover:bg-muted transition-colors flex items-center gap-2.5 text-foreground"
                            onClick={() => { setTeamMode('edit'); setOpenMenuId(null); setIsTeamExpanded(true); 
                              // Store original state for tracking changes
                              setOriginalMembers(JSON.parse(JSON.stringify(teamMembers)));
                              setTeamMembers(prev => prev.map(m => ({ ...m, originalEmail: m.email })));
                            }}
                          >
                            <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Edit Members
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-xs hover:bg-destructive/10 transition-colors flex items-center gap-2.5 text-destructive"
                            onClick={() => { setTeamMode('delete'); setOpenMenuId(null); setIsTeamExpanded(true); setSelectedMembers([]); }}
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                            Delete Members
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              {isTeamExpanded && (
                <>
                  {/* Mode action bar - outside scroll area */}
                  {teamMode === 'delete' && (
                    <div className="px-4 py-2 border-b border-destructive/20 bg-destructive/5 space-y-2">
                      {!showDeleteConfirm ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
                              checked={selectedMembers.length === teamMembers.filter(m => m.role !== 'OWNER').length && selectedMembers.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMembers(teamMembers.filter(m => m.role !== 'OWNER').map(m => m.memberId));
                                } else {
                                  setSelectedMembers([]);
                                }
                              }}
                            />
                            <span className="text-[10px] text-destructive font-medium">
                              {selectedMembers.length > 0 ? `${selectedMembers.length} selected` : 'Select All'}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {selectedMembers.length > 0 && (
                              <Button size="sm" variant="destructive" className="h-6 text-[10px] px-2" onClick={() => setShowDeleteConfirm(true)}>
                                Delete
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => { setTeamMode('normal'); setSelectedMembers([]); }}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 rounded-md border border-destructive/30 bg-destructive/10 space-y-2">
                          <p className="text-[11px] text-destructive font-medium">
                            Remove {selectedMembers.length} member(s) from the team?
                          </p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="destructive" className="flex-1 h-7 text-xs" onClick={async () => {
                              const token = user?.accessToken;
                              if (!token) return;
                              for (const memberId of selectedMembers) {
                                const member = teamMembers.find(m => m.memberId === memberId);
                                if (member) {
                                  try {
                                    if (member.status === 'pending') {
                                      await api.revokeInvitation(token, member.email);
                                    } else {
                                      await api.removeMember(token, teamSlug, member.email);
                                    }
                                  } catch {}
                                }
                              }
                              setTeamMembers(teamMembers.filter(m => !selectedMembers.includes(m.memberId)));
                              setSelectedMembers([]);
                              setShowDeleteConfirm(false);
                              setTeamMode('normal');
                            }}>
                              Yes, Remove
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => setShowDeleteConfirm(false)}>
                              No, Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {teamMode === 'edit' && (
                    <div className="px-4 py-2 border-b border-primary/20 bg-primary/5 space-y-2">
                      {!showEditConfirm ? (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-primary font-medium">Click a role to change it</span>
                          <div className="flex gap-1">
                            <Button size="sm" className="h-6 text-[10px] px-2" onClick={() => setShowEditConfirm(true)}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => setTeamMode('normal')}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 rounded-md border border-primary/30 bg-primary/10 space-y-2">
                          <p className="text-[11px] text-foreground font-medium">
                            Save role changes?
                          </p>
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1 h-7 text-xs" onClick={async () => {
                              const token = user?.accessToken;
                              if (!token) return;
                              for (const member of teamMembers) {
                                if (member.role !== 'OWNER') {
                                  const orig = originalMembers.find(m => m.memberId === member.memberId);
                                  if (!orig) continue;
                                  const changed = orig.name !== member.name || orig.role !== member.role || orig.email !== member.email;
                                  if (!changed) continue;
                                  try {
                                    if (member.status === 'pending') {
                                      const origEmail = member.originalEmail || member.email;
                                      await api.editInvitation(token, {
                                        email: origEmail,
                                        role: member.role,
                                        new_email: member.email !== origEmail ? member.email : undefined,
                                      });
                                    } else {
                                      await api.updateMember(token, { team_slug: teamSlug, email: member.email, name: member.name, role: member.role });
                                    }
                                  } catch {}
                                }
                              }
                              setShowEditConfirm(false);
                              setTeamMode('normal');
                            }}>
                              Yes, Save
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => setShowEditConfirm(false)}>
                              No, Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Search bar */}
                  {teamMembers.length > 3 && (
                    <div className="px-4 pt-3 pb-0">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                        <Input
                          placeholder="Search by name or email..."
                          value={memberSearch}
                          onChange={(e) => setMemberSearch(e.target.value)}
                          className="h-7 text-xs pl-7"
                        />
                      </div>
                    </div>
                  )}

                  {/* Add Member Form - outside scroll */}
                  {showAddMember && (
                    <div className="px-4 py-3 border-b border-border">
                      <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-foreground">Add Member</span>
                          <button onClick={() => setShowAddMember(false)}>
                            <X className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                        <Input
                          placeholder="Name"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          className="h-8 text-xs"
                        />
                        <Input
                          placeholder="Email"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          className="h-8 text-xs"
                        />
                        <select
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value)}
                          className="w-full h-8 text-xs rounded-md border border-border bg-background px-2"
                        >
                          <option value="DEVELOPER">Developer</option>
                          <option value="ADMIN">Admin</option>
                          <option value="VIEWER">Viewer</option>
                        </select>

                        {!showConfirm ? (
                          <Button size="sm" className="w-full h-8 text-xs" onClick={() => {
                            if (!newMemberEmail.trim()) return;
                            setShowConfirm(true);
                          }}>
                            Add to Team
                          </Button>
                        ) : (
                          <div className="p-2 rounded-md border border-primary/30 bg-primary/5 space-y-2">
                            <p className="text-[10px] text-foreground">
                              Invite <span className="font-semibold">{newMemberEmail}</span> as <span className="font-semibold">{newMemberRole}</span>?
                            </p>
                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1 h-7 text-xs" onClick={handleAddMember} disabled={inviteLoading}>
                                {inviteLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                                {inviteLoading ? 'Sending...' : 'Confirm'}
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => setShowConfirm(false)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {inviteError && (
                          <p className="text-[10px] text-destructive">{inviteError}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Scrollable member list */}
                  <div className="overflow-hidden max-h-[220px] overflow-y-auto">
                    <div className="p-4 space-y-3">

                    {/* Team Members List */}
                    {teamMembers
                      .filter(m => {
                        if (!memberSearch) return true;
                        const q = memberSearch.toLowerCase();
                        return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
                      })
                      .map((member, index) => (
                      <div key={index} className="p-3 rounded-lg border border-border">
                        <div className="flex items-start gap-2">
                          {teamMode === 'delete' && member.role !== 'OWNER' && (
                            <input
                              type="checkbox"
                              className="mt-1 w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
                              checked={selectedMembers.includes(member.memberId)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMembers([...selectedMembers, member.memberId]);
                                } else {
                                  setSelectedMembers(selectedMembers.filter(id => id !== member.memberId));
                                }
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-sm text-card-foreground">
                              {teamMode === 'edit' && member.role !== 'OWNER' && member.status === 'active' ? (
                                <input
                                  type="text"
                                  value={member.name}
                                  onChange={(e) => setTeamMembers(teamMembers.map((m, i) => i === index ? { ...m, name: e.target.value } : m))}
                                  className="w-full h-6 text-sm rounded border border-border bg-background px-1"
                                  placeholder="Name"
                                />
                              ) : (
                                member.name
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                              {teamMode === 'edit' && member.role !== 'OWNER' && member.status === 'pending' ? (
                                <input
                                  type="email"
                                  value={member.email}
                                  onChange={(e) => setTeamMembers(teamMembers.map((m, i) => i === index ? { ...m, email: e.target.value } : m))}
                                  className="w-full h-6 text-xs rounded border border-border bg-background px-1"
                                  placeholder="Email"
                                />
                              ) : (
                                member.email
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {teamMode === 'edit' && member.role !== 'OWNER' ? (
                                <select
                                  value={member.role}
                                  onChange={(e) => {
                                    setTeamMembers(teamMembers.map((m, i) => i === index ? { ...m, role: e.target.value } : m));
                                  }}
                                  className="h-6 text-xs rounded border border-border bg-background px-1"
                                >
                                  <option value="ADMIN">ADMIN</option>
                                  <option value="DEVELOPER">DEVELOPER</option>
                                  <option value="VIEWER">VIEWER</option>
                                </select>
                              ) : (
                                <Badge variant="outline" className="text-xs py-0">
                                  {member.role}
                                </Badge>
                              )}
                              <Badge className={`text-xs py-0 ${getStatusColor(member.status)}`}>
                                {member.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                </>
              )}
            </Card>

            {/* Teams Section - Collapsible */}
            <Card className="border-border">
              <CardHeader className="border-b border-border p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setIsTeamsExpanded(!isTeamsExpanded)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    {isTeamsExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    <Layers className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-semibold text-card-foreground">Teams</h2>
                    <Badge variant="outline" className="text-xs ml-1">{teams.length}</Badge>
                  </button>
                  <button
                    className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors ${
                      showCreateTeam ? 'bg-primary text-primary-foreground' : 'text-primary hover:bg-muted'
                    }`}
                    onClick={() => { setIsTeamsExpanded(true); setShowCreateTeam(!showCreateTeam); }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              {isTeamsExpanded && (
                <div className="p-4 space-y-3">
                  {/* Create Team Form */}
                  {showCreateTeam && (
                    <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-foreground">Create Team</span>
                        <button onClick={() => setShowCreateTeam(false)}>
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                      <Input
                        placeholder="Team Name"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Button size="sm" className="w-full h-8 text-xs" disabled={createTeamLoading || !newTeamName.trim()} onClick={async () => {
                        setCreateTeamLoading(true);
                        setCreateTeamError(null);
                        try {
                          const token = user?.accessToken;
                          if (!token) return;
                          await api.createTeam(token, newTeamName);
                          setTeams([...teams, { name: newTeamName, slug: newTeamName.toLowerCase().replace(/\s+/g, '-') }]);
                          setNewTeamName('');
                          setShowCreateTeam(false);
                        } catch (err: any) {
                          setCreateTeamError(err?.message || 'Failed to create team');
                        } finally {
                          setCreateTeamLoading(false);
                        }
                      }}>
                        {createTeamLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                        Create Team
                      </Button>
                      {createTeamError && <p className="text-[10px] text-destructive">{createTeamError}</p>}
                    </div>
                  )}

                  {/* Teams List */}
                  {teams.length === 0 && !showCreateTeam && (
                    <p className="text-xs text-muted-foreground text-center py-2">No additional teams yet</p>
                  )}
                  {teams.map((team, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-sm text-card-foreground">{team.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{team.slug}</div>
                        </div>
                        <button
                          className="text-xs text-destructive hover:underline"
                          onClick={async () => {
                            if (confirm(`Delete team "${team.name}"? All members will be removed.`)) {
                              const token = user?.accessToken;
                              if (!token) return;
                              try {
                                await api.deleteTeam(token, team.slug);
                                setTeams(teams.filter((_, idx) => idx !== i));
                              } catch {}
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                      {team.members && team.members.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border space-y-1">
                          {team.members.map((m: any, mi: number) => (
                            <div key={mi} className="flex items-center justify-between text-xs">
                              <span className="text-card-foreground">{m.name || m.email}</span>
                              <Badge variant="outline" className="text-[10px] py-0">{m.role}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                      {(!team.members || team.members.length === 0) && (
                        <p className="text-[10px] text-muted-foreground mt-1">No members yet</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Repositories Section - Collapsible */}
            <Card className="border-border">
              <CardHeader className="border-b border-border p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setIsReposExpanded(!isReposExpanded)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    {isReposExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    <GitBranch className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-semibold text-card-foreground">Repositories</h2>
                    {connectedProvider && (
                      <Badge variant="outline" className="text-xs ml-1">{mockRepos[connectedProvider].length}</Badge>
                    )}
                  </button>
                </div>
              </CardHeader>
              {isReposExpanded && (
                <div className="p-4 space-y-3">
                  {/* Provider Selection */}
                  {!connectedProvider ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground mb-3">Connect your Git provider</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start gap-2 h-9"
                        onClick={() => setConnectedProvider('github')}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                        Connect GitHub
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start gap-2 h-9"
                        onClick={() => setConnectedProvider('gitlab')}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z"/>
                        </svg>
                        Connect GitLab
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Connected indicator */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-xs text-muted-foreground capitalize">{connectedProvider} connected</span>
                        </div>
                        <button
                          onClick={() => { setConnectedProvider(null); setSelectedRepo(null); setSelectedBranch(null); }}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Disconnect
                        </button>
                      </div>

                      {/* Search repos */}
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                        <Input
                          placeholder="Search repositories..."
                          value={repoSearch}
                          onChange={(e) => setRepoSearch(e.target.value)}
                          className="h-8 text-xs pl-7"
                        />
                      </div>

                      {/* Repo list */}
                      <ScrollArea className="max-h-[200px]">
                        <div className="space-y-1">
                          {filteredRepos.map((repo) => (
                            <button
                              key={repo.fullName}
                              onClick={() => { setSelectedRepo(repo.fullName); setSelectedBranch(null); }}
                              className={`w-full text-left p-2 rounded-md transition-colors text-xs ${
                                selectedRepo === repo.fullName
                                  ? 'bg-primary/10 border border-primary/20'
                                  : 'hover:bg-muted border border-transparent'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-card-foreground">{repo.name}</span>
                                {repo.isPrivate && (
                                  <Badge variant="outline" className="text-[10px] py-0 px-1">private</Badge>
                                )}
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">{repo.fullName}</div>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>

                      {/* Branch selector */}
                      {selectedRepoData && (
                        <div className="border-t border-border pt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <GitBranch className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs font-medium text-foreground">Branches</span>
                          </div>
                          <div className="space-y-1">
                            {selectedRepoData.branches.map((branch) => (
                              <button
                                key={branch}
                                onClick={() => setSelectedBranch(branch)}
                                className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors ${
                                  selectedBranch === branch
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'hover:bg-muted text-card-foreground'
                                }`}
                              >
                                {branch}
                                {branch === 'main' && (
                                  <Badge variant="outline" className="text-[10px] py-0 px-1 ml-2">default</Badge>
                                )}
                              </button>
                            ))}
                          </div>
                          {selectedBranch && (
                            <Button size="sm" className="w-full h-8 text-xs mt-2">
                              Clone & Import
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
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

          </div>
        </div>
      </div>
    </div>
  );
}
