"use client";

import { GenerateForm } from "@/app/(home)/_components/generate-resume-form";
import { ProfessionalInfoForm } from "./_components/professional-info-form";
import {
  Candidate,
  CandidateSchema,
} from "@/types/professional-info-form.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { GenerateFormData } from "./_hooks/use-generate-form";
import { GenerateRequestSchema } from "@/types";
import { BrainCircuit, Cpu, File, Rocket, Sparkles } from "lucide-react";

export default function Home() {
  const candidateForm = useForm<Candidate>({
    resolver: zodResolver(CandidateSchema),
    shouldFocusError: true,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const generateResumeForm = useForm<GenerateFormData>({
    resolver: zodResolver(GenerateRequestSchema) as any,
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      job_text: "",
      language: "pt-BR",
      tone: "profissional",
      format: "docx",
    },
  });

  return (
    <div className="relative">
      <header className="mx-auto flex max-w-6xl px-4 pt-6">
        <div className="group flex items-center gap-2">
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-700 to-indigo-600 shadow-lg">
            <Sparkles className="relative z-10 text-white" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[10px] font-semibold uppercase text-primary/80">
              AI
            </span>
            <span className="text-sm font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
              CV MAKER
            </span>
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 pb-20 pt-8 lg:gap-14">
        <section className="relative overflow-hidden rounded-3xl px-4 pt-16 pb-40">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_0%,oklch(0.62_0.16_264_/_0.22),transparent_70%)]" />
          <div className="pointer-events-none absolute top-0 left-1/2 h-[460px] w-[860px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <h1 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
                Bring your experience and let AI build your application kit.
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                Fill out your profile once, paste the job posting, and generate
                a resume and cover letter in your selected language and tone.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1">
                  <Rocket className="h-4 w-4 text-primary" />
                  Everything in under 1 minute
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-border/80 bg-background/80 p-4">
                <BrainCircuit className="mb-2 h-5 w-5 text-primary" />
                <p className="text-sm font-medium">Context-aware AI</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Uses your profile and the job description to generate focused
                  content.
                </p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-background/80 p-4">
                <Cpu className="mb-2 h-5 w-5 text-primary" />
                <p className="text-sm font-medium">Simple flow</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Fill in, review, and download with no unnecessary steps.
                </p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-background/80 p-4">
                <File className="mb-2 h-5 w-5 text-primary" />
                <p className="text-sm font-medium">DOCX output</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ready-to-edit format you can send right away.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="generate"
          className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] mt-[-60px]"
        >
          <aside className="rounded-2xl border border-border/80 bg-card/40 p-5 backdrop-blur-sm lg:sticky lg:top-6">
            <p className="text-sm font-semibold tracking-wide text-primary">
              How it works
            </p>
            <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>1. Complete your professional profile.</li>
              <li>2. Paste the job description and set language/tone.</li>
              <li>3. Generate and download your resume and cover letter.</li>
            </ol>
            <div className="mt-5 rounded-xl border border-border/70 bg-background/70 p-3 text-xs text-muted-foreground">
              Tip: the more context you provide in profile and job description,
              the better the final output.
            </div>
          </aside>

          <div className="space-y-6">
            <ProfessionalInfoForm form={candidateForm} />
            <GenerateForm
              form={generateResumeForm}
              triggerCandidateForm={async () =>
                await candidateForm.trigger(undefined, {
                  shouldFocus: true,
                })
              }
            />
          </div>
        </section>
      </main>
    </div>
  );
}
