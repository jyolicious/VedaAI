import Groq from 'groq-sdk';

export const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: process.env.GROQ_BASE_URL,
});

export default groqClient;
