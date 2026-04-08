const Grader = require('./grader');

const MAX_STEPS_PER_TASK = 3;

const TASKS = [
  {
    id: 'summarize',
    observation: {
      text_chunk: "Reinforcement learning (RL) is an area of machine learning concerned with how intelligent agents ought to take actions in an environment in order to maximize the notion of cumulative reward. RL is one of three basic machine learning paradigms, alongside supervised learning and unsupervised learning.",
      student_query: null
    },
    expectedContext: "Reinforcement learning machine learning intelligent agents actions maximize reward"
  },
  {
    id: 'quiz_gen',
    observation: {
      text_chunk: "The OpenEnv specification standardizes how RL agents interact with environments in Node.js, Python, or standard REST APIs. It requires standard endpoints like /step, /reset, and /state. Observations and actions are typically exchanged in structured JSON format.",
      student_query: "Generate a 3-question quiz to test a student's knowledge on OpenEnv."
    },
    expectedContext: ""
  },
  {
    id: 'answer_query',
    observation: {
      text_chunk: "PDF Page 4: Artificial neural networks, usually simply called neural networks or neural nets, are computing systems inspired by the biological neural networks that constitute animal brains. An ANN is based on a collection of connected units or nodes called artificial neurons.",
      student_query: "What exactly is an artificial neural network based on, according to the PDF?"
    },
    expectedContext: "computing systems inspired by biological neural networks collection of connected units artificial neurons"
  }
];

class EnvLogic {
  constructor() {
    this.reset();
  }

  reset() {
    this.currentTaskIndex = 0;
    this.stepCount = 0;
    this.done = false;
    return this.state();
  }

  state() {
    if (this.done || this.currentTaskIndex >= TASKS.length) {
      return {
        observation: { text_chunk: "", student_query: "" },
        reward: 0,
        done: true,
        info: { message: "Environment finished." }
      };
    }
    const currentTask = TASKS[this.currentTaskIndex];
    return {
      observation: currentTask.observation,
      reward: 0,
      done: false,
      info: { task_id: currentTask.id, step_count: this.stepCount }
    };
  }

  step(action) {
    if (this.done || this.currentTaskIndex >= TASKS.length) {
      return this.state();
    }

    const currentTask = TASKS[this.currentTaskIndex];
    
    // Evaluate action via grader
    let score = 0;
    if (action.task === currentTask.id) {
      score = Grader.evaluate(action.task, action.response, currentTask.expectedContext);
    }

    this.stepCount++;

    let done = false;
    
    // Penalize infinite loops
    if (this.stepCount >= MAX_STEPS_PER_TASK && score < 0.6) {
      score -= 0.2; // penalty
      this.currentTaskIndex++; // Force move on
      this.stepCount = 0;
    } else if (score >= 0.6) {
      // Pass threshold
      this.currentTaskIndex++;
      this.stepCount = 0;
    }

    if (this.currentTaskIndex >= TASKS.length) {
      done = true;
      this.done = true;
    }

    return {
      observation: done ? { text_chunk: "", student_query: "" } : TASKS[this.currentTaskIndex].observation,
      reward: score,
      done: done,
      info: { grader_score: score, task_id: currentTask.id }
    };
  }
}

module.exports = EnvLogic;
