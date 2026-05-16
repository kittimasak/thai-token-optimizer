#!/usr/bin/env node
/**
 * ============================================================================
 * Thai Token Optimizer v2.0 - Shell Proxy Mode (TTO-Proxy)
 * ============================================================================
 * Description : 
 * Intercepts, compresses, and forwards shell command outputs to AI agents.
 * 
 * Author      : Dr.Kittimasak Naijit
 * ============================================================================
 */

const { spawn } = require('child_process');
const { compressPrompt } = require('./tto-compressor');
const { estimateSavings } = require('./tto-token-estimator');

/**
 * Runs a command and proxies its output through TTO compression.
 */
async function runProxy(command, args, options = {}) {
  const level = options.level || 'auto';
  const target = options.target || 'codex';
  const budget = options.budget || 0;
  const silent = options.silent || false;

  if (!command) {
    console.error('Error: No command provided to TTO-Proxy.');
    return 1;
  }

  if (!silent) {
    process.stdout.write(`[TTO-Proxy] Command: ${command} ${args.join(' ')}\n`);
    process.stdout.write(`[TTO-Proxy] Level: ${level}, Target: ${target}\n\n`);
  }

  const child = spawn(command, args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { ...process.env, TTO_ACTIVE: 'true' },
    shell: true
  });

  let stdoutBuffer = '';
  let stderrBuffer = '';

  child.stdout.on('data', (data) => {
    stdoutBuffer += data.toString();
    // In a future version, we could implement real-time streaming here
  });

  child.stderr.on('data', (data) => {
    stderrBuffer += data.toString();
  });

  return new Promise((resolve) => {
    child.on('close', (code) => {
      const fullOutput = (stdoutBuffer + stderrBuffer).trim();
      
      if (!fullOutput) {
        resolve(code);
        return;
      }

      // Perform compression
      // We use compressPrompt which internally uses ALD/SMT if needed
      const optimized = compressPrompt(fullOutput, { level, target });
      const stats = estimateSavings(fullOutput, optimized, target);

      process.stdout.write(optimized + '\n\n');

      if (!silent) {
        process.stdout.write(
          `[TTO-Proxy] Finished with exit code ${code}\n` +
          `[TTO-Proxy] Tokens: ${stats.before.estimatedTokens} -> ${stats.after.estimatedTokens} ` +
          `(-${stats.savingPercent}%)\n`
        );
      }

      resolve(code);
    });

    child.on('error', (err) => {
      console.error(`[TTO-Proxy] Failed to start process: ${err.message}`);
      resolve(1);
    });
  });
}

module.exports = { runProxy };
