# Safe Night build log

Development date: 2026-11-09. This is an agent-assisted local prototype, not a published or clinically validated product.

## Brief and environment

- Recovered the approved brief from the user's attachment and kept a reviewable copy in this folder.
- The user approved local Specs development, the missing plan-lens skill waiver, and continuing without a Specs account sign-in. The closed signup page did not prevent local Preview work.
- Worked in Lens Studio 5.24.1 through its MCP tools. No direct HTTP workaround was used for the editor.
- LEAF 4.0.0 produced TS2352 in vendor code. With user approval, replaced it with LEAF 2.0.2 and restarted the editor; vendor source was not patched.
- Removed an optional incompatible inspection helper and used LEAF plus native panel captures instead. Recoverable MCP refresh/retry was authorized by the user.

## Implementation

- Added a pure TypeScript rule engine, dwell and hysteresis gates, a priority arbiter, explicit state transitions, evidence levels and final-transcript command parsing.
- Added a single UIKit instruction card with a quiet control strip, warm neutral type, teal clear state, amber adjustments, violet dashed unknown cue, slow fades and a view-edge sleep-space direction.
- Built original procedural nursery geometry, a doll with head/shoulder/hip landmarks, a bottle, supporting arm/hand, infant sleep space, furniture and removable hazards. Scale is centimeters and interactive scaling is locked.
- Used actual prop transforms and colliders for support, bottle holding and oriented hazard overlap. User statements are separate from measured simulation geometry.
- Added an optional ASR path with explicit button fallback, and a locally synthesized spatial chime. Live voice and perceived spatial audio remain unverified.

## Bugs found during verification

- Fixed UIKit layout discovery conflicting with manually registered children.
- Fixed incorrect shape API usage, missing audio listener and scene initialization issues.
- A restart test failed because selected sleep-surface dimensions and loose prop poses persisted. Reset now restores both.
- Rendered-bounds checks verified doll and mattress scale instead of merely reading config constants.
- A hero capture exposed head clipping; adjusted the card/control projection and separated their anchors.
- Repeated real drag tests exposed depth amplification against LEAF's simulated ray limit. Disabled depth stretching on practice props and added measured released-pose checks to the test driver.

## Verification and delivery

The exact current test results, remaining limitations and capture evidence are recorded in [verification.md](verification.md). Earlier individual passes are not substituted for a final revision run. CI configuration and a demo sequence are supplied; neither a GitHub CI run nor a public video is claimed without observed evidence.

Sources, attribution, limits, the submission draft and a timed demo script are included for review. No clinical approval, real-infant monitoring, hardware testing, public repository or hackathon submission is implied.

Final local results: 11 Node test groups passed, eight mutations caught, 12 of 13 Preview regression scenarios passed. The current pacing check timed out at 120 and 180 seconds; no final pass is claimed. Hero and welcome capture scenarios passed and their PNGs were visually inspected. The full demo-film sequence is authored but not verified end to end. User requested local-only delivery. Saved the scene through the editor and created checkpoint b1e7d4b; a follow-up documentation commit records these results.

## Submission-readiness follow-up — 2026-11-09

User requested product completion before video production, a three-minute script, and fully clothed adult caregiver imagery for breast practice. Prepared a 2:55 voiceover and shot list plus submission-readiness.md. Source audit found no maternal photographs or exposed-breast assets, but also no caregiver placement model; that addition is pending. Lens Studio MCP tools disappeared from the current tool registry, so no runtime/scene edits or new Preview passes are claimed. Official rules were checked; public repository, public YouTube video and Devpost Learn skill-pack planning remain submission requirements. Local-only publishing preference remains in effect.

## Final product verification — 2026-11-10 (Asia/Calcutta)

Restored the Lens Studio MCP connection and verified the correct project. The unchanged real pacing test passed. Added original fully clothed caregiver illustrations, rejected faulty anatomy/cutout variants, and verified three reference crops with matching doll placements and hidden bottle props. Added explicit on-back and whole-doll sleep-space checks against a red unit test; the new logic and Preview scenario passed. The user clarified the feeding/sleep practice-guide scope and delegated final review. Applied the official Devpost Learn template transparently as a post-build review, without inventing an earlier interview.

Corrected rotated visual bounds, verified breast practice from two camera viewpoints and sleep containment with a rotated crib. Final results: 12 logic groups passed, 10 mutations caught, 14 Preview regressions passed, five final captures inspected and full updated rehearsal passed. Saved the scene through the editor. Runtime checkpoint a1f4124 is followed by repository normalization and final handoff documentation. Fixed Lens Studio Git attributes routing .cjs source into LFS, validated local LFS objects, and passed all 12 tests from a fresh staged export with actual image/package binaries restored. No video or public upload was performed. Clinical review, hardware feel and live voice remain unverified.
