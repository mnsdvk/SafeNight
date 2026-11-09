import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {ScenarioConfig} from 'Leaf.lspkg/Scenarios/scenario/ScenarioConfig';
import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {storyController,storyTap,storyDragTo,storyEnter} from './SafeNightDemoTools';
@component
export class SafeNightDemoScenario extends Scenario {
 async run(config:ScenarioConfig):Promise<void>{
  const shot=config.getOrThrow('shot');const i=new DefaultLeafInteractor();let main=storyController();
  if(shot==='welcome'){main.reset();await sleep(12000);return;}
  if(shot==='setup'){main.reset();await sleep(1000);for(const id of ['begin','breast','select-surface','place'])await storyTap(i,id,2500);await sleep(4000);return;}
  if(shot==='breast'||shot==='full'){
   main=await storyEnter(i,'breast');await sleep(3000);await storyTap(i,'hold',3000);await storyTap(i,'hold',3000);
   expect(main.caregiver.sceneObject.enabled).toBe(true);expect(main.bottle.enabled).toBe(false);
   const start=main.doll.sceneObject.getTransform().getWorldPosition();
   await storyDragTo(this,i,start.add(new vec3(0,0,-28)));await sleep(3500);expect(main.getCue()).toBe('SHARED-SUPPORT');
   print('[SafeNight film] Breast head-support cue verified');
   await storyDragTo(this,i,start);await sleep(3000);expect(main.getResults().find(r=>r.id==='SHARED-SUPPORT').active).toBe(false);
   print('[SafeNight film] Breast correction verified');await sleep(3000);if(shot!=='full')return;
  }
  if(shot==='bottle'||shot==='full'){
   main=await storyEnter(i);await sleep(3000);await storyTap(i,'input',6500);expect(main.getResults().every(r=>r.evidence==='UNKNOWN')).toBe(true);await storyTap(i,'input',3500);if(shot!=='full')return;
  }
  if(shot==='handoff'||shot==='full'){
   main=await storyEnter(i);await sleep(1500);await storyTap(i,'sleepy',8000);await storyTap(i,'handoff',8000);if(shot!=='full')return;
  }
  if(shot==='sleep'||shot==='full'){
   if(shot==='sleep'){main=await storyEnter(i);for(const id of ['asleep','handoff'])await storyTap(i,id);}
   await storyTap(i,'place-doll',2000);await storyTap(i,'clear-hazards',1500);await storyTap(i,'try-side',4000);expect(main.getCue()).toBe('SLEEP-BACK');
   await storyTap(i,'on-back',2500);expect(main.getResults().find(r=>r.id==='SLEEP-BACK').active).toBe(false);
   await storyTap(i,'hazard',4000);expect(main.getResults().find(r=>r.id==='SLEEP-BARE').active).toBe(true);
   await storyTap(i,'clear-hazards',2500);await storyTap(i,'confirm-surface',2000);await storyTap(i,'finish',7000);expect(main.getState()).toBe('Done');return;
  }
  throw Error('Unknown filming shot '+shot);
 }
}
