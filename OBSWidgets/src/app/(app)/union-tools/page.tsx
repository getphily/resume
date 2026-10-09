'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  Scale, 
  CalendarClock, 
  Calculator, 
  Vote, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StudioShell } from '@/components/StudioShell';

export default function UnionToolsPage() {
  const toolsList = [
    {
      icon: Scale,
      title: "CBA Contract Comparison Matrix",
      badge: "In Development",
      description: "Side-by-side Collective Bargaining Agreement clause comparison. Diff proposed management language against existing union contract articles.",
    },
    {
      icon: CalendarClock,
      title: "Grievance Deadline Tracker",
      badge: "In Development",
      description: "Automated steward timeline manager for Step 1, Step 2, and Step 3 arbitration filings to ensure union members never miss critical contractual deadlines.",
    },
    {
      icon: Calculator,
      title: "Solidarity Wage & Step Estimator",
      badge: "Roadmap",
      description: "Model salary step ladders, longevity differentials, and cost-of-living adjustments across the bargaining unit with transparent data tables.",
    },
    {
      icon: Vote,
      title: "Quorum & Roll-Call Voting Counter",
      badge: "Roadmap",
      description: "Real-time meeting attendance check-in, majority verification, and confidential roll-call voting records for union general meetings.",
    },
  ];

  const settingsPanel = (
    <div className="flex flex-col gap-4 pb-10">
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 flex items-start gap-3 text-sm text-foreground">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-blue-700 dark:text-blue-300">
            Free Tools for Worker Power
          </span>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Our goal is to provide democratic unions and organizers with modern software that levels the playing field against corporate labor relations firms.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-xs  uppercase tracking-wider text-muted-foreground ml-1">Upcoming Modules</h3>
        {toolsList.map((tool, idx) => {
          const IconComp = tool.icon;
          return (
            <Card key={idx} className="border-border bg-card p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <IconComp className="w-4 h-4 text-primary" />
                <h4 className=" text-sm text-foreground">{tool.title}</h4>
              </div>
              <p className="text-xs text-muted-foreground">{tool.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const previewCanvas = (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-muted/20 border border-dashed border-border rounded-xl">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Users className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl  text-foreground mb-2">UnionTools</h2>
      <p className="text-sm text-muted-foreground max-w-md text-center mb-8">
        Open digital utilities to empower stewards, bargaining committees, and rank-and-file union members.
      </p>
      <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-600 px-4 py-1 gap-2 text-sm">
        <Sparkles className="w-4 h-4" />
        Worker Solidarity Suite
      </Badge>
    </div>
  );

  return (
    <StudioShell
      title="UnionTools"
      icon={<Users className="w-4 h-4" />}
      widgetName="Labor Organizing Hub"
      hasId={false}
      onNameChange={() => {}}
      onSave={async () => {}}
      isSaving={false}
      settingsPanel={settingsPanel}
      previewCanvas={previewCanvas}
    />
  );
}
