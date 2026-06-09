import { create } from 'zustand';
import {
  CreateProjectRequest,
  DeployRequest,
  DeployResponse,
  Project,
  ProjectNode,
  ProjectEdge,
  HistoryState,
  FrontendFramework,
  BuildSettings,
  DeploymentStatus,
  EnvVarEntry,
  StackProjectSummary,
} from './types';
import { Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from 'reactflow';
import { projectsService } from '../services/projects';
import { deploymentsService } from '../services/deployments';
import { frontendFrameworks } from './frameworks';

const pollTimers = new Map<string, ReturnType<typeof setTimeout>>();
let autoDeployPollTimer: ReturnType<typeof setInterval> | null = null;

interface DeploymentStore {
  nodes: ProjectNode[];
  edges: ProjectEdge[];
  history: HistoryState[];
  historyIndex: number;
  selectedNodeId: string | null;
  searchQuery: string;
  activeDeploymentLog: { deploymentId: string; projectName: string } | null;

  setNodes: (nodes: ProjectNode[]) => void;
  setEdges: (edges: ProjectEdge[]) => void;
  setSearchQuery: (query: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addProjectToCanvas: (
    framework: FrontendFramework,
    position: { x: number; y: number }
  ) => Project;
  addProject: (
    framework: FrontendFramework,
    position: { x: number; y: number },
    config: { name: string; github_repo_url: string; github_repo_name?: string | null; github_branch: string }
  ) => Promise<Project>;
  updateProject: (projectId: string, data: Partial<Project>) => void;
  replaceProjectNode: (tempId: string, project: Project) => void;
  getProject: (projectId: string) => Project | undefined;

  deployProject: (projectId: string) => Promise<DeployResponse | undefined>;
  redeployProject: (projectId: string) => Promise<DeployResponse | undefined>;
  updateProjectStatus: (projectId: string, status: DeploymentStatus, url?: string) => void;

  toggleAutoDeploy: (projectId: string) => void;
  setProjectEnvVars: (projectId: string, envVars: EnvVarEntry[]) => Promise<boolean>;
  setProjectBuildSettings: (projectId: string, buildSettings: BuildSettings) => void;
  deleteDeployment: (projectId: string) => Promise<boolean>;

  selectNode: (nodeId: string | null) => void;

  loadStack: () => Promise<void>;
  startAutoDeployWatcher: () => void;
  stopAutoDeployWatcher: () => void;

  setActiveDeploymentLog: (deploymentId: string, projectName: string) => void;
  clearActiveDeploymentLog: () => void;

  addToHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  saveToLocal: (name: string) => void;
  loadFromLocal: () => { name: string; data: HistoryState; updatedAt: string }[] | null;
  clearCanvas: () => void;
  exportJSON: () => string;
  importJSON: (json: string) => boolean;
}

const MAX_HISTORY = 50;

export const useDeploymentStore = create<DeploymentStore>((set, get) => ({
  nodes: [],
  edges: [],
  history: [{ nodes: [], edges: [] }],
  historyIndex: 0,
  selectedNodeId: null,
  searchQuery: '',
  activeDeploymentLog: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as ProjectNode[] });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) as ProjectEdge[] });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(
        { ...connection, type: 'smoothstep', animated: true, style: { stroke: '#f97316', strokeWidth: 2 } },
        get().edges
      ) as ProjectEdge[],
    });
    get().addToHistory();
  },

  addProjectToCanvas: (framework, position) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const project: Project = {
      id: tempId,
      name: framework.name,
      slug: framework.id,
      type: 'FRONTEND',
      framework,
      github_repo_url: null,
      github_repo_name: null,
      github_branch: null,
      autoDeployEnabled: false,
      buildSettings: {
        buildCommand: framework.buildCommand,
        outputDirectory: framework.outputDir,
        installCommand: 'npm install',
        nodeVersion: '18.x',
      },
      envVars: [],
      status: 'PENDING',
      deploymentUrl: undefined,
      lastDeployedAt: undefined,
      createdAt: new Date().toISOString(),
    };

    const newNode: ProjectNode = {
      id: project.id,
      type: 'projectNode',
      position,
      data: { project },
    };

    set({ nodes: [...get().nodes, newNode] });
    get().addToHistory();
    return project;
  },

  addProject: async (framework, position, config) => {
    const payload: CreateProjectRequest = {
      type: 'FRONTEND',
      name: config.name,
      github_repo_url: config.github_repo_url,
      github_repo_name: config.github_repo_name ?? null,
      github_branch: config.github_branch,
    };

    const response = await projectsService.create(payload);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create project');
    }

    const created = response.data;
    const project: Project = {
      id: created.id,
      name: created.name,
      slug: created.slug,
      type: created.type,
      framework,
      github_repo_url: created.github_repo_url ?? config.github_repo_url,
      github_repo_name: created.github_repo_name ?? config.github_repo_name ?? null,
      github_branch: created.github_branch ?? config.github_branch,
      autoDeployEnabled: false,
      buildSettings: {
        buildCommand: framework.buildCommand,
        outputDirectory: framework.outputDir,
        installCommand: 'npm install',
        nodeVersion: '18.x',
      },
      envVars: [],
      status: 'PENDING',
      deploymentUrl: undefined,
      lastDeployedAt: undefined,
      createdAt: created.created_at ?? null,
    };

    const newNode: ProjectNode = {
      id: project.id,
      type: 'projectNode',
      position,
      data: { project },
    };

    set({ nodes: [...get().nodes, newNode] });
    get().addToHistory();
    return project;
  },

  updateProject: (projectId, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === projectId
          ? { ...node, data: { ...node.data, project: { ...node.data.project, ...data } } }
          : node
      ),
    });
  },

  replaceProjectNode: (tempId, project) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === tempId
          ? { ...node, id: project.id, data: { project } }
          : node
      ),
    });
  },

  getProject: (projectId) => {
    const node = get().nodes.find((n) => n.id === projectId);
    return node?.data.project;
  },

  deployProject: async (projectId) => {
    const project = get().getProject(projectId);
    if (!project) return undefined;

    const payload: DeployRequest = {
      project_id: project.id,
      project_type: project.type,
      project_name: project.name,
      github_repo_url: project.github_repo_url ?? null,
      github_branch: project.github_branch ?? null,
      env_vars: project.envVars.length ? project.envVars : null,
      build_command: project.buildSettings.buildCommand,
      output_dir: project.buildSettings.outputDirectory,
      auto_deploy_enabled: project.autoDeployEnabled,
      auto_deploy_branch: null,
    };

    get().updateProjectStatus(projectId, 'QUEUED');

    const response = await deploymentsService.deploy(payload);
    if (response.success && response.data) {
      get().updateProjectStatus(projectId, response.data.status);

      // Open the deployment logs panel
      get().setActiveDeploymentLog(String(response.data.deployment_id), project.name);

      const existing = pollTimers.get(projectId);
      if (existing) clearTimeout(existing);

      const poll = async (attempt: number) => {
        if (attempt > 80) return;
        const deployments = await deploymentsService.getProjectDeployments(projectId);
        if (deployments.success && deployments.data?.length) {
          const latest = deployments.data[0];
          get().updateProjectStatus(projectId, latest.status, latest.deployment_url ?? undefined);
          if (latest.status === 'ACTIVE' || latest.status === 'FAILED' || latest.status === 'ROLLBACK') {
            return;
          }
        }
        const t = setTimeout(() => poll(attempt + 1), 2500);
        pollTimers.set(projectId, t);
      };

      const t = setTimeout(() => poll(0), 2500);
      pollTimers.set(projectId, t);
      return response.data;
    }

    get().updateProjectStatus(projectId, 'FAILED');
    return undefined;
  },

  redeployProject: async (projectId) => {
    return get().deployProject(projectId);
  },

  updateProjectStatus: (projectId, status, url) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === projectId
          ? {
              ...node,
              data: {
                ...node.data,
                project: {
                  ...node.data.project,
                  status,
                  deploymentUrl: url || node.data.project.deploymentUrl,
                  lastDeployedAt: status === 'ACTIVE' ? new Date().toISOString() : node.data.project.lastDeployedAt,
                },
              },
            }
          : node
      ),
    });
  },

  toggleAutoDeploy: (projectId) => {
    const project = get().getProject(projectId);
    if (!project) return;
    const newState = !project.autoDeployEnabled;
    if (newState) {
      projectsService.enableAutoDeploy(projectId);
    } else {
      projectsService.disableAutoDeploy(projectId);
    }
    set({
      nodes: get().nodes.map((node) =>
        node.id === projectId
          ? { ...node, data: { ...node.data, project: { ...node.data.project, autoDeployEnabled: newState } } }
          : node
      ),
    });
  },

  deleteDeployment: async (projectId) => {
    const project = get().getProject(projectId);
    if (!project) return false;

    // Delete the project from the backend (which cascades deployments etc.)
    const resp = await projectsService.deleteProject(projectId);
    if (!resp.success) return false;

    // Clear deployment logs if showing for this project
    const activeLog = get().activeDeploymentLog;
    if (activeLog) {
      get().clearActiveDeploymentLog();
    }

    // Remove the project node from the canvas
    set({
      nodes: get().nodes.filter((node) => node.id !== projectId),
      edges: get().edges.filter((edge) => (edge as any).source !== projectId && (edge as any).target !== projectId),
    });
    get().addToHistory();

    return true;
  },

  setProjectEnvVars: async (projectId, envVars) => {
    const response = await projectsService.setEnvVars(projectId, envVars);
    if (!response.success) return false;
    set({
      nodes: get().nodes.map((node) =>
        node.id === projectId
          ? { ...node, data: { ...node.data, project: { ...node.data.project, envVars } } }
          : node
      ),
    });
    return true;
  },

  setProjectBuildSettings: (projectId, buildSettings) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === projectId
          ? { ...node, data: { ...node.data, project: { ...node.data.project, buildSettings } } }
          : node
      ),
    });
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  setActiveDeploymentLog: (deploymentId, projectName) => set({ activeDeploymentLog: { deploymentId, projectName } }),
  clearActiveDeploymentLog: () => set({ activeDeploymentLog: null }),

  loadStack: async () => {
    const response = await projectsService.getStack();
    if (!response.success || !response.data) return;

    const { projects } = response.data;
    if (!projects.length) return;

    const defaultFramework: FrontendFramework = frontendFrameworks[0];

    const newNodes: ProjectNode[] = projects.map((p: StackProjectSummary, index: number) => {
      const cols = Math.ceil(Math.sqrt(projects.length));
      const row = Math.floor(index / cols);
      const col = index % cols;

      const framework = frontendFrameworks.find(
        (f) => f.id === p.slug || f.name.toLowerCase() === p.name.toLowerCase()
      ) || defaultFramework;

      const project: Project = {
        id: p.id,
        name: p.name,
        slug: p.slug,
        type: p.type,
        framework,
        github_repo_url: p.github_repo_url ?? null,
        github_repo_name: null,
        github_branch: null,
        autoDeployEnabled: false,
        buildSettings: {
          buildCommand: framework.buildCommand,
          outputDirectory: framework.outputDir,
          installCommand: 'npm install',
          nodeVersion: '18.x',
        },
        envVars: [],
        status: p.latest_deployment_status ?? 'PENDING',
        deploymentUrl: p.deployment_url ?? undefined,
        lastDeployedAt: undefined,
        createdAt: null,
      };

      return {
        id: p.id,
        type: 'projectNode',
        position: { x: col * 380 + 100, y: row * 320 + 100 },
        data: { project },
      } as ProjectNode;
    });

    set({ nodes: newNodes });
    get().startAutoDeployWatcher();
  },

  startAutoDeployWatcher: () => {
    if (autoDeployPollTimer) return; // already running

    autoDeployPollTimer = setInterval(async () => {
      const { nodes, activeDeploymentLog } = get();
      // Don't poll if we're already showing logs (a deploy is in progress)
      if (activeDeploymentLog) return;

      const autoDeployProjects = nodes.filter(
        (n) => n.data.project.autoDeployEnabled && n.data.project.status !== 'DEPLOYING' && n.data.project.status !== 'QUEUED'
      );

      for (const node of autoDeployProjects) {
        const resp = await deploymentsService.getProjectDeployments(node.id);
        if (!resp.success || !resp.data?.length) continue;

        const latest = resp.data[0];
        if (latest.status === 'QUEUED' || latest.status === 'DEPLOYING') {
          // A new auto-deploy was triggered! Update status and show logs
          get().updateProjectStatus(node.id, latest.status, latest.deployment_url ?? undefined);
          get().setActiveDeploymentLog(String(latest.id), node.data.project.name);

          // Start polling for this deployment's progress
          const existing = pollTimers.get(node.id);
          if (existing) clearTimeout(existing);

          const poll = async (attempt: number) => {
            if (attempt > 80) return;
            const deployments = await deploymentsService.getProjectDeployments(node.id);
            if (deployments.success && deployments.data?.length) {
              const current = deployments.data[0];
              get().updateProjectStatus(node.id, current.status, current.deployment_url ?? undefined);
              if (current.status === 'ACTIVE' || current.status === 'FAILED' || current.status === 'ROLLBACK') {
                return;
              }
            }
            const t = setTimeout(() => poll(attempt + 1), 2500);
            pollTimers.set(node.id, t);
          };

          const t = setTimeout(() => poll(0), 2500);
          pollTimers.set(node.id, t);
          break; // Only handle one at a time
        }
      }
    }, 5000); // Check every 5 seconds
  },

  stopAutoDeployWatcher: () => {
    if (autoDeployPollTimer) {
      clearInterval(autoDeployPollTimer);
      autoDeployPollTimer = null;
    }
  },

  addToHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      set({ nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)), historyIndex: newIndex });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      set({ nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)), historyIndex: newIndex });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  saveToLocal: (name) => {
    const { nodes, edges } = get();
    const saves = JSON.parse(localStorage.getItem('deployment-saves') || '[]');
    const existingIndex = saves.findIndex((s: { name: string }) => s.name === name);
    const saveData = { name, data: { nodes, edges }, updatedAt: new Date().toISOString() };
    if (existingIndex >= 0) {
      saves[existingIndex] = saveData;
    } else {
      saves.push(saveData);
    }
    localStorage.setItem('deployment-saves', JSON.stringify(saves));
  },

  loadFromLocal: () => {
    const saves = localStorage.getItem('deployment-saves');
    return saves ? JSON.parse(saves) : null;
  },

  clearCanvas: () => {
    set({ nodes: [], edges: [], selectedNodeId: null });
    get().addToHistory();
  },

  exportJSON: () => {
    const { nodes, edges } = get();
    return JSON.stringify({ nodes, edges }, null, 2);
  },

  importJSON: (json) => {
    try {
      const data = JSON.parse(json);
      if (data.nodes && data.edges) {
        set({ nodes: data.nodes, edges: data.edges });
        get().addToHistory();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));
