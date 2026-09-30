import Link from 'next/link';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Navbar />

      {/* Main Workspace with Sidebar */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        
        <main style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
          {children}
        </main>
      </div>

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
