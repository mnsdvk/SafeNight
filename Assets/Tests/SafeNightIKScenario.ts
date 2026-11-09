import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {IKBodyInteractor} from 'Leaf.lspkg/Interactors/interactor/ik/IKBodyInteractor';
import {findInteractablesByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {findSceneObjectByName,sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {SafeNightMain} from '../Scripts/SafeNightMain';
@component
export class SafeNightIKScenario extends Scenario {
 async run():Promise<void>{const main=findSceneObjectByName('Safe Night Controller').getComponent(SafeNightMain.getTypeName()) as SafeNightMain;main.reset();await sleep(400);
  // Use the same IK body/hand solver as createIKInteractor, without downloading a branded avatar.
  // No generic-interactor fallback is configured: a convergence failure remains a failure.
  const ik=new IKBodyInteractor();const target=findInteractablesByName('Action begin',undefined,true)[0];expect(ik.right.isIndirect(target)).toBe(true);await ik.trigger(target);await sleep(350);expect(main.getState()).toBe('Prepare');print('[SafeNight reach] IK solver operated the 110 cm control using the intended indirect ray. No hardware tested.');}
}
