import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { MobileNavProvider } from '@/components/MobileNavContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileNavProvider>
      <div className="flex flex-col min-h-screen lg:h-screen bg-background text-foreground lg:overflow-hidden relative">
        <a href="#main-content" className="fixed -top-96 left-4 z-50 p-4 bg-background text-primary focus:top-4">
          Skip to main content
        </a>
        <Navbar />
        <div className="flex flex-1 lg:overflow-hidden flex-col lg:flex-row relative">
          <Sidebar />
          <main id="main-content" className="flex-1 lg:overflow-y-auto p-0 flex flex-col min-w-0" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
    </MobileNavProvider>
  );
}
