import {
  ApiResponse,
  CreateProjectRequest,
  EnvVarEntry,
  EnvVarResponse,
  ProjectResponse,
  SetEnvVarsRequest,
  SetProjectGitHubRequest,
  StackOverviewResponse,
} from '../lib/types';
import { apiClient } from './api-client';

export const projectsService = {
  async getStack(): Promise<ApiResponse<StackOverviewResponse>> {
    try {
      const data = await apiClient.get<StackOverviewResponse>('/stack');
      return { success: true, data };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  async create(data: CreateProjectRequest): Promise<ApiResponse<ProjectResponse>> {
    try {
      const created = await apiClient.post<ProjectResponse>('/projects', data);
      return { success: true, data: created };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  async setGitHub(projectId: string, data: SetProjectGitHubRequest): Promise<ApiResponse<void>> {
    try {
      await apiClient.post<unknown>(`/projects/${projectId}/github`, data);
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  async setEnvVars(projectId: string, envVars: EnvVarEntry[]): Promise<ApiResponse<EnvVarResponse[]>> {
    const payload: SetEnvVarsRequest = { env_vars: envVars };
    try {
      const updated = await apiClient.post<EnvVarResponse[]>(`/projects/${projectId}/env-vars`, payload);
      return { success: true, data: updated };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  async getEnvVars(projectId: string): Promise<ApiResponse<EnvVarResponse[]>> {
    try {
      const data = await apiClient.get<EnvVarResponse[]>(`/projects/${projectId}/env-vars`);
      return { success: true, data };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  async enableAutoDeploy(projectId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.post<unknown>(`/projects/${projectId}/auto-deploy/enable`, {});
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  async disableAutoDeploy(projectId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.post<unknown>(`/projects/${projectId}/auto-deploy/disable`);
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  async deleteProject(projectId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const data = await apiClient.delete<{ message: string }>(`/projects/${projectId}`);
      return { success: true, data };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },
};
