#!/usr/bin/env node
/**
 * ============================================================================
 * Thai Token Optimizer v2.0
 * ============================================================================
 * Description : 
 * A Thai token optimization tool for AI coding agents that keeps commands, code, and technical details accurate.
 *
 * Author      : Dr.Kittimasak Naijit
 * Repository  : https://github.com/kittimasak/thai-token-optimizer
 *
 * Copyright (c) 2026 Dr.Kittimasak Naijit
 *
 * Notes:
 * - Do not remove code-aware preservation, safety checks, or rollback behavior.
 * - This file is part of the Thai Token Optimizer local-first CLI/hook system.
 * ============================================================================
 */



function countThaiChars(text) {
  const m = String(text || '').match(/[\u0E00-\u0E7F]/g);
  return m ? m.length : 0;
}
function countLatinWords(text) {
  const m = String(text || '').match(/[A-Za-z0-9_./:@#-]+/g);
  return m ? m.length : 0;
}
function countSymbols(text) {
  const m = String(text || '').match(/[^\s\u0E00-\u0E7FA-Za-z0-9_]/g);
  return m ? m.length : 0;
}
function heuristicEstimate(text, target = 'generic') {
  text = String(text || '');
  const chars = text.length;
  const thaiChars = countThaiChars(text);
  const latinWords = countLatinWords(text);
  const symbols = countSymbols(text);
  const newlines = (text.match(/\n/g) || []).length;
  let thaiDivisor = 1.8;
  let latinFactor = 1.2;
  if (/claude/i.test(target)) { thaiDivisor = 1.65; latinFactor = 1.15; }
  if (/codex|openai|gpt/i.test(target)) { thaiDivisor = 1.75; latinFactor = 1.25; }
  if (/deepseek|qwen|gemini/i.test(target)) { thaiDivisor = 1.9; latinFactor = 1.15; }
  const thaiTokens = Math.ceil(thaiChars / thaiDivisor);
  const latinTokens = Math.ceil(latinWords * latinFactor);
  const symbolTokens = Math.ceil(symbols * 0.35);
  const lineTokens = Math.ceil(newlines * 0.4);
  const estimatedTokens = Math.max(0, thaiTokens + latinTokens + symbolTokens + lineTokens);
  return { chars, thaiChars, latinWords, symbols, newlines, target, estimatedTokens, exact: false, tokenizer: 'heuristic' };
}
function tryTiktoken(text) {
  try {
    const mod = require('@dqbd/tiktoken');
    const enc = mod.encoding_for_model ? mod.encoding_for_model('gpt-4o') : mod.get_encoding('cl100k_base');
    const tokens = enc.encode(String(text || ''));
    const count = tokens.length;
    if (enc.free) enc.free();
    return { count, tokenizer: '@dqbd/tiktoken:gpt-4o' };
  } catch (_) { return null; }
}
function tryGptTokenizer(text) {
  try {
    const mod = require('gpt-tokenizer');
    const encode = mod.encode || mod.default?.encode;
    if (!encode) return null;
    return { count: encode(String(text || '')).length, tokenizer: 'gpt-tokenizer' };
  } catch (_) { return null; }
}
function exactEstimate(text, target = 'generic') {
  const base = heuristicEstimate(text, target);
  let exact = null;
  const isOpenAi = /codex|openai|gpt/i.test(target);
  
  if (isOpenAi) {
    exact = tryGptTokenizer(text) || tryTiktoken(text);
  } else {
    exact = tryTiktoken(text) || tryGptTokenizer(text);
  }

  if (!exact) return { ...base, requestedExact: true, exactAvailable: false, note: 'Optional tokenizer not installed; used heuristic fallback.' };
  return { ...base, estimatedTokens: exact.count, exact: true, requestedExact: true, exactAvailable: true, tokenizer: exact.tokenizer };
}
function estimateTokens(text, target = 'generic', options = {}) {
  if (options.exact) return exactEstimate(text, target);
  return heuristicEstimate(text, target);
}
function estimateSavings(original, optimized, target = 'generic', options = {}) {
  const before = estimateTokens(original, target, options);
  const after = estimateTokens(optimized, target, options);
  const savedTokens = Math.max(0, before.estimatedTokens - after.estimatedTokens);
  const savingPercent = before.estimatedTokens === 0 ? 0 : Math.round((savedTokens / before.estimatedTokens) * 1000) / 10;
  return { before, after, savedTokens, savingPercent, exact: Boolean(options.exact && before.exact && after.exact) };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const target = args.includes('--target') ? args[args.indexOf('--target') + 1] : 'generic';
  const exact = args.includes('--exact');
  const text = args.filter((x, i, a) => !(x === '--target' || a[i - 1] === '--target' || x === '--exact')).join(' ');
  process.stdout.write(JSON.stringify(estimateTokens(text, target, { exact }), null, 2) + '\n');
}

module.exports = { estimateTokens, estimateSavings, heuristicEstimate, exactEstimate };
