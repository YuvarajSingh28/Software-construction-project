import { useState, useEffect } from 'react';

export default function PlanGenerator() {
  const [plans, setPlans] = useState([]);
  const [planType, setPlanType] = useState('workout');
  const [goal, setGoal] = useState('Weight Loss');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const res = await fetch('/api/plans', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
    const data = await res.json();
    setPlans(data);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/plans/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ plan_type: planType, goal })
      });
      if (res.ok) fetchPlans();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="heading">Plan Generator</h2>
      <p className="subheading">Generate algorithmic workout and diet plans tailored to your goals.</p>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 2fr)' }}>
        <div className="glass-panel">
          <h3 className="heading-sm">New Plan</h3>
          <form onSubmit={handleGenerate} style={{ marginTop: '1.5rem' }}>
            <label>Plan Type</label>
            <select className="input-field" value={planType} onChange={e => setPlanType(e.target.value)}>
              <option value="workout">Workout Routine</option>
              <option value="diet">Diet Plan</option>
            </select>

            <label>Primary Goal</label>
            <select className="input-field" value={goal} onChange={e => setGoal(e.target.value)}>
              <option value="Weight Loss">Weight Loss & Toning</option>
              <option value="Muscle Gain">Muscle Gain</option>
              <option value="Endurance">Endurance & Mobility</option>
            </select>

            <button type="submit" className="btn" style={{ marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Plan'}
            </button>
          </form>
        </div>

        <div className="glass-panel" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <h3 className="heading-sm">Your Plans</h3>
          <div style={{ marginTop: '1.5rem' }}>
            {plans.map(p => (
              <div key={p.id} style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid var(--glass-border)' }}>
                <span className="badge">{p.plan_type.toUpperCase()}</span>
                <span className="badge" style={{ marginLeft: '10px', background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd' }}>{p.goal}</span>
                <p style={{ marginTop: '1rem', whiteSpace: 'pre-line', lineHeight: '1.6' }}>{p.content}</p>
                <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Generated on: {new Date(p.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
            {plans.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No plans yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
