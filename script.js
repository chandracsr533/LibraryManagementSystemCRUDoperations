
const bookForm = document.getElementById("bookForm");
const bookId = document.getElementById("bookId");
const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const isbnInput = document.getElementById("isbn");
const yearInput = document.getElementById("year");

const tableBody = document.getElementById("bookTableBody");
const searchInput = document.getElementById("searchInput");
const bookCount = document.getElementById("bookCount");
const emptyMessage = document.getElementById("emptyMessage");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");

const STORAGE_KEY = "libraryBooks";

// READ: Load books from localStorage
function getBooks() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        const books = data ? JSON.parse(data) : [];

        return Array.isArray(books) ? books : [];
    } catch (error) {
        console.error("Could not load books:", error);
        return [];
    }
}

let books = getBooks();

// Save books to localStorage
function saveBooks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
        return true;
    } catch (error) {
        alert("Unable to save data. Check your browser storage.");
        console.error(error);
        return false;
    }
}

// READ: Display books in the table
function displayBooks() {
    const searchText = searchInput.value.trim().toLowerCase();

    const filteredBooks = books.filter(book =>
        [book.title, book.author, book.isbn].some(value =>
            String(value).toLowerCase().includes(searchText)
        )
    );

    tableBody.replaceChildren();

    filteredBooks.forEach(book => {
        const row = document.createElement("tr");

        function addCell(value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        }

        addCell(book.id);
        addCell(book.title);
        addCell(book.author);
        addCell(book.isbn);
        addCell(book.year);

        const actionsCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";
        editButton.dataset.action = "edit";
        editButton.dataset.id = book.id;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = book.id;

        actionsCell.append(editButton, deleteButton);
        row.appendChild(actionsCell);
        tableBody.appendChild(row);
    });

    bookCount.textContent =
        `Total Books: ${books.length} | Showing: ${filteredBooks.length}`;

    emptyMessage.hidden = filteredBooks.length > 0;
}

// CREATE and UPDATE: Handle form submission
bookForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const isbn = isbnInput.value.trim();
    const year = Number(yearInput.value);
    const editingId = bookId.value;

    if (!title || !author || !isbn || !year ||
        year < 1 || year > 9999 || !Number.isInteger(year)) {
        alert("Please enter valid book details.");
        return;
    }

    // Prevent duplicate ISBNs
    const duplicate = books.some(book =>
        book.isbn.toLowerCase() === isbn.toLowerCase() &&
        String(book.id) !== editingId
    );

    if (duplicate) {
        alert("A book with this ISBN already exists.");
        return;
    }

    if (editingId) {
        // UPDATE existing book
        const index = books.findIndex(
            book => String(book.id) === editingId
        );

        if (index === -1) {
            alert("Book not found.");
            return;
        }

        const updatedBooks = [...books];
        updatedBooks[index] = {
            ...updatedBooks[index],
            title,
            author,
            isbn,
            year
        };

        const previousBooks = books;
        books = updatedBooks;

        if (!saveBooks()) {
            books = previousBooks;
            return;
        }

        alert("Book updated successfully!");
    } else {
        // CREATE new book
        const newBook = {
            id: String(Date.now()) + "-" +
                Math.random().toString(36).slice(2, 8),
            title,
            author,
            isbn,
            year
        };

        books.push(newBook);

        if (!saveBooks()) {
            books.pop();
            return;
        }

        alert("Book added successfully!");
    }

    resetForm();
    displayBooks();
});

// Load book details into the form for editing
function editBook(id) {
    const book = books.find(book => String(book.id) === id);

    if (!book) return;

    bookId.value = book.id;
    titleInput.value = book.title;
    authorInput.value = book.author;
    isbnInput.value = book.isbn;
    yearInput.value = book.year;

    formTitle.textContent = "Update Book";
    submitBtn.textContent = "Update Book";
    cancelBtn.hidden = false;

    document.querySelector(".book-form").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// DELETE: Remove a book
function deleteBook(id) {
    const book = books.find(book => String(book.id) === id);

    if (!book) return;

    if (!confirm(`Delete "${book.title}" from the library?`)) {
        return;
    }

    const previousBooks = books;
    books = books.filter(book => String(book.id) !== id);

    if (!saveBooks()) {
        books = previousBooks;
        return;
    }

    if (bookId.value === id) {
        resetForm();
    }

    displayBooks();
}

// Handle Edit and Delete button clicks
tableBody.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;

    if (button.dataset.action === "edit") {
        editBook(id);
    } else if (button.dataset.action === "delete") {
        deleteBook(id);
    }
});

// Reset the form
function resetForm() {
    bookForm.reset();
    bookId.value = "";

    formTitle.textContent = "Add New Book";
    submitBtn.textContent = "Add Book";
    cancelBtn.hidden = true;
}

// Cancel editing
cancelBtn.addEventListener("click", resetForm);

// Search books
searchInput.addEventListener("input", displayBooks);

// Initial display
displayBooks();
