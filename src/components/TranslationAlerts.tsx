import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface TranslationAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  metadata: any;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

export function TranslationAlerts() {
  const [alerts, setAlerts] = useState<TranslationAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    
    // Subscribe to real-time alerts
    const channel = supabase
      .channel('translation-alerts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'translation_alerts',
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('translation_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('translation_alerts')
        .update({ 
          is_resolved: true,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (error) throw error;
      toast.success('Alert resolved');
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityVariant = (severity: string): "default" | "destructive" => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const unresolvedAlerts = alerts.filter(a => !a.is_resolved);
  const resolvedAlerts = alerts.filter(a => a.is_resolved);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Translation Alerts</CardTitle>
          <CardDescription>Loading alerts...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Translation Alerts
          {unresolvedAlerts.length > 0 && (
            <Badge variant="destructive">{unresolvedAlerts.length}</Badge>
          )}
        </CardTitle>
        <CardDescription>
          System alerts for translation budget and failures
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>All Clear</AlertTitle>
            <AlertDescription>No alerts to display</AlertDescription>
          </Alert>
        ) : (
          <>
            {unresolvedAlerts.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Active Alerts</h3>
                {unresolvedAlerts.map((alert) => (
                  <Alert key={alert.id} variant={getSeverityVariant(alert.severity)}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-2">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <AlertTitle className="text-sm">{alert.title}</AlertTitle>
                          <AlertDescription className="text-xs">
                            {alert.message}
                          </AlertDescription>
                          <div className="mt-2 flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              {alert.alert_type.replace(/_/g, ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(alert.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Alert>
                ))}
              </div>
            )}

            {resolvedAlerts.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Resolved Alerts
                </h3>
                {resolvedAlerts.slice(0, 5).map((alert) => (
                  <Alert key={alert.id} className="opacity-60">
                    <div className="flex gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <div className="flex-1">
                        <AlertTitle className="text-sm">{alert.title}</AlertTitle>
                        <AlertDescription className="text-xs">
                          {alert.message}
                        </AlertDescription>
                        <span className="text-xs text-muted-foreground">
                          Resolved {new Date(alert.resolved_at!).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
