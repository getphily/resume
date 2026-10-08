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

export default function PodcastCoursesPage() {
  const [activeCourseId, setActiveCourseId] = useState<string>(coursesList[0].id);
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);

  React.useEffect(() => {
    // Read URL params
    const params = new URLSearchParams(window.location.search);
    const cId = params.get('courseId');
    if (cId && coursesList.some(c => c.id === cId)) {
      setActiveCourseId(cId);
    }

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
