import { Node, Edge } from 'reactflow';

export type ProjectType = 'FRONTEND' | 'BACKEND' | 'ADDON';

export type DeploymentStatus =
  | 'PENDING'
  | 'QUEUED'
  | 'DEPLOYING'
  | 'ACTIVE'
  | 'FAILED'
  | 'ROLLBACK';

export interface FrontendFramework {
  id: string;
  name: string;
  icon: string;
  color: string;
  buildCommand: string;
  outputDir: string;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  html_url: string;
  description?: string | null;
  default_branch: string;
  private: boolean;
  language?: string | null;
}

export interface GitHubBranch {
  name: string;
}

export interface EnvVarEntry {
  key: string;
  value: string;
  is_secret?: boolean;
}

export interface EnvVarResponse {
  id: string;
  key: string;
  is_secret: boolean;
  created_at?: string | null;
}

export interface BuildSettings {
  buildCommand: string;
  outputDirectory: string;
  installCommand: string;
  nodeVersion: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  type: ProjectType;
  framework: FrontendFramework;
  github_repo_url?: string | null;
  github_repo_name?: string | null;
  github_branch?: string | null;
  autoDeployEnabled: boolean;
  buildSettings: BuildSettings;
  envVars: EnvVarEntry[];
  status: DeploymentStatus;
  deploymentUrl?: string;
  lastDeployedAt?: string;
  createdAt?: string | null;
}

export interface ProjectNode extends Node {
  data: {
    project: Project;
  };
}

export interface ProjectEdge extends Edge {
  animated?: boolean;
}

export interface HistoryState {
  nodes: ProjectNode[];
  edges: ProjectEdge[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateProjectRequest {
  type: ProjectType;
  name?: string | null;
  github_repo_url?: string | null;
  github_repo_name?: string | null;
  github_branch?: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  slug: string;
  type: ProjectType;
  github_repo_url?: string | null;
  github_repo_name?: string | null;
  github_branch?: string | null;
  created_at?: string | null;
}

export interface SetProjectGitHubRequest {
  github_repo_url: string;
  github_branch?: string | null;
}

export interface SetEnvVarsRequest {
  env_vars: EnvVarEntry[];
}

export interface StackProjectSummary {
  id: string;
  name: string;
  slug: string;
  type: ProjectType;
  github_repo_url?: string | null;
  latest_deployment_status?: Exclude<DeploymentStatus, 'PENDING'> | null;
  deployment_url?: string | null;
}

export interface StackOverviewResponse {
  projects: StackProjectSummary[];
  total_deployments: number;
}

export interface DeployRequest {
  project_id?: string | null;
  project_type?: ProjectType | null;
  project_name?: string | null;
  github_repo_url?: string | null;
  github_branch?: string | null;
  env_vars?: EnvVarEntry[] | null;
  build_command?: string | null;
  output_dir?: string | null;
  auto_deploy_enabled?: boolean | null;
  auto_deploy_branch?: string | null;
}

export interface DeployResponse {
  deployment_id: string;
  project_id: string;
  status: Exclude<DeploymentStatus, 'PENDING'>;
  message: string;
}

export interface DeploymentResponse {
  id: string;
  project_id: string;
  status: Exclude<DeploymentStatus, 'PENDING'>;
  deployment_url?: string | null;
  deployed_at?: string | null;
  created_at?: string | null;
  github_commit_sha?: string | null;
  deployment_version?: string | null;
}
