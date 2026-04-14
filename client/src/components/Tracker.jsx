import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Tracker() {
  const [activity, setActivity] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');

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
        body: JSON.stringify({ activity, duration_minutes: parseInt(duration), calories_burned: parseInt(calories) })
      });
      if (res.ok) {
        toast.success('Activity logged successfully!', { id: loadingToast });
        setActivity(''); setDuration(''); setCalories('');
      } else {
        toast.error('Failed to log Activity.', { id: loadingToast });
      }
    } catch (err) {
      toast.error('Network Error.', { id: loadingToast });
    }
  };

  return (
    <div>
      <h2 className="heading">Activity Tracker</h2>
      <p className="subheading">Log your daily workouts to keep track of your progress.</p>

      <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <label>Activity Name</label>
          <input className="input-field" type="text" placeholder="e.g. Morning Run" required value={activity} onChange={e => setActivity(e.target.value)} />
          
          <label>Duration (minutes)</label>
          <input className="input-field" type="number" required value={duration} onChange={e => setDuration(e.target.value)} />

          <label>Estimated Calories Burned (kcal)</label>
          <input className="input-field" type="number" required value={calories} onChange={e => setCalories(e.target.value)} />

          <button type="submit" className="btn" style={{ marginTop: '1.5rem' }}>Log Activity</button>
        </form>
      </div>
    </div>
  );
}
