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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { StatusCard } from "./status-card";
import { ErrorCard } from "./error-card";
import { ResultCard } from "./result-card";
import { GenerateFormData, useGenerateForm } from "../_hooks/use-generate-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Controller, UseFormReturn } from "react-hook-form";

interface Props {
  form: UseFormReturn<GenerateFormData>;
  triggerCandidateForm: (arg?: any) => Promise<boolean>;
}

export function GenerateForm({ form, triggerCandidateForm }: Props) {
  const {
    error,
    response,
    isLoading,
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
    formState: { errors },
    control,
    watch,
  } = form;

  console.log(watch());

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit(async (data) => {
          const shouldSubmit = await triggerCandidateForm();

          if (shouldSubmit) {
            onSubmit(data);
          }
        })}
        className="space-y-6"
      >
        <Card>
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-semibold">
              Gere seu kit de candidatura.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Field className="space-y-3">
              <FieldLabel htmlFor="job_text">Descrição da vaga</FieldLabel>
              <Textarea
                id="job_text"
                spellCheck={false}
                placeholder="As informações sobre a vaga. Quanto mais contexto você adicionar, melhor será o alinhamento."
                {...register("job_text")}
                className={`min-h-[180px] resize-y ${
                  error
                    ? "border-destructive/70 focus-visible:ring-destructive/70"
                    : ""
                }`}
              />
              {errors.job_text?.message && (
                <FieldError className="text-sm text-destructive">
                  {errors.job_text?.message}
                </FieldError>
              )}
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <Label className="mb-2 block" htmlFor="language">
                  Idioma do currículo
                </Label>
                <Controller
                  name="language"
                  control={control}
                  render={({ field }) => (
                    <Select
                      name="language"
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Selecione o idioma" />
                      </SelectTrigger>
                      <SelectContent className="border border-2 border-gray-600 bg-card">
                        <SelectItem value="pt-BR">
                          Portuguese (pt-BR)
                        </SelectItem>
                        <SelectItem value="en-US">English (en-US)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-3">
                <Label className="mb-2 block" htmlFor="tone">
                  Tom
                </Label>
                <Controller
                  name="tone"
                  control={control}
                  render={({ field }) => (
                    <Select
                      name="tone"
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="tone">
                        <SelectValue placeholder="Selecione o tom" />
                      </SelectTrigger>
                      <SelectContent className="border border-2 border-gray-600 bg-card">
                        <SelectItem value="profissional">
                          Profissional
                        </SelectItem>
                        <SelectItem value="neutro">Neutro</SelectItem>
                        <SelectItem value="criativo">Criativo</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
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
                "Gerar currículo e carta de apresentação"
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
          canDownloadCoverLetter={Boolean(
            response.cover_letter && response.resume,
          )}
        />
      )}
    </div>
  );
}
