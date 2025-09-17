import { supabase } from '@/lib/supabase';

type SeedRole = 'user' | 'admin';

interface SeedAccount {
  email: string;
  password: string;
  name: string;
  role: SeedRole;
}

const emailRedirectTo = 'http://localhost:8080/login';

const seedAccounts: SeedAccount[] = [
  {
    email: 'demo.user@gmail.com',
    password: 'demouser123',
    name: 'Demo User',
    role: 'user',
  },
  {
    email: 'demo.admin@gmail.com',
    password: 'demoadmin123',
    name: 'Demo Admin',
    role: 'admin',
  },
  {
    email: 'sales@vamkor.com',
    password: 'pass123',
    name: 'PropAI Sales Admin',
    role: 'admin',
  },
];

async function ensureAccount(account: SeedAccount) {
  console.log(`\n▶ Ensuring account for ${account.email}`);

  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('email', account.email)
    .maybeSingle();

  if (fetchError) {
    console.error('  • Failed to check existing profile:', fetchError);
    return;
  }

  if (existingProfile) {
    console.log(`  • Profile already exists with role "${existingProfile.role}". Skipping.`);
    return;
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: account.email,
    password: account.password,
    options: {
      data: {
        name: account.name,
        role: account.role,
      },
      emailRedirectTo,
    },
  });

  if (signUpError) {
    console.error('  • Error creating auth user:', signUpError);
    return;
  }

  const userId = signUpData.user?.id;

  if (!userId) {
    console.warn('  • Sign up succeeded but returned no user id. Manual verification may be required.');
    return;
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      [
        {
          id: userId,
          email: account.email,
          name: account.name,
          role: account.role,
        },
      ],
      { onConflict: 'id' }
    );

  if (profileError) {
    if (profileError.code === '42501') {
      console.warn('  • Skipping profile insert due to RLS policy. Use Supabase Studio to set role if needed.');
    } else {
      console.error('  • Error creating profile record:', profileError);
    }
    return;
  }

  console.log('  • Account provisioned successfully.');
}

async function setupDemoAccounts() {
  try {
    for (const account of seedAccounts) {
      await ensureAccount(account);
    }

    console.log('\n✅ Demo accounts setup completed');
  } catch (error) {
    console.error('Unexpected error setting up demo accounts:', error);
  }
}

setupDemoAccounts();
