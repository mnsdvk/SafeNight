import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {findInteractablesByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {findSceneObjectByName,sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {SafeNightMain} from '../Scripts/SafeNightMain';
@component
export class SafeNightPacingScenario extends Scenario {
 async run():Promise<void>{const main=findSceneObjectByName('Safe Night Controller').getComponent(SafeNightMain.getTypeName()) as SafeNightMain;const i=new DefaultLeafInteractor();main.reset();await sleep(350);for(const id of ['begin','bottle','select-surface','place']){await i.trigger(findInteractablesByName('Action '+id,undefined,true)[0]);await sleep(250);}await sleep(46500);expect(main.getCue()).toBe('BOTTLE-PACED');await i.trigger(findInteractablesByName('Action pause',undefined,true)[0]);await sleep(1000);expect(main.getResults().find(r=>r.id==='BOTTLE-PACED').active).toBe(false);}
}
