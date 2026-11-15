/* AI assistance: Codex implemented this original game from Claude Code's design/spec. */
import { CONFIG } from './config.js?v=3';
import { loadEvents } from './data.js?v=3';
import { StormGame } from './game.js?v=3';
import { SceneRenderer } from './render.js?v=3';
import { GameUI } from './ui.js?v=4';
import { SpaceAudio } from './audio.js?v=3';

const readStorage = (key, fallback) => { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } };
const writeStorage = (key, value) => { try { localStorage.setItem(key, value); } catch { /* The game also works without storage. */ } };
let game, ui, loading=false, last=0, accumulator=0;
let tapMode=readStorage('stormwaves.tapMode','false')==='true';
const audio=new SpaceAudio({enabled:readStorage('stormwaves.sound','true')!=='false'});
const renderer=new SceneRenderer(document.getElementById('scene'));
const previewGame={state:{phase:'start'},event:{halfAngleDeg:25}};

const actions={
  play(forceStory=false){ui.cancelDialogue();game.begin({withStory:forceStory||readStorage('stormwaves.seenStory','false')!=='true'});ui.update(true);},
  nextStory(){if(game.state.storyPanel===3)writeStorage('stormwaves.seenStory','true');game.advanceStory();},
  skipStory(){writeStorage('stormwaves.seenStory','true');game.beginPractice();},
  replay(){ui.cancelDialogue();game.begin({withStory:false});},
  toggleTap(){tapMode=!tapMode;writeStorage('stormwaves.tapMode',String(tapMode));game.releaseShield();},
  getTap(){return tapMode;},
  toggleSound(){audio.setEnabled(!audio.enabled);writeStorage('stormwaves.sound',String(audio.enabled));ui.update();},
  retry(){boot();},
};

async function boot(){
  if(loading)return;loading=true;
  try{
    const events=await loadEvents();game=new StormGame(events);
    if(!ui){ui=new GameUI(game,actions,audio);installInput();}else ui.game=game;
    ui.key='';ui.update(true);
    // Opt-in acceptance hooks; the normal game URL does not export internal state.
    if(new URLSearchParams(location.search).has('test'))window.stormWaves={get game(){return game;},get ui(){return ui;},get audio(){return audio;},get renderer(){return renderer;},get tapMode(){return tapMode;},actions};
  }catch(error){
    const root=document.getElementById('panel-root');root.innerHTML='';
    const card=document.createElement('section');card.className='card';
    const shade=document.createElement('div');shade.className='shade';shade.append(card);
    const title=document.createElement('h2');title.textContent='A little trouble loading';card.append(title);
    const message=document.createElement('p');message.textContent=error.message;card.append(message);
    const tip=document.createElement('p');tip.className='small';tip.textContent=location.protocol==='file:'?'Open the game through a local server or static host. The README shows how.':'Please check that the saved storm file is available.';card.append(tip);
    const retry=document.createElement('button');retry.className='button primary';retry.textContent='Try again';retry.onclick=boot;card.append(retry);root.append(shade);
  }finally{loading=false;}
}

function installInput(){
  document.addEventListener('pointerdown',()=>document.documentElement.dataset.input='pointer',{capture:true});
  document.addEventListener('keydown',()=>document.documentElement.dataset.input='keyboard',{capture:true});
  const shield=document.getElementById('shield-button');
  const release=()=>{if(!tapMode)game.releaseShield();};
  shield.addEventListener('pointerdown',event=>{
    if(event.button!==0&&event.pointerType==='mouse')return;
    event.preventDefault();shield.focus({preventScroll:true});shield.setPointerCapture(event.pointerId);
    audio.unlock();
    if(tapMode)game.setShield(!game.state.shieldInput);else game.setShield(true);
    ui.update();
  });
  shield.addEventListener('pointerup',event=>{release();if(shield.hasPointerCapture(event.pointerId))shield.releasePointerCapture(event.pointerId);ui.update();});
  shield.addEventListener('pointercancel',()=>{game.releaseShield();ui.update();});
  shield.addEventListener('lostpointercapture',()=>{if(!tapMode)game.releaseShield();});
  document.addEventListener('keydown',event=>{
    if(event.code==='Space'||event.code==='Enter')audio.unlock();
    if(event.code==='Space'&&game.state.phase==='debrief'&&!document.getElementById('about-dialog').open){event.preventDefault();if(event.repeat)return;const choices=[...document.querySelectorAll('[data-choice]:not(:disabled)')];const next=(choices.indexOf(document.activeElement)+1)%choices.length;choices[next]?.focus();return;}
    if(event.code==='Escape'&&!document.getElementById('about-dialog').open){if(game.state.paused)game.resume();else game.pause();ui.update();return;}
    if(event.code==='Space'&&game.isActive&&!document.getElementById('about-dialog').open){event.preventDefault();if(event.repeat)return;if(tapMode)game.setShield(!game.state.shieldInput);else game.setShield(true);ui.update();}
  });
  document.addEventListener('keyup',event=>{if(event.code==='Space'&&!tapMode){event.preventDefault();game.releaseShield();ui.update();}});
  const pauseAway=()=>{game.releaseShield();game.pause();ui.dialogue.finish();audio.suspend();ui.update();};
  window.addEventListener('blur',pauseAway);
  window.addEventListener('focus',()=>{if(audio.context&&!document.hidden)audio.unlock();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseAway();else if(audio.context)audio.unlock();last=0;accumulator=0;});
  document.addEventListener('pointermove',event=>{renderer.pointer={x:event.clientX/innerWidth-.5,y:event.clientY/innerHeight-.5};},{passive:true});
}

function frame(now){
  const elapsed=last?Math.min(CONFIG.maximumFrameTime,(now-last)/1000):0;last=now;
  if(game){
    if(game.isActive){accumulator+=elapsed;while(accumulator>=CONFIG.fixedStep){game.step(CONFIG.fixedStep);accumulator-=CONFIG.fixedStep;}}else accumulator=0;
    ui.update();audio.update(game);renderer.draw(game,now,{talking:ui.dialogue.typing});
  }else renderer.draw(previewGame,now);
  requestAnimationFrame(frame);
}

document.getElementById('panel-root').innerHTML='<div class="shade"><section class="card loading-card"><h2>Waking up Pip…</h2></section></div>';
boot();requestAnimationFrame(frame);
