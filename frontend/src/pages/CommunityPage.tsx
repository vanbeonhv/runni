import { useEffect } from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { useHeader } from '../contexts/HeaderContext';

export function CommunityPage() {
  const { setHeaderContent } = useHeader();

  useEffect(() => {
    setHeaderContent({
      middle: <h1 className="text-lg font-semibold">Community</h1>,
    });

    return () => {
      setHeaderContent({});
    };
  }, [setHeaderContent]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      <div className="px-4 py-12">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Users className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">
                Connect with other runners, share your progress, and get motivated together!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
