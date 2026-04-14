import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Trainers() {
  const { user, updateTrainer } = useAuth();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trainers', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }})
      .then(res => res.json())
      .then(data => {
        setTrainers(data);
        // Artificial delay to show off beautiful skeleton view
        setTimeout(() => setLoading(false), 800);
      });
  }, []);

  const assignTrainer = async (trainer_id) => {
    try {
      const res = await fetch('/api/users/trainer', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ trainer_id })
      });
      if (res.ok) {
        updateTrainer(trainer_id);
        toast.success('Trainer assigned successfully!');
      } else {
        toast.error('Failed to assign trainer.');
      }
    } catch (e) {
      toast.error('Error assigning trainer.');
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="heading">Our Trainers</h2>
        <div className="grid">
          {[1,2,3,4,5,6].map(i => (
             <div key={i} className="glass-panel" style={{ height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s infinite' }}></div>
               <div style={{ width: '60%', height: '20px', background: 'rgba(255,255,255,0.06)', marginTop: '20px', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
               <div style={{ width: '40%', height: '15px', background: 'rgba(255,255,255,0.06)', marginTop: '10px', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
               <style>{`@keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 0.9; } 100% { opacity: 0.5; } }`}</style>
             </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="heading">Our Trainers</h2>
      <p className="subheading">Select a professional to guide you on your fitness journey.</p>
      
      <div className="grid">
        {trainers.map(t => (
          <div key={t.id} className="glass-panel glass-panel-hover" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {user.trainer_id === t.id && (
              <span className="badge" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7' }}>Active</span>
            )}
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #38bdf8', marginBottom: '1.5rem', boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)' }}>
              <img src={t.image_url} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3 className="heading-sm">{t.name}</h3>
            <p style={{ color: '#60a5fa', fontWeight: 'bold', marginBottom: '1rem', fontSize: '0.9rem' }}>{t.specialization}</p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6', fontSize: '0.95rem' }}>{t.bio}</p>
            
            <button 
              className={`btn ${user.trainer_id === t.id ? 'btn-secondary' : ''}`}
              onClick={() => assignTrainer(t.id)}
              disabled={user.trainer_id === t.id}
              style={{ padding: '0.6rem', marginTop: 'auto', width: '100%' }}
            >
              {user.trainer_id === t.id ? 'Assigned' : 'Assign Trainer'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
