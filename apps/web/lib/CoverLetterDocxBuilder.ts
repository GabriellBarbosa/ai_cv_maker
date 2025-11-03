import {
  AlignmentType,
  Document,
  Paragraph,
  TextRun,
  convertInchesToTwip,
} from "docx";

type CoverLetterDocxBuilderOptions = {
  /**
   * Overrides the greeting line. Defaults to a company & role specific greeting.
   */
  greeting?: string;
  /**
   * Overrides the signature block. When omitted, a locale-aware closing is composed.
   */
  signature?: string;
  /**
   * Optional locale used to format the date string and default phrases.
   */
  locale?: string;
  /**
   * Optional date override. Defaults to the current date.
   */
  date?: Date;
  /**
   * Candidate name used when crafting the signature fallback.
   */
  candidateName?: string;
};

/**
 * CoverLetterDocxBuilder generates a minimal cover letter document
 * using a lightweight template composed by date, greeting, body, and signature.
 */
export class CoverLetterDocxBuilder {
  private readonly company: string;
  private readonly jobTitle: string;
  private readonly body: string;
  private readonly options: CoverLetterDocxBuilderOptions;

  constructor(
    company: string,
    jobTitle: string,
    body: string,
    options: CoverLetterDocxBuilderOptions = {}
  ) {
    this.company = company;
    this.jobTitle = jobTitle;
    this.body = body;
    this.options = options;
  }

  /**
   * Transforms the cover letter data into a DOCX document instance.
   */
  public build(): Document {
    const children: Paragraph[] = [
      this.createDateParagraph(),
      this.createGreetingParagraph(),
      ...this.createBodyParagraphs(),
      this.createSignatureParagraph(),
    ];

    return new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1),
              },
            },
          },
          children,
        },
      ],
    });
  }

  private createDateParagraph(): Paragraph {
    const date = this.options.date ?? new Date();
    const formatter = new Intl.DateTimeFormat(this.options.locale ?? "pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    return new Paragraph({
      children: [
        new TextRun({
          text: formatter.format(date),
        }),
      ],
      spacing: { after: 300 },
    });
  }

  private createGreetingParagraph(): Paragraph {
    const greeting =
      this.options.greeting ?? this.getDefaultGreeting();

    return new Paragraph({
      children: [new TextRun({ text: greeting })],
      spacing: { after: 300 },
    });
  }

  private createBodyParagraphs(): Paragraph[] {
    return this.body
      .split(/\n{2,}/)
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0)
      .map(
        (segment) =>
          new Paragraph({
            children: [new TextRun({ text: segment })],
            spacing: { after: 240 },
          })
      );
  }

  private createSignatureParagraph(): Paragraph {
    const signatureLines = this.options.signature
      ? this.options.signature.split(/\r?\n/)
      : this.getDefaultSignatureLines();

    const runs = signatureLines.map(
      (line, index) =>
        new TextRun({
          text: line,
          break: index === 0 ? undefined : 1,
        })
    );

    return new Paragraph({
      children: runs,
      alignment: AlignmentType.LEFT,
    });
  }

  private getDefaultGreeting(): string {
    const locale = (this.options.locale ?? "pt-BR").toLowerCase();
    const hasCompany = this.company.trim().length > 0;
    const hasJobTitle = this.jobTitle.trim().length > 0;

    if (locale.startsWith("pt")) {
      if (hasCompany && hasJobTitle) {
        return `Prezado(a) recrutador(a) da ${this.company} para a vaga de ${this.jobTitle},`;
      }
      if (hasCompany) {
        return `Prezado(a) recrutador(a) da ${this.company},`;
      }
      if (hasJobTitle) {
        return `Prezado(a) recrutador(a) para a vaga de ${this.jobTitle},`;
      }
      return "Prezado(a) recrutador(a),";
    }

    if (hasCompany && hasJobTitle) {
      return `Dear Hiring Manager at ${this.company} for the ${this.jobTitle} role,`;
    }
    if (hasCompany) {
      return `Dear Hiring Manager at ${this.company},`;
    }
    if (hasJobTitle) {
      return `Dear Hiring Manager for the ${this.jobTitle} role,`;
    }
    return "Dear Hiring Manager,";
  }

  private getDefaultSignatureLines(): string[] {
    const locale = (this.options.locale ?? "pt-BR").toLowerCase();
    const closing = locale.startsWith("pt") ? "Atenciosamente," : "Sincerely,";
    const lines = [closing];

    if (this.options.candidateName) {
      lines.push(this.options.candidateName);
    }

    if (this.jobTitle.trim().length > 0) {
      lines.push(this.jobTitle);
    }

    return lines.filter((line) => line && line.trim().length > 0);
  }
}
