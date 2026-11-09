import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {findInteractablesByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {findSceneObjectByName,sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {SafeNightMain} from '../Scripts/SafeNightMain';
import {storyDragTo} from './SafeNightDemoTools';

function controller():SafeNightMain{return findSceneObjectByName('Safe Night Controller').getComponent(SafeNightMain.getTypeName()) as SafeNightMain;}
async function tap(i:DefaultLeafInteractor,id:string):Promise<void>{const target=findInteractablesByName('Action '+id,undefined,true)[0];expect(!!target).toBe(true);await i.trigger(target);await sleep(350);}
async function enter(i:DefaultLeafInteractor,mode='bottle'):Promise<SafeNightMain>{const main=controller();main.reset();await sleep(400);expect(main.getState()).toBe('Welcome');expect(main.getCardCount()).toBe(1);await tap(i,'begin');await tap(i,mode);await tap(i,'select-surface');await tap(i,'place');expect(main.getState()).toBe('Feed');return main;}

@component
export class SafeNightHeroScenario extends Scenario {
 async run():Promise<void>{
  const i=new DefaultLeafInteractor();const main=await enter(i);await sleep(1200);
  const doll=findInteractablesByName('Virtual Newborn Doll',undefined,true)[0];expect(!!doll).toBe(true);
  const start=findSceneObjectByName('Virtual Newborn Doll').getTransform().getWorldPosition();
  await storyDragTo(this,i,start.add(new vec3(0,0,-28)));await sleep(1300);
  expect(main.getCue()).toBe('SHARED-SUPPORT');expect(main.getCardCount()).toBe(1);
  const moved=findSceneObjectByName('Virtual Newborn Doll').getTransform().getWorldPosition();expect(start.z-moved.z).toBeGreaterThan(20);
  await storyDragTo(this,i,start);await sleep(1000);
  expect(main.getResults().find(r=>r.id==='SHARED-SUPPORT').active).toBe(false);
 }
}
