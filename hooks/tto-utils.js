/**
 * Shared utilities for Thai Token Optimizer
 */

function normalizedIncludes(haystack, needle) {
  const h = String(haystack || '').toLowerCase();
  const n = String(needle || '').toLowerCase();
  if (!n) return true;
  
  // Collapse whitespace for loose matching
  const hNorm = h.replace(/\s+/g, ' ');
  const nNorm = n.replace(/\s+/g, ' ');
  
  if (hNorm.includes(nNorm)) return true;
  
  if (n.length > 60) {
    const tokens = n.match(/[A-Za-z0-9_.:@#=+\-/]+|[\u0E00-\u0E7F]+/g) || [];
    const important = tokens.filter(t => t.length > 1).slice(0, 12);
    return important.length > 0 && important.every(t => h.includes(t.toLowerCase()));
  }
  
  return false;
}

module.exports = { normalizedIncludes };
