# Thai Token Optimizer - Project Instructions

## Foundational Mandates
- **Accuracy > Budget:** Never truncate or break technical terms (commands, paths, versions) to fit a budget. Technical correctness is the highest priority.
- **Preservation First:** 100% preservation of "Hard Constraints" and "Protected Patterns" is mandatory for all compression levels except `ultra` (where semantic muting is allowed).
- **Security Awareness:** Automatically switch to `safe` mode for destructive, production, or auth-related tasks.

## Research Direction: MTP & Speculative Decoding
The project is transitioning from a purely Rule-based system to a **Hybrid AI-driven** architecture.

### 1. TTO as a "Rule-based Speculator"
- Goal: Predict compressed Thai tokens in real-time for CLI/UI auto-completion.

### 2. Speculative Compression Loop
- Instead of linear compression, the system should generate multiple candidates and use the **TTO Verifier** (`preservation-checker`) to select the optimal version.

### 3. Training TTO-Aware SLMs
- Future work includes training Small Language Models on TTO-compressed datasets to serve as specialized Draft Models.

### 4. Semantic Muting
- Speculate on redundancy between Thai text and code. If the code is self-documenting, the system should aggressively mute the redundant Thai description.

## Versioning
- This project is strictly **v1.0 / 1.0.0**. Do not bump the version or claim compatibility with higher versions unless instructed.
