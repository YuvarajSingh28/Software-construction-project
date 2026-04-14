import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Processing...');
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { username, password } : { username, password, email, phone_number: phone };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to authenticate');

      if (isLogin) {
        login(data.token, data.user);
        toast.dismiss(loadingToast);
        navigate('/');
      } else {
        setIsLogin(true);
        toast.success('Registration successful! Please log in.', { id: loadingToast });
      }
    } catch (err) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="heading" style={{ fontSize: '2.2rem', textAlign: 'center' }}>
          {isLogin ? 'Welcome Back' : 'Join FitLife'}
        </h2>
        <p className="subheading" style={{ textAlign: 'center' }}>
          {isLogin ? 'Log in to continue your journey.' : 'Start your fitness journey today.'}
        </p>

        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input className="input-field" type="text" required value={username} onChange={e => setUsername(e.target.value)} />
          
          {!isLogin && (
            <details style={{ marginBottom: '1.2rem', padding: '0.8rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: '600', outline: 'none' }}>
                + Add Optional Details (Email & Phone)
              </summary>
              <div style={{ marginTop: '1rem' }}>
                <label>Email</label>
                <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                
                <label>Phone</label>
                <input className="input-field" type="text" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </details>
          )}

          <label>Password</label>
          <input className="input-field" type="password" required value={password} onChange={e => setPassword(e.target.value)} />

          <button type="submit" className="btn" style={{ marginTop: '1.5rem' }}>
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button className="btn-secondary" style={{ border: 'none', cursor: 'pointer', fontSize: '0.9rem' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
