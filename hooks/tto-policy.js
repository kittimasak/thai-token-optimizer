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



const fs = require('fs');
const path = require('path');
const { HOME_DIR, VALID_LEVELS, VALID_PROFILES, VALID_SAFETY_MODES, logError } = require('./tto-config');

const POLICY_PATH = path.join(HOME_DIR, 'config.json');
const DEFAULT_POLICY = Object.freeze({
  defaultMode: 'auto',
  defaultProfile: 'coding',
  safetyMode: 'strict',
  preservePoliteness: false,
  preserveTechnicalTerms: true,
  maxCompressionRatio: 0.6,
  targetAgent: 'auto',
  exactTokenizer: false,
  readCache: {
    mode: 'warn'
  },
  contextPruning: {
    enabled: true,
    staleMinutesThreshold: 30
  },
  precompressThreshold: 300,
  benchmarkStrict: {
    minAverageSavingPercent: 10,
    minTechnicalTermPreservationPercent: 95,
    requireConstraintPreservationPercent: 100,
    requireCodeBlockPreservationPercent: 100,
    mtpMaxAveragePreservationPercent: 100,
    mtpMinSpecHitRatePercent: 60,
    mtpMaxAverageSlowdownMs: 60,
    mtpEnhancedMinGainPercent: 12,

    mtpRepeats: 9,
    mtpWarmupRuns: 1,
    mtpSeed: 20260512,
    mtpEnhancedCorpusPath: 'benchmarks/corpus_long_repetitive_mixed_tech_v1.jsonl',
    mtpFixtureCorpusPath: 'benchmarks/corpus_overfit_guard_v1.jsonl',
    mtpFixtureMinGainPercent: 0,
    mtpHighOutputWasteMinCount: 4,
    mtpHighToolCascadeMinStreak: 4,
    mtpHighBadDecompositionMinCount: 2
  },
  adapters: {
    codex: true,
    claude: true,
    cursor: false,
    aider: false,
    opencode: false,
    openclaw: false,
    hermes: false,
    gemini: false,
    cline: false,
    roo: false
  },
  version: 1
});

function normalizeBoolean(v, fallback) {
  if (typeof v === 'boolean') return v;
  if (v === 'true') return true;
  if (v === 'false') return false;
  return fallback;
}
function normalizePolicy(parsed = {}) {
  const mc = Number(parsed.maxCompressionRatio);
  const readCacheMode = String(parsed.readCache?.mode || DEFAULT_POLICY.readCache.mode).toLowerCase();
  const normalizedReadCacheMode = ['off', 'warn', 'block'].includes(readCacheMode) ? readCacheMode : DEFAULT_POLICY.readCache.mode;
  return {
    ...DEFAULT_POLICY,
    ...parsed,
    defaultMode: VALID_LEVELS.has(parsed.defaultMode) ? parsed.defaultMode : DEFAULT_POLICY.defaultMode,
    defaultProfile: VALID_PROFILES.has(parsed.defaultProfile) ? parsed.defaultProfile : DEFAULT_POLICY.defaultProfile,
    safetyMode: VALID_SAFETY_MODES.has(parsed.safetyMode) ? parsed.safetyMode : DEFAULT_POLICY.safetyMode,
    preservePoliteness: normalizeBoolean(parsed.preservePoliteness, DEFAULT_POLICY.preservePoliteness),
    preserveTechnicalTerms: normalizeBoolean(parsed.preserveTechnicalTerms, DEFAULT_POLICY.preserveTechnicalTerms),
    exactTokenizer: normalizeBoolean(parsed.exactTokenizer, DEFAULT_POLICY.exactTokenizer),
    maxCompressionRatio: Number.isFinite(mc) && mc > 0 && mc <= 1 ? mc : DEFAULT_POLICY.maxCompressionRatio,
    benchmarkStrict: { ...DEFAULT_POLICY.benchmarkStrict, ...(parsed.benchmarkStrict || {}) },
    readCache: { ...DEFAULT_POLICY.readCache, ...(parsed.readCache || {}), mode: normalizedReadCacheMode },
    contextPruning: {
      enabled: normalizeBoolean(parsed.contextPruning?.enabled, DEFAULT_POLICY.contextPruning.enabled),
      staleMinutesThreshold: Number.isFinite(parsed.contextPruning?.staleMinutesThreshold) ? parsed.contextPruning.staleMinutesThreshold : DEFAULT_POLICY.contextPruning.staleMinutesThreshold
    },
    precompressThreshold: Number.isFinite(parsed.precompressThreshold) ? parsed.precompressThreshold : DEFAULT_POLICY.precompressThreshold,
    adapters: { ...DEFAULT_POLICY.adapters, ...(parsed.adapters || {}) },
    version: 1
  };
}
function ensurePolicy() {
  fs.mkdirSync(HOME_DIR, { recursive: true });
  if (!fs.existsSync(POLICY_PATH)) fs.writeFileSync(POLICY_PATH, JSON.stringify(DEFAULT_POLICY, null, 2) + '\n');
  return POLICY_PATH;
}
function getPolicy() {
  try {
    ensurePolicy();
    return normalizePolicy(JSON.parse(fs.readFileSync(POLICY_PATH, 'utf8')));
  } catch (e) {
    logError(`getPolicy: ${e.message}`);
    return { ...DEFAULT_POLICY };
  }
}
function setPolicy(patch) {
  try {
    ensurePolicy();
    const merged = normalizePolicy({ ...getPolicy(), ...patch, version: 1 });
    fs.writeFileSync(POLICY_PATH + '.tmp', JSON.stringify(merged, null, 2) + '\n');
    fs.renameSync(POLICY_PATH + '.tmp', POLICY_PATH);
    return merged;
  } catch (e) {
    logError(`setPolicy: ${e.message}`);
    return null;
  }
}
function setPolicyPathValue(key, value) {
  const current = getPolicy();
  let parsed = value;
  if (value === 'true') parsed = true;
  else if (value === 'false') parsed = false;
  else if (/^-?\d+(\.\d+)?$/.test(String(value))) parsed = Number(value);
  const parts = String(key).split('.').filter(Boolean);
  if (!parts.length) throw new Error('Missing config key');
  const next = JSON.parse(JSON.stringify(current));
  let cur = next;
  for (let i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] ||= {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = parsed;
  return setPolicy(next);
}
function getProfileRules(profile = 'coding') {
  const map = {
    coding: { levelBias: 'full', preserveCode: true, response: 'โค้ด/patch ก่อน อธิบายสั้น คง path/version/command/error exact' },
    research: { levelBias: 'lite', preserveCode: true, response: 'คงเหตุผล วิธีวิจัย สมมติฐาน ตัวแปร และ citation intent' },
    teaching: { levelBias: 'lite', preserveCode: true, response: 'สั้นแต่เป็นขั้น อธิบายศัพท์จำเป็นด้วยตัวอย่าง' },
    paper: { levelBias: 'safe', preserveCode: true, response: 'ภาษาเป็นทางการ คงกรอบวิชาการ/ข้อจำกัด/ตัวเลข' },
    command: { levelBias: 'full', preserveCode: true, response: 'คำสั่ง terminal ก่อน ผลลัพธ์คาดหวัง และข้อควรระวังสั้น' },
    ultra: { levelBias: 'full', preserveCode: true, response: 'ลด token สูงสุด ใช้ bullet/fragment เฉพาะงานไม่เสี่ยง' }
  };
  return map[profile] || map.coding;
}

module.exports = { POLICY_PATH, DEFAULT_POLICY, getPolicy, setPolicy, setPolicyPathValue, ensurePolicy, normalizePolicy, getProfileRules };
