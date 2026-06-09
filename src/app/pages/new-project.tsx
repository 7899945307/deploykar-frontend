import { useState, useRef, useEffect, DragEvent } from 'react';
import { Link } from 'react-router';
import { Header } from '../components/header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { X, GripVertical, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { useUser } from '../context/user-context';

type TechCategory = 'frontend' | 'backend' | 'addons';

interface Tech {
  id: string;
  name: string;
  category: TechCategory;
  logo: string;
}

interface CanvasTech {
  id: string;
  tech: Tech;
  x: number;
  y: number;
}

type PortSide = 'top' | 'right' | 'bottom' | 'left';

interface Connection {
  from: string;
  to: string;
  fromPort?: PortSide;
  toPort?: PortSide;
}

export default function NewProject() {
  const { user } = useUser();
  const [canDeploy, setCanDeploy] = useState<boolean | null>(null);
  const [deployReason, setDeployReason] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.accessToken) return;
    api.checkDeployAccess(user.accessToken).then((data: any) => {
      setCanDeploy(data.can_deploy);
      setDeployReason(data.reason || null);
    }).catch(() => setCanDeploy(true)); // Allow if check fails
  }, [user?.accessToken]);

  const [projectName, setProjectName] = useState('');
  const [activeCategory, setActiveCategory] = useState<TechCategory>('frontend');
  const [canvasTechs, setCanvasTechs] = useState<CanvasTech[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedForConnection, setSelectedForConnection] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingConnection, setDraggingConnection] = useState<{ fromId: string; mouseX: number; mouseY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const technologies: Record<TechCategory, Tech[]> = {
    frontend: [
      { id: 'react', name: 'React', category: 'frontend', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
      { id: 'vue', name: 'Vue.js', category: 'frontend', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg' },
      { id: 'angular', name: 'Angular', category: 'frontend', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg' },
      { id: 'svelte', name: 'Svelte', category: 'frontend', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg' },
      { id: 'nextjs', name: 'Next.js', category: 'frontend', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg' },
    ],
    backend: [
      { id: 'nodejs', name: 'Node.js', category: 'backend', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
      { id: 'express', name: 'Express', category: 'backend', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg' },
      { id: 'fastify', name: 'Fastify', category: 'backend', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastify/fastify-original.svg' },
      { id: 'nestjs', name: 'NestJS', category: 'backend', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg' },
      { id: 'python', name: 'Python', category: 'backend', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
      { id: 'django', name: 'Django', category: 'backend', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg' },
      { id: 'flask', name: 'Flask', category: 'backend', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg' },
    ],
    addons: [
      { id: 'postgres', name: 'PostgreSQL', category: 'addons', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
      { id: 'mongodb', name: 'MongoDB', category: 'addons', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
      { id: 'redis', name: 'Redis', category: 'addons', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg' },
      { id: 'rabbitmq', name: 'RabbitMQ', category: 'addons', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rabbitmq/rabbitmq-original.svg' },
      { id: 's3', name: 'S3 Storage', category: 'addons', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg' },
    ],
  };

  const addTechToCanvas = (tech: Tech) => {
    if (canvasTechs.some(ct => ct.tech.id === tech.id)) return;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const cols = 4;
    const cardWidth = 160;
    const cardHeight = 80;
    const gapX = 40;
    const gapY = 40;
    const paddingX = 60;
    const paddingY = 60;

    const index = canvasTechs.length;
    const col = index % cols;
    const row = Math.floor(index / cols);

    const x = paddingX + col * (cardWidth + gapX);
    const y = paddingY + row * (cardHeight + gapY);

    const newCanvasTech: CanvasTech = {
      id: `${tech.id}-${Date.now()}`,
      tech,
      x,
      y,
    };

    setCanvasTechs([...canvasTechs, newCanvasTech]);
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, tech: Tech) => {
    e.dataTransfer.setData('application/json', JSON.stringify(tech));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    const tech: Tech = JSON.parse(data);
    if (canvasTechs.some(ct => ct.tech.id === tech.id)) return;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const x = e.clientX - canvasRect.left - 80;
    const y = e.clientY - canvasRect.top - 40;

    const newCanvasTech: CanvasTech = {
      id: `${tech.id}-${Date.now()}`,
      tech,
      x: Math.max(0, x),
      y: Math.max(0, y),
    };

    setCanvasTechs([...canvasTechs, newCanvasTech]);
  };

  const removeTechFromCanvas = (id: string) => {
    setCanvasTechs(canvasTechs.filter(ct => ct.id !== id));
    setConnections(connections.filter(c => c.from !== id && c.to !== id));
    if (selectedForConnection === id) {
      setSelectedForConnection(null);
    }
  };

  const handleCanvasTechClick = (id: string) => {
    if (selectedForConnection === null) {
      setSelectedForConnection(id);
    } else if (selectedForConnection === id) {
      setSelectedForConnection(null);
    } else {
      const connectionExists = connections.some(
        c => (c.from === selectedForConnection && c.to === id) || 
             (c.from === id && c.to === selectedForConnection)
      );
      
      if (!connectionExists) {
        setConnections([...connections, { from: selectedForConnection, to: id }]);
      }
      setSelectedForConnection(null);
    }
  };

  const handlePortMouseDown = (e: React.MouseEvent, techId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    setDraggingConnection({
      fromId: techId,
      mouseX: e.clientX - canvasRect.left,
      mouseY: e.clientY - canvasRect.top,
    });

    const handleMouseMove = (ev: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      setDraggingConnection(prev => prev ? {
        ...prev,
        mouseX: ev.clientX - rect.left,
        mouseY: ev.clientY - rect.top,
      } : null);
    };

    const handleMouseUp = (ev: MouseEvent) => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // Check if we dropped on a tech card
      const target = document.elementFromPoint(ev.clientX, ev.clientY);
      const cardEl = target?.closest('[data-tech-id]');
      if (cardEl) {
        const targetId = cardEl.getAttribute('data-tech-id');
        if (targetId && targetId !== techId) {
          const connectionExists = connections.some(
            c => (c.from === techId && c.to === targetId) ||
                 (c.from === targetId && c.to === techId)
          );
          if (!connectionExists) {
            setConnections(prev => [...prev, { from: techId, to: targetId }]);
          }
        }
      }
      setDraggingConnection(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getPortPosition = (tech: CanvasTech, port: PortSide) => {
    const cardW = 160;
    const cardH = 110;
    switch (port) {
      case 'top': return { x: tech.x + cardW / 2, y: tech.y };
      case 'right': return { x: tech.x + cardW, y: tech.y + cardH / 2 };
      case 'bottom': return { x: tech.x + cardW / 2, y: tech.y + cardH };
      case 'left': return { x: tech.x, y: tech.y + cardH / 2 };
    }
  };

  const getNearestPorts = (from: CanvasTech, to: CanvasTech): { fromPort: PortSide; toPort: PortSide } => {
    const ports: PortSide[] = ['top', 'right', 'bottom', 'left'];
    let minDist = Infinity;
    let bestFrom: PortSide = 'right';
    let bestTo: PortSide = 'left';

    for (const fp of ports) {
      for (const tp of ports) {
        const fPos = getPortPosition(from, fp);
        const tPos = getPortPosition(to, tp);
        const dist = Math.sqrt((fPos.x - tPos.x) ** 2 + (fPos.y - tPos.y) ** 2);
        if (dist < minDist) {
          minDist = dist;
          bestFrom = fp;
          bestTo = tp;
        }
      }
    }
    return { fromPort: bestFrom, toPort: bestTo };
  };

  const getConnectionPath = (connection: Connection) => {
    const fromTech = canvasTechs.find(ct => ct.id === connection.from);
    const toTech = canvasTechs.find(ct => ct.id === connection.to);

    if (!fromTech || !toTech) return { path: '', fromPos: { x: 0, y: 0 }, toPos: { x: 0, y: 0 } };

    const { fromPort, toPort } = connection.fromPort && connection.toPort
      ? { fromPort: connection.fromPort, toPort: connection.toPort }
      : getNearestPorts(fromTech, toTech);

    const fromPos = getPortPosition(fromTech, fromPort);
    const toPos = getPortPosition(toTech, toPort);

    // Create smooth bezier based on port directions
    const offset = 60;
    let cx1 = fromPos.x, cy1 = fromPos.y, cx2 = toPos.x, cy2 = toPos.y;

    if (fromPort === 'right') cx1 += offset;
    else if (fromPort === 'left') cx1 -= offset;
    else if (fromPort === 'top') cy1 -= offset;
    else cy1 += offset;

    if (toPort === 'right') cx2 += offset;
    else if (toPort === 'left') cx2 -= offset;
    else if (toPort === 'top') cy2 -= offset;
    else cy2 += offset;

    const path = `M ${fromPos.x} ${fromPos.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${toPos.x} ${toPos.y}`;
    return { path, fromPos, toPos };
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="h-[calc(100vh-73px)] flex">
        {/* Left Sidebar */}
        <div className="w-80 border-r border-border bg-card p-6 overflow-y-auto">
          <div className="mb-6">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              placeholder="My Awesome Project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-2"
            />
          </div>

          <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as TechCategory)}>
            <TabsList className="w-full bg-muted mb-4">
              <TabsTrigger value="frontend" className="flex-1">Frontend</TabsTrigger>
              <TabsTrigger value="backend" className="flex-1">Backend</TabsTrigger>
              <TabsTrigger value="addons" className="flex-1">Add-ons</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            {technologies[activeCategory].map((tech) => {
              const isAdded = canvasTechs.some(ct => ct.tech.id === tech.id);
              return (
                <div
                  key={tech.id}
                  draggable={!isAdded}
                  onDragStart={(e) => handleDragStart(e, tech)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted transition-colors ${
                    !isAdded ? 'cursor-grab active:cursor-grabbing' : 'opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <img src={tech.logo} alt={tech.name} className="w-6 h-6" />
                    <span className="text-sm font-medium text-foreground">{tech.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant={isAdded ? "secondary" : "default"}
                    onClick={() => addTechToCanvas(tech)}
                    disabled={isAdded}
                  >
                    {isAdded ? "Added" : "Add"}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            {canDeploy === false && (
              <div className="mb-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-destructive font-medium">{deployReason || 'Subscription required to deploy'}</p>
                  <Link to="/pricing" className="text-xs text-primary hover:underline">Upgrade Plan</Link>
                </div>
              </div>
            )}
            <Button className="w-full" size="lg" disabled={canDeploy === false}>
              Create Project
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-background p-6 overflow-hidden">
          <div
            ref={canvasRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full h-full rounded-lg border-2 bg-card relative overflow-hidden transition-colors ${
              isDragOver ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            style={{
              backgroundImage: `radial-gradient(circle, var(--border) 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
            }}
          >
            {/* SVG for connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {connections.map((connection, index) => {
                const { path, fromPos, toPos } = getConnectionPath(connection);
                if (!path) return null;

                return (
                  <g key={index}>
                    <motion.path
                      d={path}
                      stroke="var(--accent-orange)"
                      strokeWidth="2.5"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                    <circle cx={fromPos.x} cy={fromPos.y} r="5" fill="var(--accent-orange)" />
                    <circle cx={toPos.x} cy={toPos.y} r="5" fill="var(--accent-orange)" />
                  </g>
                );
              })}

              {/* Drag connection line - follows cursor */}
              {draggingConnection && (() => {
                const fromTech = canvasTechs.find(ct => ct.id === draggingConnection.fromId);
                if (!fromTech) return null;
                // Find nearest port to mouse
                const ports: PortSide[] = ['top', 'right', 'bottom', 'left'];
                let nearestPort: PortSide = 'right';
                let minDist = Infinity;
                for (const p of ports) {
                  const pos = getPortPosition(fromTech, p);
                  const dist = Math.sqrt((pos.x - draggingConnection.mouseX) ** 2 + (pos.y - draggingConnection.mouseY) ** 2);
                  if (dist < minDist) { minDist = dist; nearestPort = p; }
                }
                const fromPos = getPortPosition(fromTech, nearestPort);
                const toX = draggingConnection.mouseX;
                const toY = draggingConnection.mouseY;
                const offset = 50;
                let cx1 = fromPos.x, cy1 = fromPos.y;
                if (nearestPort === 'right') cx1 += offset;
                else if (nearestPort === 'left') cx1 -= offset;
                else if (nearestPort === 'top') cy1 -= offset;
                else cy1 += offset;
                return (
                  <path
                    d={`M ${fromPos.x} ${fromPos.y} C ${cx1} ${cy1}, ${toX} ${toY}, ${toX} ${toY}`}
                    stroke="var(--accent-orange)"
                    strokeWidth="2.5"
                    fill="none"
                    opacity="0.7"
                  />
                );
              })()}
            </svg>

            {/* Tech Cards */}
            {canvasTechs.map((canvasTech) => (
              <motion.div
                key={canvasTech.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  position: 'absolute',
                  left: canvasTech.x,
                  top: canvasTech.y,
                }}
                className="group/card"
                data-tech-id={canvasTech.id}
              >
                {/* Connection ports - 4 sides */}
                {/* Top port */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-primary bg-background cursor-crosshair opacity-0 group-hover/card:opacity-100 transition-opacity hover:scale-125 hover:bg-primary z-10"
                  onMouseDown={(e) => handlePortMouseDown(e, canvasTech.id)}
                />
                {/* Right port */}
                <div
                  className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-primary bg-background cursor-crosshair opacity-0 group-hover/card:opacity-100 transition-opacity hover:scale-125 hover:bg-primary z-10"
                  onMouseDown={(e) => handlePortMouseDown(e, canvasTech.id)}
                />
                {/* Bottom port */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full border-2 border-primary bg-background cursor-crosshair opacity-0 group-hover/card:opacity-100 transition-opacity hover:scale-125 hover:bg-primary z-10"
                  onMouseDown={(e) => handlePortMouseDown(e, canvasTech.id)}
                />
                {/* Left port */}
                <div
                  className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-primary bg-background cursor-crosshair opacity-0 group-hover/card:opacity-100 transition-opacity hover:scale-125 hover:bg-primary z-10"
                  onMouseDown={(e) => handlePortMouseDown(e, canvasTech.id)}
                />

                {/* Show ports always when dragging a connection */}
                {draggingConnection && draggingConnection.fromId !== canvasTech.id && (
                  <>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-primary bg-primary/20 cursor-crosshair animate-pulse z-10" data-tech-id={canvasTech.id} />
                    <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-primary bg-primary/20 cursor-crosshair animate-pulse z-10" data-tech-id={canvasTech.id} />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-5 h-5 rounded-full border-2 border-primary bg-primary/20 cursor-crosshair animate-pulse z-10" data-tech-id={canvasTech.id} />
                    <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-primary bg-primary/20 cursor-crosshair animate-pulse z-10" data-tech-id={canvasTech.id} />
                  </>
                )}

                <Card 
                  className={`w-40 border-2 cursor-grab active:cursor-grabbing transition-all ${
                    selectedForConnection === canvasTech.id 
                      ? 'border-primary ring-2 ring-primary' 
                      : 'border-border hover:border-primary'
                  }`}
                  onMouseDown={(e) => {
                    // Don't drag if clicking on port or X button
                    if ((e.target as HTMLElement).closest('[data-port]') || (e.target as HTMLElement).closest('[data-delete]')) return;
                    e.preventDefault();
                    const canvasRect = canvasRef.current?.getBoundingClientRect();
                    if (!canvasRect) return;
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const origX = canvasTech.x;
                    const origY = canvasTech.y;

                    const onMove = (ev: MouseEvent) => {
                      const dx = ev.clientX - startX;
                      const dy = ev.clientY - startY;
                      setCanvasTechs(prev => prev.map(ct => ct.id === canvasTech.id ? { ...ct, x: Math.max(0, origX + dx), y: Math.max(0, origY + dy) } : ct));
                    };
                    const onUp = () => {
                      document.removeEventListener('mousemove', onMove);
                      document.removeEventListener('mouseup', onUp);
                    };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                  }}
                >
                  <CardContent className="p-4 relative">
                    <button
                      data-delete
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTechFromCanvas(canvasTech.id);
                      }}
                      className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors z-20"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="text-center">
                      <img src={canvasTech.tech.logo} alt={canvasTech.tech.name} className="w-8 h-8 mx-auto mb-2" />
                      <div className="font-semibold text-card-foreground mb-1">
                        {canvasTech.tech.name}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {canvasTech.tech.category}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {canvasTechs.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground text-lg">
                  Drag technologies from the sidebar or click Add to build your project
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
