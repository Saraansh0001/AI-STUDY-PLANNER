import React, { useMemo, useState } from 'react';

import { generateText } from '../utils/gemini.js';

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

  const send = async () => {
    if (!input.trim() || isThinking) return;

    const question = input.trim();
    setMessages((prev) => [...prev, { type: 'user', text: question }]);
    setInput('');
    setIsThinking(true);

    if (!hasPdf) {
      setTimeout(() => {
        setIsThinking(false);
        setMessages((prev) => [...prev, { type: 'ai fade-in', text: isHinglish ? 'Pehle PDF upload karo, fir main usi se answer dunga.' : 'Please upload a PDF first. Then I will answer only from that file.' }]);
      }, 700);
      return;
    }

    try {
      const systemInstruction = `You are a helpful AI study assistant. 
You will be provided with the text of a document below. 
You MUST answer the user's questions STRICTLY based on the provided document text. 
Do not invent anything outside the document.
${isHinglish ? 'IMPORTANT: You must explain the answer in Hinglish (a mix of Hindi and English written in Latin script), keeping it easy to understand for an Indian student.' : ''}

Document Text:
"""
${pdfText.slice(0, 40000)}
"""`;
      
      const answer = await generateText(question, systemInstruction);
      setIsThinking(false);
      setMessages((prev) => [...prev, { type: 'ai fade-in', text: answer }]);
    } catch (error) {
      console.error(error);
      setIsThinking(false);
      setMessages((prev) => [...prev, { type: 'ai fade-in', text: 'Error connecting to the AI. Ensure your API key is correctly configured.' }]);
    }
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
