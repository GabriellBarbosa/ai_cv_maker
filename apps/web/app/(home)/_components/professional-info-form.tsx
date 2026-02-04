"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Candidate,
  CandidateSchema,
} from "@/types/professional-info-form.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusIcon, Trash } from "lucide-react";

export function ProfessionalInfoForm() {
  const { register, control, watch } = useForm<Candidate>({
    resolver: zodResolver(CandidateSchema),
    defaultValues: {
      external_links: [
        {
          label: "",
          url: "",
        },
      ],
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

  console.log(watch());

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl font-semibold">
          Your professional info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <Field>
          <FieldLabel htmlFor="location">State - City</FieldLabel>
          <Input
            id="location"
            type="text"
            placeholder="São Paulo - SP"
            {...register("contact_information.location", {
              required: true,
            })}
          />
        </Field>

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
                  Click the plus button to add useful links like your LinkedIn,
                  Portfolio website, etc.
                </p>
              )}

              {externalLinks?.map((_, index) => (
                <div className="flex gap-4 items-center" key={index}>
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
      </CardContent>
    </Card>
  );
}
