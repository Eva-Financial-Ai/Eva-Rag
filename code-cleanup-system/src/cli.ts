#!/usr/bin/env node

import { Command } from 'commander';
import { CleanupOrchestrator } from './orchestrator';
import * as path from 'path';
import * as fs from 'fs';
import chalk from 'chalk';
import inquirer from 'inquirer';

import { debugLog } from '../utils/auditLogger';

const program = new Command();

program
  .name('code-cleanup')
  .description('Automated code cleanup system for React/TypeScript projects')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze codebase for duplicates and issues')
  .option('-o, --output <path>', 'Output report path', './cleanup-report.html')
  .action(async _options => {
    debugLog('general', 'log_statement', chalk.blue('🔍 Starting code analysis...\n'));

    const projectRoot = process.cwd();
    const orchestrator = new CleanupOrchestrator(projectRoot);

    try {
      await orchestrator.runCleanup({
        dryRun: true,
      });

      debugLog('general', 'log_statement', chalk.green('\n✅ Analysis complete! Check the report for details.'));
    } catch (error) {
      console.error(chalk.red('\n❌ Analysis failed:'), error);
      process.exit(1);
    }
  });

program
  .command('cleanup')
  .description('Run the full cleanup process')
  .option('-d, --dry-run', 'Perform dry run without making changes')
  .option('-r, --risk <level>', 'Maximum risk level (low, medium, high)', 'low')
  .option(
    '-t, --types <types...>',
    'Types to clean (duplicate, dead-code, unused-import, unused-component)'
  )
  .option('-i, --interactive', 'Interactive mode - choose what to remove')
  .action(async options => {
    const projectRoot = process.cwd();

    // Confirm before proceeding
    if (!options.dryRun) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: chalk.yellow(
            '⚠️  This will modify your codebase. Are you sure you want to proceed?'
          ),
          default: false,
        },
      ]);

      if (!confirm) {
        debugLog('general', 'log_statement', chalk.yellow('Cleanup cancelled.'));
        return;
      }
    }

    debugLog('general', 'log_statement', chalk.blue('🚀 Starting cleanup process...\n'));

    const orchestrator = new CleanupOrchestrator(projectRoot);

    try {
      await orchestrator.runCleanup({
        dryRun: options.dryRun,
        maxRisk: options.risk as any,
        targetTypes: options.types,
        interactive: options.interactive,
      });

      debugLog('general', 'log_statement', chalk.green('\n✨ Cleanup complete!'));
    } catch (error) {
      console.error(chalk.red('\n❌ Cleanup failed:'), error);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize cleanup system in your project')
  .action(async () => {
    debugLog('general', 'log_statement', chalk.blue('🔧 Initializing cleanup system...\n'));

    const projectRoot = process.cwd();

    // Check if package.json exists
    if (!fs.existsSync(path.join(projectRoot, 'package.json'))) {
      console.error(chalk.red('❌ No package.json found. Please run this in a Node.js project.'));
      process.exit(1);
    }

    // Create configuration file
    const config = {
      testCommand: 'npm test -- --coverage --watchAll=false',
      coverageThreshold: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
      criticalPaths: ['auth', 'payment', 'core'],
      performanceBaseline: {
        maxDuration: 5000,
        maxMemory: 512 * 1024 * 1024,
      },
      cleanup: {
        maxRisk: 'medium',
        targetTypes: ['duplicate', 'dead-code', 'unused-import', 'unused-component'],
        excludePaths: ['node_modules', 'build', 'dist', '.git'],
      },
    };

    fs.writeFileSync(
      path.join(projectRoot, 'cleanup.config.json'),
      JSON.stringify(config, null, 2)
    );

    // Add scripts to package.json
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8')
    );

    packageJson.scripts = {
      ...packageJson.scripts,
      'cleanup:analyze': 'code-cleanup analyze',
      'cleanup:dry-run': 'code-cleanup cleanup --dry-run',
      'cleanup:safe': 'code-cleanup cleanup --risk low',
      'cleanup:interactive': 'code-cleanup cleanup --interactive',
    };

    fs.writeFileSync(path.join(projectRoot, 'package.json'), JSON.stringify(packageJson, null, 2));

    // Create .gitignore entries
    const gitignorePath = path.join(projectRoot, '.gitignore');
    const gitignoreEntries = '\n# Code cleanup\n.cleanup-backups/\ncleanup-reports/\n';

    if (fs.existsSync(gitignorePath)) {
      const currentGitignore = fs.readFileSync(gitignorePath, 'utf-8');
      if (!currentGitignore.includes('.cleanup-backups')) {
        fs.appendFileSync(gitignorePath, gitignoreEntries);
      }
    } else {
      fs.writeFileSync(gitignorePath, gitignoreEntries);
    }

    debugLog('general', 'log_statement', chalk.green('✅ Cleanup system initialized!\n'));
    debugLog('general', 'log_statement', 'Available commands:')
    debugLog('general', 'log_statement', chalk.cyan('  npm run cleanup:analyze') + ' - Analyze your codebase');
    debugLog('general', 'log_statement', chalk.cyan('  npm run cleanup:dry-run') + ' - See what would be removed');
    debugLog('general', 'log_statement', chalk.cyan('  npm run cleanup:safe') + ' - Remove low-risk duplicates');
    debugLog('general', 'log_statement', chalk.cyan('  npm run cleanup:interactive') + ' - Choose what to remove\n');
  });

program
  .command('report')
  .description('Generate a report from the last cleanup run')
  .option('-o, --output <path>', 'Output path', './cleanup-report.html')
  .action(async options => {
    debugLog('general', 'log_statement', chalk.blue('📊 Generating report...\n'));

    const projectRoot = process.cwd();
    const reportsDir = path.join(projectRoot, 'cleanup-reports');

    if (!fs.existsSync(reportsDir)) {
      console.error(chalk.red('❌ No cleanup reports found. Run cleanup first.'));
      process.exit(1);
    }

    // Find the latest report
    const reports = fs
      .readdirSync(reportsDir)
      .filter(f => f.endsWith('.html'))
      .sort()
      .reverse();

    if (reports.length === 0) {
      console.error(chalk.red('❌ No reports found.'));
      process.exit(1);
    }

    const latestReport = path.join(reportsDir, reports[0]);
    fs.copyFileSync(latestReport, options.output);

    debugLog('general', 'log_statement', chalk.green(`✅ Report copied to ${options.output}`));
  });

program.parse(process.argv);
