const { z } = require('zod');

const ObservationSchema = z.object({
  text_chunk: z.string(),
  student_query: z.string().optional()
});

const ActionSchema = z.object({
  task: z.enum(['summarize', 'quiz_gen', 'answer_query']),
  response: z.any()
});

const RewardSchema = z.number().min(0.0).max(1.0);

module.exports = {
  ObservationSchema,
  ActionSchema,
  RewardSchema
};
