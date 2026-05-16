/**
 * ============================================================================
 * Thai Token Optimizer v2.0 - Command Lens Registry
 * ============================================================================
 */

const { applyGitLens } = require('./git');

const LENS_MAP = {
  'git': applyGitLens
};

/**
 * Automatically applies a specialized lens if available for the command.
 */
function applyLens(command, args, output, options = {}) {
  const cmdKey = String(command || '').toLowerCase();
  
  if (LENS_MAP[cmdKey]) {
    if (!options.silent) {
      console.log(`[TTO-Proxy] Specialized lens applied: ${cmdKey}`);
    }
    return LENS_MAP[cmdKey](output);
  }

  return output;
}

module.exports = { applyLens };
