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
export class SafeNightScaleScenario extends Scenario {
 async run():Promise<void>{const main=controller();await enter(new DefaultLeafInteractor());const doll=findSceneObjectByName('Virtual Newborn Doll');const transform=doll.getTransform();const rotation=transform.getWorldRotation();transform.setWorldRotation(quat.quatIdentity());await sleep(150);let low=Infinity,high=-Infinity;
  const visit=(o:SceneObject)=>{const v=o.getComponent('Component.RenderMeshVisual') as RenderMeshVisual;if(v){low=Math.min(low,v.worldAabbMin().y);high=Math.max(high,v.worldAabbMax().y);}for(let i=0;i<o.getChildrenCount();i++)visit(o.getChild(i));};visit(doll);expect(high-low).toBeGreaterThan(49);expect(high-low).toBeLessThan(51);transform.setWorldRotation(rotation);
  const mattress=findSceneObjectByName('Fitted mattress').getComponent('Component.RenderMeshVisual') as RenderMeshVisual;const size=mattress.worldAabbMax().sub(mattress.worldAabbMin());expect(size.x).toBeCloseTo(71,1);expect(size.z).toBeCloseTo(133,1);const t=transform.getWorldScale();expect(t.x).toBeCloseTo(1,3);expect(t.y).toBeCloseTo(1,3);expect(t.z).toBeCloseTo(1,3);print('[SafeNight measurement] '+JSON.stringify({dollLengthCm:high-low,cribMattressWidthCm:size.x,cribMattressLengthCm:size.z,simulation:true}));}
}
