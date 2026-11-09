import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {findSceneObjectByName,sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {storyEnter,storyTap} from './SafeNightDemoTools';
@component
export class SafeNightSleepPositionScenario extends Scenario {
 async run():Promise<void>{
  const i=new DefaultLeafInteractor(),main=await storyEnter(i);for(const id of ['asleep','handoff','place-doll','clear-hazards'])await storyTap(i,id);
  for(const id of ['clear-hazards','hazard','confirm-surface','try-side']){const p=main.camera.worldSpaceToScreenSpace(findSceneObjectByName('Action '+id).getTransform().getWorldPosition());expect(p.x).toBeGreaterThan(0.05);expect(p.x).toBeLessThan(0.95);expect(p.y).toBeGreaterThan(0.05);expect(p.y).toBeLessThan(0.95);}
  await storyTap(i,'try-side');await sleep(1300);expect(main.getCue()).toBe('SLEEP-BACK');
  main.action('finish');expect(main.getState()).toBe('SleepSpaceCheck');
  await storyTap(i,'on-back');await sleep(900);expect(main.getResults().find(r=>r.id==='SLEEP-BACK').active).toBe(false);
  const t=main.doll.sceneObject.getTransform();t.setWorldPosition(main.crib.getTransform().getWorldPosition().add(new vec3(100,10,0)));await sleep(1300);expect(main.getCue()).toBe('SLEEP-IN-SPACE');
  await storyTap(i,'on-back');await sleep(900);expect(main.getResults().find(r=>r.id==='SLEEP-IN-SPACE').active).toBe(false);
  const cribTransform=main.crib.getTransform(),rotation=cribTransform.getWorldRotation();cribTransform.setWorldRotation(rotation.multiply(quat.fromEulerAngles(0,0,5*Math.PI/180)));main.action('on-back');await sleep(400);expect(main.getResults().find(r=>r.id==='SLEEP-IN-SPACE').violated).toBe(false);cribTransform.setWorldRotation(rotation);main.action('on-back');
  main.action('input');await sleep(250);expect(main.getResults().filter(r=>['SLEEP-BACK','SLEEP-IN-SPACE'].includes(r.id)).every(r=>r.evidence==='UNKNOWN')).toBe(true);
  await storyTap(i,'input');await storyTap(i,'confirm-surface');await sleep(800);await storyTap(i,'finish');expect(main.getState()).toBe('Done');
 }
}
