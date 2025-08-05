import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { genreAnalyticsService } from '@/services/genreAnalyticsService';
import { BookOpen, Clock, TrendingUp, Star } from 'lucide-react';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(30, 80%, 50%)',
  'hsl(150, 60%, 45%)',
  'hsl(270, 60%, 50%)',
  'hsl(0, 70%, 50%)',
  'hsl(200, 80%, 50%)'
];

export const GenreAnalyticsDashboard: React.FC = () => {
  const { session } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['genre-analytics', session?.user?.id],
    queryFn: () => session?.user ? genreAnalyticsService.getGenreAnalytics(session.user.id) : [],
    enabled: !!session?.user
  });

  if (isLoading) {
    return <div>Chargement des statistiques...</div>;
  }

  if (!analytics || analytics.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Commencez à lire pour voir vos statistiques par genre !
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = analytics.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length]
  }));

  const totalReads = analytics.reduce((sum, item) => sum + item.read_count, 0);
  const totalTime = analytics.reduce((sum, item) => sum + item.total_time_minutes, 0);
  const topGenre = analytics[0];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Genre préféré</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topGenre?.genre}</div>
            <p className="text-xs text-muted-foreground">
              {topGenre?.preference_score.toFixed(1)}% de vos lectures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total lectures</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReads}</div>
            <p className="text-xs text-muted-foreground">
              Réparties sur {analytics.length} genres
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalTime / 60)}h</div>
            <p className="text-xs text-muted-foreground">
              {totalTime} minutes de lecture
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par genre</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ genre, preference_score }) => `${genre}: ${preference_score.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="preference_score"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Pourcentage']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Nombre de lectures par genre</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="genre" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="read_count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Genre List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Détail par genre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.map((genre, index) => (
              <div key={genre.genre} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <h4 className="font-medium">{genre.genre}</h4>
                    <p className="text-sm text-muted-foreground">
                      {genre.read_count} lectures • {Math.round(genre.total_time_minutes / 60)}h
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {genre.preference_score.toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};