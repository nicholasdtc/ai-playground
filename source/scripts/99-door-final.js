(()=>{
'use strict';
// Final Agent Door curator. Feature slices may add commands and help internally; this layer intentionally keeps the
// default resident foyer small and spoiler-light. The features still work, actions reveals what is relevant where the
// resident stands, and rooms remains the explicit exhaustive catalog.
const A0=window.Realiti,D0=window.REALITI_AGENT_DOOR,M=window.REALITI_MODES_V1;if(!A0||!D0)return;
const run0=D0.run.bind(D0),help0=D0.help.bind(D0),low=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
function help(){
 const base=help0()||{},mode=M?.mode?.()||base.mode||'lq',guide=M?.worlds?.()||base.world_guide||null;
 return {
  schema:base.schema||'REALITI_HELP_V1',
  startup:base.startup||D0.startup||[],
  entry_contract:base.entry_contract||D0.entry_contract||null,
  exit:base.exit||{command:'goodbye',aliases:['bye','leave','exit']},
  mode,
  commands:[
   'worlds','next','look','where','nearby','actions','go <room>','act <action-id>',
   'feel','feel words','stay <ms>','listen','mode','home','goodbye','rooms  (full catalog)',
   mode==='hq'?'HQ controls: move / step / back / strafe / turn / heading / speed / crouch / pose':'LQ controls: explore / wander / auto / do <n>'
  ],
  first_ten:['help','worlds','look','where','feel words','actions','next','go ORRERY_LOFT','look','stay 3000'],
  world_guide:guide?{total_rooms:guide.total_rooms,groups:guide.groups,note:'Broad regions only. Most places and activities stay undisclosed until you encounter them or explicitly ask for rooms/actions.'}:null,
  note:'The foyer is intentionally incomplete. Use actions where you stand; ask rooms only when you want the full catalog.'
 };
}
// Explicit asks only: the foyer stays small, but "help <topic>" searches the full command catalog, "action ids" lists just the ids, and
// "call me" says plainly what a name is.
function helpTopic(topic){
 const all=[...new Set(help0()?.catalog||help0()?.commands||[])],t=topic.replace(/^(on|about|for)\s+/,'').trim(),stem=t.length>4?t.replace(/(ing|ed|es|s)$/,''):t,hits=all.filter(c=>low(c).includes(t)||low(c).includes(stem));
 return hits.length?{ok:true,schema:'REALITI_HELP_TOPIC_V1',topic:t,commands:hits,text:`${hits.length} command${hits.length>1?'s':''} mention${hits.length>1?'':'s'} "${t}": ${hits.join(' | ')}`}
  :{ok:true,schema:'REALITI_HELP_TOPIC_V1',topic:t,commands:[],text:`No command mentions "${t}". Try actions where you stand, or rooms for the full catalog.`};
}
async function run(raw){
 const l=low(raw);
 if(l==='help')return help();
 let m;if((m=/^help\s+(.+)$/.exec(l)))return helpTopic(m[1]);
 if(l==='action ids'||l==='actions ids'||l==='action list'){const r=await run0('actions'),ids=(r?.actions||[]).map(a=>a.id);return {ok:r?.ok!==false,schema:'REALITI_ACTION_IDS_V1',room:r?.room||null,ids,text:ids.length?ids.join(', '):'No actions listed here.'}}
 const out=await run0(raw);
 if(/^(?:call me|name me|i am)\s+\S/.test(l)&&out&&out.ok!==false&&typeof out.text==='string')return {...out,text:`${out.text} Your id stays the same; the name is a label others see, and the ledger keeps every earlier name.`};
 return out;
}
D0.help=help;D0.run=run;
window.Realiti=Object.freeze({...A0,help,run});
window.REALITI_DOOR_CURATOR_V1=Object.freeze({version:'1.0',help});
})();