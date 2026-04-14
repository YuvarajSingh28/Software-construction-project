import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, Dumbbell, Activity, User as UserIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
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
      user.trainer_id ? fetch('/api/trainers', { headers: { 'Authorization': `Bearer ${token}` }}).then(r => r.json()) : Promise.resolve([])
    ]).then(([logsData, plansData, trainersData]) => {
      setLogs(logsData);
      setPlans(plansData);
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
      <h2 className="heading">Welcome, {user.username}!</h2>
      <p className="subheading">Here's your fitness overview today.</p>

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

      <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 2fr) minmax(300px, 1fr)', marginTop: '2rem' }}>
        <div className="glass-panel">
          <h3 className="heading-sm" style={{ marginBottom: '1.5rem' }}>Calorie Burn Trend</h3>
          {chartData.length > 0 ? (
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="calories" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>Log activities to see your trend.</div>
          )}
        </div>

        <div className="glass-panel">
          <h3 className="heading-sm" style={{ marginBottom: '1.5rem' }}>Recent Activity</h3>
          {logs.length > 0 ? (
            <div style={{ overflowX: 'auto', maxHeight: '300px' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '1rem 0' }}>Activity</th>
                    <th>Cal</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 5).map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '1rem 0' }}>
                        <div>{log.activity}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.duration_minutes}m</div>
                      </td>
                      <td style={{ color: '#ef4444', fontWeight: 'bold' }}>{log.calories_burned}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No recent activity logged.</p>
          )}
        </div>
      </div>
    </div>
  );
}
