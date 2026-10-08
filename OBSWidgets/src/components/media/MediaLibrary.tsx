"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getMediaAssets, getMediaStorageSummary, trashMediaAsset } from '@/lib/media/api';
import { MediaAsset, MediaStorageSummary, MediaKind } from '@/lib/media/types';
import { useMediaQueue } from './MediaProvider';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Music, 
  Video, 
  File,
  MoreVertical,
  Trash2,
  Search,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import toast from 'react-hot-toast';
import { formatBytes } from '@/lib/utils';
import MediaDetailDrawer from './MediaDetailDrawer';

export default function MediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [summary, setSummary] = useState<MediaStorageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MediaKind | 'all'>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  
  const { enqueueUpload, isUploading } = useMediaQueue();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fetchMedia = useCallback(async () => {
    try {
      const data = await getMediaAssets({
        kind: filter === 'all' ? undefined : filter,
        search: search.length > 2 ? search : undefined,
      });
      setAssets(data);
      const sum = await getMediaStorageSummary();
      setSummary(sum);
    } catch (err: any) {
      toast.error(`Failed to load media: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Refresh when uploads finish
  useEffect(() => {
    if (!isUploading) {
      fetchMedia();
    }
  }, [isUploading, fetchMedia]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      let kind: MediaKind | null = null;
      if (file.type.startsWith('image/')) kind = 'image';
      else if (file.type.startsWith('audio/')) kind = 'audio';
      else if (file.type.startsWith('video/')) kind = 'video';
      
      if (!kind) {
        toast.error(`${file.name} has an unsupported format.`);
        return;
      }
      enqueueUpload(file, kind, 'upload');
    });
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file? This will break any widgets using it.')) return;
    try {
      await trashMediaAsset(id);
      toast.success('Asset deleted');
      setAssets(prev => prev.filter(a => a.id !== id));
      if (selectedAsset?.id === id) setSelectedAsset(null);
      fetchMedia(); // refresh quota
    } catch (err: any) {
      toast.error('Failed to delete asset');
    }
  };

  const pctUsed = summary ? (summary.used / summary.quota) * 100 : 0;

  return (
    <div 
      className="flex-1 flex flex-col h-full relative"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-sm flex items-center justify-center border-4 border-dashed border-primary m-4 rounded-xl pointer-events-none">
          <div className="bg-background p-8 rounded-2xl shadow-2xl flex flex-col items-center">
            <UploadCloud className="w-16 h-16 text-primary mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-foreground">Drop files to upload</h2>
            <p className="text-muted-foreground mt-2">Supports Image, Audio, and Video files</p>
          </div>
        </div>
      )}

      {/* Header Panel */}
      <div className="bg-card border-b border-border p-4 shrink-0 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-foreground">Media Library</h1>
            <p className="text-sm text-muted-foreground">Manage your broadcast assets.</p>
          </div>
          <Button onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
          <input 
            type="file" 
            multiple 
            className="hidden" 
            ref={fileInputRef} 
            onChange={onFileInputChange}
            accept="image/*,audio/*,video/*"
          />
        </div>

        {summary && (
          <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-lg border border-border">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-foreground">Storage Used</span>
                <span className="text-muted-foreground">{formatBytes(summary.used)} of {formatBytes(summary.quota)}</span>
              </div>
              <Progress value={pctUsed} className="h-2" />
            </div>
            <div className="hidden md:flex gap-4 text-xs">
              <div className="flex flex-col"><span className="text-muted-foreground">Images</span><span className="font-medium text-foreground">{formatBytes(summary.images)}</span></div>
              <div className="flex flex-col"><span className="text-muted-foreground">Audio</span><span className="font-medium text-foreground">{formatBytes(summary.audio)}</span></div>
              <div className="flex flex-col"><span className="text-muted-foreground">Video</span><span className="font-medium text-foreground">{formatBytes(summary.video)}</span></div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="image">Images</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                className="pl-9 w-full sm:w-64 h-9" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex bg-muted rounded-md p-0.5 border border-border">
              <Button variant="ghost" size="icon" className={`h-8 w-8 ${viewMode==='grid'?'bg-background shadow-sm':''}`} onClick={()=>setViewMode('grid')}>
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className={`h-8 w-8 ${viewMode==='list'?'bg-background shadow-sm':''}`} onClick={()=>setViewMode('list')}>
                <ListIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid/List Area */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <File className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No media found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              {search ? "No assets match your search." : "Upload images, audio, or video to use in your stream tools."}
            </p>
            {!search && (
              <Button className="mt-6" variant="outline" onClick={() => fileInputRef.current?.click()}>
                Select Files
              </Button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20" 
            : "flex flex-col gap-2 pb-20"
          }>
            {assets.map(asset => (
              <MediaCard 
                key={asset.id} 
                asset={asset} 
                viewMode={viewMode}
                onSelect={() => setSelectedAsset(asset)}
                onDelete={() => handleDelete(asset.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selectedAsset && (
        <MediaDetailDrawer 
          asset={selectedAsset} 
          open={!!selectedAsset} 
          onOpenChange={(op) => !op && setSelectedAsset(null)}
          onDelete={() => handleDelete(selectedAsset.id)}
          onUpdate={(updated) => {
            setAssets(prev => prev.map(a => a.id === updated.id ? { ...a, ...updated } : a));
            setSelectedAsset(prev => prev ? { ...prev, ...updated } : null);
          }}
        />
      )}
    </div>
  );
}

function MediaCard({ 
  asset, 
  viewMode, 
  onSelect, 
  onDelete 
}: { 
  asset: MediaAsset; 
  viewMode: 'grid'|'list';
  onSelect: () => void;
  onDelete: () => void;
}) {
  const Icon = asset.kind === 'image' ? ImageIcon : asset.kind === 'audio' ? Music : Video;
  
  if (viewMode === 'list') {
    return (
      <div 
        className="flex items-center gap-4 p-3 bg-card border rounded-lg hover:border-primary/50 cursor-pointer group transition-colors"
        onClick={onSelect}
      >
        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <span className="font-semibold text-sm truncate">{asset.title}</span>
          <span className="text-[11px] text-muted-foreground truncate uppercase">{asset.kind} • {formatBytes(asset.size_bytes)}</span>
        </div>
        <div onClick={e => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col bg-card border rounded-lg overflow-hidden hover:border-primary/50 cursor-pointer group transition-colors"
      onClick={onSelect}
    >
      <div className="aspect-square bg-muted relative flex items-center justify-center border-b">
        <Icon className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <div className="p-2.5 flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0 flex flex-col">
          <span className="font-medium text-xs truncate" title={asset.title}>{asset.title}</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">{formatBytes(asset.size_bytes)}</span>
        </div>
        <div onClick={e => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1 -mt-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
