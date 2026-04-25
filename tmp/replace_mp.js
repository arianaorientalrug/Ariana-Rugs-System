const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('.next') && !file.includes('node_modules')) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./app').concat(walk('./lib')).concat(walk('./components'));
let modifiedCount = 0;

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('mp-') || content.includes('MP-')) {
    // We only replace 'mp-' and 'MP-' to sever local storage keys and order prefixes
    const newContent = content
        .replace(/mp-/g, 'ar-')
        .replace(/MP-/g, 'AR-');
        
    if (newContent !== content) {
        fs.writeFileSync(f, newContent);
        modifiedCount++;
        console.log('Updated: ' + f);
    }
  }
});

console.log('Total Modified:', modifiedCount);
