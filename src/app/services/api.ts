const API_BASE_URL = '';

export interface UserRegisterRequest {
  name: string;
  email: string;
  password: string;
  plan: 'INDIVIDUAL' | 'TEAM';
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  is_verified: boolean;
  plan: 'INDIVIDUAL' | 'TEAM';
  created_at: string | null;
  message: string | null;
}

export interface TeamRegisterRequest {
  team_name: string;
  owner_name: string;
  owner_email: string;
  owner_password: string;
}

export interface TeamResponse {
  team_id: string;
  team_name: string;
  slug: string;
  owner_user_id: string;
  owner_email: string;
  message: string | null;
}

export interface ApiError {
  detail: { loc: (string | number)[]; msg: string; type: string }[];
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { headers: customHeaders, ...restOptions } = options;
  const mergedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string> || {}),
  };
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restOptions,
    headers: mergedHeaders,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: [{ msg: 'Something went wrong' }] }));
    throw error;
  }

  return res.json();
}

export interface TeamInviteRequest {
  invitations: { email: string; role: string }[];
}

export interface TeamInviteResponse {
  invited: string[];
  already_member: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export const api = {
  registerUser(data: UserRegisterRequest): Promise<UserResponse> {
    return request<UserResponse>('/api/v1/register/user', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  registerTeam(data: TeamRegisterRequest): Promise<TeamResponse> {
    return request<TeamResponse>('/api/v1/register/team', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login(data: LoginRequest): Promise<LoginResponse> {
    return request<LoginResponse>('/api/v1/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  inviteTeamMembers(data: TeamInviteRequest, token: string): Promise<TeamInviteResponse> {
    return fetch(`${API_BASE_URL}/api/v1/team/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }).then(async (res) => {
      if (!res.ok) throw await res.json().catch(() => ({ detail: [{ msg: 'Something went wrong' }] }));
      return res.json();
    });
  },

  verifyEmail(token: string): Promise<unknown> {
    return request<unknown>(`/api/v1/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'GET',
    });
  },

  resendVerification(email: string): Promise<unknown> {
    return request<unknown>(`/api/v1/resend-verification?email=${encodeURIComponent(email)}`, {
      method: 'POST',
    });
  },

  acceptInvitation(data: { token: string; name: string; password: string }): Promise<unknown> {
    return request<unknown>('/api/v1/accept-invitation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getProfile(token: string): Promise<unknown> {
    return request<unknown>('/api/v1/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getDashboard(token: string): Promise<unknown> {
    return request<unknown>('/api/v1/dashboard', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getTeamMembers(token: string): Promise<unknown> {
    return request<unknown>('/api/v1/team/members', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  removeMember(token: string, teamSlug: string, email: string): Promise<unknown> {
    return fetch(`${API_BASE_URL}/api/v1/team/members`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ team_slug: teamSlug, email }),
    }).then(async (res) => {
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    });
  },

  revokeInvitation(token: string, email: string): Promise<unknown> {
    return fetch(`${API_BASE_URL}/api/v1/team/invite`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    }).then(async (res) => {
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    });
  },

  editInvitation(token: string, data: { email: string; role?: string; new_email?: string }): Promise<unknown> {
    return fetch(`${API_BASE_URL}/api/v1/team/invite`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }).then(async (res) => {
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    });
  },

  updateMember(token: string, data: { team_slug: string; email: string; name?: string; role?: string }): Promise<unknown> {
    return fetch(`${API_BASE_URL}/api/v1/team/members`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }).then(async (res) => {
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    });
  },

  subscribe(token: string, billingCycle: string): Promise<unknown> {
    return fetch(`${API_BASE_URL}/api/v1/billing/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ billing_cycle: billingCycle }),
    }).then(async (res) => {
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    });
  },

  getBillingStatus(token: string): Promise<unknown> {
    return fetch(`${API_BASE_URL}/api/v1/billing/status`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(async (res) => {
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    });
  },

  cancelSubscription(token: string): Promise<unknown> {
    return fetch(`${API_BASE_URL}/api/v1/billing/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(async (res) => {
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    });
  },

  checkDeployAccess(token: string): Promise<unknown> {
    return fetch(`${API_BASE_URL}/api/v1/deploy/access`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(async (res) => {
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    });
  },

  getPricing(): Promise<unknown> {
    return request<unknown>('/api/v1/pricing', { method: 'GET' });
  },

  createTeam(token: string, teamName: string): Promise<unknown> {
    return fetch(`${API_BASE_URL}/api/v1/team/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ team_name: teamName }),
    }).then(async (res) => {
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    });
  },

  listTeams(token: string): Promise<unknown> {
    return fetch(`${API_BASE_URL}/api/v1/teams`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(async (res) => {
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    });
  },

  deleteTeam(token: string, teamSlug: string): Promise<unknown> {
    return fetch(`${API_BASE_URL}/api/v1/team`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ team_slug: teamSlug }),
    }).then(async (res) => {
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    });
  },

  refreshToken(refreshToken: string): Promise<LoginResponse> {
    return request<LoginResponse>('/api/v1/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },
};
