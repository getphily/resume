'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Clock, 
  Timer, 
  Tv, 
  Monitor,
  Sliders,
  Mic,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileNav } from '@/components/MobileNavContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen } = useMobileNav();

  if (pathname === '/') {
    return null;
  }

  const platformLinks = [
    { name: 'User Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Code Stand Hub', path: '/', icon: LayoutDashboard },
    { name: 'Kalimotxo Visuals', path: '/kalimotxo', icon: Sliders },
    { name: 'Podcast Tools', path: '/podcast-tools', icon: Mic },
    { name: 'Union Tools', path: '/union-tools', icon: Users },
  ];

  const broadcastLinks = [
    { name: 'Chyron Builder', path: '/crawl', icon: Tv },
    { name: 'Clock Widget', path: '/clock', icon: Clock },
    { name: 'Timer Widget', path: '/timer', icon: Timer },
    { name: 'Screen Sets', path: '/screen', icon: Monitor },
  ];

  return (
    <aside 
      className={cn(
        "w-full lg:w-60 bg-sidebar lg:border-r border-b lg:border-b-0 border-border shrink-0 z-10 select-none", 
        isOpen ? "flex flex-col" : "hidden lg:flex lg:flex-col"
      )}
    >
      <div className="flex flex-col p-3 gap-4">
        {/* Platform Toolsets Group */}
        <div className="flex flex-col gap-1">
          <div className="px-3 pt-2 pb-1">
            <h2 className="text-xs font-bold text-muted-foreground tracking-wider uppercase m-0">
              Platform Toolsets
            </h2>
          </div>
          <nav className="flex flex-col gap-1" aria-label="Platform Toolsets">
            {platformLinks.map((link) => {
              const isActive = pathname === link.path;
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 min-h-[44px] rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-semibold border-l-4 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border-l-4 border-transparent"
                  )}
                >
                  <IconComponent
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                    aria-hidden="true"
                  />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Broadcast Studio Editors Group */}
        <div className="flex flex-col gap-1 pt-2 border-t border-border">
          <div className="px-3 pt-1 pb-1">
            <h2 className="text-xs font-bold text-muted-foreground tracking-wider uppercase m-0">
              Broadcast Editors
            </h2>
          </div>
          <nav className="flex flex-col gap-1" aria-label="Broadcast Tools">
            {broadcastLinks.map((link) => {
              const isActive = pathname === link.path;
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 min-h-[44px] rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-semibold border-l-4 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border-l-4 border-transparent"
                  )}
                >
                  <IconComponent
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                    aria-hidden="true"
                  />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
