import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminAuditLogsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(
    page: number = 1,
    limit: number = 50,
    action?: string,
    resource?: string,
    userId?: string,
    resourceId?: string,
    severity?: string,
    actorType?: string,
    status?: string,
    ipAddress?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (resource) where.resource = { contains: resource, mode: 'insensitive' };
    if (userId) where.userId = userId;
    if (resourceId) where.resourceId = resourceId;
    if (severity) where.severity = severity as any;
    if (actorType) where.actorType = actorType as any;
    if (status) where.status = status as any;
    if (ipAddress)
      where.ipAddress = { contains: ipAddress, mode: 'insensitive' };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get audit log by ID
   */
  async getAuditLogById(logId: string) {
    return await this.prisma.auditLog.findUnique({
      where: { id: logId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Get audit log statistics
   */
  async getStats(startDate?: string, endDate?: string) {
    const where: Prisma.AuditLogWhereInput = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [
      totalCount,
      byAction,
      byResource,
      byUser,
      bySeverity,
      byActorType,
      byStatus,
      criticalCount,
      failedCount,
      successCount,
    ] = await Promise.all([
      this.prisma.auditLog.count({ where }),

      this.prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: true,
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),

      this.prisma.auditLog.groupBy({
        by: ['resource'],
        where,
        _count: true,
        orderBy: { _count: { resource: 'desc' } },
        take: 10,
      }),

      this.prisma.auditLog.groupBy({
        by: ['userId'],
        where,
        _count: true,
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),

      // New: Group by severity
      this.prisma.auditLog.groupBy({
        by: ['severity'],
        where,
        _count: true,
      }),

      // New: Group by actor type
      this.prisma.auditLog.groupBy({
        by: ['actorType'],
        where,
        _count: true,
      }),

      // New: Group by status
      this.prisma.auditLog.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),

      // Critical logs count
      this.prisma.auditLog.count({
        where: { ...where, severity: 'CRITICAL' },
      }),

      // Failed operations count
      this.prisma.auditLog.count({
        where: { ...where, status: 'FAILURE' },
      }),

      // Success operations count
      this.prisma.auditLog.count({
        where: { ...where, status: 'SUCCESS' },
      }),
    ]);

    // Get user details for top admins
    const userIds = byUser
      .map((item) => item.userId)
      .filter((id): id is string => id !== null);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    const topAdmins = byUser.map((item) => {
      const user = users.find((u) => u.id === item.userId);
      return {
        userId: item.userId,
        user: user
          ? {
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              role: user.role,
            }
          : null,
        actionCount: item._count,
      };
    });

    // Calculate success rate
    const successRate =
      totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(2) : '0';

    return {
      totalCount,
      criticalCount,
      failedCount,
      successCount,
      successRate: `${successRate}%`,
      topActions: byAction.map((item) => ({
        action: item.action,
        count: item._count,
      })),
      topResources: byResource.map((item) => ({
        resource: item.resource,
        count: item._count,
      })),
      topAdmins,
      bySeverity: bySeverity.map((item) => ({
        severity: item.severity,
        count: item._count,
      })),
      byActorType: byActorType.map((item) => ({
        actorType: item.actorType,
        count: item._count,
      })),
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
    };
  }

  /**
   * Get user activity logs
   */
  async getUserActivity(userId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { userId } }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get resource audit trail
   */
  async getResourceAuditTrail(
    resource: string,
    resourceId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: {
          resource,
          resourceId,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' }, // Show chronological order for audit trail
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({
        where: {
          resource,
          resourceId,
        },
      }),
    ]);

    return {
      resource,
      resourceId,
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Export audit logs as CSV
   */
  async exportCsv(
    action?: string,
    resource?: string,
    userId?: string,
    severity?: string,
    actorType?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<string> {
    const where: Prisma.AuditLogWhereInput = {};

    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (resource) where.resource = { contains: resource, mode: 'insensitive' };
    if (userId) where.userId = userId;
    if (severity) where.severity = severity as any;
    if (actorType) where.actorType = actorType as any;
    if (status) where.status = status as any;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10000, // Limit to 10k records for performance
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // CSV header
    const headers = [
      'ID',
      'Action',
      'Resource',
      'Resource ID',
      'User ID',
      'User Email',
      'User Name',
      'Actor Type',
      'Severity',
      'Status',
      'IP Address',
      'User Agent',
      'Location',
      'Error Message',
      'Created At',
    ];

    // CSV rows
    const rows = logs.map((log) => [
      log.id,
      log.action,
      log.resource || '',
      log.resourceId || '',
      log.userId || '',
      log.user?.email || '',
      log.user ? `${log.user.firstName} ${log.user.lastName}` : '',
      log.actorType || '',
      log.severity || '',
      log.status || '',
      log.ipAddress || '',
      log.userAgent || '',
      log.location || '',
      log.errorMessage || '',
      log.createdAt.toISOString(),
    ]);

    // Build CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\\n');

    return csvContent;
  }

  /**
   * Export audit logs as JSON
   */
  async exportJson(
    action?: string,
    resource?: string,
    userId?: string,
    severity?: string,
    actorType?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: Prisma.AuditLogWhereInput = {};

    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (resource) where.resource = { contains: resource, mode: 'insensitive' };
    if (userId) where.userId = userId;
    if (severity) where.severity = severity as any;
    if (actorType) where.actorType = actorType as any;
    if (status) where.status = status as any;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10000, // Limit to 10k records for performance
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return {
      exportedAt: new Date().toISOString(),
      totalRecords: logs.length,
      filters: {
        action,
        resource,
        userId,
        severity,
        actorType,
        status,
        startDate,
        endDate,
      },
      logs,
    };
  }
}
