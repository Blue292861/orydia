import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TranslationJob {
  id: string;
  book_id: string;
  status: string;
  total_chapters: number;
  completed_chapters: number | null;
  failed_chapters: number | null;
  target_languages: string[];
  created_at: string;
  books?: {
    title: string;
    author: string;
  };
}

export function TranslationJobsMonitor() {
  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();

    const channel = supabase
      .channel('translation-jobs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'translation_jobs',
        },
        () => {
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('translation_jobs')
        .select(`
          *,
          books:book_id (title, author)
        `)
        .in('status', ['processing', 'failed', 'pending'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load translation jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (jobId: string) => {
    setRecovering(jobId);
    try {
      const { data, error } = await supabase.functions.invoke('translation-recovery', {
        body: { job_id: jobId, mode: 'manual' }
      });

      if (error) throw error;

      toast.success(`Recovery initiated: ${data.recovered_count} translations recovered`);
      fetchJobs();
    } catch (error) {
      console.error('Error recovering translations:', error);
      toast.error('Failed to recover translations');
    } finally {
      setRecovering(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getProgress = (job: TranslationJob) => {
    if (job.total_chapters === 0) return 0;
    return Math.round(((job.completed_chapters || 0) / job.total_chapters) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Translation Jobs</CardTitle>
          <CardDescription>Loading jobs...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Translation Jobs</CardTitle>
          <CardDescription>No active translation jobs</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Translation Jobs</CardTitle>
        <CardDescription>
          Monitor and recover translation jobs in progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {jobs.map((job) => {
          const progress = getProgress(job);
          const hasFailures = (job.failed_chapters || 0) > 0;

          return (
            <div key={job.id} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold">{job.books?.title || 'Unknown Book'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {job.books?.author || 'Unknown Author'}
                  </p>
                </div>
                <Badge variant={getStatusColor(job.status) as any}>
                  {job.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {job.completed_chapters || 0} / {job.total_chapters} chapters
                  </span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    {job.target_languages.length} languages
                  </Badge>
                  {hasFailures && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {job.failed_chapters} failed
                    </Badge>
                  )}
                </div>

                {(hasFailures || job.status === 'failed') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRecovery(job.id)}
                    disabled={recovering === job.id}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${recovering === job.id ? 'animate-spin' : ''}`} />
                    Recover
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Started {new Date(job.created_at).toLocaleString()}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
