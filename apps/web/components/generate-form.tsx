"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  GenerateRequestSchema, 
  type GenerateResponse 
} from "@ai-cv-maker/schemas"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export function GenerateForm() {
  const [response, setResponse] = useState<GenerateResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  type FormData = {
    candidate_text: string
    job_text: string
    language: "pt-BR" | "en-US"
    tone: "profissional" | "neutro" | "criativo"
    format: "docx"
  }

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
  })

  const language = watch("language")
  const tone = watch("tone")

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch(`${API_URL}/v1/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || "Failed to generate resume")
      }

      const result = await res.json()
      setResponse(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">AI CV Maker</h1>
        <p className="text-muted-foreground">
          Generate a professional resume and cover letter using AI
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Input Information</CardTitle>
            <CardDescription>
              Provide your candidate information and the job description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="candidate_text">Candidate Text</Label>
              <Textarea
                id="candidate_text"
                placeholder="Enter your professional experience, skills, and education..."
                rows={8}
                {...register("candidate_text")}
                className={errors.candidate_text ? "border-destructive" : ""}
              />
              {errors.candidate_text && (
                <p className="text-sm text-destructive">
                  {errors.candidate_text.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_text">Job Description</Label>
              <Textarea
                id="job_text"
                placeholder="Paste the job description here..."
                rows={8}
                {...register("job_text")}
                className={errors.job_text ? "border-destructive" : ""}
              />
              {errors.job_text && (
                <p className="text-sm text-destructive">
                  {errors.job_text.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={language}
                  onValueChange={(value) => setValue("language", value as "pt-BR" | "en-US")}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Portuguese (pt-BR)</SelectItem>
                    <SelectItem value="en-US">English (en-US)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select
                  value={tone}
                  onValueChange={(value) => setValue("tone", value as "profissional" | "neutro" | "criativo")}
                >
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profissional">Professional</SelectItem>
                    <SelectItem value="neutro">Neutral</SelectItem>
                    <SelectItem value="criativo">Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Generating..." : "Generate Resume"}
            </Button>
          </CardContent>
        </Card>
      </form>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Response</CardTitle>
            <CardDescription>
              Your resume and cover letter have been generated successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs max-h-[600px]">
              {JSON.stringify(response, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
