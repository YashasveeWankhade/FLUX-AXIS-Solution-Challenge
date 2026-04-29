import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { History, CheckCircle2, X, ThumbsUp, ThumbsDown, RotateCcw, TrendingUp, Brain } from 'lucide-react';

const DECISIONS = [
  { id: 'D1', action: 'Reroute SHA to LAX via Port of Oakland', shipment: 'FLX-1000', outcome: 'SUCCESS', costSaved: '$8,400', timeSaved: '12h', confidence: 94, feedback: null, ts: '2026-04-28 14:22 UTC', modelVersion: 'v3.2.1' },
  { id: 'D2', action: 'Divert DXB to RTM via Cape of Good Hope', shipment: 'FLX-1010', outcome: 'SUCCESS', costSaved: '$2,100', timeSaved: '8h', confidence: 87, feedback: 'positive', ts: '2026-04-27 10:15 UTC', modelVersion: 'v3.2.1' },
  { id: 'D3', action: 'Air freight escalation  -  FLX-1020', shipment: 'FLX-1020', outcome: 'PARTIAL', costSaved: '-$94,200', timeSaved: '48h', confidence: 99, feedback: 'negative', ts: '2026-04-26 08:30 UTC', modelVersion: 'v3.1.9' },
  { id: 'D4', action: 'Port Botany berth pre-booking', shipment: 'FLX-1030', outcome: 'PENDING', costSaved: ' - ', timeSaved: ' - ', confidence: 76, feedback: null, ts: '2026-04-29 09:00 UTC', modelVersion: 'v3.2.1' },
  { id: 'D5', action: 'Carrier swap Maersk  to  Evergreen', shipment: 'FLX-1015', outcome: 'SUCCESS', costSaved: '$3,200', timeSaved: '4h', confidence: 82, feedback: 'positive', ts: '2026-04-25 16:45 UTC', modelVersion: 'v3.1.9' },
];

const MODEL_STATS = [
  { label: 'Total Decisions', value: '1,248' },
  { label: 'Accepted Rate', value: '91%' },
  { label: 'Avg Confidence', value: '86%' },
  { label: 'Cost Savings YTD', value: '$2.4M' },
  { label: 'SLA Preserved', value: '97.2%' },
  { label: 'Feedback Given', value: '64%' },
];

export default function FeedbackPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [feedbacks, setFeedbacks] = useState({});
  const [notes, setNotes] = useState({});

  const selected = DECISIONS.find(d => d.id === selectedId);

  const giveFeedback = (id, type) => {
    setFeedbacks(f => ({ ...f, [id]: type }));
  };

  const outcomeColor = { SUCCESS: 'var(--stable-muted)', PARTIAL: 'var(--warning-muted)', PENDING: 'var(--accent-3)', FAILED: 'var(--critical-muted)' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ height: '100%', display: 'grid', gridTemplateColumns: '360px 1fr' }}>

      {/* Left: Decision list */}
      <div style={{ borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Brain size={16} style={{ color: 'var(--accent-1)' }} />
            <h2 style={{ fontSize: '14px' }}>DECISION_LOOP</h2>
          </div>
          <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Operator feedback trains the AI model</div>
        </div>
        <div className="scroll-area" style={{ flex: 1 }}>
          {DECISIONS.map(d => {
            const fb = feedbacks[d.id] || d.feedback;
            return (
              <div key={d.id} onClick={() => setSelectedId(d.id)}
                style={{
                  padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)',
                  cursor: 'pointer', background: selectedId === d.id ? 'var(--bg-accent)' : 'transparent',
                  borderLeft: selectedId === d.id ? '3px solid var(--accent-1)' : '3px solid transparent',
                  transition: 'all 0.1s',
                }}>
                <div className="flex-between" style={{ marginBottom: '5px' }}>
                  <span className="mono" style={{ fontWeight: 700, fontSize: '11px' }}>{d.shipment}</span>
                  <span className="mono" style={{ fontSize: '9px', color: outcomeColor[d.outcome] }}>* {d.outcome}</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', lineHeight: 1.3 }}>{d.action}</div>
                <div className="flex-between">
                  <span className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{d.ts.split(' ')[0]}</span>
                  {fb && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: fb === 'positive' ? 'var(--stable-muted)' : 'var(--critical-muted)' }}>
                      {fb === 'positive' ? <ThumbsUp size={11} /> : <ThumbsDown size={11} />}
                      <span className="mono" style={{ fontSize: '9px' }}>Reviewed</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Detail + feedback */}
      <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {selected ? (
          <motion.div key={selected.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            {/* Header */}
            <div>
              <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: '6px' }}>DECISION_REVIEW</div>
              <div className="flex-between">
                <h1 style={{ fontSize: '20px', maxWidth: '540px', lineHeight: 1.3 }}>{selected.action}</h1>
                <div className="mono" style={{ fontSize: '11px', color: outcomeColor[selected.outcome], padding: '4px 10px', border: `1px solid ${outcomeColor[selected.outcome]}`, borderRadius: '4px' }}>{selected.outcome}</div>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { label: 'SHIPMENT', value: selected.shipment, color: 'var(--accent-3)' },
                { label: 'COST SAVED', value: selected.costSaved, color: selected.costSaved.startsWith('-') ? 'var(--critical-muted)' : 'var(--stable-muted)' },
                { label: 'TIME SAVED', value: selected.timeSaved, color: 'var(--accent-1)' },
                { label: 'AI CONFIDENCE', value: `${selected.confidence}%`, color: 'var(--text-main)' },
              ].map(({ label, value, color }) => (
                <div key={label} className="panel-2" style={{ padding: '14px' }}>
                  <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Feedback panel */}
            <div className="panel-2" style={{ padding: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '12px' }}>OPERATOR_FEEDBACK</div>
              {(feedbacks[selected.id] || selected.feedback) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: (feedbacks[selected.id] || selected.feedback) === 'positive' ? 'var(--stable-muted)' : 'var(--critical-muted)' }}>
                  {(feedbacks[selected.id] || selected.feedback) === 'positive' ? <ThumbsUp size={20} /> : <ThumbsDown size={20} />}
                  <span style={{ fontWeight: 600 }}>Feedback recorded  -  model will retrain at next cycle</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Was this AI recommendation accurate and helpful?</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" onClick={() => giveFeedback(selected.id, 'positive')}>
                      <ThumbsUp size={14} /> Yes, Correct
                    </button>
                    <button className="btn btn-danger" onClick={() => giveFeedback(selected.id, 'negative')}>
                      <ThumbsDown size={14} /> No, Incorrect
                    </button>
                  </div>
                  <textarea
                    className="input" rows={3} placeholder="Add optional notes for model improvement..."
                    value={notes[selected.id] || ''} onChange={e => setNotes(n => ({ ...n, [selected.id]: e.target.value }))}
                    style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }} />
                </div>
              )}
            </div>

            {/* Model info */}
            <div className="panel-2" style={{ padding: '16px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <Brain size={20} style={{ color: 'var(--accent-2)', flexShrink: 0 }} />
              <div>
                <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>MODEL VERSION: {selected.modelVersion}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Next retraining cycle: 2026-05-01  -  Feedback improves prediction by ~3% per 100 decisions</div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div style={{ flex: 1, padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '6px' }}>MODEL_PERFORMANCE</div>
              <h1 style={{ fontSize: '22px' }}>Decision Intelligence</h1>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {MODEL_STATS.map(({ label, value }) => (
                <div key={label} className="metric-card">
                  <div className="metric-value" style={{ fontSize: '24px', color: 'var(--accent-1)' }}>{value}</div>
                  <div className="metric-label">{label}</div>
                </div>
              ))}
            </div>
            <div className="flex-center" style={{ flex: 1, color: 'var(--text-dim)' }}>
              <div style={{ textAlign: 'center' }}>
                <History size={36} strokeWidth={1} style={{ marginBottom: '12px' }} />
                <div className="mono" style={{ fontSize: '12px' }}>SELECT_DECISION_TO_REVIEW</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
