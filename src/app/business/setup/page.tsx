'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface BusinessSetupData {
  business_name: string;
  business_type: string;
  business_license?: string;
  tax_id?: string;
  description: string;
  contact_email: string;
  contact_phone: string;
}

export default function BusinessSetupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [formData, setFormData] = useState<BusinessSetupData>({
    business_name: '',
    business_type: '',
    business_license: '',
    tax_id: '',
    description: '',
    contact_email: '',
    contact_phone: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleInputChange = (field: keyof BusinessSetupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/business/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '商业功能开通成功！正在跳转到商业仪表板...' });
        setTimeout(() => {
          router.push('/business/dashboard');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.error || '开通失败，请重试' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请重试' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">开通商业功能</h1>
        <p className="text-muted-foreground">
          开启您的商业之旅，发布产品和服务，与客户建立联系
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 左侧：功能说明 */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                商业功能
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">✅ 产品发布</h4>
                <p className="text-sm text-muted-foreground">
                  发布您的产品和服务，设置价格和描述
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">✅ 客户管理</h4>
                <p className="text-sm text-muted-foreground">
                  管理客户信息，跟踪订单和反馈
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">✅ 数据分析</h4>
                <p className="text-sm text-muted-foreground">
                  查看销售数据和客户行为分析
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">✅ 商业助手</h4>
                <p className="text-sm text-muted-foreground">
                  使用 Max 商业助手获得专业建议
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>当前状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>订阅等级:</span>
                  <Badge variant="outline">{user.subscription_level}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>商业功能:</span>
                  <Badge variant={user.has_business_features ? "default" : "secondary"}>
                    {user.has_business_features ? "已开通" : "未开通"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>验证状态:</span>
                  <Badge variant="outline">{user.verification_status || 'none'}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：设置表单 */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>商业信息设置</CardTitle>
              <CardDescription>
                请填写您的商业信息，我们将尽快审核您的申请
              </CardDescription>
            </CardHeader>
            <CardContent>
              {message && (
                <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="business_name">商业名称 *</Label>
                    <Input
                      id="business_name"
                      value={formData.business_name}
                      onChange={(e) => handleInputChange('business_name', e.target.value)}
                      placeholder="输入您的商业名称"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_type">商业类型 *</Label>
                    <Select value={formData.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择商业类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">零售</SelectItem>
                        <SelectItem value="service">服务</SelectItem>
                        <SelectItem value="manufacturing">制造业</SelectItem>
                        <SelectItem value="technology">科技</SelectItem>
                        <SelectItem value="food">餐饮</SelectItem>
                        <SelectItem value="healthcare">医疗健康</SelectItem>
                        <SelectItem value="education">教育</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="business_license">营业执照号</Label>
                    <Input
                      id="business_license"
                      value={formData.business_license}
                      onChange={(e) => handleInputChange('business_license', e.target.value)}
                      placeholder="营业执照号码（可选）"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax_id">税务登记号</Label>
                    <Input
                      id="tax_id"
                      value={formData.tax_id}
                      onChange={(e) => handleInputChange('tax_id', e.target.value)}
                      placeholder="税务登记号（可选）"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">商业描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="请描述您的商业活动、产品或服务..."
                    rows={4}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">联系邮箱 *</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => handleInputChange('contact_email', e.target.value)}
                      placeholder="business@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">联系电话</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                      placeholder="+86 138 0000 0000"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? '提交中...' : '开通商业功能'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    取消
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
