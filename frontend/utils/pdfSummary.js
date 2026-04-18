import { generateJSON } from './gemini.js';

const cleanText = (text) => text.replace(/\s+/g, ' ').trim();

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

export const generateSummaryFromTextAsync = async (rawText) => {
  const text = cleanText(rawText || '');
  if (!text) {
    return {
      overview: 'No readable text was found in this PDF.',
      keyConcepts: [],
      detailedBreakdown: 'Try another PDF that contains selectable text.'
    };
  }

  const prompt = `Analyze the following document text and provide a structured summary payload.
Text:
"""
${text.slice(0, 30000)}
"""`;

  const schema = {
    type: "OBJECT",
    properties: {
      overview: { type: "STRING", description: "A high-level 2-3 sentence overview of the entire document." },
      keyConcepts: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING", description: "Name of the key concept" },
            description: { type: "STRING", description: "Brief explanation of the concept" }
          },
          required: ["title", "description"]
        }
      },
      detailedBreakdown: { type: "STRING", description: "A more thorough paragraph breaking down the main arguments or facts presented in the text." }
    },
    required: ["overview", "keyConcepts", "detailedBreakdown"]
  };

  try {
    const summary = await generateJSON(prompt, "You are a professional research summaries assistant.", schema);
    return summary;
  } catch (error) {
    console.error("Failed to generate summary from text:", error);
    return {
      overview: 'An error occurred while generating the summary via AI.',
      keyConcepts: [],
      detailedBreakdown: 'Please check your API key configuration and try again.'
    };
  }
};
