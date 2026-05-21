import { useState } from 'react';
import { supabase } from '../supabaseClient.js';

function Auth() {
  const [mode, setMode] = useState('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignUp = mode === 'sign-up';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    const authAction = isSignUp
      ? supabase.auth.signUp({ email, password })
      : supabase.auth.signInWithPassword({ email, password });

    const { error } = await authAction;

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(isSignUp ? 'Check your email to confirm your account.' : 'Signed in.');
      if (isSignUp) {
        setPassword('');
      }
    }

    setIsSubmitting(false);
  };

  return (
    <section className="auth-card" aria-label="Authentication form">
      <div className="mode-switch" role="tablist" aria-label="Authentication mode">
        <button
          type="button"
          className={mode === 'sign-in' ? 'active' : ''}
          onClick={() => setMode('sign-in')}
        >
          Sign in
        </button>
        <button
          type="button"
          className={mode === 'sign-up' ? 'active' : ''}
          onClick={() => setMode('sign-up')}
        >
          Sign up
        </button>
      </div>

      <form className="stack" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@campus.edu"
            autoComplete="email"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            minLength={6}
            required
          />
        </label>

        <button type="submit" className="button button--primary" disabled={isSubmitting}>
          {isSubmitting ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
        </button>
      </form>

      {message ? <p className="form-message">{message}</p> : null}
    </section>
  );
}

export default Auth;
