import Link from 'next/link';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--chassis-black)' }}>
      {/* Navigation Bar */}
      <nav style={{ 
        height: '60px', 
        borderBottom: '1px solid var(--border-rigid)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 20px',
        backgroundColor: 'var(--module-bg)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', textDecoration: 'none' }}>
            getphily's OBS Widgets
          </Link>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Dashboard</Link>
            <Link href="/clock" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Clock</Link>
            <Link href="/marquee" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Marquee</Link>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href="/account" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Account</Link>
          <Link href="/auth">
            <button className="btn-amber" style={{ padding: '6px 16px', fontSize: '0.9rem' }}>Sign In</button>
          </Link>
        </div>
      </nav>

      {/* Main Workspace */}
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        height: '50px',
        borderTop: '1px solid var(--border-rigid)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        backgroundColor: 'var(--module-bg)',
        zIndex: 10
      }}>
        &copy; {new Date().getFullYear()} getphily.io. All rights reserved.
      </footer>
    </div>
  );
}
