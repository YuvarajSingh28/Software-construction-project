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
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

app.get('/api/me', authenticateToken, async (req, res) => {
  const user = await db.get('SELECT id, username, email, phone_number, trainer_id, xp, level, body_type, sleep_score, stress_score, injuries, streak_count, last_workout_date FROM users WHERE id = ?', [req.user.id]);
  
  // Predictive Analytics: Estimate days to goal
  const logs = await db.all('SELECT calories_burned FROM logs WHERE user_id = ? AND logged_at > date("now", "-7 days")', [req.user.id]);
  const avgBurn = logs.length > 0 ? logs.reduce((s, l) => s + l.calories_burned, 0) / logs.length : 0;
  
  // Mock logic: If goal is loss, assume 7700 kcal per 1kg.
  const daysToGoal = avgBurn > 0 ? Math.ceil(35000 / avgBurn) : 90; // Default 90 days if no data
  
  // Mock Missions
  const missions = [
    { id: 1, title: 'Early Bird', description: 'Log a workout before 8 AM', xp: 50, completed: false },
    { id: 2, title: 'Century Burner', description: 'Burn 1000 kcal in a week', xp: 100, completed: logs.reduce((s, l) => s + l.calories_burned, 0) >= 1000 },
    { id: 3, title: 'Consistency King', description: 'Maintain a 3-day streak', xp: 200, completed: user.streak_count >= 3 }
  ];

  res.json({ ...user, daysToGoal, missions });
});

app.post('/api/users/profile', authenticateToken, async (req, res) => {
  const { body_type, sleep_score, stress_score, injuries } = req.body;
  await db.run(
    'UPDATE users SET body_type = ?, sleep_score = ?, stress_score = ?, injuries = ? WHERE id = ?',
    [body_type, sleep_score, stress_score, injuries, req.user.id]
  );
  res.json({ success: true });
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
  const { activity, duration_minutes, calories_burned, weight, reps } = req.body;
  
  // Award XP: 10 XP base + 1 XP per minute + 0.1 XP per calorie + bonus for strength (weight * reps * 0.05)
  const strengthBonus = (weight || 0) * (reps || 0) * 0.05;
  const xpGained = Math.round(10 + (duration_minutes || 0) + (calories_burned || 0) * 0.1 + strengthBonus);
  
  const result = await db.run(
    'INSERT INTO logs (user_id, activity, duration_minutes, calories_burned, weight, reps) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, activity, duration_minutes, calories_burned, weight, reps]
  );
  
  // Update user XP, Level, and Streak
  const user = await db.get('SELECT xp, level, streak_count, last_workout_date FROM users WHERE id = ?', [req.user.id]);
  let newXp = user.xp + xpGained;
  let newLevel = user.level;
  let newStreak = user.streak_count;
  
  const today = new Date().toISOString().split('T')[0];
  if (user.last_workout_date !== today) {
    // Check if yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (user.last_workout_date === yesterdayStr) {
      newStreak += 1;
    } else {
      newStreak = 1; // Start new streak
    }
  }

  // Level up logic: Level = floor(sqrt(xp / 100)) + 1
  const calculatedLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
  if (calculatedLevel > newLevel) newLevel = calculatedLevel;

  await db.run('UPDATE users SET xp = ?, level = ?, streak_count = ?, last_workout_date = ? WHERE id = ?', [newXp, newLevel, newStreak, today, req.user.id]);
  
  const newLog = await db.get('SELECT * FROM logs WHERE id = ?', [result.lastID]);
  res.json({ 
    id: newLog.id,
    user_id: newLog.user_id,
    activity: newLog.activity,
    duration_minutes: newLog.duration_minutes,
    calories_burned: newLog.calories_burned,
    logged_at: newLog.logged_at,
    xpGained: xpGained, 
    newLevel: newLevel 
  });
});

// Plans
app.get('/api/plans', authenticateToken, async (req, res) => {
  const plans = await db.all('SELECT * FROM plans WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
  res.json(plans);
});

app.post('/api/plans/generate', authenticateToken, async (req, res) => {
  const { plan_type, goal } = req.body;
  
  // Fetch user profile for adaptive logic
  const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
  const isStressed = user.stress_score > 70;
  const isTired = user.sleep_score < 40;
  const hasInjuries = user.injuries && user.injuries !== 'None' && user.injuries !== '';

  // AI-like adaptive generation logic
  let content = '';
  let adaptiveNote = '';

  if (isStressed || isTired) {
    adaptiveNote = "\n[AI Note: Adjusting for high fatigue/stress. Lower intensity suggested.]";
  }

  if (plan_type === 'workout') {
    if (hasInjuries) {
      content = `Day 1: Low-impact mobility. Focus on ${user.injuries} recovery.\nDay 2: Swimming or light walking.\nDay 3: Core stability work.`;
    } else if (isStressed || isTired) {
      content = 'Day 1: 20m Yoga.\nDay 2: 30m Zone 2 cardio (Brisk walk).\nDay 3: Full body stretching.';
    } else if (goal.includes('Loss')) {
      content = 'Day 1: 30m HIIT.\nDay 2: 45m Steady state cardio.\nDay 3: Full body circuit.';
    } else if (goal.includes('Gain') || goal.includes('Build')) {
      content = 'Day 1: Heavy Chest/Tris.\nDay 2: Heavy Back/Bis.\nDay 3: Heavy Legs.\nTarget: 8-12 reps per set.';
    } else {
      content = 'Day 1: 30m moderate cardio.\nDay 2: Full body bodyweight.\nDay 3: Active recovery.';
    }
  } else {
    // Enhanced Nutrition AI
    const { budget } = req.body;
    let macros = '';
    let groceryList = '';
    
    if (goal.includes('Loss')) {
      macros = "Macros: 40% Protein, 30% Carbs, 30% Fats";
      groceryList = "Grocery List: Chicken Breast, Spinach, Avocado, Berries, Almonds.";
      content = 'Breakfast: 3 Egg whites & 1 whole egg w/ spinach.\nLunch: Grilled chicken salad w/ balsamic.\nDinner: Baked cod w/ steamed asparagus.\nTarget: 1600 kcal.';
    } else if (goal.includes('Gain')) {
      macros = "Macros: 30% Protein, 50% Carbs, 20% Fats";
      groceryList = "Grocery List: Ground Beef, Rice, Oats, Peanut Butter, Bananas.";
      content = 'Breakfast: Oatmeal w/ scoop of whey & peanut butter.\nLunch: Beef & brown rice bowl w/ broccoli.\nDinner: Salmon & sweet potato.\nTarget: 3200 kcal.';
    } else {
      macros = "Macros: 33% Protein, 33% Carbs, 34% Fats";
      groceryList = "Grocery List: Eggs, Quinoa, Mixed Veggies, Greek Yogurt, Olive Oil.";
      content = 'Balanced diet.\n40% Carbs, 30% Protein, 30% Fats.\nFocus on whole foods.';
    }

    if (budget === 'Budget-Friendly') {
      groceryList += " (Budget tip: Buy in bulk, prefer frozen veggies)";
    }

    content = `${content}\n\n${macros}\n\n${groceryList}`;
  }
  
  const finalContent = content + adaptiveNote;
  
  const result = await db.run(
    'INSERT INTO plans (user_id, plan_type, goal, content) VALUES (?, ?, ?, ?)',
    [req.user.id, plan_type, goal, finalContent]
  );
  
  const newPlan = await db.get('SELECT * FROM plans WHERE id = ?', [result.lastID]);
  res.json(newPlan);
});

app.get('/api/leaderboard', authenticateToken, async (req, res) => {
  const users = await db.all('SELECT username, level, xp, streak_count FROM users ORDER BY xp DESC LIMIT 10');
  res.json(users);
});

async function startServer() {
  db = await getDbConnection();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();
