'use client';

import React, { useState } from 'react';
import { 
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StudioShell } from '@/components/StudioShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const coursesList = [
  {
    id: 'concept',
    title: "Concept & Niche",
    lesson: "A strong podcast starts with a clear niche. Who is your audience? What unique perspective do you bring? Choose a name that is memorable and clearly communicates your topic.",
  },
  {
    id: 'format',
    title: "Format & Description",
    lesson: "Will your show be solo, interview-based, or a co-hosted banter? Write a compelling show description. This is your pitch to potential listeners browsing Apple Podcasts.",
  },
  {
    id: 'artwork',
    title: "Cover Art",
    lesson: "Cover art must be a square JPG or PNG, between 1400x1400 and 3000x3000 pixels. Use large, legible text and high-contrast colors so it stands out on mobile screens.",
  },
  {
    id: 'recording',
    title: "Recording Your First Episode",
    lesson: "Use a dynamic microphone if you are in an untreated room. Record a 'Trailer' (1-3 minutes) introducing the show to get your RSS feed approved before launching full episodes.",
  },
  {
    id: 'hosting',
    title: "Hosting & RSS",
    lesson: "You need a podcast host (like Spotify for Podcasters, Buzzsprout, or Transistor) to store your audio files. They will generate an 'RSS Feed URL' which is the master link you submit to directories.",
  },
  {
    id: 'distribution',
    title: "Distribution",
    lesson: "Once you have your RSS Feed URL with at least one published episode (or trailer), submit it to the major directories. Approval can take a few days.",
  },
  {
    id: 'live',
    title: "Live-to-Tape Recording",
    lesson: "The 'Live-to-Tape' methodology means recording your podcast exactly as if you were broadcasting live on the radio. Instead of stopping to edit out mistakes or mixing in intro music during post-production, you trigger all sound effects, music beds, and segments in real-time while you record. This approach forces you to embrace minor imperfections, keeping the energy authentic and conversational, while saving you hours of tedious editing work later.",
  }
];

  export default function PodcastCoursesPage() {
    const [activeCourseId, setActiveCourseId] = useState<string>(coursesList[0].id);
    const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  
    React.useEffect(() => {
      const saved = localStorage.getItem('podcast_courses_completed');
      if (saved) {
        try {
          setCompletedCourses(JSON.parse(saved));
        } catch(e) {}
      }
    }, []);
  
    const toggleComplete = (id: string) => {
      const next = completedCourses.includes(id) 
        ? completedCourses.filter(c => c !== id) 
        : [...completedCourses, id];
      setCompletedCourses(next);
      localStorage.setItem('podcast_courses_completed', JSON.stringify(next));
    };
  
    const activeCourse = coursesList.find(c => c.id === activeCourseId) || coursesList[0];
    const isCompleted = completedCourses.includes(activeCourse.id);
  
    const settingsPanel = (
      <div className="flex flex-col gap-4 pb-10">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Curriculum</h3>
        <div className="flex flex-col gap-2">
          {coursesList.map((course, idx) => {
            const completed = completedCourses.includes(course.id);
            return (
              <Button
                key={course.id}
                variant={activeCourseId === course.id ? "default" : "outline"}
                className={`w-full justify-between text-xs h-auto py-3 px-4 ${activeCourseId === course.id ? 'bg-primary' : 'bg-card'}`}
                onClick={() => setActiveCourseId(course.id)}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="font-bold">Lesson {idx + 1}: {course.title}</span>
                </div>
                {completed && <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
              </Button>
            );
          })}
        </div>
      </div>
    );
  
    const previewCanvas = (
      <div className="w-full h-full p-4 sm:p-8 flex items-center justify-center bg-muted/20">
        <Card className="w-full max-w-2xl border-border bg-card shadow-xl overflow-hidden flex flex-col p-8 sm:p-12 relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <Badge variant="outline" className="w-fit text-[10px] border-blue-500/30 text-blue-600 mb-1">
                Mini-Course
              </Badge>
              <h2 className="text-2xl font-black text-foreground">
                {activeCourse.title}
              </h2>
            </div>
          </div>
          
          <div className="prose prose-sm dark:prose-invert flex-1">
            <p className="text-base leading-relaxed text-muted-foreground">
              {activeCourse.lesson}
            </p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border flex justify-end">
            <Button 
              variant={isCompleted ? "secondary" : "default"}
              onClick={() => toggleComplete(activeCourse.id)}
            >
              {isCompleted ? "Completed" : "Mark as Completed"}
            </Button>
          </div>
        </Card>
      </div>
    );

  return (
    <StudioShell
      title="Short Courses"
      icon={<GraduationCap className="w-4 h-4" />}
      widgetName="Podcast Education"
      hasId={false}
      onNameChange={() => {}}
      onSave={async () => {}}
      isSaving={false}
      settingsPanel={settingsPanel}
      previewCanvas={previewCanvas}
    />
  );
}
