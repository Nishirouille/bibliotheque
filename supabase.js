const SUPABASE_URL = "https://hihjodtikgwomspiadea.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpaGpvZHRpa2d3b21zcGlhZGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2ODEzMDQsImV4cCI6MjA5MzI1NzMwNH0.tU21-ozXiYZsDhxTYT0hBGJxuDQnC9KQlqlT25GB1Ls";

const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);