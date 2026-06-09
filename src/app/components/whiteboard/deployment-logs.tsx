import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'motion/react';
import { cn } from '../ui/utils';

interface LogEntry {
  level: string;
  timestamp: number;
  message: string;
}

interface DeploymentLogsProps {
  deploymentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
}

const levelStyles: Record<string, { icon: string; color: string; bg: string; glow: string }> = {
  step: { icon: '▶', color: 'text-blue-400', bg: 'bg-blue-500/10', glow: 'shadow-[0_0_8px_rgba(59,130,246,0.3)]' },
  info: { icon: '○', color: 'text-zinc-400', bg: '', glow: '' },
  success: { icon: '✓', color: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'shadow-[0_0_8px_rgba(16,185,129,0.3)]' },
  warn: { icon: '⚠', color: 'text-amber-400', bg: 'bg-amber-500/10', glow: 'shadow-[0_0_8px_rgba(245,158,11,0.3)]' },
  error: { icon: '✗', color: 'text-red-400', bg: 'bg-red-500/10', glow: 'shadow-[0_0_8px_rgba(239,68,68,0.3)]' },
};

// Floating particles component
function FloatingParticles({ status }: { status: 'deploying' | 'success' | 'failed' | null }) {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
  }, []);

  const color = status === 'success' ? 'bg-emerald-400' : status === 'failed' ? 'bg-red-400' : 'bg-blue-400';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={cn('absolute rounded-full opacity-40', color)}
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// Animated progress ring
function ProgressRing({ progress, isComplete, status }: { progress: number; isComplete: boolean; status: 'success' | 'failed' | null }) {
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const ringColor = isComplete
    ? status === 'success' ? 'stroke-emerald-400' : 'stroke-red-400'
    : 'stroke-blue-400';

  return (
    <div className="relative w-12 h-12">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="18" fill="none" strokeWidth="2.5" className="stroke-zinc-800" />
        <motion.circle
          cx="22" cy="22" r="18" fill="none" strokeWidth="2.5"
          className={ringColor}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </svg>
      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div
              key="complete"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              {status === 'success' ? (
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <motion.path
                    strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="deploying"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Glow effect */}
      {!isComplete && (
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-500/20 blur-md"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
}

// Phase indicator showing deployment stages
function PhaseIndicator({ logs, isComplete }: { logs: LogEntry[]; isComplete: boolean }) {
  const phases = ['Clone', 'Install', 'Build', 'Upload', 'CDN'];
  
  const currentPhase = useMemo(() => {
    const lastStep = [...logs].reverse().find(l => l.level === 'step');
    if (!lastStep) return 0;
    const msg = lastStep.message.toLowerCase();
    if (msg.includes('cdn') || msg.includes('cloudfront') || msg.includes('invalidat')) return 4;
    if (msg.includes('upload') || msg.includes('s3')) return 3;
    if (msg.includes('build')) return 2;
    if (msg.includes('install') || msg.includes('dependencies')) return 1;
    return 0;
  }, [logs]);

  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {phases.map((phase, i) => (
        <div key={phase} className="flex items-center">
          <motion.div
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all duration-300',
              i < currentPhase ? 'bg-emerald-500/20 text-emerald-400' :
              i === currentPhase && !isComplete ? 'bg-blue-500/20 text-blue-400' :
              isComplete && i <= currentPhase ? 'bg-emerald-500/20 text-emerald-400' :
              'bg-zinc-800/50 text-zinc-600'
            )}
            animate={i === currentPhase && !isComplete ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {i < currentPhase || (isComplete && i <= currentPhase) ? (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-400">✓</motion.span>
            ) : i === currentPhase && !isComplete ? (
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>●</motion.span>
            ) : (
              <span className="text-zinc-600">○</span>
            )}
            {phase}
          </motion.div>
          {i < phases.length - 1 && (
            <motion.div
              className={cn('w-3 h-px mx-0.5', i < currentPhase ? 'bg-emerald-500/50' : 'bg-zinc-800')}
              animate={i === currentPhase - 1 ? { scaleX: [0, 1] } : {}}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Animated counter for elapsed time
function ElapsedTimer({ isRunning }: { isRunning: boolean }) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (!isRunning) return;
    startRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <motion.span
      className="font-mono text-xs text-zinc-500 tabular-nums"
      animate={isRunning ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
      transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
    >
      {mins > 0 ? `${mins}m ` : ''}{secs}s
    </motion.span>
  );
}

export function DeploymentLogs({ deploymentId, isOpen, onClose, projectName }: DeploymentLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [finalStatus, setFinalStatus] = useState<'success' | 'failed' | null>(null);
  const [finalUrl, setFinalUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const progress = useMotionValue(0);

  useEffect(() => {
    if (!deploymentId || !isOpen) return;

    setLogs([]);
    setIsComplete(false);
    setIsMinimized(false);
    setFinalStatus(null);
    setFinalUrl(null);
    progress.set(0);

    const evtSource = new EventSource(`/api/v1/deployments/${deploymentId}/logs`);
    eventSourceRef.current = evtSource;

    evtSource.onmessage = (event) => {
      const raw = event.data;

      if (raw === '[DONE]') {
        evtSource.close();
        return;
      }

      if (raw.startsWith('complete|')) {
        const parts = raw.split('|');
        setIsComplete(true);
        setFinalStatus(parts[2] as 'success' | 'failed');
        setFinalUrl(parts[3] || null);
        animate(progress, 100, { duration: 0.5 });
        evtSource.close();
        return;
      }

      const parts = raw.split('|');
      if (parts.length >= 3) {
        const entry: LogEntry = {
          level: parts[0],
          timestamp: parseInt(parts[1], 10),
          message: parts.slice(2).join('|'),
        };
        setLogs((prev) => {
          const next = [...prev, entry];
          // Estimate progress based on log count (rough heuristic)
          const estimated = Math.min(90, (next.length / 30) * 90);
          animate(progress, estimated, { duration: 0.3 });
          return next;
        });
      }
    };

    evtSource.onerror = () => {
      evtSource.close();
    };

    return () => {
      evtSource.close();
    };
  }, [deploymentId, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const progressValue = useTransform(progress, [0, 100], [0, 100]);
  const [displayProgress, setDisplayProgress] = useState(0);
  useEffect(() => {
    return progress.on('change', (v) => setDisplayProgress(Math.round(v)));
  }, [progress]);

  if (!isOpen) return null;

  const particleStatus = isComplete ? (finalStatus === 'success' ? 'success' : 'failed') : 'deploying';

  // Minimized floating pill
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={() => setIsMinimized(false)}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-full cursor-pointer',
          'border backdrop-blur-xl shadow-2xl transition-all hover:scale-105',
          isComplete
            ? finalStatus === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/30 hover:border-emerald-500/50 shadow-emerald-500/10'
              : 'bg-red-950/90 border-red-500/30 hover:border-red-500/50 shadow-red-500/10'
            : 'bg-zinc-900/95 border-blue-500/30 hover:border-blue-500/50 shadow-blue-500/10'
        )}
      >
        {/* Pulsing indicator */}
        <div className="relative">
          <motion.div
            className={cn(
              'w-3 h-3 rounded-full',
              isComplete
                ? finalStatus === 'success' ? 'bg-emerald-400' : 'bg-red-400'
                : 'bg-blue-400'
            )}
            animate={!isComplete ? { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {!isComplete && (
            <motion.div
              className="absolute inset-0 w-3 h-3 rounded-full bg-blue-400"
              animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>

        {/* Status text */}
        <div className="flex flex-col">
          <span className={cn(
            'text-xs font-semibold',
            isComplete
              ? finalStatus === 'success' ? 'text-emerald-300' : 'text-red-300'
              : 'text-blue-300'
          )}>
            {isComplete
              ? finalStatus === 'success' ? 'Deploy Complete' : 'Deploy Failed'
              : 'Deploying...'}
          </span>
          {projectName && <span className="text-[10px] text-zinc-500">{projectName}</span>}
        </div>

        {/* Progress or completion icon */}
        {!isComplete && (
          <span className="text-[10px] font-mono text-blue-400/80">{displayProgress}%</span>
        )}

        {/* Expand icon */}
        <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, y: 40, scale: 0.9, rotateX: -10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-6 right-6 z-50 w-[560px] max-h-[480px] rounded-2xl border border-zinc-700/40 bg-zinc-900/95 backdrop-blur-2xl overflow-hidden"
        style={{
          boxShadow: isComplete
            ? finalStatus === 'success'
              ? '0 0 60px rgba(16,185,129,0.15), 0 20px 60px rgba(0,0,0,0.6)'
              : '0 0 60px rgba(239,68,68,0.15), 0 20px 60px rgba(0,0,0,0.6)'
            : '0 0 60px rgba(59,130,246,0.1), 0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Particles */}
        <FloatingParticles status={particleStatus} />

        {/* Animated border gradient */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: isComplete
              ? finalStatus === 'success'
                ? 'linear-gradient(135deg, rgba(16,185,129,0.1), transparent, rgba(16,185,129,0.05))'
                : 'linear-gradient(135deg, rgba(239,68,68,0.1), transparent, rgba(239,68,68,0.05))'
              : 'linear-gradient(135deg, rgba(59,130,246,0.1), transparent, rgba(59,130,246,0.05))',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Scanning line effect during deployment */}
        {!isComplete && (
          <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent pointer-events-none z-10"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Header */}
        <div className="relative flex items-center justify-between px-5 py-4 border-b border-zinc-800/40">
          <div className="flex items-center gap-4">
            <ProgressRing progress={displayProgress} isComplete={isComplete} status={finalStatus} />
            <div>
              <motion.h3
                className="text-sm font-semibold text-white"
                key={isComplete ? 'done' : 'deploying'}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {isComplete
                  ? finalStatus === 'success' ? '🚀 Deployment Complete' : '💥 Deployment Failed'
                  : 'Deploying...'}
              </motion.h3>
              <div className="flex items-center gap-2 mt-0.5">
                {projectName && <span className="text-xs text-zinc-500">{projectName}</span>}
                <span className="text-zinc-700">·</span>
                <ElapsedTimer isRunning={!isComplete} />
                {!isComplete && (
                  <motion.span
                    className="text-xs text-blue-400 font-mono"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {displayProgress}%
                  </motion.span>
                )}
              </div>
            </div>
          </div>
          <motion.button
            onClick={() => setIsMinimized(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
            title="Minimize"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14H5" />
            </svg>
          </motion.button>
        </div>

        {/* Phase indicator */}
        <PhaseIndicator logs={logs} isComplete={isComplete} />

        {/* Logs */}
        <div ref={scrollRef} className="relative px-4 py-3 max-h-[260px] overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-zinc-700/50 scrollbar-track-transparent">
          {logs.length === 0 && !isComplete && (
            <div className="flex flex-col items-center gap-3 py-10">
              <motion.div
                className="relative"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <motion.div
                    className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-400 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full bg-blue-500/10 blur-lg"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <span className="text-xs text-zinc-500">Connecting to build pipeline...</span>
            </div>
          )}

          {logs.map((log, i) => {
            const style = levelStyles[log.level] || levelStyles.info;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.25, delay: 0.02 }}
                className={cn(
                  'flex items-start gap-2.5 px-3 py-1.5 rounded-lg text-xs font-mono group',
                  style.bg,
                  log.level === 'step' && style.glow
                )}
              >
                <motion.span
                  className={cn('flex-shrink-0 mt-0.5 text-[10px]', style.color)}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.05 }}
                >
                  {style.icon}
                </motion.span>
                <span className={cn(
                  'break-all leading-relaxed',
                  log.level === 'error' ? 'text-red-300' :
                  log.level === 'step' ? 'text-blue-200 font-semibold' :
                  log.level === 'success' ? 'text-emerald-300' :
                  'text-zinc-400'
                )}>
                  {log.message}
                </span>
                <span className="ml-auto text-[9px] text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </motion.div>
            );
          })}

          {/* Completion celebration */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
              className={cn(
                'mt-4 px-4 py-4 rounded-xl border relative overflow-hidden',
                finalStatus === 'success'
                  ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/30'
                  : 'bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/30'
              )}
            >
              {/* Success sparkles */}
              {finalStatus === 'success' && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-emerald-400"
                      style={{ left: `${15 + i * 15}%`, top: '50%' }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0], y: [0, -20 - Math.random() * 20, -40] }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                    />
                  ))}
                </>
              )}
              <div className="flex items-center gap-3">
                <motion.span
                  className="text-2xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
                >
                  {finalStatus === 'success' ? '🚀' : '💥'}
                </motion.span>
                <div>
                  <motion.span
                    className={cn('text-sm font-semibold', finalStatus === 'success' ? 'text-emerald-300' : 'text-red-300')}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {finalStatus === 'success' ? 'Live & Serving Traffic' : 'Build Failed — Check Logs'}
                  </motion.span>
                  {finalUrl && finalUrl !== 'Deployment failed' && (
                    <motion.a
                      href={finalUrl.startsWith('Deployment URL: ') ? finalUrl.replace('Deployment URL: ', '') : finalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors group"
                    >
                      <svg className="w-3 h-3 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span className="truncate underline underline-offset-2 decoration-emerald-500/30">
                        {(finalUrl.startsWith('Deployment URL: ') ? finalUrl.replace('Deployment URL: ', '') : finalUrl).replace('https://', '')}
                      </span>
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer with animated progress bar */}
        <div className="relative px-5 py-3 border-t border-zinc-800/40">
          {!isComplete ? (
            <div className="space-y-2">
              <div className="h-1.5 rounded-full bg-zinc-800/80 overflow-hidden relative">
                {/* Background shimmer */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-700/30 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                {/* Actual progress */}
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-full"
                  style={{ width: `${displayProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
                {/* Glow on progress tip */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-400 blur-sm"
                  style={{ left: `${displayProgress}%` }}
                  animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-600">
                <span>Building</span>
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {logs.length} log entries
                </motion.span>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between text-xs text-zinc-500"
            >
              <span>Completed in {logs.length} steps</span>
              <span className={finalStatus === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                {finalStatus === 'success' ? 'All checks passed' : 'Exit with errors'}
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
