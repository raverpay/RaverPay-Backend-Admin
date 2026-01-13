'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Shield, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AxiosError } from 'axios';

const mfaCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only numbers'),
});

type MfaCodeFormData = z.infer<typeof mfaCodeSchema>;

interface MfaVerifyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (code: string) => void;
  title?: string;
  description?: string;
}

export function MfaVerifyModal({
  open,
  onOpenChange,
  onSuccess,
  title = 'MFA Verification Required',
  description = 'Enter your 6-digit code from your authenticator app to continue',
}: MfaVerifyModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MfaCodeFormData>({
    resolver: zodResolver(mfaCodeSchema),
  });

  const verifyMfaMutation = useMutation({
    mutationFn: async (code: string) => {
      // For now, we'll verify the code format and call onSuccess
      // In a real implementation, you might want to verify with backend
      // For sensitive operations, we can create a temporary verification token
      return { success: true, code };
    },
    onSuccess: (data) => {
      reset();
      onOpenChange(false);
      onSuccess(data.code);
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message || 'Invalid MFA code';
      toast.error('Verification Failed', {
        description: errorMessage,
      });
    },
  });

  const onSubmit = (data: MfaCodeFormData) => {
    verifyMfaMutation.mutate(data.code);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This operation requires MFA verification for security purposes.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="mfa-code">6-Digit Code</Label>
            <Input
              id="mfa-code"
              placeholder="000000"
              maxLength={6}
              {...register('code')}
              disabled={verifyMfaMutation.isPending}
              autoFocus
              className="text-center text-2xl tracking-widest font-mono"
            />
            {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
            <p className="text-xs text-muted-foreground">
              Enter the code from your authenticator app
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={verifyMfaMutation.isPending} className="flex-1">
              {verifyMfaMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
