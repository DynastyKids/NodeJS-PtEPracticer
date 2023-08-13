// wordcount.js

/* 
 * Require front end has a html textarea for wordcount
 * Require front end has a p tag for word count number
 */
const textArea = document.querySelector('#inputAnswer');

textArea.addEventListener('input', function () {
    const words = textArea.value.split(/\s+/).filter(Boolean); // Splits by spaces and filters out empty strings
    document.querySelector('#labelWordCount').textContent = `Total Word Count: ${words.length}`;
});
