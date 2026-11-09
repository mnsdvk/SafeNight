import {scenariosIndex} from 'Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator';
import {ScenarioMetadata} from 'Leaf.lspkg/Scenarios/scenario/ScenarioMetadata';
import {SafeNightFlowScenario} from './SafeNightFlowScenario';
import {SafeNightHeroScenario} from './SafeNightHeroScenario';
import {SafeNightUnknownScenario} from './SafeNightUnknownScenario';
import {SafeNightBreastScenario} from './SafeNightBreastScenario';
import {SafeNightHazardScenario} from './SafeNightHazardScenario';
import {SafeNightProppedScenario} from './SafeNightProppedScenario';
import {SafeNightScaleScenario} from './SafeNightScaleScenario';
import {SafeNightPacingScenario} from './SafeNightPacingScenario';
import {SafeNightAccessScenario} from './SafeNightAccessScenario';
import {SafeNightIKScenario} from './SafeNightIKScenario';
import {SafeNightRestartScenario} from './SafeNightRestartScenario';
import {SafeNightCaptureScenario} from './SafeNightCaptureScenario';
import {SafeNightDemoScenario} from './SafeNightDemoScenario';
import {SafeNightReviewScenario} from './SafeNightReviewScenario';
import {SafeNightLocationScenario} from './SafeNightLocationScenario';
import {SafeNightSleepPositionScenario} from './SafeNightSleepPositionScenario';

@component
export class SafeNightLeafIndex extends BaseScriptComponent {
 @scenariosIndex
 static scenariosIndex:ScenarioMetadata[]=[
  {id:'safe-night-sleep-position',typename:SafeNightSleepPositionScenario.getTypeName() as unknown as ScenarioMetadata['typename']},
  {id:'safe-night-evidence-review',typename:SafeNightReviewScenario.getTypeName() as unknown as ScenarioMetadata['typename']},
  {id:'safe-night-chair-location',typename:SafeNightLocationScenario.getTypeName() as unknown as ScenarioMetadata['typename']},
  {id:'safe-night-full-feed',typename:SafeNightFlowScenario.getTypeName() as unknown as ScenarioMetadata['typename']},
  {id:'safe-night-hero-support',typename:SafeNightHeroScenario.getTypeName() as unknown as ScenarioMetadata['typename']},
  {id:'safe-night-unknown-input',typename:SafeNightUnknownScenario.getTypeName() as unknown as ScenarioMetadata['typename']},
  {id:'safe-night-breast-mode',typename:SafeNightBreastScenario.getTypeName() as unknown as ScenarioMetadata['typename']},
  {id:'safe-night-sleep-hazard',typename:SafeNightHazardScenario.getTypeName() as unknown as ScenarioMetadata['typename']},
  {id:'safe-night-propped-bottle',typename:SafeNightProppedScenario.getTypeName() as unknown as ScenarioMetadata['typename']},
  {id:'safe-night-real-scale',typename:SafeNightScaleScenario.getTypeName() as unknown as ScenarioMetadata['typename']},
  {id:'safe-night-pacing-timer',typename:SafeNightPacingScenario.getTypeName() as unknown as ScenarioMetadata['typename']},
  {id:'safe-night-visible-access',typename:SafeNightAccessScenario.getTypeName() as unknown as ScenarioMetadata['typename']},
  {id:'safe-night-ik-ray-reach',typename:SafeNightIKScenario.getTypeName() as unknown as ScenarioMetadata['typename']},
  {id:'safe-night-restart-clean',typename:SafeNightRestartScenario.getTypeName() as unknown as ScenarioMetadata['typename']},
  {id:'safe-night-capture-beat',typename:SafeNightCaptureScenario.getTypeName() as unknown as ScenarioMetadata['typename'],parameters:{beat:'hero'}},
  {id:'safe-night-demo-film',typename:SafeNightDemoScenario.getTypeName() as unknown as ScenarioMetadata['typename'],parameters:{shot:'full'}}
 ];
}
