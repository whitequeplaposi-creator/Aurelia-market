// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pymtloyqohxpvlzmvqfy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5bXRsb3lxb2h4cHZsem12cWZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNTMzMDAsImV4cCI6MjA4MTYyOTMwMH0.rQ4TAggZnCzjj0wGUeCw15l9missNpL1Txm8cMOE9wc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can connect
    const { data, error } = await supabase
      .from('products')
      .select('count');
    
    if (error) {
      console.error('❌ Error:', error.message);
      console.error('Details:', error);
      
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('\n⚠️  Tabellen "products" finns inte!');
        console.log('Du måste köra schema.sql i Supabase först.');
        console.log('Gå till: https://supabase.com/dashboard/project/pymtloyqohxpvlzmvqfy/editor');
      }
    } else {
      console.log('✅ Supabase connection works!');
      console.log('Data:', data);
    }
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

testConnection();
