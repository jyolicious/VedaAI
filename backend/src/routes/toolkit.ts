import express from 'express';
import { groqClient } from '../services/groqClient';

const router = express.Router();

router.post('/rubric', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ message: 'Missing prompt' });

  try {
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    const completion = await groqClient.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'You are an assistant that generates grading rubrics.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1500,
    });

    const text = completion.choices?.[0]?.message?.content || '';
    res.json({ text });
  } catch (err) {
    console.error('Toolbox Groq call failed', err);
    res.status(500).json({ message: 'Generation failed', error: String(err) });
  }
});

export default router;
