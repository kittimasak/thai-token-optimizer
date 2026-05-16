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
const { compressToBudget } = require('./tto-budget-compressor');
const { estimateSavings } = require('./tto-token-estimator');
const { applyLens } = require('./lenses/index');

const MAX_PROXY_BUFFER_CHARS = 1024 * 1024; // 1MB safety cap for proxy mode

/**
 * Runs a command and proxies its output through TTO compression.
 */
async function runProxy(command, args, options = {}) {
  const level = options.level || 'auto';
  const target = options.target || 'codex';
  const budget = options.budget || 2500; // Default budget cap for proxy observations
  const silent = options.silent || false;

  if (!command) {
    console.error('Error: No command provided to TTO-Proxy.');
    return 1;
  }

  if (!silent) {
    process.stdout.write(`[TTO-Proxy] Command: ${command} ${args.join(' ')}\n`);
    process.stdout.write(`[TTO-Proxy] Mode: Full Capacity (Budget: ${budget}, Target: ${target})\n\n`);
  }

  const child = spawn(command, args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { ...process.env, TTO_ACTIVE: 'true' },
    shell: true
  });

  let stdoutBuffer = '';
  let stderrBuffer = '';
  let totalChars = 0;
  let truncated = false;

  const onData = (data, isStderr) => {
    const chunk = data.toString();
    if (totalChars + chunk.length > MAX_PROXY_BUFFER_CHARS) {
      if (!truncated) {
        const remaining = MAX_PROXY_BUFFER_CHARS - totalChars;
        if (remaining > 0) {
          if (isStderr) stderrBuffer += chunk.slice(0, remaining);
          else stdoutBuffer += chunk.slice(0, remaining);
        }
        truncated = true;
      }
      return;
    }
    if (isStderr) stderrBuffer += chunk;
    else stdoutBuffer += chunk;
    totalChars += chunk.length;
  };

  child.stdout.on('data', (data) => onData(data, false));
  child.stderr.on('data', (data) => onData(data, true));

  return new Promise((resolve) => {
    child.on('close', (code) => {
      let fullOutput = (stdoutBuffer + stderrBuffer).trim();
      if (truncated) {
        fullOutput += '\n... [Proxy Buffer Exceeded 1MB, output truncated locally] ...';
      }
      
      if (!fullOutput) {
        resolve(code);
        return;
      }

      // Pre-process with specialized command lens
      const lensOutput = applyLens(command, args, fullOutput, { silent });

      // Use compressToBudget for SMT (Smart Middle Truncation) support
      const result = compressToBudget(lensOutput, { 
        budget, 
        target, 
        level,
        speculative: true 
      });

      const optimized = result.optimized;
      const stats = result.savings;

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
