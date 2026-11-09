# Sources and interpretation notes

Reviewed 2026-11-09. These references support the cited general guidance; they do not validate this Lens or its numeric proxies. Registry status is `sourced-secondary`, with clinician review pending.

| Reference | Use in the demo | Limit |
|---|---|---|
| [NHS: bottle feeding](https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/bottle-feeding/bottle-feeding-your-baby/) | Semi-upright bottle-feeding concept, bottle kept almost horizontal, responsive pauses | Head-rise and timing parameters are invented demo proxies; no clinical angle or schedule is claimed |
| [CDC: feeding from a bottle](https://www.cdc.gov/infant-toddler-nutrition/bottle-feeding/index.html) | Holding rather than propping a bottle | Contact between simulated volumes does not establish safe real-world handling |
| [NHS: positioning and attachment](https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/breastfeeding/positioning-and-attachment/) | Head/body alignment concept | Geometric landmark alignment cannot assess latch or feeding |
| [NHS: breastfeeding positions](https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/breastfeeding/how-to-breastfeed/breastfeeding-positions/) | Cradle, cross-cradle, football/rugby hold labels | Short PLACEHOLDER prompts need clinician review |
| [NICHD: safe sleep environment](https://safetosleep.nichd.nih.gov/safe-sleep/environment) | Separate infant surface, no loose soft objects, attention to sofas/armchairs when sleepy | Simulated category and volume checks cannot certify a real sleep environment |
| [AAP: safe sleep policy explained](https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/A-Parents-Guide-to-Safe-Sleep.aspx) | Firm, flat surface; incline boundary cited in the registry | Angle alone cannot establish suitability |
| [CPSC: full-size baby cribs](https://www.cpsc.gov/FAQ/Full-Size-Baby-Cribs) | Nominal internal dimensions of approximately 71 × 133 cm | Illustrative model, not a compliant crib design or manufacturing plan |

Technical API signatures were checked against this project's `Support/StudioLib.d.ts`, `Support/editor.d.ts`, installed SIK/UIKit/LEAF source, and the bundled CLAD skills. Generated Support/Cache files are not committed or edited.

Official references: [LEAF guide](https://developers.specs.com/docs/clad/tools/test-your-lens-with-leaf), [hackathon rules](https://learn-specs.devpost.com/rules), [GitHub checkout](https://github.com/actions/checkout), [GitHub setup-node](https://github.com/actions/setup-node).

Submission-presentation references supplied by the user: [Glare Zone](https://devpost.com/software/glare-zone), [Someone](https://devpost.com/software/someone-s9vfd3). Their claims were not treated as independent evidence for this project.

The explicit on-back sleep lesson is adapted from NICHD Safe to Sleep: https://safetosleep.nichd.nih.gov/reduce-risk/back-sleeping . It is demonstrated with a virtual doll on a separate infant surface. The facing-angle tolerance and whole-model containment are unreviewed simulation implementations, not real-infant measurements.
