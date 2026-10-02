import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Sparkles, 
  Info, 
  ChevronRight, 
  Check, 
  X,
  Layers,
  Hand
} from 'lucide-react';
import { fetchVocabulary, fetchCategories } from '../services/api';

export default function VocabularyPage() {
  const [vocabulary, setVocabulary] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null); // null = all, 1 to 5
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSignModal, setActiveSignModal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVocab();
    fetchCategories().then(res => setCategories(res.categories || []));
  }, [selectedLevel, selectedCategory]);

  const loadVocab = async () => {
    setLoading(true);
    const data = await fetchVocabulary({
      level: selectedLevel,
      category: selectedCategory,
      search: searchQuery
    });
    setVocabulary(data || []);
    setLoading(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadVocab();
  };

  const levelTabs = [
    { level: null, label: 'All Levels' },
    { level: 1, label: 'Level 1: Alphabet (A–Z)' },
    { level: 2, label: 'Level 2: Numbers (0–100+)' },
    { level: 3, label: 'Level 3: Basic (~100–300)' },
    { level: 4, label: 'Level 4: Daily (~500–1000)' },
    { level: 5, label: 'Level 5: Continuous' }
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px 80px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 16px',
          borderRadius: '9999px',
          background: 'rgba(6, 182, 212, 0.12)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: 'var(--accent-cyan)',
          fontSize: '0.84rem',
          fontWeight: 600,
          marginBottom: '14px'
        }}>
          <BookOpen size={16} />
          <span>ISL Lexicon & Gesture Archive</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff' }}>
          Indian Sign Language <span className="gradient-text">Vocabulary Matrix</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto', fontSize: '0.95rem' }}>
          Comprehensive coverage across Level 1 (Alphabet), Level 2 (Numbers), Level 3 (Core Actions & Pronouns), Level 4 (Daily Life), and Level 5 (Continuous Sequences).
        </p>
      </div>

      {/* Level Selector Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '20px'
      }}>
        {levelTabs.map(tab => (
          <button
            key={String(tab.level)}
            onClick={() => setSelectedLevel(tab.level)}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              border: selectedLevel === tab.level ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              background: selectedLevel === tab.level ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(99, 102, 241, 0.25))' : 'rgba(13, 20, 36, 0.6)',
              color: selectedLevel === tab.level ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.86rem',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.18s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search sign label (e.g. COLLEGE, EAT, HELP, I, MOTHER)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '12px 20px' }}>
            Search
          </button>
        </form>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedCategory(null)}
            style={{
              padding: '6px 12px',
              borderRadius: '9999px',
              border: '1px solid var(--border-subtle)',
              background: selectedCategory === null ? 'var(--accent-cyan)' : 'transparent',
              color: selectedCategory === null ? '#000000' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 12px',
                borderRadius: '9999px',
                border: '1px solid var(--border-subtle)',
                background: selectedCategory === cat ? 'var(--accent-cyan)' : 'transparent',
                color: selectedCategory === cat ? '#000000' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vocabulary Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading ISL Vocabulary Matrix...
        </div>
      ) : vocabulary.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '18px'
        }}>
          {vocabulary.map(item => (
            <div
              key={item.sign_id}
              onClick={() => setActiveSignModal(item)}
              className="glass-card"
              style={{
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                    Level {item.level}
                  </span>
                  <span className="badge" style={{ fontSize: '0.7rem', textTransform: 'capitalize', background: 'rgba(30, 41, 59, 0.7)' }}>
                    {item.category}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.02em' }}>
                    {item.label}
                  </h3>
                  {item.two_handed && (
                    <span title="Two-handed sign" style={{ fontSize: '0.85rem' }}>👐</span>
                  )}
                </div>

                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.45
                }}>
                  {item.motion}
                </p>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.78rem',
                color: 'var(--accent-cyan)'
              }}>
                <span>Click for Sign Details</span>
                <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          No signs matched your current filters. Try searching for a different sign or clearing filters.
        </div>
      )}

      {/* Sign Details Modal */}
      {activeSignModal && (
        <div className="modal-backdrop" onClick={() => setActiveSignModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-cyan">Level {activeSignModal.level}</span>
                  <span className="badge badge-emerald" style={{ textTransform: 'capitalize' }}>
                    {activeSignModal.category}
                  </span>
                  <span className="badge">
                    {activeSignModal.two_handed ? 'Two-Handed 👐' : 'Single-Handed ✋'}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                  Sign: {activeSignModal.label}
                </h2>
              </div>
              <button
                onClick={() => setActiveSignModal(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Gesture & Motion Execution
                </span>
                <p style={{ fontSize: '0.95rem', color: '#e2e8f0', marginTop: '4px', lineHeight: 1.5 }}>
                  {activeSignModal.motion}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Detailed Description
                </span>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                  {activeSignModal.description}
                </p>
              </div>

              <div style={{
                background: 'rgba(6, 182, 212, 0.08)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(6, 182, 212, 0.25)'
              }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Example in Continuous Sentence:
                </span>
                <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                  “{activeSignModal.example_sentence}”
                </p>
              </div>

              <button
                onClick={() => setActiveSignModal(null)}
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '8px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
