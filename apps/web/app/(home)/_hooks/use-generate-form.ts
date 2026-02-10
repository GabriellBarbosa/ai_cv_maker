"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type GenerateResponse } from "@/types";
import { Packer } from "docx";
import { saveAs } from "file-saver";
import { ResumeDocxBuilder } from "@/lib/ResumeDocxBuilder";
import { CoverLetterDocxBuilder } from "@/lib/CoverLetterDocxBuilder";
import { mapServerErrorToFriendlyMessage } from "@/utils/functions/map_server_error_to_friendly_message";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const MIN_CHAR_COUNT = 120;

export type GenerateFormData = {
  job_text: string;
  language: "pt-BR" | "en-US";
  tone: "profissional" | "neutro" | "criativo";
  format: "docx";
};

type StatusStep = {
  label: string;
};

export function useGenerateForm() {
  const [response, setResponse] = useState<GenerateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLanguage, setGeneratedLanguage] =
    useState<GenerateFormData["language"]>("pt-BR");
  const [statusStep, setStatusStep] = useState<number | null>(null);

  const statusSteps = useMemo<StatusStep[]>(
    () => [{ label: "Extraindo requisitos" }, { label: "Gerando conteúdo" }],
    [],
  );

  const shouldShowStatus = statusStep !== null && (isLoading || !!response);

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
      setIsLoading(true);
      setStatusStep(0);
      setResponse(null);

      let timeoutId: number | undefined;

      try {
        setGeneratedLanguage(data.language);
        const controller = new AbortController();
        timeoutId = window.setTimeout(() => controller.abort(), 300_000);

        const res = await fetch(`${API_URL}/v1/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidate_text: window.localStorage.getItem("cv:profile"),
            ...data,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errorMessage = await getErrorMessageFromResponse(res);
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
            "It took longer than expected. Check your connection or try again in a few moments.",
          );
          setStatusStep(null);
          return;
        }

        if (
          err instanceof TypeError &&
          errorMessage.toLowerCase().includes("fetch")
        ) {
          setError(
            "We were unable to communicate with the server. Please confirm your connection or try again later.",
          );
          setStatusStep(null);
          return;
        }

        if (err instanceof Error) {
          const message = mapServerErrorToFriendlyMessage(err.message);
          setError(message);
        } else {
          setError("An unexpected error occurred. Please try again.");
        }

        setStatusStep(null);
      } finally {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
        setIsLoading(false);
      }
    },
    [mapServerErrorToFriendlyMessage],
  );

  const getErrorMessageFromResponse = useCallback(async (res: Response) => {
    let parsedError: unknown = null;

    try {
      parsedError = await res.json();
    } catch {
      throw new Error("Error generating content. Please try again.");
    }

    const errorMessage =
      typeof parsedError === "object" &&
      parsedError !== null &&
      ("detail" in parsedError || "error" in parsedError)
        ? String(
            (parsedError as { detail?: string }).detail ||
              (parsedError as { error?: string }).error,
          )
        : "Error generating content. Please try again.";

    return errorMessage;
  }, []);

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
      const builder = new ResumeDocxBuilder(response.resume, generatedLanguage);
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
          : "Failed to download resume",
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
        },
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
          : "Failed to download cover letter",
      );
    }
  }, [extractCompanyFromGreeting, generatedLanguage, response]);

  return {
    error,
    response,
    isLoading,
    statusSteps,
    statusStep,
    shouldShowStatus,
    onSubmit,
    handleDownloadResumeDocx,
    handleDownloadCoverLetterDocx,
  };
}
