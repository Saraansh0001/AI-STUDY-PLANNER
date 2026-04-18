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

const generateQuizFromText = (rawText, totalQuestions = 5) => {
  const text = cleanText(rawText);
  if (!text) return [];

  const sentences = splitSentences(text).filter((s) => s.length >= 45 && s.length <= 220);
  const keywords = getTopKeywords(text, 14);
  if (keywords.length < 3 || sentences.length === 0) return [];

  const questions = [];

  for (const keyword of keywords) {
    if (questions.length >= totalQuestions) break;

    const sentence = sentences.find((s) => s.toLowerCase().includes(keyword));
    if (!sentence) continue;

    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const maskedSentence = sentence.replace(regex, '_____');

    questions.push({
      question: `Please identify the missing term based on your notes:\n\n"${maskedSentence}"`,
      answer: keyword,
      originalSentence: sentence
    });
  }

  return questions.slice(0, totalQuestions);
};

export function QuizView({ uploadedDoc }) {
  const questions = useMemo(() => generateQuizFromText(uploadedDoc?.extractedText, 5), [uploadedDoc]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [currentInput, setCurrentInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showResult, setShowResult] = useState(false);

  if (!uploadedDoc) {
    return (
      <div className="quiz-container fade-in">
        <div className="quiz-header">
          <h1>Metacognitive Practice</h1>
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
          <h1>Metacognitive Practice</h1>
        </div>
        <div className="glass-card quiz-card">
          <p>Not enough readable text was found in this PDF to generate quiz questions.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const hasFeedback = !!feedbacks[currentIndex];

  const handlePrevious = () => {
    if (showResult) {
      setShowResult(false);
      setCurrentIndex(questions.length - 1);
      setCurrentInput(userAnswers[questions.length - 1] || '');
      return;
    }
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setCurrentInput(userAnswers[prevIdx] || '');
    }
  };

  const handleNext = () => {
    if (!hasFeedback) return;
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setCurrentInput(userAnswers[nextIdx] || '');
      return;
    }
    setShowResult(true);
  };

  const handleSubmit = () => {
    if (!currentInput.trim() || hasFeedback) return;

    setIsThinking(true);
    const answer = currentInput.trim().toLowerCase();
    const isRight = answer === currentQuestion.answer.toLowerCase() || currentQuestion.answer.toLowerCase().includes(answer);

    setTimeout(() => {
      setIsThinking(false);
      let feedbackText = '';
      if (isRight) {
        feedbackText = `You were right. The correct answer '${currentQuestion.answer}' is accurate because it directly completes the logical parameters defined by the sentence.`;
      } else {
        feedbackText = `You were incorrect. Your misconception was assuming '${currentInput}' logically completes this specific context. The correct answer is '${currentQuestion.answer}', because it identifies the core concept explicitly outlined in the source text.`;
      }

      setUserAnswers((prev) => ({ ...prev, [currentIndex]: currentInput }));
      setFeedbacks((prev) => ({ ...prev, [currentIndex]: { right: isRight, text: feedbackText } }));
    }, 800);
  };

  const score = questions.reduce((sum, q, idx) => {
    return feedbacks[idx]?.right ? sum + 1 : sum;
  }, 0);

  if (showResult) {
    return (
      <div className="quiz-container fade-in">
        <div className="quiz-header">
          <h1>Metacognitive Practice</h1>
          <span className="progress-indicator">Completed</span>
        </div>
        <div className="glass-card quiz-card">
          <h2 className="question-text">Your score: {score} / {questions.length}</h2>
          <p>Questions were generated from your uploaded PDF: <strong>{uploadedDoc.fileName}</strong></p>
          <div className="quiz-actions" style={{ marginTop: '2rem' }}>
            <button className="nav-btn" onClick={handlePrevious}>Review Answers</button>
            <button
              className="btn-primary"
              onClick={() => {
                setCurrentIndex(0);
                setUserAnswers({});
                setFeedbacks({});
                setCurrentInput('');
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
        <h1>Metacognitive Practice</h1>
        <span className="progress-indicator">Question {currentIndex + 1} / {questions.length}</span>
      </div>

      <div className="glass-card quiz-card">
        <h2 className="question-text" style={{ whiteSpace: 'pre-wrap' }}>{currentQuestion.question}</h2>

        <div className="quiz-input-area" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <input
            type="text"
            className="quiz-text-input"
            style={{ 
              padding: '1rem', 
              background: 'rgba(0,0,0,0.2)', 
              border: '1px solid var(--glass-border)', 
              color: 'var(--text-main)', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '1rem', 
              outline: 'none',
              fontFamily: 'inherit'
            }}
            placeholder="Type your answer here..."
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            disabled={hasFeedback || isThinking}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          {!hasFeedback && (
            <button 
              className="btn-primary" 
              onClick={handleSubmit} 
              disabled={!currentInput.trim() || isThinking} 
              style={{ alignSelf: 'flex-start' }}
            >
              {isThinking ? 'Evaluating...' : 'Submit Answer'}
            </button>
          )}
        </div>

        {hasFeedback && (
          <div className="feedback-area fade-in" style={{ 
            background: feedbacks[currentIndex].right ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
            border: `1px solid ${feedbacks[currentIndex].right ? '#10b981' : '#ef4444'}`, 
            padding: '1.25rem', 
            borderRadius: 'var(--radius-sm)', 
            marginBottom: '2rem' 
          }}>
            <p style={{ margin: 0, color: 'var(--text-main)', lineHeight: '1.6' }}>{feedbacks[currentIndex].text}</p>
          </div>
        )}

        <div className="quiz-actions" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="nav-btn" onClick={handlePrevious} disabled={currentIndex === 0}>
            Previous
          </button>
          
          <button className="btn-primary" onClick={handleNext} disabled={!hasFeedback}>
            {currentIndex === questions.length - 1 ? 'Finish' : 'Next'} <i className="ph ph-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
