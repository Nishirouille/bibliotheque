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
