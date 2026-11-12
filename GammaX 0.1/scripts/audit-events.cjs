const fs = require('fs');
const path = require('path');

console.log('🔍 Auditing Event Handlers...\n');

const srcDir = path.join(__dirname, '../src');
const issues = [];

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for onClick without function
      const onClickMatches = content.match(/onClick=\{[^}]*\}/g) || [];
      onClickMatches.forEach(match => {
        if (match.includes('undefined') || match.includes('null')) {
          issues.push({
            file: filePath.replace(srcDir, 'src'),
            issue: `onClick handler might be undefined: ${match}`,
            type: 'event-handler'
          });
        }
      });
      
      // Check for unbound functions
      if (content.includes('onClick={this.') && !content.includes('.bind(this)')) {
        issues.push({
          file: filePath.replace(srcDir, 'src'),
          issue: 'Possible unbound "this" in class component',
          type: 'binding'
        });
      }
      
      // Check for missing icon imports
      const iconUsage = content.match(/<([A-Z][a-zA-Z]*Icon)/g) || [];
      iconUsage.forEach(icon => {
        const iconName = icon.replace('<', '');
        if (!content.includes(`import { ${iconName}`) && !content.includes(`import ${iconName}`)) {
          issues.push({
            file: filePath.replace(srcDir, 'src'),
            issue: `Icon "${iconName}" used but not imported`,
            type: 'icon'
          });
        }
      });
    }
  });
}

scanDirectory(srcDir);

if (issues.length === 0) {
  console.log('✅ No issues found! All event handlers look good.\n');
} else {
  console.log(`❌ Found ${issues.length} issues:\n`);
  issues.forEach((issue, i) => {
    console.log(`${i + 1}. [${issue.type}] ${issue.file}`);
    console.log(`   ${issue.issue}\n`);
  });
}

process.exit(issues.length);
