import { supabase } from '@/lib/supabase';

async function setupDemoAccounts() {
  try {
    // First, check if the accounts already exist
    const { data: existingUsers } = await supabase
      .from('profiles')
      .select('email')
      .in('email', ['demo.user@gmail.com', 'demo.admin@gmail.com']);

    if (existingUsers && existingUsers.length > 0) {
      console.log('Demo accounts already exist');
      return;
    }

    // Create demo user account
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email: 'demo.user@gmail.com',
      password: 'demouser123',
      options: {
        data: {
          name: 'Demo User',
          role: 'user'
        },
        emailRedirectTo: 'http://localhost:8080/login'
      }
    });

    if (userError) {
      console.error('Error creating demo user:', userError);
    } else {
      console.log('Demo user created successfully:', userData);
      
      // Create user profile
      if (userData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userData.user.id,
              email: userData.user.email,
              name: 'Demo User',
              role: 'user'
            }
          ]);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        } else {
          console.log('User profile created successfully');
        }
      }
    }

    // Create demo admin account
    const { data: adminData, error: adminError } = await supabase.auth.signUp({
      email: 'demo.admin@gmail.com',
      password: 'demoadmin123',
      options: {
        data: {
          name: 'Demo Admin',
          role: 'admin'
        },
        emailRedirectTo: 'http://localhost:8080/login'
      }
    });

    if (adminError) {
      console.error('Error creating demo admin:', adminError);
    } else {
      console.log('Demo admin created successfully:', adminData);
      
      // Create admin profile
      if (adminData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: adminData.user.id,
              email: adminData.user.email,
              name: 'Demo Admin',
              role: 'admin'
            }
          ]);

        if (profileError) {
          console.error('Error creating admin profile:', profileError);
        } else {
          console.log('Admin profile created successfully');
        }
      }
    }

    console.log('Demo accounts setup completed');
  } catch (error) {
    console.error('Error setting up demo accounts:', error);
  }
}

setupDemoAccounts(); 
