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
import { useMobileNav } from '@/components/MobileNavContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen } = useMobileNav();

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Clock Widget', path: '/clock', icon: Clock },
    { name: 'Timer Widget', path: '/timer', icon: Timer },
    { name: 'Chyron Builder', path: '/crawl', icon: Tv },
    { name: 'Screen Sets', path: '/screen', icon: Monitor },
  ];

  return (
    <aside 
      className={cn(
        "w-full lg:w-60 bg-sidebar lg:border-r border-b lg:border-b-0 border-border shrink-0 z-10 select-none", 
        isOpen ? "flex flex-col" : "hidden lg:flex lg:flex-col"
      )}
    >
      <div className="flex flex-col p-3 gap-1">
        <div className="px-3 pt-2 pb-2">
          <h2 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase m-0">
            Broadcast Tools
          </h2>
        </div>
        <nav className="flex flex-col gap-2" aria-label="Main Navigation">
          {links.map((link) => {
            const isActive = pathname === link.path;
            const IconComponent = link.icon;
            return (
              <Link
                key={link.path}
                href={link.path}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 min-h-[44px] rounded-md text-base font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground font-semibold border-l-4 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border-l-4 border-transparent"
                )}
              >
                <IconComponent
                  className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
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
    </aside>
  );
}
