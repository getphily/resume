'use client';

import React, { useState } from 'react';
import { Card, Heading, Text, Flex, Box, Button, TextField } from '@radix-ui/themes';
import { CopyIcon, CheckIcon } from '@radix-ui/react-icons';
import toast from 'react-hot-toast';

interface ObsExportCardProps {
  url: string;
  dimensions?: string;
  allowTransparency?: boolean;
  notes?: string[];
  title?: string;
  className?: string;
}

export function ObsExportCard({
  url,
  dimensions = '1920 × 1080',
  allowTransparency = true,
  notes,
  title = 'EXPORT TO OBS',
}: ObsExportCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('OBS Browser Source URL copied to clipboard!', {
        position: 'top-center',
        duration: 2500,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy URL to clipboard');
    }
  };

  return (
    <Card size="3" style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--bg-panel)' }}>
      <Flex justify="between" align="center">
        <Heading size="3" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </Heading>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', backgroundColor: 'var(--bg-main)', padding: '2px 8px', borderRadius: '12px' }}>
          Browser Source
        </span>
      </Flex>

      <Text size="2" color="gray" style={{ lineHeight: 1.5 }}>
        Copy this URL and paste it into a new <strong>Browser Source</strong> in OBS Studio. Any changes made here sync in real-time without restarting OBS!
      </Text>

      <ul style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, paddingLeft: '20px', margin: 0 }}>
        <li>Set Dimensions to <strong>{dimensions}</strong> (or your canvas size)</li>
        {allowTransparency && (
          <li>Ensure <strong>&quot;Allow transparency&quot;</strong> is checked in OBS</li>
        )}
        {notes?.map((note, index) => (
          <li key={index}>{note}</li>
        ))}
      </ul>

      <Box p="3" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
        <Text size="1" weight="bold" color="gray" style={{ display: 'block', marginBottom: '8px' }}>
          YOUR UNIQUE WIDGET URL:
        </Text>
        <Flex gap="2" align="center">
          <TextField.Root
            size="2"
            readOnly
            value={url}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '13px', cursor: 'text' }}
          />
          <Button
            size="2"
            variant="solid"
            color={copied ? 'green' : 'indigo'}
            onClick={handleCopy}
            style={{ fontWeight: 600, minWidth: '90px', cursor: 'pointer' }}
          >
            {copied ? (
              <>
                <CheckIcon width={16} height={16} /> Copied!
              </>
            ) : (
              <>
                <CopyIcon width={16} height={16} /> Copy
              </>
            )}
          </Button>
        </Flex>
      </Box>
    </Card>
  );
}
