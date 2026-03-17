// frontend/src/pages/BlogPage.jsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Clock, MapPin } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { BLOG_POSTS } from '../data/blogPosts';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('cs-CZ', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

const GOLD = '#C8963E';
const GREEN = '#2D5016';
const CREAM = '#FAF7F2';
const DARK = '#1A1A1A';

const badgeStyle = {
  background: '#FFF3DC',
  color: GOLD,
  fontSize: 11,
  fontWeight: 700,
  padding: '4px 12px',
  borderRadius: 20,
  display: 'inline-block',
};

export default function BlogPage() {
  useSEO({
    title: 'Farmářský blog',
    description: 'Příběhy, recepty a tipy z českých farem',
  });

  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Vše');
  const [email, setEmail] = useState('');

  const categories = useMemo(() => {
    const cats = [...new Set(BLOG_POSTS.map((p) => p.category))];
    return ['Vše', ...cats];
  }, []);

  const featuredPost = BLOG_POSTS.find((p) => p.featured);

  const filtered = useMemo(() => {
    if (activeCategory === 'Vše') return BLOG_POSTS;
    return BLOG_POSTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const gridPosts = filtered.filter((p) => !p.featured);

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Inter',sans-serif" }}>

      {/* Navbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', background: 'white', borderBottom: '1px solid #E8E0D0',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer',
            color: GREEN, fontFamily: "'Inter',sans-serif", fontSize: 14,
          }}
        >
          <ChevronLeft size={18} /> Zpět
        </button>
        <span style={{
          fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: DARK,
        }}>
          Blog
        </span>
        <div style={{ width: 64 }} />
      </div>

      {/* Hero */}
      <div style={{ background: CREAM, padding: '48px 20px 40px', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 700, color: DARK, margin: '0 0 12px', lineHeight: 1.2,
        }}>
          Farmářský blog
        </h1>
        <p style={{ fontSize: 16, color: '#6B7280', margin: 0 }}>
          Příběhy, recepty a tipy z českých farem
        </p>
      </div>

      {/* Featured post */}
      {featuredPost && (
        <div style={{ maxWidth: 1020, margin: '0 auto 40px', padding: '0 20px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate(`/blog/${featuredPost.slug}`)}
            style={{
              display: 'flex', borderRadius: 16, overflow: 'hidden',
              background: 'white', border: '1px solid #E8E0D0',
              boxShadow: '0 4px 24px rgba(0,0,0,0.09)', cursor: 'pointer',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: '1 1 340px', minHeight: 280, overflow: 'hidden' }}>
              <img
                src={`https://images.unsplash.com/photo-${featuredPost.photo}?auto=format&fit=crop&w=800&q=80`}
                alt={featuredPost.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => { e.target.parentElement.style.background = '#E8E0D0'; e.target.style.display = 'none'; }}
              />
            </div>
            <div style={{
              flex: '1 1 300px', padding: '36px 36px 32px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14,
            }}>
              <span style={badgeStyle}>{featuredPost.category}</span>
              <h2 style={{
                fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700,
                color: DARK, margin: 0, lineHeight: 1.3,
              }}>
                {featuredPost.title}
              </h2>
              <p style={{ fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.65 }}>
                {featuredPost.excerpt}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#6B7280' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} /> {featuredPost.farmName}, {featuredPost.farmRegion}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} /> {featuredPost.readTime} min čtení
                </span>
              </div>
              <button style={{
                alignSelf: 'flex-start', background: GREEN, color: 'white',
                border: 'none', padding: '10px 22px', borderRadius: 8,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                Číst dál →
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Category filter */}
      <div style={{
        maxWidth: 1020, margin: '0 auto 32px', padding: '0 20px',
        display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4,
      }}>
        {categories.map((cat) => {
          const active = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                flexShrink: 0, padding: '7px 18px', borderRadius: 20,
                border: '1.5px solid', borderColor: active ? GREEN : '#E8E0D0',
                background: active ? GREEN : 'white',
                color: active ? 'white' : DARK,
                fontSize: 13, fontWeight: active ? 700 : 400, cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Blog grid */}
      <div style={{ maxWidth: 1020, margin: '0 auto', padding: '0 20px 60px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 24,
        }}>
          <AnimatePresence mode="popLayout">
            {gridPosts.map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} navigate={navigate} />
            ))}
          </AnimatePresence>
        </div>
        {gridPosts.length === 0 && (
          <p style={{ textAlign: 'center', color: '#6B7280', padding: '60px 0' }}>
            Žádné články v této kategorii.
          </p>
        )}
      </div>

      {/* Newsletter */}
      <div style={{ background: GREEN, padding: '56px 20px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700,
            color: 'white', margin: '0 0 10px',
          }}>
            Odebírejte novinky z farem
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, margin: '0 0 28px' }}>
            Každý měsíc nejlepší recepty a tipy přímo do schránky.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vas@email.cz"
              style={{
                flex: '1 1 220px', padding: '12px 16px', borderRadius: 8,
                border: 'none', fontSize: 14, outline: 'none',
              }}
            />
            <button style={{
              background: GOLD, color: 'white', border: 'none',
              padding: '12px 24px', borderRadius: 8, fontSize: 14,
              fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              Přihlásit se
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlogCard({ post, index, navigate }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/blog/${post.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white', border: '1px solid #E8E0D0', borderRadius: 14,
        overflow: 'hidden', cursor: 'pointer',
        boxShadow: hovered ? '0 12px 36px rgba(0,0,0,0.13)' : '0 2px 8px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ aspectRatio: '16/9', overflow: 'hidden', flexShrink: 0 }}>
        <img
          src={`https://images.unsplash.com/photo-${post.photo}?auto=format&fit=crop&w=600&q=80`}
          alt={post.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => { e.target.parentElement.style.background = '#E8E0D0'; e.target.style.display = 'none'; }}
        />
      </div>
      <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ ...badgeStyle, alignSelf: 'flex-start' }}>{post.category}</span>
        <h3 style={{
          fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700,
          color: DARK, margin: 0, lineHeight: 1.35,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {post.title}
        </h3>
        <p style={{
          fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.6, flex: 1,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {post.excerpt}
        </p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#6B7280',
          borderTop: '1px solid #F0EAE0', paddingTop: 10, flexWrap: 'wrap',
        }}>
          <span style={{ fontWeight: 600, color: DARK }}>{post.farmName}</span>
          <span>·</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={10} /> {post.readTime} min
          </span>
          <span>·</span>
          <span>{formatDate(post.date)}</span>
        </div>
      </div>
    </motion.article>
  );
}
