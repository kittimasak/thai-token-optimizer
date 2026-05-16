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
  [/(?:ไฟล์ที่ถูกแก้ไขแต่ยังไม่ได้จัดเตรียมสำหรับการ commit|ไฟล์ที่แก้ไขแต่ยังไม่ได้จัดเตรียมสำหรับการ commit|Changes not staged for commit):/gi, '[!] ไม่ได้ stage:'],
  [/(?:เตรียมสำหรับการ commit|การเปลี่ยนแปลงที่จะจัดเตรียมสำหรับการ commit|Changes to be committed):/gi, '[+] เตรียม commit:'],
  [/(?:ไฟล์ที่ไม่มีการติดตาม|ไฟล์ที่ยังไม่ได้ติดตาม|Untracked files):?/gi, '[?] ยังไม่ติดตาม:'],
  [/(?:แก้ไขแล้ว|modified):/gi, '[M]'],
  [/(?:ลบแล้ว|ถูกลบ|deleted):/gi, '[D]'],
  [/(?:ไฟล์ใหม่|new file):/gi, '[A]'],
  [/(?:เปลี่ยนชื่อแล้ว|renamed):/gi, '[R]'],

  // Branch & Synchronization
  [/(?:บนสาขา|On branch)/gi, 'On'],
  [/(?:สาขาของคุณอัปเดตตาม|Your branch is up to date with) '([^']+)'/gi, 'สาขาอัปเดตตาม $1'],
  [/(?:สาขาของคุณอยู่ข้างหน้า|Your branch is ahead of) '([^']+)'(?:\s+(?:โดย|by))?\s+(\d+)\s+commit/gi, 'นำหน้า $1 $2 commit'],
  [/(?:สาขาของคุณอยู่ข้างหลัง|Your branch is behind) '([^']+)'(?:\s+(?:โดย|by))?\s+(\d+)\s+commit/gi, 'ตามหลัง $1 $2 commit'],
  [/(?:ไม่มีอะไรต้อง commit, พื้นที่ทำงานสะอาด|nothing to commit, working tree clean)/gi, 'สะอาด (Tree clean)'],
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
    .filter(line => {
      const lower = line.toLowerCase();
      return !lower.includes('(use "git') && 
             !lower.includes('(ใช้ "git') && 
             !lower.includes('(use git') &&
             !lower.includes('(ใช้ git');
    })
    .join('\n');

  return processed;
}

module.exports = { applyGitLens };
