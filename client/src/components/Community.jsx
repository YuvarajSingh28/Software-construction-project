import { useState, useEffect } from 'react';
import { Trophy, Medal, Flame, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Community() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(r => r.json())
    .then(data => {
      setLeaderboard(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="community-container">
      <h2 className="heading">Community Leaderboard</h2>
      <p className="subheading">Compete with the best and see where you stand globally.</p>

      <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '0' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="heading-sm" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Trophy color="#f59e0b" /> Global Top 10
          </h3>
          <span className="badge">Updated Hourly</span>
        </div>

        <div className="leaderboard-list">
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading rankings...</div>
          ) : (
            leaderboard.map((user, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={user.username} 
                style={{ 
                  padding: '1.2rem 2rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1.5rem', 
                  borderBottom: index === leaderboard.length - 1 ? 'none' : '1px solid var(--glass-border)',
                  background: index === 0 ? 'rgba(245, 158, 11, 0.05)' : 'transparent'
                }}
              >
                <div style={{ width: '30px', fontWeight: '800', fontSize: '1.2rem', color: index < 3 ? '#f59e0b' : 'var(--text-secondary)' }}>
                  #{index + 1}
                </div>
                
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: index < 3 ? '2px solid #f59e0b' : '1px solid var(--glass-border)' }}>
                    <User size={24} color={index < 3 ? '#f59e0b' : 'var(--text-secondary)'} />
                  </div>
                  {index === 0 && <Medal size={20} color="#f59e0b" style={{ position: 'absolute', top: -10, right: -10 }} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{user.username}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Level {user.level}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end', color: '#fb923c', fontWeight: 'bold' }}>
                    <Flame size={16} /> {user.streak_count}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: '#38bdf8' }}>{user.xp.toLocaleString()} XP</div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
