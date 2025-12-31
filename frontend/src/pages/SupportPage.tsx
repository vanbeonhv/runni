import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

export function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold text-center">Support</h1>
      </header>

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
