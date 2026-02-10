"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
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
import { useRHFFormPersistence } from "../_hooks/use-persist-to-local-storage";
import { useEffect } from "react";
import { twMerge } from "tailwind-merge";

const STORAGE_KEY = "cv:profile";

export function ProfessionalInfoForm() {
  const form = useForm<Candidate>({
    resolver: zodResolver(CandidateSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
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

  useRHFFormPersistence({
    control: form.control,
    storageKey: STORAGE_KEY,
    delay: 300,
  });

  useEffect(() => {
    localStorage.setItem("cv:profile:isValid", String(form.formState.isValid));
  }, [form.formState.isValid]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      form.reset(data);
    } catch {
      console.error("Perfil profissional deve estar corrompido");
    }
  }, [form]);

  return (
    <FormProvider {...form}>
      <form>
        <Card>
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-semibold">
              Seu perfil profissional
            </CardTitle>
            <CardDescription>
              As informações são salvas automaticamente no navegador.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-y-6 gap-x-4 sm:flex-row">
              <Field>
                <FieldLabel htmlFor="name">
                  Nome completo<span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  className="mb-0"
                  id="name"
                  type="text"
                  {...register("name")}
                />
                {errors.name?.message && (
                  <FieldError>{errors.name?.message}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="professional_title">
                  Cargo<span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="professional_title"
                  type="text"
                  {...register("professional_title")}
                />
                {errors.professional_title?.message && (
                  <FieldError>{errors.professional_title?.message}</FieldError>
                )}
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
                  {...register("contact_information.email")}
                />
                {errors?.contact_information?.email?.message && (
                  <FieldError>
                    {errors?.contact_information.email?.message}
                  </FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">
                  Celular<span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  {...register("contact_information.phone")}
                />

                {errors?.contact_information?.phone?.message && (
                  <FieldError>
                    {errors.contact_information.phone.message}
                  </FieldError>
                )}
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
                  {...register("contact_information.state")}
                />
                {errors?.contact_information?.state?.message && (
                  <FieldError>
                    {errors.contact_information.state.message}
                  </FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="city">
                  Cidade<span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="city"
                  type="text"
                  {...register("contact_information.city")}
                />
                {errors?.contact_information?.city?.message && (
                  <FieldError>
                    {errors.contact_information.city.message}
                  </FieldError>
                )}
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
                {...register("candidate_introduction")}
              />
              {errors.candidate_introduction?.message && (
                <FieldError>
                  {errors.candidate_introduction?.message}
                </FieldError>
              )}
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
                    <div
                      className="grid grid-cols-[1fr_1fr_auto] gap-4"
                      key={field.id}
                    >
                      {index === 0 && (
                        <FieldLabel>
                          Nome<span className="text-destructive">*</span>
                        </FieldLabel>
                      )}

                      {index === 0 && (
                        <FieldLabel>
                          URL<span className="text-destructive">*</span>
                        </FieldLabel>
                      )}

                      <Button
                        type="button"
                        className={twMerge(
                          "rounded-full col-start-3 row-start-1",
                          index === 0 && "row-start-2",
                        )}
                        variant="ghost"
                        size="icon"
                        aria-label="Add external link"
                        onClick={() => removeExternalLink(index)}
                      >
                        <Trash className="text-red-500" />
                      </Button>

                      <Input
                        type="text"
                        className="col-start-1"
                        placeholder="Ex.: LinkedIn"
                        {...register(`external_links.${index}.label`)}
                      />

                      <Input
                        type="text"
                        className="col-start-2"
                        {...register(`external_links.${index}.url`)}
                      />

                      {errors?.external_links?.[index]?.label?.message && (
                        <FieldError>
                          {errors.external_links[index].label.message}
                        </FieldError>
                      )}

                      {errors?.external_links?.[index]?.url?.message && (
                        <FieldError>
                          {errors.external_links[index].url.message}
                        </FieldError>
                      )}
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
                        <FieldLabel htmlFor={`experiences.${index}.company`}>
                          Empresa<span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id={`experiences.${index}.company`}
                          type="text"
                          {...register(`experiences.${index}.company`)}
                        />
                        {errors?.experiences?.[index]?.company?.message && (
                          <FieldError>
                            {errors.experiences[index].company.message}
                          </FieldError>
                        )}
                      </Field>
                      <Field>
                        <FieldLabel htmlFor={`experiences.${index}.role`}>
                          Cargo<span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id={`experiences.${index}.role`}
                          type="text"
                          {...register(`experiences.${index}.role`)}
                        />
                        {errors?.experiences?.[index]?.role?.message && (
                          <FieldError>
                            {errors.experiences[index].role.message}
                          </FieldError>
                        )}
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
                          {...register(`experiences.${index}.description`)}
                        />
                        {errors?.experiences?.[index]?.description?.message && (
                          <FieldError>
                            {errors.experiences[index].description.message}
                          </FieldError>
                        )}
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
                            {...register(`experiences.${index}.start_date`)}
                            onChange={(e) =>
                              setValue(
                                `experiences.${index}.start_date`,
                                formatMonthYear(e.target.value),
                              )
                            }
                          />
                          {errors?.experiences?.[index]?.start_date
                            ?.message && (
                            <FieldError>
                              {errors.experiences[index].start_date.message}
                            </FieldError>
                          )}
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
                              {...register(`experiences.${index}.end_date`)}
                              onChange={(e) =>
                                setValue(
                                  `experiences.${index}.end_date`,
                                  formatMonthYear(e.target.value),
                                )
                              }
                            />
                            {errors?.experiences?.[index]?.end_date
                              ?.message && (
                              <FieldError>
                                {errors.experiences[index].end_date.message}
                              </FieldError>
                            )}
                          </Field>

                          <Field orientation="horizontal">
                            <Checkbox
                              id={`experiences.${index}.current_job`}
                              checked={getValues(
                                `experiences.${index}.current_job`,
                              )}
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
                          Curso
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id={`education.${index}.degree`}
                          type="text"
                          {...register(`education.${index}.degree`)}
                        />
                        {errors?.education?.[index]?.degree?.message && (
                          <FieldError>
                            {errors.education[index].degree.message}
                          </FieldError>
                        )}
                      </Field>
                      <Field>
                        <FieldLabel htmlFor={`education.${index}.institution`}>
                          Instituição de ensino
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id={`education.${index}.institution`}
                          type="text"
                          {...register(`education.${index}.institution`)}
                        />
                        {errors?.education?.[index]?.institution?.message && (
                          <FieldError>
                            {errors.education[index].institution.message}
                          </FieldError>
                        )}
                      </Field>
                      <div className="flex gap-4 items-start">
                        <Field>
                          <FieldLabel htmlFor={`education.${index}.start_date`}>
                            Data de início
                            <span className="text-destructive">*</span>
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
                          {errors?.education?.[index]?.start_date?.message && (
                            <FieldError>
                              {errors.education[index].start_date.message}
                            </FieldError>
                          )}
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
                              checked={getValues(
                                `education.${index}.in_progress`,
                              )}
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
                    <div
                      className="grid grid-cols-[1fr_1fr_auto] gap-4"
                      key={field.id}
                    >
                      {index === 0 && (
                        <FieldLabel htmlFor={`languages.${index}.name`}>
                          Idioma
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                      )}

                      {index === 0 && (
                        <FieldLabel htmlFor={`languages.${index}.level`}>
                          Nível
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                      )}

                      <Button
                        type="button"
                        className={twMerge(
                          "col-start-3 row-start-1",
                          index === 0 && "row-start-2",
                        )}
                        variant="ghost"
                        size="icon"
                        aria-label="Add external link"
                        onClick={() => removeLanguage(index)}
                      >
                        <Trash className="text-red-500" />
                      </Button>

                      <Input
                        className="col-start-1"
                        id={`languages.${index}.name`}
                        type="text"
                        placeholder="Ex.: English"
                        {...register(`languages.${index}.name`)}
                      />

                      <Controller
                        name={`languages.${index}.level`}
                        control={control}
                        rules={{ required: "Nível é obrigatório" }}
                        render={({ field }) => (
                          <Select
                            name={`languages.${index}.level`}
                            onValueChange={(value) => {
                              field.onChange(value);
                            }}
                            onOpenChange={(open) => {
                              if (!open) {
                                field.onBlur();
                              }
                            }}
                          >
                            <SelectTrigger aria-invalid>
                              <SelectValue placeholder="Selecione o nível" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="beginner">
                                Iniciante
                              </SelectItem>
                              <SelectItem value="intermediate">
                                Intermediário
                              </SelectItem>
                              <SelectItem value="advanced">Avançado</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />

                      {errors?.languages?.[index]?.name?.message && (
                        <FieldError>
                          {errors.languages[index].name.message}
                        </FieldError>
                      )}

                      {errors?.languages?.[index]?.level?.message && (
                        <FieldError>
                          {errors.languages[index].level.message}
                        </FieldError>
                      )}
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
