'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', path: '/' },
    { name: 'Clock Widget', path: '/clock' },
    { name: 'Chyron Builder', path: '/crawl' },
    { name: 'Screen Sets', path: '/screen' },
  ];

  return (
    <aside style={{
      width: '240px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 12px'
    }}>
      <h3 style={{ padding: '0 12px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '10px' }}>
        Widgets
      </h3>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {links.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link 
              key={link.path} 
              href={link.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-main)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
