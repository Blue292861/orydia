import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  TrendingUp,
  DollarSign,
  FileText,
  Languages
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TranslationJob {
  id: string;
  book_id: string;
  status: string;
  total_chapters: number;
  completed_chapters: number;
  failed_chapters: number;
  target_languages: string[];
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  books: {
    title: string;
    author: string;
  };
}

interface TranslationMetric {
  status: string;
  count: number;
  avg_duration_ms: number;
  total_tokens: number;
  total_cost_usd: number;
}

export const TranslationDashboard: React.FC = () => {
  // Fetch active and recent jobs
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['translation-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translation_jobs')
        .select(`
          *,
          books:book_id (
            title,
            author
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as TranslationJob[];
    },
    refetchInterval: 5000,
  });

  // Fetch aggregated metrics from chapter_translations
  const { data: metrics } = useQuery({
    queryKey: ['translation-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chapter_translations')
        .select('status, updated_at, created_at, translated_content');

      if (error) {
        console.error('Error fetching metrics:', error);
        return {
          success: { status: 'success', count: 0, avg_duration_ms: 0, total_tokens: 0, total_cost_usd: 0 },
          failed: { status: 'failed', count: 0, avg_duration_ms: 0, total_tokens: 0, total_cost_usd: 0 },
        };
      }

      const aggregated: Record<string, TranslationMetric> = {
        success: { status: 'completed', count: 0, avg_duration_ms: 0, total_tokens: 0, total_cost_usd: 0 },
        failed: { status: 'failed', count: 0, avg_duration_ms: 0, total_tokens: 0, total_cost_usd: 0 },
      };

      data?.forEach((metric: any) => {
        const status = metric.status === 'completed' ? 'success' : 'failed';
        if (!aggregated[status]) return;

        aggregated[status].count++;
        
        // Calculate duration from timestamps
        const created = new Date(metric.created_at).getTime();
        const updated = new Date(metric.updated_at).getTime();
        aggregated[status].avg_duration_ms += (updated - created);
        
        // Extract metrics from metadata if available
        const metadata = metric.translated_content?.metadata;
        if (metadata) {
          aggregated[status].total_tokens += metadata.tokens_used || 0;
          aggregated[status].total_cost_usd += parseFloat(metadata.cost_usd || 0);
        }
      });

      // Calculate averages
      Object.values(aggregated).forEach(metric => {
        if (metric.count > 0) {
          metric.avg_duration_ms = Math.round(metric.avg_duration_ms / metric.count);
        }
      });

      return aggregated;
    },
    refetchInterval: 10000,
  });

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: 'secondary' as const, icon: Clock, label: 'En attente' },
      processing: { variant: 'default' as const, icon: Loader2, label: 'En cours' },
      completed: { variant: 'default' as const, icon: CheckCircle2, label: 'Terminé' },
      failed: { variant: 'destructive' as const, icon: XCircle, label: 'Échoué' },
    };

    const { variant, icon: Icon, label } = config[status as keyof typeof config] || config.pending;

    return (
      <Badge variant={variant} className="gap-1">
        <Icon className={`h-3 w-3 ${status === 'processing' ? 'animate-spin' : ''}`} />
        {label}
      </Badge>
    );
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  const totalMetrics = metrics ? {
    total: Object.values(metrics).reduce((sum, m) => sum + m.count, 0),
    successRate: metrics.success.count / (metrics.success.count + metrics.failed.count) * 100,
    avgDuration: (metrics.success.avg_duration_ms + metrics.failed.avg_duration_ms) / 2,
    totalCost: metrics.success.total_cost_usd + metrics.failed.total_cost_usd,
  } : null;

  if (jobsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tableau de bord des traductions</h2>
          <p className="text-muted-foreground">Monitoring en temps réel et statistiques</p>
        </div>
      </div>

      {/* Global Stats */}
      {totalMetrics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total traductions</p>
                <p className="text-2xl font-bold">{totalMetrics.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500/10 p-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taux de succès</p>
                <p className="text-2xl font-bold">{totalMetrics.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/10 p-2">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Durée moyenne</p>
                <p className="text-2xl font-bold">{formatDuration(totalMetrics.avgDuration)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-500/10 p-2">
                <DollarSign className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Coût total</p>
                <p className="text-2xl font-bold">${totalMetrics.totalCost.toFixed(4)}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Jobs List */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Actifs</TabsTrigger>
          <TabsTrigger value="completed">Terminés</TabsTrigger>
          <TabsTrigger value="failed">Échoués</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {jobs?.filter(j => ['pending', 'processing'].includes(j.status)).map(job => (
            <Card key={job.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{job.books.title}</h3>
                    <p className="text-sm text-muted-foreground">par {job.books.author}</p>
                  </div>
                  {getStatusBadge(job.status)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {job.completed_chapters}/{job.total_chapters} chapitres
                    </span>
                    <span className="font-medium">
                      {Math.round((job.completed_chapters / job.total_chapters) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(job.completed_chapters / job.total_chapters) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Languages className="h-4 w-4" />
                    <span>{job.target_languages.length} langues</span>
                  </div>
                  {job.failed_chapters > 0 && (
                    <div className="flex items-center gap-1 text-orange-500">
                      <XCircle className="h-4 w-4" />
                      <span>{job.failed_chapters} erreurs</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {jobs?.filter(j => ['pending', 'processing'].includes(j.status)).length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">
              Aucune traduction active
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {jobs?.filter(j => j.status === 'completed').map(job => (
            <Card key={job.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{job.books.title}</h3>
                    <p className="text-sm text-muted-foreground">par {job.books.author}</p>
                  </div>
                  {getStatusBadge(job.status)}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>{job.completed_chapters} chapitres traduits</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Languages className="h-4 w-4" />
                    <span>{job.target_languages.join(', ')}</span>
                  </div>
                  {job.completed_at && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(job.completed_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {jobs?.filter(j => j.status === 'completed').length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">
              Aucune traduction terminée récemment
            </Card>
          )}
        </TabsContent>

        <TabsContent value="failed" className="space-y-4">
          {jobs?.filter(j => j.status === 'failed').map(job => (
            <Card key={job.id} className="p-4 border-destructive/50">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{job.books.title}</h3>
                    <p className="text-sm text-muted-foreground">par {job.books.author}</p>
                  </div>
                  {getStatusBadge(job.status)}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 text-destructive">
                    <XCircle className="h-4 w-4" />
                    <span>{job.failed_chapters} chapitres échoués</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-500">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{job.completed_chapters} réussis</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {jobs?.filter(j => j.status === 'failed').length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">
              Aucune traduction en échec
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
