import { supabase } from '../lib/supabaseClient'

export type AuthError = {
  message: string;
}

export const signIn = async (email: string, password: string) => {
  // Check if input is email or username
  const isEmail = email.includes('@');
  
  try {
    let data, error;
    
    if (isEmail) {
      // Login with email
      ({ data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      }));
    } else {
      // Login with username
      ({ data, error } = await supabase.auth.signInWithPassword({
        email: `${email}@skillspring.com`, // Convert username to email
        password,
      }));
    }
  
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export const signUp = async (email: string, password: string, metadata = {}) => {
  // Check if input is email or username
  const isEmail = email.includes('@');
  const actualEmail = isEmail ? email : `${email}@skillspring.com`;

  const { data, error } = await supabase.auth.signUp({
    email: actualEmail,
    password,
    options: {
      data: {
        ...metadata,
        username: isEmail ? email.split('@')[0] : email,
      },
    },
  });
  
  if (error) throw error;
  return data;
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export const onAuthStateChange = (callback: (event: 'SIGNED_IN' | 'SIGNED_OUT', session: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event as 'SIGNED_IN' | 'SIGNED_OUT', session);
  });
} 