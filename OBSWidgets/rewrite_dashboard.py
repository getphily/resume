import os

content = """'use client';

import React, { useEffect, useState } from 'react';
import { Mic, Play, Plus, Share, MoreHorizontal, Headphones, Info, Edit2, CheckCircle2, ExternalLink, Check, GraduationCap, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface PodcastData {
  title: string;
  host: string;
  email: string;
  description: string;
  primaryCategory: string;
  secondaryCategory: string;
  language: string;
  explicit: string;
  artworkUrl: string;
  rssFeedUrl: string;
  directoryStatus: {
    apple: boolean;
    spotify: boolean;
    youtube: boolean;
    amazon: boolean;
    iheart: boolean;
  };
}

const defaultData: PodcastData = {
  title: 'Untitled Show',
  host: 'Unknown Host',
  email: 'host@example.com',
  description: 'Welcome to our brand new podcast. In this show we will be exploring fascinating topics with amazing guests. Subscribe to follow along!',
  primaryCategory: 'Society & Culture',
  secondaryCategory: '',
  language: 'English',
  explicit: 'Clean',
  artworkUrl: '',
  rssFeedUrl: '',
  directoryStatus: {
    apple: false,
    spotify: false,
    youtube: false,
    amazon: false,
    iheart: false,
  }
};

const coursesList = [
  { id: 'concept', title: "Concept & Niche", lesson: "A strong podcast starts with a clear niche. Who is your audience? What unique perspective do you bring?" },
  { id: 'format', title: "Format & Description", lesson: "Will your show be solo, interview-based, or a co-hosted banter? Write a compelling show description." },
  { id: 'artwork', title: "Cover Art", lesson: "Cover art must be a square JPG or PNG, between 1400x1400 and 3000x3000 pixels. Use large, legible text." },
  { id: 'recording', title: "Recording Your First Episode", lesson: "Use a dynamic microphone. Record a 'Trailer' (1-3 minutes) introducing the show to get your RSS feed approved." },
  { id: 'hosting', title: "Hosting & RSS", lesson: "You need a podcast host to store your audio files. They will generate an 'RSS Feed URL'." },
  { id: 'distribution', title: "Distribution", lesson: "Submit your RSS Feed URL to the major directories. Approval can take a few days." },
  { id: 'live', title: "Live-to-Tape Recording", lesson: "Record exactly as if broadcasting live. Trigger sound effects and segments in real-time." }
];

function EditableField({ 
  value, 
  onSave, 
  multiline = false, 
  className = '',
  placeholder = 'Click to edit'
}: { 
  value: string, 
  onSave: (v: string) => void, 
  multiline?: boolean, 
  className?: string,
  placeholder?: string
}) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(value);

  if (editing) {
    const commonClass = cn("w-full bg-background border border-primary rounded-md outline-none focus:ring-2 focus:ring-primary/50 text-foreground", className);
    return multiline ? (
      <textarea 
        autoFocus
        className={cn(commonClass, "p-3 min-h-[120px] resize-y")}
        value={temp}
        onChange={e => setTemp(e.target.value)}
        onBlur={() => { setEditing(false); if (temp !== value) onSave(temp); }}
        onKeyDown={e => {
          if (e.key === 'Escape') { setEditing(false); setTemp(value); }
        }}
      />
    ) : (
      <input 
        autoFocus
        className={cn(commonClass, "px-2 py-1")}
        value={temp}
        onChange={e => setTemp(e.target.value)}
        onBlur={() => { setEditing(false); if (temp !== value) onSave(temp); }}
        onKeyDown={e => {
          if (e.key === 'Enter') { setEditing(false); if (temp !== value) onSave(temp); }
          if (e.key === 'Escape') { setEditing(false); setTemp(value); }
        }}
      />
    );
  }

  return (
    <div 
      onClick={() => { setTemp(value); setEditing(true); }}
      className={cn("group relative cursor-pointer hover:ring-2 hover:ring-primary/30 hover:bg-primary/5 rounded-md transition-all p-2 -mx-2", className)}
      title="Click to edit"
    >
      {value ? value : <span className="opacity-50 italic">{placeholder}</span>}
      <Edit2 className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 absolute top-2 right-2 transition-opacity" />
    </div>
  );
}

export default function YourPodcastLandingPage() {
  const [data, setData] = useState<PodcastData>(defaultData);
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('podcast_show_metadata');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData({ ...defaultData, ...parsed, directoryStatus: { ...defaultData.directoryStatus, ...(parsed.directoryStatus || {}) } });
      } catch (e) {}
    }
    const coursesSaved = localStorage.getItem('podcast_courses_completed');
    if (coursesSaved) {
      try { setCompletedCourses(JSON.parse(coursesSaved)); } catch(e) {}
    }
  }, []);

  const updateData = (updates: Partial<PodcastData>) => {
    const next = { ...data, ...updates };
    setData(next);
    localStorage.setItem('podcast_show_metadata', JSON.stringify(next));
    toast.success('Saved changes');
  };

  const toggleDirectoryStatus = (id: keyof PodcastData['directoryStatus']) => {
    const nextDirs = { ...data.directoryStatus, [id]: !data.directoryStatus[id] };
    updateData({ directoryStatus: nextDirs });
  };

  const toggleCourseComplete = (id: string) => {
    const next = completedCourses.includes(id) 
      ? completedCourses.filter(c => c !== id) 
      : [...completedCourses, id];
    setCompletedCourses(next);
    localStorage.setItem('podcast_courses_completed', JSON.stringify(next));
  };

  if (!mounted) return null;

  return (
    <div className="w-full min-h-screen bg-background overflow-y-auto p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Mic className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Your Podcast</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Podcast Meta Info Container */}
            <Card className="border-border bg-card shadow-sm p-6 flex flex-col gap-6">
              <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border/60 pb-3">
                <Info className="w-5 h-5 text-primary" />
                Podcast Metadata
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Artwork */}
                <div 
                  className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-xl shadow-md border border-border/20 bg-muted overflow-hidden flex items-center justify-center relative group cursor-pointer"
                  onClick={() => {
                    const url = window.prompt("Enter Artwork Image URL (Square 1400x1400+):", data.artworkUrl);
                    if (url !== null) updateData({ artworkUrl: url });
                  }}
                  title="Click to edit artwork"
                >
                  {data.artworkUrl ? (
                    <img src={data.artworkUrl} alt={data.title} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                      <Mic className="w-8 h-8 opacity-50" />
                      <span className="text-[10px] font-semibold text-center uppercase tracking-wider">Add Cover Art</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Edit2 className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Core Details */}
                <div className="flex flex-col gap-4 flex-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Show Title</span>
                    <EditableField 
                      value={data.title}
                      onSave={(v) => updateData({ title: v })}
                      className="text-2xl font-black text-foreground !p-1 !-mx-1"
                      placeholder="Untitled Show"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Host Name</span>
                      <EditableField 
                        value={data.host}
                        onSave={(v) => updateData({ host: v })}
                        className="font-medium text-sm text-foreground !p-1 !-mx-1"
                        placeholder="Unknown Host"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contact Email</span>
                      <EditableField 
                        value={data.email}
                        onSave={(v) => updateData({ email: v })}
                        className="font-medium text-sm text-foreground !p-1 !-mx-1"
                        placeholder="host@example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Show Description</span>
                <EditableField 
                  value={data.description}
                  onSave={(v) => updateData({ description: v })}
                  multiline
                  className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap !p-2 !-mx-2 bg-muted/20 rounded-lg border border-border/50"
                  placeholder="Add a description for your podcast here..."
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/60">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Language</span>
                  <EditableField 
                    value={data.language}
                    onSave={(v) => updateData({ language: v })}
                    className="font-semibold text-xs text-foreground !p-1 !-mx-1"
                    placeholder="e.g. English"
                  />
                </div>
                
                <div className="flex flex-col gap-1 col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Categories</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    <div className="relative group inline-block">
                      {data.primaryCategory && <Badge variant="secondary" className="px-2 py-0 text-[10px]">{data.primaryCategory}</Badge>}
                      <EditableField 
                        value={data.primaryCategory}
                        onSave={(v) => updateData({ primaryCategory: v })}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="relative group inline-block">
                      {data.secondaryCategory ? (
                         <Badge variant="outline" className="px-2 py-0 text-[10px]">{data.secondaryCategory}</Badge>
                      ) : (
                         <Badge variant="outline" className="px-2 py-0 text-[10px] border-dashed opacity-50">+ Add Category</Badge>
                      )}
                      <EditableField 
                        value={data.secondaryCategory}
                        onSave={(v) => updateData({ secondaryCategory: v })}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Content Rating</span>
                  <div className="mt-0.5 relative group inline-block w-fit cursor-pointer" onClick={() => updateData({ explicit: data.explicit === 'Yes' ? 'No' : 'Yes' })}>
                    {data.explicit === 'Yes' ? (
                      <Badge variant="destructive" className="px-2 py-0 text-[10px]">Explicit</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 px-2 py-0 text-[10px]">Clean</Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Directory Submission Container */}
            <Card className="border-border bg-card shadow-sm p-6 flex flex-col gap-6">
              <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border/60 pb-3">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Syndication & Directories
              </h2>
              
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Master RSS Feed URL</span>
                <EditableField 
                  value={data.rssFeedUrl}
                  onSave={(v) => updateData({ rssFeedUrl: v })}
                  className="font-mono text-sm text-foreground bg-muted/40 border border-border/80 rounded-md p-3"
                  placeholder="https://feed.yourhost.com/rss"
                />
                <p className="text-xs text-muted-foreground mt-1">This is the link you will submit to all podcast directories.</p>
              </div>

              {data.rssFeedUrl && (
                <div className="mt-2 flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Directory Submissions Checklist</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'apple', label: 'Apple Podcasts', url: 'https://podcastsconnect.apple.com/' },
                      { id: 'spotify', label: 'Spotify for Creators', url: 'https://creators.spotify.com/' },
                      { id: 'youtube', label: 'YouTube Music', url: 'https://studio.youtube.com/' },
                      { id: 'amazon', label: 'Amazon Music', url: 'https://podcasters.amazon.com/' },
                      { id: 'iheart', label: 'iHeartRadio', url: 'https://podcasters.iheart.com/' },
                    ].map((dir) => (
                      <div key={dir.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background shadow-sm hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => toggleDirectoryStatus(dir.id as keyof PodcastData['directoryStatus'])}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              data.directoryStatus[dir.id as keyof PodcastData['directoryStatus']] 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'border-input hover:border-primary'
                            }`}
                          >
                            {data.directoryStatus[dir.id as keyof PodcastData['directoryStatus']] && <Check className="w-3.5 h-3.5" />}
                          </button>
                          <span className="text-sm font-semibold text-foreground">{dir.label}</span>
                        </div>
                        <a href={dir.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors" title={`Submit to ${dir.label}`}>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            
            {/* Course List & Checkoff Container */}
            <Card className="border-border bg-card shadow-sm p-6 flex flex-col gap-4">
              <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border/60 pb-3">
                <BookOpen className="w-5 h-5 text-primary" />
                Podcast Setup Guide
              </h2>
              <p className="text-xs text-muted-foreground mb-2">
                Follow these steps to launch your podcast.
              </p>

              <div className="flex flex-col gap-3">
                {coursesList.map((course, idx) => {
                  const isCompleted = completedCourses.includes(course.id);
                  return (
                    <div 
                      key={course.id} 
                      className={cn(
                        "flex flex-col p-3 rounded-lg border transition-colors",
                        isCompleted 
                          ? "bg-emerald-500/5 border-emerald-500/20" 
                          : "bg-muted/30 border-border"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "text-sm font-bold", 
                            isCompleted ? "text-emerald-700 dark:text-emerald-400" : "text-foreground"
                          )}>
                            {idx + 1}. {course.title}
                          </span>
                          {!isCompleted && (
                            <span className="text-xs text-muted-foreground leading-relaxed mt-1 mb-2">
                              {course.lesson}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => toggleCourseComplete(course.id)}
                          className={cn(
                            "w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                            isCompleted 
                              ? "bg-emerald-500 border-emerald-500 text-white" 
                              : "border-input hover:border-primary bg-background"
                          )}
                        >
                          {isCompleted && <Check className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
"""

with open('src/app/(app)/podcast-tools/page.tsx', 'w') as f:
    f.write(content)
