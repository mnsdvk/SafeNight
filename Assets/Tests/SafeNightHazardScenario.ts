import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {findInteractablesByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {findSceneObjectByName,sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {SafeNightMain} from '../Scripts/SafeNightMain';

function controller():SafeNightMain{return findSceneObjectByName('Safe Night Controller').getComponent(SafeNightMain.getTypeName()) as SafeNightMain;}
async function tap(i:DefaultLeafInteractor,id:string):Promise<void>{const target=findInteractablesByName('Action '+id,undefined,true)[0];expect(!!target).toBe(true);await i.trigger(target);await sleep(350);}
async function enter(i:DefaultLeafInteractor,mode='bottle'):Promise<SafeNightMain>{const main=controller();main.reset();await sleep(400);expect(main.getState()).toBe('Welcome');expect(main.getCardCount()).toBe(1);await tap(i,'begin');await tap(i,mode);await tap(i,'select-surface');await tap(i,'place');expect(main.getState()).toBe('Feed');return main;}

@component
export class SafeNightHazardScenario extends Scenario {
 async run():Promise<void>{const i=new DefaultLeafInteractor();const main=await enter(i);await tap(i,'asleep');await tap(i,'handoff');await tap(i,'place-doll');await tap(i,'hazard');await sleep(1300);expect(main.getResults().find(r=>r.id==='SLEEP-BARE').active).toBe(true);await tap(i,'clear-hazards');await sleep(900);expect(main.getResults().find(r=>r.id==='SLEEP-BARE').active).toBe(false);expect(main.getCardCount()).toBe(1);}
}
