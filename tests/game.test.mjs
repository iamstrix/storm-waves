/* AI assistance: Codex wrote these acceptance tests for game rules and data integrity. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CONFIG, warningSeconds, stormSeconds } from '../src/config.js';
import { prepareEvents, buildRun, protectionCost } from '../src/data.js';
import { StormGame } from '../src/game.js';
const snapshot=JSON.parse(fs.readFileSync(new URL('../data/cme-snapshot.json',import.meta.url),'utf8'));
const events=prepareEvents(snapshot);
const stepUntil=(game,predicate,max=10000)=>{for(let i=0;i<max;i++){if(predicate())return;game.step(CONFIG.fixedStep);}throw new Error('State transition did not happen');};
const shieldWave=game=>{game.ready();stepUntil(game,()=>game.state.phase==='storm');game.setShield(true);stepUntil(game,()=>!game.isActive);game.releaseShield();};

test('saved data has 25 unique Mars predictions and 18 eight-event windows',()=>{
  assert.equal(events.length,25);assert.equal(new Set(events.map(e=>e.id)).size,25);
  for(let start=0;start<18;start++){const run=buildRun(events,{startIndex:start});assert.equal(run.events.length,8);assert.equal(run.events[0].id,events[start].id);}
  assert.throws(()=>prepareEvents({events:[]}));assert.throws(()=>prepareEvents({}));
  assert.equal(prepareEvents({...snapshot,events:[...snapshot.events,...snapshot.events]}).length,25);
});
test('a replay avoids the previous start, and gameplay never mutates NASA records',()=>{
  const before=JSON.stringify(events),g=new StormGame(events,{random:()=>0});g.begin();const first=g.state.run[0].id;g.begin();assert.notEqual(g.state.run[0].id,first);shieldWave(g);g.choose('charge');assert.equal(JSON.stringify(events),before);
});
test('data mappings clamp outliers to playable durations',()=>{
  assert.equal(warningSeconds({speedKmS:10}),9);assert.equal(warningSeconds({speedKmS:99999}),4);
  assert.equal(stormSeconds({halfAngleDeg:0}),2);assert.equal(stormSeconds({halfAngleDeg:999}),4.5);
});
test('four story panels lead to safe practice; practice choices reset supplies and stars',()=>{
  const g=new StormGame(events);g.begin({withStory:true,startIndex:0});for(let i=0;i<4;i++)g.advanceStory();assert.equal(g.state.phase,'tutorial');g.ready();assert.equal(g.canRaiseShield,false);
  stepUntil(g,()=>g.state.phase==='storm');stepUntil(g,()=>g.state.phase==='debrief');assert.equal(g.state.crew,100);assert.equal(g.state.air,100);assert.equal(g.state.completed,0);
  g.choose('science');assert.equal(g.state.phase,'intro');assert.equal(g.state.stars,0);assert.equal(g.state.power,70);assert.equal(g.state.index,0);assert.equal(g.state.history.length,0);
});
test('the practice button unlocks only during its final 1.2 warning seconds',()=>{
  const g=new StormGame(events);g.begin({withStory:true,startIndex:0});g.beginPractice();g.ready();assert.equal(g.canRaiseShield,false);stepUntil(g,()=>g.warningRemaining<=1.2);assert.equal(g.canRaiseShield,true);assert.equal(g.setShield(true),true);
});
test('protection spends power, blocks crew damage, and debrief pauses all time',()=>{
  const g=new StormGame(events);g.begin({startIndex:0});shieldWave(g);assert.equal(g.state.phase,'debrief');assert.equal(g.state.crew,100);assert.ok(g.state.lastResult.coverage>.99);assert.ok(Math.abs(g.state.lastResult.powerSpent-protectionCost(g.event))<1);
  const before=JSON.stringify(g.state);for(let i=0;i<600;i++)g.step();assert.equal(JSON.stringify(g.state),before);
});
test('an exhausted shield cannot oscillate on and off while the input stays held',()=>{
  const g=new StormGame(events);g.begin({startIndex:0});g.ready();g.state.power=5;g.setShield(true);for(let i=0;i<70;i++)g.step();assert.equal(g.state.shield,false);assert.equal(g.state.exhausted,true);assert.ok(g.state.air<100);
  const spent=g.state.wave.powerSpent;g.setShield(true);for(let i=0;i<30;i++)g.step();assert.equal(g.state.wave.powerSpent,spent);
  g.releaseShield();g.state.power=8;assert.equal(g.setShield(true),true);
});
test('the air reserve can end a mission; a missing shield can end one through crew loss',()=>{
  const g=new StormGame(events);g.begin({startIndex:0});g.ready();g.state.air=.01;g.state.power=0;g.step();assert.equal(g.state.phase,'report');assert.equal(g.state.reason,'air');
  const h=new StormGame(events);h.begin({startIndex:0});h.ready();stepUntil(h,()=>h.state.phase==='storm');h.state.crew=.01;h.step();assert.equal(h.state.reason,'crew');assert.equal(h.state.outcome,'ended');
});
test('insufficient power cannot purchase science or rest; charging stays capped',()=>{
  const g=new StormGame(events);g.begin({startIndex:0});shieldWave(g);g.state.power=14;assert.equal(g.choose('science'),false);assert.equal(g.choose('rest'),false);assert.equal(g.state.stars,0);g.state.power=95;g.choose('charge');assert.equal(g.state.power,100);
});
test('pause freezes time and releases protection',()=>{
  const g=new StormGame(events);g.begin({startIndex:0});g.ready();g.setShield(true);g.pause();const before=JSON.stringify(g.state);for(let i=0;i<300;i++)g.step();assert.equal(JSON.stringify(g.state),before);assert.equal(g.state.shield,false);g.resume();assert.equal(g.state.paused,false);
});
test('all 18 missions can complete using careful timing and charging',()=>{
  for(let start=0;start<18;start++){const g=new StormGame(events);g.begin({startIndex:start});for(let round=0;round<8;round++){shieldWave(g);assert.equal(g.state.phase,'debrief',`start ${start}, round ${round}`);g.choose('charge');}assert.equal(g.state.phase,'report');assert.equal(g.state.outcome,'won');assert.equal(g.state.completed,8);assert.equal(g.state.history.length,8);}
});

test('forecast choices with a 0.6-second early shield earn 3–5 stars in every mission',()=>{
  for(let start=0;start<18;start++){
    const g=new StormGame(events);g.begin({startIndex:start});
    for(let round=0;round<8;round++){
      g.ready();stepUntil(g,()=>g.warningRemaining<=.6);g.setShield(true);stepUntil(g,()=>!g.isActive);
      assert.equal(g.state.phase,'debrief');const next=g.nextEvent;
      const forecast=next?Math.min(100,g.state.power-CONFIG.sciencePower+Math.max(0,warningSeconds(next)-.6)*CONFIG.solarRechargePerSecond)-protectionCost(next)-.6*CONFIG.shieldPowerPerSecond:100;
      g.choose(forecast>=CONFIG.airPowerReserve?'science':'charge');
    }
    assert.equal(g.state.outcome,'won');assert.ok(g.state.stars>=3&&g.state.stars<=5,`mission ${start}: ${g.state.stars} stars`);
  }
});
