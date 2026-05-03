document
    .getElementById("bookForm")
    .addEventListener("submit", async (e) => {
        e.preventDefault();

        const title =
            document.getElementById("title").value.trim();

        const authors =
            document.getElementById("authors").value.trim();

        const publisher =
            document.getElementById("publisher").value.trim();

        const isbn =
            document.getElementById("isbn").value.trim();

        const {
            data: { user }
        } = await client.auth.getUser();

        if (!user) {
            alert("Tu dois être connecté");
            return;
        }

        const { error } = await client
            .from("books")
            .insert({
                user_id: user.id,
                isbn: isbn || null,
                title,
                authors,
                publisher,
                thumbnail: null
            });

        if (error) {
            console.error(error);
            alert(error.message);
            return;
        }

        document.getElementById("message").textContent =
            "Livre ajouté !";

        document.getElementById("bookForm").reset();
    });