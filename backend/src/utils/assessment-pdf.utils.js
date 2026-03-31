import PDFDocument from 'pdfkit';

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

const getPdfFontPath = () => process.env.PDF_FONT_PATH || null;

export const streamAssessmentSessionPdf = async ({ res, child, sessionId, results, requestedBy }) => {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 48, bottom: 48, left: 48, right: 48 },
    bufferPages: true
  });

  const fontPath = getPdfFontPath();
  if (fontPath) {
    try {
      doc.registerFont('appFont', fontPath);
      doc.font('appFont');
    } catch {
      // fallback to default font
    }
  }

  const fileName = `assessment-${child?.id || 'child'}-${sessionId}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

  doc.pipe(res);

  doc.fontSize(18).text('Assessment Report', { align: 'left' });
  doc.moveDown(0.5);

  doc.fontSize(11).text(`Session ID: ${safeText(sessionId)}`);
  doc.text(`Generated at: ${formatDate(new Date())}`);
  doc.text(`Requested by: ${requestedBy}`);
  doc.moveDown(0.8);

  doc.fontSize(12).text('Child', { underline: true });
  doc.fontSize(11);
  doc.text(`ID: ${safeText(child?.id)}`);
  doc.text(`Name: ${safeText(child?.name)}`);
  doc.text(`Age: ${safeText(child?.age)}`);
  doc.text(`Gender: ${safeText(child?.gender)}`);
  doc.text(`Status: ${safeText(child?.status)}`);
  doc.moveDown(1);

  const grouped = new Map();
  for (const result of results) {
    const testType = resolveTestType(result);
    if (!grouped.has(testType)) grouped.set(testType, []);
    grouped.get(testType).push(result);
  }

  for (const [testType, typeResults] of grouped.entries()) {
    const headerTitle = resolveTestTitle(typeResults[0]);
    doc.addPage();
    doc.fontSize(16).text(`${headerTitle}`, { align: 'left' });
    doc.fontSize(11).text(`Test type: ${testType}`);
    doc.moveDown(0.6);

    const mainResult = typeResults[0];
    doc.text(`Total score: ${safeText(mainResult?.totalScore)} / ${safeText(mainResult?.maxScore)}`);
    doc.text(`Timestamp: ${formatDate(mainResult?.timestamp)}`);
    doc.moveDown(0.8);

    if (testType === 'HELP') {
      const helpAssessment = mainResult?.helpAssessment;
      doc.fontSize(12).text('HELP Evaluation', { underline: true });
      doc.fontSize(11).text(`Developmental age: ${safeText(helpAssessment?.developmentalAge)}`);
      doc.moveDown(0.5);
      const evaluations = helpAssessment?.evaluations || [];
      for (const ev of evaluations) {
        const line = `- ${safeText(ev?.skill?.skillNumber)}: ${safeText(ev?.skill?.description)} | Score: ${safeText(ev?.score)}${ev?.doctorNotes ? ` | Notes: ${safeText(ev?.doctorNotes)}` : ''}`;
        doc.text(line);
      }
      continue;
    }

    if (testType === 'CARS') {
      doc.fontSize(12).text('Answers', { underline: true });
      doc.moveDown(0.2);
      for (const ans of mainResult?.qCarsAnswers || []) {
        const qText = safeText(ans?.question?.questionText?.ar || ans?.question?.questionText?.en || ans?.question?.questionText);
        doc.fontSize(11).text(`- Q${safeText(ans?.question?.order)}: ${qText}`);
        doc.text(`  Chosen index: ${safeText(ans?.chosenIndex)} | Score: ${safeText(ans?.score)}`);
      }
      continue;
    }

    if (testType === 'ANALOGY') {
      doc.fontSize(12).text('Answers', { underline: true });
      doc.moveDown(0.2);
      for (const ans of mainResult?.qAnalogyAnswers || []) {
        doc.fontSize(11).text(`- Q${safeText(ans?.question?.order)} | Chosen: ${safeText(ans?.chosenIndex)} | Score: ${safeText(ans?.score)}`);
      }
      continue;
    }

    if (testType === 'VISUAL_MEMORY') {
      doc.fontSize(12).text('Answers', { underline: true });
      doc.moveDown(0.2);
      for (const ans of mainResult?.qVisualMemoryAnswers || []) {
        const qText = safeText(ans?.question?.questionText?.ar || ans?.question?.questionText?.en || ans?.question?.questionText);
        doc.fontSize(11).text(`- Q${safeText(ans?.question?.order)}: ${qText}`);
        doc.text(`  answerBool: ${safeText(ans?.answerBool)} | chosenIndex: ${safeText(ans?.chosenIndex)} | Score: ${safeText(ans?.score)}`);
      }
      continue;
    }

    if (testType === 'AUDITORY_MEMORY') {
      doc.fontSize(12).text('Answers', { underline: true });
      doc.moveDown(0.2);
      for (const ans of mainResult?.qAuditoryMemoryAnswers || []) {
        const qText = safeText(ans?.question?.questionText?.ar || ans?.question?.questionText?.en || ans?.question?.questionText);
        doc.fontSize(11).text(`- Q${safeText(ans?.question?.order)}: ${qText}`);
        doc.text(`  Score: ${safeText(ans?.score)}`);
        doc.text(`  Recalled: ${safeText(ans?.recalledItems)}`);
      }
      continue;
    }

    if (testType === 'VERBAL_NONSENSE') {
      doc.fontSize(12).text('Answers', { underline: true });
      doc.moveDown(0.2);
      for (const ans of mainResult?.qVerbalNonsenseAnswers || []) {
        const qText = safeText(ans?.question?.sentenceAr || ans?.question?.sentenceEn);
        doc.fontSize(11).text(`- Q${safeText(ans?.question?.order)}: ${qText}`);
        doc.text(`  Correct: ${safeText(ans?.isCorrect)}${ans?.doctorNote ? ` | Note: ${safeText(ans?.doctorNote)}` : ''}`);
      }
      continue;
    }

    if (testType === 'IMAGE_SEQUENCE_ORDER') {
      doc.fontSize(12).text('Answers', { underline: true });
      doc.moveDown(0.2);
      for (const ans of mainResult?.qSequenceOrderAnswers || []) {
        doc.fontSize(11).text(`- Q${safeText(ans?.question?.order)} | Score: ${safeText(ans?.score)}`);
        doc.text(`  Submitted: ${safeText(ans?.submittedOrder)}`);
      }
      continue;
    }

    // Generic / other
    doc.fontSize(12).text('Results', { underline: true });
    doc.fontSize(11).text(safeText(typeResults));
  }

  doc.end();
};

