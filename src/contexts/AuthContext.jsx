import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { configByEmail } from '../lib/participants.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession]     = useState(undefined); // undefined = loading
  const [profile, setProfile]     = useState(null);
  const [authError, setAuthError] = useState(null);

  // Load profile from Supabase profiles table, creating it if this is first login
  async function loadOrCreateProfile(user) {
    if (!user) { setProfile(null); return; }

    // Try to fetch existing profile
    const { data: existing, error: fetchErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchErr && fetchErr.code !== 'PGRST116') {
      // PGRST116 = row not found (expected on first login); anything else is a real error
      console.error('Profile fetch error:', fetchErr);
      setAuthError(`Setup error: ${fetchErr.message}. Make sure the database schema has been created in Supabase.`);
      return;
    }

    if (existing) {
      setProfile(existing);
      return;
    }

    // First login — look up config by email
    const cfg = configByEmail(user.email);
    if (!cfg) {
      setAuthError(
        `${user.email} is not on the participants list. ` +
        'Ask the pool admin to add your email in participants.js.'
      );
      await supabase.auth.signOut();
      return;
    }

    // Create profile — strip email (not stored in profiles table)
    const { email: _email, ...profileData } = cfg;
    const { data: created, error: insertErr } = await supabase
      .from('profiles')
      .insert({ id: user.id, ...profileData })
      .select()
      .single();

    if (insertErr) {
      console.error('Profile insert error:', insertErr);
      setAuthError(`Could not create your profile: ${insertErr.message}`);
    } else {
      setProfile(created);
    }
  }

  useEffect(() => {
    // Subscribe first so we don't miss any events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setAuthError(null);
        loadOrCreateProfile(session?.user ?? null);
      }
    );

    // Handle PKCE magic link — URL contains ?code= after redirect
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        // Clean the code out of the URL bar
        window.history.replaceState({}, '', window.location.pathname);
        if (error) setAuthError(error.message);
        // onAuthStateChange fires automatically after successful exchange
      });
    } else {
      // No code — check for an existing session (page refresh etc.)
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        loadOrCreateProfile(session?.user ?? null);
      });
    }

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ session, profile, authError, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
