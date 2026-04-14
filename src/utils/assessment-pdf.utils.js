import pdfmakeRtl from 'pdfmake-rtl';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// pdfmake-rtl (server-side) needs fonts registered to render both Arabic (Cairo) and English (Roboto)
// Cairo is used for RTL scripts, Roboto for Latin text.
try {
  const Roboto = require('pdfmake-rtl/fonts/Roboto');
  pdfmakeRtl.addFonts(Roboto);
} catch {}

try {
  const Cairo = require('pdfmake-rtl/fonts/Cairo');
  pdfmakeRtl.addFonts(Cairo);
} catch {}

const safeText = (value) => {
  if (value === null || value === undefined) return '';
  return typeof value === 'string' ? value : JSON.stringify(value);
};

const formatDate = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

const resolveTestTitle = (result) => result?.test?.titleAr || result?.test?.title || result?.question?.test?.titleAr || result?.question?.test?.title || 'Assessment';

const resolveTestType = (result) => result?.test?.testType || result?.question?.test?.testType || 'UNKNOWN';

const toDocTextLine = (text, { bold = false } = {}) => ({
  text,
  bold,
  fontSize: 11,
  margin: [0, 2, 0, 0],
});

export const streamAssessmentSessionPdf = async ({ res, child, sessionId, results, requestedBy }) => {
  const fileName = `assessment-${child?.id || 'child'}-${sessionId}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

  const grouped = new Map();
  for (const result of results) {
    const testType = resolveTestType(result);
    if (!grouped.has(testType)) grouped.set(testType, []);
    grouped.get(testType).push(result);
  }

  const content = [
    { text: 'Assessment Report', fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
    toDocTextLine(`Session ID: ${safeText(sessionId)}`),
    toDocTextLine(`Generated at: ${formatDate(new Date())}`),
    toDocTextLine(`Requested by: ${safeText(requestedBy)}`),
    { text: ' ', margin: [0, 6, 0, 0] },
    { text: 'Child', fontSize: 12, bold: true, decoration: 'underline', margin: [0, 6, 0, 4] },
    toDocTextLine(`ID: ${safeText(child?.id)}`),
    toDocTextLine(`Name: ${safeText(child?.name)}`),
    toDocTextLine(`Age: ${safeText(child?.age)}`),
    toDocTextLine(`Gender: ${safeText(child?.gender)}`),
    toDocTextLine(`Status: ${safeText(child?.status)}`),
  ];

  for (const [testType, typeResults] of grouped.entries()) {
    const headerTitle = resolveTestTitle(typeResults[0]);
    const mainResult = typeResults[0];

    content.push(
      { text: headerTitle, fontSize: 16, bold: true, margin: [0, 14, 0, 4] },
      toDocTextLine(`Test type: ${safeText(testType)}`),
      toDocTextLine(`Total score: ${safeText(mainResult?.totalScore)} / ${safeText(mainResult?.maxScore)}`),
      toDocTextLine(`Timestamp: ${formatDate(mainResult?.timestamp)}`),
      { text: ' ', margin: [0, 6, 0, 0] },
    );

    if (testType === 'HELP') {
      const helpAssessment = mainResult?.helpAssessment;
      content.push(
        { text: 'HELP Evaluation', fontSize: 12, bold: true, decoration: 'underline', margin: [0, 6, 0, 4] },
        toDocTextLine(`Developmental age: ${safeText(helpAssessment?.developmentalAge)}`),
      );
      const evaluations = helpAssessment?.evaluations || [];
      for (const ev of evaluations) {
        const line = `- ${safeText(ev?.skill?.skillNumber)}: ${safeText(ev?.skill?.description)} | Score: ${safeText(ev?.score)}${ev?.doctorNotes ? ` | Notes: ${safeText(ev?.doctorNotes)}` : ''}`;
        content.push(toDocTextLine(line));
      }
      continue;
    }

    const pushAnswersHeader = () =>
      content.push({ text: 'Answers', fontSize: 12, bold: true, decoration: 'underline', margin: [0, 6, 0, 4] });

    if (testType === 'CARS') {
      pushAnswersHeader();
      for (const ans of mainResult?.qCarsAnswers || []) {
        const qText = safeText(ans?.question?.questionText?.ar || ans?.question?.questionText?.en || ans?.question?.questionText);
        content.push(
          toDocTextLine(`- Q${safeText(ans?.question?.order)}: ${qText}`),
          toDocTextLine(`  Chosen index: ${safeText(ans?.chosenIndex)} | Score: ${safeText(ans?.score)}`),
        );
      }
      continue;
    }

    if (testType === 'ANALOGY') {
      pushAnswersHeader();
      for (const ans of mainResult?.qAnalogyAnswers || []) {
        content.push(toDocTextLine(`- Q${safeText(ans?.question?.order)} | Chosen: ${safeText(ans?.chosenIndex)} | Score: ${safeText(ans?.score)}`));
      }
      continue;
    }

    if (testType === 'VISUAL_MEMORY') {
      pushAnswersHeader();
      for (const ans of mainResult?.qVisualMemoryAnswers || []) {
        const qText = safeText(ans?.question?.questionText?.ar || ans?.question?.questionText?.en || ans?.question?.questionText);
        content.push(
          toDocTextLine(`- Q${safeText(ans?.question?.order)}: ${qText}`),
          toDocTextLine(`  answerBool: ${safeText(ans?.answerBool)} | chosenIndex: ${safeText(ans?.chosenIndex)} | Score: ${safeText(ans?.score)}`),
        );
      }
      continue;
    }

    if (testType === 'AUDITORY_MEMORY') {
      pushAnswersHeader();
      for (const ans of mainResult?.qAuditoryMemoryAnswers || []) {
        const qText = safeText(ans?.question?.questionText?.ar || ans?.question?.questionText?.en || ans?.question?.questionText);
        content.push(
          toDocTextLine(`- Q${safeText(ans?.question?.order)}: ${qText}`),
          toDocTextLine(`  Score: ${safeText(ans?.score)}`),
          toDocTextLine(`  Recalled: ${safeText(ans?.recalledItems)}`),
        );
      }
      continue;
    }

    if (testType === 'VERBAL_NONSENSE') {
      pushAnswersHeader();
      for (const ans of mainResult?.qVerbalNonsenseAnswers || []) {
        const qText = safeText(ans?.question?.sentenceAr || ans?.question?.sentenceEn);
        content.push(
          toDocTextLine(`- Q${safeText(ans?.question?.order)}: ${qText}`),
          toDocTextLine(`  Correct: ${safeText(ans?.isCorrect)}${ans?.doctorNote ? ` | Note: ${safeText(ans?.doctorNote)}` : ''}`),
        );
      }
      continue;
    }

    if (testType === 'IMAGE_SEQUENCE_ORDER') {
      pushAnswersHeader();
      for (const ans of mainResult?.qSequenceOrderAnswers || []) {
        content.push(
          toDocTextLine(`- Q${safeText(ans?.question?.order)} | Score: ${safeText(ans?.score)}`),
          toDocTextLine(`  Submitted: ${safeText(ans?.submittedOrder)}`),
        );
      }
      continue;
    }

    content.push(toDocTextLine(safeText(typeResults)));
  }

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [48, 48, 48, 48],
    rtl: true,
    defaultStyle: {
      font: 'Cairo',
    },
    content,
  };

  // pdfmake-rtl returns a pdfmake document with getStream/getBuffer support (pdfmake compatible)
  const pdfDoc = pdfmakeRtl.createPdf(docDefinition);
  const buffer = await new Promise((resolve, reject) => {
    try {
      const maybe = pdfDoc.getBuffer((buf) => resolve(buf));
      if (maybe && typeof maybe.then === 'function') {
        maybe.then(resolve).catch(reject);
      }
    } catch (err) {
      reject(err);
    }
  });

  res.end(Buffer.from(buffer));
};

