import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, Dumbbell, Activity, User as UserIcon, Play, Trophy, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [plans, setPlans] = useState([]);
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    Promise.all([
      fetch('/api/logs', { headers: { 'Authorization': `Bearer ${token}` }}).then(r => r.json()),
      fetch('/api/plans', { headers: { 'Authorization': `Bearer ${token}` }}).then(r => r.json()),
      fetch('/api/me', { headers: { 'Authorization': `Bearer ${token}` }}).then(r => r.json()),
      user.trainer_id ? fetch('/api/trainers', { headers: { 'Authorization': `Bearer ${token}` }}).then(r => r.json()) : Promise.resolve([])
    ]).then(([logsData, plansData, userData, trainersData]) => {
      setLogs(logsData);
      setPlans(plansData);
      // Update local user with latest XP/Level/Personalization from DB
      Object.assign(user, userData);
      if (user.trainer_id) {
        const t = trainersData.find(x => x.id === user.trainer_id);
        if (t) setTrainer(t);
      }
      setTimeout(() => setLoading(false), 600); // Shimmer duration
    });
  }, [user]);

  const totalCalories = logs.reduce((sum, log) => sum + (log.calories_burned || 0), 0);
  const dailyGoal = 2500;
  const progressPercent = Math.min((totalCalories / dailyGoal) * 100, 100);
  const strokeDashoffset = 283 - (283 * progressPercent) / 100; // 2 * PI * r = 283 for r=45

  // Prepare chart data (group by date)
  const chartDataMap = {};
  [...logs].reverse().forEach(log => {
    const d = new Date(log.logged_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
    chartDataMap[d] = (chartDataMap[d] || 0) + log.calories_burned;
  });
  const chartData = Object.keys(chartDataMap).map(date => ({ date, calories: chartDataMap[date] }));

  if (loading) {
     return (
       <div>
         <h2 className="heading">Welcome, {user.username}!</h2>
         <div className="grid">
           <div className="glass-panel" style={{ height: '250px', animation: 'pulse 1.5s infinite', background: 'rgba(255,255,255,0.05)' }}></div>
           <div className="glass-panel" style={{ height: '250px', animation: 'pulse 1.5s infinite', background: 'rgba(255,255,255,0.05)' }}></div>
           <div className="glass-panel" style={{ height: '250px', animation: 'pulse 1.5s infinite', background: 'rgba(255,255,255,0.05)' }}></div>
         </div>
       </div>
     );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="heading">Welcome, {user.username}!</h2>
          <p className="subheading" style={{ margin: 0 }}>Here's your fitness overview today.</p>
        </div>
        <div className="glass-panel" style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/tracker?session=start')}
            className="btn" 
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            <Play size={18} fill="currentColor" /> One-Tap Start
          </button>
          <div style={{ width: '1px', height: '30px', background: 'var(--glass-border)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Streak</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fb923c' }}>{user.streak_count || 0} 🔥</div>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'var(--glass-border)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Level</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#38bdf8' }}>{user.level || 1}</div>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'var(--glass-border)' }}></div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Total XP</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{user.xp || 0}</div>
            <div style={{ width: '100px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${(user.xp % 100)}%`, height: '100%', background: '#38bdf8' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="glass-panel glass-panel-hover" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 className="heading-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
            <Flame color="#ef4444" /> Progress (vs 2500 kcal Goal)
          </h3>
          <div style={{ position: 'relative', width: '150px', height: '150px', marginTop: '1.5rem' }}>
            <svg width="150" height="150" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="8"/>
              <circle cx="50" cy="50" r="45" fill="transparent" stroke="url(#gradient)" strokeWidth="8"
                strokeDasharray="283" strokeDashoffset={strokeDashoffset} strokeLinecap="round" 
                style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ef4444' }}>{totalCalories}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>kcal</span>
            </div>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'center', background: 'rgba(56, 189, 248, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 'bold' }}>
              PREDICTION: {user.daysToGoal} days to reach goal
            </span>
          </div>
        </div>

        <div className="glass-panel glass-panel-hover">
          <h3 className="heading-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserIcon color="#10b981" /> Active Trainer
          </h3>
          {trainer ? (
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(15, 23, 42, 0.4)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #10b981' }}>
                <img src={trainer.image_url} alt={trainer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{trainer.name}</p>
                <p style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '600' }}>{trainer.specialization}</p>
              </div>
            </div>
          ) : (
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>No trainer assigned. Visit the Trainers page to find one.</p>
          )}
        </div>

        <div className="glass-panel glass-panel-hover" style={{ overflowY: 'auto' }}>
          <h3 className="heading-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Dumbbell color="#3b82f6" /> Active Plans
          </h3>
          <div style={{ marginTop: '1rem' }}>
            {plans.length > 0 ? (
              plans.slice(0, 2).map(p => (
                <div key={p.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                  <span className="badge">{p.plan_type.toUpperCase()} - {p.goal}</span>
                  <p style={{ fontSize: '0.95rem', whiteSpace: 'pre-line' }}>{p.content}</p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No active plans. Generate one to get started.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr) minmax(300px, 1fr)', marginTop: '2rem' }}>
        <div className="glass-panel">
          <h3 className="heading-sm" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity color="#818cf8" size={20} /> AI Readiness
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem' }}>Sleep Quality</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{user.sleep_score}%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${user.sleep_score}%`, height: '100%', background: user.sleep_score > 70 ? '#10b981' : '#f59e0b' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem' }}>Stress Level</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{user.stress_score}%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${user.stress_score}%`, height: '100%', background: user.stress_score < 40 ? '#10b981' : '#ef4444' }}></div>
              </div>
            </div>
            <div style={{ padding: '0.8rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)', marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: '600' }}>
                {user.stress_score > 60 || user.sleep_score < 50 
                  ? "AI Advice: High fatigue detected. Suggesting mobility and active recovery today."
                  : "AI Advice: Readiness is high. Perfect day for high-intensity training!"}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <h3 className="heading-sm" style={{ marginBottom: '1.5rem' }}>Performance Trends</h3>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <span className="badge" style={{ cursor: 'pointer', background: '#3b82f6', color: '#fff' }}>Calories</span>
            <span className="badge" style={{ cursor: 'pointer' }}>Strength</span>
          </div>
          {chartData.length > 0 ? (
            <div style={{ width: '100%', height: '180px' }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <Line type="monotone" dataKey="calories" stroke="#3b82f6" strokeWidth={3} dot={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '0.8rem' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div style={{ height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Log activities to see your trend.</div>
          )}
        </div>

        <div className="glass-panel">
          <h3 className="heading-sm" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy color="#f59e0b" size={20} /> Daily Missions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {(user.missions || []).map(m => (
              <div key={m.id} style={{ padding: '0.8rem', background: m.completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', border: `1px solid ${m.completed ? 'rgba(16, 185, 129, 0.2)' : 'var(--glass-border)'}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                {m.completed ? <CheckCircle size={18} color="#10b981" /> : <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--text-secondary)' }}></div>}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: m.completed ? '#10b981' : 'var(--text-primary)' }}>{m.title}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{m.description}</div>
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#f59e0b' }}>+{m.xp} XP</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
