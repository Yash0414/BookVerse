// Admin Panel Logic

document.addEventListener('DOMContentLoaded', () => {
    const addBookForm = document.getElementById('add-book-form');
    const addedBooksContainer = document.getElementById('added-books-container');
    const downloadJsonBtn = document.getElementById('download-json');

    let customBooks = JSON.parse(localStorage.getItem('bookverse_custom_books')) || [];

    // Render initial list
    renderCustomBooks();

    // Handle form submission
    addBookForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newBook = {
            id: Date.now(), // Unique ID
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            category: document.getElementById('category').value,
            cover: document.getElementById('cover').value,
            pdfUrl: document.getElementById('pdfUrl').value,
            description: document.getElementById('description').value,
            content: document.getElementById('content').value
        };

        customBooks.push(newBook);
        localStorage.setItem('bookverse_custom_books', JSON.stringify(customBooks));

        alert('Book added successfully!');
        addBookForm.reset();
        renderCustomBooks();
    });

    function renderCustomBooks() {
        addedBooksContainer.innerHTML = '';

        if (customBooks.length === 0) {
            addedBooksContainer.innerHTML = '<p style="color: grey; text-align: center; margin-top: 1rem;">No custom books added yet.</p>';
            return;
        }

        customBooks.forEach(book => {
            const div = document.createElement('div');
            div.className = 'book-item';
            div.innerHTML = `
                <div class="book-item-info">
                    <h4>${book.title}</h4>
                    <span>${book.category} | ${book.author}</span>
                </div>
                <div class="delete-btn" onclick="deleteBook(${book.id})">
                    <i class="fas fa-trash"></i>
                </div>
            `;
            addedBooksContainer.appendChild(div);
        });
    }

    // Global delete function
    window.deleteBook = (id) => {
        if (confirm('Are you sure you want to delete this book?')) {
            customBooks = customBooks.filter(book => book.id !== id);
            localStorage.setItem('bookverse_custom_books', JSON.stringify(customBooks));
            renderCustomBooks();
        }
    };

    // Download JSON functionality
    downloadJsonBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('../data/books.json');
            const originalData = await response.json();

            const fullData = {
                books: [...originalData.books, ...customBooks]
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullData, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "books.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        } catch (error) {
            console.error('Error downloading JSON:', error);
            alert('Error creating JSON file.');
        }
    });

    // Theme support in admin
    const savedTheme = localStorage.getItem('bookverse_theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }
});
