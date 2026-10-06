'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Box, Flex, Heading, Text, Card, TextField, Button, Avatar, RadioCards, Badge } from '@radix-ui/themes';
import { ThemeMode, VALID_THEMES } from '@/app/ThemeProvider';

const THEME_OPTIONS = [
  {
    id: 'dark' as ThemeMode,
    name: 'Pioneer DJ Dark',
    badge: 'Standard',
    badgeColor: 'gray' as const,
    description: 'Chassis black & slate panels with vibrant indigo/amber accents for dark streaming booths.',
    palette: ['#0f172a', '#1e293b', '#6366f1'],
  },
  {
    id: 'light' as ThemeMode,
    name: 'Clean Light',
    badge: 'Standard',
    badgeColor: 'gray' as const,
    description: 'Minimalist daytime aesthetic with crisp off-white canvas and pure white panels.',
    palette: ['#f4f5f7', '#ffffff', '#4f46e5'],
  },
  {
    id: 'antd-light' as ThemeMode,
    name: 'Ant Design Pro (Light)',
    badge: 'Ant Design Pro',
    badgeColor: 'blue' as const,
    description: 'Enterprise light layout with signature #f0f2f5 canvas, Daybreak Blue (#1677ff) accent, and dark navy header.',
    palette: ['#001529', '#f0f2f5', '#1677ff'],
  },
  {
    id: 'antd-dark' as ThemeMode,
    name: 'Ant Design Pro (Dark)',
    badge: 'realDark',
    badgeColor: 'blue' as const,
    description: 'Enterprise realDark specification with deep #000000 layout, #141414 panels, and Daybreak Blue (#1677ff) accent.',
    palette: ['#000000', '#141414', '#1677ff'],
  },
];

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'PREFS'>('PROFILE');

  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      
      setUserId(session.user.id);

      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url, theme')
        .eq('id', session.user.id)
        .single();
        
      if (data) {
        setUsername(data.username || '');
        setAvatarUrl(data.avatar_url || '');
        if (data.theme && VALID_THEMES.includes(data.theme as ThemeMode)) {
          setTheme(data.theme as ThemeMode);
        } else {
          setTheme('dark');
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  const handleUpdate = async () => {
    if (!userId) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username,
        avatar_url: avatarUrl,
        theme,
        updated_at: new Date().toISOString()
      });

    if (error) {
      toast.error("Error saving profile: " + error.message);
    } else {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      window.dispatchEvent(new Event('theme-updated'));
      toast.success("Preferences saved successfully!");
    }
    setSaving(false);
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setSaving(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (error: any) {
      toast.error('Error uploading avatar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const TabButton = ({ tab, label }: { tab: typeof activeTab, label: string }) => (
    <Button 
      variant={activeTab === tab ? "soft" : "ghost"}
      color={activeTab === tab ? "blue" : "gray"}
      onClick={() => setActiveTab(tab)}
      style={{ width: '100%', justifyContent: 'flex-start', padding: '16px' }}
    >
      {label}
    </Button>
  );

  if (loading) return <Box p="6"><Text color="gray">Loading...</Text></Box>;

  return (
    <Box p="6" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <Box mb="6">
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '8px' }}>
          <Text size="2" color="gray">&larr; BACK TO DASHBOARD</Text>
        </Link>
        <Heading size="6">ACCOUNT SETTINGS</Heading>
      </Box>

      <Flex gap="6" align="start">
        
        {/* COLUMN 1: SIDEBAR MENU */}
        <Flex direction="column" gap="2" style={{ flex: '0 0 250px' }}>
          <TabButton tab="PROFILE" label="1. PUBLIC PROFILE" />
          <TabButton tab="PREFS" label="2. PREFERENCES" />
        </Flex>

        {/* COLUMN 2: ACTIVE SETTINGS WORK AREA */}
        <Card size="4" style={{ flex: '1 1 auto', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          
          {activeTab === 'PROFILE' && (
            <Flex direction="column" gap="5" style={{ height: '100%' }}>
              <Heading size="4" color="gray">PUBLIC PROFILE</Heading>
              
              <Flex align="center" gap="5">
                <Avatar 
                  size="8" 
                  src={avatarUrl} 
                  fallback="??" 
                  radius="full"
                />
                <Box>
                  <Text as="label" size="2" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>UPLOAD AVATAR</Text>
                  <input type="file" accept="image/*" onChange={uploadAvatar} disabled={saving} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }} />
                </Box>
              </Flex>

              <Box>
                <Text as="label" size="2" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>USERNAME</Text>
                <TextField.Root 
                  size="2" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="DJ Name / Username" 
                />
              </Box>

              <Box mt="auto" pt="5">
                <Button size="3" onClick={handleUpdate} disabled={saving} style={{ width: '100%' }}>
                  {saving ? 'SAVING...' : 'SAVE PROFILE'}
                </Button>
              </Box>
            </Flex>
          )}

          {activeTab === 'PREFS' && (
            <Flex direction="column" gap="5" style={{ height: '100%' }}>
              <Box>
                <Heading size="4" color="gray" mb="1">PREFERENCES</Heading>
                <Text size="2" color="gray">Customize your workspace appearance and interface styling.</Text>
              </Box>
              
              <Box>
                <Flex align="center" justify="between" mb="3">
                  <Text as="label" size="2" weight="bold" color="gray">
                    WEBSITE THEME
                  </Text>
                  <Text size="1" color="gray">
                    Live preview on selection &bull; Save to persist across devices
                  </Text>
                </Flex>

                <RadioCards.Root 
                  size="2" 
                  columns={{ initial: '1', sm: '2' }} 
                  value={theme} 
                  onValueChange={(val) => {
                    const nextTheme = val as ThemeMode;
                    setTheme(nextTheme);
                    document.documentElement.setAttribute('data-theme', nextTheme);
                    localStorage.setItem('theme', nextTheme);
                    window.dispatchEvent(new Event('theme-updated'));
                  }}
                >
                  {THEME_OPTIONS.map((opt) => (
                    <RadioCards.Item 
                      key={opt.id} 
                      value={opt.id} 
                      style={{ cursor: 'pointer', padding: '14px' }}
                    >
                      <Flex direction="column" gap="2" width="100%">
                        <Flex align="center" justify="between" width="100%">
                          <Text weight="bold" size="2">{opt.name}</Text>
                          <Badge color={opt.badgeColor} variant="soft" size="1">
                            {opt.badge}
                          </Badge>
                        </Flex>
                        <Text size="1" color="gray" style={{ lineHeight: 1.45, minHeight: '38px' }}>
                          {opt.description}
                        </Text>
                        <Flex align="center" justify="between" pt="2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                          <Text size="1" color="gray" weight="medium">Palette:</Text>
                          <Flex gap="1" align="center">
                            {opt.palette.map((c, i) => (
                              <Box
                                key={i}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '4px',
                                  backgroundColor: c,
                                  border: '1px solid rgba(128,128,128,0.3)',
                                }}
                              />
                            ))}
                          </Flex>
                        </Flex>
                      </Flex>
                    </RadioCards.Item>
                  ))}
                </RadioCards.Root>
              </Box>

              <Box mt="auto" pt="5">
                <Button size="3" onClick={handleUpdate} disabled={saving} style={{ width: '100%' }}>
                  {saving ? 'SAVING...' : 'SAVE PREFERENCES'}
                </Button>
              </Box>
            </Flex>
          )}

        </Card>
      </Flex>

    </Box>
  );
}
