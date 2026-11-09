---
status: approved
review_date: 2026-11-09
review_type: post-build review using prior approved user decisions
approval_basis: user confirmed feeding-and-sleep guide scope and delegated final review in chat
---

# Design brief: Safe Night

This official-template review was prepared after the initial build. It consolidates the user's approved attachment and later requests; it is not a backdated planning interview. Original brief: approved-brief.md. Official pack source: challengepost/learn-specs, commit 5d8bc0800346d38e468c29b15afcb7ca92280005. Publication remains local only until separately authorized.

## The one spatial moment

In a virtual nursery, move a clothed newborn practice doll away from a simulated supporting arm. One head-support cue appears after a sustained change, then clears after correction. Breast practice uses fully clothed caregiver references and matching doll placements. Sleep practice explicitly checks on-back placement and whole-doll containment. Continue through the explicit sleepy/asleep handoff into a separate simulated infant sleep space.

## Why it belongs on glasses

- Uses: draws in the world and keeps the user's eyes near the task.
- The doll, support and sleep space have spatial relationships. The hero cue sits at the doll's head; an off-view destination gets a direction cue and quiet chime. The actual design still needs hardware comfort testing.
- A flat illustrated reference is supplemental and appears only during breast practice; it is not the central AR interaction.

## Product or overlay

- Type: product; the virtual practice is the experience.
- What the real version would sense: nothing in this project. No real infant or caregiver detection.
- Preview stand-in: deliberately virtual doll, supporting-arm geometry and nursery. The user explicitly selects sleepy/asleep; this is not sensed. Unknown input has a visible simulation control. No baby recognition, monitoring or medical assessment.

## Where things live

- Look toward the supported doll, a little below eye level.
- Doll: approximately 50 cm tall with procedural head, shoulder and hip landmarks; scaling locked. Bottle practice is roughly 1.1 m ahead (default).
- Instruction: one passive UIKit card, near the doll's head in Feed; about 90 cm projected distance (default). Explicit controls sit below the task.
- Infant surface: a separate object to the right. Nominal crib mattress 71 x 133 cm; other categories use clearly illustrative dimensions. A direction label and quiet spatial chime guide an off-view handoff.
- Breast reference: original generated mother-and-clothed-doll illustration, opaque high-neck top and covered abdomen; 28 cm square, about 1.15 m ahead at the left (default).
- Breast practice doll: at the right, actual 50 cm scale, about 2.3 m ahead (default) so the full doll remains visible beside the reference. This is farther than the usual primary-content focus range; comfort and depth switching remain unproven.

## Hands and input

- Pinch explicit UIKit controls to choose practice mode, infant surface, sleepy/asleep response, handoff, user confirmation and evidence review.
- Pinch and drag the doll, bottle and loose objects using SIK manipulation. Preserve authored scale.
- Change hold cycles three illustrative placements and their matching reference images. The third is labeled alongside placement; no claim of clinically verified football positioning.
- Targets are big and highlight when aimed at.
- Voice is optional, off by default and unverified live. The sleepy/asleep buttons perform the same actions.

## When things show

- Disclaimer first; nursery hidden until preparation reaches placement.
- Feed shows at most one instruction chosen by the priority arbiter. Demo dwell, hysteresis and slow fades avoid flicker.
- Violet dashed outline and a question mark communicate missing input; unknown never passes.
- Breast references appear only in breast Feed. Bottle props are hidden there. Illustrated caregivers remain fully clothed and the practice doll remains clothed.
- Handoff shows the destination direction when out of view and plays a quiet chime once.
- Review names modeled checks, user confirmation, unknown input and untested conditions. No safety score.

## Done criteria

1. Complete Welcome, Prepare, Feed, a sleepy/asleep response, Handoff, SleepSpaceCheck and Done using the actual controls.
2. Drag the doll away from support, observe one sustained head cue, return it and observe clearing. Missing input withdraws active cues and displays unknown.
3. Breast practice displays the clothed reference, hides bottle props, cycles actual doll placements, keeps the complete doll in view and resets cleanly.
4. Add a soft object to the modeled infant sleep volume, see its cue and remove it. Try a side pose, observe the on-back cue and correct it. Moving the doll out of the infant volume prompts placement back inside. Confirm surface firmness separately and review the distinct evidence levels.
5. Keep the card and controls readable and reachable, retain centimeter scale, and pass the real demo pacing interval and restart checks.

## Out of scope

- Real infant/caregiver recognition, recording or monitoring; clinical validation; latch, feeding effectiveness, breathing or swallowing assessment.
- A real caregiver's image or personal data; multiplayer; persistent anchors; automatic sleepiness detection.
- This phase does not record or publish the video. The user requested product readiness and the three-minute script first.

## Risks and open questions

- All clinical wording and geometry thresholds are unreviewed demo proxies. Head height is not a universal breastfeeding rule. The 45-second interval is not a real feeding schedule.
- Generated illustrations were reviewed for visible proportions, clothing and obvious limb errors, but have not been clinician reviewed. They are placement references, not technique diagrams.
- Logic can be shown in Preview; real comfort, display clarity on glasses, tracking, live voice and perceived spatial audio remain unproven.
- This is a truthful post-build skill-pack review. Organizer acceptance of the planning sequence is not established here.
- Public source and public YouTube links are still required at submission time; the user's local-only preference remains in effect.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
