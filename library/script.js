document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchType = document.getElementById('searchType');
    
    // Check for query in URL and perform search if present
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    const type = urlParams.get('type') || 'all';

    if (query) {
        searchInput.value = query;
        searchType.value = type;
        performSearch(query, type);
    }

    // Add event listener for the Search button
    searchButton.addEventListener('click', () => {
        const query = searchInput.value;
        const type = searchType.value;
        if (query) {
            performSearch(query, type);
        }
    });

    // Add event listener for Enter key in the search input
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const query = searchInput.value;
            const type = searchType.value;
            if (query) {
                performSearch(query, type);
            }
        }
    });
});

function performSearch(query, type) {
    // Create the search query based on the selected type
    let searchUrl = '';
    switch (type) {
        case 'author':
            searchUrl = `https://openlibrary.org/search.json?author=${encodeURIComponent(query)}`;
            break;
        case 'title':
            searchUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}`;
            break;
        case 'publisher':
            searchUrl = `https://openlibrary.org/search.json?publisher=${encodeURIComponent(query)}`;
            break;
        case 'isbn':
            searchUrl = `https://openlibrary.org/search.json?isbn=${encodeURIComponent(query)}`;
            break;
        case 'language':
            searchUrl = `https://openlibrary.org/search.json?language=${encodeURIComponent(query)}`;
            break;
        case 'year':
            searchUrl = `https://openlibrary.org/search.json?publish_year=${encodeURIComponent(query)}`;
            break;
        default:
            searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;
            break;
    }

    // Update the URL with the query and type parameters
    const newUrl = `${window.location.pathname}?q=${encodeURIComponent(query)}&type=${type}`;
    window.history.replaceState({}, '', newUrl);

    // Show loading icon
    document.getElementById('loading').style.display = 'block';
    document.getElementById('noResults').style.display = 'none';
    document.getElementById('results').style.display = 'none';

    // Fetch search results based on the query and type
    fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
            document.getElementById('loading').style.display = 'none';

            if (data.docs.length === 0) {
                document.getElementById('noResults').style.display = 'block';
                document.getElementById('results').innerHTML = ''; // Clear previous results
            } else {
                document.getElementById('noResults').style.display = 'none';
                displayResults(data.docs, query);
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            document.getElementById('loading').style.display = 'none';
            document.getElementById('noResults').style.display = 'block';
            document.getElementById('results').innerHTML = '';
        });
}

function highlightQuery(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
}

function displayResults(docs, query) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    resultsContainer.style.display = 'block';

    docs.forEach(doc => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';

        const title = doc.title || 'No Title';
        const author = doc.author_name ? doc.author_name.join(', ') : 'Unknown Author';
        const publisher = doc.publisher ? doc.publisher.join(', ') : 'Unknown Publisher';
        const publishDate = doc.publish_date ? doc.publish_date.join(', ') : 'Unknown Date';
        const isbn = doc.isbn ? doc.isbn.join(', ') : 'Unknown ISBN';
        const language = doc.language ? doc.language.join(', ') : 'Unknown Language';
        const seed = doc.key ? doc.key : '';

        const titleLink = seed ? `https://openlibrary.org${seed}` : '#';

        resultItem.innerHTML = `
            <a href="${titleLink}" target="_blank">${highlightQuery(title, query)}</a>
            <p><strong>Author:</strong> ${highlightQuery(author, query)}</p>
            <p><strong>Publisher:</strong> ${highlightQuery(publisher, query)}</p>
            <p><strong>Published Date:</strong> ${highlightQuery(publishDate, query)}</p>
            <p><strong>ISBN:</strong> ${highlightQuery(isbn, query)}</p>
            <p><strong>Language:</strong> ${highlightQuery(language, query)}</p>
        `;

        resultsContainer.appendChild(resultItem);
    });
}
