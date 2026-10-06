'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Radio, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StreamStudioPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/#broadcast-studio');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center animate-pulse">
        <Radio className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-bold text-foreground">
        Loading OBS Stream Studio...
      </h1>
      <p className="text-sm text-muted-foreground max-w-md">
        Redirecting to the broadcast overlay creator and saved widgets manager at getphily&apos;s code stand.
      </p>
      <Button asChild size="sm" className="mt-2 gap-2">
        <Link href="/#broadcast-studio">
          <span>Go to Broadcast Studio</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  );
}
