"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Packer } from "docx";
import { saveAs } from "file-saver";
import { ResumeDocxBuilder } from "@/lib/ResumeDocxBuilder";
import { CoverLetterDocxBuilder } from "@/lib/CoverLetterDocxBuilder";
import { CheckCircle2, Circle, Download, Loader2 } from "lucide-react";
import { professionalInfoPlaceholder } from "@/utils/constants/professional_info_placeholder";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type FormData = {
  candidate_text: string;
  job_text: string;
  language: "pt-BR" | "en-US";
  tone: "profissional" | "neutro" | "criativo";
  format: "docx";
};

export function GenerateForm() {
  const [response, setResponse] = useState<GenerateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLanguage, setGeneratedLanguage] =
    useState<FormData["language"]>("pt-BR");
  const [statusStep, setStatusStep] = useState<number | null>(null);

  const mapServerErrorToFriendlyMessage = (message: string) => {
    const normalized = message.toLowerCase();

    if (normalized.includes("too short") || normalized.includes("minimum")) {
      return "Os textos parecem curtos demais. Adicione mais contexto para que possamos personalizar melhor.";
    }

    if (normalized.includes("timeout")) {
      return "A geração expirou. O servidor demorou para responder, tente novamente.";
    }

    if (normalized.includes("rate limit")) {
      return "Geramos muitas solicitações em sequência. Aguarde alguns instantes e tente novamente.";
    }

    if (
      normalized.includes("unauthorized") ||
      normalized.includes("forbidden")
    ) {
      return "Sua sessão expirou. Atualize a página e tente novamente.";
    }

    return (
      message ||
      "Não conseguimos gerar agora. Verifique suas entradas ou tente novamente em breve."
    );
  };

  const statusSteps = useMemo(
    () => [{ label: "Extracting requirements" }, { label: "Generating content" }],
    []
  );

  const renderStatusIcon = (index: number) => {
    if (statusStep === null) {
      return <Circle className="h-4 w-4 text-muted-foreground/40" />;
    }

    if (index < statusStep) {
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    }

    if (index === statusStep) {
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    }

    return <Circle className="h-4 w-4 text-muted-foreground/40" />;
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
    setError(null);

    const trimmedCandidate = data.candidate_text.trim();
    const trimmedJob = data.job_text.trim();
    const MIN_CHAR_COUNT = 120;

    if (trimmedCandidate.length < MIN_CHAR_COUNT) {
      setError(
        "Precisamos de mais detalhes sobre você. Inclua conquistas, responsabilidades e resultados relevantes."
      );
      return;
    }

    if (trimmedJob.length < MIN_CHAR_COUNT) {
      setError(
        "O texto da vaga está muito curto. Adicione requisitos, responsabilidades ou contexto adicional."
      );
      return;
    }

    setIsLoading(true);
    setStatusStep(0);
    setResponse(null);

    let timeoutId: number | undefined;

    try {
      setGeneratedLanguage(data.language);
      const controller = new AbortController();
      timeoutId = window.setTimeout(() => controller.abort(), 90_000);

      const res = await fetch(`${API_URL}/v1/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      if (!res.ok) {
        let parsedError: unknown = null;

        try {
          parsedError = await res.json();
        } catch {
          throw new Error("Erro ao gerar conteúdo. Tente novamente.");
        }

        const errorMessage =
          typeof parsedError === "object" &&
          parsedError !== null &&
          "detail" in parsedError
            ? String(parsedError.detail)
            : "Erro ao gerar conteúdo. Tente novamente.";

        throw new Error(errorMessage);
      }

      const result = await res.json();
      setResponse(result);
    } catch (err) {
      const errorName =
        typeof err === "object" && err !== null && "name" in err
          ? String((err as { name?: string }).name)
          : "";
      const errorMessage = err instanceof Error ? err.message : "";

      if (
        errorName === "AbortError" ||
        errorMessage === "The user aborted a request."
      ) {
        setError(
          "Demorou mais do que o esperado. Verifique sua conexão ou tente novamente em instantes."
        );
        setStatusStep(null);
        return;
      }

      if (
        err instanceof TypeError &&
        errorMessage.toLowerCase().includes("fetch")
      ) {
        setError(
          "Não conseguimos falar com o servidor. Confirme sua conexão ou tente mais tarde."
        );
        setStatusStep(null);
        return;
      }

      if (err instanceof Error) {
        const message = mapServerErrorToFriendlyMessage(err.message);
        setError(message);
      } else {
        setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
      }

      setStatusStep(null);
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    if (statusStep === 0) {
      const timer = window.setTimeout(() => {
        setStatusStep(1);
      }, 1_600);

      return () => {
        window.clearTimeout(timer);
      };
    }
  }, [isLoading, statusStep]);

  useEffect(() => {
    if (!isLoading && response) {
      setStatusStep(2);
    }
  }, [isLoading, response]);

  const shouldShowStatus = statusStep !== null && (isLoading || response);

  const extractCompanyFromGreeting = (greeting: string) => {
    const match = greeting.match(/\b(?:at|da|do|de)\s+([^,]+)/i);

    if (!match) {
      return "";
    }

    return match[1]?.trim() ?? "";
  };

  const handleDownloadResumeDocx = async () => {
    if (!response?.resume) return;

    try {
      const builder = new ResumeDocxBuilder(
        response.resume,
        generatedLanguage
      );
      const doc = builder.build();

      const blob = await Packer.toBlob(doc);
      // Sanitize filename by removing/replacing invalid characters
      const sanitizedName = response.resume.name
        .replace(/[<>:"/\\|?*]/g, "") // Remove invalid characters
        .replace(/\s+/g, "_") // Replace spaces with underscores
        .trim();
      const fileName = `${sanitizedName}_Resume.docx`;
      saveAs(blob, fileName);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Failed to download resume: ${err.message}`
          : "Failed to download resume"
      );
    }
  };

  const handleDownloadCoverLetterDocx = async () => {
    if (!response?.cover_letter || !response?.resume) return;

    try {
      const { cover_letter: coverLetter, resume } = response;
      const builder = new CoverLetterDocxBuilder(
        extractCompanyFromGreeting(coverLetter.greeting),
        resume.job_title,
        coverLetter.body,
        {
          greeting: coverLetter.greeting,
          signature: coverLetter.signature,
          candidateName: resume.name,
          locale: generatedLanguage,
        }
      );

      const doc = builder.build();
      const blob = await Packer.toBlob(doc);
      const sanitizedName = resume.name
        .replace(/[<>:"/\\|?*]/g, "")
        .replace(/\s+/g, "_")
        .trim();
      const fileName = `${sanitizedName}_Cover_Letter.docx`;
      saveAs(blob, fileName);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Failed to download cover letter: ${err.message}`
          : "Failed to download cover letter"
      );
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
                Your professional info
              </Label>
              <Textarea
                id="candidate_text"
                placeholder={professionalInfoPlaceholder}
                rows={7}
                {...register("candidate_text")}
                className={`min-h-[180px] resize-y border-2 border-gray-600 bg-background/70 text-sm leading-relaxed ${
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
                className={`min-h-[180px] resize-y border-2 border-gray-600 bg-background/70 text-sm leading-relaxed ${
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
              variant={`default`}
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
        <Card className="border border-primary/40 bg-primary/5 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Magic is happening
            </CardTitle>
            <CardDescription className="text-xs uppercase tracking-wide text-primary/70">
              Follow the step by step
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusSteps.map((step, index) => {
              const isCurrent = statusStep === index;
              const isCompleted = statusStep !== null && index < statusStep;
              const textClass = isCurrent
                ? "text-foreground font-medium"
                : isCompleted
                ? "text-emerald-600 font-medium"
                : "text-muted-foreground";

              return (
                <div key={step.label} className="flex items-center gap-3">
                  {renderStatusIcon(index)}
                  <span className={`text-sm ${textClass}`}>{step.label}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border border-destructive/60 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">
              Encontramos um problema
            </CardTitle>
            <CardDescription className="text-xs uppercase tracking-wide text-destructive/70">
              Revise suas entradas ou tente novamente em instantes
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
            <CardTitle>Generated Resume</CardTitle>
            <CardDescription>
              Download, fine-tune, or plug into your favourite template.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleDownloadResumeDocx}
              className="w-full font-bold"
              variant="default"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Resume (.docx)
            </Button>
            <Button
              onClick={handleDownloadCoverLetterDocx}
              className="w-full font-bold"
              variant="secondary"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Cover Letter (.docx)
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
