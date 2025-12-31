import { Link, useLocation } from 'react-router-dom';
import { Sun, ClipboardList, BarChart3, Users, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { path: '/today', label: 'Today', icon: Sun },
  { path: '/plan', label: 'Plan', icon: ClipboardList },
  { path: '/activities', label: 'Activities', icon: BarChart3 },
  { path: '/community', label: 'Community', icon: Users },
  { path: '/support', label: 'Support', icon: BookOpen },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'fill-current')} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
