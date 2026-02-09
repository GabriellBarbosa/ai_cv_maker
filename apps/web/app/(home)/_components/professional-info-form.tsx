"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Candidate,
  CandidateSchema,
} from "@/types/professional-info-form.type";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from "react-hook-form";
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
import { TagsInput } from "./input-tag";

export function ProfessionalInfoForm() {
  const form = useForm<Candidate>({
    resolver: zodResolver(CandidateSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      languages: [],
    },
  });

  const {
    register,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = form;

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

  console.log(errors);

  return (
    <FormProvider {...form}>
      <form>
        <Card>
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-semibold">
              Seu perfil profissional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-y-6 gap-x-4 sm:flex-row">
              <Field>
                <FieldLabel htmlFor="name">
                  Nome completo<span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="name"
                  type="text"
                  {...register("name", {
                    required: "Campo obrigatório",
                  })}
                />
                {errors.name?.message && (
                  <p className="text-sm text-destructive">
                    {errors.name?.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="professional_title">
                  Cargo<span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="professional_title"
                  type="text"
                  {...register("professional_title", {
                    required: "Campo obrigatório",
                  })}
                />
              </Field>
            </div>

            <div className="flex flex-col gap-y-6 gap-x-4 sm:flex-row">
              <Field>
                <FieldLabel htmlFor="email">
                  E-mail<span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="email"
                  type="text"
                  {...register("contact_information.email", {
                    required: "Campo obrigatório",
                  })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">
                  Celular<span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="phone"
                  type="text"
                  {...register("contact_information.phone", {
                    required: "Campo obrigatório",
                  })}
                />
              </Field>
            </div>

            <div className="flex gap-y-6 gap-x-4 flex-row">
              <Field>
                <FieldLabel htmlFor="state">
                  Estado<span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="state"
                  type="text"
                  {...register("contact_information.state", {
                    required: "Campo obrigatório",
                  })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="city">
                  Cidade<span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="city"
                  type="text"
                  {...register("contact_information.city", {
                    required: "Campo obrigatório",
                  })}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="candidate_introduction">
                Apresente-se<span className="text-destructive">*</span>
              </FieldLabel>
              <Textarea
                id="candidate_introduction"
                rows={4}
                placeholder="Ex.: Desenvolvedor Full Stack com 3+ anos de experiência em React, Node.js e PostgreSQL, focado em performance e boas práticas."
                {...register("candidate_introduction", {
                  required: "Campo obrigatório",
                })}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor={`skills`}>Habilidades</FieldLabel>
              <TagsInput
                name={`skills`}
                placeholder="Ex.: React, NestJS, PostgreSQL (Enter para adicionar)"
                maxTags={20}
              />
            </Field>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <Label>LinkedIn, portfólio e outros links</Label>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    aria-label="Add external link"
                    onClick={() =>
                      insertExternalLink(0, { label: "", url: "" })
                    }
                  >
                    <PlusIcon />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {!externalLinks?.length && (
                    <p className="text-base text-muted-foreground md:text-lg">
                      Adicione links úteis como seu LinkedIn, site de portfólio,
                      etc.
                    </p>
                  )}

                  {externalLinks?.map((field, index) => (
                    <div className="flex gap-4 items-center" key={field.id}>
                      <Field>
                        {index === 0 && (
                          <FieldLabel>
                            Nome<span className="text-destructive">*</span>
                          </FieldLabel>
                        )}
                        <Input
                          type="text"
                          placeholder="Ex.: LinkedIn"
                          {...register(`external_links.${index}.label`, {
                            required: "Campo obrigatório",
                          })}
                        />
                      </Field>
                      <Field>
                        {index === 0 && (
                          <FieldLabel>
                            URL<span className="text-destructive">*</span>
                          </FieldLabel>
                        )}
                        <Input
                          type="text"
                          {...register(`external_links.${index}.url`, {
                            required: "Campo obrigatório",
                          })}
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
                  <Label>Experiências profissionais</Label>
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
                        skills: [],
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
                      Adicione uma experiência profissional.
                    </p>
                  )}

                  {experiences?.map((field, index) => (
                    <div className="flex-1 space-y-4" key={field.id}>
                      <div className="flex items-center justify-between">
                        <p className="font-bold">
                          Experiência{" "}
                          {experiences.length > 1
                            ? `${index + 1} de ${experiences.length}`
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
                        <FieldLabel htmlFor={`experiences.${index}.role`}>
                          Cargo<span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id={`experiences.${index}.role`}
                          type="text"
                          {...register(`experiences.${index}.role`, {
                            required: "Campo obrigatório",
                          })}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor={`experiences.${index}.company`}>
                          Empresa<span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id={`experiences.${index}.company`}
                          type="text"
                          {...register(`experiences.${index}.company`, {
                            required: "Campo obrigatório",
                          })}
                        />
                      </Field>
                      <Field>
                        <FieldLabel
                          htmlFor={`experiences.${index}.description`}
                        >
                          Descrição de atividades
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Textarea
                          id={`experiences.${index}.description`}
                          rows={4}
                          placeholder="Descreva suas principais responsabilidades, projetos e resultados alcançados."
                          {...register(`experiences.${index}.description`, {
                            required: "Campo obrigatório",
                          })}
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor={`experiences.${index}.skills`}>
                          Habilidades utilizadas
                        </FieldLabel>
                        <TagsInput
                          name={`experiences.${index}.skills`}
                          placeholder="Ex.: React, NestJS, PostgreSQL (Enter para adicionar)"
                          maxTags={20}
                        />
                      </Field>
                      <div className="flex gap-4 items-start">
                        <Field>
                          <FieldLabel
                            htmlFor={`experiences.${index}.start_date`}
                          >
                            Data de início
                            <span className="text-destructive">*</span>
                          </FieldLabel>
                          <Input
                            id={`experiences.${index}.start_date`}
                            type="text"
                            placeholder="Ex.: 02/2026"
                            {...register(`experiences.${index}.start_date`, {
                              required: "Campo obrigatório",
                            })}
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
                            <FieldLabel
                              htmlFor={`experiences.${index}.end_date`}
                            >
                              Data de término
                              <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Input
                              id={`experiences.${index}.end_date`}
                              type="text"
                              placeholder="Ex.: 02/2026"
                              disabled={getValues(
                                `experiences.${index}.current_job`,
                              )}
                              {...register(`experiences.${index}.end_date`, {
                                required: getValues(
                                  `experiences.${index}.current_job`,
                                )
                                  ? undefined
                                  : "Campo obrigatório",
                              })}
                              onChange={(e) =>
                                setValue(
                                  `experiences.${index}.end_date`,
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
                              Este é meu trabalho atual
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
                  <Label>Formação Acadêmica</Label>
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
                      Adicione uma formação acadêmica.
                    </p>
                  )}

                  {education?.map((field, index) => (
                    <div className="flex-1 space-y-4" key={field.id}>
                      <div className="flex items-center justify-between">
                        <p className="font-bold">
                          Formação{" "}
                          {education.length > 1
                            ? `${index + 1} de ${education.length}`
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
                        <FieldLabel htmlFor={`education.${index}.degree`}>
                          Formação
                        </FieldLabel>
                        <Input
                          id={`education.${index}.degree`}
                          type="text"
                          {...register(`education.${index}.degree`)}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor={`education.${index}.institution`}>
                          Instituição de ensino
                        </FieldLabel>
                        <Input
                          id={`education.${index}.institution`}
                          type="text"
                          {...register(`education.${index}.institution`)}
                        />
                      </Field>
                      <div className="flex gap-4 items-start">
                        <Field>
                          <FieldLabel htmlFor={`education.${index}.start_date`}>
                            Data de início
                          </FieldLabel>
                          <Input
                            id={`education.${index}.start_date`}
                            type="text"
                            placeholder="Ex.: 02/2026"
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
                            <FieldLabel htmlFor={`education.${index}.end_date`}>
                              Data de término
                            </FieldLabel>
                            <Input
                              id={`education.${index}.end_date`}
                              type="text"
                              placeholder="Ex.: 02/2026"
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
                              Em andamento
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
                    <Label>Idiomas</Label>
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
                      Adicione os idiomas que você fala.
                    </p>
                  )}

                  {languages?.map((field, index) => (
                    <div className="flex gap-4 items-center" key={field.id}>
                      <Field>
                        {index === 0 && <FieldLabel>Idioma</FieldLabel>}
                        <Input
                          type="text"
                          placeholder="Ex.: English"
                          {...register(`languages.${index}.name`)}
                        />
                      </Field>
                      <Field>
                        {index === 0 && <FieldLabel>Nível</FieldLabel>}
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
                                <SelectValue placeholder="Selecione o nível" />
                              </SelectTrigger>

                              <SelectContent>
                                <SelectItem value="beginner">
                                  Iniciante
                                </SelectItem>
                                <SelectItem value="intermediate">
                                  Intermediário
                                </SelectItem>
                                <SelectItem value="advanced">
                                  Avançado
                                </SelectItem>
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
    </FormProvider>
  );
}
