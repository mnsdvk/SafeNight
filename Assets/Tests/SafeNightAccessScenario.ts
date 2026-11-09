import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {findInteractablesByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {findSceneObjectByName,findSceneObjectsByName,sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {SafeNightMain} from '../Scripts/SafeNightMain';
@component
export class SafeNightAccessScenario extends Scenario {
 async run():Promise<void>{
  const main=findSceneObjectByName('Safe Night Controller').getComponent(SafeNightMain.getTypeName()) as SafeNightMain;const i=new DefaultLeafInteractor();main.reset();await sleep(350);
  const body=()=> (findSceneObjectByName('Card Body').getComponent('Component.Text') as Text).text;
  expect(body().includes('No real baby')).toBe(true);expect(main.nursery.enabled).toBe(false);
  const check=()=>expect(findSceneObjectsByName('Single instruction card').filter(o=>o.enabled).length).toBe(1);
  const tap=async(id:string)=>{check();await i.trigger(findInteractablesByName('Action '+id,undefined,true)[0]);await sleep(300);check();};
  for(const id of ['begin','bottle','adult-bed'])await tap(id);expect(body().includes('separate infant sleep')).toBe(true);await tap('cycle-surface');await tap('select-surface');await tap('place');
  for(const id of ['sleepy','asleep','pause','input']){const o=findSceneObjectByName('Action '+id);const p=main.camera.worldSpaceToScreenSpace(o.getTransform().getWorldPosition());expect(p.x).toBeGreaterThan(0.05);expect(p.x).toBeLessThan(0.95);expect(p.y).toBeGreaterThan(0.05);expect(p.y).toBeLessThan(0.95);}
  await tap('input');expect(body().includes("Can't check position")).toBe(true);expect(findSceneObjectByName('Unknown outline').enabled).toBe(true);await tap('input');
  await tap('sleepy');expect(main.camera.isSphereVisible(main.crib.getTransform().getWorldPosition(),8)).toBe(false);const wayfinder=(findSceneObjectByName('Card Callout').getComponent('Component.Text') as Text).text;expect(wayfinder.includes('Sleep space')).toBe(true);expect(main.chime.isPlaying()).toBe(true);expect(main.chime.spatialAudio.enabled).toBe(true);expect(!!main.camera.sceneObject.getComponent('Component.AudioListenerComponent')).toBe(true);
 }
}
