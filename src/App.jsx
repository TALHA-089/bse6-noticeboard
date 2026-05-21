import { useEffect, useState } from 'react';
import Auth from './components/Auth.jsx';
import NoticeBoard from './components/NoticeBoard.jsx';
import { supabase } from './supabaseClient.js';

function App() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error('Error loading session:', error.message);
      }

      setSession(data.session);
      setLoadingSession(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoadingSession(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">BSE6 Campus</p>
          <h1>Notice Board</h1>
        </div>

        <div className="account-panel">
          {loadingSession ? <span>Checking session...</span> : null}

          {!loadingSession && session ? (
            <>
              <span>Signed in as {session.user.email}</span>
              <button type="button" className="button button--ghost" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : null}

          {!loadingSession && !session ? (
            <>
              <span>Viewing as guest</span>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => document.getElementById('sign-in')?.scrollIntoView()}
              >
                Sign in
              </button>
            </>
          ) : null}
        </div>
      </header>

      <NoticeBoard
        session={session}
        authPanel={
          !loadingSession && !session ? (
            <div id="sign-in">
              <Auth />
            </div>
          ) : null
        }
        authFallback={
          loadingSession ? (
            <section className="auth-card">
              <p className="eyebrow">Session</p>
              <h2>Checking sign-in...</h2>
            </section>
          ) : null
        }
      />
    </main>
  );
}

export default App;
