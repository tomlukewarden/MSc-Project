import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all users
app.get('/user', async (req, res) => {
  const { data, error } = await supabase.from('user').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Add user
app.post('/user', async (req, res) => {
  const { nickname } = req.body;
  const { data, error } = await supabase
    .from('user')
    .insert([{ nickname: nickname }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/save', async (req, res) => {
  const { nickname, gameState } = req.body;
  const { data, error } = await supabase
    .from('user')
    .insert([{ nickname, gameState }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/load', async (req, res) => {
  const { nickname } = req.query;
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .eq('nickname', nickname)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});
