import { ApiResponse, DeployRequest, DeployResponse, DeploymentResponse } from '../lib/types';
import { apiClient } from './api-client';

export const deploymentsService = {
  async deploy(payload: DeployRequest): Promise<ApiResponse<DeployResponse>> {
    try {
      const data = await apiClient.post<DeployResponse>('/deploy', payload);
      return { success: true, data };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  async getProjectDeployments(projectId: string): Promise<ApiResponse<DeploymentResponse[]>> {
    try {
      const data = await apiClient.get<DeploymentResponse[]>(`/projects/${projectId}/deployments`);
      return { success: true, data };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  async getAllDeployments(): Promise<ApiResponse<DeploymentResponse[]>> {
    try {
      const data = await apiClient.get<DeploymentResponse[]>('/deployments');
      return { success: true, data };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  async deleteDeployment(deploymentId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const data = await apiClient.delete<{ message: string }>(`/deployments/${deploymentId}`);
      return { success: true, data };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },
};
