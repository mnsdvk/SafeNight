const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const core = require(process.env.SAFENIGHT_CORE || '../Scripts/SafeNightCore.ts');
const config = JSON.parse(fs.readFileSync(path.join(root,'Data/simulation.json'),'utf8'));
const registry = JSON.parse(fs.readFileSync(path.join(root,'Data/rules.json'),'utf8'));
const good = () => ({head:{x:0,y:12,z:0},shoulder:{x:0,y:4,z:0},hip:{x:0,y:-12,z:0},supportPoints:[{x:0,y:12,z:0}],bottleHeld:true,bottleNearMouth:true,bottleResting:false,bottleTilt:5,feedSeconds:0,location:'bed',surfaceType:'crib',surfaceIncline:0,hazards:[],poseAvailable:true,backFacingDeg:0,sleepDollInside:true});

test('sleep position needs known on-back geometry and complete containment',()=>{
 const rules=[{...registry[0],id:'test-back',mode:'sleep',condition:'back'},{...registry[0],id:'test-inside',mode:'sleep',condition:'inSurface'}];
 const e=new core.RuleEngine(rules,{...config,backFacingEnterDeg:25,backFacingExitDeg:15});
 const f={...good(),backFacingDeg:90,sleepDollInside:false};e.evaluate(f,'sleep',0);let r=e.evaluate(f,'sleep',1000);assert.ok(r.every(x=>x.active));
 f.backFacingDeg=20;assert.equal(e.evaluate(f,'sleep',1100)[0].active,true);
 f.backFacingDeg=0;f.sleepDollInside=true;e.evaluate(f,'sleep',1200);assert.ok(e.evaluate(f,'sleep',1800).every(x=>!x.active&&x.violated===false));
 delete f.backFacingDeg;delete f.sleepDollInside;assert.ok(e.evaluate(f,'sleep',1900).every(x=>x.evidence==='UNKNOWN'&&!x.active));
 f.backFacingDeg=0;f.sleepDollInside=true;f.poseAvailable=false;assert.ok(e.evaluate(f,'sleep',2000).every(x=>x.evidence==='UNKNOWN'));
});
test('geometry: finite values, distance, angle and closed volume boundary',()=>{
 assert.equal(core.distance({x:0,y:0,z:0},{x:3,y:4,z:0}),5);
 assert.equal(core.angleDegrees({x:0,y:1,z:0},{x:0,y:1,z:0}),0);
 assert.equal(core.angleDegrees({x:0,y:0,z:0},{x:0,y:1,z:0}),null);
 assert.equal(core.insideBox({x:35.5,y:2,z:66.5},{x:0,y:0,z:0},{x:71,y:20,z:133}),true);
 assert.equal(core.insideBox({x:35.501,y:2,z:0},{x:0,y:0,z:0},{x:71,y:20,z:133}),false);
});
test('registry rejects missing source, duplicate ids and unsupported status',()=>{
 assert.deepEqual(core.validateRegistry(registry),[]);
 assert.ok(core.validateRegistry([...registry,{...registry[0],source:''}]).length>=2);
 assert.ok(core.validateRegistry([{...registry[0],status:'approved'}]).length);
});
test('dwell exact boundaries, hysteresis jitter and sustained correction',()=>{
 const d=new core.DwellGate(1000,600);
 assert.equal(d.update(true,0),false); assert.equal(d.update(true,999),false);
 assert.equal(d.update(true,1000),true); assert.equal(d.update(null,1050),true);
 assert.equal(d.update(false,1100),true); assert.equal(d.update(true,1500),true);
 assert.equal(d.update(false,1600),true); assert.equal(d.update(false,2199),true);
 assert.equal(d.update(false,2200),false);
 const engine=new core.RuleEngine(registry,config);
 let f=good(); f.head.y=f.hip.y+config.headRiseEnterCm-0.1;
 engine.evaluate(f,'bottle',0); assert.equal(engine.evaluate(f,'bottle',1000).find(r=>r.id==='SHARED-HEAD-HIGH').active,true);
 f.head.y=f.hip.y+(config.headRiseEnterCm+config.headRiseExitCm)/2;
 assert.equal(engine.evaluate(f,'bottle',1500).find(r=>r.id==='SHARED-HEAD-HIGH').active,true);
 f.head.y=f.hip.y+config.headRiseExitCm+1; engine.evaluate(f,'bottle',2000);
 assert.equal(engine.evaluate(f,'bottle',2600).find(r=>r.id==='SHARED-HEAD-HIGH').active,false);
});
test('input loss withdraws active cues immediately and never passes evidence',()=>{
 const e=new core.RuleEngine(registry,config); const f=good();f.bottleHeld=false;f.bottleResting=true;
 e.evaluate(f,'bottle',0); assert.equal(e.evaluate(f,'bottle',1000).find(r=>r.id==='BOTTLE-HELD').active,true);
 f.poseAvailable=false;const r=e.evaluate(f,'bottle',1100);
 assert.ok(r.filter(x=>x.mode!=='sleep').every(x=>!x.active && x.evidence==='UNKNOWN'));
 const missing=good();delete missing.head;assert.doesNotThrow(()=>e.evaluate(missing,'bottle',1200));
 assert.equal(core.summarizeEvidence([{id:'a',evidence:'UNKNOWN',violated:null}]).passed.length,0);
});
test('arbiter emits one card, interrupts on priority and obeys cooldown',()=>{
 const a=new core.PromptArbiter(2000);
 const p=(id,priority)=>({id,priority,active:true,cue:id,evidence:'MODELED'});
 assert.equal(a.select([p('position',70)],0).id,'position');
 assert.equal(a.select([p('position',70),p('propped',100)],100).id,'propped');
 assert.equal(a.select([p('position',70)],200).id,'position');
 assert.equal(a.select([],300),null);
 assert.equal(a.select([p('position',70)],400),null);
 assert.equal(a.select([p('position',70)],2300).id,'position');
});
test('state machine rejects skips, allows sleepy interruption and complete flow',()=>{
 const s=new core.SessionState(); assert.equal(s.go('Done'),false);
 for(const next of ['Prepare','Feed','SleepyResponse','Handoff','SleepSpaceCheck','Done']) assert.equal(s.go(next),true);
 assert.equal(s.go('Feed'),false);s.restart();assert.equal(s.state,'Welcome');
 assert.equal(s.go('Prepare'),true);assert.equal(s.go('Feed'),true);assert.equal(s.go('BabyAsleep'),true);
});
test('surface incline, mode filtering, propping and absent samples',()=>{
 const e=new core.RuleEngine(registry,config);let f=good();f.surfaceIncline=10;
 assert.equal(e.evaluate(f,'sleep',0).find(r=>r.id==='SLEEP-FLAT').violated,false);
 f.surfaceIncline=10.001;assert.equal(e.evaluate(f,'sleep',1).find(r=>r.id==='SLEEP-FLAT').violated,true);
 f=good();f.bottleHeld=false;f.bottleResting=true;
 assert.equal(e.evaluate(f,'bottle',2).find(r=>r.id==='BOTTLE-HELD').violated,true);
 assert.ok(!e.evaluate(f,'breast',3).some(r=>r.id==='BOTTLE-HELD'));
 f.surfaceIncline=NaN;assert.equal(e.evaluate(f,'sleep',4).find(r=>r.id==='SLEEP-FLAT').evidence,'UNKNOWN');
});
test('confirmation is distinguished from modeled and unknown',()=>{
 const s=core.summarizeEvidence([{id:'a',evidence:'UNKNOWN',violated:null},{id:'b',evidence:'CONFIRMED',violated:false},{id:'c',evidence:'MODELED',violated:true}]);
 assert.deepEqual(s.unknown,['a']);assert.deepEqual(s.confirmed,['b']);assert.deepEqual(s.attention,['c']);assert.deepEqual(s.passed,['b']);
});
test('hazard volume checks use whole object extents, including a grazing edge',()=>{
 const c={x:0,y:0,z:0},s={x:71,y:20,z:133},half={x:5,y:2,z:4};
 assert.equal(core.boxesOverlap({x:40.5,y:0,z:0},half,c,s),true);
 assert.equal(core.boxesOverlap({x:40.501,y:0,z:0},half,c,s),false);
});
test('voice commands require a final explicit phrase and ignore negations',()=>{
 assert.equal(core.voiceCommand("I'm sleepy",true),'sleepy');
 assert.equal(core.voiceCommand('I am sleepy.',true),'sleepy');
 assert.equal(core.voiceCommand("Baby's asleep",true),'asleep');
 assert.equal(core.voiceCommand('The baby is asleep.',true),'asleep');
 assert.equal(core.voiceCommand("I'm sleepy",false),null);
 assert.equal(core.voiceCommand("I'm not sleepy",true),null);
 assert.equal(core.voiceCommand("Don't say baby's asleep",true),null);
});
test('rotated nursery hazards use their oriented volume, including touching edges',()=>{
 const c={x:0,y:0,z:0},s={x:71,y:35,z:133};const axes=[{x:0,y:0,z:-1},{x:0,y:1,z:0},{x:1,y:0,z:0}];const half={x:12,y:1,z:16};
 assert.equal(core.orientedBoxOverlap({x:50,y:0,z:0},half,axes,c,s),true);
 assert.equal(core.orientedBoxOverlap({x:51.501,y:0,z:0},half,axes,c,s),false);
 assert.equal(core.orientedBoxOverlap({x:51.5,y:0,z:0},half,axes,c,s),true);
 assert.equal(core.orientedBoxOverlap({x:0,y:19,z:0},half,axes,c,s),false);
});
