'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flex, Box, Text } from '@radix-ui/themes';
import { 
  DashboardIcon, 
  ClockIcon, 
  StopwatchIcon, 
  ViewHorizontalIcon, 
  DesktopIcon 
} from '@radix-ui/react-icons';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', path: '/', icon: DashboardIcon },
    { name: 'Clock Widget', path: '/clock', icon: ClockIcon },
    { name: 'Timer Widget', path: '/timer', icon: StopwatchIcon },
    { name: 'Chyron Builder', path: '/crawl', icon: ViewHorizontalIcon },
    { name: 'Screen Sets', path: '/screen', icon: DesktopIcon },
  ];

  return (
    <Box asChild style={{
      width: '240px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      flexShrink: 0,
    }}>
      <aside>
        <Flex direction="column" p="3">
          <Box px="3" pt="2" pb="2">
            <Text size="1" weight="bold" style={{ textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
              Broadcast Tools
            </Text>
          </Box>
          <Flex direction="column" gap="1" asChild>
            <nav>
              {links.map((link) => {
                const isActive = pathname === link.path;
                const IconComponent = link.icon;
                return (
                  <Link 
                    key={link.path} 
                    href={link.path}
                    style={{ textDecoration: 'none' }}
                  >
                    <Flex 
                      align="center" 
                      gap="3" 
                      px="3" 
                      py="2" 
                      style={{
                        borderRadius: 'var(--radius-3)',
                        color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        backgroundColor: isActive ? 'var(--accent-subtle, var(--bg-main))' : 'transparent',
                        fontWeight: isActive ? 600 : 500,
                        borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <IconComponent width={17} height={17} style={{ flexShrink: 0, color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                      <Text size="2">
                        {link.name}
                      </Text>
                    </Flex>
                  </Link>
                );
              })}
            </nav>
          </Flex>
        </Flex>
      </aside>
    </Box>
  );
}
