import { motion } from 'motion/react';
import { GitBranch } from 'lucide-react';

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Moving mesh gradients */}
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(232,93,4,0.08) 0%, transparent 70%)' }}
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)' }}
        animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[30%] right-[20%] w-[40%] h-[40%] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)' }}
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Constellation network SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        {/* Animated connection lines */}
        {[
          { x1: 150, y1: 200, x2: 400, y2: 150 },
          { x1: 400, y1: 150, x2: 700, y2: 250 },
          { x1: 700, y1: 250, x2: 1000, y2: 180 },
          { x1: 200, y1: 500, x2: 500, y2: 450 },
          { x1: 500, y1: 450, x2: 850, y2: 550 },
          { x1: 400, y1: 150, x2: 500, y2: 450 },
          { x1: 700, y1: 250, x2: 850, y2: 550 },
          { x1: 1000, y1: 180, x2: 1050, y2: 400 },
          { x1: 150, y1: 200, x2: 200, y2: 500 },
        ].map((line, i) => (
          <motion.line
            key={`line-${i}`}
            x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
            stroke="var(--primary)" strokeWidth="0.5" opacity="0.15"
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, -16] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'linear' }}
          />
        ))}

        {/* Nodes with pulse rings */}
        {[
          { cx: 150, cy: 200, r: 6 },
          { cx: 400, cy: 150, r: 8 },
          { cx: 700, cy: 250, r: 7 },
          { cx: 1000, cy: 180, r: 5 },
          { cx: 200, cy: 500, r: 5 },
          { cx: 500, cy: 450, r: 9 },
          { cx: 850, cy: 550, r: 6 },
          { cx: 1050, cy: 400, r: 4 },
        ].map((node, i) => (
          <g key={`node-${i}`}>
            <motion.circle
              cx={node.cx} cy={node.cy} r={node.r + 8}
              fill="none" stroke="var(--primary)" strokeWidth="0.3"
              initial={{ opacity: 0.4, r: node.r }}
              animate={{ opacity: 0, r: node.r + 25 }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
            />
            <circle cx={node.cx} cy={node.cy} r={node.r} fill="var(--primary)" opacity="0.12" />
            <motion.circle
              cx={node.cx} cy={node.cy} r={node.r * 0.4}
              fill="var(--primary)"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
          </g>
        ))}

        {/* Traveling data packets */}
        <motion.circle r="3" fill="var(--primary)" opacity="0.9"
          animate={{ cx: [150, 400, 700, 1000], cy: [200, 150, 250, 180] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
        <motion.circle r="2.5" fill="#8b5cf6" opacity="0.8"
          animate={{ cx: [200, 500, 850], cy: [500, 450, 550] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear', delay: 1 }}
        />
        <motion.circle r="2" fill="#3b82f6" opacity="0.7"
          animate={{ cx: [400, 500, 850, 700], cy: [150, 450, 550, 250] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear', delay: 2 }}
        />
      </svg>

      {/* Floating glassmorphism cards */}
      <motion.div
        className="absolute top-28 right-[6%] w-44 opacity-60 hidden lg:block"
        animate={{ y: [-8, 8, -8], rotate: [1, -1, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-md p-4 shadow-xl shadow-black/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-green-500/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">production</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Status</span>
              <span className="text-green-500 font-medium">Healthy</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Latency</span>
              <span className="text-foreground font-medium">23ms</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Requests</span>
              <span className="text-foreground font-medium">1.2k/s</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-36 left-[4%] w-40 opacity-50 hidden lg:block"
        animate={{ y: [6, -6, 6], rotate: [-1, 1, -1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-md p-4 shadow-xl shadow-black/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
              <GitBranch className="w-3 h-3 text-primary" />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">main → prod</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground mt-1.5 block">deploying...</span>
        </div>
      </motion.div>

      {/* Morphing blob */}
      <motion.div
        className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-[0.025]"
        animate={{
          borderRadius: ['30% 70% 70% 30% / 30% 30% 70% 70%', '70% 30% 30% 70% / 70% 70% 30% 30%', '30% 70% 70% 30% / 30% 30% 70% 70%'],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: 'var(--primary)' }}
      />

      {/* Speed/motion lines */}
      {[
        { top: '18%', left: '12%', w: 'w-20', delay: 0 },
        { top: '32%', left: '75%', w: 'w-16', delay: 1.2 },
        { top: '55%', left: '20%', w: 'w-24', delay: 0.6 },
        { top: '70%', left: '65%', w: 'w-14', delay: 2 },
      ].map((line, i) => (
        <motion.div
          key={`speed-${i}`}
          className={`absolute ${line.w} h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent`}
          style={{ top: line.top, left: line.left }}
          animate={{ x: [0, 80], opacity: [0, 0.8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: line.delay }}
        />
      ))}
    </div>
  );
}
