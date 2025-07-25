const MarkdownIt = require("markdown-it");
const md = new MarkdownIt();

function parseMarkdownToHtml(markdown) {
  if (typeof markdown !== "string") {
    console.warn("Skipping non-string markdown:", markdown);
    return "";
  }
  return md.render(markdown);
}

module.exports = {
  parseMarkdownToHtml
};