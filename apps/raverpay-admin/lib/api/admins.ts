import apiClient from '../api-client';
import { User, PaginatedResponse, UserRole } from '@/types';

export interface CreateAdminDto {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  role: UserRole;
  initialIpAddress?: string;
  skipIpWhitelist?: boolean;
  personalEmail?: string;
  sendCredentials?: boolean;
  sendMfaSetup?: boolean;
}

export interface UpdateAdminDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  ipAddresses?: string[];
  mfaEnabled?: boolean;
  twoFactorEnabled?: boolean;
}

export interface IpWhitelistEntry {
  id: string;
  ipAddress: string;
  description: string | null;
  userId: string | null;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminStatistics {
  total: number;
  byRole: Record<string, number>;
  active: number;
}

export const adminsApi = {
  getAll: async (params?: Record<string, unknown>): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>('/admin/admins', {
      params,
    });
    return response.data;
  },

  getById: async (adminId: string): Promise<User> => {
    const response = await apiClient.get<User>(`/admin/admins/${adminId}`);
    return response.data;
  },

  create: async (data: CreateAdminDto): Promise<User> => {
    const response = await apiClient.post<User>('/admin/admins', data);
    return response.data;
  },

  update: async (adminId: string, data: UpdateAdminDto): Promise<User> => {
    const response = await apiClient.patch<User>(`/admin/admins/${adminId}`, data);
    return response.data;
  },

  delete: async (adminId: string): Promise<void> => {
    await apiClient.delete(`/admin/admins/${adminId}`);
  },

  getStats: async (): Promise<AdminStatistics> => {
    const response = await apiClient.get<AdminStatistics>('/admin/admins/stats');
    return response.data;
  },

  getIpWhitelist: async (userId: string): Promise<IpWhitelistEntry[]> => {
    const response = await apiClient.get<{ data: IpWhitelistEntry[] }>(
      '/admin/security/ip-whitelist',
      {
        params: { userId, limit: 100 },
      },
    );
    return response.data.data;
  },
};
