# Asset provenance

| Asset | Origin | Notes |
|---|---|---|
| Doll, bottle, support models, crib, bed, chair, lamp, loose props, floor, cue outlines | Original procedural MeshBuilder code in `Assets/Scripts/SafeNightNurseryMesh.ts` | No downloaded mesh, texture, rig, or generative-model asset |
| Chime | Local algorithmic synthesis via CLAD `build-sfx` tools | Regenerator: `Assets/Tools/gen_sfx_sleepSpace.cjs`; WAV under `Assets/GeneratedSFX/` |
| Typography | Lens Studio system font | No separately downloaded font |
| UI controls, interaction, materials | Snap Lens Studio, SpectaclesUIKit, SpectaclesInteractionKit | SDK dependencies retain their vendor terms and attribution |
| LEAF testing | Snap LEAF 2.0.2 | Test dependency; no vendor source modified |
| Bitmoji 3D package | Automatically imported LEAF dependency | Not used as product artwork or in the custom IK solver scenario |
| Interactive room backdrop | Lens Studio bundled Evening Room preview environment | Simulation backdrop, not original project artwork |

No background music or third-party entry assets are used. The two Devpost pages supplied by the user were read only as presentation references. Their repositories were not opened and their code, wording, layout, palettes, and assets were not copied.

Some installed SDK packages include further dependencies and examples. Their presence does not imply that those assets are part of Safe Night's authored product visuals.

The caregiver reference atlas is original AI-generated illustration, produced with the built-in image_gen tool and visually reviewed. It uses no supplied photograph or identifiable real person. Prompts, rejected-variant handling and the selected asset are documented in devpost/artwork-provenance.md. Devpost Learn skill-pack template/review provenance is recorded in devpost/design-brief.md.
