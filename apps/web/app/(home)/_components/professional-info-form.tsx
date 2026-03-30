"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Candidate } from "@/types/professional-info-form.type";
import {
  Controller,
  FormProvider,
  useFieldArray,
  UseFormReturn,
} from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  ChevronsUpDown,
  InfoIcon,
  PlusIcon,
  Trash,
} from "lucide-react";
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
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Props {
  form: UseFormReturn<Candidate>;
}

export function ProfessionalInfoForm({ form }: Props) {
  const [collapsibleIsOpen, setCollapsibleIsOpen] = useState(true);

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

  const {
    fields: projects,
    insert: insertProject,
    remove: removeProject,
  } = useFieldArray({
    control,
    name: "projects",
  });

  useRHFFormPersistence({
    control: form.control,
    storageKey: "cv:profile",
    delay: 300,
  });

  useEffect(() => {
    localStorage.setItem("cv:profile:isValid", String(form.formState.isValid));
  }, [form.formState.isValid]);

  useEffect(() => {
    const raw = localStorage.getItem("cv:profile");

    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      form.reset(data);
    } catch {
      console.error("Professional profile may be corrupted");
    }
  }, [form]);

  return (
    <FormProvider {...form}>
      <form>
        <Card className="relative">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-semibold">
              Your professional profile
            </CardTitle>
            <CardDescription>
              Your professional profile is saved automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Collapsible
              open={collapsibleIsOpen}
              onOpenChange={setCollapsibleIsOpen}
            >
              <CollapsibleTrigger asChild className="absolute top-6 right-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 cursor-pointer"
                >
                  <ChevronsUpDown />
                  <span className="sr-only">Toggle details</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-6">
                <Card>
                  <CardHeader>
                    <Label>Profile</Label>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col gap-y-6 gap-x-4 sm:flex-row">
                      <Field>
                        <FieldLabel htmlFor="profile.name">
                          Full name
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          className="mb-0"
                          id="profile.name"
                          type="text"
                          {...register("profile.name")}
                        />
                        {errors.profile?.name?.message && (
                          <FieldError>
                            {errors.profile.name?.message}
                          </FieldError>
                        )}
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="profile.professional_title">
                          Job title<span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id="profile.professional_title"
                          type="text"
                          {...register("profile.professional_title")}
                        />
                        {errors.profile?.professional_title?.message && (
                          <FieldError>
                            {errors.profile.professional_title?.message}
                          </FieldError>
                        )}
                      </Field>
                    </div>

                    <div className="flex flex-col gap-y-6 gap-x-4 sm:flex-row">
                      <Field>
                        <FieldLabel htmlFor="profile.email">
                          Email<span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id="profile.email"
                          type="text"
                          {...register("profile.email")}
                        />
                        {errors?.profile?.email?.message && (
                          <FieldError>
                            {errors?.profile.email?.message}
                          </FieldError>
                        )}
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="profile.phone">
                          Phone<span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id="profile.phone"
                          type="tel"
                          {...register("profile.phone")}
                        />

                        {errors?.profile?.phone?.message && (
                          <FieldError>
                            {errors.profile.phone.message}
                          </FieldError>
                        )}
                      </Field>
                    </div>

                    <div className="flex gap-y-6 gap-x-4 flex-row">
                      <Field>
                        <FieldLabel htmlFor="profile.state">
                          State<span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id="profile.state"
                          type="text"
                          {...register("profile.state")}
                        />
                        {errors?.profile?.state?.message && (
                          <FieldError>
                            {errors.profile.state.message}
                          </FieldError>
                        )}
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="profile.city">
                          City<span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id="profile.city"
                          type="text"
                          {...register("profile.city")}
                        />
                        {errors?.profile?.city?.message && (
                          <FieldError>{errors.profile.city.message}</FieldError>
                        )}
                      </Field>
                    </div>
                    <Field>
                      <FieldLabel htmlFor="profile.candidate_introduction">
                        Introduction<span className="text-destructive">*</span>
                      </FieldLabel>
                      <Textarea
                        id="profile.candidate_introduction"
                        rows={6}
                        placeholder="Example: Full-Stack Developer with 3+ years of experience in React, Node.js, and PostgreSQL, focused on performance and best practices."
                        {...register("profile.candidate_introduction")}
                      />
                      {errors?.profile?.candidate_introduction?.message && (
                        <FieldError>
                          {errors.profile.candidate_introduction?.message}
                        </FieldError>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor={`profile.skills`}>Skills</FieldLabel>
                      <TagsInput
                        name={`profile.skills`}
                        placeholder="Example: React, NestJS, PostgreSQL (press Enter to add)"
                        maxTags={20}
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <Label>LinkedIn, portfolio, and other links</Label>
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
                          Add useful links such as LinkedIn, portfolio website,
                          and more.
                        </p>
                      )}

                      {externalLinks?.map((field, index) => (
                        <div
                          className="grid grid-cols-[1fr_1fr_auto] gap-4"
                          key={field.id}
                        >
                          {index === 0 && (
                            <FieldLabel>
                              Name<span className="text-destructive">*</span>
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
                            placeholder="Example: LinkedIn"
                            {...register(`external_links.${index}.label`)}
                          />

                          <Input
                            type="text"
                            className="col-start-2"
                            {...register(`external_links.${index}.url`)}
                          />

                          {errors?.external_links?.[index]?.label?.message && (
                            <FieldError className="col-start-1">
                              {errors.external_links[index].label.message}
                            </FieldError>
                          )}

                          {errors?.external_links?.[index]?.url?.message && (
                            <FieldError className="col-start-2">
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
                      <Label>Work experience</Label>
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
                          Add a work experience entry.
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
                            <FieldLabel
                              htmlFor={`experiences.${index}.company`}
                            >
                              Company<span className="text-destructive">*</span>
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
                              Role<span className="text-destructive">*</span>
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
                              Role description
                              <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Textarea
                              id={`experiences.${index}.description`}
                              rows={6}
                              placeholder="Describe your main responsibilities, projects, and outcomes."
                              {...register(`experiences.${index}.description`)}
                            />
                            {errors?.experiences?.[index]?.description
                              ?.message && (
                              <FieldError>
                                {errors.experiences[index].description.message}
                              </FieldError>
                            )}
                          </Field>

                          <Field>
                            <FieldLabel htmlFor={`experiences.${index}.skills`}>
                              Skills used
                            </FieldLabel>
                            <TagsInput
                              name={`experiences.${index}.skills`}
                              placeholder="Example: React, NestJS, PostgreSQL (press Enter to add)"
                              maxTags={20}
                            />
                          </Field>
                          <div className="flex gap-4 items-start">
                            <Field>
                              <FieldLabel
                                htmlFor={`experiences.${index}.start_date`}
                              >
                                Start date
                                <span className="text-destructive">*</span>
                              </FieldLabel>
                              <Input
                                id={`experiences.${index}.start_date`}
                                type="text"
                                placeholder="Example: 02/2026"
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
                                  End date
                                </FieldLabel>
                                <Input
                                  id={`experiences.${index}.end_date`}
                                  type="text"
                                  placeholder="Example: 02/2026"
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
                                  This is my current role
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
                          Add an education entry.
                        </p>
                      )}

                      {education?.map((field, index) => (
                        <div className="flex-1 space-y-4" key={field.id}>
                          <div className="flex items-center justify-between">
                            <p className="font-bold">
                              Education{" "}
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
                            <FieldLabel htmlFor={`education.${index}.degree`}>
                              Degree
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
                            <FieldLabel
                              htmlFor={`education.${index}.institution`}
                            >
                              Institution
                              <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Input
                              id={`education.${index}.institution`}
                              type="text"
                              {...register(`education.${index}.institution`)}
                            />
                            {errors?.education?.[index]?.institution
                              ?.message && (
                              <FieldError>
                                {errors.education[index].institution.message}
                              </FieldError>
                            )}
                          </Field>
                          <div className="flex gap-4 items-start">
                            <Field>
                              <FieldLabel
                                htmlFor={`education.${index}.start_date`}
                              >
                                Start date
                                <span className="text-destructive">*</span>
                              </FieldLabel>
                              <Input
                                id={`education.${index}.start_date`}
                                type="text"
                                placeholder="Example: 02/2026"
                                {...register(`education.${index}.start_date`)}
                                onChange={(e) =>
                                  setValue(
                                    `education.${index}.start_date`,
                                    formatMonthYear(e.target.value),
                                  )
                                }
                              />
                              {errors?.education?.[index]?.start_date
                                ?.message && (
                                <FieldError>
                                  {errors.education[index].start_date.message}
                                </FieldError>
                              )}
                            </Field>

                            <div className="w-full space-y-2">
                              <Field>
                                <FieldLabel
                                  htmlFor={`education.${index}.end_date`}
                                >
                                  End date
                                </FieldLabel>
                                <Input
                                  id={`education.${index}.end_date`}
                                  type="text"
                                  placeholder="Example: 02/2026"
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
                        onClick={() =>
                          insertLanguage(0, { name: "", level: "" })
                        }
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {!languages?.length && (
                        <p className="text-base text-muted-foreground md:text-lg">
                          Add the languages you speak.
                        </p>
                      )}

                      {languages?.map((field, index) => (
                        <div
                          className="grid grid-cols-[1fr_1fr_auto] gap-4"
                          key={field.id}
                        >
                          {index === 0 && (
                            <FieldLabel htmlFor={`languages.${index}.name`}>
                              Language
                              <span className="text-destructive">*</span>
                            </FieldLabel>
                          )}

                          {index === 0 && (
                            <FieldLabel htmlFor={`languages.${index}.level`}>
                              Level
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
                            placeholder="Example: English"
                            {...register(`languages.${index}.name`)}
                          />

                          <Controller
                            name={`languages.${index}.level`}
                            control={control}
                            rules={{ required: "Level is required" }}
                            render={({ field }) => (
                              <Field className="col-start-2">
                                <Select
                                  name={`languages.${index}.level`}
                                  value={field.value}
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
                                    <SelectValue placeholder="Select level" />
                                  </SelectTrigger>

                                  <SelectContent>
                                    <SelectItem value="beginner">
                                      Beginner
                                    </SelectItem>
                                    <SelectItem value="intermediate">
                                      Intermediate
                                    </SelectItem>
                                    <SelectItem value="advanced">
                                      Advanced
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </Field>
                            )}
                          />

                          {errors?.languages?.[index]?.name?.message && (
                            <FieldError className="col-start-1">
                              {errors.languages[index].name.message}
                            </FieldError>
                          )}

                          {errors?.languages?.[index]?.level?.message && (
                            <FieldError className="col-start-2">
                              {errors.languages[index].level.message}
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
                      <Label>Projects</Label>
                      <Button
                        type="button"
                        size="icon"
                        aria-label="Add a project"
                        onClick={() =>
                          insertProject(0, {
                            title: "",
                            description: "",
                            link: "",
                            bullets: [],
                            techStack: [],
                          })
                        }
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-6">
                      {!projects?.length && (
                        <p className="text-base text-muted-foreground md:text-lg">
                          Add personal, freelance, academic, or open-source
                          projects when they strengthen your resume.
                        </p>
                      )}

                      {projects?.map((field, index) => (
                        <div className="flex-1 space-y-4" key={field.id}>
                          <div className="flex items-center justify-between">
                            <p className="font-bold">
                              Project{" "}
                              {projects.length > 1
                                ? `${index + 1} of ${projects.length}`
                                : ``}
                            </p>
                            <Button
                              type="button"
                              className="self-end rounded-full"
                              variant="ghost"
                              size="icon"
                              aria-label="Remove project"
                              onClick={() => removeProject(index)}
                            >
                              <Trash className="text-red-500" />
                            </Button>
                          </div>

                          <Field>
                            <FieldLabel htmlFor={`projects.${index}.title`}>
                              Title<span className="text-destructive">*</span>
                            </FieldLabel>
                            <Input
                              id={`projects.${index}.title`}
                              type="text"
                              {...register(`projects.${index}.title`)}
                            />
                            {errors?.projects?.[index]?.title?.message && (
                              <FieldError>
                                {errors.projects[index].title.message}
                              </FieldError>
                            )}
                          </Field>

                          <Field>
                            <FieldLabel
                              htmlFor={`projects.${index}.description`}
                            >
                              Description
                              <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Textarea
                              id={`projects.${index}.description`}
                              rows={5}
                              placeholder="Describe the project goal, scope, and why it matters."
                              {...register(`projects.${index}.description`)}
                            />
                            {errors?.projects?.[index]?.description
                              ?.message && (
                              <FieldError>
                                {errors.projects[index].description.message}
                              </FieldError>
                            )}
                          </Field>

                          <Field>
                            <FieldLabel htmlFor={`projects.${index}.link`}>
                              Link
                            </FieldLabel>
                            <Input
                              id={`projects.${index}.link`}
                              type="url"
                              placeholder="Example: https://github.com/username/project"
                              {...register(`projects.${index}.link`)}
                            />
                            {errors?.projects?.[index]?.link?.message && (
                              <FieldError>
                                {errors.projects[index].link.message}
                              </FieldError>
                            )}
                          </Field>

                          <Field>
                            <FieldLabel htmlFor={`projects.${index}.bullets`}>
                              Bullet points
                            </FieldLabel>
                            <TagsInput
                              name={`projects.${index}.bullets`}
                              placeholder="Example: Reduced report generation time by 60% (press Enter to add)"
                              maxTags={10}
                            />
                          </Field>

                          <Field>
                            <FieldLabel htmlFor={`projects.${index}.techStack`}>
                              Tech stack
                            </FieldLabel>
                            <TagsInput
                              name={`projects.${index}.techStack`}
                              placeholder="Example: Next.js, TypeScript, PostgreSQL (press Enter to add)"
                              maxTags={20}
                            />
                          </Field>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
          <CardFooter>
            {form.formState.isValid && (
              <Alert className="text-green-300">
                <CheckCircle2 />
                <AlertTitle>All set!</AlertTitle>
                <AlertDescription>
                  Now you can paste the job description and generate your
                  resume.
                </AlertDescription>
              </Alert>
            )}

            {!form.formState.isValid && (
              <Alert>
                <InfoIcon />
                <AlertTitle>Almost there!</AlertTitle>
                <AlertDescription>
                  Complete the required fields to generate your resume.
                </AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
}
