"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GenerateRequestSchema,
  type GenerateResponse,
} from "@ai-cv-maker/schemas";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function GenerateForm() {
  const [response, setResponse] = useState<GenerateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type FormData = {
    candidate_text: string;
    job_text: string;
    language: "pt-BR" | "en-US";
    tone: "profissional" | "neutro" | "criativo";
    format: "docx";
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(GenerateRequestSchema) as any,
    defaultValues: {
      candidate_text: "",
      job_text: "",
      language: "pt-BR",
      tone: "profissional",
      format: "docx",
    },
  });

  const language = watch("language");
  const tone = watch("tone");

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(`${API_URL}/v1/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to generate resume");
      }

      const result = await res.json();
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border border-border/70 bg-gradient-to-b from-card/90 via-card/80 to-card/70 shadow-xl backdrop-blur">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-semibold">
              Generate your application kit
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Share your story, paste the role, and let our AI draft a resume
              and cover letter that feel unmistakably yours.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="mb-2 block" htmlFor="candidate_text">
                Candidate profile
              </Label>
              <Textarea
                id="candidate_text"
                placeholder="Your name, desired role, summaries, achievements, bullet points, education—anything you would share with a recruiter."
                rows={7}
                {...register("candidate_text")}
                className={`min-h-[180px] resize-y border-border/60 bg-background/70 text-sm leading-relaxed ${
                  errors.candidate_text
                    ? "border-destructive/70 focus-visible:ring-destructive/70"
                    : ""
                }`}
              />
              {errors.candidate_text && (
                <p className="text-sm text-destructive">
                  {errors.candidate_text.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label className="mb-2 block" htmlFor="job_text">
                Job description
              </Label>
              <Textarea
                id="job_text"
                placeholder="The information about the job. The more context you add, the sharper the match."
                rows={7}
                {...register("job_text")}
                className={`min-h-[180px] resize-y border-border/60 bg-background/70 text-sm leading-relaxed ${
                  errors.job_text
                    ? "border-destructive/70 focus-visible:ring-destructive/70"
                    : ""
                }`}
              />
              {errors.job_text && (
                <p className="text-sm text-destructive">
                  {errors.job_text.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <Label className="mb-2 block" htmlFor="language">
                  Language
                </Label>
                <Select
                  value={language}
                  onValueChange={(value) =>
                    setValue("language", value as "pt-BR" | "en-US")
                  }
                >
                  <SelectTrigger
                    id="language"
                    className="border-border/60 bg-background/70"
                  >
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="border border-border/60 bg-card">
                    <SelectItem value="pt-BR">Portuguese (pt-BR)</SelectItem>
                    <SelectItem value="en-US">English (en-US)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="mb-2 block" htmlFor="tone">
                  Tone
                </Label>
                <Select
                  value={tone}
                  onValueChange={(value) =>
                    setValue(
                      "tone",
                      value as "profissional" | "neutro" | "criativo"
                    )
                  }
                >
                  <SelectTrigger
                    id="tone"
                    className="border-border/60 bg-background/70"
                  >
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent className="border border-border/60 bg-card">
                    <SelectItem value="profissional">Professional</SelectItem>
                    <SelectItem value="neutro">Neutral</SelectItem>
                    <SelectItem value="criativo">Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-bold"
              variant={`default`}
            >
              {isLoading ? "Generating..." : "Generate resume & cover letter"}
            </Button>
          </CardContent>
        </Card>
      </form>

      {error && (
        <Card className="border border-destructive/60 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">We hit a snag</CardTitle>
            <CardDescription className="text-xs uppercase tracking-wide text-destructive/70">
              Check your inputs or try again in a moment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {response && (
        <Card className="border border-border/70 bg-card/80 shadow-lg">
          <CardHeader>
            <CardTitle>Generated response</CardTitle>
            <CardDescription>
              Download, fine-tune, or plug into your favourite template.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-[600px] overflow-auto rounded-xl border border-border/60 bg-background/70 p-4 text-xs leading-relaxed">
              {JSON.stringify(response, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
