const fs = require('fs');
const path = require('path');

// Get the title from command line arguments, combining all args after the script name
const title = process.argv.slice(2).join(' ');

if (!title) {
  console.error('Please provide a title for the blog post');
  console.error('Usage: yarn new Your Blog Title');
  process.exit(1);
}

// Create filename-friendly version of the title
const slugify = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Get today's date in YYYY-MM-DD format
const today = new Date();
const dateStr = today.toISOString().split('T')[0];

// Create the filename
const filename = `${dateStr}_${slugify(title)}.md`;

// Ensure the blog directory exists
const blogDir = path.join(process.cwd(), 'content', 'blog');
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}

// Check if file already exists
const filePath = path.join(blogDir, filename);
if (fs.existsSync(filePath)) {
  console.error(`Error: A blog post with the filename "${filename}" already exists.`);
  console.error('Please choose a different title or delete the existing file.');
  process.exit(1);
}

// Create the file content with TOML header
const content = `+++
title = "${title}"
date = ${dateStr}
description = ""
draft = true

[taxonomies]
tags = []
+++

Write your blog post content here...
`;

// Write the file
fs.writeFileSync(filePath, content);

console.log(`Created new blog post: ${filePath}`); 