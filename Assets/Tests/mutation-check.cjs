const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const source=fs.readFileSync(path.resolve(__dirname,'../Scripts/SafeNightCore.ts'),'utf8');
const mutations=[
 ['early-dwell','>=(wrong?this.appearMs:this.clearMs)','>=(wrong?0:this.clearMs)'],
 ['unknown-passes',"s.unknown.push(r.id);continue;","s.unknown.push(r.id);s.passed.push(r.id);continue;"],
 ['reverse-priority','b.priority-a.priority','a.priority-b.priority'],
 ['surface-limit','>c.sleepInclineMaxDeg','>c.sleepInclineMaxDeg+1'],
 ['ignore-volume-extents','<=s.x/2+half.x','<=s.x/2'],
 ['ignore-head-threshold','value<enter?true','value<enter-100?true'],
 ['remove-oriented-separation','if(Math.abs(dot(delta,a))>radiusA+radiusB+1e-7)return false;','if(false)return false;'],
 ['ignore-sleep-position',"this.threshold(f.backFacingDeg as number,c.backFacingEnterDeg,c.backFacingExitDeg,true)",'false'],
 ['ignore-sleep-containment',"?!f.sleepDollInside:null",'?false:null'],
 ['accept-partial-transcript','if(!isFinal)return null;','if(false)return null;']
];
let failed=0;const results=[];
for(const [name,from,to] of mutations){
 if(!source.includes(from))throw Error('Mutation anchor missing: '+name);
 const file=path.join(__dirname,'mutant-'+name+'.ts');
 try{fs.writeFileSync(file,source.replace(from,to));const run=cp.spawnSync(process.execPath,['--test',path.join(__dirname,'core.test.cjs')],{env:{...process.env,SAFENIGHT_CORE:file},encoding:'utf8'});const killed=run.status!==0;results.push({name,killed});if(!killed)failed++;}
 finally{if(fs.existsSync(file))fs.unlinkSync(file);}
}
fs.writeFileSync(path.join(__dirname,'mutation-results.json'),JSON.stringify({mutations:results,survived:failed},null,2)+'\n');
console.log(JSON.stringify(results,null,2));process.exitCode=failed?1:0;
