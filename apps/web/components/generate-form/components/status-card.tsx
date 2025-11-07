import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

type StatusCardProps = {
  steps: { label: string }[];
  currentStep: number | null;
};

const getStatusIcon = (currentStep: number | null, index: number) => {
  if (currentStep === null) {
    return <Circle className="h-4 w-4 text-muted-foreground/40" />;
  }

  if (index < currentStep) {
    return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  }

  if (index === currentStep) {
    return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
  }

  return <Circle className="h-4 w-4 text-muted-foreground/40" />;
};

const getStatusTextClass = (currentStep: number | null, index: number) => {
  const base = "text-sm";

  if (currentStep === index) {
    return `${base} text-foreground font-medium`;
  }

  if (currentStep !== null && index < currentStep) {
    return `${base} text-emerald-600 font-medium`;
  }

  return `${base} text-muted-foreground`;
};

export function StatusCard({ steps, currentStep }: StatusCardProps) {
  return (
    <Card className="border border-primary/40 bg-primary/5 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Magic is happening
        </CardTitle>
        <CardDescription className="text-xs uppercase tracking-wide text-primary/70">
          Follow the step by step
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center gap-3">
            {getStatusIcon(currentStep, index)}
            <span className={getStatusTextClass(currentStep, index)}>
              {step.label}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
