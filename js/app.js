// Bookverse App logic

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
    const readerText = document.getElementById('reader-text');
    const readerBookTitle = document.getElementById('reader-book-title');
    const increaseFont = document.getElementById('increase-font');
    const decreaseFont = document.getElementById('decrease-font');
    const readerThemeToggle = document.getElementById('reader-theme-toggle');
    const bookmarkBtn = document.getElementById('bookmark-btn');

    // Initialize
    init();

    async function init() {
        await loadBooks();
        renderBooks();
        setupEventListeners();
        checkPreferredTheme();
    }

    // Load books from JSON + LocalStorage
    async function loadBooks() {
        try {
            const response = await fetch('data/books.json');
            const data = await response.json();
            
            // Get books from localStorage added via Admin Panel
            const localBooks = JSON.parse(localStorage.getItem('bookverse_custom_books')) || [];
            
            state.books = [...data.books, ...localBooks];
        } catch (error) {
            console.error('Error loading books:', error);
            // Fallback to empty if error
            state.books = JSON.parse(localStorage.getItem('bookverse_custom_books')) || [];
        }
    }

    // Render Books Grid
    function renderBooks(category = 'All') {
        booksDisplay.innerHTML = '';
        
        let filteredBooks = state.books;
        if (category !== 'All') {
            filteredBooks = state.books.filter(book => book.category === category);
        }

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
            <img src="${book.cover}" alt="${book.title}" class="book-cover">
            <div class="book-info">
                <span class="category-tag">${book.category}</span>
                <h3>${book.title}</h3>
                <span class="author">By ${book.author}</span>
                <p>${book.description}</p>
                <button class="btn btn-read" data-id="${book.id}">Read Now</button>
            </div>
        `;

        div.querySelector('.btn-read').addEventListener('click', () => openReader(book));
        return div;
    }

    // Reader logic
    function openReader(book) {
        state.currentReadingBook = book;
        readerBookTitle.textContent = book.title;
        readerText.textContent = book.content;
        readerText.style.fontSize = `${state.readerFontSize}px`;
        readerView.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent scroll
        
        // Update bookmark icon
        updateBookmarkIcon(book.id);
    }

    function closeReaderView() {
        readerView.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    // Search logic
    function toggleSearch() {
        searchOverlay.style.display = searchOverlay.style.display === 'block' ? 'none' : 'block';
        if (searchOverlay.style.display === 'block') {
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

    // Theme logic
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

    // Bookmark logic
    function toggleBookmark() {
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
    }

    function updateBookmarkIcon(bookId) {
        if (state.bookmarks.includes(bookId)) {
            bookmarkBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
            bookmarkBtn.classList.add('active');
        } else {
            bookmarkBtn.innerHTML = '<i class="far fa-bookmark"></i>';
            bookmarkBtn.classList.remove('active');
        }
    }

    // Event Listeners
    function setupEventListeners() {
        // Category switching
        catTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                catTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderBooks(tab.dataset.category);
            });
        });

        // Moble menu (Simple)
        const mobileMenu = document.getElementById('mobile-menu');
        const navLinks = document.querySelector('.nav-links');
        if (mobileMenu) {
            mobileMenu.addEventListener('click', () => {
                navLinks.classList.toggle('mobile-active');
                mobileMenu.classList.toggle('is-active');
            });
        }

        // Search
        searchBtn.addEventListener('click', toggleSearch);
        closeSearch.addEventListener('click', toggleSearch);
        searchInput.addEventListener('input', handleSearch);

        // Theme
        themeToggle.addEventListener('click', toggleTheme);
        readerThemeToggle.addEventListener('click', toggleTheme);

        // Reader Controls
        closeReader.addEventListener('click', closeReaderView);
        increaseFont.addEventListener('click', () => {
            state.readerFontSize += 2;
            readerText.style.fontSize = `${state.readerFontSize}px`;
        });
        decreaseFont.addEventListener('click', () => {
            if (state.readerFontSize > 12) {
                state.readerFontSize -= 2;
                readerText.style.fontSize = `${state.readerFontSize}px`;
            }
        });
        bookmarkBtn.addEventListener('click', toggleBookmark);

        // Close search on Escape
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (searchOverlay.style.display === 'block') toggleSearch();
                if (!readerView.classList.contains('hidden')) closeReaderView();
            }
        });
    }
});
