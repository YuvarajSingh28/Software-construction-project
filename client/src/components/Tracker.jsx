import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Timer, StopCircle, Play, CheckCircle } from 'lucide-react';

export default function Tracker() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSessionActive = searchParams.get('session') === 'start';
  
  const [activity, setActivity] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  // Active Session State
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isSessionActive) {
      setActivity('Active Session');
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isSessionActive]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Logging activity...');
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          activity, 
          duration_minutes: parseInt(duration), 
          calories_burned: parseInt(calories),
          weight: parseInt(weight) || null,
          reps: parseInt(reps) || null
        })
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Activity logged! Gained ${data.xpGained} XP.`, { id: loadingToast });
        setActivity(''); setDuration(''); setCalories(''); setWeight(''); setReps('');
      } else {
        toast.error('Failed to log Activity.', { id: loadingToast });
      }
    } catch (err) {
      toast.error('Network Error.', { id: loadingToast });
    }
  };

  if (isSessionActive) {
    return (
      <div className="active-session-wrapper" style={{ textAlign: 'center', paddingTop: '2rem' }}>
        <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem' }}>
          <Timer size={64} color="#38bdf8" style={{ marginBottom: '1.5rem', animation: 'pulse 2s infinite' }} />
          <h2 className="heading" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{formatTime(timer)}</h2>
          <p className="subheading">Active Workout Session</p>
          
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <input className="input-field" placeholder="What are you doing? (e.g. Squats)" value={activity === 'Active Session' ? '' : activity} onChange={e => setActivity(e.target.value)} style={{ textAlign: 'center' }} />
             
             <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input className="input-field" type="number" placeholder="Weight (kg)" value={weight} onChange={e => setWeight(e.target.value)} />
                <input className="input-field" type="number" placeholder="Reps" value={reps} onChange={e => setReps(e.target.value)} />
             </div>

             <button 
                onClick={() => {
                  setDuration(Math.ceil(timer / 60));
                  setCalories(Math.ceil(timer / 60) * 8); // Estimate 8 kcal/min
                  handleSubmit({ preventDefault: () => {} });
                  navigate('/tracker');
                }}
                className="btn" 
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <StopCircle size={20} /> Finish & Log Workout
             </button>
             
             <button onClick={() => navigate('/tracker')} className="btn-secondary">Cancel Session</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="heading">Activity Tracker</h2>
      <p className="subheading">Log your daily workouts to keep track of your progress.</p>

      <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <label>Activity Name</label>
          <input className="input-field" type="text" placeholder="e.g. Morning Run" required value={activity} onChange={e => setActivity(e.target.value)} />
          
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Duration (minutes)</label>
              <input className="input-field" type="number" required value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            <div>
              <label>Calories Burned</label>
              <input className="input-field" type="number" required value={calories} onChange={e => setCalories(e.target.value)} />
            </div>
          </div>

          <details style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: '600' }}>
              + Strength Training Details (Optional)
            </summary>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label>Weight (kg)</label>
                <input className="input-field" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label>Reps</label>
                <input className="input-field" type="number" value={reps} onChange={e => setReps(e.target.value)} placeholder="0" />
              </div>
            </div>
          </details>

          <button type="submit" className="btn" style={{ marginTop: '0.5rem' }}>Log Activity</button>
        </form>
      </div>
    </div>
  );
}
