'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import Link from 'next/link';
import {
  Search,
  Eye,
  Activity,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { auditLogsApi } from '@/lib/api/audit-logs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

// Severity colors
const severityColors: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

// Actor type colors
const actorTypeColors: Record<string, string> = {
  USER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  SYSTEM: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
  SERVICE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
};

// Status icons and colors
const statusConfig: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  success: { icon: CheckCircle, color: 'text-green-600' },
  failure: { icon: XCircle, color: 'text-red-600' },
  pending: { icon: Clock, color: 'text-yellow-600' },
  partial_success: { icon: AlertCircle, color: 'text-orange-600' },
};

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  LOGIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  LOGOUT: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
  APPROVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
  REJECT: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
};

const resourceTypes = [
  'USER',
  'TRANSACTION',
  'WALLET',
  'KYC',
  'VTU_ORDER',
  'GIFTCARD_ORDER',
  'CRYPTO_ORDER',
  'VIRTUAL_ACCOUNT',
  'NOTIFICATION',
  'DELETION_REQUEST',
  'SUPPORT',
  'WEBHOOK',
  'CIRCLE',
];

const actionTypes = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'APPROVE',
  'REJECT',
  'REFUND',
  'REVERSE',
];

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300, 2);
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [actorTypeFilter, setActorTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  const { data: logsData, isPending: isLoading } = useQuery({
    queryKey: [
      'audit-logs',
      page,
      debouncedSearch,
      resourceFilter,
      actionFilter,
      severityFilter,
      actorTypeFilter,
      statusFilter,
    ],
    queryFn: () =>
      auditLogsApi.getAll({
        page,
        limit: 20,
        ...(debouncedSearch && { action: debouncedSearch }),
        ...(resourceFilter !== 'all' && { resource: resourceFilter }),
        ...(actionFilter !== 'all' && { action: actionFilter }),
        ...(severityFilter !== 'all' && { severity: severityFilter }),
        ...(actorTypeFilter !== 'all' && { actorType: actorTypeFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ['audit-logs-stats'],
    queryFn: () => auditLogsApi.getStats(),
  });

  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    try {
      const params = {
        ...(resourceFilter !== 'all' && { resource: resourceFilter }),
        ...(actionFilter !== 'all' && { action: actionFilter }),
        ...(severityFilter !== 'all' && { severity: severityFilter }),
        ...(actorTypeFilter !== 'all' && { actorType: actorTypeFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      };

      const blob =
        format === 'csv'
          ? await auditLogsApi.exportCsv(params)
          : await auditLogsApi.exportJson(params);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Audit logs exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export audit logs');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground">Track all system activities and changes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('json')} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCount?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critical Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.criticalCount?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.failedCount?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.successRate || '0%'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Actions & Resources */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2">
          {stats.topActions && stats.topActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.topActions.slice(0, 5).map((item: { action: string; count: number }) => (
                    <div key={item.action} className="flex items-center justify-between py-2">
                      <Badge className={actionColors[item.action] || 'bg-gray-600'}>
                        {item.action}
                      </Badge>
                      <span className="font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {stats.byResource && stats.byResource.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.byResource.slice(0, 5).map((item) => (
                    <div key={item.resource} className="flex items-center justify-between py-2">
                      <span className="text-sm">{item.resource}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Audit Logs</CardTitle>
          <CardDescription>Browse and search through audit trail</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by user or resource ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                {resourceTypes.map((resource) => (
                  <SelectItem key={resource} value={resource}>
                    {resource}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actionTypes.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={actorTypeFilter} onValueChange={setActorTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Actor Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actor Types</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SYSTEM">System</SelectItem>
                <SelectItem value="SERVICE">Service</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILURE">Failure</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : logsData?.data && logsData.data.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Actor Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead className="text-right">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsData.data.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge className={actionColors[log.action] || 'bg-gray-500'}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{log.resource}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {log.resourceId?.slice(0, 8)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.user ? (
                            <div>
                              <p className="text-sm">
                                {log.user.firstName} {log.user.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{log.user.email}</p>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">System</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {log.actorType && (
                            <Badge className={actorTypeColors[log.actorType] || 'bg-gray-500'}>
                              {log.actorType}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {log.severity && (
                            <Badge className={severityColors[log.severity] || 'bg-gray-500'}>
                              {log.severity}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {log.status && (
                            <div className="flex items-center gap-2">
                              {(() => {
                                const StatusIcon = statusConfig[log.status.toLowerCase()]?.icon || Clock;
                                const color = statusConfig[log.status.toLowerCase()]?.color || 'text-gray-600';
                                return <StatusIcon className={`h-4 w-4 ${color}`} />;
                              })()}
                              <span className="text-sm capitalize">{log.status.toLowerCase()}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-mono">{log.ipAddress || '-'}</span>
                        </TableCell>
                        <TableCell>{formatDate(log.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/audit/${log.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {logsData.meta && (
                <Pagination
                  currentPage={page}
                  totalPages={logsData.meta.totalPages}
                  totalItems={logsData.meta.total}
                  itemsPerPage={logsData.meta.limit}
                  onPageChange={setPage}
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No audit logs found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
