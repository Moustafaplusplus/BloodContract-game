#!/usr/bin/env node

// Deployment verification script for Railway
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Verifying deployment files...');

// Check critical directories
const criticalDirs = [
  'src',
  'config', 
  'migrations',
  'public'
];

const criticalFiles = [
  'src/app.js',
  'config/config.cjs',
  'sequelize.config.cjs',
  '.sequelizerc',
  'package.json'
];

console.log('\n📁 Checking directories:');
criticalDirs.forEach(dir => {
  const exists = fs.existsSync(dir);
  console.log(`${exists ? '✅' : '❌'} ${dir}/`);
});

console.log('\n📄 Checking files:');
criticalFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n📦 Package.json contents:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`- Name: ${packageJson.name}`);
  console.log(`- Version: ${packageJson.version}`);
  console.log(`- Main: ${packageJson.main}`);
  console.log(`- Scripts: ${Object.keys(packageJson.scripts).join(', ')}`);
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

console.log('\n🌍 Environment variables:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`- PORT: ${process.env.PORT || 'not set'}`);
console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? 'set' : 'not set'}`);

console.log('\n✅ Deployment verification complete!'); 