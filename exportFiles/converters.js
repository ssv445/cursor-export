const { marked } = require('marked');
const fs = require('fs').promises;
const { formatDateTime } = require('./formatters');
const path = require('path');

// Convert chat history to markdown format
function convertToMarkdown(chatData, workspaceInfo) {
  let markdown = '';
  
  if (workspaceInfo.folder) {
    // Remove 'file://' prefix if it exists
    const cleanPath = workspaceInfo.folder.replace(/^file:\/\//, '');
    markdown += `# Workspace: ${cleanPath}\n\n`;
  } else {
    markdown += `# Workspace: ${workspaceInfo.id}\n\n`;
  }
  
  markdown += `Last Modified: ${formatDateTime(workspaceInfo.lastModified)}\n\n`;
  
  // Add chat title
  markdown += `## ${chatData.title}\n\n`;
  
  if (chatData.bubbles) {
    for (const bubble of chatData.bubbles) {
      // Skip empty bubbles
      if (!bubble.text && (!bubble.codeBlocks || bubble.codeBlocks.length === 0)) {
        continue;
      }
      
      const role = bubble.type === 'ai' ? 'Cursor' : 'User';
      markdown += `**${role}**:\n\n${bubble.text}\n\n`;
      
      if (bubble.codeBlocks) {
        for (const block of bubble.codeBlocks) {
          markdown += '```' + (block.language || '') + '\n';
          markdown += block.code + '\n';
          markdown += '```\n\n';
        }
      }
    }
  }
  
  return markdown;
}

// Convert markdown to HTML with GitHub styling
async function convertToHtml(markdown) {
  const htmlContent = marked(markdown);
  const cssPath = require.resolve('github-markdown-css/github-markdown.css');
  const css = await fs.readFile(cssPath, 'utf-8');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cursor Chat History</title>
    <style>
        ${css}
        .markdown-body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
        }

        .markdown-body ul,
        .markdown-body ol {
          margin-top: 0;
          margin-bottom: 0;
          padding-left: 2em;
          list-style-type: disc !important;
        }

        @media (max-width: 767px) {
            .markdown-body {
                padding: 15px;
            }
        }
    </style>
</head>
<body class="markdown-body">
    ${htmlContent}
</body>
</html>`;
}

module.exports = {
  convertToMarkdown,
  convertToHtml
}; 
