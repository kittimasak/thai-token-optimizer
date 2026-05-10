const { classifyText } = require('../hooks/tto-safety-classifier');
const assert = require('assert');

/**
 * Test suite for verifying the safety classifier whitelist functionality.
 * Fixes Bug 2: Safety classifier false positives for common dev commands.
 */

console.log('Testing safety classifier whitelist...');

// Test 1: Whitelisted command with medium severity keyword should be SAFE
const res1 = classifyText('git commit -m "Add auth logic"');
console.log('Test 1 (git commit with auth):', res1.categories);
assert(!res1.categories.includes('auth_payment'), 'Whitelisted command should not trigger auth_payment');

// Test 2: Whitelisted command with high severity keyword should still be DANGEROUS
const res2 = classifyText('git push --force');
console.log('Test 2 (git push --force):', res2.categories);
assert(res2.categories.includes('destructive_command'), 'Whitelisted command should still trigger destructive_command');

// Test 3: Non-whitelisted command with medium severity keyword should be FLAGGED
const res3 = classifyText('curl -X POST /api/auth');
console.log('Test 3 (curl with auth):', res3.categories);
assert(res3.categories.includes('auth_payment'), 'Non-whitelisted command should trigger auth_payment');

// Test 4: Other whitelisted commands (Fleet & Discord)
const res4 = classifyText('discord reply "Hello"');
console.log('Test 4 (discord reply):', res4.categories);
assert(res4.categories.length === 0, 'discord reply should be clean');

const res5 = classifyText('maw hey');
console.log('Test 5 (maw hey):', res5.categories);
assert(res5.categories.length === 0, 'maw hey should be clean');

const res6 = classifyText('origin-send.sh status');
console.log('Test 6 (origin-send.sh):', res6.categories);
assert(res6.categories.length === 0, 'origin-send.sh should be clean');

console.log('All safety whitelist tests passed!');
