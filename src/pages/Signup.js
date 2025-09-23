import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function Signup() {
  const [invite, setInvite] = useState(null);
  const [localBodyName, setLocalBodyName] = useState('');
  const [localBodyType, setLocalBodyType] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invite');
    if (!token) {
      setError('No invite token in URL');
      return;
    }
    supabase
      .from('invites')
      .select('*, role')
      .eq('token', token)
      .then(async ({ data, error }) => {
        if (error || !data || data.length === 0) {
          setError('Invite token not found or error');
        } else {
          setInvite(data[0]);
          // Fetch local body name and type
          const { data: lbData, error: lbError } = await supabase
            .from('local_body')
            .select('local_body_name_en, local_body_type(type_name_en)')
            .eq('local_body_id', data[0].local_body_id)
            .single();
          if (!lbError && lbData) {
            setLocalBodyName(lbData.local_body_name_en);
            setLocalBodyType(lbData.local_body_type?.type_name_en || '');
          }
        }
      });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!invite) {
      setError('No valid invite.');
      return;
    }
    if (!password || !confirmPassword) {
      setError('Please enter and confirm your password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    // Use Supabase Auth to sign up
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: invite.email,
      password
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    // Mark invite as used
    await supabase.from('invites').update({ used: true }).eq('token', invite.token);
    // Insert into profiles table
    if (data && data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        local_body_id: invite.local_body_id,
        role: invite.role || 'user'
      });
    }
    setSuccess('Signup successful! Please check your email to confirm your account.');
    setLoading(false);
  }

  if (!invite) return <div style={{ margin: 24 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 12, background: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Sign up for Local Body Admin</h2>
      {error && <div style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>{error}</div>}
      <div style={{ marginBottom: 8, textAlign: 'center', color: '#1976d2', fontWeight: 500 }}>
        Email: <span style={{ fontWeight: 700 }}>{invite.email}</span>
      </div>
      <div style={{ marginBottom: 16, textAlign: 'center', color: '#388e3c', fontWeight: 500 }}>
        Access to Local Body: <span style={{ fontWeight: 700 }}>{localBodyName || invite.local_body_id}</span>
        {localBodyType && (
          <span style={{ color: '#555', fontWeight: 400 }}> ({localBodyType})</span>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => {
              setConfirmPassword(e.target.value);
              if (error) setError('');
            }}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            required
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      {success && <div style={{ color: 'green', marginTop: 16 }}>{success}</div>}
    </div>
  );
}

export default Signup;
