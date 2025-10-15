/**
 * Document Export Utilities - DOCX Generation
 * Generates professional Microsoft Word documents from processed documents
 */

import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, BorderStyle, WidthType, convertInchesToTwip, Packer } from 'docx';
import { saveAs } from 'file-saver';

interface ProcessedDocument {
  id: string;
  input_text: string;
  insights: {
    themes: string[];
    sentiment: {
      overall: string;
      confidence: number;
    };
    contentAnalysis: {
      wordCount: number;
      characterCount: number;
      paragraphCount: number;
    };
    keyPoints: string[];
    actionItems: string[];
    participants: string[];
    challenges: string[];
    opportunities: string[];
    pillarAnalysis?: {
      access_to_capital?: {
        problems: Array<string | { insight_text: string; supporting_quotes?: string[]; context?: string }>;
        proposals: Array<string | { insight_text: string; supporting_quotes?: string[]; context?: string }>;
      };
      ecosystem_support?: {
        problems: Array<string | { insight_text: string; supporting_quotes?: string[]; context?: string }>;
        proposals: Array<string | { insight_text: string; supporting_quotes?: string[]; context?: string }>;
      };
      mental_health?: {
        problems: Array<string | { insight_text: string; supporting_quotes?: string[]; context?: string }>;
        proposals: Array<string | { insight_text: string; supporting_quotes?: string[]; context?: string }>;
      };
      recognition?: {
        problems: Array<string | { insight_text: string; supporting_quotes?: string[]; context?: string }>;
        proposals: Array<string | { insight_text: string; supporting_quotes?: string[]; context?: string }>;
      };
    };
  };
  metadata?: {
    processedAt: string;
    modelUsed: string;
    confidenceScore: number;
  };
}

/**
 * Helper to extract insight text
 */
function getInsightText(insight: any): string {
  return typeof insight === 'string' ? insight : insight.insight_text;
}

/**
 * Helper to get supporting quotes
 */
function getQuotes(insight: any): string[] {
  return typeof insight === 'object' ? insight.supporting_quotes || [] : [];
}

/**
 * Helper to get context
 */
function getContext(insight: any): string {
  return typeof insight === 'object' ? insight.context || '' : '';
}

/**
 * Generate a professional DOCX document
 */
export async function generateDOCXReport(document: ProcessedDocument): Promise<Blob> {
  const { insights, input_text, metadata } = document;

  const sections: any[] = [];

  // Title Page
  sections.push(
    new Paragraph({
      text: 'YSI Document Analysis Report',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: insights.themes?.[0] || 'Global Shapers Analysis',
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: `Generated ${new Date(metadata?.processedAt || new Date()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({ text: '' }) // Page break equivalent
  );

  // Metadata Table
  sections.push(
    new Paragraph({
      text: 'Document Metadata',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Document ID', bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ text: document.id })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Processing Model', bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ text: metadata?.modelUsed || 'GPT-4o-mini' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Confidence Score', bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ text: `${((metadata?.confidenceScore || 0.95) * 100).toFixed(0)}%` })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Overall Sentiment', bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ text: (insights.sentiment?.overall || 'neutral').toUpperCase() })] }),
          ],
        }),
      ],
    }),
    new Paragraph({ text: '', spacing: { after: 300 } })
  );

  // Executive Summary
  sections.push(
    new Paragraph({
      text: 'Executive Summary',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Words', bold: true })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Participants', bold: true })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Action Items', bold: true })], alignment: AlignmentType.CENTER })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: String(insights.contentAnalysis?.wordCount || 0), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: String(insights.participants?.length || 0), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: String(insights.actionItems?.length || 0), alignment: AlignmentType.CENTER })] }),
          ],
        }),
      ],
    }),
    new Paragraph({ text: '', spacing: { after: 300 } })
  );

  // Key Themes
  if (insights.themes && insights.themes.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Key Themes',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      })
    );
    insights.themes.forEach(theme => {
      sections.push(
        new Paragraph({
          text: theme,
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
    });
    sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }

  // Key Insights Section
  sections.push(
    new Paragraph({
      text: 'Key Insights',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      pageBreakBefore: true,
    })
  );

  // Participants
  if (insights.participants && insights.participants.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Participants Mentioned',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 150 },
      })
    );
    insights.participants.slice(0, 10).forEach(p => {
      sections.push(
        new Paragraph({
          text: p,
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
    });
    sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }

  // Challenges
  if (insights.challenges && insights.challenges.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Challenges Identified',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 150 },
      })
    );
    insights.challenges.forEach(c => {
      sections.push(
        new Paragraph({
          text: c,
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
    });
    sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }

  // Opportunities
  if (insights.opportunities && insights.opportunities.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Opportunities Identified',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 150 },
      })
    );
    insights.opportunities.forEach(o => {
      sections.push(
        new Paragraph({
          text: o,
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
    });
    sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }

  // YSI Pillar Analysis
  if (insights.pillarAnalysis) {
    sections.push(
      new Paragraph({
        text: 'YSI Pillar Analysis',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        pageBreakBefore: true,
      }),
      new Paragraph({
        text: 'Detailed analysis organized by Young Social Innovators framework pillars, with supporting evidence from the source document.',
        spacing: { after: 300 },
      })
    );

    const pillarNames: Record<string, { name: string; icon: string }> = {
      'access_to_capital': { name: 'Access to Capital', icon: '💰' },
      'ecosystem_support': { name: 'Ecosystem Support', icon: '🌐' },
      'mental_health': { name: 'Mental Health & Wellbeing', icon: '🌱' },
      'recognition': { name: 'Recognition', icon: '🏆' }
    };

    Object.entries(insights.pillarAnalysis).forEach(([pillar, data]: [string, any]) => {
      if (!data || ((!data.problems || data.problems.length === 0) && (!data.proposals || data.proposals.length === 0))) {
        return;
      }

      const pillarInfo = pillarNames[pillar] || { name: pillar, icon: '📊' };

      // Pillar Title
      sections.push(
        new Paragraph({
          text: `${pillarInfo.icon} ${pillarInfo.name}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        })
      );

      // Problems
      if (data.problems && data.problems.length > 0) {
        sections.push(
          new Paragraph({
            text: 'Problems & Challenges',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 150 },
            run: {
              color: 'DC2626',
            },
          })
        );

        data.problems.forEach((problem: any) => {
          const text = getInsightText(problem);
          const quotes = getQuotes(problem);
          const context = getContext(problem);

          // Problem text
          sections.push(
            new Paragraph({
              text: text,
              bullet: { level: 0 },
              spacing: { after: 100 },
            })
          );

          // Supporting quotes
          quotes.forEach((quote: string) => {
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: `"${quote}"`, italics: true })],
                indent: { left: convertInchesToTwip(0.5) },
                spacing: { after: 50 },
                border: {
                  left: {
                    color: '3B82F6',
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 6,
                  },
                },
              })
            );
          });

          // Context
          if (context) {
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: `Context: ${context}`, italics: true })],
                indent: { left: convertInchesToTwip(0.5) },
                spacing: { after: 150 },
              })
            );
          }
        });
      }

      // Proposals
      if (data.proposals && data.proposals.length > 0) {
        sections.push(
          new Paragraph({
            text: 'Proposals & Solutions',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 150 },
            run: {
              color: '16A34A',
            },
          })
        );

        data.proposals.forEach((proposal: any) => {
          const text = getInsightText(proposal);
          const quotes = getQuotes(proposal);
          const context = getContext(proposal);

          // Proposal text
          sections.push(
            new Paragraph({
              text: text,
              bullet: { level: 0 },
              spacing: { after: 100 },
            })
          );

          // Supporting quotes
          quotes.forEach((quote: string) => {
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: `"${quote}"`, italics: true })],
                indent: { left: convertInchesToTwip(0.5) },
                spacing: { after: 50 },
                border: {
                  left: {
                    color: '3B82F6',
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 6,
                  },
                },
              })
            );
          });

          // Context
          if (context) {
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: `Context: ${context}`, italics: true })],
                indent: { left: convertInchesToTwip(0.5) },
                spacing: { after: 150 },
              })
            );
          }
        });
      }
    });
  }

  // Action Items
  if (insights.actionItems && insights.actionItems.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Recommended Action Items',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        pageBreakBefore: true,
      })
    );
    insights.actionItems.forEach(item => {
      sections.push(
        new Paragraph({
          text: item,
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
    });
  }

  // Appendix: Raw Document Text
  if (input_text) {
    sections.push(
      new Paragraph({
        text: 'Appendix: Original Document Text',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        pageBreakBefore: true,
      }),
      new Paragraph({
        text: input_text,
        spacing: { after: 200 },
      })
    );
  }

  // Footer
  sections.push(
    new Paragraph({
      text: '',
      spacing: { before: 400 },
    }),
    new Paragraph({
      text: 'Generated by YSI Admin Platform • Young Social Innovators Initiative',
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `© ${new Date().getFullYear()} Global Shapers Community • World Economic Forum`,
      alignment: AlignmentType.CENTER,
    })
  );

  // Create the document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  // Generate blob
  const blob = await Packer.toBlob(doc);
  return blob;
}

/**
 * Export document as DOCX file
 */
export async function exportDocument(document: ProcessedDocument) {
  const blob = await generateDOCXReport(document);
  const filename = `YSI_Analysis_${document.id}_${new Date().toISOString().split('T')[0]}.docx`;
  saveAs(blob, filename);
}
