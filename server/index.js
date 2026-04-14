const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDbConnection } = require('./db.js');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'super_secret_fitness_key_for_demo';

app.use(cors());
app.use(express.json());

let db;

app.post('/api/auth/register', async (req, res) => {
  const { username, email, phone_number, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
  
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (username, email, phone_number, password_hash) VALUES (?, ?, ?, ?)',
      [username, email || null, phone_number || null, hash]
    );
    res.json({ id: result.lastID, username });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register', details: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, trainer_id: user.trainer_id } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Middleware for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get('/api/me', authenticateToken, async (req, res) => {
  const user = await db.get('SELECT id, username, email, phone_number, trainer_id FROM users WHERE id = ?', [req.user.id]);
  res.json(user);
});

// Trainers
app.get('/api/trainers', authenticateToken, async (req, res) => {
  const trainers = await db.all('SELECT * FROM trainers');
  res.json(trainers);
});

app.post('/api/users/trainer', authenticateToken, async (req, res) => {
  const { trainer_id } = req.body;
  await db.run('UPDATE users SET trainer_id = ? WHERE id = ?', [trainer_id, req.user.id]);
  res.json({ success: true, trainer_id });
});

// Logs
app.get('/api/logs', authenticateToken, async (req, res) => {
  const logs = await db.all('SELECT * FROM logs WHERE user_id = ? ORDER BY logged_at DESC', [req.user.id]);
  res.json(logs);
});

app.post('/api/logs', authenticateToken, async (req, res) => {
  const { activity, duration_minutes, calories_burned } = req.body;
  const result = await db.run(
    'INSERT INTO logs (user_id, activity, duration_minutes, calories_burned) VALUES (?, ?, ?, ?)',
    [req.user.id, activity, duration_minutes, calories_burned]
  );
  const newLog = await db.get('SELECT * FROM logs WHERE id = ?', [result.lastID]);
  res.json(newLog);
});

// Plans
app.get('/api/plans', authenticateToken, async (req, res) => {
  const plans = await db.all('SELECT * FROM plans WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
  res.json(plans);
});

app.post('/api/plans/generate', authenticateToken, async (req, res) => {
  const { plan_type, goal } = req.body;
  
  // Rule-based generation mock
  let content = '';
  if (plan_type === 'workout') {
    if (goal.includes('Loss')) content = 'Day 1: 30m HIIT.\nDay 2: 45m Steady state cardio.\nDay 3: Full body circuit.';
    else if (goal.includes('Gain') || goal.includes('Build')) content = 'Day 1: Chest/Tris.\nDay 2: Back/Bis.\nDay 3: Legs.\nFocus on progressive overload.';
    else content = 'Day 1: 30m brisk walk.\nDay 2: Yoga session.\nDay 3: Full body stretching.';
  } else {
    if (goal.includes('Loss')) content = 'Breakfast: Oatmeal.\nLunch: Salad w/ chicken.\nDinner: Fish & veggies.\nTarget: 1800 kcal.';
    else if (goal.includes('Gain') || goal.includes('Build')) content = 'Breakfast: 4 eggs & toast.\nLunch: Chicken & rice.\nDinner: Steak & potatoes.\nTarget: 3000 kcal.';
    else content = 'Balanced diet.\nStick to whole foods, avoid processed sugars.';
  }
  
  const result = await db.run(
    'INSERT INTO plans (user_id, plan_type, goal, content) VALUES (?, ?, ?, ?)',
    [req.user.id, plan_type, goal, content]
  );
  
  const newPlan = await db.get('SELECT * FROM plans WHERE id = ?', [result.lastID]);
  res.json(newPlan);
});

async function startServer() {
  db = await getDbConnection();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();
