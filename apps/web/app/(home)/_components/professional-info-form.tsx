"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Candidate,
  CandidateSchema,
} from "@/types/professional-info-form.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusIcon, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMonthYear } from "@/utils/functions/format-month-year";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProfessionalInfoForm() {
  const { register, control, setValue, watch } = useForm<Candidate>({
    resolver: zodResolver(CandidateSchema),
    defaultValues: {
      languages: [],
    },
  });

  const {
    fields: externalLinks,
    insert: insertExternalLink,
    remove: removeExternalLink,
  } = useFieldArray({
    control,
    name: "external_links",
  });

  const {
    fields: experiences,
    insert: insertExperience,
    remove: removeExperience,
  } = useFieldArray({
    control,
    name: "experiences",
  });

  const {
    fields: education,
    insert: insertEducation,
    remove: removeEducation,
  } = useFieldArray({
    control,
    name: "education",
  });

  const {
    fields: languages,
    insert: insertLanguage,
    remove: removeLanguage,
  } = useFieldArray({
    control,
    name: "languages",
  });

  return (
    <form>
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-semibold">
            Your professional info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-y-6 gap-x-4 sm:flex-row">
            <Field>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="Gabriel Barbosa de Almeida"
                {...register("name", {
                  required: true,
                })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="professional_title">
                Professional title
              </FieldLabel>
              <Input
                id="professional_title"
                type="text"
                placeholder="Full Stack developer"
                {...register("professional_title", {
                  required: true,
                })}
              />
            </Field>
          </div>

          <div className="flex flex-col gap-y-6 gap-x-4 sm:flex-row">
            <Field>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input
                id="email"
                type="text"
                placeholder="gabriel.dev.front@gmail.com"
                {...register("contact_information.email", {
                  required: true,
                })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Phone number</FieldLabel>
              <Input
                id="phone"
                type="text"
                placeholder="+55 11 94928 8027"
                {...register("contact_information.phone", {
                  required: true,
                })}
              />
            </Field>
          </div>

          <div className="flex gap-y-6 gap-x-4 flex-row">
            <Field>
              <FieldLabel htmlFor="state">State</FieldLabel>
              <Input
                id="state"
                type="text"
                placeholder="São Paulo"
                {...register("contact_information.state", {
                  required: true,
                })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="city">City</FieldLabel>
              <Input
                id="city"
                type="text"
                placeholder="SP"
                {...register("contact_information.city", {
                  required: true,
                })}
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="candidate_introduction">
              Introduce yourself
            </FieldLabel>
            <Textarea
              id="candidate_introduction"
              placeholder="Full-stack developer since 2021, focused on building scalable, user-centric web applications. Experienced with React, Next.js, NestJS, TypeORM, and PostgreSQL, with a strong emphasis on performance, clean code, and modern architecture."
              {...register("candidate_introduction", { required: true })}
            />
          </Field>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <Label>External Links</Label>
                  <p className="text-sm text-muted-foreground">
                    LinkedIn, Portfolio, etc.
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  aria-label="Add external link"
                  onClick={() => insertExternalLink(0, { label: "", url: "" })}
                >
                  <PlusIcon />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {!externalLinks?.length && (
                  <p className="text-base text-muted-foreground md:text-lg">
                    Click the plus button to add useful links like your
                    LinkedIn, Portfolio website, etc.
                  </p>
                )}

                {externalLinks?.map((field, index) => (
                  <div className="flex gap-4 items-center" key={field.id}>
                    <Field>
                      {index === 0 && <FieldLabel>Label</FieldLabel>}
                      <Input
                        type="text"
                        placeholder="LinkedIn"
                        {...register(`external_links.${index}.label`)}
                      />
                    </Field>
                    <Field>
                      {index === 0 && <FieldLabel>URL</FieldLabel>}
                      <Input
                        type="text"
                        placeholder="https://www.linkedin.com/in/gabriel-barbosa-de-almeida-57b87b18a/"
                        {...register(`external_links.${index}.url`)}
                      />
                    </Field>
                    <Button
                      type="button"
                      className="self-end rounded-full"
                      variant="ghost"
                      size="icon"
                      aria-label="Add external link"
                      onClick={() => removeExternalLink(index)}
                    >
                      <Trash className="text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <Label>Professional Experiences</Label>
                <Button
                  type="button"
                  size="icon"
                  aria-label="Add external link"
                  onClick={() =>
                    insertExperience(0, {
                      role: "",
                      company: "",
                      start_date: "",
                      end_date: "",
                      current_job: false,
                      description: "",
                      soft_skills: [],
                      hard_skills: [],
                    })
                  }
                >
                  <PlusIcon />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {!experiences?.length && (
                  <p className="text-base text-muted-foreground md:text-lg">
                    Click the plus button to add a professional experience.
                  </p>
                )}

                {experiences?.map((field, index) => (
                  <div className="flex-1 space-y-4" key={field.id}>
                    <div className="flex items-center justify-between">
                      <p className="font-bold">
                        Experience{" "}
                        {experiences.length > 1
                          ? `${index + 1} of ${experiences.length}`
                          : ``}
                      </p>
                      <Button
                        type="button"
                        className="self-end rounded-full"
                        variant="ghost"
                        size="icon"
                        aria-label="Add external link"
                        onClick={() => removeExperience(index)}
                      >
                        <Trash className="text-red-500" />
                      </Button>
                    </div>
                    <Field>
                      <FieldLabel>Role</FieldLabel>
                      <Input
                        type="text"
                        placeholder="Full Stack developer"
                        {...register(`experiences.${index}.role`)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Company</FieldLabel>
                      <Input
                        type="text"
                        placeholder="Elleve"
                        {...register(`experiences.${index}.company`)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Description</FieldLabel>
                      <Textarea
                        placeholder="Implementei a funcionalidade de simulação de crédito consignado, integrando o sistema com APIs financeiras..."
                        {...register("candidate_introduction", {
                          required: true,
                        })}
                      />
                    </Field>
                    <div className="flex gap-4 items-start">
                      <Field>
                        <FieldLabel>Start date</FieldLabel>
                        <Input
                          type="text"
                          placeholder="02/2025"
                          {...register(`experiences.${index}.start_date`)}
                          onChange={(e) =>
                            setValue(
                              `experiences.${index}.start_date`,
                              formatMonthYear(e.target.value),
                            )
                          }
                        />
                      </Field>

                      <div className="w-full space-y-2">
                        <Field>
                          <FieldLabel>End date</FieldLabel>
                          <Input
                            type="text"
                            placeholder="11/2025"
                            {...register(`experiences.${index}.start_date`)}
                            onChange={(e) =>
                              setValue(
                                `experiences.${index}.start_date`,
                                formatMonthYear(e.target.value),
                              )
                            }
                          />
                        </Field>

                        <Field orientation="horizontal">
                          <Checkbox
                            id={`experiences.${index}.current_job`}
                            onCheckedChange={(value) =>
                              setValue(
                                `experiences.${index}.current_job`,
                                !!value,
                              )
                            }
                          />
                          <FieldLabel
                            htmlFor={`experiences.${index}.current_job`}
                          >
                            This is my current job
                          </FieldLabel>
                        </Field>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <Label>Education</Label>
                <Button
                  type="button"
                  size="icon"
                  aria-label="Add external link"
                  onClick={() =>
                    insertEducation(0, {
                      degree: "",
                      end_date: "",
                      start_date: "",
                      institution: "",
                      in_progress: false,
                    })
                  }
                >
                  <PlusIcon />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {!education?.length && (
                  <p className="text-base text-muted-foreground md:text-lg">
                    Click the plus button to add an education entry.
                  </p>
                )}

                {education?.map((field, index) => (
                  <div className="flex-1 space-y-4" key={field.id}>
                    <div className="flex items-center justify-between">
                      <p className="font-bold">
                        Education entry{" "}
                        {education.length > 1
                          ? `${index + 1} of ${education.length}`
                          : ``}
                      </p>
                      <Button
                        type="button"
                        className="self-end rounded-full"
                        variant="ghost"
                        size="icon"
                        aria-label="Add external link"
                        onClick={() => removeEducation(index)}
                      >
                        <Trash className="text-red-500" />
                      </Button>
                    </div>
                    <Field>
                      <FieldLabel>Degree</FieldLabel>
                      <Input
                        type="text"
                        placeholder="system analysis and development"
                        {...register(`education.${index}.degree`)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Institution</FieldLabel>
                      <Input
                        type="text"
                        placeholder="Universidade Anhembi Morumbi"
                        {...register(`education.${index}.institution`)}
                      />
                    </Field>
                    <div className="flex gap-4 items-start">
                      <Field>
                        <FieldLabel>Start date</FieldLabel>
                        <Input
                          type="text"
                          placeholder="02/2025"
                          {...register(`education.${index}.start_date`)}
                          onChange={(e) =>
                            setValue(
                              `education.${index}.start_date`,
                              formatMonthYear(e.target.value),
                            )
                          }
                        />
                      </Field>

                      <div className="w-full space-y-2">
                        <Field>
                          <FieldLabel>End date</FieldLabel>
                          <Input
                            type="text"
                            placeholder="11/2025"
                            {...register(`education.${index}.end_date`)}
                            onChange={(e) =>
                              setValue(
                                `education.${index}.end_date`,
                                formatMonthYear(e.target.value),
                              )
                            }
                          />
                        </Field>

                        <Field orientation="horizontal">
                          <Checkbox
                            id={`education.${index}.in_progress`}
                            onCheckedChange={(value) =>
                              setValue(
                                `education.${index}.in_progress`,
                                !!value,
                              )
                            }
                          />
                          <FieldLabel
                            htmlFor={`education.${index}.in_progress`}
                          >
                            In progress
                          </FieldLabel>
                        </Field>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <Label>Languages</Label>
                </div>
                <Button
                  type="button"
                  size="icon"
                  aria-label="Add a language that you speak"
                  onClick={() => insertLanguage(0, { name: "", level: "" })}
                >
                  <PlusIcon />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {!languages?.length && (
                  <p className="text-base text-muted-foreground md:text-lg">
                    Click the plus button to add the languages that you speak.
                  </p>
                )}

                {languages?.map((field, index) => (
                  <div className="flex gap-4 items-center" key={field.id}>
                    <Field>
                      {index === 0 && <FieldLabel>Language</FieldLabel>}
                      <Input
                        type="text"
                        placeholder="English"
                        {...register(`languages.${index}.name`)}
                      />
                    </Field>
                    <Field>
                      {index === 0 && <FieldLabel>Level</FieldLabel>}
                      <Controller
                        name={`languages.${index}.level`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a level" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">
                                Intermediate
                              </SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>
                    <Button
                      type="button"
                      className="self-end rounded-full"
                      variant="ghost"
                      size="icon"
                      aria-label="Add external link"
                      onClick={() => removeLanguage(index)}
                    >
                      <Trash className="text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </form>
  );
}
