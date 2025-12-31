import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function LoginPage() {
  const handleStravaLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/strava/login`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">Runni</CardTitle>
          <CardDescription className="text-base">
            Your personal running training companion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Connect with Strava to start tracking your training progress
            </p>
          </div>
          <Button
            onClick={handleStravaLogin}
            className="w-full bg-[#FC4C02] hover:bg-[#E34402] text-white h-12 text-base font-semibold"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0L0 17.944h6.121" />
            </svg>
            Connect with Strava
          </Button>
          <div className="text-xs text-center text-muted-foreground space-y-1">
            <p>By connecting, you authorize Runni to:</p>
            <ul className="list-disc list-inside text-left mx-auto max-w-xs space-y-0.5">
              <li>Access your Strava activities</li>
              <li>Create training plans</li>
              <li>Track your progress</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
