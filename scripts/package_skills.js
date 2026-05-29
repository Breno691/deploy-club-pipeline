// Packages each skill folder as a .zip ready for upload to Claude.ai
// Usage: node scripts/package_skills.js
// Output: skills-dist/<skill-name>.zip

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join('skills');
const DIST_DIR = path.join('skills-dist');

if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });

const skillFolders = fs.readdirSync(SKILLS_DIR).filter(name => {
  const skillPath = path.join(SKILLS_DIR, name);
  return fs.statSync(skillPath).isDirectory() &&
    fs.existsSync(path.join(skillPath, 'SKILL.md'));
});

if (skillFolders.length === 0) {
  console.error('No skill folders found in skills/');
  process.exit(1);
}

console.log(`\nPackaging ${skillFolders.length} skills for Claude.ai upload...\n`);

for (const skillName of skillFolders) {
  const skillPath = path.resolve(path.join(SKILLS_DIR, skillName));
  const zipPath = path.resolve(path.join(DIST_DIR, `${skillName}.zip`));

  // Remove old zip if exists
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

  try {
    // Use PowerShell Compress-Archive on Windows, zip on Unix
    if (process.platform === 'win32') {
      execSync(
        `powershell -Command "Compress-Archive -Path '${skillPath}' -DestinationPath '${zipPath}' -Force"`,
        { stdio: 'pipe' }
      );
    } else {
      execSync(`zip -r "${zipPath}" "${skillName}"`, {
        cwd: path.resolve(SKILLS_DIR),
        stdio: 'pipe',
      });
    }

    const sizeKB = (fs.statSync(zipPath).size / 1024).toFixed(0);
    console.log(`  ✓ ${skillName}.zip (${sizeKB}KB)`);
  } catch (err) {
    console.error(`  ✗ ${skillName}: ${err.message}`);
  }
}

console.log(`\nAll skill packages saved to: ${DIST_DIR}/`);
console.log('\nUpload instructions:');
console.log('  1. Go to Claude.ai → Settings → Capabilities → Skills');
console.log('  2. Click "Upload skill"');
console.log('  3. Select each .zip file from skills-dist/');
console.log('  4. Toggle each skill ON after uploading\n');
