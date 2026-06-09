import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useDeploymentStore } from '../../lib/store';

interface ToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onAutoArrange: () => void;
  onExportPNG: () => void;
  onSave: () => void;
  onImport: () => void;
}

export function Toolbar({ onZoomIn, onZoomOut, onFitView, onAutoArrange, onExportPNG, onSave, onImport }: ToolbarProps) {
  const { undo, redo, canUndo, canRedo, clearCanvas, exportJSON } = useDeploymentStore();

  const handleExportJSON = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deployment-board.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const shortcuts = [
    { key: 'Ctrl/⌘ + Z', action: 'Undo' },
    { key: 'Ctrl/⌘ + Shift + Z', action: 'Redo' },
    { key: 'Ctrl/⌘ + S', action: 'Save' },
    { key: 'Delete/Backspace', action: 'Delete selected' },
    { key: '+/-', action: 'Zoom in/out' },
    { key: 'Scroll', action: 'Pan canvas' },
  ];

  return (
    <TooltipProvider>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/50 shadow-xl">
          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-zinc-700/50">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo()} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-800 border-zinc-700 text-white">Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo()} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-800 border-zinc-700 text-white">Redo (Ctrl+Shift+Z)</TooltipContent>
            </Tooltip>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-0.5 px-2 border-r border-zinc-700/50">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onZoomOut} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-800 border-zinc-700 text-white">Zoom Out (-)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onZoomIn} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-800 border-zinc-700 text-white">Zoom In (+)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onFitView} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-800 border-zinc-700 text-white">Fit View</TooltipContent>
            </Tooltip>
          </div>

          {/* Layout */}
          <div className="flex items-center gap-0.5 px-2 border-r border-zinc-700/50">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onAutoArrange} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-800 border-zinc-700 text-white">Auto Arrange</TooltipContent>
            </Tooltip>
          </div>

          {/* File Operations */}
          <div className="flex items-center gap-0.5 px-2 border-r border-zinc-700/50">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onSave} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-800 border-zinc-700 text-white">Save (Ctrl+S)</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="bg-zinc-900 border-zinc-700">
                <DropdownMenuItem onClick={onExportPNG} className="text-zinc-200 focus:bg-zinc-800 focus:text-white">Export as PNG</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportJSON} className="text-zinc-200 focus:bg-zinc-800 focus:text-white">Export as JSON</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onImport} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-800 border-zinc-700 text-white">Import JSON</TooltipContent>
            </Tooltip>
          </div>

          {/* Clear & Help */}
          <div className="flex items-center gap-0.5 pl-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={clearCanvas} className="h-8 w-8 text-zinc-400 hover:bg-red-500/20 hover:text-red-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-800 border-zinc-700 text-white">Clear Canvas</TooltipContent>
            </Tooltip>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /></svg>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                  <DialogTitle>Keyboard Shortcuts</DialogTitle>
                  <DialogDescription className="text-zinc-400">Use these shortcuts to work faster</DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 mt-4">
                  {shortcuts.map((shortcut) => (
                    <div key={shortcut.key} className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-800/50">
                      <span className="text-sm text-zinc-300">{shortcut.action}</span>
                      <kbd className="px-2 py-1 text-xs font-mono bg-zinc-900 rounded border border-zinc-700 text-zinc-400">{shortcut.key}</kbd>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
