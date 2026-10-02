'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Box, Flex, Card, Heading, Text, TextField, Button } from '@radix-ui/themes';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Check your email for the confirmation link!');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex direction="column" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Minimal Brand Header */}
      <Box px="6" py="4">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Flex align="center" gap="2">
            <Box style={{ width: '28px', height: '28px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-panel)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold' }}>H</Box>
            <Text size="5" weight="bold" style={{ color: 'var(--text-primary)' }}>getphily.io</Text>
          </Flex>
        </Link>
      </Box>

      <Flex align="center" justify="center" p="4" style={{ flex: 1 }}>
        <Card size="4" style={{ width: '100%', maxWidth: '440px' }}>
          
          <Flex direction="column" align="center" mb="5">
            <Heading size="6" mb="2">
              {isLogin ? 'Log in to your account' : 'Create a new account'}
            </Heading>
            <Text size="2" color="gray">
              {isLogin ? 'Welcome back! Please enter your details.' : 'Start managing your custom OBS widgets.'}
            </Text>
          </Flex>
          
          {error && (
            <Box mb="4" p="3" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-3)' }}>
              <Text size="2" style={{ color: '#ef4444' }}>{error}</Text>
            </Box>
          )}

          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="4">
              <Box>
                <Text as="label" size="2" weight="medium" mb="2" style={{ display: 'block' }}>Email address</Text>
                <TextField.Root 
                  type="email" 
                  size="3"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required 
                />
              </Box>
              
              <Box>
                <Text as="label" size="2" weight="medium" mb="2" style={{ display: 'block' }}>Password</Text>
                <TextField.Root 
                  type="password" 
                  size="3"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required 
                />
              </Box>

              <Button type="submit" size="3" mt="2" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </Flex>
          </form>

          <Flex justify="center" mt="5">
            <Text size="2" color="gray">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </Text>
          </Flex>
        </Card>
      </Flex>
    </Flex>
  );
}
