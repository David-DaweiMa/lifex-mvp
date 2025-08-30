'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Zap
} from 'lucide-react';
import { useAuth } from '@/lib/authService';
import { QUOTA_CONFIG } from '@/lib/quotaConfig';

interface QuotaData {
  products: {
    daily: { current: number; limit: number };
    monthly: { current: number; limit: number };
    total: { current: number; limit: number };
  };
  coly: {
    hourly: { current: number; limit: number };
  };
  max: {
    hourly: { current: number; limit: number };
  };
  trending: {
    monthly: { current: number; limit: number };
  };
}

export default function QuotaDisplay() {
  const { user } = useAuth();
  const [quotaData, setQuotaData] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotaData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/business/quota');
      if (!response.ok) {
        throw new Error('获取配额数据失败');
      }

      const data = await response.json();
      setQuotaData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotaData();
  }, [user]);

  const getQuotaPercentage = (current: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getQuotaStatus = (current: number, limit: number) => {
    const percentage = getQuotaPercentage(current, limit);
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'warning';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (!user) return null;

  const userQuota = QUOTA_CONFIG[user.subscription_level] || QUOTA_CONFIG.free;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            配额使用情况
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">加载中...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>配额使用情况</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="link" 
                className="p-0 h-auto font-normal"
                onClick={fetchQuotaData}
              >
                重试
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 产品发布配额 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            产品发布配额
          </CardTitle>
          <CardDescription>
            您的产品发布限制和使用情况
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {quotaData && (
            <>
              {/* 每日配额 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">每日发布</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {quotaData.products.daily.current} / {quotaData.products.daily.limit}
                    </span>
                    {getStatusIcon(getQuotaStatus(quotaData.products.daily.current, quotaData.products.daily.limit))}
                  </div>
                </div>
                <Progress 
                  value={getQuotaPercentage(quotaData.products.daily.current, quotaData.products.daily.limit)} 
                  className="h-2"
                />
              </div>

              {/* 每月配额 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">每月发布</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {quotaData.products.monthly.current} / {quotaData.products.monthly.limit}
                    </span>
                    {getStatusIcon(getQuotaStatus(quotaData.products.monthly.current, quotaData.products.monthly.limit))}
                  </div>
                </div>
                <Progress 
                  value={getQuotaPercentage(quotaData.products.monthly.current, quotaData.products.monthly.limit)} 
                  className="h-2"
                />
              </div>

              {/* 总配额 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">总发布数量</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {quotaData.products.total.current} / {quotaData.products.total.limit}
                    </span>
                    {getStatusIcon(getQuotaStatus(quotaData.products.total.current, quotaData.products.total.limit))}
                  </div>
                </div>
                <Progress 
                  value={getQuotaPercentage(quotaData.products.total.current, quotaData.products.total.limit)} 
                  className="h-2"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* AI 助手配额 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI 助手配额
          </CardTitle>
          <CardDescription>
            Coly 和 Max 助手的使用限制
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Coly 助手 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Coly 助手</span>
                <Badge variant="outline" className="text-xs">
                  {userQuota.coly.hourly > 0 ? '可用' : '不可用'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {quotaData?.coly.hourly.current || 0} / {userQuota.coly.hourly}
                </span>
                <Zap className="h-4 w-4 text-yellow-500" />
              </div>
            </div>
            {userQuota.coly.hourly > 0 ? (
              <Progress 
                value={getQuotaPercentage(quotaData?.coly.hourly.current || 0, userQuota.coly.hourly)} 
                className="h-2"
              />
            ) : (
              <div className="text-sm text-muted-foreground">
                需要 Essential 或 Premium 订阅
              </div>
            )}
          </div>

          {/* Max 助手 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Max 助手</span>
                <Badge variant="outline" className="text-xs">
                  {userQuota.max.hourly > 0 ? '可用' : '不可用'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {quotaData?.max.hourly.current || 0} / {userQuota.max.hourly}
                </span>
                <Zap className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            {userQuota.max.hourly > 0 ? (
              <Progress 
                value={getQuotaPercentage(quotaData?.max.hourly.current || 0, userQuota.max.hourly)} 
                className="h-2"
              />
            ) : (
              <div className="text-sm text-muted-foreground">
                需要 Premium 订阅
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 趋势功能配额 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            趋势功能配额
          </CardTitle>
          <CardDescription>
            产品推广和趋势功能使用限制
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">每月趋势推广</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {quotaData?.trending.monthly.current || 0} / {userQuota.trending.monthly}
              </span>
              {getStatusIcon(getQuotaStatus(quotaData?.trending.monthly.current || 0, userQuota.trending.monthly))}
            </div>
          </div>
          <Progress 
            value={getQuotaPercentage(quotaData?.trending.monthly.current || 0, userQuota.trending.monthly)} 
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* 刷新按钮 */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchQuotaData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新数据
        </Button>
      </div>
    </div>
  );
}
