import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  convertInchesToTwip,
  IBorderOptions,
} from "docx";
import type { ResumeResponse } from "@ai-cv-maker/schemas";

/**
 * ResumeDocxBuilder creates a formatted DOCX document from ResumeResponse data
 */
export class ResumeDocxBuilder {
  private resume: ResumeResponse;

  constructor(resume: ResumeResponse) {
    this.resume = resume;
  }

  /**
   * Creates and returns a Document object ready for export
   */
  public build(): Document {
    const sections = [
      this.createHeader(),
      this.createResumeSummary(),
      this.createExperienceSection(),
      this.createEducationSection(),
      this.createLanguagesSection(),
      this.createSkillsSection(),
    ];

    return new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(0.75),
                right: convertInchesToTwip(0.75),
                bottom: convertInchesToTwip(0.75),
                left: convertInchesToTwip(0.75),
              },
            },
          },
          children: sections.flat(),
        },
      ],
    });
  }

  /**
   * Creates the header with name and job title
   */
  private createHeader(): Paragraph[] {
    return [
      new Paragraph({
        text: this.resume.name,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 100,
        },
      }),
      new Paragraph({
        text: this.resume.job_title,
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 200,
        },
        style: "Normal",
      }),
    ];
  }

  /**
   * Creates the Resume/Summary section
   */
  private createResumeSummary(): Paragraph[] {
    return [
      new Paragraph({
        text: "Resume",
        heading: HeadingLevel.HEADING_2,
        spacing: {
          before: 200,
          after: 100,
        },
        border: {
          bottom: {
            color: "000000",
            space: 1,
            style: "single",
            size: 6,
          } as IBorderOptions,
        },
      }),
      new Paragraph({
        text: this.resume.candidate_introduction,
        spacing: {
          after: 200,
        },
      }),
    ];
  }

  /**
   * Creates the Experience section with bullet points
   */
  private createExperienceSection(): Paragraph[] {
    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: "Experience",
        heading: HeadingLevel.HEADING_2,
        spacing: {
          before: 200,
          after: 100,
        },
        border: {
          bottom: {
            color: "000000",
            space: 1,
            style: "single",
            size: 6,
          } as IBorderOptions,
        },
      }),
    ];

    this.resume.experiences.forEach((exp, index) => {
      // Company and role
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.company,
              bold: true,
            }),
            new TextRun({
              text: " | ",
            }),
            new TextRun({
              text: exp.role,
              italics: true,
            }),
          ],
          spacing: {
            before: index === 0 ? 0 : 200,
            after: 50,
          },
        })
      );

      // Location and dates
      paragraphs.push(
        new Paragraph({
          text: `${exp.location} | ${exp.start_date} - ${exp.end_date}`,
          spacing: {
            after: 100,
          },
        })
      );

      // Bullet points
      exp.bullets.forEach((bullet) => {
        paragraphs.push(
          new Paragraph({
            text: bullet,
            bullet: {
              level: 0,
            },
            spacing: {
              after: 50,
            },
          })
        );
      });

      // Tech stack if available
      if (exp.tech_stack && exp.tech_stack.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Technologies: ",
                italics: true,
              }),
              new TextRun({
                text: exp.tech_stack.join(", "),
              }),
            ],
            spacing: {
              before: 50,
              after: 100,
            },
          })
        );
      }
    });

    return paragraphs;
  }

  /**
   * Creates the Education section
   */
  private createEducationSection(): Paragraph[] {
    if (!this.resume.education || this.resume.education.length === 0) {
      return [];
    }

    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: "Education",
        heading: HeadingLevel.HEADING_2,
        spacing: {
          before: 200,
          after: 100,
        },
        border: {
          bottom: {
            color: "000000",
            space: 1,
            style: "single",
            size: 6,
          } as IBorderOptions,
        },
      }),
    ];

    this.resume.education.forEach((edu, index) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.institution,
              bold: true,
            }),
            new TextRun({
              text: " | ",
            }),
            new TextRun({
              text: edu.degree,
              italics: true,
            }),
          ],
          spacing: {
            before: index === 0 ? 0 : 100,
            after: 50,
          },
        })
      );

      paragraphs.push(
        new Paragraph({
          text: `${edu.start_date} - ${edu.end_date}`,
          spacing: {
            after: 100,
          },
        })
      );
    });

    return paragraphs;
  }

  /**
   * Creates the Languages section
   */
  private createLanguagesSection(): Paragraph[] {
    if (!this.resume.languages || this.resume.languages.length === 0) {
      return [];
    }

    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: "Languages",
        heading: HeadingLevel.HEADING_2,
        spacing: {
          before: 200,
          after: 100,
        },
        border: {
          bottom: {
            color: "000000",
            space: 1,
            style: "single",
            size: 6,
          } as IBorderOptions,
        },
      }),
    ];

    this.resume.languages.forEach((lang) => {
      paragraphs.push(
        new Paragraph({
          text: `${lang.name}: ${lang.level}`,
          bullet: {
            level: 0,
          },
          spacing: {
            after: 50,
          },
        })
      );
    });

    return paragraphs;
  }

  /**
   * Creates the Skills section if tech_stack is present
   */
  private createSkillsSection(): Paragraph[] {
    // Collect all unique skills from tech_stack across all experiences
    const allSkills = new Set<string>();
    this.resume.experiences.forEach((exp) => {
      if (exp.tech_stack) {
        exp.tech_stack.forEach((skill) => allSkills.add(skill));
      }
    });

    if (allSkills.size === 0) {
      return [];
    }

    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: "Skills",
        heading: HeadingLevel.HEADING_2,
        spacing: {
          before: 200,
          after: 100,
        },
        border: {
          bottom: {
            color: "000000",
            space: 1,
            style: "single",
            size: 6,
          } as IBorderOptions,
        },
      }),
      new Paragraph({
        text: Array.from(allSkills).join(" • "),
        spacing: {
          after: 100,
        },
      }),
    ];

    return paragraphs;
  }
}
