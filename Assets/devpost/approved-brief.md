PROJECT: "Safe Night" — a Lens for Snap SPECS, built for the "Learn AR with SPECS" hackathon.

WORKFLOW (required, do first)
1. Run the plan-lens skill. Answer its interview using this brief. Save the approved brief and done criteria in /devpost/.
2. Build ONLY through CLAD and the Lens Studio MCP in Lens Studio. Verify in the Lens Studio preview. Never claim anything works unless you ran it in the preview or a test.
3. Check the CLAD skills and Snap docs for exact APIs (Spectacles Interaction Kit, UI Kit, ASR, audio, LEAF). Do not guess API names.
4. Keep /devpost/build-log.md: each session, what changed, what was verified.
5. Write tests BEFORE the features they cover. Commit often.

WHAT IT IS
A quiet, hands-free guide for a new mother during a night feed. Demonstrated entirely in simulation: virtual nursery, virtual newborn doll, simulated hand input in the preview. NO hardware, NO real baby, NO camera recognition. Say this plainly in the README, on the first screen, and in the video. It is a practice/guidance concept, not a monitor, not a medical device, and it never claims to detect breathing, choking, swallowing or sleepiness.

ORIGINALITY
Take inspiration from the standard of strong entries (clear design rules, tests, honest limits) but copy nothing: no code, names, copy, palette, assets or structure from any other entry. Do not read other entries' repos. All assets are procedural, CC0 or synthesized, listed in ATTRIBUTION.md. No copyrighted music or trademarks.

DESIGN PRINCIPLES
- Silent by default. Speak only when something matters. One card on screen at a time.
- Information sits on the thing it describes (cue appears at the baby's head, not in a panel).
- Designed for a dark room and an additive display: black renders transparent, so use light elements on the world. Warm white (text), soft teal (good/clear), amber (needs attention), dusty violet with a "?" glyph and dashed outline (unknown). Never rely on colour alone.
- One clean typeface, sentence case, short sentences. Slow fades (300-500 ms).
- Elements 0.6-1.6 m away, slightly below eye level, inside the Specs field of view. Check exact numbers in Snap's spatial design guidance.
- Captions for every spoken line. Directional chime plus an edge indicator for anything out of view (the sleep space).

FEEDING MODES
Chosen at Prepare. Both run on ONE data-driven rule engine.
- Bottle (hero, fully polished).
- Breast (smaller module: shared rules plus a hold guide for cradle / cross-cradle / football placement).

FLOW (state machine, views are passive)
Welcome(disclaimer first) -> Prepare(pick mode, pick sleep-space type, place nursery) -> Feed -> [SleepyResponse | BabyAsleep] -> Handoff -> SleepSpaceCheck -> Done(summary).
Sleep-space types: crib, bassinet, play yard, other firm flat infant surface. Adult bed or sofa chosen as the sleep space triggers a gentle redirect.
Voice commands via the ASR module: "I'm sleepy" (mother) and "baby's asleep". If ASR is not compatible with the preview, use explicit buttons as fallback and say so.

HERO INTERACTION (must be flawless)
The user grabs the virtual baby with simulated hands and changes its position. A relevant cue appears at the affected body part after a short sustained dwell. The user corrects it. The cue dissolves quietly after sustained correction. No flicker near thresholds.

SIMULATION
- Baby model with head, shoulder, hip landmarks; real newborn scale. Head/neck supported by hand/arm colliders.
- Bottle object with tilt; contact with a hand collider means "held"; resting on a pillow/object near the mouth means "propped".
- Nursery at real scale: crib interior about 71 x 133 cm (verify against standards), parents' bed, armchair/sofa, lamp, plus draggable objects (pillow, blanket, bumper, plush toy).
- Procedural meshes in real centimetres; low-poly, polished, consistent.

RULE REGISTRY (data, not code)
Each rule: id, mode(shared|bottle|breast|sleep), geometric condition, cue text (qualitative, no numbers shown to the user), source, status (sourced-secondary | clinician-reviewed | unverified), evidence level produced.
Initial rules (all status "sourced-secondary, pending clinician review"):
- SHARED-HEAD-HIGH: baby's head higher than hips; not flat. Cue: "Raise the baby's head a little."
- SHARED-ALIGN: head and neck in line with the body.
- SHARED-SUPPORT: head and neck supported by a hand/arm.
- BOTTLE-HELD: bottle held, never propped. Highest priority.
- BOTTLE-PACED: bottle kept near horizontal; periodic pause cue.
- SLEEP-FLAT: sleep surface flat and not inclined (AAP wording: no more than about 10 degrees).
- SLEEP-BARE: no soft objects/bedding in the sleep space.
- SLEEP-SEPARATE: baby goes to a separate infant sleep surface.
- FEED-LOCATION: warn about soft armchair/sofa as a place to fall asleep with the baby.
Thresholds live in ONE config file labelled "DEMO SIMULATION PARAMETERS — pending clinical review". They are never presented as medical numbers. The "I'm sleepy" response and all wording live in editable JSON marked PLACEHOLDER; keep wording minimal and neutral (e.g. "Let's get the baby to the sleep space."). Do not invent clinical sequences.

ENGINE REQUIREMENTS
- Hysteresis and dwell: cues appear only after sustained wrongness and clear only after sustained correction.
- Prompt arbiter: priorities (propped bottle > position > pacing > handoff), cooldowns, queue, exactly one card at a time.
- Evidence levels: MODELED (measured in simulation), CONFIRMED (user confirmed), UNKNOWN. UNKNOWN never counts as a pass.
- If pose data is lost, withdraw positioning cues and show "Can't check position right now." Never treat missing data as success.
- Session summary lists what was modeled, confirmed and unknown.
- Pure-logic modules (geometry, rules, arbiter, state machine) have NO Lens APIs, so they run under plain Node tests.

TESTS (choose meaningful failures, not a number)
Unit: geometry; hysteresis (jitter around threshold; exact appear/clear timing); arbiter (simultaneous rules -> one card, priority, cooldown); state machine (valid/invalid transitions, interruptions); evidence aggregation (unknown never passes); registry validation (every rule has source and status); object-in-sleep-space volume boundaries (just in vs just out); surface incline boundaries; missing input.
LEAF scenarios in the preview: full night feed end to end; hero interaction (cue appears at head, correct, cue clears); propped bottle; pause cue; "I'm sleepy" by voice and by fallback; "baby's asleep" handoff; edge indicator when the sleep space is out of view; hazard flagged then removed; unknown-input case; breast-mode scenario; one-card-at-a-time across the whole session; real-size measurement of crib and baby; captions present for every spoken line; disclaimer shown first.
Mutation check: a script that breaks thresholds and conditions on purpose and confirms the tests fail. Report results honestly.
CI: GitHub Actions runs unit tests on every push.
The same scripted scenario that LEAF runs is used to record video footage, so the video shows the real Lens. Log one decision line per cue.

OUT OF SCOPE (say so in the README)
Real-newborn recognition, automatic sleepiness/swallowing detection, breathing monitoring, emergency response, hardware testing, furniture optimization, practice scoring.

REPO AND DELIVERABLES
- Public repo with the Lens Studio project, /devpost (brief, done criteria, build log), /sources (links and notes), README, LIMITS.md, ATTRIBUTION.md.
- README maps each judging criterion (Design, Technical Implementation, Innovation, Presentation) to concrete evidence in the repo.
- Draft the Devpost description: what it does, who it's for, what we learned, limits stated plainly.
- Draft a demo script under 3 minutes: 15s problem, night feed with the hero correction, "I'm sleepy" and handoff, sleep-space check, unknown-input moment, 30s on the plan brief, CLAD sessions and tests, then limits.
- Final report: what works, what is unverified, how to run tests, known issues.

QUALITY BAR
Polish over breadth. Cut anything that weakens the hero interaction. If any rule or API is uncertain, mark it unverified and say so; never fake it.