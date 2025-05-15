// utils/parseMarkdown.js
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

// Converts Markdown string to HTML
// @param {string} markdownText
// @returns {string} HTML string
function parseMarkdownToHtml(markdownText) {
  return md.render(markdownText);
}

module.exports = {
  parseMarkdownToHtml,
};