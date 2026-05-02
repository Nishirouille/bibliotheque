const SUPABASE_URL = "https://hihjodtikgwomspiadea.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpaGpvZHRpa2d3b21zcGlhZGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2ODEzMDQsImV4cCI6MjA5MzI1NzMwNH0.tU21-ozXiYZsDhxTYT0hBGJxuDQnC9KQlqlT25GB1Ls";

const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

document.getElementById("loginForm")
.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value.trim();

    const errorMsg =
        document.getElementById("errorMsg");

    const { error } =
        await client.auth.signInWithPassword({
            email,
            password,
            options: {
                emailRedirectTo:
                    "file:///c%3A/Users/loisj/Desktop/site%20biblio/index.html"
            }
        });

    if (error) {
        errorMsg.textContent = error.message;
        return;
    }

    window.location.href = "index.html";
});

document.getElementById("signupBtn")
.addEventListener("click", async () => {
    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value.trim();

    const errorMsg =
        document.getElementById("errorMsg");

    const { error } =
        await client.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo:
                    "file:///c%3A/Users/loisj/Desktop/site%20biblio/index.html"
            }
        });

    if (error) {
        errorMsg.textContent = error.message;
        return;
    }

    alert("Compte créé");
});