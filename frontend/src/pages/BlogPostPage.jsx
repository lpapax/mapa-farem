// frontend/src/pages/BlogPostPage.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Share2, Clock, MapPin, BookOpen } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { BLOG_POSTS } from '../data/blogPosts';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('cs-CZ', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

const GREEN = '#2D5016';
const GOLD = '#C8963E';
const CREAM = '#FAF7F2';
const DARK = '#1A1A1A';

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const post = BLOG_POSTS.find((p) => p.slug === slug);

  useSEO({
    title: post ? post.title : 'Článek nenalezen',
    description: post ? post.excerpt : '',
    ogImage: post
      ? `https://images.unsplash.com/photo-${post.photo}?auto=format&fit=crop&w=1200&q=80`
      : undefined,
  });

  if (!post) {
    return (
      <div style={{
        minHeight: '100vh', background: CREAM, fontFamily: "'Inter',sans-serif",
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 16, padding: 24,
      }}>
        <div style={{ fontSize: 48 }}>📭</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: DARK, margin: 0 }}>
          Článek nenalezen
        </h1>
        <p style={{ color: '#6B7280', margin: 0 }}>
          Tento článek neexistuje nebo byl odstraněn.
        </p>
        <button
          onClick={() => navigate('/blog')}
          style={{
            background: GREEN, color: 'white', border: 'none',
            padding: '10px 24px', borderRadius: 8, fontSize: 14,
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          ← Zpět na blog
        </button>
      </div>
    );
  }

  const related = BLOG_POSTS.filter((p) => p.id !== post.id).slice(0, 2);

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: post.title, url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`;

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Inter',sans-serif" }}>

      {/* Inject body styles for HTML content */}
      <style>{`
        .blog-body p { margin: 0 0 1.4em; font-size: 17px; line-height: 1.85; color: #333; }
        .blog-body h2 { font-family: 'Playfair Display',serif; font-size: 22px; color: ${GREEN}; margin: 2em 0 0.6em; line-height: 1.3; }
        .blog-body ul, .blog-body ol { margin: 0 0 1.4em 1.4em; font-size: 17px; line-height: 1.8; color: #333; }
        .blog-body strong { color: ${GREEN}; }
      `}</style>

      {/* Navbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 20px', background: 'white', borderBottom: '1px solid #E8E0D0',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4, background: 'none',
            border: 'none', cursor: 'pointer', color: GREEN, fontSize: 14,
            fontFamily: "'Inter',sans-serif",
          }}
        >
          <ChevronLeft size={18} /> Blog
        </button>
      </div>

      {/* Hero image */}
      <div style={{ width: '100%', maxHeight: 480, overflow: 'hidden' }}>
        <img
          src={`https://images.unsplash.com/photo-${post.photo}?auto=format&fit=crop&w=1400&q=80`}
          alt={post.title}
          style={{ width: '100%', maxHeight: 480, objectFit: 'cover', display: 'block' }}
          onError={(e) => {
            e.target.parentElement.style.background = '#E8E0D0';
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Article */}
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 60px' }}
      >
        {/* Meta row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          marginBottom: 20, fontSize: 12, color: '#6B7280',
        }}>
          <span style={{
            background: '#FFF3DC', color: GOLD, fontWeight: 700,
            padding: '4px 12px', borderRadius: 20, fontSize: 11,
          }}>
            {post.category}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <BookOpen size={12} /> {formatDate(post.date)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={12} /> {post.readTime} min čtení
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: 'clamp(28px, 5vw, 42px)',
          fontWeight: 700, color: DARK, margin: '0 0 24px', lineHeight: 1.25,
        }}>
          {post.title}
        </h1>

        {/* Author row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px 0', borderTop: '1px solid #E8E0D0',
          borderBottom: '1px solid #E8E0D0', marginBottom: 36, flexWrap: 'wrap',
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%', background: GREEN,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>
            🌾
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: DARK }}>
              {post.farmName}
            </div>
            <div style={{
              fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2,
            }}>
              <MapPin size={11} /> {post.farmRegion}
            </div>
          </div>
        </div>

        {/* Body HTML */}
        <div
          className="blog-body"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {/* Share row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginTop: 48,
          paddingTop: 24, borderTop: '1px solid #E8E0D0', flexWrap: 'wrap',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: DARK }}>
            <Share2 size={16} /> Sdílet:
          </span>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#25D366', color: 'white', padding: '8px 16px',
              borderRadius: 8, fontSize: 13, fontWeight: 600,
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            WhatsApp
          </a>
          <button
            onClick={handleShare}
            style={{
              background: copied ? '#E8F5E9' : 'white',
              color: copied ? GREEN : DARK,
              border: '1.5px solid #E8E0D0', padding: '8px 16px',
              borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {copied ? 'Zkopírováno!' : 'Kopírovat odkaz'}
          </button>
        </div>
      </motion.article>

      {/* Related posts */}
      {related.length > 0 && (
        <div style={{ background: 'white', borderTop: '1px solid #E8E0D0', padding: '48px 20px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <h2 style={{
              fontFamily: "'Playfair Display',serif", fontSize: 24,
              fontWeight: 700, color: DARK, margin: '0 0 24px',
            }}>
              Další články
            </h2>
            <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 8 }}>
              {related.map((rp) => (
                <div
                  key={rp.id}
                  onClick={() => navigate(`/blog/${rp.slug}`)}
                  style={{
                    flex: '0 0 260px', background: CREAM, borderRadius: 12,
                    overflow: 'hidden', cursor: 'pointer', border: '1px solid #E8E0D0',
                  }}
                >
                  <div style={{ height: 150, overflow: 'hidden' }}>
                    <img
                      src={`https://images.unsplash.com/photo-${rp.photo}?auto=format&fit=crop&w=400&q=75`}
                      alt={rp.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={(e) => {
                        e.target.parentElement.style.background = '#E8E0D0';
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <span style={{
                      background: '#FFF3DC', color: GOLD, fontWeight: 700,
                      padding: '3px 10px', borderRadius: 20, fontSize: 10,
                      display: 'inline-block', marginBottom: 8,
                    }}>
                      {rp.category}
                    </span>
                    <h3 style={{
                      fontFamily: "'Playfair Display',serif", fontSize: 15,
                      fontWeight: 700, color: DARK, margin: '0 0 6px', lineHeight: 1.35,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {rp.title}
                    </h3>
                    <div style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={10} /> {rp.readTime} min čtení
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
