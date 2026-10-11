import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Search,
  Trash2,
  Upload,
  UserRound,
  X,
  ZoomIn,
} from 'lucide-react';
import { defaultCohorts } from './curricula';

const DATABASE_NAME = 'ssgh-academic-vault';
const DATABASE_VERSION = 1;
const STORE_NAME = 'app-state';
const STATE_KEY = 'cohort-curricula';
const LEGACY_STORAGE_KEY = 'ssgh_cohort_curricula';
const grades = ['9', '10', '11', '12'];
const filters = [
  { id: 'all', label: 'All Units' },
  { id: 'stem', label: 'STEM' },
  { id: 'humanities', label: 'Humanities' },
  { id: 'exam', label: 'Board Prep' },
];

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('This browser does not support local document storage.'));
      return;
    }

    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open local document storage.'));
  });
}

async function readSavedCurricula() {
  const database = await openDatabase();
  try {
    const saved = await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).get(STATE_KEY);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('Could not read saved curricula.'));
    });

    if (saved && typeof saved === 'object') return mergeCurricula(saved);

    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacy) return defaultCohorts;

    let parsed;
    try {
      parsed = JSON.parse(legacy);
    } catch (error) {
      console.error('Could not read legacy saved curricula:', error);
      return defaultCohorts;
    }
    const migrated = mergeCurricula(parsed);
    await writeSavedCurricula(migrated);
    return migrated;
  } finally {
    database.close();
  }
}

function mergeCurricula(saved) {
  return Object.fromEntries(
    grades.map((grade) => {
      const defaults = defaultCohorts[grade];
      const entry = saved?.[grade];
      const units = Array.isArray(entry?.units) ? entry.units : defaults.units;
      return [grade, { ...defaults, ...entry, units }];
    }),
  );
}

async function writeSavedCurricula(curricula) {
  const database = await openDatabase();
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(curricula, STATE_KEY);
      transaction.oncomplete = resolve;
      transaction.onerror = () =>
        reject(transaction.error ?? new Error('Could not save curricula to this browser.'));
      transaction.onabort = () =>
        reject(transaction.error ?? new Error('Saving curricula was cancelled.'));
    });
  } finally {
    database.close();
  }
}

function pdfEscape(value) {
  return value.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
}

function createSyllabusPdf(unit, grade) {
  const toAscii = (value) =>
    value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7e]/g, ' ');
  const textLines = [
    'SS +2 HS GHAGHRA, GUMLA',
    `Class ${grade} | ${unit.number} | ${unit.code}`,
    '',
    unit.title,
    '',
    'CORE TOPICS & COMPETENCIES',
    ...unit.topics.map((topic) => `- ${topic}`),
    '',
    `Bibliography: ${unit.bibliography || 'SS +2 HS Ghaghra Curricular Archive.'}`,
    '',
    'Prepared by SS +2 HS Ghaghra Academic Vault.',
  ].flatMap((line) => {
    const ascii = toAscii(line);
    if (!ascii) return [''];
    const words = ascii.split(/\s+/);
    const wrapped = [];
    let current = '';
    words.forEach((word) => {
      const next = current ? `${current} ${word}` : word;
      if (next.length > 82 && current) {
        wrapped.push(current);
        current = word;
      } else {
        current = next;
      }
    });
    if (current) wrapped.push(current);
    return wrapped;
  });
  const commands = ['BT', '/F1 11 Tf', '50 790 Td', '14 TL'];
  textLines.slice(0, 50).forEach((line, index) => {
    if (index > 0) commands.push('T*');
    commands.push(`(${pdfEscape(line)}) Tj`);
  });
  commands.push('ET');
  const stream = commands.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}

function downloadUnit(unit, grade) {
  const blob = unit.fileBlob ?? createSyllabusPdf(unit, grade);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${unit.code}_${unit.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return link.download;
}

function BrandMark({ small = false }) {
  return (
    <div
      className={`${small ? 'h-8 w-8' : 'h-9 w-9'} flex items-center justify-center rounded bg-[#102241] text-white shadow-sm ring-1 ring-slate-900/10`}
      aria-hidden="true"
    >
      <GraduationCap className={`${small ? 'h-4 w-4' : 'h-5 w-5'} text-slate-200`} />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 flex w-full items-center justify-between border-b border-slate-200/60 bg-white/80 px-6 py-3.5 shadow-sm backdrop-blur-md sm:px-12">
      <a href="#top" className="flex items-center space-x-3.5" aria-label="SS +2 HS Ghaghra Academic Portal home">
        <BrandMark />
        <span className="leading-tight">
          <span className="block font-crest text-xs font-bold uppercase tracking-widest text-[#0d1b30] sm:text-sm">
            SS +2 HS Ghaghra, Gumla
          </span>
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-[11px]">
            Academic Portal
          </span>
        </span>
      </a>
      <a
        href="mailto:ghaghrasshighschool@gmail.com"
        aria-label="Contact the academic office"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0d1b30] text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <UserRound className="h-4 w-4 text-slate-100" />
      </a>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-12 w-full border-t border-slate-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-12 sm:px-12">
        <div className="grid grid-cols-1 gap-8 border-b border-slate-200/60 pb-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center space-x-3">
              <BrandMark small />
              <div>
                <span className="block font-crest text-xs font-bold uppercase tracking-widest text-[#0d1b30]">
                  SS +2 HS Ghaghra, Gumla
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Academic Repository &amp; Vault
                </span>
              </div>
            </div>
            <p className="max-w-sm pt-1 text-xs leading-relaxed text-slate-600">
              Committed to academic excellence, student development, and scholarly rigor.
            </p>
            <p className="text-[11px] text-slate-500">
              Institutional PIN: <span className="font-mono font-medium text-slate-700">835208</span>
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">Quick Links</h2>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><a className="transition hover:text-blue-600" href="#directory">Curriculum Vault</a></li>
              <li><a className="transition hover:text-blue-600" href="#syllabus">Syllabus Archive</a></li>
              <li><a className="transition hover:text-blue-600" href="mailto:ghaghrasshighschool@gmail.com">Faculty Directory</a></li>
              <li><a className="transition hover:text-blue-600" href="#top">Back to top</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">Resources</h2>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><a className="transition hover:text-blue-600" href="#syllabus">Study Guides</a></li>
              <li><a className="transition hover:text-blue-600" href="#syllabus">Topic Guides</a></li>
              <li><a className="transition hover:text-blue-600" href="#syllabus">Board Preparation</a></li>
              <li><a className="transition hover:text-blue-600" href="#directory">Class Cohorts</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">Contact &amp; Hours</h2>
            <div className="space-y-2 text-xs leading-relaxed text-slate-600">
              <p><span className="font-medium text-slate-800">Address:</span> Near Chandni Chowk Ghaghra, Gumla, PIN - 835208</p>
              <p><span className="font-medium text-slate-800">Email:</span> <a className="hover:text-blue-600" href="mailto:ghaghrasshighschool@gmail.com">ghaghrasshighschool@gmail.com</a></p>
              <p className="pt-1 text-[11px] text-slate-500"><span className="font-medium text-slate-700">Hours:</span> Mon–Fri, 9:00 AM – 3:00 PM</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 pt-6 text-xs text-slate-500 sm:flex-row">
          <span>© 2026 SS +2 HS Ghaghra, Gumla. All rights reserved.</span>
          <a className="transition hover:text-slate-800" href="mailto:ghaghrasshighschool@gmail.com">Contact the academic office</a>
        </div>
      </div>
    </footer>
  );
}

function UnitCard({ unit, grade, onView, onDownload, onDelete }) {
  return (
    <article className="group relative rounded-lg border border-slate-200/90 bg-white/95 p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md sm:p-6">
      {unit.isCustomUpload && (
        <button
          type="button"
          onClick={() => onDelete(unit)}
          title="Delete uploaded syllabus"
          aria-label={`Delete ${unit.title}`}
          className="absolute right-4 top-4 rounded p-1 text-slate-400 transition hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="max-w-3xl space-y-2.5 pr-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-slate-700">{unit.number}</span>
            <span className="font-mono text-xs font-semibold text-blue-700">{unit.code}</span>
            <span className="text-slate-300">•</span>
            <span className="rounded border border-blue-200/60 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{unit.badge}</span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-medium text-slate-500">{unit.isCustomUpload ? 'Uploaded Syllabus' : `Verified: ${unit.updated}`}</span>
          </div>
          <h4 className="font-serif text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{unit.title}</h4>
          <div className="pt-1">
            <p className="mb-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">Core Topics &amp; Competencies:</p>
            <ul className="grid list-disc grid-cols-1 gap-x-4 gap-y-1 pl-4 text-xs text-slate-600 marker:text-blue-500 md:grid-cols-2">
              {unit.topics.map((topic) => <li key={topic}>{topic}</li>)}
            </ul>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 border-t border-slate-100 pt-3 sm:flex-row lg:w-64 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
          <div className="space-y-0.5 text-[11px] text-slate-500 lg:text-right">
            <div className="flex items-center gap-1 font-medium text-slate-700 lg:justify-end">
              <FileText className="h-3.5 w-3.5 text-red-500" />
              <span>Format: PDF • {unit.size}</span>
            </div>
            <div>Class {grade} Institutional Access</div>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto lg:w-full">
            <button
              type="button"
              onClick={() => onView(unit)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <Eye className="h-3.5 w-3.5 text-slate-300" />
              <span>View PDF</span>
            </button>
            <button
              type="button"
              onClick={() => onDownload(unit)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded border border-blue-200/80 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-100 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function UploadModal({ grade, onClose, onSubmit }) {
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const formRef = useRef(null);

  function submit(event) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const file = form.get('pdf');
    if (!(file instanceof File) || file.size === 0) {
      setError('Choose a PDF file to upload.');
      return;
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('The selected file must be a PDF.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError('The selected PDF exceeds the 25 MB file-size limit.');
      return;
    }
    onSubmit({
      grade: String(form.get('grade')),
      title: String(form.get('title')).trim(),
      code: String(form.get('code')).trim().toUpperCase(),
      discipline: String(form.get('discipline')),
      topics: String(form.get('topics'))
        .split(',')
        .map((topic) => topic.trim())
        .filter(Boolean),
      file,
    });
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="upload-modal-title">
      <button type="button" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" aria-label="Close upload dialog" onClick={onClose} />
      <div className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto p-4">
        <div className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-serif text-xl font-bold text-slate-900" id="upload-modal-title">Upload Syllabus PDF</h2>
            <button type="button" onClick={onClose} aria-label="Close upload dialog" className="rounded p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form ref={formRef} onSubmit={submit} className="space-y-4 pt-4">
            <label className="block space-y-1">
              <span className="block font-mono text-xs font-semibold uppercase text-slate-700">Target Class Cohort</span>
              <select name="grade" defaultValue={grade} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600">
                <option value="9">Grade IX (Class 9)</option>
                <option value="10">Grade X (Class 10)</option>
                <option value="11">Grade XI (Class 11)</option>
                <option value="12">Grade XII (Class 12)</option>
              </select>
            </label>
            <label className="block space-y-1">
              <span className="block font-mono text-xs font-semibold uppercase text-slate-700">Unit / Subject Title</span>
              <input name="title" required maxLength={160} placeholder="e.g., Physics Mechanics & Wave Theory" className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600" />
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="block font-mono text-xs font-semibold uppercase text-slate-700">Subject Code</span>
                <input name="code" required maxLength={40} placeholder="e.g., PHY-1206" className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800 focus:ring-2 focus:ring-blue-600" />
              </label>
              <label className="block space-y-1">
                <span className="block font-mono text-xs font-semibold uppercase text-slate-700">Category / Discipline</span>
                <select name="discipline" defaultValue="stem" className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600">
                  <option value="stem">STEM / Science</option>
                  <option value="humanities">Humanities / Arts</option>
                  <option value="exam">Board Prep / Exam</option>
                </select>
              </label>
            </div>
            <label className="block space-y-1">
              <span className="block font-mono text-xs font-semibold uppercase text-slate-700">Syllabus Topics (comma separated)</span>
              <textarea name="topics" rows="2" maxLength={2000} placeholder="Rotational dynamics, Wave interference, Simple harmonic motion" className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600" />
            </label>
            <label className="block space-y-1">
              <span className="block font-mono text-xs font-semibold uppercase text-slate-700">Select PDF File</span>
              <span className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100">
                <Upload className="mb-1 h-6 w-6 text-slate-400" />
                <span className="px-4 text-center text-xs text-slate-500">
                  {fileName ? <><strong className="text-blue-600">{fileName}</strong> selected</> : <><strong>Click to upload PDF</strong> or drag and drop</>}
                </span>
                <span className="text-[10px] text-slate-400">PDF up to 25 MB</span>
                <input
                  name="pdf"
                  type="file"
                  accept="application/pdf,.pdf"
                  required
                  className="sr-only"
                  onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')}
                />
              </span>
            </label>
            {error && <p role="alert" className="text-xs font-medium text-red-700">{error}</p>}
            <div className="flex items-center justify-end space-x-2 pt-3">
              <button type="button" onClick={onClose} className="rounded border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100">Cancel</button>
              <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700">Upload &amp; Publish</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function PdfModal({ unit, grade, onClose, onDownload }) {
  const [zoomed, setZoomed] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    if (!unit?.fileBlob) {
      setPdfUrl('');
      return undefined;
    }
    const url = URL.createObjectURL(unit.fileBlob);
    setPdfUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [unit]);

  useEffect(() => setZoomed(false), [unit]);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="pdf-modal-title">
      <button type="button" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" aria-label="Close PDF preview" onClick={onClose} />
      <div className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto p-3 sm:p-6">
        <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 bg-[#0e1c33] px-5 py-3.5 text-white">
            <div className="flex min-w-0 items-center space-x-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-blue-400/30 bg-blue-600/30 text-blue-200"><FileText className="h-4 w-4" /></span>
              <div className="min-w-0">
                <h2 id="pdf-modal-title" className="truncate text-sm font-semibold text-slate-100">{unit.number}: {unit.title}</h2>
                <p className="truncate text-[11px] text-slate-400">{unit.code} • SS +2 HS Ghaghra Vault • {unit.size}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center space-x-2">
              {!unit.fileBlob && (
                <button type="button" onClick={() => setZoomed((value) => !value)} title="Toggle zoom" aria-label="Toggle document zoom" className="rounded p-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white">
                  <ZoomIn className="h-4 w-4" />
                </button>
              )}
              <button type="button" onClick={() => onDownload(unit)} className="inline-flex items-center gap-1.5 rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-500">
                <Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">Download</span>
              </button>
              <button type="button" onClick={onClose} aria-label="Close preview" className="rounded p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          {pdfUrl ? (
            <iframe title={`PDF preview: ${unit.title}`} src={pdfUrl} className="min-h-[65vh] flex-1 bg-slate-100" />
          ) : (
            <div className="flex-1 overflow-y-auto bg-slate-100 p-4 text-slate-800 sm:p-8">
              <article className={`mx-auto w-full max-w-2xl space-y-6 rounded border border-slate-200/90 bg-white p-8 text-left shadow-md transition-all duration-200 sm:p-12 ${zoomed ? 'scale-110 origin-top' : ''}`}>
                <header className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
                  <div>
                    <p className="font-crest text-[10px] font-bold uppercase tracking-widest text-slate-600">SS +2 HS GHAGHRA, GUMLA</p>
                    <h3 className="mt-1 font-serif text-2xl font-bold text-slate-900">{unit.number}: {unit.title}</h3>
                    <p className="mt-0.5 font-mono text-xs font-semibold text-blue-700">SSGH-DOC-{unit.code}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-800">{unit.isCustomUpload ? 'UPLOADED PDF' : 'SYLLABUS PREVIEW'}</span>
                    <p className="mt-1 text-[10px] text-slate-400">Academic Year 2026–2027</p>
                  </div>
                </header>
                <section className="space-y-3 text-xs leading-relaxed text-slate-700">
                  <h4 className="border-b pb-1 font-mono text-xs font-bold uppercase tracking-wider text-slate-900">I. Course Overview &amp; Learning Objectives</h4>
                  <p>Official syllabus for {unit.title}. Comprises study guides, core competency rubrics, and laboratory checkpoints.</p>
                </section>
                <section className="space-y-2 text-xs leading-relaxed text-slate-700">
                  <h4 className="border-b pb-1 font-mono text-xs font-bold uppercase tracking-wider text-slate-900">II. Core Sub-Modules &amp; Deliverables</h4>
                  <ul className="list-disc space-y-1.5 pl-5 text-slate-600">
                    {unit.topics.map((topic) => <li key={topic}>{topic}</li>)}
                  </ul>
                </section>
                <section className="space-y-2 text-xs leading-relaxed text-slate-700">
                  <h4 className="border-b pb-1 font-mono text-xs font-bold uppercase tracking-wider text-slate-900">III. Recommended Bibliography &amp; Primary Texts</h4>
                  <p className="text-[11px] italic text-slate-600">{unit.bibliography || 'SS +2 HS Ghaghra Curricular Archive.'}</p>
                </section>
                <footer className="mt-6 flex items-center justify-between border-t border-slate-200 pt-8 text-[10px] text-slate-400">
                  <span className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 font-serif text-[10px] font-bold text-slate-600">SS</span>Class {grade} • Office of the Principal</span>
                  <span className="font-mono">Syllabus summary</span>
                </footer>
              </article>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-2.5 text-xs text-slate-500">
            <span>{unit.fileBlob ? 'Previewing uploaded PDF document' : 'Previewing syllabus summary • Download creates a PDF summary'}</span>
            <button type="button" onClick={onClose} className="rounded border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100">Close Preview</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AcademicResourceDirectory() {
  const [curricula, setCurricula] = useState(defaultCohorts);
  const [activeGrade, setActiveGrade] = useState('12');
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeDocument, setActiveDocument] = useState(null);
  const [toast, setToast] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const toastTimer = useRef(null);

  const currentCohort = curricula[activeGrade];
  const visibleUnits = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return currentCohort.units.filter((unit) => {
      const matchesFilter = activeFilter === 'all' || unit.discipline === activeFilter;
      const matchesSearch =
        !query ||
        [unit.title, unit.code, unit.badge, unit.number, ...unit.topics]
          .join(' ')
          .toLocaleLowerCase()
          .includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, currentCohort, search]);

  function notify(title, message, type = 'success') {
    setToast({ title, message, type });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3800);
  }

  useEffect(() => {
    let cancelled = false;
    readSavedCurricula()
      .then((saved) => {
        if (!cancelled) setCurricula(saved);
      })
      .catch((error) => {
        console.error('Could not load saved academic resources:', error);
        if (!cancelled) notify('Saved resources unavailable', 'Using the built-in syllabus data for this visit.', 'error');
      })
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });
    return () => {
      cancelled = true;
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    const modalOpen = uploadOpen || Boolean(activeDocument);
    document.body.classList.toggle('overflow-hidden', modalOpen);
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setUploadOpen(false);
        setActiveDocument(null);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('overflow-hidden');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeDocument, uploadOpen]);

  async function handleUpload({ grade, title, code, discipline, topics, file }) {
    const label =
      discipline === 'stem' ? 'Uploaded STEM' : discipline === 'humanities' ? 'Uploaded Arts' : 'Uploaded Exam';
    const newUnit = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      discipline,
      number: `Unit ${String(curricula[grade].units.length + 1).padStart(2, '0')}`,
      title,
      code,
      badge: label,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      updated: 'Just Now',
      topics: topics.length ? topics : ['Uploaded syllabus overview and topic guidelines.'],
      bibliography: 'Uploaded to SS +2 HS Ghaghra Digital Vault.',
      isCustomUpload: true,
      fileBlob: file,
    };
    const updated = {
      ...curricula,
      [grade]: { ...curricula[grade], units: [...curricula[grade].units, newUnit] },
    };
    try {
      await writeSavedCurricula(updated);
      setCurricula(updated);
      setActiveGrade(grade);
      setActiveFilter('all');
      setUploadOpen(false);
      notify('Syllabus Published', `Successfully added "${title}" to Class ${grade}.`);
    } catch (error) {
      console.error('Could not save uploaded syllabus:', error);
      notify('Upload not saved', error.message || 'The browser could not save this syllabus.', 'error');
    }
  }

  async function deleteUnit(unit) {
    if (!window.confirm('Are you sure you want to delete this uploaded syllabus?')) return;
    const updated = {
      ...curricula,
      [activeGrade]: {
        ...currentCohort,
        units: currentCohort.units.filter((item) => item.id !== unit.id),
      },
    };
    try {
      await writeSavedCurricula(updated);
      setCurricula(updated);
      notify('Syllabus Removed', 'The uploaded curriculum unit has been deleted.');
    } catch (error) {
      console.error('Could not delete uploaded syllabus:', error);
      notify('Could not remove syllabus', error.message || 'The browser could not update saved resources.', 'error');
    }
  }

  function handleDownload(unit) {
    const filename = downloadUnit(unit, activeGrade);
    notify('Download Initialized', `Downloaded "${filename}" (${unit.size}).`);
  }

  return (
    <div id="top" className="min-h-screen overflow-x-hidden font-sans antialiased text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-8 sm:px-12">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-8 pt-1 text-xs text-slate-500" aria-label="Academic vault status">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-100/70 px-3 py-1 text-[11px] font-semibold tracking-wide text-blue-900">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              TERM II • ACADEMIC YEAR 2026–2027
            </span>
            <span className="font-medium text-slate-400">•</span>
            <span className="text-[11px] font-medium tracking-tight text-slate-600 sm:text-xs">Syllabus Baseline v4.8 Verified</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] tracking-tight sm:text-xs">
            <Clock3 className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium text-slate-600">Office of the Principal • Document Vault</span>
          </div>
        </div>

        <section id="directory" className="grid grid-cols-1 items-end gap-8 pb-12 lg:grid-cols-12" aria-labelledby="directory-title">
          <div className="space-y-3 lg:col-span-8">
            <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-blue-700">Curriculum Repository &amp; Digital Vault</div>
            <h1 id="directory-title" className="font-serif text-4xl font-normal leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">Academic Resource Directory</h1>
            <p className="max-w-2xl pt-1 text-sm leading-relaxed text-slate-600 sm:text-base">
              Comprehensive study guides, laboratory manuals, past assessments, and verified course handbooks for Grades IX through XII at SS +2 HS Ghaghra, Gumla. Upload and view syllabus PDFs per class section below.
            </p>
          </div>
          <div className="flex lg:col-span-4 lg:justify-end">
            <label className="relative w-full max-w-md">
              <span className="sr-only">Search syllabus resources</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="directory-search-input"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search mechanics, genetics, calculus..."
                className="w-full rounded-md border border-slate-200/90 bg-white/80 py-2.5 pl-10 pr-4 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </label>
          </div>
        </section>

        <section className="space-y-4" aria-labelledby="cohort-heading">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/50 pb-1">
            <h2 id="cohort-heading" className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-900">
              Cohort Selection (Grades 9 - 12)
            </h2>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 sm:text-[11px]">Select Standard to Access &amp; Upload Courseware</span>
          </div>
          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-4">
            {grades.map((grade) => {
              const selected = activeGrade === grade;
              const details = curricula[grade];
              const subtext = {
                9: 'Foundational Sciences & Humanities',
                10: 'Board Prep & Core Disciplines',
                11: 'Advanced Inquiries & Pre-Collegiate',
                12: 'Senior Curricula & Board Exams',
              }[grade];
              const tagline = { 9: 'Term I & II', 10: 'Comprehensive', 11: 'Full Syllabus', 12: 'Graduation Vault' }[grade];
              return (
                <button
                  key={grade}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveGrade(grade)}
                  className={`group flex cursor-pointer flex-col justify-between rounded-lg p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    selected
                      ? 'border-2 border-blue-600 bg-white/95 shadow-md ring-2 ring-blue-600/10'
                      : 'border border-slate-200/90 bg-white/90 shadow-sm hover:border-blue-400/80 hover:shadow-md'
                  }`}
                >
                  <span className="space-y-3">
                    <span className="flex items-center justify-between">
                      <span className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${selected ? 'border-blue-200 bg-blue-100 text-blue-800' : 'border-slate-200/60 bg-slate-100 text-slate-600'}`}>
                        GRADE {({ 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII' })[grade]}
                      </span>
                      <ArrowRight className={`h-4 w-4 transition group-hover:translate-x-0.5 ${selected ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
                    </span>
                    <span className="block">
                      <span className={`block font-serif text-lg font-bold tracking-tight transition ${selected ? 'text-blue-950' : 'text-slate-900 group-hover:text-blue-900'}`}>{details.gradeLabel}</span>
                      <span className="mt-1 block text-xs leading-snug text-slate-500">{subtext}</span>
                    </span>
                  </span>
                  <span className="mt-4 flex items-center justify-between border-t border-slate-100 pt-6 text-[11px] font-medium">
                    <span className="text-slate-500">{details.units.length} Units • Uploads enabled</span>
                    <span className="font-semibold text-blue-600">{tagline}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section id="syllabus" className="mt-8 transition-all duration-300" aria-labelledby="syllabus-heading">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-6 md:flex-row md:items-end">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-blue-800">{currentCohort.cohortBadge}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-500">Institutional Curriculum Index</span>
              </div>
              <h2 id="syllabus-heading" className="font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{currentCohort.header}</h2>
              <p className="max-w-3xl text-xs text-slate-600 sm:text-sm">{currentCohort.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs" aria-label="Filter by discipline">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    aria-pressed={activeFilter === filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`whitespace-nowrap rounded-full px-3 py-1.5 font-medium transition ${
                      activeFilter === filter.id
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setUploadOpen(true)} className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Syllabus PDF</span>
              </button>
            </div>
          </div>

          {!isReady && (
            <p role="status" className="pt-6 text-sm text-slate-500">Loading saved syllabus resources…</p>
          )}
          {isReady && visibleUnits.length === 0 && (
            <div className="mt-6 rounded-lg border border-slate-200 bg-white/70 p-8 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-sm text-slate-500">
                {search ? `No syllabus resources match “${search}” for ${currentCohort.gradeLabel}.` : `No units found under this filter for ${currentCohort.gradeLabel}.`}
              </p>
              <div className="mt-3 flex justify-center gap-2">
                {activeFilter !== 'all' && <button type="button" onClick={() => setActiveFilter('all')} className="rounded bg-slate-100 px-3 py-1 text-xs text-slate-700">Show all units</button>}
                {search && <button type="button" onClick={() => setSearch('')} className="rounded bg-blue-600 px-3 py-1 text-xs text-white">Clear search</button>}
              </div>
            </div>
          )}
          {isReady && visibleUnits.length > 0 && (
            <div className="grid grid-cols-1 gap-5 pt-6">
              {visibleUnits.map((unit) => (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  grade={activeGrade}
                  onView={setActiveDocument}
                  onDownload={handleDownload}
                  onDelete={deleteUnit}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {uploadOpen && <UploadModal grade={activeGrade} onClose={() => setUploadOpen(false)} onSubmit={handleUpload} />}
      {activeDocument && (
        <PdfModal unit={activeDocument} grade={activeGrade} onClose={() => setActiveDocument(null)} onDownload={handleDownload} />
      )}
      <div
        role={toast?.type === 'error' ? 'alert' : 'status'}
        aria-live="polite"
        className={`fixed bottom-6 right-6 z-[60] flex max-w-sm items-center gap-3 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white shadow-xl transition-all duration-300 ${
          toast ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-20 opacity-0'
        }`}
      >
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${toast?.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-400'}`}>
          {toast?.type === 'error' ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
        </span>
        <span className="min-w-0 text-xs">
          <span className="block font-semibold text-white">{toast?.title}</span>
          <span className="block truncate text-[11px] text-slate-300">{toast?.message}</span>
        </span>
      </div>
    </div>
  );
}
