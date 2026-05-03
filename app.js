async function loadBooksFromDB() {
    const user = (await client.auth.getUser()).data.user;

    if (!user) return;

    const { data } = await client
        .from("books")
        .select("*")
        .order("created_at", { ascending: true });

    books = data || [];
    renderBooks();
}

async function updateAuthUI() {
    const {
        data: { user }
    } = await client.auth.getUser();

    const loginLink =
        document.getElementById("loginLink");

    if (!loginLink) return;
    
    if (user) {
        console.log(user);
        console.log(loginLink);
        console.log("Bloc exécuté");
        loginLink.textContent = "Déconnexion";
        loginLink.href = "#";

        loginLink.onclick = async () => {
            await client.auth.signOut();
            location.reload();
        };
    }
}

const STORAGE_KEY = "book_scanner_books";

let books = [];
let scannerRunning = false;

const startScannerBtn =
    document.getElementById("startScanner");

if (startScannerBtn) {
    startScannerBtn.addEventListener(
        "click",
        startScanner
    );
}

const exportBtn =
    document.getElementById("exportCSV");

if (exportBtn) {
    exportBtn.addEventListener(
        "click",
        exportCSV
    );
}

const searchBtn =
    document.getElementById("searchISBN");

if (searchBtn) {
    searchBtn.addEventListener(
        "click",
        manualSearch
    );
}

const sortSelect =
    document.getElementById("sortSelect");

if (sortSelect) {
    sortSelect.addEventListener(
        "change",
        renderBooks
    );
}


let lastScan = 0;

function startScanner() {
    if (scannerRunning) return;

    Quagga.init({
        inputStream: {
            type: "LiveStream",
            target: document.querySelector("#reader"),
            constraints: {
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 },
                focusMode: "continuous"
            }
        },
        locator: {
            patchSize: "medium",
            halfSample: true
        },
        numOfWorkers: 4,
        frequency: 10,
        decoder: {
            readers: [
                "ean_reader",
                "ean_8_reader",
                "upc_reader"
            ]
        },
        locate: true
    }, function(err) {
        if (err) {
            console.error(err);
            return;
        }

        Quagga.offDetected(handleDetection);
        Quagga.onDetected(handleDetection);

        Quagga.start();
        scannerRunning = true;
    });
}

function stopScanner() {
    if (!scannerRunning) return;

    Quagga.stop();
    scannerRunning = false;
}

async function handleDetection(result) {
    const now = Date.now();

    if (now - lastScan < 2000) return;
    lastScan = now;

    const isbn = cleanISBN(result.codeResult.code);
    console.log(result.codeResult.code);

    if (!isValidISBN(isbn)) return;

    stopScanner();
    await fetchBook(isbn);
    
}

async function manualSearch() {
    const input = document.getElementById("manualISBN");

    const isbn = cleanISBN(input.value);

    if (!isValidISBN(isbn)) {
        alert("ISBN invalide");
        return;
    }

    await fetchBook(isbn);

    input.value = "";
}

function cleanISBN(text) {
    return text.replace(/[^0-9]/g, "");
}

function isValidISBN(isbn) {
    if (
        isbn.length !== 13 ||
        (!isbn.startsWith("978") && !isbn.startsWith("979"))
    ) {
        return false;
    }

    let sum = 0;

    for (let i = 0; i < 12; i++) {
        const digit = parseInt(isbn[i], 10);
        sum += i % 2 === 0 ? digit : digit * 3;
    }

    const checkDigit = (10 - (sum % 10)) % 10;

    return checkDigit === parseInt(isbn[12], 10);
}

async function fetchBook(isbn) {
    const exists = books.find(book => book.isbn === isbn);

    if (exists) {
        alert("Livre déjà ajouté");
        return;
    }

    try {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
        );

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            alert("Livre introuvable");
            return;
        }

        const info = data.items[0].volumeInfo;

        const book = {
            isbn: isbn,
            title: info.title || "",
            authors: (info.authors || []).join(", "),
            publisher: info.publisher || "",
            thumbnail: info.imageLinks?.thumbnail || ""
        };

    const user = (await client.auth.getUser()).data.user;

    if (!user) {
        alert("Tu dois être connecté");
        return;
    }

    const { error } = await client
            .from("books")
            .insert({
                user_id: user.id,
                isbn: book.isbn,
                title: book.title,
                authors: book.authors,
                publisher: book.publisher,
                thumbnail: book.thumbnail
            });

        await loadBooksFromDB();

    } catch (error) {
        console.error(error);
    }
}

function renderBooks() {
    const list = document.getElementById("bookList");

    if (!list) return;

    list.innerHTML = "";

    const sortElement =
    document.getElementById("sortSelect");

    const sortMode =
        sortElement ? sortElement.value : "added";

    let sortedBooks = [...books];

    switch (sortMode) {
        case "title":
            sortedBooks.sort((a, b) =>
                a.title.localeCompare(b.title)
            );
            break;

        case "author":
            sortedBooks.sort((a, b) =>
                a.authors.localeCompare(b.authors)
            );
            break;

        case "publisher":
            sortedBooks.sort((a, b) =>
                a.publisher.localeCompare(b.publisher)
            );
            break;

        case "added":
        default:
            break;
    }

    sortedBooks.forEach(book => {
        const li = document.createElement("li");

        li.innerHTML = `
            <div>
                ${
                    book.thumbnail
                    ? `<img src="${book.thumbnail}" width="80">`
                    : ""
                }
                <div>
                    <strong>${book.title}</strong><br>
                    ${book.authors}<br>
                    ${book.publisher}
                </div>
            </div>
        `;

        list.appendChild(li);
    });
}

function exportCSV() {
    let csv = "isbn,titre,auteurs,editeur\n";

    books.forEach(book => {
        csv +=
            `"${book.isbn}","${book.title}","${book.authors}","${book.publisher}"\n`;
    });

    const blob = new Blob([csv], {
        type: "text/csv"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "livres.csv";
    a.click();

    URL.revokeObjectURL(url);
}

function saveBooks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function loadBooks() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

document.addEventListener("DOMContentLoaded", async () => {
    await updateAuthUI();
    await loadBooksFromDB();
});
