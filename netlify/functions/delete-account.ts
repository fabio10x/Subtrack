import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Admin client: bypasses RLS and can delete users from auth.users
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Extract the user's JWT from the Authorization header to verify they are who they say they are
  const authHeader = event.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }
  const token = authHeader.replace('Bearer ', '');

  try {
    // Verify the JWT by getting the user from Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid or expired token' }) };
    }

    // Delete the user from Supabase Auth.
    // The cascade delete rules in schema.sql will automatically delete
    // their profile, subscriptions, and notifications.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      throw deleteError;
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Account deleted successfully' }),
    };
  } catch (error: any) {
    console.error('Account deletion error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
