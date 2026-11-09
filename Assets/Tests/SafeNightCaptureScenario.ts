import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {ScenarioConfig} from 'Leaf.lspkg/Scenarios/scenario/ScenarioConfig';
import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {storyController,storyEnter,storyTap,storyDragTo} from './SafeNightDemoTools';
@component
export class SafeNightCaptureScenario extends Scenario {
 async run(config:ScenarioConfig):Promise<void>{const beat=config.getOrThrow('beat');const i=new DefaultLeafInteractor();let main=storyController();
  if(beat==='welcome'){main.reset();await sleep(700);expect(main.getState()).toBe('Welcome');return;}
  main=await storyEnter(i,beat.startsWith('breast-')?'breast':'bottle');
  if(beat.startsWith('breast-')){const count=beat==='breast-cradle'?0:beat==='breast-cross'?1:beat==='breast-alongside'?2:-1;if(count<0)throw Error('Unknown breast capture');for(let n=0;n<count;n++)await storyTap(i,'hold');await sleep(1000);expect(main.caregiver.sceneObject.enabled).toBe(true);return;}
  if(beat==='sleep-back'||beat==='sleep-side'){for(const id of ['asleep','handoff','place-doll','clear-hazards'])await storyTap(i,id);if(beat==='sleep-side'){await storyTap(i,'try-side');await sleep(1300);expect(main.getCue()).toBe('SLEEP-BACK');}else{await sleep(900);expect(main.getResults().find(r=>r.id==='SLEEP-BACK').violated).toBe(false);}return;}
  if(beat==='hero'){const p=main.doll.sceneObject.getTransform().getWorldPosition();await storyDragTo(this,i,p.add(new vec3(0,0,-28)));await sleep(1300);expect(main.getCue()).toBe('SHARED-SUPPORT');}
  else if(beat==='unknown'){await storyTap(i,'input');await sleep(800);expect(main.getPoseAvailable()).toBe(false);}
  else if(beat==='handoff'){await storyTap(i,'sleepy');await sleep(700);expect(main.getState()).toBe('SleepyResponse');}
  else if(beat==='summary'){for(const id of ['asleep','handoff','place-doll','clear-hazards','confirm-surface'])await storyTap(i,id);await sleep(900);await storyTap(i,'finish');expect(main.getState()).toBe('Done');}
  else if(beat!=='feed')throw Error('Unknown capture beat '+beat);
  await sleep(800);
 }
}
