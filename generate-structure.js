// generate-structure.js
import { promises as fs } from 'fs';
import path from 'path';

async function generateStructure(dir = '.', indent = '') {
  let output = '';
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        output += `${indent}${file.name}/\n`;
        output += await generateStructure(fullPath, indent + '  ');
      } else {
        output += `${indent}${file.name}\n`;
      }
    }
  } catch (err) {
    output += `${indent}Error reading directory ${dir}: ${err.message}\n`;
  }
  return output;
}

async function getFileContents(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (err) {
    return `Error reading ${filePath}: ${err.message}`;
  }
}

async function main() {
  const outputFile = 'project-structure.txt';
  let output = 'File Structure of xeltis-vite/\n';
  output += '============================\n\n';
  output += await generateStructure('.');

  // List of files to include contents for
  const filesToRead = [
    'index.html',
    'mission.html',
    'style.css',
    'script.js',
    'vite.config.js',
    'package.json'
  ];

  output += '\nFile Contents\n';
  output += '============\n\n';

  for (const file of filesToRead) {
    output += `--- ${file} ---\n`;
    try {
      await fs.access(file);
      output += await getFileContents(file);
    } catch {
      output += 'File not found\n';
    }
    output += '\n\n';
  }

  await fs.writeFile(outputFile, output);
  console.log(`File structure and contents saved to ${outputFile}`);
}

main().catch(err => console.error('Error generating structure:', err));