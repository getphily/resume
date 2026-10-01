'use client';

import { Box, Flex, Text, TextField, Button } from '@radix-ui/themes';

export function ImageUploadOrUrl({ value, onChange, label }: { value: string, onChange: (val: string) => void, label: string }) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        onChange(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box>
      <Text as="label" size="2" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>
        {label}
      </Text>
      <Flex gap="3" align="center">
        <Box style={{ flexGrow: 1 }}>
          <TextField.Root size="2" placeholder="https://... or upload" value={value} onChange={e => onChange(e.target.value)} />
        </Box>
        <Button size="2" asChild>
          <label style={{ cursor: 'pointer' }}>
            UPLOAD
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
        </Button>
      </Flex>
    </Box>
  );
}
