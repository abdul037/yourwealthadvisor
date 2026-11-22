import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TharwaLogo } from '@/components/TharwaLogo';
import { LEGAL } from '@/lib/legal';

export interface LegalSection {
  heading: string;
  body: ReactNode;
}

interface LegalPageProps {
  title: string;
  intro: ReactNode;
  sections: LegalSection[];
}

/** Shared layout for the public Privacy Policy and Terms of Service pages. */
export function LegalPage({ title, intro, sections }: LegalPageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/welcome'))}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Link to="/welcome" aria-label="Tharwa Net home">
            <TharwaLogo size="sm" variant="full" />
          </Link>
        </div>

        {LEGAL.isDraft && (
          <div
            role="note"
            className="mb-6 flex gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
          >
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              <span className="font-semibold">Draft.</span> This document has not yet had legal review and
              some company details are still to be added.
            </p>
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {LEGAL.lastUpdated}</p>

        <div className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">{intro}</div>

        <div className="mt-8 space-y-8">
          {sections.map((section, index) => (
            <section key={section.heading}>
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                {index + 1}. {section.heading}
              </h2>
              <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-12 pt-6 border-t border-border flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms of Service</Link>
          <span>© 2026 {LEGAL.appName}</span>
        </footer>
      </main>
    </div>
  );
}
