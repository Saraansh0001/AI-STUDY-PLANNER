import React, { useMemo, useState } from 'react';

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have',
  'he', 'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that', 'the', 'their', 'this',
  'to', 'was', 'were', 'will', 'with', 'you', 'your', 'we', 'they', 'them', 'can',
  'into', 'about', 'than', 'then', 'there', 'these', 'those', 'such', 'not', 'but',
  'what', 'which', 'when', 'where', 'who', 'why', 'how', 'explain', 'tell'
]);

const normalize = (text) =>
  (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (text) =>
  normalize(text)
    .split(' ')
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

const splitSentences = (text) =>
  (text || '')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25);

const buildAnswerFromPdf = (question, pdfText, isHinglish) => {
  const questionTokens = tokenize(question);
  const sentences = splitSentences(pdfText).slice(0, 500);

  if (!sentences.length) {
    return isHinglish
      ? 'PDF mein readable text nahi mila. Please text-based PDF upload karo.'
      : 'No readable text was found in this PDF. Please upload a text-based PDF.';
  }

  if (!questionTokens.length) {
    return isHinglish
      ? 'Thoda specific question pucho, main uploaded PDF se answer dunga.'
      : 'Please ask a more specific question, and I will answer from your uploaded PDF.';
  }

  const scored = sentences
    .map((sentence) => {
      const sentenceTokens = new Set(tokenize(sentence));
      let score = 0;
      for (const token of questionTokens) {
        if (sentenceTokens.has(token)) score += 1;
      }
      return { sentence, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) {
    return isHinglish
      ? 'Mujhe uploaded PDF mein is question ka direct match nahi mila. Thoda different wording mein pucho.'
      : "I couldn't find a direct match for that in the uploaded PDF. Try rephrasing your question.";
  }

  const best = scored.slice(0, 3).map((s) => s.sentence);
  if (isHinglish) {
    return `Uploaded PDF ke basis par:\n${best.join(' ')}`;
  }
  return `Based on your uploaded PDF:\n${best.join(' ')}`;
};

export function ChatView({ uploadedDoc }) {
  const hasPdf = Boolean(uploadedDoc?.extractedText);
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      text: hasPdf
        ? `I have loaded your PDF "${uploadedDoc.fileName}". Ask me anything from it.`
        : 'Upload a PDF first, then ask questions. I will answer only from that file.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isHinglish, setIsHinglish] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const pdfText = useMemo(() => uploadedDoc?.extractedText || '', [uploadedDoc]);

  const send = () => {
    if (!input.trim()) return;

    const question = input.trim();
    setMessages((prev) => [...prev, { type: 'user', text: question }]);
    setInput('');
    setIsThinking(true);

    setTimeout(() => {
      const answer = hasPdf
        ? buildAnswerFromPdf(question, pdfText, isHinglish)
        : isHinglish
          ? 'Pehle PDF upload karo, fir main usi se answer dunga.'
          : 'Please upload a PDF first. Then I will answer only from that file.';

      setIsThinking(false);
      setMessages((prev) => [...prev, { type: 'ai fade-in', text: answer }]);
    }, 700);
  };

  return (
    <div className="chat-container fade-in">
      <div className="chat-header">
        <h2>Ask Questions</h2>
        <div className="toggle-container">
          <label className="switch">
            <input
              type="checkbox"
              id="hinglish-toggle"
              checked={isHinglish}
              onChange={(e) => setIsHinglish(e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
          <span className="toggle-label">Explain in Hinglish</span>
        </div>
      </div>

      <div className="glass-card chat-box">
        <div className="chat-messages" id="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.type}`}>
              {msg.text}
            </div>
          ))}
          {isThinking && (
            <div className="chat-msg ai thinking fade-in">
              <span>.</span><span>.</span><span>.</span>
            </div>
          )}
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            id="chat-input"
            placeholder={hasPdf ? 'Ask a question from your uploaded PDF...' : 'Upload PDF first...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && send()}
          />
          <button className="btn-primary" id="chat-send-btn" onClick={send}>
            <i className="ph-fill ph-paper-plane-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
