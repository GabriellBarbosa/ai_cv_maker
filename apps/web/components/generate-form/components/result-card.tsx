import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type ResultCardProps = {
  onDownloadResume: () => Promise<void> | void;
  onDownloadCoverLetter: () => Promise<void> | void;
  canDownloadResume: boolean;
  canDownloadCoverLetter: boolean;
};

export function ResultCard({
  onDownloadResume,
  onDownloadCoverLetter,
  canDownloadResume,
  canDownloadCoverLetter,
}: ResultCardProps) {
  return (
    <Card className="border border-border/70 bg-card/80 shadow-lg">
      <CardHeader>
        <CardTitle>Generated Resume</CardTitle>
        <CardDescription>
          Download, fine-tune, or plug into your favourite template.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={onDownloadResume}
          className="w-full font-bold"
          variant="default"
          disabled={!canDownloadResume}
        >
          <Download className="mr-2 h-4 w-4" />
          Download Resume (.docx)
        </Button>
        <Button
          onClick={onDownloadCoverLetter}
          className="w-full font-bold"
          variant="secondary"
          disabled={!canDownloadCoverLetter}
        >
          <Download className="mr-2 h-4 w-4" />
          Download Cover Letter (.docx)
        </Button>
      </CardContent>
    </Card>
  );
}
