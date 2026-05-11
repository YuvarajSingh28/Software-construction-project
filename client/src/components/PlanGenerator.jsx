import { useState, useEffect } from 'react';

export default function PlanGenerator() {
  const [plans, setPlans] = useState([]);
  const [planType, setPlanType] = useState('workout');
  const [goal, setGoal] = useState('Weight Loss');
  const [budget, setBudget] = useState('Standard');
  const [loading, setLoading] = useState(false);
  
  // Hyper-personalization states
  const [sleep, setSleep] = useState(80);
  const [stress, setStress] = useState(20);
  const [injury, setInjury] = useState('None');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const token = localStorage.getItem('token');
    const [plansRes, userRes] = await Promise.all([
      fetch('/api/plans', { headers: { 'Authorization': `Bearer ${token}` }}),
      fetch('/api/me', { headers: { 'Authorization': `Bearer ${token}` }})
    ]);
    
    const plansData = await plansRes.json();
    const userData = await userRes.json();
    
    setPlans(plansData);
    setSleep(userData.sleep_score || 80);
    setStress(userData.stress_score || 20);
    setInjury(userData.injuries || 'None');
  };

  const updateProfile = async (s, st, inj) => {
    await fetch('/api/users/profile', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ sleep_score: s, stress_score: st, injuries: inj })
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      // First, update profile with latest readiness data
      await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sleep_score: sleep, stress_score: stress, injuries: injury })
      });

      // Then, generate plan
      const res = await fetch('/api/plans/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan_type: planType, goal, budget })
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
          <h3 className="heading-sm">AI Hyper-Personalization</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Adjust your daily readiness for the AI to optimize your plan.
          </p>
          
          <form onSubmit={handleGenerate}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                Sleep Quality <span>{sleep}%</span>
              </label>
              <input type="range" min="0" max="100" value={sleep} onChange={e => { setSleep(parseInt(e.target.value)); updateProfile(parseInt(e.target.value), stress, injury); }} style={{ width: '100%', accentColor: '#38bdf8' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                Stress Level <span>{stress}%</span>
              </label>
              <input type="range" min="0" max="100" value={stress} onChange={e => { setStress(parseInt(e.target.value)); updateProfile(sleep, parseInt(e.target.value), injury); }} style={{ width: '100%', accentColor: '#ef4444' }} />
            </div>

            <label>Recent Injuries</label>
            <select className="input-field" value={injury} onChange={e => { setInjury(e.target.value); updateProfile(sleep, stress, e.target.value); }}>
              <option value="None">None</option>
              <option value="Knee">Knee Pain</option>
              <option value="Shoulder">Shoulder Strain</option>
              <option value="Back">Lower Back Pain</option>
              <option value="Wrist">Wrist/Hand</option>
            </select>

            <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '1.5rem 0' }} />

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

            {planType === 'diet' && (
              <>
                <label>Budget Preference</label>
                <select className="input-field" value={budget} onChange={e => setBudget(e.target.value)}>
                  <option value="Standard">Standard</option>
                  <option value="Budget-Friendly">Budget-Friendly</option>
                  <option value="Premium/Organic">Premium/Organic</option>
                </select>
              </>
            )}

            <button type="submit" className="btn" style={{ marginTop: '1rem' }} disabled={loading}>
              {loading ? 'AI Analyzing...' : 'Generate Adaptive Plan'}
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
                <p style={{ marginTop: '1rem', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                  {p.content.split('\n').map((line, i) => (
                    <span key={i} style={{ color: line.includes('[AI Note]') ? '#38bdf8' : 'inherit', fontWeight: line.includes('[AI Note]') ? 'bold' : 'normal', display: 'block' }}>
                      {line}
                    </span>
                  ))}
                </p>
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
