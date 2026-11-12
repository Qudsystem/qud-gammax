const fs = require('fs');
const path = require('path');

console.log('🎨 Fixing Icon Imports...\n');

const srcDir = path.join(__dirname, '../src');
let fixedCount = 0;

function fixIconsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Find all icon usage
  const iconMatches = [...new Set(content.match(/<([A-Z][a-zA-Z]*Icon)/g) || [])];
  
  iconMatches.forEach(iconTag => {
    const iconName = iconTag.replace('<', '');
    
    // Check if already imported
    if (!content.includes(`import { ${iconName}`) && !content.includes(`import ${iconName}`)) {
      // Add import at the top (after other imports)
      const importStatement = `import { ${iconName} } from 'lucide-react';\n`;
      
      // Find the last import statement
      const importRegex = /import .+ from .+;/g;
      const imports = content.match(importRegex);
      
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        content = content.replace(lastImport, lastImport + '\n' + importStatement);
        modified = true;
        fixedCount++;
      }
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed icons in: ${filePath.replace(srcDir, 'src')}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules')) {
      processDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      fixIconsInFile(filePath);
    }
  });
}

processDirectory(srcDir);

console.log(`\n🎉 Fixed ${fixedCount} icon imports!\n`);
