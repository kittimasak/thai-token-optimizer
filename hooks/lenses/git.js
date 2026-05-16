/**
 * ============================================================================
 * Thai Token Optimizer v2.0 - Git Lens (Thai)
 * ============================================================================
 * Description : 
 * Maps verbose Thai git output to compact technical abbreviations.
 * ============================================================================
 */

const GIT_THAI_MAP = [
  // Status Labels
  [/(ไฟล์ที่ถูกแก้ไขแต่ยังไม่ได้จัดเตรียมสำหรับการ commit|Changes not staged for commit):/g, '[!] ไม่ได้ stage:'],
  [/(เตรียมสำหรับการ commit|Changes to be committed):/g, '[+] เตรียม commit:'],
  [/(ไฟล์ที่ไม่มีการติดตาม|Untracked files):/g, '[?] ยังไม่ติดตาม:'],
  [/(แก้ไขแล้ว|modified):/gi, '[M]'],
  [/(ลบแล้ว|deleted):/gi, '[D]'],
  [/(ไฟล์ใหม่|new file):/gi, '[A]'],
  [/(เปลี่ยนชื่อแล้ว|renamed):/gi, '[R]'],

  // Branch & Synchronization
  [/(สาขาของคุณอัปเดตตาม|Your branch is up to date with) '([^']+)'/g, 'สาขาอัปเดตตาม $2'],
  [/(สาขาของคุณอยู่ข้างหน้า|Your branch is ahead of) '([^']+)'/g, 'นำหน้า $2'],
  [/(ไม่มีอะไรต้อง commit, พื้นที่ทำงานสะอาด|nothing to commit, working tree clean)/g, 'สะอาด (Tree clean)'],
  [/(ใช้ "git add" เพื่อรวมสิ่งที่จะ commit|use "git add" to include in what will be committed)/g, '(ใช้ git add)'],
  [/(ใช้ "git restore" เพื่อละทิ้งการเปลี่ยนแปลง|use "git restore" to discard changes)/g, '(ใช้ git restore)'],
  [/(ใช้ "git add <file>..." เพื่ออัปเดตสิ่งที่ควรจัดเตรียม|use "git add <file>..." to update what will be committed)/g, '(ใช้ git add)'],
  [/(ใช้ "git checkout" เพื่อสลับสาขา|use "git checkout" to switch branches)/g, '(ใช้ git checkout)'],

  // Misc
  [/(บนสาขา|On branch)/gi, 'On'],
  [/(รัน "git status" เพื่อตรวจสอบ|Run "git status" to check)/gi, 'Check status']
];

/**
 * Applies the Git lens to the given output.
 */
function applyGitLens(output) {
  let processed = String(output || '');
  
  for (const [pattern, replacement] of GIT_THAI_MAP) {
    processed = processed.replace(pattern, replacement);
  }

  // Cleanup: Remove excessive lines like "  (use ...)"
  processed = processed.split('\n')
    .filter(line => !line.includes('(use "git') && !line.includes('ใช้ "git'))
    .join('\n');

  return processed;
}

module.exports = { applyGitLens };
