// Bookverse App logic - Professionally Enhanced

document.addEventListener('DOMContentLoaded', () => {
    // State management
    let state = {
        books: [],
        currentCategory: 'All',
        searchTerm: '',
        isDarkMode: false,
        readerFontSize: 18,
        bookmarks: JSON.parse(localStorage.getItem('bookverse_bookmarks')) || []
    };

    // Elements
    const booksDisplay = document.getElementById('books-display');
    const catTabs = document.querySelectorAll('.cat-tab');
    const searchBtn = document.getElementById('search-btn');
    const searchOverlay = document.getElementById('search-overlay');
    const searchInput = document.getElementById('search-input');
    const closeSearch = document.getElementById('close-search');
    const searchResults = document.getElementById('search-results');
    const themeToggle = document.getElementById('theme-toggle');
    const readerView = document.getElementById('reader-view');
    const closeReader = document.getElementById('close-reader');
    const pdfFrame = document.getElementById('pdf-frame');
    const downloadBook = document.getElementById('download-book');
    const readerBookTitle = document.getElementById('reader-book-title');
    const readerThemeToggle = document.getElementById('reader-theme-toggle');
    const bookmarkBtn = document.getElementById('bookmark-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    // Initialize
    init();

    async function init() {
        await loadBooks();
        renderBooks();
        setupEventListeners();
        checkPreferredTheme();
    }

    async function loadBooks() {
        try {
            const response = await fetch('data/books.json');
            const data = await response.json();
            const localBooks = JSON.parse(localStorage.getItem('bookverse_custom_books')) || [];
            state.books = [...data.books, ...localBooks];
        } catch (error) {
            console.error('Error loading books:', error);
            state.books = JSON.parse(localStorage.getItem('bookverse_custom_books')) || [];
        }
    }

    function renderBooks(category = 'All') {
        booksDisplay.innerHTML = '';
        let filteredBooks = category === 'All' ? state.books : state.books.filter(book => book.category === category);

        if (filteredBooks.length === 0) {
            booksDisplay.innerHTML = '<p class="no-results">No books found in this category.</p>';
            return;
        }

        filteredBooks.forEach(book => {
            const bookCard = createBookCard(book);
            booksDisplay.appendChild(bookCard);
        });
    }

    function createBookCard(book) {
        const div = document.createElement('div');
        div.className = 'book-card animate-up';
        div.innerHTML = `
            <div class="book-cover-container">
                <img src="${book.cover}" alt="${book.title}" class="book-cover">
                <div class="card-overlay"></div>
            </div>
            <div class="book-info">
                <span class="category-tag">${book.category}</span>
                <h3>${book.title}</h3>
                <span class="author">By ${book.author}</span>
                <p>${book.description}</p>
                <button class="btn btn-primary btn-read" data-id="${book.id}">Read Now</button>
            </div>
        `;

        div.querySelector('.btn-read').addEventListener('click', () => openReader(book));
        return div;
    }

    function openReader(book) {
        state.currentReadingBook = book;
        readerBookTitle.textContent = book.title;

        // Handle PDF source
        // If it's a real PDF URL, we use it. If it's a placeholder search URL, we inform the user or just show it.
        pdfFrame.src = book.pdfUrl || '';
        downloadBook.href = book.pdfUrl || '#';

        readerView.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        updateBookmarkIcon(book.id);
    }

    function closeReaderView() {
        readerView.classList.add('hidden');
        pdfFrame.src = ''; // Stop any current loading
        document.body.style.overflow = 'auto';
    }

    function toggleSearch() {
        searchOverlay.style.display = searchOverlay.style.display === 'flex' ? 'none' : 'flex';
        if (searchOverlay.style.display === 'flex') {
            searchInput.focus();
        }
    }

    function handleSearch() {
        const query = searchInput.value.toLowerCase();
        if (!query) {
            searchResults.innerHTML = '';
            return;
        }

        const results = state.books.filter(book =>
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.category.toLowerCase().includes(query)
        );

        searchResults.innerHTML = '';
        results.forEach(book => {
            const card = createBookCard(book);
            searchResults.appendChild(card);
        });
    }

    function toggleTheme() {
        state.isDarkMode = !state.isDarkMode;
        applyTheme();
    }

    function applyTheme() {
        if (state.isDarkMode) {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('bookverse_theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('bookverse_theme', 'light');
        }
    }

    function checkPreferredTheme() {
        const savedTheme = localStorage.getItem('bookverse_theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            state.isDarkMode = true;
            applyTheme();
        }
    }

    function updateBookmarkIcon(bookId) {
        const isBookmarked = state.bookmarks.includes(bookId);
        bookmarkBtn.innerHTML = isBookmarked ? '<i class="fas fa-bookmark"></i>' : '<i class="far fa-bookmark"></i>';
        bookmarkBtn.classList.toggle('active', isBookmarked);
    }

    function setupEventListeners() {
        catTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                catTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderBooks(tab.dataset.category);

                // On mobile, if choosing a category, close the menu if open
                if (window.innerWidth < 768) {
                    navLinks.classList.remove('mobile-active');
                }
            });
        });

        if (mobileMenu) {
            mobileMenu.addEventListener('click', () => {
                navLinks.classList.toggle('mobile-active');
                mobileMenu.classList.toggle('is-active');
            });
        }

        searchBtn.addEventListener('click', toggleSearch);
        closeSearch.addEventListener('click', toggleSearch);
        searchInput.addEventListener('input', handleSearch);
        themeToggle.addEventListener('click', toggleTheme);
        readerThemeToggle.addEventListener('click', toggleTheme);
        closeReader.addEventListener('click', closeReaderView);

        bookmarkBtn.addEventListener('click', () => {
            if (!state.currentReadingBook) return;
            const bookId = state.currentReadingBook.id;
            const index = state.bookmarks.indexOf(bookId);
            if (index === -1) {
                state.bookmarks.push(bookId);
            } else {
                state.bookmarks.splice(index, 1);
            }
            localStorage.setItem('bookverse_bookmarks', JSON.stringify(state.bookmarks));
            updateBookmarkIcon(bookId);
        });

        // Close modal on Escape
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (searchOverlay.style.display === 'flex') toggleSearch();
                if (!readerView.classList.contains('hidden')) closeReaderView();
            }
        });
    }
});
