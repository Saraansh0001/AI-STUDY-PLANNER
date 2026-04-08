require('dotenv').config();
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy"
});

async function run() {
  const serverUrl = 'http://127.0.0.1:3000';
  
  console.log("Resetting environment...");
  let res = await fetch(`${serverUrl}/reset`, { method: 'POST' });
  let state = await res.json();
  console.log("Initial state:", JSON.stringify(state, null, 2));

  while (!state.done) {
    const { observation, info } = state;
    
    let promptText = `Context: ${observation.text_chunk}\n`;
    if (observation.student_query) {
      promptText += `Query: ${observation.student_query}\n`;
    }
    
    let taskName = info.task_id;
    if (taskName === 'summarize') promptText += "\nTask: Summarize the context.";
    else if (taskName === 'quiz_gen') promptText += "\nTask: Create a 3-question quiz (array format) based on the context.";
    else if (taskName === 'answer_query') promptText += "\nTask: Answer the query based on the context.";
    
    console.log(`\nCalling OpenAI for task: ${taskName}...`);
    let aiResponse;
    if (process.env.OPENAI_API_KEY) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: promptText }]
      });
      aiResponse = completion.choices[0].message.content;
    } else {
      console.log("No OPENAI_API_KEY, using mock response.");
      if (taskName === 'summarize') aiResponse = "Reinforcement learning is about machine learning where agents take actions to maximize reward.";
      if (taskName === 'quiz_gen') aiResponse = JSON.stringify(["What is OpenEnv?", "Which languages are supported?", "What are the standard endpoints?"]);
      if (taskName === 'answer_query') aiResponse = "An artificial neural network is based on a collection of connected units called artificial neurons.";
    }

    console.log(`Agent response: ${aiResponse}`);

    res = await fetch(`${serverUrl}/step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: taskName,
        response: aiResponse
      })
    });
    
    state = await res.json();
    console.log("Result:", JSON.stringify(state, null, 2));
  }
  
  console.log("\nEpisode finished!");
}

run().catch(console.error);
