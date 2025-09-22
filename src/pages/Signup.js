import React, { useEffect } from 'react';
import { supabase } from '../supabaseClient';

function Signup() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invite');
    if (!token) {
      console.log('No invite token in URL');
      return;
    }
    supabase
      .from('invites')
      .select('*')
      .eq('token', token)
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          console.log('Invite token not found or error:', error);
        } else {
          console.log('Invite row:', data[0]);
        }
      });
  }, []);
  return null;
}

export default Signup;
