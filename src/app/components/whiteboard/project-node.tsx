import { memo, useState, useContext, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion, AnimatePresence } from 'motion/react';
import { Project, DeploymentStatus } from '../../lib/types';
import { useDeploymentStore } from '../../lib/store';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../ui/utils';
import { DeployModalContext, triggerOpenDeployModal } from './deploy-modal-context';

interface ProjectNodeData {
  project: Project;
}

const statusConfig: Record<DeploymentStatus, { color: string; bgColor: string; label: string; pulse: boolean; glow: string }> = {
  PENDING: { color: 'text-zinc-400', bgColor: 'bg-zinc-500/10', label: 'Pending', pulse: false, glow: '' },
  QUEUED: { color: 'text-amber-400', bgColor: 'bg-amber-500/10', label: 'Queued', pulse: true, glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]' },
  DEPLOYING: { color: 'text-blue-400', bgColor: 'bg-blue-500/10', label: 'Deploying', pulse: true, glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]' },
  ACTIVE: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', label: 'Active', pulse: false, glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]' },
  FAILED: { color: 'text-red-400', bgColor: 'bg-red-500/10', label: 'Failed', pulse: false, glow: 'shadow-[0_0_20px_rgba(239,68,68,0.1)]' },
  ROLLBACK: { color: 'text-orange-400', bgColor: 'bg-orange-500/10', label: 'Rollback', pulse: false, glow: '' },
};

// Orbiting particles for deploying state
function OrbitingParticles({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{ background: color, left: '50%', top: '50%' }}
          animate={{
            x: [0, Math.cos((i * Math.PI) / 3) * 140, Math.cos((i * Math.PI) / 3 + Math.PI) * 140, 0],
            y: [0, Math.sin((i * Math.PI) / 3) * 80, Math.sin((i * Math.PI) / 3 + Math.PI) * 80, 0],
            opacity: [0, 0.8, 0.8, 0],
            scale: [0, 1.5, 1.5, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// Animated status badge
function StatusBadge({ status, autoDeployEnabled }: { status: DeploymentStatus; autoDeployEnabled: boolean }) {
  const config = statusConfig[status];
  const isActive = status === 'DEPLOYING' || status === 'QUEUED';

  return (
    <motion.div
      className={cn('flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs relative overflow-hidden', config.bgColor)}
      animate={isActive ? {
        boxShadow: ['0 0 0px rgba(59,130,246,0)', '0 0 15px rgba(59,130,246,0.15)', '0 0 0px rgba(59,130,246,0)'],
      } : {}}
      transition={{ duration: 2.5, repeat: Infinity }}
    >
      {/* Background shimmer for active states */}
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      )}

      <div className="relative flex items-center justify-center">
        <motion.div
          className={cn('w-2.5 h-2.5 rounded-full', config.color.replace('text-', 'bg-'))}
          animate={config.pulse ? { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {config.pulse && (
          <motion.div
            className={cn('absolute w-2.5 h-2.5 rounded-full', config.color.replace('text-', 'bg-'))}
            animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>

      <span className={cn('font-medium relative z-10', config.color)}>{config.label}</span>

      {autoDeployEnabled && (
        <motion.div
          className="ml-auto flex items-center gap-1 text-amber-400/80"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[10px]">Auto</span>
        </motion.div>
      )}
    </motion.div>
  );
}

function ProjectNodeComponent({ data, selected }: NodeProps<ProjectNodeData>) {
  const { project } = data;
  const status = statusConfig[project.status];
  const [isHovered, setIsHovered] = useState(false);
  const { deployProject, redeployProject, toggleAutoDeploy, deleteDeployment, selectNode } = useDeploymentStore();
  const { openDeployModal } = useContext(DeployModalContext);

  const isGitHubConnected = !!project.github_repo_url;
  const isDeploying = project.status === 'DEPLOYING' || project.status === 'QUEUED';

  const handleDeploy = async () => {
    if (isDeploying) return;
    await deployProject(project.id);
  };

  const handleRedeploy = async () => {
    if (isDeploying) return;
    await redeployProject(project.id);
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => selectNode(project.id)}
      className={cn(
        'relative rounded-xl border backdrop-blur-xl transition-all duration-500 overflow-hidden',
        isGitHubConnected ? 'w-[320px]' : 'w-[260px]',
        'bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-950/95',
        selected ? 'border-orange-500/50' : 'border-zinc-700/30 hover:border-zinc-600/50',
        status.glow
      )}
      style={{
        boxShadow: selected
          ? `0 0 40px rgba(249,115,22,0.2), 0 25px 50px -12px rgba(0, 0, 0, 0.5)`
          : isHovered
          ? `0 0 30px ${project.framework.color}15, 0 25px 50px -12px rgba(0, 0, 0, 0.5)`
          : '0 10px 40px -12px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Handles with custom styling */}
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-zinc-700 !border-2 !border-zinc-600 hover:!bg-orange-500 hover:!border-orange-400 transition-all !-top-[5px]" />
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-zinc-700 !border-2 !border-zinc-600 hover:!bg-orange-500 hover:!border-orange-400 transition-all !-bottom-[5px]" />
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-zinc-700 !border-2 !border-zinc-600 hover:!bg-orange-500 hover:!border-orange-400 transition-all !-left-[5px]" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-zinc-700 !border-2 !border-zinc-600 hover:!bg-orange-500 hover:!border-orange-400 transition-all !-right-[5px]" />

      {/* Deploying particles */}
      {isDeploying && <OrbitingParticles color={project.status === 'DEPLOYING' ? '#3b82f6' : '#f59e0b'} />}

      {/* Top accent bar */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background:
            project.status === 'ACTIVE' ? `linear-gradient(90deg, transparent 0%, ${project.framework.color} 50%, transparent 100%)`
            : project.status === 'DEPLOYING' ? 'linear-gradient(90deg, transparent, #3b82f6, transparent)'
            : project.status === 'FAILED' ? 'linear-gradient(90deg, transparent, #ef4444, transparent)'
            : project.status === 'QUEUED' ? 'linear-gradient(90deg, transparent, #f59e0b, transparent)'
            : 'linear-gradient(90deg, transparent, rgba(113,113,122,0.3), transparent)',
        }}
        animate={isDeploying ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
        transition={{ duration: 2, repeat: isDeploying ? Infinity : 0 }}
      />

      {/* Rotating border glow for deploying */}
      {isDeploying && (
        <div className="absolute inset-0 rounded-xl pointer-events-none z-0 overflow-hidden">
          <motion.div
            className="absolute -inset-[1px]"
            style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(59,130,246,0.3), transparent, transparent)',
              borderRadius: 'inherit',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}

      {/* Header */}
      <div className={cn("relative z-10 pb-3", isGitHubConnected ? "p-4" : "p-3")}>
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <motion.div
              className={cn("relative rounded-xl flex items-center justify-center", isGitHubConnected ? "w-12 h-12" : "w-10 h-10")}
              style={{
                background: `linear-gradient(135deg, ${project.framework.color}15, ${project.framework.color}08)`,
                border: `1px solid ${project.framework.color}20`,
              }}
              whileHover={{ scale: 1.05, rotate: 3 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <img
                src={project.framework.icon}
                alt={project.framework.name}
                width={isGitHubConnected ? 28 : 22}
                height={isGitHubConnected ? 28 : 22}
                className={cn("object-contain", isGitHubConnected ? "w-7 h-7" : "w-[22px] h-[22px]")}
                style={{ filter: project.framework.id === 'nextjs' ? 'invert(1)' : 'none' }}
              />
              {/* Active indicator dot */}
              {project.status === 'ACTIVE' && (
                <motion.div
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-zinc-900"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-[13px] leading-tight break-words tracking-tight">{project.name}</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5 font-medium uppercase tracking-wider">
                {isGitHubConnected ? 'Frontend' : 'Connect Repo'}
              </p>
            </div>
          </div>

          {isGitHubConnected && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-white hover:bg-zinc-800/80 rounded-lg">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" /></svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-zinc-900/95 backdrop-blur-xl border-zinc-700/50 shadow-2xl">
              <DropdownMenuItem onClick={handleDeploy} className="text-zinc-200 focus:bg-zinc-800 focus:text-white">
                <svg className="w-3.5 h-3.5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Deploy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRedeploy} disabled={!project.lastDeployedAt} className="text-zinc-200 focus:bg-zinc-800 focus:text-white">
                <svg className="w-3.5 h-3.5 mr-2 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Redeploy
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem onClick={() => toggleAutoDeploy(project.id)} className="text-zinc-200 focus:bg-zinc-800 focus:text-white">
                <svg className="w-3.5 h-3.5 mr-2 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                {project.autoDeployEnabled ? 'Disable Auto Deploy' : 'Enable Auto Deploy'}
              </DropdownMenuItem>
              {(project.status === 'PENDING' || project.status === 'QUEUED' || project.status === 'FAILED') && (
                <>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem onClick={() => deleteDeployment(project.id)} className="text-red-400 focus:bg-red-950/50 focus:text-red-300">
                    <svg className="w-3.5 h-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Delete Project
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          )}
        </div>
      </div>

      {/* Repository info */}
      {project.github_repo_url && (
        <div className="relative z-10 px-4 pb-3">
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 bg-zinc-800/30 rounded-lg px-2.5 py-1.5">
            <svg className="h-3 w-3 text-zinc-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            <span className="truncate font-mono">{project.github_repo_url.replace('https://github.com/', '')}</span>
            {project.github_branch && (
              <>
                <span className="text-zinc-700">·</span>
                <span className="text-zinc-400 flex-shrink-0">{project.github_branch}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Connect GitHub - shown when no repo connected */}
      {!isGitHubConnected && (
        <div className="relative z-10 px-3 pb-3 nodrag nopan">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={(e) => { e.stopPropagation(); triggerOpenDeployModal(project.id); }}
              onMouseDown={(e) => { e.stopPropagation(); }}
              className="w-full bg-zinc-800/60 border border-zinc-700/40 hover:bg-zinc-700/60 hover:border-zinc-600/60 text-white text-xs h-9 rounded-lg transition-all duration-300 group"
            >
              <svg className="w-4 h-4 mr-2 text-zinc-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              Connect GitHub
            </Button>
          </motion.div>
        </div>
      )}

      {/* Status bar */}
      {isGitHubConnected && (
        <div className="relative z-10 px-4 pb-3">
          <StatusBadge status={project.status} autoDeployEnabled={project.autoDeployEnabled} />
        </div>
      )}

      {/* Deployment URL */}
      {isGitHubConnected && project.deploymentUrl && project.status === 'ACTIVE' && (
        <div className="relative z-10 px-4 pb-3">
          <motion.a
            href={project.deploymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-emerald-400/80 hover:text-emerald-300 transition-all group bg-emerald-500/5 rounded-lg px-2.5 py-1.5 border border-emerald-500/10 hover:border-emerald-500/20"
            whileHover={{ x: 2 }}
          >
            <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            <span className="truncate group-hover:underline underline-offset-2 decoration-emerald-500/30">{project.deploymentUrl.replace('https://', '')}</span>
          </motion.a>
        </div>
      )}

      {/* Footer */}
      {isGitHubConnected && (
      <div className="relative z-10 px-4 py-3 border-t border-zinc-800/30 bg-zinc-950/20">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <svg className="h-3 w-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-[11px]">{formatTime(project.lastDeployedAt)}</span>
          </div>
          <AnimatePresence>
            {(isHovered || selected) && !isDeploying && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Button
                  size="sm"
                  onClick={handleDeploy}
                  className="h-6 px-3 text-[10px] font-medium bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-lg shadow-orange-500/20 border-0 rounded-md"
                >
                  Deploy
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          {isDeploying && (
            <motion.div
              className="flex items-center gap-2 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/15"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, borderColor: ['rgba(59,130,246,0.15)', 'rgba(59,130,246,0.3)', 'rgba(59,130,246,0.15)'] }}
              transition={{ borderColor: { duration: 2, repeat: Infinity } }}
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-blue-400"
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-[10px] text-blue-400 font-medium">
                {project.status === 'QUEUED' ? 'In Queue' : 'Building'}
              </span>
            </motion.div>
          )}
        </div>
      </div>
      )}
    </motion.div>
  );
}

export const ProjectNode = memo(ProjectNodeComponent);
