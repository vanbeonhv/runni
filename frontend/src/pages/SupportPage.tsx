import { useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { useHeader } from '../contexts/HeaderContext';

export function SupportPage() {
  const { setHeaderContent } = useHeader();

  useEffect(() => {
    setHeaderContent({
      middle: <h1 className="text-lg font-semibold">Support</h1>,
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
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">
                Get help with your training, learn running tips, and access our knowledge base.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
