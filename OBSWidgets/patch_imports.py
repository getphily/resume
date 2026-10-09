with open('src/app/(app)/dashboard/page.tsx', 'r') as f:
    content = f.read()

imports = """
import { MediaLibrary } from '@/components/media/MediaLibrary';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { ThemeMode, VALID_THEMES, DEFAULT_THEME } from '@/app/ThemeProvider';
"""

content = content.replace("import Link from 'next/link';", "import Link from 'next/link';" + imports)
with open('src/app/(app)/dashboard/page.tsx', 'w') as f:
    f.write(content)
