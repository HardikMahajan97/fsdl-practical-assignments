const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const { promisify } = require('util');
const logger = require('../utils/logger');

const execFileAsync = promisify(execFile);

// Output directory for generated PDFs
const OUTPUT_DIR = path.join(__dirname, '../uploads/letters');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

/**
 * Escape special LaTeX characters
 */
function escapeLaTeX(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}');
}

function formatDate(date) {
  return new Date(date || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Build subject table rows for LaTeX
 */
function buildSubjectTable(subjects) {
  if (!subjects || subjects.length === 0) return '';

  const rows = subjects
    .map((s) => {
      const pct = typeof s.percentage === 'number' ? s.percentage.toFixed(1) : '—';
      const colorCmd =
        s.percentage < 75 ? '\\color{dangerred}' : '\\color{safegreen}';
      const totalCol = s.totalClasses > 0 ? s.totalClasses : '—';
      const attendedCol = s.totalClasses > 0 ? s.attended : '—';
      return `  ${escapeLaTeX(s.name)} & ${totalCol} & ${attendedCol} & {${colorCmd}\\textbf{${pct}\\%}} \\\\`;
    })
    .join('\n');

  return `
\\begin{center}
\\begin{tabular}{|l|c|c|c|}
  \\hline
  \\rowcolor{headerblue}
  \\textcolor{white}{\\textbf{Subject}} & \\textcolor{white}{\\textbf{Total Classes}} & \\textcolor{white}{\\textbf{Attended}} & \\textcolor{white}{\\textbf{Percentage}} \\\\
  \\hline
${rows}
  \\hline
\\end{tabular}
\\end{center}`;
}

/**
 * Generate LaTeX source for one student letter
 */
function generateLatexSource(student, report, schoolInfo) {
  const dateStr = formatDate(new Date());
  const fromDate = report.fromDate ? formatDate(report.fromDate) : '—';
  const toDate = report.toDate ? formatDate(report.toDate) : '—';
  const overallPct = student.overallAttendance.toFixed(2);
  const threshold = report.threshold || 75;
  const absent = (() => {
    // Compute absent days from subjects if available
    const s = student.subjects[0];
    if (s && s.totalClasses > 0) {
      const totalClasses = student.subjects.reduce((a, sub) => a + (sub.totalClasses || 0), 0);
      const attended = student.subjects.reduce((a, sub) => a + (sub.attended || 0), 0);
      if (totalClasses > 0) return totalClasses - attended;
    }
    return null;
  })();

  const subjectTable = buildSubjectTable(student.subjects);

  return `\\documentclass[12pt,a4paper]{letter}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\usepackage{xcolor}
\\usepackage{booktabs}
\\usepackage{tabularx}
\\usepackage{colortbl}
\\usepackage{array}
\\usepackage{graphicx}
\\usepackage{fancyhdr}
\\usepackage{microtype}
\\usepackage{parskip}
\\usepackage{lmodern}
\\usepackage{multirow}
\\usepackage{hhline}

\\geometry{top=2.5cm,bottom=3cm,left=2.8cm,right=2.8cm}

% ── Colour Palette ──
\\definecolor{schoolblue}{RGB}{26,58,120}
\\definecolor{headerblue}{RGB}{26,58,120}
\\definecolor{dangerred}{RGB}{192,57,43}
\\definecolor{safegreen}{RGB}{26,107,60}
\\definecolor{warnorange}{RGB}{211,84,0}
\\definecolor{lightgray}{RGB}{245,245,245}
\\definecolor{borderblue}{RGB}{180,200,230}

\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\fancyfoot[C]{\\scriptsize\\color{gray}This is a computer-generated letter. \\textit{${escapeLaTeX(schoolInfo.name)}} --- ${escapeLaTeX(schoolInfo.address)}}
\\fancyfoot[R]{\\scriptsize\\thepage}

\\begin{document}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{8pt}

% ════════════════════════════════════
%   LETTERHEAD
% ════════════════════════════════════
\\begin{center}
  {\\fontsize{20pt}{24pt}\\selectfont\\color{schoolblue}\\textbf{${escapeLaTeX(schoolInfo.name)}}}\\\\[4pt]
  {\\small ${escapeLaTeX(schoolInfo.address)}}\\\\[2pt]
  {\\small \\textbf{Tel:} ${escapeLaTeX(schoolInfo.phone)} \\quad \\textbf{Email:} ${escapeLaTeX(schoolInfo.email)} \\quad \\textbf{Web:} ${escapeLaTeX(schoolInfo.website)}}
\\end{center}

\\noindent\\rule{\\linewidth}{0.8pt}

\\vspace{6pt}

% ════════════════════════════════════
%   DATE + REFERENCE
% ════════════════════════════════════
\\begin{flushright}
  \\textbf{Date:} ${dateStr}\\\\
  \\textbf{Ref:} ATT/${escapeLaTeX(student.rollNumber)}/${new Date().getFullYear()}
\\end{flushright}

\\vspace{4pt}

% ════════════════════════════════════
%   ADDRESSEE
% ════════════════════════════════════
\\textbf{${escapeLaTeX(student.parentName)}}\\\\
Parent/Guardian of ${escapeLaTeX(student.name)}\\\\
Roll No: ${escapeLaTeX(student.rollNumber)}${student.className ? ` \\quad Class: ${escapeLaTeX(student.className)}${student.section ? ' -- ' + escapeLaTeX(student.section) : ''}` : ''}

\\vspace{8pt}

\\noindent\\textbf{\\large Subject: Notice of Low Attendance --- Academic Period ${fromDate} to ${toDate}}

\\noindent\\rule{\\linewidth}{0.4pt}

\\vspace{4pt}

Dear ${escapeLaTeX(student.parentName)},

We are writing to bring to your attention a matter of significant academic concern regarding your ward, \\textbf{${escapeLaTeX(student.name)}} (Roll No: ${escapeLaTeX(student.rollNumber)}).

Our attendance records for the period \\textbf{${fromDate}} to \\textbf{${toDate}} indicate that your ward's overall attendance currently stands at:

\\begin{center}
\\begin{tabular}{|l|c|}
  \\hline
  \\rowcolor{lightgray}
  \\textbf{Parameter} & \\textbf{Value} \\\\
  \\hline
  Student Name & ${escapeLaTeX(student.name)} \\\\
  \\hline
  Roll Number & ${escapeLaTeX(student.rollNumber)} \\\\
  \\hline
  Class / Section & ${escapeLaTeX((student.className || '—') + (student.section ? ' — ' + student.section : ''))} \\\\
  \\hline
  Overall Attendance & {\\color{dangerred}\\textbf{${overallPct}\\%}} \\\\
  \\hline
  Required Minimum & {\\color{safegreen}\\textbf{${threshold}\\%}} \\\\
  \\hline${absent !== null ? `
  Total Absent & {\\color{dangerred}\\textbf{${absent} classes}} \\\\
  \\hline` : ''}
\\end{tabular}
\\end{center}

This attendance figure is \\textbf{below the minimum required threshold of ${threshold}\\%} as prescribed by the institution and the affiliated academic board.
${subjectTable ? `
\\textbf{Subject-wise Attendance Breakdown:}
${subjectTable}
` : ''}
\\textbf{Important Notice:} As per school regulations, students whose attendance falls below \\textbf{${threshold}\\%} may:\\\\
\\begin{itemize}
  \\item Be \\textbf{barred from appearing in terminal/board examinations}
  \\item Have their academic records \\textbf{flagged for disciplinary review}
  \\item Be required to \\textbf{repeat the academic year} if attendance is not rectified
\\end{itemize}

We urge you to take immediate steps to ensure regular attendance. If there are genuine medical or personal reasons contributing to the absenteeism, we request you to submit proper supporting documentation to the class teacher at the earliest.

You are \\textbf{kindly requested to meet the Class Teacher or the school Principal} at your earliest convenience to discuss this matter and work out a remedial plan.

We remain committed to the academic growth and well-being of your ward and trust that you will accord this matter the urgency it deserves.

\\vspace{14pt}

Yours sincerely,\\\\[18pt]
\\textbf{${escapeLaTeX(schoolInfo.principalName)}}\\\\
Principal\\\\
${escapeLaTeX(schoolInfo.name)}

\\vspace{10pt}
\\hrule
\\vspace{4pt}
{\\footnotesize \\textit{Note: This letter has been automatically generated by the Attendance Management System on ${dateStr}. Please contact the school office for any discrepancies.}}

\\end{document}
`;
}

/**
 * Compile LaTeX source to PDF
 * Returns path to generated PDF
 */
async function compileLatexToPDF(latexSource, filename) {
  const tmpDir = path.join(OUTPUT_DIR, 'tmp_' + filename);
  const texFile = path.join(tmpDir, `${filename}.tex`);
  const pdfFile = path.join(OUTPUT_DIR, `${filename}.pdf`);

  try {
    // Create temp directory
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(texFile, latexSource, 'utf8');

    const latexCmd = process.env.LATEX_CMD || 'pdflatex';

    // Run LaTeX twice for proper reference resolution
    const latexArgs = [
      '-interaction=nonstopmode',
      '-halt-on-error',
      `-output-directory=${tmpDir}`,
      texFile,
    ];

    for (let pass = 1; pass <= 2; pass++) {
      const { stdout, stderr } = await execFileAsync(latexCmd, latexArgs, {
        timeout: 30000,
      });
      logger.debug(`LaTeX pass ${pass} complete`, { file: filename });
    }

    // Move PDF to output dir
    const compiledPDF = path.join(tmpDir, `${filename}.pdf`);
    if (!fs.existsSync(compiledPDF)) {
      throw new Error('PDF was not generated — check LaTeX source');
    }
    fs.renameSync(compiledPDF, pdfFile);

    logger.info('PDF generated successfully', { file: `${filename}.pdf` });
    return pdfFile;
  } catch (err) {
    logger.error('LaTeX compilation failed', { filename, error: err.message });
    throw new Error(`PDF generation failed for ${filename}: ${err.message}`);
  } finally {
    // Cleanup temp directory
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

/**
 * Main: generate letter PDF for a student
 */
async function generateStudentLetter(student, report) {
  const schoolInfo = {
    name: process.env.SCHOOL_NAME || 'Greenwood Public School',
    address: process.env.SCHOOL_ADDRESS || '123 Education Lane, City',
    phone: process.env.SCHOOL_PHONE || 'N/A',
    email: process.env.SCHOOL_EMAIL || 'admin@school.edu',
    website: process.env.SCHOOL_WEBSITE || 'www.school.edu',
    principalName: process.env.PRINCIPAL_NAME || 'The Principal',
  };

  const safeRoll = student.rollNumber.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `letter_${report._id}_${safeRoll}`;

  // Check if already generated
  const existingPDF = path.join(OUTPUT_DIR, `${filename}.pdf`);
  if (fs.existsSync(existingPDF)) {
    logger.debug('PDF already exists, reusing', { filename });
    return existingPDF;
  }

  const latexSource = generateLatexSource(student, report, schoolInfo);
  return compileLatexToPDF(latexSource, filename);
}

module.exports = { generateStudentLetter, OUTPUT_DIR };
