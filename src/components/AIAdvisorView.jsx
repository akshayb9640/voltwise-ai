import React, { useState } from 'react';
import { 
  Sparkles, Check, ArrowRight, Lightbulb, Zap, ShieldCheck, 
  Send, Bot, User, HelpCircle, Flame, Sun, RefreshCw, ThumbsUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { askAIEnergyAdvisor } from '../utils/aiAdvisor';

export function AIAdvisorView({
  recommendations,
  onApplyRecommendation,
  appliedActions,
  appliances,
  tariff,
  projectedData,
  liveKw,
  solarActive,
  onToggleSolar
}) {
  const currency = tariff.currencySymbol;
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      title: 'VoltWise AI Advisor Online',
      text: `Hello! I have analyzed your consumption telemetry. Your current projected bill is **${currency}${projectedData.projectedBill?.totalBill?.toLocaleString() || '2,840'}** (${projectedData.projectedTotalUnits} kWh). I have identified **${recommendations.length} high-impact optimizations** that can lower your monthly expenditure. Ask me any question or explore the recommendations below!`,
      actionKey: null,
      actionText: null
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const totalPossibleSavingsCost = recommendations.reduce((sum, r) => sum + r.monthlyCostSavings, 0);
  const totalPossibleKwhSavings = recommendations.reduce((sum, r) => sum + r.monthlyKwhSavings, 0);

  const handleApply = (rec) => {
    onApplyRecommendation(rec.actionKey);
    // Trigger confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore if canvas not ready
    }
  };

  const handleSendMessage = (textToSend) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    // Add user message
    const newChat = [...chatMessages, { sender: 'user', text: query }];
    setChatMessages(newChat);
    setChatInput('');
    setIsThinking(true);

    setTimeout(() => {
      const context = {
        tariff,
        appliances,
        projectedBill: projectedData,
        liveKw,
        solarActive
      };

      const aiReply = askAIEnergyAdvisor(query, context);
      setChatMessages([
        ...newChat,
        {
          sender: 'ai',
          title: aiReply.title,
          text: aiReply.response,
          actionKey: aiReply.actionKey,
          actionText: aiReply.actionText
        }
      ]);
      setIsThinking(false);
    }, 450);
  };

  const promptChips = [
    'How can I cut my bill under ₹2000?',
    'Which device consumes the most electricity?',
    'What is vampire power and how much am I losing?',
    'How much can rooftop solar save me?',
    'Explain DISCOM tariff slabs and peak hours'
  ];

  return (
    <div className="ai-advisor-container">
      {/* Hero Savings Header */}
      <div className="ai-hero-banner glass-panel">
        <div className="ai-hero-left">
          <div className="ai-hero-badge">
            <Sparkles size={16} className="text-cyan animate-pulse-glow" />
            <span>AI Energy Optimization Engine</span>
          </div>
          <h2 className="ai-hero-title">
            Unlock up to <span className="text-emerald font-mono">{currency}{totalPossibleSavingsCost.toLocaleString()}</span> in Monthly Savings
          </h2>
          <p className="ai-hero-subtitle">
            Targeting a total reduction of <strong className="text-white font-mono">{totalPossibleKwhSavings} kWh</strong> without compromising your living comfort or cooling needs.
          </p>
        </div>

        <div className="ai-hero-actions">
          <button
            className="btn-emerald btn-hero-apply"
            onClick={() => {
              recommendations.forEach(r => onApplyRecommendation(r.actionKey));
              try { confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } }); } catch (e) {}
            }}
          >
            <Sparkles size={16} />
            <span>Apply All Recommended Fixes</span>
          </button>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="recommendations-section">
        <div className="card-top-title">
          <div className="title-with-icon">
            <Lightbulb className="text-emerald" size={22} />
            <div>
              <h3 className="section-title">Step-by-Step Ways to Lower Your Next Bill</h3>
              <p className="section-subtitle">
                Simple changes you can make today. Click the button on any card to apply the optimization automatically.
              </p>
            </div>
          </div>
          <span className="badge badge-emerald">{recommendations.length} Simple Actions</span>
        </div>

        <div className="recommendations-grid">
          {recommendations.map(rec => {
            const isApplied = appliedActions[rec.actionKey];

            return (
              <div
                key={rec.id}
                className={`recommendation-card glass-panel ${isApplied ? 'rec-applied' : ''}`}
              >
                {/* Header with Step & Savings */}
                <div className="rec-card-header">
                  <div className="rec-step-pill">
                    <span className="rec-emoji-icon">{rec.simpleIcon || '💡'}</span>
                    <span className="rec-step-number font-mono">Tip #{rec.stepNumber || 1}</span>
                  </div>

                  <div className="rec-savings-hero font-mono">
                    <span className="text-emerald font-bold text-lg">
                      Save {currency}{rec.monthlyCostSavings.toLocaleString()}
                    </span>
                    <span className="text-muted text-xs"> / mo</span>
                  </div>
                </div>

                {/* Plain-English Action Title */}
                <h4 className="rec-title text-white">{rec.title}</h4>

                {/* 2 Simple Plain-English Boxes */}
                <div className="rec-simple-details-box">
                  <div className="rec-detail-row">
                    <span className="detail-tag font-bold text-cyan">Action:</span>
                    <span className="detail-text">{rec.whatToDo}</span>
                  </div>

                  <div className="rec-detail-row">
                    <span className="detail-tag font-bold text-emerald">Why:</span>
                    <span className="detail-text text-muted">{rec.whyItWorks}</span>
                  </div>
                </div>

                {/* Footer with Big Action Button */}
                <div className="rec-card-footer">
                  <div className="rec-effort-tag text-xs text-muted">
                    <span>Effort: <strong className="text-white">{rec.effort}</strong></span>
                  </div>

                  <button
                    className={`btn-apply-rec ${isApplied ? 'applied-btn' : 'btn-emerald'}`}
                    disabled={isApplied}
                    onClick={() => handleApply(rec)}
                  >
                    {isApplied ? (
                      <>
                        <Check size={16} />
                        <span>Applied & Active</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>{rec.actionLabel}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive AI Chat & Energy Consultation */}
      <div className="ai-chat-card glass-panel">
        <div className="card-top-title">
          <div className="title-with-icon">
            <Bot className="text-cyan" size={20} />
            <div>
              <h3 className="section-title">VoltWise AI Energy Assistant</h3>
              <p className="section-subtitle">Ask anything about your tariff, appliances, and energy conservation</p>
            </div>
          </div>
          <span className="badge badge-cyan">LLM Smart Advisor</span>
        </div>

        {/* Suggestion Prompt Chips */}
        <div className="chat-chips-scroll">
          {promptChips.map((chip, idx) => (
            <button
              key={idx}
              className="chat-prompt-chip"
              onClick={() => handleSendMessage(chip)}
            >
              <span>{chip}</span>
            </button>
          ))}
        </div>

        {/* Messages Stream */}
        <div className="chat-messages-container">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`chat-message-row ${msg.sender === 'user' ? 'msg-user' : 'msg-ai'}`}>
              <div className="msg-avatar">
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} className="text-cyan" />}
              </div>
              <div className="msg-content glass-panel">
                {msg.title && <h5 className="msg-title text-cyan">{msg.title}</h5>}
                <div className="msg-markdown-body" style={{ whiteSpace: 'pre-line' }}>
                  {msg.text}
                </div>

                {msg.actionKey && !appliedActions[msg.actionKey] && (
                  <div className="msg-action-box">
                    <button
                      className="btn-emerald text-xs"
                      onClick={() => {
                        onApplyRecommendation(msg.actionKey);
                        try { confetti({ particleCount: 70, spread: 60 }); } catch (e) {}
                      }}
                    >
                      <Sparkles size={13} />
                      <span>{msg.actionText || 'Apply Optimization'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="chat-message-row msg-ai">
              <div className="msg-avatar"><Bot size={16} className="text-cyan spin-slow" /></div>
              <div className="msg-content glass-panel text-muted font-mono text-xs">
                Computing live tariff formulas & appliance telemetry...
              </div>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <form
          className="chat-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            type="text"
            className="chat-text-input"
            placeholder="e.g. How can I keep my electricity bill under ₹2,000 this month?"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <button type="submit" className="btn-primary btn-send-chat" disabled={!chatInput.trim()}>
            <Send size={15} />
            <span>Ask AI</span>
          </button>
        </form>
      </div>
    </div>
  );
}
