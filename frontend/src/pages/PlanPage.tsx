import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ClipboardList, CalendarRange, Share2, Edit3 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useHeader } from '../contexts/HeaderContext';
import { plansApi } from '../services/api';
import dayjs from 'dayjs';

export function PlanPage() {
  const navigate = useNavigate();
  const { setHeaderContent } = useHeader();
  const { data: activePlan, isLoading } = useQuery({
    queryKey: ['plan', 'active'],
    queryFn: () => plansApi.getActivePlan(),
  });

  useEffect(() => {
    setHeaderContent({
      middle: <h1 className="text-lg font-semibold">Your Plan</h1>,
      right: <Calendar className="w-6 h-6" />,
    });

    return () => {
      setHeaderContent({});
    };
  }, [setHeaderContent]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!activePlan) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <ClipboardList className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-xl font-bold mb-2">No Training Plan Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first training plan to get started
                </p>
              </div>
              <Button size="lg" className="px-8" onClick={() => navigate('/plan/create')}>
                Create Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const completedWeeks = 0; // This should be calculated from workouts
  const totalDistance = activePlan.raceDistance === 21.1 ? 435.2 : 600; // Example calculation

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Plan Card */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6 space-y-4">
            {/* Plan Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">{activePlan.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Your race: <span className="font-semibold text-foreground">
                    {dayjs(activePlan.raceDate).format('MMM DD, YYYY').toUpperCase()}
                  </span>
                </p>
              </div>
              <div className="flex items-center justify-center w-16 h-20 bg-gradient-to-br from-green-900 to-green-700 rounded-lg">
                <div className="text-center">
                  <div className="text-white text-xl font-bold">{activePlan.raceDistance}</div>
                  <div className="text-white text-[10px]">K</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex gap-1">
                {Array.from({ length: activePlan.weeks }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full ${
                      i < completedWeeks ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Weeks</p>
                <p className="text-2xl font-bold">
                  {completedWeeks}/{activePlan.weeks}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Distance</p>
                <p className="text-2xl font-bold">{totalDistance} km</p>
              </div>
            </div>

            {/* Race Info */}
            <div className="flex items-center justify-between py-3 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded">
                  <span className="text-xl">🏁</span>
                </div>
                <span className="font-medium">
                  {activePlan.name.split(' ')[0]} HM {dayjs(activePlan.raceDate).format('MMM D, YYYY')}
                </span>
              </div>
              <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4">
              <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50">
                <div className="w-12 h-12 flex items-center justify-center border-2 border-gray-200 rounded-full">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <span className="text-xs text-center font-medium">Plan Overview</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50">
                <div className="w-12 h-12 flex items-center justify-center border-2 border-gray-200 rounded-full">
                  <CalendarRange className="w-5 h-5" />
                </div>
                <span className="text-xs text-center font-medium">Rearrange Workouts</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50">
                <div className="w-12 h-12 flex items-center justify-center border-2 border-gray-200 rounded-full">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-xs text-center font-medium">Connected Apps</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50">
                <div className="w-12 h-12 flex items-center justify-center border-2 border-gray-200 rounded-full">
                  <Edit3 className="w-5 h-5" />
                </div>
                <span className="text-xs text-center font-medium">Manage Plan</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Pace Insights */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Pace Insights
          </h3>
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-foreground">
                We'll monitor your speed sessions to keep your training on track.
              </p>
              <Button className="bg-foreground text-background hover:bg-foreground/90">
                LET'S GO
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Estimated Race Times */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wide">
                  Estimated Race Times
                </h3>
                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-14 bg-gradient-to-br from-green-900 to-green-700 rounded-lg">
                <span className="text-white text-xs font-bold">21.1</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">In {activePlan.weeks} weeks</p>
                <p className="text-2xl font-bold">2:11:00 - 2:21:00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
