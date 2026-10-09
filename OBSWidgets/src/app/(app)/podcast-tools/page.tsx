'use client';

import React, { useEffect, useState } from 'react';
import MediaPicker from "@/components/media/MediaPicker";
import { getAssetPublicUrl } from "@/lib/media/api";
import { Mic, Play, Plus, Share, MoreHorizontal, Headphones, Info, Edit2, CheckCircle2, ExternalLink, Check, GraduationCap, BookOpen, Upload, Download, AlertCircle, Trash2, Wand2, Rocket, Sparkles, Palette, ChevronDown, AudioLines, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { CoverStudioDialog } from '@/components/cover-studio/CoverStudioDialog';
import { downloadImageUrl, uploadCoverAsset } from '@/lib/coverStudio/cloud';

interface PodcastData {
  title: string;
  host: string;
  email: string;
  description: string;
  primaryCategory: string;
  secondaryCategory: string;
  tertiaryCategory: string;
  language: string;
  explicit: string;
  artworkUrl: string;
  rssFeedUrl: string;
  substackHandle: string;
  hasSpotifyAccount?: boolean;
  hasSubstackMetadata?: boolean;
  episodeRecorded?: boolean;
  episodeMastered?: boolean;
  trailerPublished?: boolean;
  firstEpisodePublished?: boolean;
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
  tertiaryCategory: '',
  language: 'English',
  explicit: 'Clean',
  artworkUrl: '',
  rssFeedUrl: '',
  substackHandle: '',
  trailerPublished: false,
  firstEpisodePublished: false,
  directoryStatus: {
    apple: false,
    spotify: false,
    youtube: false,
    amazon: false,
    iheart: false,
  }
};


const APPLE_CATEGORIES = [
  "Arts", "Arts: Books", "Arts: Design", "Arts: Fashion & Beauty", "Arts: Food", "Arts: Performing Arts", "Arts: Visual Arts",
  "Business", "Business: Careers", "Business: Entrepreneurship", "Business: Investing", "Business: Management", "Business: Marketing", "Business: Non-Profit",
  "Comedy", "Comedy: Comedy Interviews", "Comedy: Improv", "Comedy: Stand-Up",
  "Education", "Education: Courses", "Education: How To", "Education: Language Learning", "Education: Self-Improvement",
  "Fiction", "Fiction: Comedy Fiction", "Fiction: Drama", "Fiction: Science Fiction",
  "Government",
  "History",
  "Health & Fitness", "Health & Fitness: Alternative Health", "Health & Fitness: Fitness", "Health & Fitness: Medicine", "Health & Fitness: Mental Health", "Health & Fitness: Nutrition", "Health & Fitness: Sexuality",
  "Kids & Family", "Kids & Family: Education for Kids", "Kids & Family: Parenting", "Kids & Family: Pets & Animals", "Kids & Family: Stories for Kids",
  "Leisure", "Leisure: Animation & Manga", "Leisure: Automotive", "Leisure: Aviation", "Leisure: Crafts", "Leisure: Games", "Leisure: Hobbies", "Leisure: Home & Garden", "Leisure: Video Games",
  "Music", "Music: Music Commentary", "Music: Music History", "Music: Music Interviews",
  "News", "News: Business News", "News: Daily News", "News: Entertainment News", "News: News Commentary", "News: Politics", "News: Sports News", "News: Tech News",
  "Religion & Spirituality", "Religion & Spirituality: Buddhism", "Religion & Spirituality: Christianity", "Religion & Spirituality: Hinduism", "Religion & Spirituality: Islam", "Religion & Spirituality: Judaism", "Religion & Spirituality: Religion", "Religion & Spirituality: Spirituality",
  "Science", "Science: Astronomy", "Science: Chemistry", "Science: Earth Sciences", "Science: Life Sciences", "Science: Mathematics", "Science: Natural Sciences", "Science: Nature", "Science: Physics", "Science: Social Sciences",
  "Society & Culture", "Society & Culture: Documentary", "Society & Culture: Personal Journals", "Society & Culture: Philosophy", "Society & Culture: Places & Travel", "Society & Culture: Relationships",
  "Sports", "Sports: Baseball", "Sports: Basketball", "Sports: Cricket", "Sports: Fantasy Sports", "Sports: Football", "Sports: Golf", "Sports: Hockey", "Sports: Rugby", "Sports: Soccer", "Sports: Swimming", "Sports: Tennis", "Sports: Volleyball", "Sports: Wilderness", "Sports: Wrestling",
  "Technology",
  "True Crime"
];

function CategoryDropdown({ value, onSave, label, status = 'none' }: { value: string, onSave: (v: string) => void, label: string, status?: 'complete' | 'incomplete' | 'none' }) {
  const statusClass = status === 'complete' 
    ? 'border-emerald-500/30 bg-emerald-500/5' 
    : status === 'incomplete' 
      ? 'border-destructive/50 bg-destructive/5' 
      : 'border-border/50 bg-muted/20';

  return (
    <select 
      value={value}
      onChange={(e) => onSave(e.target.value)}
      className={cn(
        "border rounded-md px-2 h-7 text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary outline-none max-w-full",
        statusClass
      )}
    >
      <option value="">{label}</option>
      {APPLE_CATEGORIES.map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  );
}

const coursesList = [
  {
    id: 'course_step1',
    title: "Meta & Cover Art",
    lesson: "Before you do anything, you need to define your show's concept and create cover art. Cover art must be a square JPG or PNG, between 1400x1400 and 3000x3000 pixels. The title should be memorable, legible on mobile screens, and communicate exactly what your show is about.",
  },
  {
    id: 'course_step2',
    title: "Hosting & Architecture",
    lesson: "You need a podcast host to store your audio files. We recommend Spotify for Podcasters because it's completely free and reliable. Once you set up your host, they will give you an RSS feed URL—this is the master link that distributes your audio everywhere. We also recommend linking it to Substack so you can own your audience via an email newsletter.",
  },
  {
    id: 'course_step3',
    title: "The Perfect First Episode",
    lesson: "Before you can syndicate, you must have at least one episode (or trailer) published to your RSS feed. A trailer should be 1-3 minutes long, hooking listeners by explaining who you are and what to expect. Use the Recording Studio to lay down your audio, Magic Polish it to achieve broadcast-quality sound, and upload it to your host.",
  },
  {
    id: 'course_step4',
    title: "Launch & Syndication",
    lesson: "With your first episode published to your host, it's time to submit your RSS feed to Apple Podcasts Connect and Spotify. Apple acts as the master directory for almost all other smaller apps (Overcast, Pocket Casts, etc.). Approval can take a few days, but once approved, every future episode you publish to your host will automatically appear everywhere.",
  }
];

function validateSubstackHandle(raw: string): { isValid: boolean; error: string | null; cleaned: string } {
  if (!raw || !raw.trim()) {
    return { isValid: false, error: 'Substack handle cannot be empty', cleaned: '' };
  }
  let cleaned = raw.trim();
  // Strip url patterns if user pasted full URL (e.g. https://username.substack.com or substack.com/@username)
  cleaned = cleaned.replace(/^https?:\/\//i, '');
  cleaned = cleaned.replace(/^substack\.com\/@?/i, '');
  cleaned = cleaned.replace(/\.substack\.com\/?.*$/i, '');
  cleaned = cleaned.replace(/^@/, '');
  cleaned = cleaned.trim();

  if (!cleaned) {
    return { isValid: false, error: 'Handle cannot be empty', cleaned: '' };
  }
  if (/\s/.test(cleaned)) {
    return { isValid: false, error: 'Handle cannot contain spaces', cleaned };
  }
  if (/[_]/.test(cleaned)) {
    return { isValid: false, error: 'Publication subdomains use hyphens (-), not underscores (_)', cleaned };
  }
  if (/[^a-zA-Z0-9-]/.test(cleaned)) {
    return { isValid: false, error: 'Only letters, numbers, and hyphens are allowed', cleaned };
  }
  if (cleaned.startsWith('-') || cleaned.endsWith('-')) {
    return { isValid: false, error: 'Handle cannot start or end with a hyphen', cleaned };
  }
  if (cleaned.length < 2) {
    return { isValid: false, error: 'Handle must be at least 2 characters long', cleaned };
  }
  if (cleaned.length > 63) {
    return { isValid: false, error: 'Handle must be 63 characters or fewer', cleaned };
  }

  return { isValid: true, error: null, cleaned: cleaned.toLowerCase() };
}

function EditableField({ 
  value, 
  onSave, 
  multiline = false, 
  className = '',
  placeholder = 'Click to edit',
  status = 'none',
  validate
}: { 
  value: string, 
  onSave: (v: string) => void, 
  multiline?: boolean, 
  className?: string,
  placeholder?: string,
  status?: 'complete' | 'incomplete' | 'none',
  validate?: (v: string) => string | null
}) {
  const statusClass = status === 'complete' 
    ? 'border border-emerald-500/30 bg-emerald-500/5' 
    : status === 'incomplete' 
      ? 'border border-destructive/50 bg-destructive/5' 
      : 'border border-transparent';

  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(value);

  const validationError = (editing && validate) ? validate(temp) : null;

  const handleFinish = () => {
    setEditing(false);
    if (temp !== value) {
      if (validate) {
        const err = validate(temp);
        if (err) {
          toast.error(err, { position: 'top-center' });
        }
      }
      onSave(temp);
    }
  };

  if (editing) {
    const commonClass = cn(
      "w-full bg-background rounded-md outline-none text-foreground transition-colors",
      validationError 
        ? "border border-destructive focus:ring-2 focus:ring-destructive/40" 
        : "border border-primary focus:ring-2 focus:ring-primary/50",
      className
    );
    return multiline ? (
      <div className="flex flex-col gap-1 w-full">
        <textarea 
          autoFocus
          className={cn(commonClass, "p-3 min-h-[120px] resize-y")}
          value={temp}
          onChange={e => setTemp(e.target.value)}
          onBlur={handleFinish}
          onKeyDown={e => {
            if (e.key === 'Escape') { setEditing(false); setTemp(value); }
          }}
        />
        {validationError && (
          <p className="text-[10px] text-destructive flex items-center gap-1 font-semibold">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {validationError}
          </p>
        )}
      </div>
    ) : (
      <div className="flex flex-col gap-1 w-full">
        <input 
          autoFocus
          className={cn(commonClass, "px-2 py-1")}
          value={temp}
          onChange={e => setTemp(e.target.value)}
          onBlur={handleFinish}
          onKeyDown={e => {
            if (e.key === 'Enter') handleFinish();
            if (e.key === 'Escape') { setEditing(false); setTemp(value); }
          }}
        />
        {validationError && (
          <p className="text-[10px] text-destructive flex items-center gap-1 font-semibold">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {validationError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={() => { setTemp(value); setEditing(true); }}
      className={cn("group relative cursor-pointer hover:ring-2 hover:ring-primary/30 hover:bg-primary/5 rounded-md transition-all p-2 -mx-2", statusClass, className)}
      title="Click to edit"
    >
      {value ? value : <span className="opacity-50 italic">{placeholder}</span>}
      <Edit2 className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 absolute top-2 right-2 transition-opacity" />
    </div>
  );
}


function FieldLabel({ text, complete }: { text: string, complete?: boolean }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
      {text}
      {complete !== undefined && (
        complete 
          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 
          : <AlertCircle className="w-3.5 h-3.5 text-destructive animate-pulse" />
      )}
    </span>
  );
}

export default function YourPodcastLandingPage() {
  const [data, setData] = useState<PodcastData>(defaultData);
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [helpModalStep, setHelpModalStep] = useState<{ title: string; content: React.ReactNode } | null>(null);
  const [spotifyExpanded, setSpotifyExpanded] = useState(false);
  const [wizardData, setWizardData] = useState({ about: '', for: '', why: '' });
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

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
    return () => subscription.unsubscribe();
  }, []);

  const updateData = (updates: Partial<PodcastData>) => {
    const next = { ...data, ...updates };
    setData(next);
    try {
      localStorage.setItem('podcast_show_metadata', JSON.stringify(next));
      toast.success('Saved changes');
    } catch {
      toast.error('Cover is too large to save in this browser — download it to keep a copy.', {position:'top-center'});
    }
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    const userId: string | undefined = session?.user?.id;
    if (userId) {
      try {
        const url = await uploadCoverAsset(userId, 'cover', file);
        updateData({ artworkUrl: url });
        return;
      } catch (err) {
        console.error('[PodcastTools] Cover upload to Supabase failed', err);
        toast.error("Couldn't upload to cloud storage — saving it in this browser instead.", { position: 'top-center' });
      }
    }

    // Signed out (or cloud upload failed): keep it locally as a Data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateData({ artworkUrl: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!data.artworkUrl) return;
    const baseName = data.title ? `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_cover` : 'podcast_cover';

    // Cloud-hosted artwork is cross-origin, so <a download> would just navigate to it.
    if (/^https?:\/\//i.test(data.artworkUrl)) {
      try {
        await downloadImageUrl(data.artworkUrl, baseName);
      } catch (err) {
        console.error('[PodcastTools] Cover download failed', err);
        toast.error("Couldn't download the cover. Please try again.", { position: 'top-center' });
      }
      return;
    }

    const ext = data.artworkUrl.startsWith('data:image/jpeg') ? '.jpg' : '.png';
    const a = document.createElement('a');
    a.href = data.artworkUrl;
    a.download = `${baseName}${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!mounted) return null;

  if (loadingSession) {
    return <div className="p-10 text-center text-muted-foreground">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full bg-card border border-border shadow-lg rounded-2xl p-8 flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Mic className="w-8 h-8" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl  text-foreground ">Podcast Tools</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Plan, organize, and launch your podcast. Our toolset helps you build out your show's metadata, complete our interactive setup curriculum, and track your directory syndications—all in one place.
            </p>
          </div>
          <div className="w-full flex flex-col gap-3 mt-2">
            <Button asChild size="lg" className="w-full font-bold">
              <Link href="/auth">Sign In or Create Account</Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Free to use. Sign in to save your show configuration.
            </p>
          </div>
        </div>
      </div>
    );
  }


  // Step 1 Check
  const s1_metaComplete = Boolean(data.title && data.title !== 'Untitled Show' && data.host && data.host !== 'Unknown Host' && data.description && data.description !== defaultData.description);
  const s1_catComplete = Boolean(data.primaryCategory && data.explicit);
  const s1_coverComplete = Boolean(data.artworkUrl);
  const s1_course = completedCourses.includes('course_step1');
  const isStep1Complete = s1_metaComplete && s1_catComplete && s1_coverComplete && s1_course;

  // Step 2 Check
  const s2_spotify = Boolean(data.hasSpotifyAccount);
  const s2_substackHandle = Boolean(data.substackHandle);
  const s2_substackMeta = Boolean(data.hasSubstackMetadata);
  const s2_rss = Boolean(data.rssFeedUrl && data.rssFeedUrl.trim());
  const s2_course = completedCourses.includes('course_step2');
  const isStep2Complete = s2_spotify && s2_substackHandle && s2_substackMeta && s2_rss && s2_course;

  // Step 3 Check (The First Episode)
  const s3_record = Boolean(data.episodeRecorded);
  const s3_master = Boolean(data.episodeMastered);
  const s3_publish = Boolean(data.firstEpisodePublished);
  const s3_course = completedCourses.includes('course_step3');
  const isStep3Complete = s3_record && s3_master && s3_publish && s3_course;

  // Step 4 Check (Directory Syndication)
  const s4_apple = Boolean(data.directoryStatus.apple);
  const s4_spotify = Boolean(data.directoryStatus.spotify);
  const s4_course = completedCourses.includes('course_step4');
  const isStep4Complete = s4_apple && s4_spotify && s4_course;

  const activeStepIndex = [isStep1Complete, isStep2Complete, isStep3Complete, isStep4Complete].findIndex(c => !c);

  return (
    <div className="w-full min-h-screen bg-background overflow-y-auto p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Mic className="w-8 h-8 text-primary" />
          <h1 className="text-3xl  text-foreground ">Your Podcast</h1>
        </div>

        {/* Podcast Launch Workflow Roadmap */}
        {(() => {
          const steps = [
            {
              id: 'meta',
              stepNum: 1,
              courseId: 'course_step1',
              title: 'Meta & Cover Art',
              desc: 'Basic information and artwork',
              complete: isStep1Complete,
              actionLabel: isStep1Complete ? 'Review Meta' : 'Fill In Meta',
              onClick: () => {
                document.getElementById('section-metadata')?.scrollIntoView({ behavior: 'smooth' });
              },
              helpArticle: {
                title: 'Step 1: Meta & Cover Art',
                content: (
                  <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                    <p>The foundation of your podcast. Before directories like Apple or Spotify can list your show, they require strict metadata.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>Title & Description:</strong> Must clearly describe the show without keyword stuffing.</li>
                      <li><strong>Categories:</strong> Choose exactly where you want to rank in podcast apps.</li>
                      <li><strong>Cover Art:</strong> Must be perfectly square, between 1400x1400px and 3000x3000px, and under 2MB. Use our built-in Cover Studio to generate one!</li>
                    </ul>
                  </div>
                )
              },
              checklist: [
                { label: 'Complete Course', completed: s1_course, tooltip: s1_course ? 'Course completed!' : 'Click to go to the course and complete it.', onClick: () => { if (!s1_course) window.location.href = '/podcast-tools/courses?courseId=course_step1'; } },
                { label: 'Complete Title, Host and Description', completed: s1_metaComplete, tooltip: 'These fields are required before any directory will accept your podcast.', onClick: () => document.getElementById('section-metadata')?.scrollIntoView({ behavior: 'smooth' }) },
                { label: 'Pick Categories and Rating', completed: s1_catComplete, tooltip: 'Helps listeners find you. Rating marks if you use explicit language.', onClick: () => document.getElementById('section-metadata')?.scrollIntoView({ behavior: 'smooth' }) },
                { label: 'Add Cover Image', completed: s1_coverComplete, tooltip: 'Must be a 1400–3000px square image.', onClick: () => document.getElementById('section-artwork')?.scrollIntoView({ behavior: 'smooth' }) }
              ]
            },
            {
              id: 'hosting',
              stepNum: 2,
              courseId: 'course_step2',
              title: 'Hosting Setup',
              desc: 'Substack integration and RSS',
              complete: isStep2Complete,
              actionLabel: isStep2Complete ? 'Hosting Connected' : 'Setup Hosting',
              onClick: () => {
                document.getElementById('section-directories')?.scrollIntoView({ behavior: 'smooth' });
              },
              helpArticle: {
                title: 'Step 2: Hosting Setup',
                content: (
                  <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                    <p>To distribute a podcast, you need an RSS feed. This is a special link that holds your audio files and metadata.</p>
                    <p>We recommend <strong>Spotify for Podcasters</strong> as your media host because it's completely free and highly reliable. We also recommend linking it to <strong>Substack</strong> to build your mailing list concurrently.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Create your Spotify host account.</li>
                      <li>Input your Substack handle.</li>
                      <li>Copy the generated RSS feed URL back here.</li>
                    </ul>
                  </div>
                )
              },
              checklist: [
                { label: 'Complete Course', completed: s2_course, tooltip: s2_course ? 'Course completed!' : 'Click to go to the course and complete it.', onClick: () => { if (!s2_course) window.location.href = '/podcast-tools/courses?courseId=course_step2'; } },
                { label: 'Sign Up for a Spotify Account', completed: s2_spotify, tooltip: 'Click to mark as done after creating a free Spotify for Podcasters account.', onClick: () => updateData({ hasSpotifyAccount: !data.hasSpotifyAccount }) },
                { label: 'Add Substack Handle', completed: s2_substackHandle, tooltip: 'Connect your Substack handle so we can link your newsletter.', onClick: () => document.getElementById('section-substack')?.scrollIntoView({ behavior: 'smooth' }) },
                { label: 'Add Metadata to Substack', completed: s2_substackMeta, tooltip: 'Click to mark as done once you have filled out your Substack podcast settings.', onClick: () => updateData({ hasSubstackMetadata: !data.hasSubstackMetadata }) },
                { label: 'Add RSS Feed to "Your Podcast"', completed: s2_rss, tooltip: 'Paste your generated RSS feed URL here.', onClick: () => document.getElementById('section-directories')?.scrollIntoView({ behavior: 'smooth' }) }
              ]
            },
            {
              id: 'release',
              stepNum: 3,
              courseId: 'course_step3',
              title: 'The First Episode',
              desc: 'Record, edit, and publish',
              complete: isStep3Complete,
              actionLabel: isStep3Complete ? 'Published' : 'Open Studio',
              onClick: () => {
                window.location.href = '/podcast-tools/studio';
              },
              helpArticle: {
                title: 'Step 3: The First Episode',
                content: (
                  <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                    <p>It's time to record! You can record a short 1-minute trailer, or dive straight into Episode 1.</p>
                    <p>Use our built-in <strong>Recording Studio</strong> to lay down your audio. Then, use <strong>Magic Polish</strong> to instantly master the audio, removing background noise and leveling your voice to professional broadcast standards.</p>
                    <p>Finally, download the audio and upload it to your host (Spotify for Podcasters). Congratulations, you're a podcaster!</p>
                  </div>
                )
              },
              checklist: [
                { label: 'Complete Course', completed: s3_course, tooltip: s3_course ? 'Course completed!' : 'Click to go to the course and complete it.', onClick: () => { if (!s3_course) window.location.href = '/podcast-tools/courses?courseId=course_step3'; } },
                { label: 'Record Episode', completed: s3_record, tooltip: 'Click to toggle once you have recorded audio.', onClick: () => updateData({ episodeRecorded: !data.episodeRecorded }) },
                { label: 'Edit and Master Episode', completed: s3_master, tooltip: 'Click to toggle once you have edited and Magic Polished your audio.', onClick: () => updateData({ episodeMastered: !data.episodeMastered }) },
                { label: 'Publish Episode', completed: s3_publish, tooltip: 'Click to toggle once you have published to your RSS feed!', onClick: () => { const next = !data.firstEpisodePublished; updateData({ firstEpisodePublished: next, trailerPublished: next }); if (next) toast.success('🎉 Marked as published! Your podcast is live!'); } }
              ]
            },
            {
              id: 'directories',
              stepNum: 4,
              courseId: 'course_step4',
              title: 'Directory Syndication',
              desc: 'Get listed on major platforms',
              complete: isStep4Complete,
              actionLabel: isStep4Complete ? 'Submitted' : 'Submit Feed',
              onClick: () => {
                document.getElementById('section-directories')?.scrollIntoView({ behavior: 'smooth' });
              },
              helpArticle: {
                title: 'Step 4: Directory Syndication',
                content: (
                  <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                    <p>Once your RSS feed is ready and has at least one published audio file (like a trailer), you need to tell Apple and Spotify about it.</p>
                    <p>Submit your RSS feed link to <strong>Apple Podcasts Connect</strong>. Apple acts as the master directory for almost all other smaller podcast apps (Overcast, Pocket Casts, etc.).</p>
                    <p>Approval usually takes a few days. Once approved, every time you publish an episode to your host, it will automatically appear in all apps!</p>
                  </div>
                )
              },
              checklist: [
                { label: 'Complete Course', completed: s4_course, tooltip: s4_course ? 'Course completed!' : 'Click to go to the course and complete it.', onClick: () => { if (!s4_course) window.location.href = '/podcast-tools/courses?courseId=course_step4'; } },
                { label: 'Get listed on Apple', completed: s4_apple, tooltip: 'Submit your RSS feed to Apple Podcasts Connect.', onClick: () => document.getElementById('section-directories')?.scrollIntoView({ behavior: 'smooth' }) },
                { label: 'Get listed on Spotify', completed: s4_spotify, tooltip: 'Submit your RSS feed to Spotify.', onClick: () => document.getElementById('section-directories')?.scrollIntoView({ behavior: 'smooth' }) }
              ]
            }
          ];

          const completedCount = steps.filter(s => s.complete).length;
          const progressPercent = Math.round((completedCount / steps.length) * 100);

          return (
            <Card className="border-border bg-card shadow-sm p-6 flex flex-col gap-6">
              {/* Top Banner with Progress Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-primary" />
                    <h2 className="text-lg  text-foreground">Podcast Launch Workflow</h2>
                    <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 border-primary/30 text-primary bg-primary/5">
                      4-Step Roadmap
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Follow this interactive checklist to guide your show from initial setup to your first live release.
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      {completedCount} of 4 Completed
                    </span>
                    <span className={cn(
                      "text-xs font-black px-2 py-0.5 rounded-full border",
                      progressPercent === 100 
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" 
                        : "bg-primary/10 text-primary border-primary/20"
                    )}>
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="w-40 sm:w-48 bg-muted rounded-full h-2 overflow-hidden border border-border/50">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500 ease-out",
                        progressPercent === 100 ? "bg-emerald-500" : "bg-primary"
                      )}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 4 Workflow Step Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {steps.map((step, idx) => {
                  const isCurrent = idx === activeStepIndex;
                  return (
                    <div 
                      key={step.id} 
                      className={cn(
                        "flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-200 relative group",
                        step.complete 
                          ? "border-emerald-500/30 bg-emerald-500/5 shadow-sm"
                          : isCurrent 
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                            : "border-border bg-card/60 hover:border-border hover:bg-card opacity-80 hover:opacity-100"
                      )}
                    >
                      {/* Step Header */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded",
                            step.complete 
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : isCurrent 
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                          )}>
                            Step {step.stepNum}
                          </span>
                          
                          {step.complete ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : isCurrent ? (
                            <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40" />
                              <div className="relative w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/40 shadow-sm bg-card">
                                <Info className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-border bg-muted/40 shrink-0" />
                          )}
                        </div>

                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className={cn(
                              "text-xs font-bold leading-tight",
                              step.complete ? "text-emerald-700 dark:text-emerald-300" : "text-foreground"
                            )}>
                              {step.title}
                            </h3>
                            <button
                              onClick={() => setHelpModalStep({ title: step.helpArticle.title, content: step.helpArticle.content })}
                              className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 ring-primary rounded-full p-0.5"
                              title="Learn more about this step"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              href={`/podcast-tools/courses?courseId=${step.courseId}`}
                              className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 ring-primary rounded-full p-0.5"
                              title="Open course for this step"
                            >
                              <GraduationCap className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>

                        {/* Checklist */}
                        <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border/40">
                          {step.checklist.map((item, i) => (
                            <button 
                              key={i} 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.onClick) item.onClick();
                              }}
                              className="flex items-start gap-2 group/item cursor-pointer text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 rounded-sm" 
                              title={item.tooltip}
                            >
                              <div className={cn("w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center shrink-0 mt-[1px] transition-colors", item.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-border bg-card group-hover/item:border-primary/50")}>
                                {item.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span className={cn("text-[10px] font-medium leading-snug transition-colors", item.completed ? "text-muted-foreground line-through opacity-70" : "text-foreground group-hover/item:text-primary")}>
                                {item.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Step Action */}
                      <div className="mt-4">
                        <Button
                          size="sm"
                          variant={step.complete ? "ghost" : isCurrent ? "default" : "outline"}
                          onClick={step.onClick}
                          className={cn(
                            "w-full h-8 text-xs font-bold px-2",
                            step.complete ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10" : ""
                          )}
                        >
                          {step.actionLabel}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* All Completed Celebration Banner */}
              {completedCount === 5 && (
                <div className="flex items-center gap-3 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 animate-in fade-in duration-300">
                  <Sparkles className="w-5 h-5 shrink-0 text-emerald-600 animate-pulse" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2 text-xs">
                    <div>
                      <span className="font-bold">🎉 Congratulations! Your podcast is officially launched!</span>
                      <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400">All 5 roadmap milestones are complete and your show is active on the airwaves.</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Podcast Meta Info Container */}
            <div className="relative">
              {activeStepIndex === 0 && <div className="absolute -inset-1 rounded-2xl bg-primary/20 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite] blur-md -z-10" />}
              <Card id="section-metadata" className={cn("relative border bg-card shadow-sm p-6 flex flex-col gap-6 scroll-mt-6 transition-colors duration-500", activeStepIndex === 0 ? "border-primary/50" : "border-border")}>
              <h2 className="text-lg  flex items-center gap-2 border-b border-border/60 pb-3">
                <Info className="w-5 h-5 text-primary" />
                Podcast Metadata
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Artwork */}
                <div id="section-artwork" className="flex flex-col shrink-0 scroll-mt-6 w-32 md:w-48">
                  <FieldLabel text="Cover Art" complete={!!data.artworkUrl} />
                  <div className="flex flex-col gap-2 relative">
                  {activeStepIndex === 0 && !s1_coverComplete && !data.artworkUrl && <div className="absolute -inset-2 rounded-2xl bg-primary/30 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] blur-md -z-10" />}
                  <div 
                    className={cn("w-32 h-32 md:w-48 md:h-48 rounded-xl shadow-md border bg-muted overflow-hidden flex items-center justify-center relative group cursor-pointer transition-colors duration-500", 
                      data.artworkUrl ? "border-emerald-500/50 shadow-emerald-500/20" : 
                      (activeStepIndex === 0 && !s1_coverComplete) ? "border-primary/60 shadow-primary/20" : "border-destructive shadow-destructive/20"
                    )}
                    title="Click to upload artwork"
                  >
                    {!data.artworkUrl && !(activeStepIndex === 0 && !s1_coverComplete) && <AlertCircle className="absolute top-2 right-2 w-5 h-5 text-destructive animate-pulse z-20" />}


                    <MediaPicker 
                      allowedKinds={['image']} 
                      onSelect={(asset) => updateData({ artworkUrl: getAssetPublicUrl(asset) })} 
                      trigger={<div className="absolute inset-0 w-full h-full cursor-pointer z-10"></div>}
                    />
                    {data.artworkUrl ? (
                      <img src={data.artworkUrl} alt={data.title} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                        <Upload className="w-8 h-8 opacity-50" />
                        <span className="text-[10px] font-semibold text-center uppercase tracking-wider px-2">Upload Cover Art</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex flex-col gap-2 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <Upload className="w-6 h-6 text-white" />
                       <span className="text-white text-xs font-bold">Change Image</span>
                    </div>
                  </div>
                  
                  {data.artworkUrl && (
                    <div className="flex gap-2 w-full mt-2">
                      <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1 text-xs font-bold gap-2">
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => updateData({ artworkUrl: '' })} className="flex-none px-2.5">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setStudioOpen(true)} 
                    className="w-full h-7 mt-2 text-[10px] uppercase font-bold text-primary gap-1 px-2 py-0 border-primary/20 bg-primary/5 hover:bg-primary/10"
                  >
                    <Palette className="w-3 h-3" /> Cover Studio
                  </Button>
                  </div>
                </div>

                {/* Core Details */}
                <div className="flex flex-col gap-4 flex-1">
                  <div className="flex flex-col">
                    <FieldLabel text="Show Title" complete={!!(data.title && data.title !== 'Untitled Show')} />
                    <EditableField 
                      value={data.title}
                      onSave={(v) => updateData({ title: v })}
                      className="text-2xl font-black text-foreground !p-1 !-mx-1"
                      placeholder="Untitled Show"
                      status={data.title && data.title !== 'Untitled Show' ? 'complete' : 'incomplete'}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <FieldLabel text="Host Name" complete={!!(data.host && data.host !== 'Unknown Host')} />
                      <EditableField 
                        value={data.host}
                        onSave={(v) => updateData({ host: v })}
                        className="font-medium text-sm text-foreground !p-1 !-mx-1"
                        placeholder="Unknown Host"
                        status={data.host && data.host !== 'Unknown Host' ? 'complete' : 'incomplete'}
                      />
                    </div>
                    <div className="flex flex-col">
                      <FieldLabel text="Contact Email" complete={!!(data.email && data.email !== 'host@example.com')} />
                      <EditableField 
                        value={data.email}
                        onSave={(v) => updateData({ email: v })}
                        className="font-medium text-sm text-foreground !p-1 !-mx-1"
                        placeholder="host@example.com"
                        status={data.email && data.email !== 'host@example.com' ? 'complete' : 'incomplete'}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <FieldLabel text="Show Description" complete={!!(data.description && data.description !== defaultData.description)} />
                  <Button variant="outline" size="sm" onClick={() => setWizardOpen(true)} className="h-6 text-[10px] uppercase font-bold text-primary gap-1 px-2 py-0 border-primary/20 bg-primary/5 hover:bg-primary/10"><Wand2 className="w-3 h-3" /> Wizard</Button>
                </div>
                <EditableField 
                  value={data.description}
                  onSave={(v) => updateData({ description: v })}
                  multiline
                  className={cn("text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap !p-3 !-mx-2 bg-muted/20 rounded-lg", (!data.description || data.description === defaultData.description) && "border-destructive border")}
                  placeholder="Add a description for your podcast here..."
                  status={data.description && data.description !== defaultData.description ? 'complete' : 'incomplete'}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/60">
                <div className="flex flex-col gap-1">
                  <FieldLabel text="Language" complete={!!data.language} />
                  <EditableField 
                    value={data.language}
                    onSave={(v) => updateData({ language: v })}
                    className="font-semibold text-xs text-foreground px-2 h-7 !mx-0 rounded-md flex items-center"
                    placeholder="e.g. English"
                    status={!!data.language ? 'complete' : 'incomplete'}
                  />
                </div>
                
                <div className="flex flex-col gap-1 col-span-2">
                  <FieldLabel text="Categories" complete={!!data.primaryCategory} />
                  <div className="flex flex-col gap-2">
                    <CategoryDropdown 
                      value={data.primaryCategory} 
                      onSave={(v) => updateData({ primaryCategory: v })} 
                      label="Select Primary Category"
                      status={!!data.primaryCategory ? 'complete' : 'incomplete'}
                    />
                    <CategoryDropdown 
                      value={data.secondaryCategory} 
                      onSave={(v) => updateData({ secondaryCategory: v })} 
                      label="Select Secondary Category (Recommended)" 
                    />
                    <CategoryDropdown 
                      value={data.tertiaryCategory} 
                      onSave={(v) => updateData({ tertiaryCategory: v })} 
                      label="Select Tertiary Category (Recommended)" 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <FieldLabel text="Content Rating" />
                  <div className="flex gap-2">
                    <Badge 
                      variant={(data.explicit === 'Clean' || data.explicit === 'No') ? "secondary" : "outline"} 
                      className={cn("cursor-pointer px-3 h-7 text-[10px] flex items-center justify-center", (data.explicit === 'Clean' || data.explicit === 'No') ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "opacity-50 hover:opacity-100")}
                      onClick={() => updateData({ explicit: 'Clean' })}
                    >
                      Clean
                    </Badge>
                    <Badge 
                      variant={(data.explicit === 'Explicit' || data.explicit === 'Yes') ? "destructive" : "outline"} 
                      className={cn("cursor-pointer px-3 h-7 text-[10px] flex items-center justify-center", (data.explicit === 'Explicit' || data.explicit === 'Yes') ? "" : "opacity-50 hover:opacity-100")}
                      onClick={() => updateData({ explicit: 'Explicit' })}
                    >
                      Explicit
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
            </div>

            {/* Directory Submission Container */}
            <div className="relative">
              {(activeStepIndex === 1 || activeStepIndex === 3) && <div className="absolute -inset-1 rounded-2xl bg-primary/20 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite] blur-md -z-10" />}
              <Card id="section-directories" className={cn("relative border bg-card shadow-sm p-6 flex flex-col gap-6 scroll-mt-6 transition-colors duration-500", (activeStepIndex === 1 || activeStepIndex === 3) ? "border-primary/50" : "border-border")}>
              <h2 className="text-lg  flex items-center gap-2 border-b border-border/60 pb-3">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Syndication & Directories
              </h2>
              
              <div className="flex flex-col gap-2">
                <FieldLabel text="Master RSS Feed URL" complete={!!data.rssFeedUrl} />
                <EditableField 
                  value={data.rssFeedUrl}
                  onSave={(v) => updateData({ rssFeedUrl: v })}
                  status={data.rssFeedUrl ? 'complete' : 'incomplete'}
                  className="font-mono text-sm"
                  placeholder="https://feed.yourhost.com/rss"
                />
                <p className="text-xs text-muted-foreground mt-1">This is the link you will submit to all podcast directories.</p>
              </div>

              <div className="mt-2 flex flex-col gap-3">
                  <FieldLabel text="Directory Submissions Checklist" complete={Object.values(data.directoryStatus).every(Boolean)} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'apple', label: 'Apple Podcasts', url: 'https://podcastsconnect.apple.com/' },
                      { id: 'spotify', label: 'Spotify for Creators', url: 'https://creators.spotify.com/' },
                      { id: 'youtube', label: 'YouTube Music', url: 'https://studio.youtube.com/' },
                      { id: 'amazon', label: 'Amazon Music', url: 'https://podcasters.amazon.com/' },
                      { id: 'iheart', label: 'iHeartRadio', url: 'https://podcasters.iheart.com/' },
                    ].map((dir) => {
                      const isComplete = data.directoryStatus[dir.id as keyof PodcastData['directoryStatus']];
                      return (
                        <div key={dir.id} className={cn(
                          "flex items-center justify-between p-3 rounded-lg border shadow-sm transition-all duration-300 relative",
                          isComplete 
                            ? "border-emerald-500/50 bg-emerald-500/5" 
                            : "border-red-500/30 bg-red-500/5"
                        )}>
                          {!isComplete && (
                            <div className="absolute -top-1.5 -right-1.5">
                              <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-[8px] items-center justify-center text-white font-bold">!</span>
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => toggleDirectoryStatus(dir.id as keyof PodcastData['directoryStatus'])}
                              className={cn(
                                "w-5 h-5 rounded-md border flex items-center justify-center transition-colors shadow-sm",
                                isComplete
                                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                                  : 'border-red-500/50 bg-background hover:bg-red-500/10'
                              )}
                            >
                              {isComplete && <Check className="w-3.5 h-3.5" />}
                            </button>
                            <span className={cn("text-sm font-semibold", isComplete ? "text-emerald-700 dark:text-emerald-400" : "text-foreground")}>{dir.label}</span>
                          </div>
                          <a href={dir.url} target="_blank" rel="noreferrer" className={cn("transition-colors", isComplete ? "text-emerald-600/70 hover:text-emerald-600" : "text-muted-foreground hover:text-primary")} title={`Submit to ${dir.label}`}>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )
                    })}
                  </div>
                </div>
            </Card>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            
            
            {/* Hosting & Setup Links Container */}
            <Card id="section-hosting" className="border-border bg-card shadow-sm p-6 flex flex-col gap-4 scroll-mt-6">
              <h2 className="text-lg  flex items-center gap-2 border-b border-border/60 pb-3">
                <Share className="w-5 h-5 text-primary" />
                Hosting Providers
              </h2>
              <p className="text-xs text-muted-foreground mb-1">
                We strongly recommend hosting your podcast on either Substack or Spotify for Creators.
              </p>
              
              <div className="flex flex-col gap-3">
                
                <div className="flex flex-col p-5 rounded-xl border border-border bg-card shadow-sm gap-4 transition-all hover:border-[#ff6719]/40 hover:shadow-md hover:shadow-[#ff6719]/5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#ff6719]/10 flex items-center justify-center shrink-0 border border-[#ff6719]/20">
                        <svg viewBox="0 0 448 512" fill="#ff6719" className="w-6 h-6">
                          <path d="M448 107.1L0 107.1 0 0 448 0 448 107.1zM448 249.1L0 249.1 0 142 448 142 448 249.1zM0 283.9L448 283.9 448 512 224 388.9 0 512 0 283.9z" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-base font-bold text-foreground leading-tight">Substack</span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#ff6719]/10 text-[#ff6719] border border-[#ff6719]/20 uppercase tracking-widest">Recommended</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Newsletters & Paid Subs</span>
                      </div>
                    </div>
                  </div>
                  
                  {(() => {
                    const substackValidation = validateSubstackHandle(data.substackHandle);
                    const isSubstackComplete = Boolean(data.substackHandle && substackValidation.isValid);
                    const handle = isSubstackComplete ? substackValidation.cleaned : null;
                    return (
                      <>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <FieldLabel text="Substack Handle" complete={isSubstackComplete} />
                            {isSubstackComplete && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Valid
                              </span>
                            )}
                          </div>
                          <EditableField 
                            value={data.substackHandle}
                            onSave={(v) => {
                              if (!v.trim()) {
                                updateData({ substackHandle: '' });
                                return;
                              }
                              const res = validateSubstackHandle(v);
                              if (res.isValid) {
                                updateData({ substackHandle: res.cleaned });
                                toast.success(`Substack handle saved: @${res.cleaned}`, { position: 'top-center' });
                              } else {
                                updateData({ substackHandle: v.trim() });
                                toast.error(res.error || 'Invalid Substack handle', { position: 'top-center' });
                              }
                            }}
                            validate={(v) => {
                              if (!v.trim()) return null;
                              const res = validateSubstackHandle(v);
                              return res.isValid ? null : res.error;
                            }}
                            status={isSubstackComplete ? 'complete' : 'incomplete'}
                            className="font-mono text-sm"
                            placeholder="e.g. yourhandle or @yourhandle"
                          />
                          {data.substackHandle && !substackValidation.isValid ? (
                            <p className="text-[11px] text-destructive flex items-center gap-1 font-medium mt-0.5">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              {substackValidation.error}
                            </p>
                          ) : isSubstackComplete ? (
                            <div className="flex items-center text-[11px] mt-0.5 text-muted-foreground">
                              <span>Publication URL:&nbsp;</span>
                              <a 
                                href={`https://${substackValidation.cleaned}.substack.com`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[#ff6719] hover:underline font-semibold flex items-center gap-0.5"
                              >
                                {substackValidation.cleaned}.substack.com
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          ) : (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Use letters, numbers, and hyphens (e.g. <code>my-podcast</code>).
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-4 border-t border-border/50 pt-4 mt-2">
                          {isSubstackComplete ? (
                            <>
                              <div className="flex flex-col gap-3">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Substack Account</span>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Button variant="outline" size="sm" asChild className="h-8 text-xs font-semibold">
                                      <a href={`https://${handle}.substack.com/publish/home`} target="_blank" rel="noreferrer">
                                        Dashboard <ExternalLink className="w-3 h-3 ml-1.5 opacity-50" />
                                      </a>
                                    </Button>
                                    <Button variant="outline" size="sm" asChild className="h-8 text-xs font-semibold">
                                      <a href={`https://${handle}.substack.com/publish/podcasting`} target="_blank" rel="noreferrer">
                                        Podcast <ExternalLink className="w-3 h-3 ml-1.5 opacity-50" />
                                      </a>
                                    </Button>
                                  </div>
                                </div>

                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Help & Resources</span>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Button variant="ghost" size="sm" asChild className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground px-2">
                                      <a href="https://substack.com/podcasts" target="_blank" rel="noreferrer">About Substack Podcast</a>
                                    </Button>
                                    <Button variant="ghost" size="sm" asChild className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground px-2">
                                      <a href="https://on.substack.com/p/introducing-the-substack-recording" target="_blank" rel="noreferrer">Recording Studio</a>
                                    </Button>
                                    <Button variant="ghost" size="sm" asChild className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground px-2">
                                      <a href="https://support.substack.com/hc/en-us/articles/360037462092-How-do-I-create-and-publish-a-podcast-on-Substack" target="_blank" rel="noreferrer">How To Podcast on Substack</a>
                                    </Button>
                                    <Button variant="ghost" size="sm" asChild className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground px-2">
                                      <a href="https://substack.com/resources" target="_blank" rel="noreferrer">Resource Center</a>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="pt-2 border-t border-border/30 mt-1">
                                <Button variant="ghost" size="sm" asChild className="h-8 text-xs font-semibold text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50 px-2 -ml-2">
                                  <a href="https://substack.com/signup" target="_blank" rel="noreferrer">
                                    Sign Up <ExternalLink className="w-3 h-3 ml-1.5 opacity-40" />
                                  </a>
                                </Button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex flex-wrap items-center gap-2">
                                <Button variant="default" size="sm" asChild className="h-8 text-xs font-semibold bg-[#ff6719] hover:bg-[#ff6719]/90 text-white border-0 shadow-sm">
                                  <a href="https://substack.com/signup" target="_blank" rel="noreferrer">
                                    Sign Up <ExternalLink className="w-3 h-3 ml-1.5 opacity-70" />
                                  </a>
                                </Button>
                                <Button variant="outline" size="sm" disabled className="h-8 text-xs font-semibold opacity-40 cursor-not-allowed border-dashed">
                                  Dashboard <ExternalLink className="w-3 h-3 ml-1.5 opacity-50" />
                                </Button>
                                <Button variant="outline" size="sm" disabled className="h-8 text-xs font-semibold opacity-40 cursor-not-allowed border-dashed">
                                  Podcast <ExternalLink className="w-3 h-3 ml-1.5 opacity-50" />
                                </Button>
                              </div>
                              
                              <div className="mt-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-2 block">Help & Resources</span>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Button variant="ghost" size="sm" disabled className="h-8 text-xs font-semibold text-muted-foreground/40 px-2 -ml-2">
                                    About Substack Podcast
                                  </Button>
                                  <Button variant="ghost" size="sm" disabled className="h-8 text-xs font-semibold text-muted-foreground/40 px-2">
                                    Recording Studio
                                  </Button>
                                  <Button variant="ghost" size="sm" disabled className="h-8 text-xs font-semibold text-muted-foreground/40 px-2">
                                    How To Podcast on Substack
                                  </Button>
                                  <Button variant="ghost" size="sm" disabled className="h-8 text-xs font-semibold text-muted-foreground/40 px-2">
                                    Resource Center
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
                
                <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm transition-all overflow-hidden group hover:border-[#1db954]/40 hover:shadow-md hover:shadow-[#1db954]/5">
                  <button 
                    onClick={() => setSpotifyExpanded(!spotifyExpanded)}
                    className="flex items-center justify-between p-5 w-full text-left transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#1db954]/10 flex items-center justify-center shrink-0 border border-[#1db954]/20">
                        <svg viewBox="0 0 496 512" fill="#1db954" className="w-7 h-7">
                           <path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zM362.6 353.4c-4.2 6.8-13.4 9.1-20.2 4.9-55.6-33.9-125.4-41.6-207.6-22.8-7.7 1.8-15.4-3-17.2-10.7-1.8-7.7 3-15.4 10.7-17.2 89.8-20.6 166.7-11.8 229.4 26.5 6.7 4.1 9 13.3 4.9 20.3zm29.8-66.7c-5.3 8.5-16.5 11.2-25 5.9-63.5-39.1-160.8-51.2-223.3-28.1-9.7 3.6-20.4-1.3-24-11-3.6-9.7 1.3-20.4 11-24 71.3-26.3 178.6-12.7 250.7 31.7 8.5 5.3 11.2 16.5 5.6 25.5zm1.5-69.7c-75.9-45-201-49.2-273.8-27.2-11.6 3.5-24-3-27.5-14.6-3.5-11.6 3-24 14.6-27.5 83.2-25.2 222.1-20.3 309.5 31.6 10.5 6.2 13.9 19.8 7.7 30.3-6.1 10.4-19.6 13.8-30.5 7.4z"/>
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-base font-bold text-foreground leading-tight">Spotify for Creators</span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border uppercase tracking-widest">Alternative</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Video Podcasts & Q&A features</span>
                      </div>
                    </div>
                    <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-200", spotifyExpanded && "rotate-180")} />
                  </button>

                  {spotifyExpanded && (
                    <div className="px-5 pb-5 pt-0 mt-1 flex flex-col gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
                      
                      <div className="flex flex-col gap-4 border-t border-border/50 pt-4 mt-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button variant="default" size="sm" asChild className="h-8 text-xs font-semibold bg-[#1db954] hover:bg-[#1db954]/90 text-white border-0 shadow-sm">
                            <a href="https://creators.spotify.com/signup" target="_blank" rel="noreferrer">
                              Sign Up <ExternalLink className="w-3 h-3 ml-1.5 opacity-70" />
                            </a>
                          </Button>
                          <Button variant="outline" size="sm" asChild className="h-8 text-xs font-semibold">
                            <a href="https://creators.spotify.com/" target="_blank" rel="noreferrer">
                              Dashboard <ExternalLink className="w-3 h-3 ml-1.5 opacity-50" />
                            </a>
                          </Button>
                        </div>
                        
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2 block">Help & Resources</span>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button variant="ghost" size="sm" asChild className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground px-2 -ml-2">
                              <a href="https://support.spotify.com/us/creators/" target="_blank" rel="noreferrer">
                                Help Center
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Course List & Checkoff Container */}
            <Card className="border-border bg-card shadow-sm p-6 flex flex-col gap-4">
              <h2 className="text-lg  flex items-center gap-2 border-b border-border/60 pb-3">
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

            {/* Recording Studio now lives at /podcast-tools/studio */}
            <div className="relative">
              {activeStepIndex === 2 && <div className="absolute -inset-1 rounded-2xl bg-primary/20 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite] blur-md -z-10" />}
              <Card className={cn("relative border bg-card shadow-sm p-6 flex flex-col gap-4 sm:flex-row sm:items-center transition-colors duration-500", activeStepIndex === 2 ? "border-primary/50" : "border-border")}>
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <AudioLines className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <h2 className="text-lg  text-foreground">Recording Studio</h2>
                <p className="text-sm text-muted-foreground">
                  Record or upload an episode, cut out mistakes, and Magic Polish the sound before you publish.
                </p>
              </div>
              <Button asChild className="min-h-11 sm:min-h-9 gap-1.5 shrink-0">
                <Link href="/podcast-tools/studio">
                  Open Studio
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </Button>
            </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Description Wizard Modal */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground w-full max-w-xl rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-border bg-muted/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className=" text-base text-foreground">Podcast Description Wizard</h3>
                  <p className="text-xs text-muted-foreground">Follow the 3-question formula: what it's about, who it's for, and what you will talk about.</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setWizardOpen(false)}
                className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground"
              >
                ✕
              </Button>
            </div>

            {/* Questions Form */}
            <div className="p-6 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    1. What is your show about?
                  </label>
                  <span className="text-[10px] text-muted-foreground font-medium">Topic & Core Theme</span>
                </div>
                <textarea 
                  className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all min-h-[70px] resize-y text-foreground" 
                  placeholder="e.g. A weekly breakdown of cutting-edge tech and creative workflows..." 
                  value={wizardData.about} 
                  onChange={e => setWizardData({...wizardData, about: e.target.value})} 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    2. Who is it for?
                  </label>
                  <span className="text-[10px] text-muted-foreground font-medium">Target Audience</span>
                </div>
                <textarea 
                  className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all min-h-[70px] resize-y text-foreground" 
                  placeholder="e.g. Built for creators, founders, and curious minds looking to build the future..." 
                  value={wizardData.for} 
                  onChange={e => setWizardData({...wizardData, for: e.target.value})} 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    3. What will you talk about?
                  </label>
                  <span className="text-[10px] text-muted-foreground font-medium">Content & Format</span>
                </div>
                <textarea 
                  className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all min-h-[70px] resize-y text-foreground" 
                  placeholder="e.g. Get practical blueprints, candid founder interviews, and immediate actionable takeaways every episode." 
                  value={wizardData.why} 
                  onChange={e => setWizardData({...wizardData, why: e.target.value})} 
                />
              </div>

              {/* Live Preview Box */}
              {(wizardData.about || wizardData.for || wizardData.why) && (
                <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> Generated Summary Preview
                  </div>
                  <p className="text-xs text-foreground leading-relaxed italic">
                    {[
                      wizardData.about ? (wizardData.about.trim().endsWith('.') ? wizardData.about.trim() : `${wizardData.about.trim()}.`) : '',
                      wizardData.for ? (wizardData.for.trim().endsWith('.') ? wizardData.for.trim() : `${wizardData.for.trim()}.`) : '',
                      wizardData.why ? (wizardData.why.trim().endsWith('.') ? wizardData.why.trim() : `${wizardData.why.trim()}.`) : ''
                    ].filter(Boolean).join(" ")}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setWizardOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                className="font-bold gap-2"
                onClick={() => {
                  const combined = [
                    wizardData.about ? (wizardData.about.trim().endsWith('.') ? wizardData.about.trim() : `${wizardData.about.trim()}.`) : '',
                    wizardData.for ? (wizardData.for.trim().endsWith('.') ? wizardData.for.trim() : `${wizardData.for.trim()}.`) : '',
                    wizardData.why ? (wizardData.why.trim().endsWith('.') ? wizardData.why.trim() : `${wizardData.why.trim()}.`) : ''
                  ].filter(Boolean).join(" ");

                  if (!combined.trim()) {
                    toast.error('Please answer at least one question before saving.', { position: 'top-center' });
                    return;
                  }

                  updateData({ description: combined });
                  setWizardOpen(false);
                  toast.success('Podcast description updated! ✨', { position: 'top-center' });
                }}
              >
                <Wand2 className="w-4 h-4" />
                Apply to Description
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Help Article Modal */}
      <Dialog open={!!helpModalStep} onOpenChange={(open) => !open && setHelpModalStep(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              {helpModalStep?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {helpModalStep?.content}
          </div>
        </DialogContent>
      </Dialog>

      <CoverStudioDialog
        open={studioOpen}
        onOpenChange={setStudioOpen}
        showTitle={data.title}
        showHost={data.host}
        userId={session?.user?.id ?? null}
        onApply={(url) => updateData({ artworkUrl: url })}
      />
    </div>
  );
}
