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
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Top Banner Header */}
      <div className="border-b border-border bg-card/50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
                <span>getphily&apos;s code stand</span>
              </Link>
            </Button>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Labor Organizing
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 gap-1.5 px-2.5 py-0.5 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Worker Solidarity Suite
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">
                  Open Source & Pro-Labor
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                Union Tools
              </h1>
              <p className="text-base text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                Open digital utilities to empower stewards, bargaining committees, and rank-and-file union members.
              </p>
            </div>

            <Button asChild variant="outline" className="shrink-0 gap-2 font-medium">
              <Link href="/#toolsets">
                Explore All Toolsets
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
        
        {/* Solidarity Mission Callout */}
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 sm:p-5 flex items-start gap-3.5 text-sm text-foreground">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-blue-700 dark:text-blue-300">
              Free & Open Tools for Worker Power
            </span>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              <strong>Union Tools</strong> is being built as a dedicated module of <strong>getphily&apos;s code stand</strong>. Our goal is to provide democratic unions and organizers with modern software that levels the playing field against corporate labor relations firms.
            </p>
          </div>
        </div>

        {/* Planned Utilities Grid */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Upcoming Modules</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tools designed for stewards, contract enforcement, and democratic collective bargaining.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {toolsList.map((tool, idx) => {
              const IconComp = tool.icon;
              return (
                <Card key={idx} className="border-border bg-card shadow-xs flex flex-col p-5 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {tool.badge}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-base text-foreground mb-1">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {tool.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Community & Solidarity Callout */}
        <Card className="border-border bg-card p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2 text-left">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Privacy-First & Secure
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
              All contract data, member rosters, and grievance calculations remain private to your local union branch with local-first encryption options.
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0 gap-2">
            <Link href="/">
              <span>Back to Code Stand</span>
            </Link>
          </Button>
        </Card>

      </main>
    </div>
  );
}
