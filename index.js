import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

// ✅ API Route
app.post('/api/generate-wish', async (req, res) => {
  try {
    const { target, tone } = req.body;

    const tonePrompts = {
      'philosophical': {
        system: `You are a philosophical writer. Write ONE short inspiring quote from Socrates, Rumi, Kabir, or Chanakya with 2-3 lines of New Year wish. Total under 60 words.`,
        user: `Write a philosophical New Year 2026 wish for my ${target} with one wise quote.`
      },
      'emotional': {
        system: 'Write short, heartfelt wishes in 3-4 lines max. Use emojis. Under 50 words.',
        user: `Write an emotional New Year 2026 wish for my ${target}.`
      },
      'funny': {
        system: 'Write 2-3 funny lines with jokes in Hinglish. Super casual. Under 40 words.',
        user: `Write a funny New Year 2026 wish for my ${target}.`
      },
      'romantic': {
        system: `Write ONE 2-line shayari + 1 short romantic line. Total under 50 words. Beautiful Urdu words.`,
        user: `Write romantic shayari for my ${target} for New Year 2026.`
      },
      'formal': {
        system: 'Write 2-3 formal professional lines. Under 40 words.',
        user: `Write a formal New Year 2026 wish for my ${target}.`
      },
      'hinglish': {
        system: 'Write 2-3 casual Hinglish lines with emojis. Under 40 words.',
        user: `Write Hinglish New Year 2026 wish for my ${target}.`
      },
      'hindi': {
        system: `Write ONLY in pure Hindi (Devanagari). Short 3-4 lines. Under 50 words. Traditional style.`,
        user: `${target} के लिए छोटी हिंदी में नववर्ष 2026 की शुभकामना लिखो।`
      },
      'short': {
        system: 'Write ONLY 1-2 lines. Maximum 25 words. Super short and impactful.',
        user: `Write very short New Year 2026 wish for my ${target}.`
      }
    };

    const prompt = tonePrompts[tone] || tonePrompts['emotional'];

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user }
        ],
        temperature: 0.85,
        max_tokens: 150
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('DeepSeek Error:', data);
      return res.status(response.status).json(data);
    }

    res.json(data);

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Serve React build files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}
console.log("Happy New Year 2026");

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
