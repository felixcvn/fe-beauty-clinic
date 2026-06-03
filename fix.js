const fs = require('fs');
const content = fs.readFileSync('src/services/api.js', 'utf8');
const newContent = content.replace(/catch \(error\)/g, 'catch');
fs.writeFileSync('src/services/api.js', newContent);
console.log('Done');
