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
export class SafeNightBreastScenario extends Scenario {
 async run():Promise<void>{const i=new DefaultLeafInteractor();const main=await enter(i,'breast');expect(main.getMode()).toBe('breast');expect(main.bottle.enabled).toBe(false);expect(main.bottleHand.enabled).toBe(false);expect(main.getResults().some(r=>r.id==='BOTTLE-HELD')).toBe(false);const caregiver=findSceneObjectByName('Fully clothed caregiver');expect(caregiver.enabled).toBe(true);let previous=main.doll.sceneObject.getTransform().getWorldPosition();for(let n=0;n<3;n++){expect(main.caregiver.getTexture().getWidth()).toBeGreaterThan(2000);for(const landmark of [main.doll.head,main.doll.hip]){const p=main.camera.worldSpaceToScreenSpace(landmark.getTransform().getWorldPosition());expect(p.x).toBeGreaterThan(0.05);expect(p.x).toBeLessThan(0.95);expect(p.y).toBeGreaterThan(0.28);expect(p.y).toBeLessThan(0.72);}const checkBounds=(o:SceneObject)=>{const v=o.getComponent('Component.RenderMeshVisual') as RenderMeshVisual;if(v){const lo=v.localAabbMin(),hi=v.localAabbMax(),world=o.getTransform().getWorldTransform();for(const x of [lo.x,hi.x])for(const y of [lo.y,hi.y])for(const z of [lo.z,hi.z]){const p=main.camera.worldSpaceToScreenSpace(world.multiplyPoint(new vec3(x,y,z)));expect(p.x).toBeGreaterThan(0.50);expect(p.x).toBeLessThan(0.98);expect(p.y).toBeGreaterThan(0.28);expect(p.y).toBeLessThan(0.74);}}for(let j=0;j<o.getChildrenCount();j++)checkBounds(o.getChild(j));};checkBounds(main.doll.sceneObject);await tap(i,'hold');const next=main.doll.sceneObject.getTransform().getWorldPosition();expect(previous.distance(next)).toBeGreaterThan(2);previous=next;}await tap(i,'asleep');expect(main.getState()).toBe('BabyAsleep');expect(main.getCardCount()).toBe(1);main.reset();expect(main.bottle.enabled).toBe(true);expect(caregiver.enabled).toBe(false);}
}
