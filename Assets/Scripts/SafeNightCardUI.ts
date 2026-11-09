import {FlexLayout} from 'SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout';
import {FlexItem} from 'SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem';
import {FlexAlign,FlexDirection,FlexJustify,FlexAlignSelf} from 'SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes';
import {ContentVerticalAlignment} from 'SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/LayoutTypes';
import {Button} from 'SpectaclesUIKit.lspkg/Scripts/Components/Button/Button';
import Event from 'SpectaclesInteractionKit.lspkg/Utils/Event';

const TYPE_SCALE={Title1:{size:105,weight:700},Title2:{size:93,weight:700},HeadlineXL:{size:62,weight:700},Headline1:{size:54,weight:700},Headline2:{size:48,weight:700},Subheadline:{size:41,weight:700},Button:{size:39,weight:500},Callout:{size:39,weight:700},Body:{size:39,weight:500},Caption:{size:38,weight:500}};
function applyTextRole(t:Text,role:keyof typeof TYPE_SCALE):void{t.size=TYPE_SCALE[role].size;(t as Text&{weight?:number}).weight=TYPE_SCALE[role].weight;}
export type CardAction={id:string,label:string};
export type CardData={eyebrow:string,title:string,body:string,detail:string,tone:'neutral'|'clear'|'attention'|'unknown',actions:CardAction[],compact?:boolean};

@component
export class SafeNightCardUI extends BaseScriptComponent {
 @input @hint('Card width in centimeters at the authored 110 cm focal plane.') width:number=44;
 @input @hint('Warm white for readable additive-display text.') @widget(new ColorWidget()) textColor:vec4=new vec4(0.97,0.94,0.87,1);
 @input @hint('Soft teal for modeled clear states.') @widget(new ColorWidget()) clearColor:vec4=new vec4(0.48,0.84,0.78,1);
 @input @hint('Amber for attention, paired with explicit cue text.') @widget(new ColorWidget()) attentionColor:vec4=new vec4(1,0.72,0.36,1);
 @input @hint('Dusty violet for unknown, paired with a question mark.') @widget(new ColorWidget()) unknownColor:vec4=new vec4(0.77,0.66,0.93,1);
 @input @hint('Content fade duration in seconds.') fadeSeconds:number=0.4;
 public onAction=new Event<string>();
 private host:SceneObject;private column:FlexLayout;private titleItem:FlexItem;private bodyItem:FlexItem;private detailItem:FlexItem;private texts:Text[]=[];private eyebrow:Text;private title:Text;private body:Text;private detail:Text;private actionHost:SceneObject;private wayfinder:SceneObject;private wayfinderLabel:Text;private lastActions='';private targetAlpha=1;private alpha=0;private accent:vec4;private actionData:CardAction[]=[];private slots:{object:SceneObject,label:Text,button:Button,item:FlexItem}[]=[];
 onAwake(){
  this.sceneObject.createComponent('Component.Canvas');this.sceneObject.getTransform().setWorldScale(new vec3(90/110,90/110,90/110));
  // Intentionally no backplate: luminous text and UIKit buttons over the nursery.
  this.host=this.obj(this.sceneObject,'Single instruction card',new vec3(0,0,0.6));
  const column=this.makeFlex(this.host,FlexDirection.Column,this.width,17,{gap:0.7,padX:1,padY:0.5});this.column=column.getComponent(FlexLayout.getTypeName()) as FlexLayout;
  this.flexChild(column,{w:this.width-2,h:1.6},o=>{this.eyebrow=this.text(o,'SIMULATION / SAFE NIGHT','Caption',this.width-2,1.6);});
  this.flexChild(column,{w:this.width-2,h:3.2},o=>{this.titleItem=o.getComponent(FlexItem.getTypeName()) as FlexItem;this.title=this.text(o,'Safe Night','Title2',this.width-2,3.2);});
  this.flexChild(column,{w:this.width-2,h:4.8},o=>{this.bodyItem=o.getComponent(FlexItem.getTypeName()) as FlexItem;this.body=this.text(o,'','Body',this.width-2,4.8);});
  this.flexChild(column,{w:this.width-2,h:2.8},o=>{this.detailItem=o.getComponent(FlexItem.getTypeName()) as FlexItem;this.detail=this.text(o,'','Caption',this.width-2,2.8);});
  this.actionHost=this.obj(this.sceneObject,'Quiet controls',new vec3(0,-19,0.6));this.buildActions();
  this.wayfinder=this.obj(this.sceneObject,'Sleep space wayfinder',new vec3(24,0,0.6));const wayfinderLayout=this.makeFlex(this.wayfinder,FlexDirection.Column,12,4);this.flexChild(wayfinderLayout,{w:12,h:4},o=>{this.wayfinderLabel=this.text(o,'','Callout',12,4);});
  this.accent=this.textColor;
  this.createEvent('UpdateEvent').bind(()=>{this.alpha+=(this.targetAlpha-this.alpha)*Math.min(1,getDeltaTime()*6/Math.max(0.1,this.fadeSeconds));for(const t of this.texts){const color=t===this.wayfinderLabel?this.attentionColor:t===this.eyebrow?this.accent:this.textColor;t.textFill.color=new vec4(color.x,color.y,color.z,this.alpha*(t===this.detail?0.72:1));}});
 }
 public show(data:CardData):void{
  const compact=!!data.compact;this.column.height=compact?12.5:17;this.column.rowGap=compact?0.6:0.7;this.titleItem.overrideHeight=compact?2.4:3.2;this.bodyItem.overrideHeight=compact?3.5:4.8;this.detailItem.overrideHeight=compact?2:2.8;applyTextRole(this.title,compact?'HeadlineXL':'Title2');this.body.layoutRect=Rect.create(-(this.width-2)/2,(this.width-2)/2,compact?-1.75:-2.4,compact?1.75:2.4);this.detail.layoutRect=Rect.create(-(this.width-2)/2,(this.width-2)/2,compact?-1:-1.4,compact?1:1.4);
  this.eyebrow.text=data.eyebrow;this.title.text=data.title;this.body.text=data.body;this.detail.text=data.detail;
  this.accent=data.tone==='clear'?this.clearColor:data.tone==='attention'?this.attentionColor:data.tone==='unknown'?this.unknownColor:this.textColor;
  this.eyebrow.textFill.color=this.accent;
  const key=JSON.stringify(data.actions);if(key!==this.lastActions){this.lastActions=key;this.rebuildActions(data.actions);}
 }
 public setAnchor(position:vec3):void{this.sceneObject.getTransform().setWorldPosition(position);}
 public setControlsAnchor(position:vec3):void{this.actionHost.getTransform().setWorldPosition(position);}
 public setFacing(rotation:quat):void{this.sceneObject.getTransform().setWorldRotation(rotation);}
 public setWayfinder(label:string,position:vec3):void{this.wayfinderLabel.text=label;this.wayfinder.getTransform().setWorldPosition(position);}
 public cardCount():number{return this.sceneObject.enabled?1:0;}
 private rebuildActions(actions:CardAction[]):void{
  this.actionData=actions;this.slots.forEach((slot,index)=>{const a=actions[index];slot.object.enabled=!!a;if(!a)return;slot.object.name='Action '+a.id;slot.label.text=a.label;const w=actions.length===1?this.width-2:(this.width-3.2)/2;slot.item.overrideWidth=w;slot.button.size=new vec3(w,5.1,0.6);slot.label.layoutRect=Rect.create(-w/2+0.5,w/2-0.5,-2,2);});
 }
 private buildActions():void{
  const col=this.makeFlex(this.actionHost,FlexDirection.Column,this.width-2,10.8,{gap:0.6});
  for(let row=0;row<2;row++)this.flexChild(col,{w:this.width-2,h:5.1},rowObj=>{
   const cells=this.makeFlex(rowObj,FlexDirection.Row,this.width-2,5.1,{gap:1.2});
   for(let cellIndex=0;cellIndex<2;cellIndex++){const index=row*2+cellIndex;this.flexChild(cells,{w:(this.width-3.2)/2,h:5.1},cell=>{
    cell.name='Action slot '+index;const button=cell.createComponent(Button.getTypeName()) as Button;button.size=new vec3((this.width-3.2)/2,5.1,0.6);button.setVariant({shape:'Rectangle',style:'PrimaryNeutral'});
    const label=this.obj(cell,'Label',new vec3(0,0,0.15));const t=this.text(label,'','Button',(this.width-4)/2,4);t.horizontalAlignment=HorizontalAlignment.Center;this.slots.push({object:cell,label:t,button,item:cell.getComponent(FlexItem.getTypeName()) as FlexItem});
    button.onTriggerUp.add(()=>{const action=this.actionData[index];if(action)this.onAction.invoke(action.id);});
   });}
  });
 }
 private text(o:SceneObject,value:string,role:keyof typeof TYPE_SCALE,w:number,h:number):Text{if(role!=='Button')o.name='Card '+role;const t=o.createComponent('Component.Text') as Text;t.text=value;t.depthTest=true;applyTextRole(t,role);t.horizontalAlignment=HorizontalAlignment.Left;t.verticalAlignment=VerticalAlignment.Center;t.horizontalOverflow=HorizontalOverflow.Wrap;t.verticalOverflow=VerticalOverflow.Overflow;t.layoutRect=Rect.create(-w/2,w/2,-h/2,h/2);t.textFill.color=this.textColor;this.texts.push(t);return t;}
 private obj(parent:SceneObject,name:string,position?:vec3):SceneObject{const o=global.scene.createSceneObject(name);o.setParent(parent);if(position)o.getTransform().setLocalPosition(position);return o;}
 private liftInZ(o:SceneObject,z:number):void{const t=o.getTransform(),p=t.getLocalPosition();t.setLocalPosition(new vec3(p.x,p.y,p.z+z));}
 private makeFlex(parent:SceneObject,direction:FlexDirection,width:number,height:number,opts?:{gap?:number,padX?:number,padY?:number}):SceneObject{
  const o=this.obj(parent,'Flex');this.liftInZ(o,0.02);const f=o.createComponent(FlexLayout.getTypeName()) as FlexLayout;f.autoDiscoverItemsOnStart=false;const i=o.createComponent(FlexItem.getTypeName()) as FlexItem;i.overrideWidth=width;i.overrideHeight=height;
  f.onInitialized.add(()=>{f.width=width;f.height=height;f.direction=direction;f.rowGap=opts?.gap??0;f.columnGap=opts?.gap??0;f.paddingTop=opts?.padY??0;f.paddingBottom=opts?.padY??0;f.paddingLeft=opts?.padX??0;f.paddingRight=opts?.padX??0;f.justifyContent=FlexJustify.Start;f.alignItems=FlexAlign.Stretch;f.verticalAlignment=ContentVerticalAlignment.Top;});return o;
 }
 private flexChild(parent:SceneObject,size:{w?:number,h?:number,grow?:number},builder:(o:SceneObject)=>void):SceneObject{const o=this.obj(parent,'Item');this.liftInZ(o,0.02);const i=o.createComponent(FlexItem.getTypeName()) as FlexItem;if(size.w)i.overrideWidth=size.w;if(size.h)i.overrideHeight=size.h;i.flexGrow=size.grow??0;i.flexShrink=0;i.alignSelf=FlexAlignSelf.Stretch;builder(o);const f=parent.getComponent(FlexLayout.getTypeName()) as FlexLayout;if(f)f.addItems([i]);return o;}
}
