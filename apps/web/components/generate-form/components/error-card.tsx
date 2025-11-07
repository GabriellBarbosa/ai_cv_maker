import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ErrorCardProps = {
  message: string;
};

export function ErrorCard({ message }: ErrorCardProps) {
  return (
    <Card className="border border-destructive/60 bg-destructive/10">
      <CardHeader>
        <CardTitle className="text-destructive">Encontramos um problema</CardTitle>
        <CardDescription className="text-xs uppercase tracking-wide text-destructive/70">
          Revise suas entradas ou tente novamente em instantes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
