"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { professionalInfoPlaceholder } from "@/utils/constants/professional_info_placeholder";
import { Loader2 } from "lucide-react";
import { TextAreaField } from "./components/text-area-field";
import { StatusCard } from "./components/status-card";
import { ErrorCard } from "./components/error-card";
import { ResultCard } from "./components/result-card";
import { useGenerateForm } from "./hooks/use-generate-form";

export function GenerateForm() {
  const {
    form,
    error,
    response,
    isLoading,
    language,
    tone,
    statusSteps,
    statusStep,
    shouldShowStatus,
    onSubmit,
    handleDownloadResumeDocx,
    handleDownloadCoverLetterDocx,
  } = useGenerateForm();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

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
            <TextAreaField
              field="candidate_text"
              label="Your professional info"
              placeholder={professionalInfoPlaceholder}
              register={register}
              error={errors.candidate_text?.message}
            />

            <TextAreaField
              field="job_text"
              label="Job description"
              placeholder="The information about the job. The more context you add, the sharper the match."
              register={register}
              error={errors.job_text?.message}
            />

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
                    className="border-2 border-gray-600 bg-background/70"
                  >
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="border border-2 border-gray-600 bg-card">
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
                    className="border-2 border-gray-600 bg-background/70"
                  >
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent className="border border-2 border-gray-600 bg-card">
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
              variant="default"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando...
                </span>
              ) : (
                "Generate resume & cover letter"
              )}
            </Button>
          </CardContent>
        </Card>
      </form>

      {shouldShowStatus && (
        <StatusCard steps={statusSteps} currentStep={statusStep} />
      )}

      {error && <ErrorCard message={error} />}

      {response && (
        <ResultCard
          onDownloadResume={handleDownloadResumeDocx}
          onDownloadCoverLetter={handleDownloadCoverLetterDocx}
          canDownloadResume={Boolean(response.resume)}
          canDownloadCoverLetter={Boolean(response.cover_letter && response.resume)}
        />
      )}
    </div>
  );
}
