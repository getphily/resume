'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Box, Flex, Heading, Text, Card, TextField, Button, Avatar, RadioCards } from '@radix-ui/themes';

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'PREFS'>('PROFILE');

  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [theme, setTheme] = useState('dark');
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
        setTheme(data.theme || 'dark');
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
      window.dispatchEvent(new Event('theme-updated'));
      toast.success("Profile updated successfully!");
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
              <Heading size="4" color="gray">PREFERENCES</Heading>
              
              <Box>
                <Text as="label" size="2" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>WEBSITE THEME</Text>
                <RadioCards.Root size="2" columns="2" value={theme} onValueChange={setTheme}>
                  <RadioCards.Item value="dark"><Flex width="100%" justify="center"><Text weight="bold">DARK (DJ MODE)</Text></Flex></RadioCards.Item>
                  <RadioCards.Item value="light"><Flex width="100%" justify="center"><Text weight="bold">LIGHT (CLEAN MODE)</Text></Flex></RadioCards.Item>
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
