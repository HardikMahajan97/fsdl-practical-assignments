const XLSX = require('xlsx');
const logger = require('../utils/logger');

/**
 * Expected columns (case-insensitive, flexible aliases):
 *
 * REQUIRED:
 *   roll_number | roll | rollno
 *   student_name | name | student
 *   parent_email | parent_mail | guardian_email
 *   overall_attendance | overall | total_attendance
 *
 * OPTIONAL:
 *   parent_name | guardian_name
 *   class | class_name
 *   section
 *
 * SUBJECT COLUMNS:
 *   Any column like "Physics_total", "Physics_attended" OR
 *   Single columns: "Physics" (treated as percentage directly)
 *
 * Returns: { students: [...], errors: [...] }
 */

// Normalise column header → canonical key
const COLUMN_MAP = {
  roll_number: 'rollNumber', roll: 'rollNumber', rollno: 'rollNumber',
  'roll no': 'rollNumber', roll_no: 'rollNumber',
  student_name: 'name', name: 'name', student: 'name', studentname: 'name',
  parent_email: 'parentEmail', parent_mail: 'parentEmail',
  guardian_email: 'parentEmail', parentemail: 'parentEmail',
  parent_name: 'parentName', guardian_name: 'parentName',
  parentname: 'parentName', guardianname: 'parentName',
  overall_attendance: 'overall', overall: 'overall',
  total_attendance: 'overall', attendance: 'overall',
  class: 'className', class_name: 'className', classname: 'className',
  section: 'section',
};

function normaliseHeader(h) {
  return String(h).trim().toLowerCase().replace(/\s+/g, '_');
}

/**
 * Parse workbook sheet into structured student objects
 */
function parseSheet(sheet, threshold = 75) {
  const raw = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });

  if (!raw.length) {
    throw new Error('Sheet is empty');
  }

  const errors = [];
  const students = [];

  // Build column mapping from first row's keys
  const sampleRow = raw[0];
  const headers = Object.keys(sampleRow);

  // Detect subject columns (pairs: SubjectName_Total, SubjectName_Attended)
  // OR single subject percentage columns
  const subjectPairs = {}; // { SubjectName: { total: colKey, attended: colKey } }
  const subjectSingle = {};

  headers.forEach((h) => {
    const norm = normaliseHeader(h);

    // Subject pair detection: ends with _total or _attended
    const totalMatch = norm.match(/^(.+)_total$/);
    const attendedMatch = norm.match(/^(.+)_attended$/);
    const classesMatch = norm.match(/^(.+)_classes$/);
    const presentMatch = norm.match(/^(.+)_present$/);

    if (totalMatch) {
      const sub = titleCase(totalMatch[1]);
      if (!subjectPairs[sub]) subjectPairs[sub] = {};
      subjectPairs[sub].totalKey = h;
    } else if (attendedMatch) {
      const sub = titleCase(attendedMatch[1]);
      if (!subjectPairs[sub]) subjectPairs[sub] = {};
      subjectPairs[sub].attendedKey = h;
    } else if (classesMatch) {
      const sub = titleCase(classesMatch[1]);
      if (!subjectPairs[sub]) subjectPairs[sub] = {};
      subjectPairs[sub].totalKey = h;
    } else if (presentMatch) {
      const sub = titleCase(presentMatch[1]);
      if (!subjectPairs[sub]) subjectPairs[sub] = {};
      subjectPairs[sub].attendedKey = h;
    } else if (!COLUMN_MAP[norm]) {
      // Unknown column treated as single subject percentage
      subjectSingle[h] = h;
    }
  });

  raw.forEach((row, idx) => {
    const rowNum = idx + 2; // 1-indexed + header row
    const mapped = {};

    // Map known columns
    headers.forEach((h) => {
      const norm = normaliseHeader(h);
      if (COLUMN_MAP[norm]) {
        mapped[COLUMN_MAP[norm]] = String(row[h] || '').trim();
      }
    });

    // Validate required fields
    const rowErrors = [];
    if (!mapped.rollNumber) rowErrors.push('Missing roll number');
    if (!mapped.name) rowErrors.push('Missing student name');
    if (!mapped.parentEmail) rowErrors.push('Missing parent email');
    if (!mapped.overall) rowErrors.push('Missing overall attendance');

    if (rowErrors.length) {
      errors.push({ row: rowNum, student: mapped.name || '—', issues: rowErrors });
      return; // skip row
    }

    // Validate email
    if (!/^\S+@\S+\.\S+$/.test(mapped.parentEmail)) {
      errors.push({ row: rowNum, student: mapped.name, issues: ['Invalid parent email format'] });
      return;
    }

    const overallPct = parseFloat(mapped.overall);
    if (isNaN(overallPct) || overallPct < 0 || overallPct > 100) {
      errors.push({ row: rowNum, student: mapped.name, issues: ['Invalid overall attendance value'] });
      return;
    }

    // Build subjects array
    const subjects = [];

    // From pairs
    Object.entries(subjectPairs).forEach(([subName, keys]) => {
      if (!keys.totalKey || !keys.attendedKey) return;
      const total = parseInt(row[keys.totalKey]) || 0;
      const attended = parseInt(row[keys.attendedKey]) || 0;
      const pct = total > 0 ? parseFloat(((attended / total) * 100).toFixed(2)) : 0;
      subjects.push({ name: subName, totalClasses: total, attended, percentage: pct });
    });

    // From single-pct columns
    Object.entries(subjectSingle).forEach(([colKey, subName]) => {
      const pct = parseFloat(row[colKey]);
      if (!isNaN(pct) && pct >= 0 && pct <= 100) {
        subjects.push({
          name: titleCase(subName),
          totalClasses: 0,
          attended: 0,
          percentage: pct,
        });
      }
    });

    students.push({
      rollNumber: mapped.rollNumber,
      name: mapped.name,
      parentName: mapped.parentName || 'Parent/Guardian',
      parentEmail: mapped.parentEmail.toLowerCase(),
      className: mapped.className || '',
      section: mapped.section || '',
      subjects,
      overallAttendance: overallPct,
      isBelowThreshold: overallPct < threshold,
    });
  });

  logger.info('Sheet parsed', {
    totalRows: raw.length,
    validStudents: students.length,
    parseErrors: errors.length,
    belowThreshold: students.filter((s) => s.isBelowThreshold).length,
  });

  return { students, errors };
}

/**
 * Main entry point: accepts file buffer + mimetype
 */
function parseAttendanceFile(buffer, originalName, threshold = 75) {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) throw new Error('No sheets found in workbook');

    logger.debug('Parsing workbook', { file: originalName, sheet: sheetName });

    const sheet = workbook.Sheets[sheetName];
    return parseSheet(sheet, threshold);
  } catch (err) {
    logger.error('File parse error', { file: originalName, error: err.message });
    throw new Error(`Failed to parse file "${originalName}": ${err.message}`);
  }
}

function titleCase(str) {
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

module.exports = { parseAttendanceFile };
