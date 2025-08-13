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


app.post('/user', async (req, res) => {
  const { nickname, farmname, gameState } = req.body;
  console.log("POST /user called with:", { nickname, farmname, gameState });

  // Insert user with gameState
  const { data: userData, error: userError } = await supabase
    .from('user')
    .insert([{ nickname, farmname, gameState }])
    .select();

  console.log("User insert result:", { userData, userError });

  if (userError) {
    console.error("User insert error:", userError);
    return res.status(500).json({ error: userError.message });
  }

  // Return the new user
  res.json({ user: userData[0] });
});

app.post('/save', async (req, res) => {
  const { nickname, gameState } = req.body;
  console.log("POST /save called with:", { nickname, gameState });

  // Update gameState for the user
  const { data, error } = await supabase
    .from('user')
    .update({ gameState })
    .eq('nickname', nickname)
    .select();

  console.log("Save update result:", { data, error });

  if (error) {
    console.error("Save update error:", error);
    return res.status(500).json({ error: error.message });
  }
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
