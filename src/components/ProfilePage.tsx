
import React from 'react';
import { useUserStats } from '@/contexts/UserStatsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, BookOpen, Star } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { userStats } = useUserStats();

  return (
    <div className="space-y-6 pb-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Your Profile</h2>
        <p className="text-muted-foreground">Track your reading progress and achievements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Coins className="h-4 w-4 ml-auto text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalPoints}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Books Read</CardTitle>
            <BookOpen className="h-4 w-4 ml-auto text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.booksRead.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reading Level</CardTitle>
            <Star className="h-4 w-4 ml-auto text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats.booksRead.length < 5 ? 'Beginner' : 
               userStats.booksRead.length < 15 ? 'Reader' : 'Expert'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reading Achievements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${userStats.booksRead.length >= 1 ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className={userStats.booksRead.length >= 1 ? 'text-foreground' : 'text-muted-foreground'}>
              First Book Read
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${userStats.booksRead.length >= 5 ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className={userStats.booksRead.length >= 5 ? 'text-foreground' : 'text-muted-foreground'}>
              Read 5 Books
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${userStats.totalPoints >= 500 ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className={userStats.totalPoints >= 500 ? 'text-foreground' : 'text-muted-foreground'}>
              Earned 500 Points
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
