import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 Installing Leo CLI for Aleo blockchain...');

try {
  // Check if Leo is already installed
  try {
    const version = execSync('leo --version', { encoding: 'utf-8' });
    console.log('✅ Leo CLI already installed:', version.trim());
    process.exit(0);
  } catch {
    console.log('Leo CLI not found. Installing...');
  }

  // Install Leo via official installer
  console.log('📦 Downloading Leo installer...');
  execSync('curl -L https://raw.githubusercontent.com/AleoHQ/aleo/main/install.sh | sh', {
    stdio: 'inherit',
    shell: '/bin/bash'
  });

  // Verify installation
  const version = execSync('leo --version', { encoding: 'utf-8' });
  console.log('✅ Leo CLI installed successfully:', version.trim());

} catch (error) {
  console.error('❌ Failed to install Leo CLI:', error.message);
  console.log('\n📝 Manual installation instructions:');
  console.log('1. Run: curl -L https://raw.githubusercontent.com/AleoHQ/aleo/main/install.sh | sh');
  console.log('2. Or visit: https://developer.aleo.org/leo/installation');
  process.exit(1);
}
