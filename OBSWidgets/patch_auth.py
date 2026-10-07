import os

with open('src/app/(app)/podcast-tools/page.tsx', 'r') as f:
    content = f.read()

# Add import for supabase
if "import { supabase } from '@/lib/supabase';" not in content:
    content = content.replace(
        "import toast from 'react-hot-toast';",
        "import toast from 'react-hot-toast';\nimport { supabase } from '@/lib/supabase';"
    )

# Add session state
if "const [session, setSession] = useState<any>(null);" not in content:
    content = content.replace(
        "const [mounted, setMounted] = useState(false);",
        "const [mounted, setMounted] = useState(false);\n  const [session, setSession] = useState<any>(null);\n  const [loadingSession, setLoadingSession] = useState(true);"
    )

# Update useEffect to check session
effect_target = """  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('podcast_show_metadata');"""

effect_replacement = """  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const saved = localStorage.getItem('podcast_show_metadata');"""

if "supabase.auth.getSession()" not in content:
    content = content.replace(effect_target, effect_replacement)
    # also remember to unsubscribe
    content = content.replace(
        "  }, []);",
        "    return () => subscription.unsubscribe();\n  }, []);"
    )

# Add the Unauthenticated View
unauth_view = """
  if (loadingSession) {
    return <div className="p-10 text-center text-muted-foreground">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full bg-card border border-border shadow-lg rounded-2xl p-8 flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Mic className="w-8 h-8" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-black text-foreground tracking-tight">Podcast Tools</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Plan, organize, and launch your podcast. Our toolset helps you build out your show's metadata, complete our interactive setup curriculum, and track your directory syndications—all in one place.
            </p>
          </div>
          <div className="w-full flex flex-col gap-3 mt-2">
            <Button asChild size="lg" className="w-full font-bold">
              <Link href="/auth">Sign In or Create Account</Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Free to use. Sign in to save your show configuration.
            </p>
          </div>
        </div>
      </div>
    );
  }
"""

if "if (loadingSession)" not in content:
    content = content.replace(
        "if (!mounted) return null;",
        "if (!mounted) return null;\n" + unauth_view
    )

with open('src/app/(app)/podcast-tools/page.tsx', 'w') as f:
    f.write(content)
