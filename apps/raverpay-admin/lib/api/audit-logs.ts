import apiClient from '../api-client';
import { AuditLog, PaginatedResponse } from '@/types';

export interface AuditLogStatistics {
  totalCount: number;
  criticalCount: number;
  failedCount: number;
  successCount: number;
  successRate: string;
  today?: number;
  topActions: Array<{
    action: string;
    count: number;
  }>;
  topResources: Array<{
    resource: string;
    count: number;
  }>;
  topAdmins: Array<{
    userId: string | null;
    user: {
      email: string;
      name: string;
      role: string;
    } | null;
    actionCount: number;
  }>;
  bySeverity: Array<{
    severity: string | null;
    count: number;
  }>;
  byActorType: Array<{
    actorType: string | null;
    count: number;
  }>;
  byStatus: Array<{
    status: string | null;
    count: number;
  }>;
}

export const auditLogsApi = {
  getAll: async (params?: Record<string, unknown>): Promise<PaginatedResponse<AuditLog>> => {
    const response = await apiClient.get<PaginatedResponse<AuditLog>>('/admin/audit-logs', {
      params,
    });
    return response.data;
  },

  getStats: async (): Promise<AuditLogStatistics> => {
    const response = await apiClient.get<AuditLogStatistics>('/admin/audit-logs/stats');
    return response.data;
  },

  getUserLogs: async (
    userId: string,
    params?: Record<string, unknown>,
  ): Promise<PaginatedResponse<AuditLog>> => {
    const response = await apiClient.get<PaginatedResponse<AuditLog>>(
      `/admin/audit-logs/user/${userId}`,
      { params },
    );
    return response.data;
  },

  getResourceLogs: async (
    resource: string,
    resourceId: string,
    params?: Record<string, unknown>,
  ): Promise<PaginatedResponse<AuditLog>> => {
    const response = await apiClient.get<PaginatedResponse<AuditLog>>(
      `/admin/audit-logs/resource/${resource}/${resourceId}`,
      { params },
    );
    return response.data;
  },

  getById: async (logId: string): Promise<AuditLog> => {
    const response = await apiClient.get<AuditLog>(`/admin/audit-logs/${logId}`);
    return response.data;
  },

  exportCsv: async (params?: Record<string, unknown>): Promise<Blob> => {
    const response = await apiClient.get('/admin/audit-logs/export/csv', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  exportJson: async (params?: Record<string, unknown>): Promise<Blob> => {
    const response = await apiClient.get('/admin/audit-logs/export/json', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
