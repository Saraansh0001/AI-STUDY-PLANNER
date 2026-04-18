import React, { useState, useEffect } from 'react';
import { generateJSON } from '../utils/gemini.js';

export function QuizView({ uploadedDoc }) {
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [currentInput, setCurrentInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!uploadedDoc?.extractedText) return;

    const fetchQuiz = async () => {
      setIsLoadingQuiz(true);
      setLoadError('');

      const prompt = `Based on the following document text, generate exactly 5 fill-in-the-blank style questions.
Each question should present a sentence or concept from the text with a key term replaced by "_____".
Please prefix the question with a short instructional prompt like "Identify the missing term:"

Document Text:
"""
${uploadedDoc.extractedText.slice(0, 30000)}
"""`;

      const schema = {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            question: { type: "STRING", description: "The fill in the blank question." },
            answer: { type: "STRING", description: "The exact missing key term." },
            originalSentence: { type: "STRING", description: "The original sentence for context." }
          },
          required: ["question", "answer", "originalSentence"]
        }
      };

      try {
        const generatedQs = await generateJSON(prompt, "You are an expert exam generator.", schema);
        setQuestions(generatedQs.slice(0, 5));
      } catch (err) {
        console.error("Quiz Gen Error:", err);
        setLoadError('Failed to generate quiz from your PDF using AI. Please check your API key.');
      } finally {
        setIsLoadingQuiz(false);
      }
    };

    fetchQuiz();
  }, [uploadedDoc]);

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

  if (isLoadingQuiz) {
    return (
      <div className="quiz-container fade-in">
        <div className="quiz-header">
          <h1>Metacognitive Practice</h1>
        </div>
        <div className="glass-card quiz-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem' }}>
          <div className="spinner" style={{ marginBottom: '2rem' }}></div>
          <p>AI is analyzing your notes to generate metacognitive questions...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="quiz-container fade-in">
        <div className="quiz-header">
          <h1>Metacognitive Practice</h1>
        </div>
        <div className="glass-card quiz-card">
          <p style={{ color: '#fca5a5' }}>{loadError}</p>
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

  const handleSubmit = async () => {
    if (!currentInput.trim() || hasFeedback || isThinking) return;

    setIsThinking(true);
    const answer = currentInput.trim();

    const prompt = `Question Context: "${currentQuestion.originalSentence}"
Missing Term (Correct Answer): "${currentQuestion.answer}"
Student's Answer: "${answer}"

Evaluate the student's answer. 
Rule 1: NEVER reveal the exact correct answer.
Rule 2: NEVER say "Great job!" or "Correct!". Focus purely on objective validation.
Rule 3: NEVER give encouraging filler.
Rule 4: ONLY output whether they were right, what their misconception was (if any), and one precise sentence about why the correct answer is correct based on the text. No padding. No praise.`;

    const schema = {
      type: "OBJECT",
      properties: {
        isRight: { type: "BOOLEAN", description: "True if the student's answer conceptually matches the missing term." },
        feedbackText: { type: "STRING", description: "The strict, unpadded metacognitive response following all rules." }
      },
      required: ["isRight", "feedbackText"]
    };

    try {
      const feedback = await generateJSON(prompt, "You are a rigid metacognitive quiz engine.", schema);
      setIsThinking(false);
      setUserAnswers((prev) => ({ ...prev, [currentIndex]: currentInput }));
      setFeedbacks((prev) => ({ ...prev, [currentIndex]: { right: feedback.isRight, text: feedback.feedbackText } }));
    } catch (error) {
      console.error(error);
      setIsThinking(false);
      alert('Error connecting to the AI for evaluation.');
    }
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
        <h2 className="question-text" style={{ whiteSpace: 'pre-wrap' }}>{currentQuestion?.question}</h2>

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
              {isThinking ? 'Evaluating with AI...' : 'Submit Answer'}
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
