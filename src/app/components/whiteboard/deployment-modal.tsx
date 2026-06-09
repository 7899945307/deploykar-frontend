import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EnvVarEntry, GitHubBranch, GitHubRepo } from '../../lib/types';
import { githubService } from '../../services/github';
import { useDeploymentStore } from '../../lib/store';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';
import { cn } from '../ui/utils';

interface DeploymentSourceModalProps { open: boolean; onOpenChange: (open: boolean) => void; nodeId: string | null; }
type Step = 'github-connect' | 'github-repo' | 'github-branch' | 'env-vars' | 'deploying';

export function DeploymentSourceModal({ open, onOpenChange, nodeId }: DeploymentSourceModalProps) {
  const nodes = useDeploymentStore((s) => s.nodes);
  const addProject = useDeploymentStore((s) => s.addProject);
  const setProjectEnvVars = useDeploymentStore((s) => s.setProjectEnvVars);
  const deployProject = useDeploymentStore((s) => s.deployProject);
  const project = nodeId ? nodes.find((n) => n.id === nodeId)?.data?.project : undefined;
  const framework = project?.framework ?? null;
  const [step, setStep] = useState<Step>('github-connect');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [envVars, setEnvVars] = useState<EnvVarEntry[]>([{ key: '', value: '', is_secret: false }]);
  const [deployError, setDeployError] = useState<string | null>(null);

  const resetState = () => { setStep('github-connect'); setIsConnecting(false); setIsLoadingBranches(false); setRepos([]); setBranches([]); setSearchQuery(''); setSelectedRepo(null); setSelectedBranch(''); setEnvVars([{ key: '', value: '', is_secret: false }]); setDeployError(null); };
  const handleClose = () => { resetState(); onOpenChange(false); };

  const handleGitHubConnect = async () => {
    setIsConnecting(true);
    const popup = window.open('', '_blank', 'width=900,height=700'); const oauthUrl = await githubService.getOAuthUrl(window.location.origin + '/new-project'); if (popup) { popup.location.href = oauthUrl; } else { setIsConnecting(false); return; }
    const startedAt = Date.now();
    const poll = async () => {
      const r = await githubService.getRepos();
      if (r.success && r.data) { setRepos(r.data); setStep('github-repo'); setIsConnecting(false); if (popup && !popup.closed) popup.close(); return; }
      if (popup && popup.closed) { setIsConnecting(false); return; }
      if (Date.now() - startedAt > 120000) { setIsConnecting(false); return; }
      setTimeout(poll, 1500);
    };
    setTimeout(poll, 1500);
  };

  const handleRepoSelect = async (repo: GitHubRepo) => {
    setSelectedRepo(repo); setIsLoadingBranches(true);
    try { const r = await githubService.getBranches(repo.html_url); if (r.success && r.data) { setBranches(r.data); setSelectedBranch(repo.default_branch); } } finally { setIsLoadingBranches(false); }
    setStep('github-branch');
  };

  const handleBranchSelect = (branch: string) => { setSelectedBranch(branch); setStep('env-vars'); };
  const filteredRepos = useMemo(() => { const q = searchQuery.trim().toLowerCase(); if (!q) return repos; return repos.filter((r) => r.name.toLowerCase().includes(q) || r.full_name.toLowerCase().includes(q)); }, [repos, searchQuery]);
  const canDeploy = !!framework && !!nodeId && !!selectedRepo && !!selectedBranch && !isConnecting && !isLoadingBranches;

  const handleDeploy = async () => {
    if (!framework || !nodeId || !selectedRepo || !selectedBranch) return;
    setDeployError(null); setStep('deploying');
    try {
      const existingNode = useDeploymentStore.getState().nodes.find((n) => n.id === nodeId);
      const pos = existingNode?.position ?? { x: 0, y: 0 };
      const realProject = await addProject(framework, pos, { name: selectedRepo.name, github_repo_url: selectedRepo.html_url, github_repo_name: selectedRepo.name, github_branch: selectedBranch });
      useDeploymentStore.getState().setNodes(useDeploymentStore.getState().nodes.filter((n) => n.id !== nodeId));
      const sanitized = envVars.map((v) => ({ key: v.key.trim(), value: v.value, is_secret: !!v.is_secret })).filter((v) => v.key.length > 0 && v.value.length > 0);
      if (sanitized.length) { const ok = await setProjectEnvVars(realProject.id, sanitized); if (!ok) { setDeployError('Failed to save env vars.'); setStep('env-vars'); return; } }
      const deployed = await deployProject(realProject.id);
      if (!deployed) { setDeployError('Failed to start deployment.'); setStep('env-vars'); return; }
      handleClose();
    } catch (e) { setDeployError((e as Error).message); setStep('env-vars'); }
  };

  useEffect(() => { if (!open) resetState(); }, [open]);
  if (!framework || !nodeId) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px] bg-zinc-900/95 border-zinc-700/50 text-white p-0 overflow-hidden backdrop-blur-xl shadow-2xl shadow-black/50 rounded-2xl">
        <div className="p-5 pb-4 border-b border-zinc-800/50">
          <DialogTitle className="text-[15px] font-bold text-white">{step === 'github-connect' ? 'Connect GitHub' : 'Deploy ' + framework.name}</DialogTitle>
          <DialogDescription className="sr-only">Deploy configuration</DialogDescription>
        </div>
        <div className="p-5">
          <AnimatePresence mode="wait">
            {step === 'github-connect' && (
              <motion.div key="gh-connect" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="flex items-center mb-6">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-600 text-white text-[10px] font-semibold font-mono">
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px]">1</span>GitHub
                  </div>
                  <div className="flex-1 h-px bg-zinc-700 mx-2" />
                  <span className="text-zinc-500 text-[10px] font-mono">2 Env Vars</span>
                  <div className="flex-1 h-px bg-zinc-700 mx-2" />
                  <span className="text-zinc-500 text-[10px] font-mono">3 Settings</span>
                </div>
                <div className="text-center mb-5">
                  <div className="w-16 h-16 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">Authorize Launchpad</h3>
                  <p className="text-sm text-zinc-400">Launchpad needs access to your repositories to detect, build, and deploy your projects.</p>
                </div>
                <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4 mb-5 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-zinc-300"><span className="text-emerald-400">?</span> Read repository contents and metadata</div>
                  <div className="flex items-center gap-3 text-sm text-zinc-300"><span className="text-emerald-400">?</span> Read and write deployment statuses</div>
                  <div className="flex items-center gap-3 text-sm text-zinc-300"><span className="text-emerald-400">?</span> Manage webhooks for auto-deploy</div>
                </div>
                <Button onClick={handleGitHubConnect} disabled={isConnecting} className="w-full bg-[#238636] hover:bg-[#2ea043] border-none text-white text-sm h-12 font-bold rounded-xl">
                  {isConnecting ? 'Connecting...' : 'Authorize with GitHub'}
                </Button>
              </motion.div>
            )}
            {step === 'github-repo' && (
              <motion.div key="gh-repo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                <Input placeholder="Search repositories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-zinc-800/50 border-zinc-700 text-white text-xs h-9" />
                <ScrollArea className="h-[240px]">
                  {filteredRepos.length === 0 ? <div className="text-center text-zinc-500 text-xs py-8">No repositories found</div> : <div className="space-y-1.5">{filteredRepos.map((repo) => (<button key={repo.html_url} onClick={() => handleRepoSelect(repo)} className="w-full p-3 rounded-lg border border-zinc-700/50 bg-zinc-800/30 hover:bg-zinc-800/50 hover:border-orange-500/50 transition-all text-left"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: repo.private ? '#fbbf24' : '#4ade80' }} /><div className="flex-1 min-w-0"><h4 className="font-medium text-white text-xs truncate">{repo.name}</h4></div></div></button>))}</div>}
                </ScrollArea>
              </motion.div>
            )}
            {step === 'github-branch' && (
              <motion.div key="gh-branch" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                <Label className="text-zinc-400">Select Branch</Label>
                <ScrollArea className="h-[200px]">
                  {isLoadingBranches ? <div className="text-center text-zinc-500 py-8">Loading...</div> : <div className="space-y-2">{branches.map((b) => (<button key={b.name} onClick={() => handleBranchSelect(b.name)} className={cn('w-full p-3 rounded-lg border border-zinc-700/50 bg-zinc-800/30 hover:border-orange-500/50 text-left text-white text-sm', selectedBranch === b.name && 'border-orange-500/50 bg-orange-500/10')}>{b.name}</button>))}</div>}
                </ScrollArea>
              </motion.div>
            )}
            {step === 'env-vars' && (
              <motion.div key="env-vars" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                {deployError && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{deployError}</div>}
                <div className="space-y-2">
                  <Label className="text-zinc-400">Environment Variables</Label>
                  {envVars.map((v, i) => (<div key={i} className="flex gap-2"><Input value={v.key} onChange={(e) => setEnvVars((p) => p.map((r, j) => j === i ? { ...r, key: e.target.value } : r))} placeholder="KEY" className="bg-zinc-800/50 border-zinc-700 text-white text-xs" /><Input value={v.value} onChange={(e) => setEnvVars((p) => p.map((r, j) => j === i ? { ...r, value: e.target.value } : r))} placeholder="VALUE" className="bg-zinc-800/50 border-zinc-700 text-white text-xs" /></div>))}
                  <Button variant="ghost" size="sm" onClick={() => setEnvVars((p) => [...p, { key: '', value: '', is_secret: false }])} className="text-zinc-400 text-xs">+ Add</Button>
                </div>
                <Button onClick={handleDeploy} disabled={!canDeploy} className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white h-10 text-sm font-semibold rounded-xl">Deploy</Button>
              </motion.div>
            )}
            {step === 'deploying' && (<motion.div key="deploying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10"><div className="w-10 h-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto mb-4" /><p className="text-white">Starting deployment...</p></motion.div>)}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
