'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Monitor, Loader2, Trash2, AlertCircle, MapPin, Globe, Clock } from 'lucide-react';

import { authApi, type Session } from '@/lib/api/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatDate } from '@/lib/utils';
import { AxiosError } from 'axios';

export default function SessionsPage() {
  const queryClient = useQueryClient();
  const [revokeSession, setRevokeSession] = useState<Session | null>(null);
  const [revokeAllConfirm, setRevokeAllConfirm] = useState(false);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: authApi.getSessions,
  });

  const revokeSessionMutation = useMutation({
    mutationFn: authApi.revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setRevokeSession(null);
      toast.success('Session Revoked', {
        description: 'The session has been revoked successfully',
      });
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message || 'Failed to revoke session';
      toast.error('Revoke Failed', {
        description: errorMessage,
      });
    },
  });

  const revokeAllMutation = useMutation({
    mutationFn: authApi.revokeAllSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setRevokeAllConfirm(false);
      toast.success('All Sessions Revoked', {
        description: 'All other sessions have been revoked successfully',
      });
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message || 'Failed to revoke sessions';
      toast.error('Revoke Failed', {
        description: errorMessage,
      });
    },
  });

  const handleRevokeSession = (sessionId: string) => {
    revokeSessionMutation.mutate(sessionId);
  };

  const handleRevokeAll = () => {
    revokeAllMutation.mutate();
  };

  // Get current session (most recent)
  const currentSession = sessions?.[0];
  const otherSessions = sessions?.slice(1) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Active Sessions</h2>
          <p className="text-muted-foreground">
            Manage your active sessions and devices with access to your account
          </p>
        </div>
        {otherSessions.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => setRevokeAllConfirm(true)}
            disabled={revokeAllMutation.isPending}
          >
            {revokeAllMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Revoking...
              </>
            ) : (
              'Revoke All Other Sessions'
            )}
          </Button>
        )}
      </div>

      {/* Current Session Card */}
      {currentSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Current Session
            </CardTitle>
            <CardDescription>This is your current active session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Device ID</p>
                <p className="font-mono text-sm">{currentSession.deviceId || 'Unknown'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                <p className="font-mono text-sm">{currentSession.ipAddress || 'Unknown'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-sm flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {currentSession.location || 'Unknown'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Last Used</p>
                <p className="text-sm flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(currentSession.lastUsedAt)}
                </p>
              </div>
              {currentSession.userAgent && (
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">User Agent</p>
                  <p className="text-sm break-all">{currentSession.userAgent}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Other Active Sessions</CardTitle>
          <CardDescription>
            {otherSessions.length} other active session(s). Revoke any suspicious sessions
            immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : otherSessions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device ID</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>User Agent</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-mono text-sm">
                        {session.deviceId || 'Unknown'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {session.ipAddress || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          {session.location || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {session.userAgent || '-'}
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(session.lastUsedAt)}</TableCell>
                      <TableCell className="text-sm">{formatDate(session.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setRevokeSession(session)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Monitor className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No other active sessions</p>
              <p className="text-sm text-muted-foreground mt-1">
                You only have one active session (current session)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revoke Session Confirmation */}
      <ConfirmDialog
        open={!!revokeSession}
        onOpenChange={(open) => !open && setRevokeSession(null)}
        title="Revoke Session"
        description={`Are you sure you want to revoke this session? The device will be logged out immediately.`}
        confirmText="Revoke Session"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (revokeSession) {
            handleRevokeSession(revokeSession.id);
          }
        }}
        isLoading={revokeSessionMutation.isPending}
      >
        {revokeSession && (
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Device ID:</span>{' '}
              <span className="font-mono">{revokeSession.deviceId || 'Unknown'}</span>
            </div>
            <div>
              <span className="font-medium">IP Address:</span>{' '}
              <span className="font-mono">{revokeSession.ipAddress || 'Unknown'}</span>
            </div>
            <div>
              <span className="font-medium">Location:</span> {revokeSession.location || 'Unknown'}
            </div>
          </div>
        )}
      </ConfirmDialog>

      {/* Revoke All Confirmation */}
      <ConfirmDialog
        open={revokeAllConfirm}
        onOpenChange={setRevokeAllConfirm}
        title="Revoke All Other Sessions"
        description={`Are you sure you want to revoke all other active sessions? This will log out all other devices immediately.`}
        confirmText="Revoke All"
        cancelText="Cancel"
        variant="danger"
        icon="delete"
        onConfirm={handleRevokeAll}
        isLoading={revokeAllMutation.isPending}
      >
        <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Warning</p>
            <p className="text-muted-foreground">
              This will immediately log out {otherSessions.length} other device(s). Make sure you
              have access to your authenticator app if MFA is enabled.
            </p>
          </div>
        </div>
      </ConfirmDialog>
    </div>
  );
}
