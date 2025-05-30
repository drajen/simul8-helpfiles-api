function parseMarkdownToHelpFile(markdownText) {
  const lines = markdownText.split('\n');
  const helpFile = {
    title: 'Untitled',
    content_sections: [],
  };

  let currentSection = null;

  lines.forEach(line => {
    if (line.startsWith('# ')) {
      helpFile.title = line.replace('# ', '').trim();
    } else if (line.startsWith('## ')) {
      if (currentSection) helpFile.content_sections.push(currentSection);
      currentSection = {
        section_title: line.replace('## ', '').trim(),
        text: '',
        media_references: [],
      };
    } else if (line.startsWith('![')) {
      const match = line.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        currentSection.media_references.push({
          alt_text: match[1],
          media_id: match[2].split('media=')[1],
          type: 'image', // 
        });
      }
    } else if (currentSection) {
      currentSection.text += line + '\n';
    }
  });

  if (currentSection) helpFile.content_sections.push(currentSection);

  return helpFile;
}

module.exports = { parseMarkdownToHelpFile };