#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { exportAllChatHistory } = require('./index.js');
const { exportAllWorkspaces } = require('./exportFiles/fileExporter');

async function main () {
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .option('workspacePath', {
      alias: 'w',
      describe: 'Path to Cursor workspace storage',
      type: 'string',
      default: '/Users/scott/Library/Application Support/Cursor/User/workspaceStorage'
    })
    .help('h')
    .alias('h', 'help')
    .argv;

  try {
    // Set workspace path from CLI argument
    process.env.WORKSPACE_PATH = argv.workspacePath;

    console.log('Starting export from:', argv.workspacePath);
    const chatHistory = await exportAllChatHistory();

    // Export all workspaces
    await exportAllWorkspaces(chatHistory, 'cursor-export-output');

    console.log(`\nExport completed successfully!`);
    console.log(`Total workspaces processed: ${chatHistory.length}`);
    console.log(`Output directory structure:`);
    console.log(`cursor-export-output/`);
    console.log(`  ├── html/`);
    console.log(`  │   └── <workspace_folders>/`);
    console.log(`  │       └── <timestamp>--<chat_title>.html`);
    console.log(`  ├── markdown/`);
    console.log(`  │   └── <workspace_folders>/`);
    console.log(`  │       └── <timestamp>--<chat_title>.md`);
    console.log(`  └── json/`);
    console.log(`      └── <workspace_name>.json`);

  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  }
}

main(); 
