const bookForm = document.getElementById('book-form');
const incompleteBookList = document.getElementById('incomplete-book-list');
const completeBookList = document.getElementById('complete-book-list');
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
const confirmDelete = document.getElementById('confirmDelete');
const searchInput = document.getElementById('search-input');

const books = [];
const RENDER_EVENT = 'render-book';
const STORAGE_KEY = 'BOOKS_APPS';
let bookToDelete = null;
const generateId = () => +new Date();

const generateBookObject = (title, author, year, isComplete) => {
	return {
		id: generateId(),
		title,
		author,
		year,
		isComplete,
	};
};

document.addEventListener('DOMContentLoaded', () => {
	bookForm.addEventListener('submit', (e) => {
		e.preventDefault();
		addBook();
		bookForm.reset();
	});

	if (isStorageExists()) {
		loadBooksFromStorage();
	}
});

searchInput.addEventListener('input', (e) => {
	const title = e.target.value.trim();

	if (title !== '') {
		renderBooks(searchBook(title));
	} else {
		renderBooks(books);
	}
});

document.addEventListener(RENDER_EVENT, () => {
	renderBooks(books);
});

const renderBooks = (bookList = books) => {
	incompleteBookList.innerHTML = '';
	completeBookList.innerHTML = '';

	for (const bookItem of bookList) {
		const bookElement = createBookElement(bookItem);
		if (!bookItem.isComplete) {
			incompleteBookList.append(bookElement);
		} else {
			completeBookList.append(bookElement);
		}
	}
};

const addBook = () => {
	const title = document.getElementById('title').value;
	const author = document.getElementById('author').value;
	const year = parseInt(document.getElementById('year').value);
	const isComplete = document.getElementById('isComplete').checked;

	const newBook = generateBookObject(title, author, year, isComplete);
	books.push(newBook);

	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
};

const createBookElement = (bookObject) => {
	const container = document.createElement('li');
	container.classList.add('list-group-item');

	const bookItemGroup = document.createElement('div');
	bookItemGroup.classList.add('row', 'align-items-center');

	const bookTitleSpan = document.createElement('span');
	bookTitleSpan.classList.add('col-xl-8');
	bookTitleSpan.innerText = `${bookObject.title} (${bookObject.author}, ${bookObject.year})`;

	const toggleButton = document.createElement('button');

	if (bookObject.isComplete) {
		toggleButton.classList.add('btn', 'btn-secondary');
		toggleButton.innerText = 'Belum';
	} else {
		toggleButton.classList.add('btn', 'btn-success');
		toggleButton.innerText = 'Selesai';
	}

	toggleButton.addEventListener('click', () => toggleBookCompletion(bookObject.id));

	const deleteButton = document.createElement('button');
	deleteButton.classList.add('btn', 'btn-danger');
	deleteButton.innerHTML = '<i class="bi bi-trash-fill"></i>';

	deleteButton.addEventListener('click', () => openDeleteModal(bookObject.id));

	const buttonGroup = document.createElement('div');
	buttonGroup.classList.add('col-xl-4', 'd-flex', 'gap-4');

	buttonGroup.append(toggleButton, deleteButton);
	bookItemGroup.append(bookTitleSpan, buttonGroup);
	container.append(bookItemGroup);

	return container;
};

const toggleBookCompletion = (bookId) => {
	const book = books.find((book) => book.id === bookId);
	book.isComplete = !book.isComplete;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
};

const deleteBook = (bookId) => {
	const bookIndex = books.findIndex((book) => book.id === bookId);
	books.splice(bookIndex, 1);
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
};

const openDeleteModal = (bookId) => {
	bookToDelete = bookId;
	deleteModal.show();
};

confirmDelete.addEventListener('click', () => {
	deleteBook(bookToDelete);
	deleteModal.hide();
});

const isStorageExists = () => {
	if (typeof Storage === 'undefined') {
		alert('Browser kamu tidak mendukung local storage');
		return false;
	}
	return true;
};

const saveData = () => {
	if (isStorageExists()) {
		const parsed = JSON.stringify(books);
		localStorage.setItem(STORAGE_KEY, parsed);
	}
};

const loadBooksFromStorage = () => {
	const serializedData = localStorage.getItem(STORAGE_KEY);
	let data = JSON.parse(serializedData);
	if (data !== null) {
		for (const book of data) {
			books.push(book);
		}
	}
	document.dispatchEvent(new Event(RENDER_EVENT));
};

const searchBook = (title) => {
	return books.filter((book) => {
		return book.title.toLowerCase().includes(title.toLowerCase());
	});
};
