/**
 * Global Insights Export Utilities - DOCX Generation
 * Generates comprehensive Word document with all insights across all pillars
 */

import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, BorderStyle, WidthType, convertInchesToTwip, Packer } from 'docx';
import { saveAs } from 'file-saver';
import { InsightsData, InsightItem, Pillar } from '../types/insights';

// Pillar configuration with colors and names
const PILLAR_CONFIG: Record<Pillar, { name: string; icon: string; color: string }> = {
  'capital_access': { name: 'Access to Capital', icon: '💰', color: 'DC2626' },
  'ecosystem_support': { name: 'Ecosystem Support', icon: '🌐', color: '2563EB' },
  'wellbeing_recognition': { name: 'Mental Health & Recognition', icon: '🌱', color: '16A34A' }
};

/**
 * Format date to readable string
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Calculate total statistics across all insights
 */
function calculateStats(insightsData: InsightsData) {
  let totalProblems = 0;
  let totalProposals = 0;
  let totalCitations = 0;
  let totalDocuments = 0;

  insightsData.pillars.forEach(pillar => {
    totalProblems += pillar.problems.length;
    totalProposals += pillar.proposals.length;

    [...pillar.problems, ...pillar.proposals].forEach(insight => {
      totalCitations += insight.supporting_docs.reduce((acc, doc) => acc + doc.citations.length, 0);
      totalDocuments += insight.supporting_docs.length;
    });
  });

  return { totalProblems, totalProposals, totalCitations, totalDocuments };
}

/**
 * Generate sections for a single insight
 */
function generateInsightSections(insight: InsightItem, rank: number, type: 'problem' | 'proposal'): any[] {
  const sections: any[] = [];
  const typeColor = type === 'problem' ? 'DC2626' : '16A34A';

  // Insight header with rank
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: `#${rank} `, bold: true, color: typeColor, size: 28 }),
        new TextRun({ text: insight.canonical_text, bold: true, size: 24 })
      ],
      spacing: { before: 300, after: 150 },
    })
  );

  // Stats table
  sections.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
        left: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
        right: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Documents', bold: true, size: 20 })],
                alignment: AlignmentType.CENTER
              })]
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Weighted Score', bold: true, size: 20 })],
                alignment: AlignmentType.CENTER
              })]
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Last Seen', bold: true, size: 20 })],
                alignment: AlignmentType.CENTER
              })]
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Total Citations', bold: true, size: 20 })],
                alignment: AlignmentType.CENTER
              })]
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                text: String(insight.count),
                alignment: AlignmentType.CENTER
              })]
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: insight.weighted_count.toFixed(1), color: '0077B6' })],
                alignment: AlignmentType.CENTER
              })]
            }),
            new TableCell({
              children: [new Paragraph({
                text: formatDate(insight.last_seen),
                alignment: AlignmentType.CENTER
              })]
            }),
            new TableCell({
              children: [new Paragraph({
                text: String(insight.supporting_docs.reduce((acc, doc) => acc + doc.citations.length, 0)),
                alignment: AlignmentType.CENTER
              })]
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ text: '', spacing: { after: 150 } })
  );

  // Alternative phrasings
  if (insight.aliases.length > 0) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Alternative Phrasings:', bold: true, size: 22 })],
        spacing: { before: 150, after: 100 },
      })
    );

    insight.aliases.slice(0, 5).forEach(alias => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: '• ', color: '9CA3AF' }),
            new TextRun({ text: alias, italics: true, size: 20 })
          ],
          spacing: { after: 50 },
          indent: { left: convertInchesToTwip(0.25) },
        })
      );
    });

    sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));
  }

  // Supporting evidence
  if (insight.supporting_docs.length > 0) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: `Supporting Evidence (${insight.supporting_docs.length} documents):`, bold: true, size: 22 })],
        spacing: { before: 200, after: 150 },
      })
    );

    insight.supporting_docs.forEach((doc, docIdx) => {
      // Document header
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `📄 ${doc.doc_title}`, bold: true, size: 22, color: '0077B6' })
          ],
          spacing: { before: 150, after: 75 },
          indent: { left: convertInchesToTwip(0.25) },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Uploaded by: ${doc.uploader} | `, size: 18, color: '6B7280' }),
            new TextRun({ text: formatDate(doc.date), size: 18, color: '6B7280' }),
            new TextRun({ text: ` | ${doc.citations.length} citations`, size: 18, color: '6B7280' })
          ],
          spacing: { after: 100 },
          indent: { left: convertInchesToTwip(0.25) },
        })
      );

      // Citations
      doc.citations.forEach((citation, citeIdx) => {
        // Quote
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: `"${citation.quote}"`, italics: true, size: 20 })],
            spacing: { after: 50 },
            indent: { left: convertInchesToTwip(0.75) },
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

        // Citation metadata
        const metadataParts: string[] = [];
        if (citation.speaker) metadataParts.push(`Speaker: ${citation.speaker}`);
        if (citation.timestamp) metadataParts.push(`Time: ${citation.timestamp}`);

        if (metadataParts.length > 0) {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: metadataParts.join(' | '), size: 18, color: '9CA3AF' })],
              spacing: { after: 50 },
              indent: { left: convertInchesToTwip(0.75) },
            })
          );
        }

        // Context
        if (citation.context) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: 'Context: ', bold: true, size: 18, color: '6B7280' }),
                new TextRun({ text: citation.context, size: 18, color: '6B7280' })
              ],
              spacing: { after: 100 },
              indent: { left: convertInchesToTwip(0.75) },
            })
          );
        }

        sections.push(new Paragraph({ text: '', spacing: { after: 50 } }));
      });

      sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));
    });
  }

  sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  return sections;
}

/**
 * Generate complete Global Insights report
 */
export async function exportAllGlobalInsights(insightsData: InsightsData): Promise<void> {
  const sections: any[] = [];
  const stats = calculateStats(insightsData);

  // Title Page
  sections.push(
    new Paragraph({
      text: 'Global Insights Report',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: 'Comprehensive Analysis Across All Pillars',
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: `Generated ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({ text: '' })
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
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Total Problems', bold: true })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Total Proposals', bold: true })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Total Citations', bold: true })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Documents Analyzed', bold: true })], alignment: AlignmentType.CENTER })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: String(stats.totalProblems), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: String(stats.totalProposals), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: String(stats.totalCitations), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: String(stats.totalDocuments), alignment: AlignmentType.CENTER })] }),
          ],
        }),
      ],
    }),
    new Paragraph({ text: '', spacing: { after: 400 } })
  );

  // Process each pillar
  insightsData.pillars.forEach((pillarData, pillarIdx) => {
    const config = PILLAR_CONFIG[pillarData.pillar];

    // Pillar header
    sections.push(
      new Paragraph({
        text: `${config.icon} ${config.name}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        pageBreakBefore: pillarIdx > 0,
      })
    );

    // Problems section
    if (pillarData.problems.length > 0) {
      sections.push(
        new Paragraph({
          text: '🔴 Top Problems & Challenges',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        })
      );

      pillarData.problems.slice(0, 10).forEach((problem, idx) => {
        const problemSections = generateInsightSections(problem, idx + 1, 'problem');
        sections.push(...problemSections);
      });
    }

    // Proposals section
    if (pillarData.proposals.length > 0) {
      sections.push(
        new Paragraph({
          text: '🟢 Top Proposals & Solutions',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        })
      );

      pillarData.proposals.slice(0, 10).forEach((proposal, idx) => {
        const proposalSections = generateInsightSections(proposal, idx + 1, 'proposal');
        sections.push(...proposalSections);
      });
    }
  });

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

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  // Generate and save
  const blob = await Packer.toBlob(doc);
  const filename = `YSI_Global_Insights_${new Date().toISOString().split('T')[0]}.docx`;
  saveAs(blob, filename);
}
