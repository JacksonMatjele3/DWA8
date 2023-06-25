// Encapsulated Abstraction of Code using a Single Function

function encapsulatedCode() {
    // Import data from './data.js'
    const data = require('./data.json');
    const books = data.books;
    const authors = data.authors;
    const genres = data.genres;
    const BOOKS_PER_PAGE = data.BOOKS_PER_PAGE;
  
    // Class representing the Book App
    class BookApp {
      constructor() {
        this.page = 1;
        this.matches = books;
        this.authors = authors;
      }
  
      // Initialize the Book App
      init() {
        this.setupPreviewItems();
        this.setupGenreOptions();
        this.setupAuthorOptions();
        this.setupTheme();
        this.setupCancelButton('[data-search-cancel]', '[data-search-overlay]');
        this.setupCancelButton('[data-settings-cancel]', '[data-settings-overlay]');
        this.setupSearchButton();
        this.setupSettingsForm();
        this.setupListButton();
        this.setupListItems();
      }
  
      // Set up the functionality for the book preview items
      setupPreviewItems() {
        const starting = document.createDocumentFragment();
  
        for (const { author, id, image, title } of this.matches.slice(0, BOOKS_PER_PAGE)) {
          const bookObj = new Book({ author, id, image, title });
          const element = bookObj.createElement();
          starting.appendChild(element);
        }
  
        document.querySelector('[data-list-items]').appendChild(starting);
      }
  
      // Set up the genre options in the search form
      setupGenreOptions() {
        const genreHtml = document.createDocumentFragment();
        const firstGenreElement = document.createElement('option');
        firstGenreElement.value = 'any';
        firstGenreElement.innerText = 'All Genres';
        genreHtml.appendChild(firstGenreElement);
  
        for (const [id, name] of Object.entries(genres)) {
          const element = document.createElement('option');
          element.value = id;
          element.innerText = name;
          genreHtml.appendChild(element);
        }
  
        document.querySelector('[data-search-genres]').appendChild(genreHtml);
      }
  
      // Set up the author options in the search form
      setupAuthorOptions() {
        const authorsHtml = document.createDocumentFragment();
        const firstAuthorElement = document.createElement('option');
        firstAuthorElement.value = 'any';
        firstAuthorElement.innerText = 'All Authors';
        authorsHtml.appendChild(firstAuthorElement);
  
        for (const [id, name] of Object.entries(this.authors)) {
          const element = document.createElement('option');
          element.value = id;
          element.innerText = name;
          authorsHtml.appendChild(element);
        }
  
        document.querySelector('[data-search-authors]').appendChild(authorsHtml);
      }
  
      // Set up the theme based on user preference
      setupTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          this.setTheme('--color-dark', '255, 255, 255');
          this.setTheme('--color-light', '10, 10, 20');
          document.querySelector('[data-settings-theme]').value = 'night';
        } else {
          this.setTheme('--color-dark', '10, 10, 20');
          this.setTheme('--color-light', '255, 255, 255');
          document.querySelector('[data-settings-theme]').value = 'day';
        }
      }
  
      // Set up the functionality for the cancel button in the overlay
      setupCancelButton(cancelButtonSelector, overlaySelector) {
        document.querySelector(cancelButtonSelector).addEventListener('click', () => {
          document.querySelector(overlaySelector).open = false;
        });
      }
  
      // Set up the search button functionality in the search form
      setupSearchButton() {
        document.querySelector('[data-header-search]').addEventListener('click', () => {
          document.querySelector('[data-search-overlay]').open = true;
          document.querySelector('[data-search-title]').focus();
        });
      }
  
      // Set up the functionality for the settings form
      setupSettingsForm() {
        document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
          event.preventDefault();
          const formData = new FormData(event.target);
          const { theme } = Object.fromEntries(formData);
  
          if (theme === 'night') {
            this.setTheme('--color-dark', '255, 255, 255');
            this.setTheme('--color-light', '10, 10, 20');
          } else {
            this.setTheme('--color-dark', '10, 10, 20');
            this.setTheme('--color-light', '255, 255, 255');
          }
  
          document.querySelector('[data-settings-overlay]').open = false;
        });
      }
  
      // Set up the functionality for the list button
      setupListButton() {
        const remainingBooks = this.matches.length - this.page * BOOKS_PER_PAGE;
        const listButton = document.querySelector('[data-list-button]');
        listButton.innerText = `Show more (${remainingBooks})`;
        listButton.disabled = remainingBooks <= 0;
  
        listButton.innerHTML = `
          <span>Show more</span>
          <span class="list__remaining"> (${remainingBooks > 0 ? remainingBooks : 0})</span>
        `;
  
        listButton.addEventListener('click', () => {
          const fragment = document.createDocumentFragment();
  
          for (const { author, id, image, title } of this.matches.slice(
            this.page * BOOKS_PER_PAGE,
            (this.page + 1) * BOOKS_PER_PAGE
          )) {
            const bookObj = new Book({ author, id, image, title });
            const element = bookObj.createElement();
            fragment.appendChild(element);
          }
  
          document.querySelector('[data-list-items]').appendChild(fragment);
          this.page += 1;
        });
      }
  
      // Set up the functionality for the list items
      setupListItems() {
        document.querySelector('[data-list-items]').addEventListener('click', (event) => {
          const pathArray = Array.from(event.path || event.composedPath());
          let active = null;
  
          for (const node of pathArray) {
            if (active) break;
  
            if (node?.dataset?.preview) {
              let result = null;
  
              for (const singleBook of books) {
                if (result) break;
                if (singleBook.id === node?.dataset?.preview) result = singleBook;
              }
  
              active = result;
            }
          }
  
          if (active) {
            document.querySelector('[data-list-active]').open = true;
            document.querySelector('[data-list-blur]').src = active.image;
            document.querySelector('[data-list-image]').src = active.image;
            document.querySelector('[data-list-title]').innerText = active.title;
            document.querySelector('[data-list-subtitle]').innerText = `${this.authors[active.author]} (${new Date(
              active.published
            ).getFullYear()})`;
            document.querySelector('[data-list-description]').innerText = active.description;
          }
        });
      }
  
      // Set the theme by updating CSS variables
      setTheme(variable, value) {
        document.documentElement.style.setProperty(variable, value);
      }
    }
  
    // Class representing a Book
    class Book {
      constructor({ author, id, image, title }) {
        this.author = author;
        this.id = id;
        this.image = image;
        this.title = title;
      }
  
      // Create the book element
      createElement() {
        const element = document.createElement('button');
        element.classList = 'preview';
        element.setAttribute('data-preview', this.id);
  
        element.innerHTML = `
          <img
            class="preview__image"
            src="${this.image}"
          />
          
          <div class="preview__details">
            <h2 class="preview__title">${this.title}</h2>
            <p class="preview__author">${this.author}</p>
          </div>
        `;
  
        return element;
      }
    }
  
    // Create an instance of the Book App and initialize it
    const app = new BookApp();
    app.init();
  }
  
  // Call the encapsulatedCode function
  encapsulatedCode();
  