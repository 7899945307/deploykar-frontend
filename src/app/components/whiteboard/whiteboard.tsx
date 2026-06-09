import { useCallback, useRef, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'motion/react';

import { ProjectNode } from './project-node';
import { Sidebar } from './sidebar';
import { Toolbar } from './toolbar';
import { DeploymentSourceModal } from './deployment-modal';
import { DeploymentLogs } from './deployment-logs';
import { DeployModalContext, registerOpenDeployModal } from './deploy-modal-context';
import { FrontendFramework, ProjectNode as ProjectNodeType } from '../../lib/types';
import { useDeploymentStore } from '../../lib/store';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

const nodeTypes = { projectNode: ProjectNode };

function WhiteboardContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, zoomIn, zoomOut, screenToFlowPosition } = useReactFlow();

  const {
    nodes, edges, setNodes, onNodesChange, onEdgesChange, onConnect,
    addToHistory, saveToLocal, loadFromLocal, importJSON, addProjectToCanvas,
  } = useDeploymentStore();

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [deployNodeId, setDeployNodeId] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveName, setSaveName] = useState('');

  // Load projects from backend on mount
  useEffect(() => {
    useDeploymentStore.getState().loadStack();
  }, []);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      if (modifier && e.key === 'z' && !e.shiftKey) { e.preventDefault(); useDeploymentStore.getState().undo(); }
      if (modifier && e.key === 'z' && e.shiftKey) { e.preventDefault(); useDeploymentStore.getState().redo(); }
      if (modifier && e.key === 's') { e.preventDefault(); setShowSaveDialog(true); }
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut]);

  const onDragStart = useCallback((_framework: FrontendFramework) => {
    // Framework data is passed via dataTransfer in the sidebar
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDraggingOver(true);
  }, []);

  const onDragLeave = useCallback(() => { setIsDraggingOver(false); }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDraggingOver(false);
    const data = event.dataTransfer.getData('application/json');
    if (!data) return;
    try {
      const framework: FrontendFramework = JSON.parse(data);
      // Convert screen coordinates to flow coordinates (accounts for pan/zoom)
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addProjectToCanvas(framework, position);
    } catch (e) {
      console.error('Failed to parse dropped data:', e);
    }
  }, [addProjectToCanvas, screenToFlowPosition]);

  const handleDeploymentModalChange = (open: boolean) => {
    setShowDeploymentModal(open);
    if (!open) { setDeployNodeId(null); }
  };

  const openDeployModalForNode = useCallback((nodeId: string) => {
    console.log('[Whiteboard] openDeployModalForNode called, nodeId:', nodeId);
    setDeployNodeId(nodeId);
    setShowDeploymentModal(true);
  }, []);

  // Register globally so nodes can trigger it without context
  useEffect(() => {
    registerOpenDeployModal(openDeployModalForNode);
  }, [openDeployModalForNode]);

  const onAutoArrange = useCallback(() => {
    const arrangedNodes = nodes.map((node, index) => {
      const cols = Math.ceil(Math.sqrt(nodes.length));
      const row = Math.floor(index / cols);
      const col = index % cols;
      return { ...node, position: { x: col * 380 + 100, y: row * 320 + 100 } };
    });
    setNodes(arrangedNodes);
    setTimeout(() => { fitView({ padding: 0.2 }); addToHistory(); }, 100);
  }, [nodes, setNodes, fitView, addToHistory]);

  const onExportPNG = useCallback(() => {
    const flowElement = document.querySelector('.react-flow') as HTMLElement | null;
    if (flowElement) {
      toPng(flowElement, { backgroundColor: '#09090b', quality: 1 }).then((dataUrl) => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'deployment-board.png';
        a.click();
      });
    }
  }, []);

  const handleSave = () => {
    if (saveName) { saveToLocal(saveName); setShowSaveDialog(false); setSaveName(''); }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => { importJSON(event.target?.result as string); };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const saves = loadFromLocal() || [];

  return (
    <DeployModalContext.Provider value={{ openDeployModal: openDeployModalForNode }}>
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar onDragStart={onDragStart} />

      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <Toolbar
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFitView={() => fitView({ padding: 0.2 })}
          onAutoArrange={onAutoArrange}
          onExportPNG={onExportPNG}
          onSave={() => setShowSaveDialog(true)}
          onImport={handleImport}
        />

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="h-full w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges as import('reactflow').Edge[]}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={{ type: 'smoothstep', animated: true, style: { stroke: '#f97316', strokeWidth: 2 } }}
            fitView
            snapToGrid
            snapGrid={[20, 20]}
            minZoom={0.2}
            maxZoom={2}
            className="bg-transparent"
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#27272a" />
            <Controls className="!bg-zinc-900/90 !border-zinc-800 !rounded-lg !shadow-xl [&>button]:!bg-zinc-800 [&>button]:!border-zinc-700 [&>button]:!text-zinc-400 [&>button:hover]:!bg-zinc-700 [&>button:hover]:!text-white" position="bottom-left" />
            <MiniMap
              nodeColor={(node) => { const projectNode = node as ProjectNodeType; return projectNode.data?.project?.framework?.color || '#f97316'; }}
              maskColor="rgba(0, 0, 0, 0.8)"
              className="!bg-zinc-900/90 !border-zinc-800 !rounded-lg"
              position="bottom-right"
            />
          </ReactFlow>
        </motion.div>

        {/* Empty state */}
        {nodes.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="inline-block p-8 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/50 mb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center border border-orange-500/20">
                  <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                </div>
                <p className="text-lg font-medium text-white">Start Building Your Stack</p>
                <p className="text-sm text-zinc-400 mt-2 max-w-xs">Drag a frontend framework from the sidebar to create your first deployment</p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Drag overlay */}
        <AnimatePresence>
          {isDraggingOver && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-4 bg-orange-500/10 border-2 border-dashed border-orange-500/50 rounded-xl pointer-events-none z-50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <p className="text-orange-400 font-medium">Drop to create deployment</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stack Card on canvas */}
        {console.log('[Whiteboard] Rendering modal, open:', showDeploymentModal, 'nodeId:', deployNodeId)}
        <DeploymentSourceModal open={showDeploymentModal} onOpenChange={handleDeploymentModalChange} nodeId={deployNodeId} />
        <DeploymentLogsPanel />
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Save Board</DialogTitle>
            <DialogDescription className="text-zinc-400">Enter a name to save your deployment board</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Board Name</Label>
              <Input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="My Deployment Board" className="bg-zinc-800 border-zinc-700 text-white" onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowSaveDialog(false)} className="text-zinc-400">Cancel</Button>
              <Button onClick={handleSave} disabled={!saveName} className="bg-orange-600 hover:bg-orange-500">Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Load Board</DialogTitle>
            <DialogDescription className="text-zinc-400">Select a saved board to load</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px] mt-4">
            <div className="space-y-2">
              {saves.length === 0 ? (
                <p className="text-center text-zinc-500 py-8">No saved boards</p>
              ) : (
                saves.map((save: { name: string; data: unknown; updatedAt: string }) => (
                  <button key={save.name} onClick={() => { setNodes((save.data as { nodes: ProjectNodeType[] }).nodes); setShowLoadDialog(false); }} className="w-full p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-left transition-colors">
                    <p className="font-medium text-white">{save.name}</p>
                    <p className="text-xs text-zinc-500">{new Date(save.updatedAt).toLocaleString()}</p>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
    </DeployModalContext.Provider>
  );
}

function DeploymentLogsPanel() {
  const activeDeploymentLog = useDeploymentStore((s) => s.activeDeploymentLog);
  const clearActiveDeploymentLog = useDeploymentStore((s) => s.clearActiveDeploymentLog);

  return (
    <DeploymentLogs
      deploymentId={activeDeploymentLog?.deploymentId ?? null}
      isOpen={!!activeDeploymentLog}
      onClose={clearActiveDeploymentLog}
      projectName={activeDeploymentLog?.projectName}
    />
  );
}

export function Whiteboard() {
  return (
    <ReactFlowProvider>
      <WhiteboardContent />
    </ReactFlowProvider>
  );
}
