import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useHeader } from '../contexts/HeaderContext';
import { workoutsApi, plansApi } from '../services/api';
import dayjs from 'dayjs';

export function TodayPage() {
  const { setHeaderContent } = useHeader();
  const { data: todayWorkout, isLoading: workoutLoading } = useQuery({
    queryKey: ['workout', 'today'],
    queryFn: () => workoutsApi.getTodayWorkout(),
  });

  const { data: activePlan, isLoading: planLoading } = useQuery({
    queryKey: ['plan', 'active'],
    queryFn: () => plansApi.getActivePlan(),
  });

  const isLoading = workoutLoading || planLoading;

  useEffect(() => {
    setHeaderContent({
      right: (
        <>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100">
            <span className="text-sm font-medium">
              Week {activePlan ? '1' : '0'}/{activePlan?.weeks || '0'}
            </span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <Calendar className="w-6 h-6 text-foreground" />
        </>
      ),
    });

    return () => {
      setHeaderContent({});
    };
  }, [setHeaderContent, activePlan]);

  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const today = dayjs();
  const startOfWeek = today.startOf('week').add(1, 'day'); // Monday

  const renderWeekCalendar = () => {
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white rounded-t-2xl">
        {weekDays.map((day, index) => {
          const date = startOfWeek.add(index, 'day');
          const isToday = date.isSame(today, 'day');

          return (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground font-medium">
                {day}
              </span>
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold ${
                  isToday
                    ? 'bg-foreground text-background'
                    : 'text-foreground'
                }`}
              >
                {date.date()}
              </div>
              {/* Workout indicator dots */}
              <div className="flex gap-0.5">
                {index % 2 === 0 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Weekly Calendar */}
      {renderWeekCalendar()}

      {/* Content */}
      <div className="px-4 py-6 space-y-4">
        <h2 className="text-xl font-bold">Workouts</h2>

        {!activePlan ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                No active training plan yet
              </p>
              <Button onClick={() => window.location.href = '/plan'}>
                Create Your First Plan
              </Button>
            </CardContent>
          </Card>
        ) : todayWorkout ? (
          <>
            {/* Today's Workout */}
            <Card className="relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-yellow-400 to-green-500"></div>
              <CardContent className="p-4 pl-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      {dayjs(todayWorkout.date).format('dddd, MMM D')} · 40m - 45m
                    </p>
                    <h3 className="text-lg font-bold">
                      {todayWorkout.distance}km {todayWorkout.type.charAt(0) + todayWorkout.type.slice(1).toLowerCase()} Run
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {todayWorkout.type.charAt(0) + todayWorkout.type.slice(1).toLowerCase()} Run · {todayWorkout.distance}km
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <input
                      type="checkbox"
                      checked={todayWorkout.isCompleted}
                      className="w-5 h-5 rounded border-2 border-gray-300"
                      readOnly
                    />
                    {activePlan && (
                      <div className="flex items-center justify-center w-12 h-14 bg-gradient-to-br from-green-900 to-green-700 rounded-lg">
                        <span className="text-white text-xs font-bold">
                          {activePlan.raceDistance}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Week Overview */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Week 1 Overview</h3>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Workouts: <span className="font-semibold text-foreground">0/2</span>
                  </span>
                  <span className="text-muted-foreground">
                    Distance: <span className="font-semibold text-foreground">0/14.5KM</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No workout scheduled for today</p>
            </CardContent>
          </Card>
        )}

        {/* Record Workout Button */}
        {activePlan && (
          <Button
            className="w-full h-14 text-base font-semibold bg-foreground text-background rounded-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Record workout
          </Button>
        )}
      </div>
    </div>
  );
}
