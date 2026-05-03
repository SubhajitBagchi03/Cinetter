const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
let changed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const og = content;
  
  // Replace anything matching fontFamily: '...', fontFamily: "..." with fontFamily: '"Syne", sans-serif'
  content = content.replace(/fontFamily:\s*['"](.*?)['"]/g, "fontFamily: '\"Syne\", sans-serif'");
  
  // Replace object styles that use double quotes
  content = content.replace(/fontFamily:\s*"([^"]+)"/g, "fontFamily: '\"Syne\", sans-serif'");
  
  // Replace Inter, Space Grotesk, Bebas Neue in general inline styles
  content = content.replace(/'Space Grotesk',?\s*sans-serif/g, "'Syne', sans-serif");
  content = content.replace(/"Space Grotesk",?\s*sans-serif/g, "'Syne', sans-serif");
  content = content.replace(/'Inter',?\s*sans-serif/g, "'Syne', sans-serif");
  content = content.replace(/"Inter",?\s*sans-serif/g, "'Syne', sans-serif");
  content = content.replace(/'Bebas Neue',?\s*sans-serif/g, "'Syne', sans-serif");
  content = content.replace(/"Bebas Neue",?\s*sans-serif/g, "'Syne', sans-serif");
  
  // Also handle without quotes in fonts
  content = content.replace(/Inter,\s*sans-serif/g, "'Syne', sans-serif");
  content = content.replace(/Space Grotesk,\s*sans-serif/g, "'Syne', sans-serif");
  
  if (content !== og) {
    fs.writeFileSync(file, content, 'utf8');
    changed++;
  }
});
console.log('Files updated: ' + changed);
