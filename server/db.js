const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function getDbConnection() {
  const db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      phone_number TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      trainer_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(trainer_id) REFERENCES trainers(id)
    );

    CREATE TABLE IF NOT EXISTS trainers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialization TEXT NOT NULL,
      bio TEXT,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plan_type TEXT NOT NULL, -- 'workout' or 'diet'
      goal TEXT NOT NULL,
      content TEXT NOT NULL, -- JSON string or plain text
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      activity TEXT NOT NULL,
      duration_minutes INTEGER,
      calories_burned INTEGER,
      logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  // Seed trainers
  const trainerCount = await db.get('SELECT COUNT(*) as count FROM trainers');
  if (trainerCount.count < 6) {
    await db.run('DELETE FROM trainers');
    await db.run(`INSERT INTO trainers (name, specialization, bio, image_url) VALUES 
      ('Arnold', 'Bodybuilding', 'Get pumped with the master of mass.', '/trainers/trainer_bodybuilding.png'),
      ('Mia', 'Yoga', 'Find your center and flexibility.', '/trainers/trainer_yoga.png'),
      ('Jax', 'CrossFit', 'High intensity functional fitness.', '/trainers/trainer_crossfit.png'),
      ('Chloe', 'Pilates', 'Core strength and body control.', '/trainers/trainer_pilates.png'),
      ('Dash', 'Running', 'Endurance, speed, and stamina.', '/trainers/trainer_running.png'),
      ('Mei', 'Martial Arts', 'Discipline, striking, and defense.', '/trainers/trainer_martial_arts.png')
    `);
  }

  return db;
}

module.exports = { getDbConnection };
