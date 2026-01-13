'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Shield, Copy, Check, Eye, EyeOff, Download } from 'lucide-react';

import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const verifyCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only numbers'),
});

type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;

export default function MfaSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCode: string;
    manualEntryKey: string;
    backupCodes: string[];
  } | null>(null);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyCodeFormData>({
    resolver: zodResolver(verifyCodeSchema),
  });

  // Fetch MFA status to check if already enabled
  const { data: mfaStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['mfa-status'],
    queryFn: authApi.getMfaStatus,
  });

  // Setup MFA mutation
  const setupMfaMutation = useMutation({
    mutationFn: authApi.setupMfa,
    onSuccess: (data) => {
      setSetupData(data);
      setStep('verify');
      toast.success('MFA setup initiated', {
        description: 'Scan the QR code with your authenticator app',
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Failed to setup MFA';
      toast.error('Setup Failed', {
        description: errorMessage,
      });
    },
  });

  // Verify MFA setup mutation
  const verifyMfaMutation = useMutation({
    mutationFn: authApi.verifyMfaSetup,
    onSuccess: () => {
      toast.success('MFA Enabled', {
        description: 'Multi-factor authentication has been enabled successfully',
      });
      router.push('/dashboard/settings/security');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Invalid verification code';
      toast.error('Verification Failed', {
        description: errorMessage,
      });
    },
  });

  const handleSetup = () => {
    setupMfaMutation.mutate();
  };

  const onSubmit = (data: VerifyCodeFormData) => {
    verifyMfaMutation.mutate(data.code);
  };

  const copySecret = () => {
    if (setupData?.manualEntryKey) {
      navigator.clipboard.writeText(setupData.manualEntryKey);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
      toast.success('Secret copied to clipboard');
    }
  };

  const copyBackupCodes = () => {
    if (setupData?.backupCodes) {
      navigator.clipboard.writeText(setupData.backupCodes.join('\n'));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
      toast.success('Backup codes copied to clipboard');
    }
  };

  const downloadBackupCodes = () => {
    if (!setupData?.backupCodes || setupData.backupCodes.length === 0) return;

    const content = `RaverPay Admin Dashboard - Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\nIMPORTANT: Save these codes in a secure location. Each code can only be used once.\n\n${setupData.backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}\n\nIf you lose access to your authenticator app, you can use these backup codes to log in.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raverpay-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Backup codes downloaded', {
      description: 'Save the file in a secure location',
    });
  };

  // If MFA is already enabled, redirect to settings
  if (mfaStatus?.mfaEnabled) {
    router.push('/dashboard/settings/security');
    return null;
  }

  if (isLoadingStatus) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Setup Multi-Factor Authentication</h2>
        <p className="text-muted-foreground">
          Add an extra layer of security to your admin account
        </p>
      </div>

      {step === 'setup' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              MFA Setup
            </CardTitle>
            <CardDescription>
              Click the button below to generate your MFA secret and QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription>
                You&apos;ll need an authenticator app like Google Authenticator, Authy, or 1Password
                to complete this setup.
              </AlertDescription>
            </Alert>

            <Button onClick={handleSetup} disabled={setupMfaMutation.isPending} className="w-full">
              {setupMfaMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate MFA Secret'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'verify' && setupData && (
        <div className="space-y-6">
          {/* QR Code Card */}
          <Card>
            <CardHeader>
              <CardTitle>Scan QR Code</CardTitle>
              <CardDescription>Scan this QR code with your authenticator app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center p-4 bg-background rounded-lg border-2 border-dashed">
                <Image
                  src={setupData.qrCode}
                  alt="MFA QR Code"
                  width={256}
                  height={256}
                  unoptimized
                />
              </div>

              {/* Manual Entry */}
              <div className="space-y-2">
                <Label>Manual Entry Key</Label>
                <div className="flex gap-2">
                  <Input value={setupData.manualEntryKey} readOnly className="font-mono text-sm" />
                  <Button type="button" variant="outline" size="icon" onClick={copySecret}>
                    {copiedSecret ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  If you can&apos;t scan the QR code, enter this key manually in your authenticator
                  app
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Verification Card */}
          <Card>
            <CardHeader>
              <CardTitle>Verify Setup</CardTitle>
              <CardDescription>
                Enter the 6-digit code from your authenticator app to complete setup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-2xl tracking-widest font-mono"
                    {...register('code')}
                    disabled={verifyMfaMutation.isPending}
                  />
                  {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={verifyMfaMutation.isPending}>
                  {verifyMfaMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify and Enable MFA'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Backup Codes Card */}
          <Card>
            <CardHeader>
              <CardTitle>Backup Codes</CardTitle>
              <CardDescription>
                Save these codes in a safe place. You&apos;ll need them if you lose access to your
                authenticator app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Important:</strong> These codes are only shown once. Make sure to save
                  them securely.
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBackupCodes(!showBackupCodes)}
                >
                  {showBackupCodes ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Hide Codes
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Show Codes
                    </>
                  )}
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={copyBackupCodes}>
                    {copiedCodes ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy All
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={downloadBackupCodes}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              {showBackupCodes && (
                <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
                  {setupData.backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="font-mono text-sm p-2 bg-background rounded border text-center"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
