import React, { useState, useEffect } from 'react';
import { 
  History, 
  Trash2, 
  Download, 
  Copy, 
  Volume2, 
  Search, 
  Check, 
  Calendar,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { fetchTranslationHistory, clearTranslationHistory } from '../services/api';
import { speechService } from '../services/speechSynthesis';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    const data = await fetchTranslationHistory();
    setHistory(data || []);
    setLoading(false);
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear your translation history?')) {
      await clearTranslationHistory();
      setHistory([]);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text) => {
    speechService.speak(text);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `ISL_Translations_${Date.now()}.json`;
    a.click();
  };

  const filtered = history.filter(item => {
    const q = search.toLowerCase();
    const trans = (item.translation || '').toLowerCase();
    const signs = (item.detected_signs || []).join(' ').toLowerCase();
    return trans.includes(q) || signs.includes(q);
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 80px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 16px',
          borderRadius: '9999px',
          background: 'rgba(59, 130, 246, 0.12)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#60a5fa',
          fontSize: '0.84rem',
          fontWeight: 600,
          marginBottom: '14px'
        }}>
          <History size={16} />
          <span>MongoDB Translation Records</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff' }}>
          Translation <span className="gradient-text">History & Archives</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
          Browse, search, replay, and download all past continuous sign translations recorded during your sessions.
        </p>
      </div>

      {/* Action and Search Bar */}
      <div className="glass-panel" style={{
        padding: '20px',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search past translations or signs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '40px' }}
          />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleExportJSON}
            disabled={history.length === 0}
            className="btn btn-secondary btn-sm"
          >
            <Download size={15} />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleClear}
            disabled={history.length === 0}
            className="btn btn-secondary btn-sm"
            style={{ color: '#fb7185' }}
          >
            <Trash2 size={15} />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* History Records List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading records from database...
        </div>
      ) : filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map((item, idx) => {
            const itemId = item.id || idx;
            return (
              <div
                key={itemId}
                className="glass-card"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {item.timestamp}
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {item.detected_signs && item.detected_signs.map((sign, sIdx) => (
                        <span key={sIdx} className="sign-chip" style={{ fontSize: '0.78rem', padding: '3px 8px' }}>
                          {sign}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                    “{item.translation}”
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>
                    Confidence: {Math.round((item.confidence || 0.94) * 100)}%
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleSpeak(item.translation)}
                    className="btn btn-secondary btn-sm"
                    title="Speak text aloud"
                  >
                    <Volume2 size={16} />
                    <span>Speak</span>
                  </button>
                  <button
                    onClick={() => handleCopy(itemId, item.translation)}
                    className="btn btn-secondary btn-sm"
                    title="Copy translation"
                  >
                    {copiedId === itemId ? <Check size={16} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          No translation history matching your search.
        </div>
      )}

    </div>
  );
}
