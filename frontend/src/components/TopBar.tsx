import { Bell } from 'lucide-react';
import { Avatar } from './Avatar';
import { useHeader } from '../contexts/HeaderContext';

export function TopBar() {
  const { headerContent } = useHeader();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border h-[64px]">
      <div className="px-4 h-full flex items-center">
        <div className="flex items-center justify-between w-full">
          {/* Left section - Fixed: Avatar + Bell */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Avatar size={40} />
            <Bell className="w-6 h-6 text-foreground" />
          </div>

          {/* Middle section - Dynamic */}
          <div className="flex-1 flex items-center justify-center px-4">
            {headerContent.middle || null}
          </div>

          {/* Right section - Dynamic */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {headerContent.right || null}
          </div>
        </div>
      </div>
    </header>
  );
}

