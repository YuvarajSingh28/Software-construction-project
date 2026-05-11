import { useState } from 'react';
import { Play, Heart, MessageCircle, Share2, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_VIDEOS = [
  { id: 1, title: 'Perfect Squat Form', author: '@FitCoach_Arnold', views: '12K', thumbnail: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=80' },
  { id: 2, title: '5 Min Morning Stretch', author: '@Yoga_Mia', views: '45K', thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=500&q=80' },
  { id: 3, title: 'High Protein Breakfast', author: '@Chef_Fit', views: '8K', thumbnail: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=500&q=80' },
  { id: 4, title: 'HIIT Cardio Blast', author: '@Jax_CrossFit', views: '22K', thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=500&q=80' },
  { id: 5, title: 'Mastering the Deadlift', author: '@Strength_Guru', views: '31K', thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=500&q=80' },
  { id: 6, title: 'Quick Core Workout', author: '@Chloe_Pilates', views: '19K', thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=500&q=80' },
];

export default function Discover() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="discover-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="heading">Discover</h2>
          <p className="subheading" style={{ margin: 0 }}>Watch workout shorts and expert tips.</p>
        </div>
        <div style={{ position: 'relative', maxWidth: '300px', width: '100%' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
          <input 
            className="input-field" 
            placeholder="Search exercises..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px', marginBottom: 0 }}
          />
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
        {MOCK_VIDEOS.map((video, index) => (
          <motion.div 
            key={video.id}
            whileHover={{ scale: 1.02 }}
            className="glass-panel" 
            style={{ padding: '0', overflow: 'hidden', cursor: 'pointer' }}
          >
            <div style={{ position: 'relative', aspectRatio: '9/16' }}>
              <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%)' }}></div>
              
              <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem' }}>
                <p style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.2rem' }}>{video.title}</p>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{video.author}</p>
              </div>

              <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Heart size={20} />
                  <span style={{ fontSize: '0.7rem' }}>Like</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <MessageCircle size={20} />
                  <span style={{ fontSize: '0.7rem' }}>12</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Share2 size={20} />
                  <span style={{ fontSize: '0.7rem' }}>Send</span>
                </div>
              </div>

              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play fill="#fff" size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
