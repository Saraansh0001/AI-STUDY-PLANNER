const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have',
  'he', 'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that', 'the', 'their', 'this',
  'to', 'was', 'were', 'will', 'with', 'you', 'your', 'we', 'they', 'them', 'can',
  'into', 'about', 'than', 'then', 'there', 'these', 'those', 'such', 'not', 'but'
]);

const cleanText = (text) => text.replace(/\s+/g, ' ').trim();

const splitSentences = (text) => {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30);
};

const getTopKeywords = (text, limit = 6) => {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

  const counts = new Map();
  for (const word of words) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
};

export const extractTextFromPdf = async (file) => {
  const [{ getDocument, GlobalWorkerOptions }, workerUrlModule] = await Promise.all([
    import('pdfjs-dist/legacy/build/pdf.mjs'),
    import('pdfjs-dist/legacy/build/pdf.worker.mjs?url')
  ]);

  GlobalWorkerOptions.workerSrc = workerUrlModule.default;

  const bytes = new Uint8Array(await file.arrayBuffer());
  const loadingTask = getDocument({ data: bytes });
  const pdf = await loadingTask.promise;

  let text = '';
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => (typeof item.str === 'string' ? item.str : ''))
      .join(' ');
    text += ` ${pageText}`;
  }

  return cleanText(text);
};

export const generateSummaryFromText = (rawText) => {
  const text = cleanText(rawText || '');
  if (!text) {
    return {
      overview: 'No readable text was found in this PDF.',
      keyConcepts: [],
      detailedBreakdown: 'Try another PDF that contains selectable text.'
    };
  }

  const sentences = splitSentences(text);
  const keywords = getTopKeywords(text);

  const overview = (sentences[0] || text.slice(0, 240)).slice(0, 260);
  const detailedBreakdown = sentences.slice(1, 4).join(' ') || sentences[0] || text.slice(0, 500);

  const keyConcepts = keywords.map((word) => {
    const sentenceWithWord = sentences.find((s) => s.toLowerCase().includes(word));
    return {
      title: word.charAt(0).toUpperCase() + word.slice(1),
      description: sentenceWithWord || `This topic appears repeatedly in your uploaded PDF.`
    };
  });

  return {
    overview,
    keyConcepts,
    detailedBreakdown
  };
};
