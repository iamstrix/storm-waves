/* AI assistance: Codex UI implementation; initial Claude Code spec, revised by the user's simplicity and sound direction. */
import { CONFIG } from './config.js?v=3';
import { eventDate, travelDays, speedLabel, sizeLabel, protectionCost, encounterLabel } from './data.js?v=3';
import { icon } from './icons.js?v=3';
import { Dialogue } from './dialogue.js?v=3';
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const number = value => Math.max(0, Math.round(value));
const $ = id => document.getElementById(id);
const STORIES = ["Hey, Commander. I'm Pip. Welcome to Red Base.",'Sun storms are coming. Our crew needs you.','Shield the base. Save 20 power for air.','Eight storms. Do science. Bring everyone home.'];

export class GameUI {
  constructor(game, actions, audio) {
    this.game=game;this.actions=actions;this.audio=audio;this.dialogue=new Dialogue(audio);this.key='';this.lastFlash={};
    this.root=$('panel-root');this.main=$('game');this.shieldButton=$('shield-button');this.previousMeters={power:70,air:100,crew:100};
    document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
    $('pause-button').innerHTML=icon('pause');$('close-about').innerHTML=icon('close');
    $('pause-button').addEventListener('click',()=>{this.audio.click();this.game.pause();});
    $('sound-button').addEventListener('click',()=>this.actions.toggleSound());
    $('about-button').addEventListener('click',()=>this.openAbout());$('close-about').addEventListener('click',()=>this.closeAbout());$('about-done').addEventListener('click',()=>this.closeAbout());
    $('about-dialog').addEventListener('close',()=>{if(this.aboutPaused){this.aboutPaused=false;this.game.resume();}});
    this.root.addEventListener('click',event=>{
      if(event.target.closest('[data-dialogue]')){this.dialogue.finish();return;}
      const button=event.target.closest('button[data-action]');if(!button||button.disabled)return;
      this.audio.unlock();this.audio.click();this.dialogue.cancel();const action=button.dataset.action;
      if(action==='play')this.actions.play();if(action==='story')this.actions.play(true);if(action==='tap')this.actions.toggleTap();
      if(action==='next-story')this.actions.nextStory();if(action==='skip-story')this.actions.skipStory();if(action==='ready')this.game.ready();
      if(action==='choice')this.game.choose(button.dataset.choice);if(action==='replay')this.actions.replay();if(action==='resume')this.game.resume();if(action==='home')this.game.showStart();
      this.update(true);
    });
  }
  cancelDialogue(){this.dialogue.cancel();}
  openAbout(){this.dialogue.finish();this.aboutPaused=this.game.isActive;if(this.aboutPaused)this.game.pause();this.game.releaseShield();$('about-dialog').showModal();this.update();}
  closeAbout(){$('about-dialog').close();}
  update(force=false){
    const s=this.game.state;this.main.dataset.phase=s.phase;this.main.dataset.paused=s.paused;
    const key=[s.phase,s.paused,s.index,s.storyPanel,s.practice,this.actions.getTap()].join('|');
    if(force||key!==this.key){this.key=key;this.renderPanel();}this.updateHUD();
  }
  pipLine(){return '<div class="pip-line"><span class="pip-badge">Pip</span><p data-dialogue class="dialogue"></p></div>';}
  renderPanel(){
    const s=this.game.state,e=this.game.event;let html='',line='';
    if(s.paused){
      html=`<div class="shade"><section class="card pause-card" role="dialog" aria-labelledby="pause-title"><div class="card-symbol">${icon('pause')}</div><h2 id="pause-title">Take a breath.</h2><p class="support">The mission can wait.</p><button class="button primary wide" type="button" data-action="resume">Keep going ${icon('play')}</button><div class="quiet-actions"><button type="button" data-action="tap" aria-pressed="${this.actions.getTap()}">${icon('touch')} Tap mode ${this.actions.getTap()?'on':'off'}</button><button type="button" data-action="home">Back to start</button></div></section></div>`;
    }else if(s.phase==='start'){
      html=`<section class="start-screen"><div class="start-utilities"><button class="text-button" type="button" data-action="story">${icon('help','',18)} Story</button><button class="text-button" type="button" data-action="tap" aria-pressed="${this.actions.getTap()}">${icon('touch','',18)} Tap mode ${this.actions.getTap()?'on':'off'}</button></div><header class="brand"><span class="brand-kicker">A little Mars mission</span><h1>Storm <span>Waves</span></h1><p>Small crew. Big universe.</p></header><div class="start-action"><button class="button primary play-button" type="button" data-action="play">Let's play ${icon('arrow')}</button><span>Eight storms. One shared battery.</span></div></section>`;
    }else if(s.phase==='story'){
      line=STORIES[s.storyPanel];html=`<div class="story-screen"><button class="text-button story-skip" type="button" data-action="skip-story">Skip</button><div class="shade"><section class="card story-card"><div class="story-progress" aria-label="Story ${s.storyPanel+1} of 4">${STORIES.map((_,i)=>`<i class="${i<=s.storyPanel?'done':''}"></i>`).join('')}</div>${this.pipLine()}<button class="button primary story-next" type="button" data-action="next-story">${s.storyPanel===3?"Let's try it":'Next'} ${icon('arrow')}</button></section></div></div>`;
    }else if(s.phase==='tutorial'){
      line='Power. Air. Crew. Keep them above zero.';html=`<div class="shade"><section class="card tutorial-card" role="dialog" aria-labelledby="tutorial-title"><span class="eyebrow">A safe practice</span><h2 id="tutorial-title">You've got this.</h2>${this.pipLine()}<button class="button primary wide" type="button" data-action="ready">Try the shield ${icon('shield')}</button></section></div>`;
    }else if(s.phase==='intro'){
      line=s.index===0?'Wait until it is close. Then hold your shield.':e.speedKmS>=700?'This one is quick. Stay sharp.':'A little breathing room. Let the battery charge.';
      html=`<div class="shade"><section class="card intro-card" role="dialog" aria-labelledby="intro-title"><span class="eyebrow">Wave ${s.index+1} of 8</span><div class="intro-heading"><div class="card-symbol sun-symbol">${icon('sun')}</div><div><h2 id="intro-title">Incoming.</h2><p class="record-date">${escape(eventDate(e))} · NASA DONKI</p></div></div><div class="storm-stats"><span><strong>${Math.round(e.speedKmS)}</strong><small>km/s</small></span><span>${icon(e.marsGlancingBlow?'planet':'shield')}<small>${e.marsGlancingBlow?'Glancing':'Direct'} model</small></span><span>${icon('sun')}<small>${sizeLabel(e)} wave</small></span></div>${this.pipLine()}<button class="button primary wide" type="button" data-action="ready">Ready ${icon('arrow')}</button></section></div>`;
    }else if(s.phase==='debrief'){
      const result=s.lastResult,good=result.quality==='great',early=result.quality==='early';
      const title=good?'Nice timing!':early?'Safe. A little early.':s.practice?'Try that again.':'That one got through.';
      const next=s.practice?null:this.game.nextEvent;
      const note=good?`${number(result.powerSpent)} power used.`:early?`${number(result.earlySeconds*CONFIG.shieldPowerPerSecond)} extra power used.`:s.practice?'Practice keeps the crew safe.':`${number(result.crewLost)} crew health lost.`;
      const forecast=next?`<div class="next-wave"><div><span class="eyebrow">Next wave</span><strong>${speedLabel(next).replace(' speed','')} · ${next.halfAngleDeg>=35?'Wide':next.halfAngleDeg<20?'Narrow':'Medium'}${next.marsGlancingBlow?' · Glancing':''}</strong></div><span class="next-cost">${icon('shield','',17)} ${protectionCost(next)} <small>power</small></span></div>`:'';
      const choice=(name,symbol,title,reward,cost,disabled=false)=>`<button class="choice ${name}" type="button" data-action="choice" data-choice="${name}" ${disabled?'disabled':''} aria-label="${title}: ${reward}; ${disabled?'not enough power':cost}"><span class="choice-icon">${icon(symbol)}</span><strong>${title}</strong><span class="choice-gain">${reward}</span><small>${disabled?'Low power':cost}</small></button>`;
      line=s.practice?"Pick a job. We'll refill supplies.":s.air<65?'Air is low. Time to charge.':'';
      html=`<div class="shade"><section class="card debrief" role="dialog" aria-labelledby="debrief-title"><div class="result-heading"><div class="card-symbol ${good?'success-symbol':'warm-symbol'}">${icon(good?'check':early?'shield':'heart')}</div><div><span class="eyebrow">${s.practice?'Practice complete':`Wave ${s.index+1} complete`}</span><h2 id="debrief-title">${title}</h2><p class="support">${note}</p></div></div>${forecast}<div class="reserve-note">${icon('bolt','',16)} Keep 20 power for air.</div>${line?this.pipLine():''}<div class="choices">${choice('science','flask','Science','+1 star','−15 power',s.power<CONFIG.sciencePower)}${choice('rest','rest','Rest','+20 crew','−15 power',s.power<CONFIG.restPower)}${choice('charge','battery','Charge','+25 power','No star')}</div><details class="wave-fact"><summary>Storm record ${icon('book','',14)}</summary><p>NASA's model: about ${travelDays(e)} days to Mars. Our game: ${Math.round(this.game.warningDuration)} seconds. ${escape(encounterLabel(e))}.</p><a href="${escape(e.link)}" target="_blank" rel="noopener noreferrer">Open NASA record</a></details></section></div>`;
    }else if(s.phase==='report'){
      const won=s.outcome==='won';line=won?'Red Base made it. Nice work, Commander.':'Everyone is in the safe room. Want another go?';
      html=`<div class="shade"><section class="card report" role="dialog" aria-labelledby="report-title"><div class="card-symbol report-symbol">${icon(won?'star':'shield')}</div><span class="eyebrow">${won?this.game.rank:'Mission paused'}</span><h2 id="report-title">${won?'Home safe.':'A new plan?'}</h2><div class="stars-row" aria-label="${s.stars} of 8 stars">${Array.from({length:8},(_,i)=>icon('star',i<s.stars?'earned':'empty')).join('')}</div><p class="support">${s.completed} waves. ${s.stars} science jobs.${won?'':` Low ${s.reason==='air'?'air':'crew health'}.`}</p>${this.pipLine()}<button class="button primary wide" type="button" data-action="replay">Play again ${icon('replay')}</button><details class="storm-list"><summary>The 8 NASA storm records ${icon('book','',16)}</summary><ol>${s.run.map((storm,i)=>`<li><a href="${escape(storm.link)}" target="_blank" rel="noopener noreferrer">${escape(eventDate(storm))}</a> · ${Math.round(storm.speedKmS)} km/s<br>${escape(encounterLabel(storm))}${i>=s.completed?' · not completed':''}</li>`).join('')}</ol><p>Dates are UTC. Mars encounters are predictions.</p></details></section></div>`;
    }
    this.dialogue.cancel();this.root.innerHTML=html;if(line)this.dialogue.show(this.root.querySelector('[data-dialogue]'),line);
    $('announcer').textContent=s.paused?'Game paused.':s.phase==='storm'?'The wave is here.':s.phase==='debrief'?'Wave complete. Choose a job.':s.phase==='report'?'Mission report.':'';
    const target=this.root.querySelector(s.phase==='story'?'[data-action="next-story"]':s.phase==='debrief'?'[data-choice="science"]:not(:disabled),[data-choice="charge"]':s.phase==='start'?'[data-action="play"]':'[data-action="ready"],[data-action="resume"],[data-action="replay"]');
    if(target)requestAnimationFrame(()=>target.focus({preventScroll:true}));
  }
  updateHUD(){
    const s=this.game.state,active=['warning','storm'].includes(s.phase),show=active||['intro','debrief','tutorial'].includes(s.phase)||(s.phase==='story'&&s.storyPanel===2);
    $('hud').hidden=!show;$('mission-tools').hidden=!show||s.phase==='story';
    for(const name of ['power','air','crew']){
      const value=number(s[name]),el=$(name+'-meter');$(name+'-value').textContent=value;$(name+'-fill').style.width=`${s[name]}%`;el.querySelector('[role="progressbar"]').setAttribute('aria-valuenow',value);el.classList.toggle('low',s[name]<(name==='power'?20:25));
      if(value<this.previousMeters[name]&&performance.now()-(this.lastFlash[name]||0)>650){this.lastFlash[name]=performance.now();el.classList.remove('dropped');void el.offsetWidth;el.classList.add('dropped');}this.previousMeters[name]=value;
    }
    $('power-meter').classList.toggle('draining',s.shield);
    if(this.shownStars!==s.stars){$('stars-label').innerHTML=`${icon('star','',18)} <span>${s.stars}</span>`;this.shownStars=s.stars;}
    $('storm-count').textContent=s.practice?'Practice':`${s.index+1} / 8`;$('pause-button').hidden=!active;
    if(this.shownSound!==this.audio.enabled){$('sound-button').innerHTML=icon(this.audio.enabled?'sound':'muted','',20);$('sound-button').setAttribute('aria-label',this.audio.enabled?'Mute audio':'Enable audio');$('sound-button').setAttribute('aria-pressed',String(this.audio.enabled));this.shownSound=this.audio.enabled;}
    $('storm-tag').hidden=!active;$('storm-tag').textContent=s.practice?'Practice · crew safe':`${eventDate(this.game.event)} · ${Math.round(this.game.event.speedKmS)} km/s`;
    $('countdown').hidden=!active||s.paused;$('countdown-value').textContent=s.phase==='warning'?Math.ceil(this.game.warningRemaining):s.shield?'Safe':'Shield!';$('countdown-caption').textContent=s.phase==='warning'?'until arrival':'wave passing';$('countdown').classList.toggle('urgent',s.phase==='warning'&&this.game.warningRemaining<=3);
    this.shieldButton.hidden=!active||s.paused;const locked=s.practice&&s.phase==='warning'&&this.game.warningRemaining>CONFIG.practiceButtonUnlockSeconds;
    this.shieldButton.disabled=locked;this.shieldButton.classList.toggle('on',s.shield);this.shieldButton.classList.toggle('exhausted',s.exhausted);this.shieldButton.setAttribute('aria-pressed',String(s.shield));
    $('shield-label').textContent=s.exhausted?'Let go. Recharge.':s.shield?'Shield up':this.actions.getTap()?'Tap to shield':'Hold to shield';
    $('shield-hint').textContent=s.exhausted?'Battery empty':s.shield?(this.actions.getTap()?'Tap when the wave passes':'Let go when it passes'):this.actions.getTap()?'Tap again to lower':'Space also works';
    $('practice-hint').hidden=!(active&&s.practice&&!s.paused);$('practice-hint').textContent=locked?'Wait for it…':s.phase==='warning'?'Now. Hold!':'Keep it up.';
    $('reserve-hint').hidden=!(active&&!s.practice&&s.power<CONFIG.airPowerReserve);
  }
}
