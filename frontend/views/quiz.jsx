import React, { useMemo, useState } from 'react';

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have',
  'he', 'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that', 'the', 'their', 'this',
  'to', 'was', 'were', 'will', 'with', 'you', 'your', 'we', 'they', 'them', 'can',
  'into', 'about', 'than', 'then', 'there', 'these', 'those', 'such', 'not', 'but'
]);

const cleanText = (text) => (text || '').replace(/\s+/g, ' ').trim();

const splitSentences = (text) => {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30);
};

const getTopKeywords = (text, limit = 14) => {
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

const toTitleCase = (word) => word.charAt(0).toUpperCase() + word.slice(1);

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const generateQuizFromText = (rawText, totalQuestions = 5) => {
  const text = cleanText(rawText);
  if (!text) return [];

  const sentences = splitSentences(text).filter((s) => s.length >= 45 && s.length <= 220);
  const keywords = getTopKeywords(text, 14);
  if (keywords.length < 4 || sentences.length === 0) return [];

  const questions = [];

  for (const keyword of keywords) {
    if (questions.length >= totalQuestions) break;

    const sentence = sentences.find((s) => s.toLowerCase().includes(keyword));
    if (!sentence) continue;

    const distractors = keywords.filter((k) => k !== keyword);
    if (distractors.length < 3) continue;

    const optionTerms = shuffle([keyword, ...shuffle(distractors).slice(0, 3)]);
    const options = optionTerms.map((term) => ({
      text: toTitleCase(term),
      correct: term === keyword
    }));

    questions.push({
      question: `Based on your uploaded PDF, which term best matches this context: "${sentence}"`,
      options
    });
  }

  return questions.slice(0, totalQuestions);
};

export function QuizView({ uploadedDoc }) {
  const questions = useMemo(() => generateQuizFromText(uploadedDoc?.extractedText, 5), [uploadedDoc]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  if (!uploadedDoc) {
    return (
      <div className="quiz-container fade-in">
        <div className="quiz-header">
          <h1>Practice Quiz</h1>
        </div>
        <div className="glass-card quiz-card">
          <p>Upload a PDF first to generate quiz questions from your notes.</p>
          <div className="quiz-actions">
            <button className="btn-primary" onClick={() => window.navigate('home')}>
              <i className="ph ph-upload-simple"></i> Upload PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="quiz-container fade-in">
        <div className="quiz-header">
          <h1>Practice Quiz</h1>
        </div>
        <div className="glass-card quiz-card">
          <p>Not enough readable text was found in this PDF to generate quiz questions.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const selected = selectedAnswers[currentIndex];

  const getStatus = (optionIndex, option) => {
    if (selected === undefined) return '';
    if (option.correct) return 'correct';
    if (selected === optionIndex && !option.correct) return 'wrong';
    return '';
  };

  const handleSelect = (optionIndex) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const handlePrevious = () => {
    if (showResult) {
      setShowResult(false);
      setCurrentIndex(questions.length - 1);
      return;
    }
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (selected === undefined) return;
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    setShowResult(true);
  };

  const score = questions.reduce((sum, q, idx) => {
    const answerIndex = selectedAnswers[idx];
    if (answerIndex === undefined) return sum;
    return q.options[answerIndex]?.correct ? sum + 1 : sum;
  }, 0);

  if (showResult) {
    return (
      <div className="quiz-container fade-in">
        <div className="quiz-header">
          <h1>Practice Quiz</h1>
          <span className="progress-indicator">Completed</span>
        </div>
        <div className="glass-card quiz-card">
          <h2 className="question-text">Your score: {score} / {questions.length}</h2>
          <p>Questions were generated from your uploaded PDF: <strong>{uploadedDoc.fileName}</strong></p>
          <div className="quiz-actions">
            <button className="nav-btn" onClick={handlePrevious}>Review Answers</button>
            <button
              className="btn-primary"
              onClick={() => {
                setCurrentIndex(0);
                setSelectedAnswers({});
                setShowResult(false);
              }}
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container fade-in">
      <div className="quiz-header">
        <h1>Practice Quiz</h1>
        <span className="progress-indicator">Question {currentIndex + 1} / {questions.length}</span>
      </div>

      <div className="glass-card quiz-card">
        <h2 className="question-text">{currentQuestion.question}</h2>

        <div className="quiz-options">
          {currentQuestion.options.map((opt, i) => (
            <div
              key={`${currentIndex}-${i}`}
              className={`quiz-option ${selected === i ? 'selected' : ''} ${getStatus(i, opt)}`}
              onClick={() => handleSelect(i)}
            >
              {String.fromCharCode(65 + i)}. {opt.text}
            </div>
          ))}
        </div>

        <div className="quiz-actions">
          <button className="nav-btn" onClick={handlePrevious} disabled={currentIndex === 0}>
            Previous
          </button>
          <button className="btn-primary" onClick={handleNext} disabled={selected === undefined}>
            {currentIndex === questions.length - 1 ? 'Finish' : 'Next'} <i className="ph ph-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
