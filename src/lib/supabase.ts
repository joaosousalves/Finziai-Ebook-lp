import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwfupcztrbhwxlpsgbfw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZnVwY3p0cmJod3hscHNnYmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1NTc4NjUsImV4cCI6MjA1MjEzMzg2NX0.JwoGFRdel70Fd06bzHzsVotOfHWmczSFWlIsdeztuBI';

export const supabase = createClient(supabaseUrl, supabaseKey);