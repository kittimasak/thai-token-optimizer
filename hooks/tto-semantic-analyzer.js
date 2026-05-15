#!/usr/bin/env node
/**
 * ============================================================================
 * Thai Token Optimizer v2.0 - Semantic Analyzer
 * ============================================================================
 * Handles AST-lite extraction and redundancy detection between Thai text
 * and code structures.
 */

const SYMBOL_PATTERNS = {
  javascript: [
    /function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/g, // function name(args)
    /(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=/g,  // variable assignment
    /([A-Za-z0-9_]+)\s*=\s*\([^)]*\)\s*=>/g,      // arrow function
    /class\s+([A-Za-z0-9_]+)/g,                  // classes
    /\.([A-Za-z0-9_]+)\b/g,                      // properties .status
    /\b([A-Za-z0-9_]+)\s*:/g,                    // object keys key: value
    /\b(true|false|null|undefined)\b/g           // constants
  ],
  python: [
    /def\s+([A-Za-z0-9_]+)\s*\(([^)]*)\):/g,     // def name(args):
    /class\s+([A-Za-z0-9_]+)(?:\([^)]*\))?:/g,   // class name:
    /([A-Za-z0-9_]+)\s*=\s*/g,                   // variable assignment
    /\.([A-Za-z0-9_]+)\b/g,                      // properties
    /\b(True|False|None)\b/g                     // constants
  ]
};

/**
 * Extracts technical symbols from a code block.
 */
function extractSymbols(code, lang = 'javascript') {
  const symbols = new Set();
  const patterns = SYMBOL_PATTERNS[lang] || SYMBOL_PATTERNS.javascript;

  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let m;
    // Modified to be more lenient with incomplete code
    while ((m = pattern.exec(code)) !== null) {
      if (m[1]) symbols.add(m[1].trim());
      if (m[2]) {
        m[2].split(',').forEach(p => {
          const name = p.trim().split(/\s+|:/)[0];
          if (name && /^[A-Za-z0-9_]+$/.test(name)) symbols.add(name);
        });
      }
    }
  }
  
  // Fallback for partial code: Extract anything that looks like an identifier
  if (symbols.size === 0) {
    const ids = code.match(/\b[A-Za-z_][A-Za-z0-9_]{2,}\b/g);
    if (ids) ids.forEach(id => symbols.add(id));
  }

  // Extract nested properties
  const nestedProps = code.match(/[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)+/g);
  if (nestedProps) {
    nestedProps.forEach(p => {
      symbols.add(p);
      p.split('.').forEach(part => symbols.add(part));
    });
  }

  const stringLiterals = code.match(/["'][A-Za-z0-9_.-]+["']/g);
  if (stringLiterals) {
    stringLiterals.forEach(s => symbols.add(s.slice(1, -1)));
  }

  return Array.from(symbols);
}

/**
 * Calculates a redundancy score (0.0 to 1.0) for a Thai segment 
 * based on its overlap with extracted technical symbols.
 */
function calculateRedundancy(thaiSegment, symbols) {
  if (!symbols.length || !thaiSegment.trim()) return 0;
  
  // Ignore very short symbols (likely homonyms like 'can', 'is', 'it')
  const validSymbols = symbols.filter(s => s.length >= 4);
  if (validSymbols.length === 0) return 0;

  const sortedSymbols = [...validSymbols].sort((a, b) => b.length - a.length);
  
  let matches = 0;
  let tempText = thaiSegment;
  for (const sym of sortedSymbols) {
    let cursor = 0;
    while ((cursor = tempText.indexOf(sym, cursor)) !== -1) {
      matches += sym.length;
      // Replace with spaces to keep indices but avoid re-matching
      tempText = tempText.slice(0, cursor) + ' '.repeat(sym.length) + tempText.slice(cursor + sym.length);
      cursor += sym.length;
    }
  }

  return matches / thaiSegment.length;
}

/**
 * Prunes redundant Thai descriptions if they mostly repeat what's in the code.
 */
function pruneRedundantThai(thaiText, codeSymbols) {
  if (!codeSymbols || codeSymbols.length === 0) return thaiText;

  const fallbackIntent = clause => {
    const matches = String(clause || '').match(/เขียน|สร้าง|แก้|ตรวจ|ทดสอบ|สรุป|อธิบาย|ฟังก์ชัน|คืนค่า/g) || [];
    return Array.from(new Set(matches)).join(' ').trim();
  };

  const isMeaningfulThai = text => {
    const cleaned = String(text || '')
      .replace(/[.\sและโดยซึ่งที่ของครับค่ะ]+/g, '')
      .trim();
    return cleaned.length > 1;
  };

  // Split into sentences/clauses to prune selectively
  const clauses = thaiText.split(/([。\.!\?|]| และ | โดย | ซึ่ง | เข้ามา | แล้ว | เข้าไป | รบกวนช่วย | ช่วย | หน่อยครับ | หน่อยค | หน่อย | ครับ | ค่ะ)/);
  let result = [];

  for (let i = 0; i < clauses.length; i++) {
    const clause = clauses[i];
    if (!clause || !clause.trim()) {
      if (clause && !/^[ช่วย|และ|โดย|ซึ่ง|รบกวนช่วย|ที่]+$/.test(clause.trim())) result.push(clause);
      continue;
    }

    const redundancy = calculateRedundancy(clause, codeSymbols);
    
    // Threshold: 10% redundancy is enough to trigger optimization in v2.0.1
    if (redundancy > 0.10 && clause.length < 200) {
      const hasIntent = /(ห้าม|ต้อง|คง|ยังคง|รักษา|เด็ดขาด|สำคัญ|อย่า|keep|preserve|only|เท่านั้น|version|เวอร์ชัน|gate|PASS|FAIL|preservation|benchmark|regression|อธิบาย)/i.test(clause);
      
      if (!hasIntent) {
        if (redundancy > 0.35) {
          const fallback = fallbackIntent(clause);
          if (fallback) result.push(fallback);
          continue;
        }
        
        let compressed = clause;
        for (const sym of codeSymbols) {
          compressed = compressed.split(sym).join('');
        }
        compressed = compressed.replace(/(ฟังก์ชัน|ตัวแปร|parameter|พารามิเตอร์|ชื่อ|ที่เป็น|รับ|ส่ง|คำนวณ|กำหนดค่า|ตั้งค่า|แก้ค่า|ไปที่|การทำงานของ|ให้หน่อย|ให้มีความหมาย)/g, '').trim();
        if (compressed.length > 2 && isMeaningfulThai(compressed)) {
          result.push(compressed);
        } else {
          const fallback = fallbackIntent(clause);
          if (fallback) result.push(fallback);
        }
        continue;
      }
    }
    result.push(clause);
  }

  // Final cleanup of dangling connectors at start/end or doubled up
  let final = result.join('')
    .replace(/^[และ|โดย|ซึ่ง|ที่|ของ]+\s*/, '')
    .replace(/\s+[และ|โดย|ซึ่ง|ที่|ของ|ครับ|ค่ะ]+$/, '')
    .replace(/(และ|โดย|ซึ่ง){2,}/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
    
  return final;
}

/**
 * Advanced: Detects if code is "Self-Documenting" enough to mute the Thai description.
 */
function isSelfDocumenting(code, thaiDescription) {
  const symbols = extractSymbols(code);
  const redundancy = calculateRedundancy(thaiDescription, symbols);
  
  // If extremely redundant and code is simple (one-liner)
  if (redundancy > 0.6 && code.split('\n').length <= 2) {
    return true;
  }
  return false;
}

module.exports = {
  extractSymbols,
  calculateRedundancy,
  pruneRedundantThai,
  isSelfDocumenting
};
