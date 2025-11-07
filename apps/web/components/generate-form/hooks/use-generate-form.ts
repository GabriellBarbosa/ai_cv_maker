"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GenerateRequestSchema,
  type GenerateResponse,
} from "@ai-cv-maker/schemas";
import { Packer } from "docx";
import { saveAs } from "file-saver";
import { ResumeDocxBuilder } from "@/lib/ResumeDocxBuilder";
import { CoverLetterDocxBuilder } from "@/lib/CoverLetterDocxBuilder";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const MIN_CHAR_COUNT = 120;

export type GenerateFormData = {
  candidate_text: string;
  job_text: string;
  language: "pt-BR" | "en-US";
  tone: "profissional" | "neutro" | "criativo";
  format: "docx";
};

type StatusStep = {
  label: string;
};

export type UseGenerateFormReturn = {
  form: UseFormReturn<GenerateFormData>;
  error: string | null;
  response: GenerateResponse | null;
  isLoading: boolean;
  language: GenerateFormData["language"];
  tone: GenerateFormData["tone"];
  statusSteps: StatusStep[];
  statusStep: number | null;
  shouldShowStatus: boolean;
  onSubmit: (data: GenerateFormData) => Promise<void>;
  handleDownloadResumeDocx: () => Promise<void>;
  handleDownloadCoverLetterDocx: () => Promise<void>;
};

export function useGenerateForm(): UseGenerateFormReturn {
  const [response, setResponse] = useState<GenerateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLanguage, setGeneratedLanguage] =
    useState<GenerateFormData["language"]>("pt-BR");
  const [statusStep, setStatusStep] = useState<number | null>(null);

  const statusSteps = useMemo<StatusStep[]>(
    () => [
      { label: "Extracting requirements" },
      { label: "Generating content" },
    ],
    []
  );

  const form = useForm<GenerateFormData>({
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

  const language = form.watch("language");
  const tone = form.watch("tone");

  const shouldShowStatus = statusStep !== null && (isLoading || !!response);

  const mapServerErrorToFriendlyMessage = useCallback((message: string) => {
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
  }, []);

  const extractCompanyFromGreeting = useCallback((greeting: string) => {
    const match = greeting.match(/\b(?:at|da|do|de)\s+([^,]+)/i);

    if (!match) {
      return "";
    }

    return match[1]?.trim() ?? "";
  }, []);

  const onSubmit = useCallback(
    async (data: GenerateFormData) => {
      setError(null);

      const trimmedCandidate = data.candidate_text.trim();
      const trimmedJob = data.job_text.trim();

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
              ? String((parsedError as { detail?: string }).detail)
              : "Erro ao gerar conteúdo. Tente novamente.";

          throw new Error(errorMessage);
        }

        const result = (await res.json()) as GenerateResponse;
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
    },
    [mapServerErrorToFriendlyMessage]
  );

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

  const handleDownloadResumeDocx = useCallback(async () => {
    if (!response?.resume) return;

    try {
      const builder = new ResumeDocxBuilder(
        response.resume,
        generatedLanguage
      );
      const doc = builder.build();

      const blob = await Packer.toBlob(doc);
      const sanitizedName = response.resume.name
        .replace(/[<>:"/\\|?*]/g, "")
        .replace(/\s+/g, "_")
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
  }, [generatedLanguage, response]);

  const handleDownloadCoverLetterDocx = useCallback(async () => {
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
  }, [extractCompanyFromGreeting, generatedLanguage, response]);

  return {
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
  };
}
