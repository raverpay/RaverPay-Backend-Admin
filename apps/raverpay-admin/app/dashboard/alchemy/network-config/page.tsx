'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { alchemyNetworkConfigApi, AlchemyNetworkConfig } from '@/lib/api/alchemy-network-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Trash2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ReAuthModal } from '@/components/security/re-auth-modal';
import { AxiosError } from 'axios';

interface GroupedConfigs {
  [tokenType: string]: {
    [blockchain: string]: AlchemyNetworkConfig[];
  };
}

export default function NetworkConfigPage() {
  const queryClient = useQueryClient();
  const [showDisabled, setShowDisabled] = useState(false);
  const [reAuthModalOpen, setReAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'toggle' | 'delete';
    config: AlchemyNetworkConfig;
  } | null>(null);

  // Fetch all network configurations
  const {
    data,
    isPending: isLoading,
    error,
  } = useQuery({
    queryKey: ['alchemy-network-configs', showDisabled],
    queryFn: () =>
      alchemyNetworkConfigApi.getAllConfigs(showDisabled ? undefined : { isEnabled: true }),
  });

  // Toggle network mutation
  const toggleMutation = useMutation({
    mutationFn: ({
      tokenType,
      blockchain,
      network,
      isEnabled,
      reAuthToken,
    }: {
      tokenType: string;
      blockchain: string;
      network: string;
      isEnabled: boolean;
      reAuthToken?: string;
    }) =>
      alchemyNetworkConfigApi.toggleNetwork(tokenType, blockchain, network, isEnabled, reAuthToken),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['alchemy-network-configs'] });
      toast.success(response.message);
      setPendingAction(null);
    },
    onError: (error: AxiosError<{ statusCode: number; message: string; error: string }>) => {
      if (error.response?.status === 428) {
        // Re-authentication required - show modal
        setReAuthModalOpen(true);
      } else {
        toast.error(`Failed to toggle network: ${error.response?.data?.message || error.message}`);
        setPendingAction(null);
      }
    },
  });

  // Delete network mutation
  const deleteMutation = useMutation({
    mutationFn: ({
      tokenType,
      blockchain,
      network,
      reAuthToken,
    }: {
      tokenType: string;
      blockchain: string;
      network: string;
      reAuthToken?: string;
    }) => alchemyNetworkConfigApi.deleteConfig(tokenType, blockchain, network, reAuthToken),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['alchemy-network-configs'] });
      toast.success(response.message);
      setPendingAction(null);
    },
    onError: (error: AxiosError<{ statusCode: number; message: string; error: string }>) => {
      if (error.response?.status === 428) {
        // Re-authentication required - show modal
        setReAuthModalOpen(true);
      } else {
        toast.error(`Failed to delete network: ${error.response?.data?.message || error.message}`);
        setPendingAction(null);
      }
    },
  });

  const handleToggle = (config: AlchemyNetworkConfig) => {
    setPendingAction({ type: 'toggle', config });
    toggleMutation.mutate({
      tokenType: config.tokenType,
      blockchain: config.blockchain,
      network: config.network,
      isEnabled: !config.isEnabled,
    });
  };

  const handleDelete = (config: AlchemyNetworkConfig) => {
    if (confirm(`Are you sure you want to delete ${config.networkLabel}?`)) {
      setPendingAction({ type: 'delete', config });
      deleteMutation.mutate({
        tokenType: config.tokenType,
        blockchain: config.blockchain,
        network: config.network,
      });
    }
  };

  const handleReAuthSuccess = (reAuthToken: string) => {
    if (!pendingAction) return;

    const { type, config } = pendingAction;

    if (type === 'toggle') {
      toggleMutation.mutate({
        tokenType: config.tokenType,
        blockchain: config.blockchain,
        network: config.network,
        isEnabled: !config.isEnabled,
        reAuthToken,
      });
    } else if (type === 'delete') {
      deleteMutation.mutate({
        tokenType: config.tokenType,
        blockchain: config.blockchain,
        network: config.network,
        reAuthToken,
      });
    }

    setReAuthModalOpen(false);
  };

  // Group configurations by token type and blockchain
  const groupedConfigs: GroupedConfigs = (data?.data || []).reduce(
    (acc: GroupedConfigs, config: AlchemyNetworkConfig) => {
      if (!acc[config.tokenType]) {
        acc[config.tokenType] = {};
      }
      if (!acc[config.tokenType][config.blockchain]) {
        acc[config.tokenType][config.blockchain] = [];
      }
      acc[config.tokenType][config.blockchain].push(config);
      return acc;
    },
    {} as GroupedConfigs,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load network configurations:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Network Configuration</h1>
          <p className="text-muted-foreground">
            Manage stablecoin networks. Enable or disable networks without code deployments.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="show-disabled" className="text-sm font-medium">
              Show Disabled
            </label>
            <Switch id="show-disabled" checked={showDisabled} onCheckedChange={setShowDisabled} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedConfigs).map(([tokenType, blockchains]) => (
          <Card key={tokenType}>
            <CardHeader>
              <CardTitle>{tokenType}</CardTitle>
              <CardDescription>
                {data?.data.find((c: AlchemyNetworkConfig) => c.tokenType === tokenType)?.tokenName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(blockchains).map(([blockchain, networks]) => (
                <div key={blockchain} className="space-y-2">
                  <h3 className="font-semibold text-sm">{networks[0].blockchainName}</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {networks
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((config) => (
                        <div
                          key={config.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{config.networkLabel}</span>
                              {config.isTestnet && <Badge variant="outline">Testnet</Badge>}
                              <Badge variant={config.isEnabled ? 'default' : 'secondary'}>
                                {config.isEnabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {config.tokenAddress || 'No address'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Decimals: {config.decimals} | Order: {config.displayOrder}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={config.isEnabled}
                              onCheckedChange={() => handleToggle(config)}
                              disabled={toggleMutation.isPending}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(config)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {data?.data.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No configurations found</AlertTitle>
          <AlertDescription>
            {showDisabled
              ? 'No network configurations available.'
              : 'No enabled network configurations. Toggle "Show Disabled" to see all configurations.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Re-Authentication Modal */}
      <ReAuthModal
        open={reAuthModalOpen}
        onOpenChange={(open) => {
          setReAuthModalOpen(open);
          if (!open) {
            setPendingAction(null);
          }
        }}
        onSuccess={handleReAuthSuccess}
        title="Re-authentication Required"
        description={`Please authenticate to ${pendingAction?.type === 'toggle' ? 'toggle' : 'delete'} this network configuration`}
      />
    </div>
  );
}
