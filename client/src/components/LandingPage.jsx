import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Shield, Zap, Users, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <nav className="nav-bar public-nav">
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={28} color="#38bdf8" />
          <span style={{ fontSize: '1.8rem' }}>FitLife</span>
        </div>
        <div className="nav-links">
          <Link to="/auth?mode=login" className="nav-link login-btn">Login</Link>
          <Link to="/auth?mode=signup" className="btn signup-btn" style={{ width: 'auto', padding: '0.6rem 1.4rem' }}>Get Started</Link>
        </div>
      </nav>

      <header className="hero-section">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-content"
        >
          <div className="badge">Next Generation Fitness</div>
          <h1 className="hero-title">Elevate Your Fitness Journey with <span className="text-gradient">FitLife</span></h1>
          <p className="hero-description">
            FitLife is a premium, all-in-one fitness ecosystem designed to help you reach your peak performance. 
            From AI-powered workout generation to expert trainer assignments and real-time activity tracking, 
            we provide the tools you need to transform your body and mind.
          </p>
          <div className="hero-actions">
            <Link to="/auth?mode=signup" className="btn btn-large">
              Start for Free <ArrowRight size={20} style={{ marginLeft: '8px' }} />
            </Link>
            <Link to="/auth?mode=login" className="btn-secondary btn-large">
              View Demo
            </Link>
          </div>
        </motion.div>
      </header>

      <section className="features-section main-layout">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 className="heading">Everything You Need to Succeed</h2>
          <p className="subheading">Our comprehensive platform covers every aspect of your fitness lifestyle.</p>
        </div>

        <div className="grid">
          <motion.div whileHover={{ y: -8 }} className="glass-panel feature-card">
            <div className="feature-icon zap">
              <Zap size={24} />
            </div>
            <h3 className="heading-sm">Personalized Plans</h3>
            <p className="text-secondary">Get custom-tailored workout and diet plans generated specifically for your goals, whether it's weight loss, muscle gain, or endurance.</p>
          </motion.div>

          <motion.div whileHover={{ y: -8 }} className="glass-panel feature-card">
            <div className="feature-icon users">
              <Users size={24} />
            </div>
            <h3 className="heading-sm">Expert Trainers</h3>
            <p className="text-secondary">Connect with certified professional trainers who provide guidance, motivation, and the expertise you need to break through plateaus.</p>
          </motion.div>

          <motion.div whileHover={{ y: -8 }} className="glass-panel feature-card">
            <div className="feature-icon activity">
              <Activity size={24} />
            </div>
            <h3 className="heading-sm">Smart Tracking</h3>
            <p className="text-secondary">Log your daily activities and monitor your progress with intuitive dashboards. Track calories burned, duration, and consistency over time.</p>
          </motion.div>

          <motion.div whileHover={{ y: -8 }} className="glass-panel feature-card">
            <div className="feature-icon shield">
              <Shield size={24} />
            </div>
            <h3 className="heading-sm">Secure & Private</h3>
            <p className="text-secondary">Your data security is our priority. Enjoy a private experience with secure authentication and encrypted data storage.</p>
          </motion.div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="main-layout" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={24} color="#38bdf8" />
            FitLife
          </div>
          <p className="text-secondary">© 2026 FitLife Ecosystem. All rights reserved.</p>
          <div className="nav-links">
            <Link to="#" className="nav-link">Privacy</Link>
            <Link to="#" className="nav-link">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
