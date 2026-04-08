class Grader {
  // Evaluates task response and returns a score between 0.0 and 1.0
  static evaluate(task, response, expectedContext) {
    // Penalize hallucinations or refuses
    if (typeof response === 'string' && response.toLowerCase().includes("i don't know")) {
      return 0.1;
    }
    // Penalize infinite loops or empty
    if (!response || response === '') {
      return 0.0;
    }

    switch (task) {
      case 'summarize':
        return this.gradeSummarize(response, expectedContext);
      case 'quiz_gen':
        return this.gradeQuizGen(response);
      case 'answer_query':
        return this.gradeAnswerQuery(response, expectedContext);
      default:
        return 0.0;
    }
  }

  static gradeSummarize(response, expectedContext) {
    if (typeof response !== 'string') return 0.0;
    let score = 0.5; // Base score for providing a text response
    
    // Heuristic: valid summary should be shorter than full text but not empty
    if (response.length > 10 && response.length < (expectedContext.length || 1000) * 0.8) {
      score += 0.5;
    } else if (response.length >= expectedContext.length) {
      score += 0.2; // Too long
    }
    
    return Math.min(1.0, score);
  }

  static gradeQuizGen(response) {
    try {
      let parsed = typeof response === 'string' ? JSON.parse(response) : response;
      if (!Array.isArray(parsed)) {
        if (parsed.questions && Array.isArray(parsed.questions)) {
          parsed = parsed.questions;
        } else {
          return 0.2; // Needs to be an array of questions
        }
      }
      
      let score = 0.4; // Base score for valid JSON / array structure
      if (parsed.length === 3) {
        score += 0.6; // Perfect 3 questions
      } else if (parsed.length > 0) {
        score += 0.3; // Partial credit
      }
      
      return Math.min(1.0, score);
    } catch (e) {
      return 0.0; // Not valid JSON
    }
  }

  static gradeAnswerQuery(response, expectedContext) {
    if (typeof response !== 'string') return 0.0;
    let score = 0.5; // Base score for answering
    
    // Simple verification check: overlaps with expectedContext key words
    const terms = expectedContext.split(/\s+/).filter(t => t.length > 5);
    let matchCount = 0;
    for (const term of terms) {
      if (response.toLowerCase().includes(term.toLowerCase())) {
        matchCount++;
      }
    }
    
    if (terms.length > 0 && matchCount > 0) {
      score += Math.min(0.5, (matchCount / 3) * 0.5); // Max out after 3 term overlaps
    }
    
    return Math.min(1.0, score);
  }
}

module.exports = Grader;
