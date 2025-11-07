import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UseFormRegister } from "react-hook-form";
import type { GenerateFormData } from "../hooks/use-generate-form";

type TextAreaFieldProps = {
  field: Extract<keyof GenerateFormData, string>;
  label: string;
  placeholder: string;
  rows?: number;
  register: UseFormRegister<GenerateFormData>;
  error?: string;
};

export function TextAreaField({
  field,
  label,
  placeholder,
  register,
  rows = 7,
  error,
}: TextAreaFieldProps) {
  return (
    <div className="space-y-3">
      <Label className="mb-2 block" htmlFor={field}>
        {label}
      </Label>
      <Textarea
        id={field}
        placeholder={placeholder}
        rows={rows}
        {...register(field)}
        className={`min-h-[180px] resize-y border-2 border-gray-600 bg-background/70 text-sm leading-relaxed ${
          error ? "border-destructive/70 focus-visible:ring-destructive/70" : ""
        }`}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
