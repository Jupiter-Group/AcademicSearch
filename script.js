let start = 0;
let maxResults = 10;
let query = '';

document.getElementById('search-form').addEventListener('submit', function(event) {
    event.preventDefault();
    query = document.getElementById('query').value;
    maxResults = document.getElementById('num-results').value;
    start = 0;
    fetchResults(query, maxResults, start, true);
});

document.getElementById('load-more').addEventListener('click', function() {
    start += parseInt(maxResults);
    fetchResults(query, maxResults, start, false);
});

function fetchResults(query, maxResults, start, reset) {
    const url = `https://export.arxiv.org/api/query?search_query=all:${query}&start=${start}&max_results=${maxResults}`;
    fetch(url)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");
            const entries = xmlDoc.getElementsByTagName('entry');
            displayResults(entries, reset);
        })
        .catch(error => console.error('Error fetching data:', error));
}

function displayResults(entries, reset) {
    const resultsDiv = document.getElementById('results');
    if (reset) {
        resultsDiv.innerHTML = '';
    }

    Array.from(entries).forEach(entry => {
        const title = entry.getElementsByTagName('title')[0].textContent;
        const authors = Array.from(entry.getElementsByTagName('author')).map(author => author.getElementsByTagName('name')[0].textContent).join(', ');
        const publishedDate = entry.getElementsByTagName('published')[0].textContent;
        const link = entry.getElementsByTagName('id')[0].textContent;

        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');

        const resultTitle = document.createElement('div');
        resultTitle.classList.add('result-title');
        resultTitle.innerHTML = `<a href="${link}" target="_blank">${title}</a>`;

        const resultAuthors = document.createElement('div');
        resultAuthors.classList.add('result-authors');
        resultAuthors.textContent = `Authors: ${authors}`;

        const resultDate = document.createElement('div');
        resultDate.classList.add('result-date');
        resultDate.textContent = `Published Date: ${publishedDate}`;

        resultItem.appendChild(resultTitle);
        resultItem.appendChild(resultAuthors);
        resultItem.appendChild(resultDate);

        resultsDiv.appendChild(resultItem);
    });

    if (entries.length === parseInt(maxResults)) {
        document.getElementById('load-more').style.display = 'block';
    } else {
        document.getElementById('load-more').style.display = 'none';
    }
}
