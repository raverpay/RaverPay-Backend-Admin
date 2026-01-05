'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Clock, Globe, FileCode } from 'lucide-react';

import { auditLogsApi } from '@/lib/api/audit-logs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  LOGIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  LOGOUT: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
  APPROVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
  REJECT: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
};

export default function AuditLogDetailPage({ params }: { params: Promise<{ logId: string }> }) {
  const { logId } = use(params);
  const router = useRouter();

  const { data: log, isLoading } = useQuery({
    queryKey: ['audit-log', logId],
    queryFn: () => auditLogsApi.getById(logId),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!log) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Audit log not found</p>
        <Button variant="link" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/audit">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Audit Log Detail</h2>
            <p className="text-muted-foreground font-mono text-sm">{log.id}</p>
          </div>
        </div>
        <Badge className={actionColors[log.action] || 'bg-gray-100'}>{log.action}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Action Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              Action Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Action</p>
              <Badge className={actionColors[log.action] || 'bg-gray-500'}>{log.action}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resource Type</p>
              <p className="text-lg">{log.resource}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resource ID</p>
              <p className="text-sm font-mono bg-muted p-2 rounded">{log.resourceId}</p>
            </div>
            {log.severity && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Severity</p>
                <Badge className={severityColors[log.severity] || 'bg-gray-500'}>
                  {log.severity}
                </Badge>
              </div>
            )}
            {log.status && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge
                  className={
                    log.status === 'SUCCESS'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                      : log.status === 'FAILURE'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                  }
                >
                  {log.status}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Performed By
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {log.actorType && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Actor Type</p>
                <Badge className={actorTypeColors[log.actorType] || 'bg-gray-500'}>
                  {log.actorType}
                </Badge>
              </div>
            )}
            {log.user ? (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-lg">
                    {log.user.firstName} {log.user.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{log.user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User ID</p>
                  <p className="text-sm font-mono">{log.userId}</p>
                </div>
                <Link href={`/dashboard/users/${log.userId}`}>
                  <Button variant="outline" className="w-full mt-2">
                    View User Profile
                  </Button>
                </Link>
              </>
            ) : (
              <p className="text-muted-foreground">System Action</p>
            )}
          </CardContent>
        </Card>

        {/* Request Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Request Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">IP Address</p>
              <p className="text-lg font-mono">{log.ipAddress || 'N/A'}</p>
            </div>
            {log.location && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-sm">{log.location}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">User Agent</p>
              <p className="text-sm text-muted-foreground break-all">{log.userAgent || 'N/A'}</p>
            </div>
            {log.errorMessage && (
              <div>
                <p className="text-sm font-medium text-muted-foreground text-red-600">Error</p>
                <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 p-2 rounded">
                  {log.errorMessage}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timestamp */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timestamp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created At</p>
              <p className="text-lg">{formatDate(log.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        {/* State Changes Comparison */}
        {(log.beforeState || log.afterState) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>State Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {log.beforeState && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Before</p>
                    <pre className="text-sm bg-red-50 dark:bg-red-950 p-4 rounded-lg overflow-auto max-h-64 border border-red-200 dark:border-red-800">
                      {JSON.stringify(log.beforeState, null, 2)}
                    </pre>
                  </div>
                )}
                {log.afterState && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">After</p>
                    <pre className="text-sm bg-green-50 dark:bg-green-950 p-4 rounded-lg overflow-auto max-h-64 border border-green-200 dark:border-green-800">
                      {JSON.stringify(log.afterState, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Changes */}
        {log.changes && Object.keys(log.changes).length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-64">
                {JSON.stringify(log.changes, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        {log.metadata && Object.keys(log.metadata).length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Additional Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-64">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
