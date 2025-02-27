/**
 * This script helps configure the Google Maps MCP server with your API key.
 * It updates the MCP settings file with the correct configuration.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config();

// Get the Google Maps API key from environment variables
const apiKey = process.env.GOOGLE_MAPS_API_KEY || '';

if (!apiKey) {
  console.error('Error: GOOGLE_MAPS_API_KEY not found in .env file');
  console.error('Please add your Google Maps API key to the .env file');
  process.exit(1);
}

// Determine the MCP settings file path based on the operating system
function getMcpSettingsPath() {
  const homedir = os.homedir();
  
  if (process.platform === 'win32') {
    // Windows
    return path.join(homedir, 'AppData', 'Roaming', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json');
  } else if (process.platform === 'darwin') {
    // macOS
    return path.join(homedir, 'Library', 'Application Support', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json');
  } else {
    // Linux and others
    return path.join(homedir, '.config', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json');
  }
}

// Get the path to the MCP server script
function getMcpServerScriptPath() {
  const homedir = os.homedir();
  
  if (process.platform === 'win32') {
    // Windows
    return path.join(homedir, 'Documents', 'Cline', 'MCP', 'run-google-maps-server.js');
  } else if (process.platform === 'darwin') {
    // macOS
    return path.join(homedir, 'Documents', 'Cline', 'MCP', 'run-google-maps-server.js');
  } else {
    // Linux and others
    return path.join(homedir, 'Documents', 'Cline', 'MCP', 'run-google-maps-server.js');
  }
}

// Update the MCP settings file
function updateMcpSettings() {
  const settingsPath = getMcpSettingsPath();
  const serverScriptPath = getMcpServerScriptPath();
  
  console.log(`Looking for MCP settings file at: ${settingsPath}`);
  
  try {
    // Check if the settings file exists
    if (!fs.existsSync(settingsPath)) {
      console.log('MCP settings file not found. Creating a new one...');
      
      // Create the directory if it doesn't exist
      const settingsDir = path.dirname(settingsPath);
      if (!fs.existsSync(settingsDir)) {
        fs.mkdirSync(settingsDir, { recursive: true });
      }
      
      // Create a new settings file with the Google Maps MCP server configuration
      const settings = {
        mcpServers: {
          "github.com/modelcontextprotocol/servers/tree/main/src/google-maps": {
            command: "node",
            args: [serverScriptPath],
            env: {
              GOOGLE_MAPS_API_KEY: apiKey
            },
            disabled: false,
            autoApprove: []
          }
        }
      };
      
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      console.log('Created new MCP settings file with Google Maps MCP server configuration');
      return;
    }
    
    // Read the existing settings file
    const settingsContent = fs.readFileSync(settingsPath, 'utf-8');
    let settings;
    
    try {
      settings = JSON.parse(settingsContent);
    } catch (error) {
      console.error('Error parsing MCP settings file:', error);
      console.error('Creating a new settings file...');
      
      // Create a new settings file with the Google Maps MCP server configuration
      settings = {
        mcpServers: {
          "github.com/modelcontextprotocol/servers/tree/main/src/google-maps": {
            command: "node",
            args: [serverScriptPath],
            env: {
              GOOGLE_MAPS_API_KEY: apiKey
            },
            disabled: false,
            autoApprove: []
          }
        }
      };
      
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      console.log('Created new MCP settings file with Google Maps MCP server configuration');
      return;
    }
    
    // Ensure the mcpServers object exists
    if (!settings.mcpServers) {
      settings.mcpServers = {};
    }
    
    // Update the Google Maps MCP server configuration
    settings.mcpServers["github.com/modelcontextprotocol/servers/tree/main/src/google-maps"] = {
      command: "node",
      args: [serverScriptPath],
      env: {
        GOOGLE_MAPS_API_KEY: apiKey
      },
      disabled: false,
      autoApprove: []
    };
    
    // Write the updated settings back to the file
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    console.log('Updated MCP settings file with Google Maps MCP server configuration');
  } catch (error) {
    console.error('Error updating MCP settings file:', error);
    process.exit(1);
  }
}

// Main function
function main() {
  console.log('Configuring Google Maps MCP server...');
  console.log(`Using API key: ${apiKey.substring(0, 8)}...`);
  
  updateMcpSettings();
  
  console.log('Done!');
  console.log('You can now use the Google Maps MCP server in your application.');
  console.log('To populate the database with real data, run:');
  console.log('  npm run db:populate');
}

// Run the main function
main();
