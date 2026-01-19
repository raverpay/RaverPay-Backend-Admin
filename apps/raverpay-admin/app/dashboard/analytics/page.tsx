'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Users, Wallet, DollarSign } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

import { analyticsApi } from '@/lib/api/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

export default function AnalyticsPage() {
  const [revenueGroupBy, setRevenueGroupBy] = useState('day');
  const [dateRange, setDateRange] = useState('7d');

  const getDateParams = () => {
    const endDate = new Date();
    const startDate = new Date();
    switch (dateRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  };

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => analyticsApi.getDashboard(),
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['analytics-revenue', revenueGroupBy, dateRange],
    queryFn: () =>
      analyticsApi.getRevenue({
        groupBy: revenueGroupBy,
        ...getDateParams(),
      }),
  });

  const { data: userGrowthData, isLoading: userGrowthLoading } = useQuery({
    queryKey: ['analytics-user-growth', dateRange],
    queryFn: () => analyticsApi.getUserGrowth(getDateParams()),
  });

  const { data: transactionTrendsData, isLoading: transactionTrendsLoading } = useQuery({
    queryKey: ['analytics-transaction-trends', dateRange],
    queryFn: () => analyticsApi.getTransactionTrends(getDateParams()),
  });

  // Chart color palettes - using oklch colors from CSS variables
  const CHART_COLORS = [
    'oklch(0.646 0.222 41.116)', // chart-1
    'oklch(0.6 0.118 184.704)', // chart-2
    'oklch(0.398 0.07 227.392)', // chart-3
    'oklch(0.828 0.189 84.429)', // chart-4
    'oklch(0.769 0.188 70.08)', // chart-5
  ];

  const STATUS_COLORS: Record<string, string> = {
    COMPLETED: 'oklch(0.646 0.222 41.116)', // green
    PENDING: 'oklch(0.828 0.189 84.429)', // yellow
    PROCESSING: 'oklch(0.6 0.118 184.704)', // blue
    FAILED: 'oklch(0.398 0.07 227.392)', // red
    CANCELLED: 'oklch(0.5 0 0)', // gray
    REVERSED: 'oklch(0.5 0.1 0)', // dark red
  };

  // Prepare revenue time-series data
  const revenueTimeSeriesData = useMemo(() => {
    if (!revenueData?.timeSeries) return [];
    return revenueData.timeSeries.map((item) => {
      let formattedDate: string;
      if (revenueGroupBy === 'month') {
        // Handle YYYY-MM format
        const [year, month] = item.date.split('-');
        formattedDate = format(new Date(parseInt(year), parseInt(month) - 1, 1), 'MMM yyyy');
      } else {
        formattedDate = format(new Date(item.date), 'MMM dd');
      }
      return {
        date: formattedDate,
        revenue: Number(item.revenue),
        count: item.count,
      };
    });
  }, [revenueData, revenueGroupBy]);

  // Prepare revenue by type data
  const revenueByTypeData = useMemo(() => {
    if (!revenueData?.byType) return [];
    return revenueData.byType.map((item) => ({
      name: item.type.replace(/_/g, ' '),
      revenue: Number(item.revenue),
      count: item.count,
    }));
  }, [revenueData]);

  // Prepare user growth time-series data
  const userGrowthTimeSeriesData = useMemo(() => {
    if (!userGrowthData?.timeSeries) return [];
    return userGrowthData.timeSeries.map((item) => ({
      date: format(new Date(item.date), 'MMM dd'),
      count: item.count,
    }));
  }, [userGrowthData]);

  // Prepare user growth by KYC tier data
  const userGrowthByKYCTierData = useMemo(() => {
    if (!userGrowthData?.byKYCTier) return [];
    return userGrowthData.byKYCTier.map((item) => ({
      name: item.tier.replace(/_/g, ' '),
      value: item.count,
    }));
  }, [userGrowthData]);

  // Prepare user growth by status data
  const userGrowthByStatusData = useMemo(() => {
    if (!userGrowthData?.byStatus) return [];
    return userGrowthData.byStatus.map((item) => ({
      name: item.status.replace(/_/g, ' '),
      value: item.count,
    }));
  }, [userGrowthData]);

  // Prepare transaction trends time-series data
  const transactionTrendsTimeSeriesData = useMemo(() => {
    if (!transactionTrendsData?.timeSeries) return [];
    return transactionTrendsData.timeSeries.map((item) => ({
      date: format(new Date(item.date), 'MMM dd'),
      volume: Number(item.volume),
      count: item.count,
      successRate: item.count > 0 ? ((item.successCount / item.count) * 100).toFixed(1) : '0',
    }));
  }, [transactionTrendsData]);

  // Prepare transaction trends by status data
  const transactionTrendsByStatusData = useMemo(() => {
    if (!transactionTrendsData?.byStatus) return [];
    return transactionTrendsData.byStatus.map((item) => ({
      name: item.status.replace(/_/g, ' '),
      value: item.count,
    }));
  }, [transactionTrendsData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">Platform analytics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {dashboardData?.users?.total?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData?.users?.active?.toLocaleString() || 0} active
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(dashboardData?.wallets?.totalBalance || '0')}
                </div>
                <p className="text-xs text-muted-foreground">Across all wallets</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {dashboardData?.transactions?.today?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">Transactions today</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(dashboardData?.revenue?.today || '0')}
                </div>
                <p className="text-xs text-muted-foreground">Revenue today</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Revenue breakdown by transaction type</CardDescription>
            </div>
            <Select value={revenueGroupBy} onValueChange={setRevenueGroupBy}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(revenueData?.totalRevenue || '0')}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-3xl font-bold">
                    {revenueData?.totalTransactions?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              {/* Revenue Time-Series Chart */}
              {revenueTimeSeriesData.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-4">Revenue Over Time</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueTimeSeriesData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="oklch(0.646 0.222 41.116)"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="oklch(0.646 0.222 41.116)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" tick={{ fill: 'currentColor' }} />
                      <YAxis
                        className="text-xs"
                        tick={{ fill: 'currentColor' }}
                        tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                        }}
                        formatter={(value: number | undefined) =>
                          formatCurrency(String(value ?? 0))
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="oklch(0.646 0.222 41.116)"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Revenue by Type Bar Chart */}
              {revenueByTypeData.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-4">Revenue by Transaction Type</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueByTypeData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="name"
                        className="text-xs"
                        tick={{ fill: 'currentColor' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        className="text-xs"
                        tick={{ fill: 'currentColor' }}
                        tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                        }}
                        formatter={(value: number | undefined) =>
                          formatCurrency(String(value ?? 0))
                        }
                      />
                      <Bar
                        dataKey="revenue"
                        fill="oklch(0.646 0.222 41.116)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New user registrations and KYC breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {userGrowthLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">New Users</p>
                  <p className="text-3xl font-bold">
                    {userGrowthData?.newUsers?.toLocaleString() || 0}
                  </p>
                </div>

                {/* User Growth Time-Series Chart */}
                {userGrowthTimeSeriesData.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">New Users Over Time</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={userGrowthTimeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" tick={{ fill: 'currentColor' }} />
                        <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="oklch(0.646 0.222 41.116)"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* User Growth by KYC Tier Pie Chart */}
                {userGrowthByKYCTierData.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">By KYC Tier</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={userGrowthByKYCTierData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {userGrowthByKYCTierData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* User Growth by Status Pie Chart */}
                {userGrowthByStatusData.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">By Status</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={userGrowthByStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {userGrowthByStatusData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Trends</CardTitle>
            <CardDescription>Transaction volume and success rate</CardDescription>
          </CardHeader>
          <CardContent>
            {transactionTrendsLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Total Volume</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(transactionTrendsData?.totalVolume || '0')}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {transactionTrendsData?.successRate || '0'}%
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Total Count</p>
                  <p className="text-2xl font-bold">
                    {transactionTrendsData?.totalCount?.toLocaleString() || 0}
                  </p>
                </div>

                {/* Transaction Trends Time-Series Chart */}
                {transactionTrendsTimeSeriesData.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Transaction Volume Over Time</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={transactionTrendsTimeSeriesData}>
                        <defs>
                          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                            <stop
                              offset="5%"
                              stopColor="oklch(0.646 0.222 41.116)"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="oklch(0.646 0.222 41.116)"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" tick={{ fill: 'currentColor' }} />
                        <YAxis
                          className="text-xs"
                          tick={{ fill: 'currentColor' }}
                          tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                          }}
                          formatter={(value: number | undefined) =>
                            formatCurrency(String(value ?? 0))
                          }
                        />
                        <Area
                          type="monotone"
                          dataKey="volume"
                          stroke="oklch(0.646 0.222 41.116)"
                          fillOpacity={1}
                          fill="url(#colorVolume)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Transaction Trends by Status Pie Chart */}
                {transactionTrendsByStatusData.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">By Status</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={transactionTrendsByStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {transactionTrendsByStatusData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                STATUS_COLORS[entry.name.replace(/\s/g, '_')] ||
                                CHART_COLORS[index % CHART_COLORS.length]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Items */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Items</CardTitle>
          <CardDescription>Items requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-900">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">Pending KYC</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {dashboardData?.pending?.kyc || 0}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900">
                <p className="text-sm text-red-800 dark:text-red-200">Failed Transactions</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {dashboardData?.pending?.failedTransactions || 0}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-900">
                <p className="text-sm text-orange-800 dark:text-orange-200">Deletion Requests</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {dashboardData?.pending?.deletionRequests || 0}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
