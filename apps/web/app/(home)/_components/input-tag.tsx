"use client";

import * as React from "react";
import { X } from "lucide-react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TagsInputProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** se true, evita tags repetidas (case-insensitive) */
  preventDuplicates?: boolean;
  /** limite opcional de tags */
  maxTags?: number;
};

export function TagsInput<TFieldValues extends FieldValues>({
  name,
  label,
  placeholder = "Digite e pressione Enter",
  disabled,
  className,
  preventDuplicates = true,
  maxTags,
}: TagsInputProps<TFieldValues>) {
  const { setValue, watch } = useFormContext<TFieldValues>();
  const [inputValue, setInputValue] = React.useState("");

  const tags = (watch(name) as unknown as string[]) ?? [];

  function normalize(tag: string) {
    return tag.trim();
  }

  function hasDuplicate(next: string) {
    if (!preventDuplicates) return false;
    const n = next.toLowerCase();
    return tags.some((t) => t.toLowerCase() === n);
  }

  function addTag(raw: string) {
    const next = normalize(raw);
    if (!next) return;
    if (hasDuplicate(next)) return;
    if (maxTags !== undefined && tags.length >= maxTags) return;

    setValue(name, [...tags, next] as any, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setInputValue("");
  }

  function removeTag(index: number) {
    setValue(name, tags.filter((_, i) => i !== index) as any, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
      return;
    }

    // Backspace com input vazio remove a última tag (UX comum)
    if (e.key === "Backspace" && inputValue.length === 0 && tags.length > 0) {
      e.preventDefault();
      removeTag(tags.length - 1);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <div className="text-sm font-medium leading-none">{label}</div>
      ) : null}

      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />

      {maxTags !== undefined ? (
        <p className="text-xs text-muted-foreground">
          {tags.length}/{maxTags}
        </p>
      ) : null}

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge
              key={`${tag}-${index}`}
              variant="secondary"
              className="gap-1"
            >
              <span>{tag}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => removeTag(index)}
                disabled={disabled}
                aria-label={`Remover ${tag}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
