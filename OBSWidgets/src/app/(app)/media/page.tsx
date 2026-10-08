import { Metadata } from 'next';
import MediaLibrary from '@/components/media/MediaLibrary';

export const metadata: Metadata = {
  title: 'Media Library | getphily',
  description: 'Manage your uploaded images, audio, and video.',
};

export default function MediaPage() {
  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      <MediaLibrary />
    </div>
  );
}
