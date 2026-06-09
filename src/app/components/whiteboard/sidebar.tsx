import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { frontendFrameworks } from '../../lib/frameworks';
import { FrontendFramework } from '../../lib/types';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../ui/utils';
import { Lock } from 'lucide-react';

interface SidebarProps {
  onDragStart: (framework: FrontendFramework) => void;
}

const BACKEND_ITEMS = [
  { id: 'nodejs', name: 'Node.js', icon: '🟢', color: '#68A063' },
  { id: 'python', name: 'Python / FastAPI', icon: '🐍', color: '#3776AB' },
  { id: 'go', name: 'Go', icon: '🔵', color: '#00ADD8' },
  { id: 'rust', name: 'Rust', icon: '🦀', color: '#DEA584' },
  { id: 'java', name: 'Java / Spring', icon: '☕', color: '#ED8B00' },
  { id: 'dotnet', name: '.NET', icon: '🟣', color: '#512BD4' },
];

const ADDON_ITEMS = [
  { id: 'postgres', name: 'PostgreSQL', icon: '🐘', color: '#4169E1' },
  { id: 'redis', name: 'Redis', icon: '🔴', color: '#DC382D' },
  { id: 'mongodb', name: 'MongoDB', icon: '🍃', color: '#47A248' },
  { id: 'stripe', name: 'Stripe', icon: '💳', color: '#635BFF' },
  { id: 'auth0', name: 'Auth0', icon: '🔐', color: '#EB5424' },
  { id: 's3', name: 'S3 Storage', icon: '📦', color: '#FF9900' },
];

export function Sidebar({ onDragStart }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFrameworks = frontendFrameworks.filter((fw) =>
    fw.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, framework: FrontendFramework) => {
    e.dataTransfer.setData('application/json', JSON.stringify(framework));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(framework);
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 64 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'relative h-full flex flex-col',
        'bg-gradient-to-b from-zinc-900/95 via-zinc-900/90 to-zinc-950/95',
        'border-r border-zinc-800/50 backdrop-blur-xl'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/50">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div key="expanded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <span className="text-lg">🚀</span>
                </div>
                <div>
                  <h1 className="font-bold text-white text-lg">DeployBoard</h1>
                  <p className="text-xs text-zinc-500">Stack Builder</p>
                </div>
              </div>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <Input
                  type="text"
                  placeholder="Search stack..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-orange-500/50 focus:ring-orange-500/20"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div key="collapsed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-lg">🚀</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Framework sections */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div key="expanded-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">

                {/* ─── FRONTEND SECTION ─────────────────────────── */}
                <div>
                  <div className="flex items-center gap-2 px-2 mb-3">
                    <span className="text-xs">⚡</span>
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest font-mono">Frontend Frameworks</span>
                  </div>
                  <div className="space-y-1.5">
                    {filteredFrameworks.map((framework, index) => (
                      <motion.div
                        key={framework.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, framework)}
                        className={cn(
                          'group relative p-2.5 rounded-xl cursor-grab active:cursor-grabbing',
                          'bg-zinc-800/30 border border-zinc-700/30',
                          'hover:bg-zinc-800/50 hover:border-zinc-600/50',
                          'transition-all duration-200'
                        )}
                      >
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at center, ${framework.color}10 0%, transparent 70%)` }} />
                        <div className="relative flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-lg flex items-center justify-center border border-white/10" style={{ background: `linear-gradient(135deg, ${framework.color}20, ${framework.color}10)` }}>
                            <img src={framework.icon} alt={framework.name} className="w-5 h-5 object-contain transition-transform group-hover:scale-110" style={{ filter: framework.id === 'nextjs' ? 'invert(1)' : 'none' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white text-[13px] group-hover:text-orange-400 transition-colors">{framework.name}</h3>
                            <p className="text-[10px] text-zinc-500 font-mono">drag to deploy</p>
                          </div>
                          <div className="w-[6px] h-[6px] rounded-full opacity-60 group-hover:opacity-100" style={{ backgroundColor: framework.color }} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {filteredFrameworks.length === 0 && <div className="text-center py-4 text-zinc-500 text-xs">No frameworks found</div>}
                </div>

                {/* ─── BACKEND SECTION (LOCKED) ─────────────────── */}
                <div>
                  <div className="flex items-center gap-2 px-2 mb-3">
                    <span className="text-xs">🖥️</span>
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest font-mono">Backend</span>
                    <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                      <Lock className="w-2.5 h-2.5 text-amber-400" />
                      <span className="text-[9px] text-amber-400 font-mono font-semibold">SOON</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 opacity-40 pointer-events-none select-none">
                    {BACKEND_ITEMS.map((item) => (
                      <div key={item.id} className="relative p-2.5 rounded-xl bg-zinc-800/20 border border-zinc-700/20">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center border border-white/5 bg-zinc-800/50 text-base">
                            {item.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-zinc-400 text-[13px]">{item.name}</h3>
                            <p className="text-[10px] text-zinc-600 font-mono">locked</p>
                          </div>
                          <Lock className="w-3.5 h-3.5 text-zinc-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ─── ADDONS SECTION (LOCKED) ─────────────────── */}
                <div>
                  <div className="flex items-center gap-2 px-2 mb-3">
                    <span className="text-xs">🧩</span>
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest font-mono">Addons</span>
                    <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                      <Lock className="w-2.5 h-2.5 text-purple-400" />
                      <span className="text-[9px] text-purple-400 font-mono font-semibold">SOON</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 opacity-40 pointer-events-none select-none">
                    {ADDON_ITEMS.map((item) => (
                      <div key={item.id} className="relative p-2.5 rounded-xl bg-zinc-800/20 border border-zinc-700/20">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center border border-white/5 bg-zinc-800/50 text-base">
                            {item.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-zinc-400 text-[13px]">{item.name}</h3>
                            <p className="text-[10px] text-zinc-600 font-mono">locked</p>
                          </div>
                          <Lock className="w-3.5 h-3.5 text-zinc-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            ) : (
              <motion.div key="collapsed-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {frontendFrameworks.map((framework, index) => (
                  <motion.div
                    key={framework.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, framework)}
                    className="group relative w-10 h-10 mx-auto rounded-lg cursor-grab active:cursor-grabbing flex items-center justify-center bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600/50 transition-all"
                  >
                    <img src={framework.icon} alt={framework.name} className="w-6 h-6 object-contain" style={{ filter: framework.id === 'nextjs' ? 'invert(1)' : 'none' }} />
                    <div className="absolute left-full ml-2 px-2 py-1 rounded bg-zinc-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">{framework.name}</div>
                  </motion.div>
                ))}
                <div className="h-px bg-zinc-800 my-2" />
                {BACKEND_ITEMS.slice(0, 3).map((item) => (
                  <div key={item.id} className="relative w-10 h-10 mx-auto rounded-lg flex items-center justify-center bg-zinc-800/30 border border-zinc-700/30 opacity-40">
                    <span className="text-sm">{item.icon}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Collapse toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          'absolute -right-3 top-1/2 -translate-y-1/2 z-10',
          'w-6 h-12 rounded-full',
          'bg-zinc-800 border border-zinc-700',
          'flex items-center justify-center',
          'text-zinc-400 hover:text-white hover:bg-zinc-700',
          'transition-colors shadow-lg'
        )}
      >
        {isCollapsed ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        )}
      </button>
    </motion.div>
  );
}
