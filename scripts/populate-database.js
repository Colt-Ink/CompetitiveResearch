/**
 * This script fetches florist data and seeds the database.
 * It ensures the server is running before fetching data.
 */

import { spawn, exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if the server is running
async function isServerRunning() {
  return new Promise((resolve) => {
    // Try to fetch from the server
    fetch('http://localhost:3000/api/health-check')
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
}

// Start the development server if it's not running
async function ensureServerRunning() {
  const running = await isServerRunning();
  
  if (running) {
    console.log('Server is already running');
    return null;
  }
  
  console.log('Starting development server...');
  
  // Start the server in a separate process
  const serverProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
  });
  
  // Wait for the server to start
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    console.log(`Waiting for server to start (attempt ${attempts + 1}/${maxAttempts})...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const running = await isServerRunning();
    if (running) {
      console.log('Server is now running');
      return serverProcess;
    }
    
    attempts++;
  }
  
  console.error('Failed to start server after multiple attempts');
  if (serverProcess) {
    serverProcess.kill();
  }
  
  process.exit(1);
}

// Run the fetch-florists script
async function fetchFlorists() {
  console.log('Fetching florist data...');
  
  return new Promise((resolve, reject) => {
    exec('node scripts/fetch-florists.js', (error, stdout, stderr) => {
      if (error) {
        console.error('Error fetching florists:', error);
        console.error(stderr);
        reject(error);
        return;
      }
      
      console.log(stdout);
      resolve(true); // Resolve with a value to satisfy TypeScript
    });
  });
}

// Run the seed-database script
async function seedDatabase() {
  console.log('Seeding database...');
  
  return new Promise((resolve, reject) => {
    exec('node scripts/seed-direct.js', (error, stdout, stderr) => {
      if (error) {
        console.error('Error seeding database:', error);
        console.error(stderr);
        reject(error);
        return;
      }
      
      console.log(stdout);
      resolve(true); // Resolve with a value to satisfy TypeScript
    });
  });
}

// Main function
async function main() {
  try {
    console.log('Starting database population process...');
    
    // Ensure the server is running
    const serverProcess = await ensureServerRunning();
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Fetch florist data
    await fetchFlorists();
    
    // Seed the database
    await seedDatabase();
    
    console.log('Database population completed successfully!');
    
    // If we started the server, keep it running
    if (serverProcess) {
      console.log('Server is still running. Press Ctrl+C to stop.');
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('Error populating database:', error);
    process.exit(1);
  }
}

// Run the main function
main();
