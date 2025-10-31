import Link from "next/link";
import { ArrowRight, FileText, Globe2, Sparkles } from "lucide-react";

import { GenerateForm } from "@/components/generate-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Tailored to Every Role",
    description:
      "Paste the job description and our AI reshapes your experience to match the role precisely.",
    icon: FileText,
  },
  {
    title: "Cover Letters in Seconds",
    description:
      "Generate companion cover letters with the tone and language that feel right for each opportunity.",
    icon: Sparkles,
  },
  {
    title: "Ready for Global Applications",
    description:
      "Switch languages instantly and deliver polished resumes in Portuguese or English.",
    icon: Globe2,
  },
];

const stats = [
  { value: "5× faster", hint: "than writing from scratch" },
  { value: "92%", hint: "users felt more confident applying" },
  { value: "60s", hint: "to your first polished draft" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <main className="relative z-10 flex flex-col gap-24 pb-24 pt-20 grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section id="generate" className="container mx-auto px-6">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Start now
            </span>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Bring your experience and let AI handle the rest.
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              Add your background, paste the job description, choose your
              preferred language or tone, and receive a polished CV plus cover
              letter in under a minute.
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                Personalize tone and format without leaving the flow.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                Export structured JSON you can feed into any template.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                Designed for clarity in dark environments and late-night prep
                sessions.
              </li>
            </ul>
          </div>
        </section>
        <section id="generate" className="container mx-auto lg:px-6">
          <GenerateForm />
        </section>
      </main>
    </div>
  );
}
