// Converts internal dokuwiki-style links to Markdown links
function convertInternalLinks(text) {
  // Converts [[features:labels|Labels]] → [Labels](features:labels) - for example
  return text.replace(/\[\[(.*?\|.*?)\]\]/g, (match) => {
    const [link, label] = match.slice(2, -2).split('|');
    return `[${label.trim()}](${link.trim()})`;
  });
}

// Converts a HelpFile JSON object to Markdown format
function convertToMarkdown(helpFile) {
  let md = `# ${helpFile.title || "Untitled"}\n\n`;

  helpFile.content_sections?.forEach((section) => {
    // Skip "Main" as it's just a backend marker
  /* if (section.section_title?.toLowerCase() !== "main") {
      md += `## ${section.section_title || "No title"}\n\n`;
    } */

   const title = section.section_title?.trim();
    if (title && title.toLowerCase() !== "main") {
      md += `## ${title}\n\n`;
    }

    // Convert internal links before adding the text
    const cleanText = convertInternalLinks(section.text || "");
    md += `${cleanText}\n\n`;

    // Add media references
    if (section.media_references?.length) {
    section.media_references.forEach((media) => {

        // Use media.url if present, fallback to reconstruct from file_path
        const mediaUrl = media.url || `https://www.simul8.com/support/help/lib/exe/fetch.php?media=${media.file_path || media.media_id}`;
        const isImage = /\.(png|jpe?g|gif|svg)$/i.test(mediaUrl);

        if (isImage) {
        md += `![${media.alt_text || "media"}](${mediaUrl})\n\n`;
        } else {
        md += `[Download ${media.alt_text || media.media_id}](${mediaUrl})\n\n`;
        }
    });
    }
  });

  // Add "See Also" section if present
  const seeAlso = helpFile.references?.find(r => r.type === "see_also");
  if (seeAlso?.documents?.length) {
    md += `---\n\n### See Also\n`;
    seeAlso.documents.forEach(doc => {
      // Generate full link for testing/demo purposes
      md += `- [${doc.link_text}](https://www.simul8.com/support/help/doku.php?id=${doc.document_id})\n`;
    });
    md += `\n`;
  }

  // Add original legacy source link
  const legacy = helpFile.references?.find(r => r.type === "legacy_url");
  if (legacy?.url) {
    md += `---\n\n[Original Source](${legacy.url})\n`;
  }

  return md.trim();
}

module.exports = { convertToMarkdown };