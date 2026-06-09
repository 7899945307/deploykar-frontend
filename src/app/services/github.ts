import { ApiResponse, GitHubBranch, GitHubRepo } from '../lib/types';
import { API_BASE_URL, apiClient } from './api-client';

export const githubService = {
  async getOAuthUrl(uiRedirectUri?: string): Promise<string> {
    const params = new URLSearchParams();
    if (uiRedirectUri) params.set('ui_redirect_uri', uiRedirectUri);
    params.set('redirect', 'false');
    const token = localStorage.getItem('deploykar_token');
    const res = await fetch(`${API_BASE_URL}/github/oauth/start?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('[GitHub OAuth] Failed:', res.status, err);
      throw new Error('Failed to get OAuth URL: ' + res.status);
    }
    const data = await res.json();
    console.log('[GitHub OAuth] Response:', data);
    // Backend may return the URL in different fields
    return data.url || data.authorization_url || data.oauth_url || data.redirect_url || (typeof data === 'string' ? data : '');
  },

  async disconnect(): Promise<ApiResponse<void>> {
    try {
      await apiClient.post<unknown>('/github/disconnect');
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  async getRepos(): Promise<ApiResponse<GitHubRepo[]>> {
    try {
      const data = await apiClient.get<GitHubRepo[]>('/github/repos');
      return { success: true, data };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  async getBranches(repoUrl: string): Promise<ApiResponse<GitHubBranch[]>> {
    try {
      const data = await apiClient.get<GitHubBranch[]>('/github/branches', { repo_url: repoUrl });
      return { success: true, data };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },
};
