'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Clock, 
  Timer, 
  Tv, 
  Monitor 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Clock Widget', path: '/clock', icon: Clock },
    { name: 'Timer Widget', path: '/timer', icon: Timer },
    { name: 'Chyron Builder', path: '/crawl', icon: Tv },
    { name: 'Screen Sets', path: '/screen', icon: Monitor },
  ];

  return (
    <aside className="w-60 bg-sidebar border-r border-border shrink-0 flex flex-col z-10 select-none">
      <div className="flex flex-col p-3 gap-1">
        <div className="px-3 pt-2 pb-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
            Broadcast Tools
          </span>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            const isActive = pathname === link.path;
            const IconComponent = link.icon;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground font-semibold border-l-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <IconComponent
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
