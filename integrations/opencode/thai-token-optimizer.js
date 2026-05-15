/**
 * Thai Token Optimizer v2.0 - OpenCode Plugin
 * Copy this file to: ~/.config/opencode/plugins/thai-token-optimizer.js
 */
module.exports = {
  name: 'thai-token-optimizer',
  version: '2.0.0',
  hooks: {
    'tool.execute.before': async (ctx) => {
      // Intercept and optimize tool inputs
      return ctx;
    },
    'experimental.session.compacting': async (ctx) => {
      // Handle session compacting events
      return ctx;
    }
  }
};
