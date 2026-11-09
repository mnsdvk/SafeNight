# Final local verification

Verified 2026-11-10, Asia/Calcutta. Lens Studio 5.24.1, LEAF 2.0.2, Node 24.21.0. Exact final returns: [submission-final-results.json](submission-final-results.json). The older final-results.json is retained as historical evidence and is superseded by this report.

**12 Node test groups passed. All 10 mutations were caught. All 14 Preview regressions passed. The complete demo rehearsal passed.** No video has been recorded or published in this phase.

## Preview regressions

| Scenario | Final result | Evidence |
|---|---|---|
| safe-night-sleep-position | Passed | Side-pose cue, correction onto the back, whole-doll containment, rotated crib, input loss, gated completion and in-view controls |
| safe-night-full-feed | Passed | Welcome through Done using the real UI |
| safe-night-breast-mode | Passed | Clothed reference texture, hidden bottle props, three actual doll placements, full rendered bounds and reset |
| safe-night-hero-support | Passed | Real manipulation, measured released pose, sustained support cue and clearing |
| safe-night-unknown-input | Passed | Missing input withdraws cues and remains UNKNOWN |
| safe-night-propped-bottle | Passed | Propped-bottle priority and withdrawal on input loss |
| safe-night-sleep-hazard | Passed | Oriented soft-object volume and cue clearing |
| safe-night-evidence-review | Passed | Named modeled checks, user confirmation, unknown and untested conditions |
| safe-night-chair-location | Passed | Actual doll/chair volume entry and exit |
| safe-night-real-scale | Passed | Rendered doll and mattress dimensions |
| safe-night-visible-access | Passed | Disclaimer, one instruction card, visible controls, unknown outline, edge cue and configured spatial chime |
| safe-night-ik-ray-reach | Passed, fail-fast | Intended IK ray, without fallback |
| safe-night-restart-clean | Passed | Surface dimensions and loose-object poses restored |
| safe-night-pacing-timer | Passed | Actual unchanged 45-second demo interval and pause clearing |

The breast bounds test also passed at the angled sleep-view camera pose. Bounds now transform each mesh's local box instead of re-projecting an inflated world-axis box. Sleep containment uses the same geometric correction. New sleep logic was written against a failing unit test, then verified in Preview; tests reject missing position data instead of passing it.

## Visual evidence

All five final capture scenarios returned succeeded and their native Preview PNGs were visually inspected:

- [Clothed cradle reference](evidence/breast-cradle.png)
- [Clothed cross-cradle reference](evidence/breast-cross.png)
- [Clothed alongside reference](evidence/breast-alongside.png)
- [Side-pose correction cue](evidence/sleep-side.png)
- [Doll on its back in the infant sleep space](evidence/sleep-back.png)

The selected artwork has an opaque high-neck top, covered abdomen and clothed doll, with no exposed breast imagery. Rejected extra-limb and faulty-cutout variants were not imported. The third pose is labeled alongside placement, not a clinically verified football hold. These are illustrations and simulation observations, not proof of clinical accuracy.

The sleep captures use a direct view of the crib. Text sits above the task and controls below the doll. Restore the baseline camera before running regressions: position (0,0,3.45), lookAt (0,-0.22,2.45). The native Preview camera uses x/y/z fields for lookAt commands. For the crib shot after entering the sleep stage: position (125,45,20), lookAt (125,-75,-160).

## End-to-end rehearsal and repository

safe-night-demo-film passed on the final build, including bottle support correction, unknown input, all three breast references, handoff, hazard removal, side-pose/on-back correction and evidence review. This is a verified development rehearsal, not an exported or uploaded video.

Git LFS fsck passed. A fresh staged export restored the actual 1,899,806-byte caregiver image and 269,073-byte LEAF package, and all 12 Node groups passed from that export. Node .cjs files are explicitly normal text. GitHub CI has not run. This clean submission export includes actual binary files and ordinary-Git attribute overrides; Git LFS is not required for this handoff.

## Limits and history

Clinical review, real-infant use, Specs hardware, long-term comfort, perceived audio direction, live microphone ASR, and video/audio export remain unverified. Native audio-export sink warnings occurred during earlier refreshes; check the actual recording pipeline during the video phase. No Lens script exception was observed in the final startup check.

Earlier package incompatibilities, timeouts, camera framing errors, rejected artwork and bounds failures are documented in build-log.md and prior reports. They are not counted as successful checks. The connection was restored and the earlier pacing timeout was resolved without shortening the product timer or weakening its assertions.
