'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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
    <button 
      onClick={() => setActiveTab(tab)}
      style={{
        display: 'block', width: '100%', textAlign: 'left', padding: '15px 20px', background: activeTab === tab ? 'var(--module-grey)' : 'transparent',
        border: 'none', borderBottom: '1px solid var(--border-rigid)', color: activeTab === tab ? 'var(--active-amber)' : 'var(--text-secondary)',
        fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.1s'
      }}
    >
      {label}
    </button>
  );

  if (loading) return <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Loading...</div>;

  return (
    <main style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '30px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '10px', display: 'inline-block' }}>
          &larr; BACK TO CATALOG
        </Link>
        <h2>ACCOUNT SETTINGS</h2>
      </div>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* COLUMN 1: SIDEBAR MENU */}
        <div style={{ flex: '0 0 250px', backgroundColor: 'var(--chassis-black)', border: '1px solid var(--border-rigid)', borderRadius: '6px', overflow: 'hidden' }}>
          <TabButton tab="PROFILE" label="1. PUBLIC PROFILE" />
          <TabButton tab="PREFS" label="2. PREFERENCES" />
        </div>

        {/* COLUMN 2: ACTIVE SETTINGS WORK AREA */}
        <div className="panel" style={{ flex: '1 1 auto', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '600px' }}>
          
          {activeTab === 'PROFILE' && (
            <>
              <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>PUBLIC PROFILE</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ 
                  width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--module-grey)',
                  border: '2px solid var(--border-rigid)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>NO PIC</span>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>UPLOAD AVATAR</label>
                  <input type="file" accept="image/*" onChange={uploadAvatar} disabled={saving} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>USERNAME</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="DJ Name / Username" />
              </div>

              <div style={{ marginTop: 'auto' }}>
                <button className="btn-primary" onClick={handleUpdate} disabled={saving} style={{ width: '100%' }}>
                  {saving ? 'SAVING...' : 'SAVE PROFILE'}
                </button>
              </div>
            </>
          )}

          {activeTab === 'PREFS' && (
            <>
              <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>PREFERENCES</h3>
              
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>WEBSITE THEME</label>
                <div className="segmented-control">
                  <button className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}>DARK (DJ MODE)</button>
                  <button className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}>LIGHT (CLEAN MODE)</button>
                </div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <button className="btn-primary" onClick={handleUpdate} disabled={saving} style={{ width: '100%' }}>
                  {saving ? 'SAVING...' : 'SAVE PREFERENCES'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>

    </main>
  );
}
