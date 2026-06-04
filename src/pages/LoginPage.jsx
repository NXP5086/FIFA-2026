import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

function LoginPage({ authError }) {
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false, redirectTo: window.location.origin },
    });
    setSending(false);
    if (error) {
      setError(error.message || 'Could not send login link. Check your email and try again.');
    } else {
      setSent(true);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Wordmark */}
        <div className="login-mark">
          <svg className="login-ball" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="#F5F3EE" stroke="#0E1116" strokeWidth="1" />
            <path d="M12 7.5 L15.5 10 L14.2 14 L9.8 14 L8.5 10 Z" fill="#0E1116" />
            <path d="M12 7.5 L12 4 L15 5 L15.5 10 Z" fill="#0E1116" />
            <path d="M15.5 10 L15 5 L18.5 7 L19.5 11 Z" fill="#0E1116" />
            <path d="M14.2 14 L15.5 10 L19.5 11 L18 15 Z" fill="#0E1116" />
            <path d="M9.8 14 L14.2 14 L15 17.5 L12 19 L9 17.5 Z" fill="#0E1116" />
            <path d="M9.8 14 L8.5 10 L4.5 11 L6 15 Z" fill="#0E1116" />
            <path d="M8.5 10 L9 5 L12 4 L12 7.5 Z" fill="#0E1116" />
            <path d="M8.5 10 L4.5 11 L5.5 7 L9 5 Z" fill="#0E1116" />
            <path d="M12 7.5 L15.5 10 L14.2 14 L9.8 14 L8.5 10 Z" fill="none" stroke="#F5F3EE" strokeWidth="0.6" />
            <circle cx="12" cy="12" r="10" fill="none" stroke="#0E1116" strokeWidth="1.2" />
          </svg>
          <div className="login-mark-text">
            <div className="login-title-1">WORLD CUP</div>
            <div className="login-title-2">'26</div>
          </div>
        </div>

        <div className="login-sub">Prediction Pool</div>

        {authError ? (
          <div className="login-access-denied">
            <div className="login-access-icon">🔒</div>
            <div className="login-access-msg">{authError}</div>
          </div>
        ) : sent ? (
          <div className="login-sent">
            <div className="login-sent-icon">✉️</div>
            <h2 className="login-sent-title">Check your inbox</h2>
            <p className="login-sent-body">
              We sent a magic sign-in link to <strong>{email}</strong>. Click
              it on any device to join the pool — no password needed.
            </p>
            <button
              className="login-resend-btn"
              onClick={() => setSent(false)}
              type="button"
            >
              Try a different email
            </button>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <p className="login-intro">
              Enter your email to receive a one-time sign-in link.
              No password required.
            </p>
            <label className="login-label" htmlFor="login-email">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              className="login-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
            />
            {error && <div className="login-error">{error}</div>}
            <button
              type="submit"
              className="login-btn"
              disabled={sending || !email.trim()}
            >
              {sending ? 'Sending…' : 'Send sign-in link →'}
            </button>
          </form>
        )}

        <div className="login-footer">
          Private prediction pool · FIFA World Cup 2026
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
