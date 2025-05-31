import { signUp } from './supabaseAuth';

export const createDefaultMentor = async () => {
  try {
    const { user } = await signUp('mentor', '679687021', {
      name: 'Default Mentor',
      role: 'mentor',
      username: 'mentor'
    });
    
    console.log('Default mentor account created:', user);
    return user;
  } catch (error) {
    console.error('Error creating default mentor:', error);
    throw error;
  }
}; 