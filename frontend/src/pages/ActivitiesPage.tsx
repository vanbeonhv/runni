import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { useHeader } from '../contexts/HeaderContext';
import { activitiesApi } from '../services/api';
import type { StravaActivity } from '../types';
import dayjs from 'dayjs';

export function ActivitiesPage() {
  const { setHeaderContent } = useHeader();
  const { data, isLoading } = useQuery({
    queryKey: ['activities', { page: 1, limit: 20 }],
    queryFn: () => activitiesApi.getActivities({ page: 1, limit: 20 }),
  });

  const activities = data?.activities || [];

  useEffect(() => {
    setHeaderContent({
      middle: <h1 className="text-lg font-semibold">Activities</h1>,
      right: (
        <>
          <Plus className="w-6 h-6" />
          <Calendar className="w-6 h-6" />
        </>
      ),
    });

    return () => {
      setHeaderContent({});
    };
  }, [setHeaderContent]);

  const formatPace = (speed: number) => {
    // Convert m/s to min/km
    const pace = 1000 / (speed * 60);
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const groupedActivities = activities.reduce((acc, activity) => {
    const month = dayjs(activity.startDate).format('MMMM YYYY');
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(activity);
    return acc;
  }, {} as Record<string, StravaActivity[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Tabs */}
      <div className="bg-white px-4">
        <Tabs defaultValue="workouts" className="w-full">
          <TabsList className="w-full bg-transparent h-auto p-0 border-b border-border rounded-none">
            <TabsTrigger
              value="workouts"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3"
            >
              Workouts
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3"
            >
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workouts" className="mt-0">
            {/* Filters */}
            <div className="flex items-center gap-2 py-4">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-border rounded-lg text-sm">
                <span>Workout Type</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-border rounded-lg text-sm">
                <span>Year</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-border rounded-lg text-sm">
                <span>Month</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Activities List */}
      <div className="px-4 py-6 space-y-6">
        {Object.entries(groupedActivities).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-2">No activities to show!</p>
              <p className="text-sm text-muted-foreground">
                Sync your Strava activities to see them here
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedActivities).map(([month, monthActivities]) => {
            const totalDistance = monthActivities.reduce((sum, a) => sum + a.distance, 0) / 1000;
            const totalTime = monthActivities.reduce((sum, a) => sum + a.movingTime, 0);

            return (
              <div key={month} className="space-y-3">
                {/* Month Header */}
                <div className="flex items-end justify-between">
                  <h2 className="text-xl font-bold">{month}</h2>
                  <span className="text-sm text-muted-foreground">
                    {totalDistance.toFixed(1)} km
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {monthActivities.length} activity · {formatTime(totalTime)}
                </p>

                {/* Activity Cards */}
                <div className="space-y-3">
                  {monthActivities.map((activity) => (
                    <Card key={activity.id} className="relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gray-400"></div>
                      <CardContent className="p-4 pl-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-1">
                              {dayjs(activity.startDate).format('MMM D, YYYY · HH:mm')}
                            </p>
                            <h3 className="text-lg font-bold">{activity.name}</h3>
                          </div>
                          <svg className="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0L0 17.944h6.121" />
                          </svg>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase mb-1">
                              Distance
                            </p>
                            <p className="text-base font-bold">
                              {(activity.distance / 1000).toFixed(2)} km
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase mb-1">
                              Time
                            </p>
                            <p className="text-base font-bold">
                              {formatTime(activity.movingTime)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase mb-1">
                              Avg Pace
                            </p>
                            <p className="text-base font-bold">
                              {activity.averageSpeed ? formatPace(activity.averageSpeed) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {monthActivities.length > 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No more activities to show!
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
