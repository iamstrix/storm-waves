/* AI assistance: Codex wrote the original UI; Claude Code supplied the design/specification. */
import { CONFIG, warningSeconds } from './config.js';
import { eventDate, travelDays, speedLabel, sizeLabel, encounterLabel, protectionCost, reserveTarget } from './data.js';

const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const number = value => Math.max(0, Math.round(value));
const $ = id => document.getElementById(id);

const STORIES = [
  { text: `Hi, Commander! I'm <strong>Pip</strong>, the robot at Red Base. Three astronauts live here, on Mars. You're in charge now!`, speak: "Hi, Commander! I'm Pip, the robot at Red Base. Three astronauts live here, on Mars. You're in charge now!" },
  { text: `Sometimes the Sun sends out a huge cloud of fast-moving bits. Earth has a big <strong>magnetic shield</strong>. Mars does not. NASA watches the Sun to help crews prepare.`, speak: 'Sometimes the Sun sends out a huge cloud of fast-moving bits. Earth has a big magnetic shield. Mars does not. NASA watches the Sun to help crews prepare.' },
  { text: `Our <strong>imaginary shield</strong> uses the same battery as the air machine. Too much shield means less air! Real crews use radiation shelters.`, speak: 'Our imaginary shield uses the same battery as the air machine. Too much shield means less air! Real crews use radiation shelters.' },
  { text: `NASA recorded every Sun storm in this game. Its computers <strong>predicted trips near Mars</strong>. Get through 8 waves, and do science to earn stars!`, speak: 'NASA recorded every Sun storm in this game. Its computers predicted trips near Mars. Get through eight waves, and do science to earn stars!' },
];

export class GameUI {
  constructor(game, actions) {
    this.game = game; this.actions = actions; this.key = ''; this.speechText = '';
    this.previousMeters = {power:70,air:100,crew:100};
    this.root = $('panel-root'); this.main = $('game'); this.shieldButton = $('shield-button');
    $('pause-button').addEventListener('click', () => this.game.pause());
    $('about-button').addEventListener('click', () => this.openAbout());
    $('close-about').addEventListener('click', () => this.closeAbout());
    $('about-done').addEventListener('click', () => this.closeAbout());
    $('about-dialog').addEventListener('click', event => { if(event.target === $('about-dialog')) this.closeAbout(); });
    $('about-dialog').addEventListener('close', () => { if(this.aboutPaused){this.aboutPaused=false;this.game.resume();} });
    this.root.addEventListener('click', event => {
      const button=event.target.closest('button[data-action]');if(!button||button.disabled)return;
      const action=button.dataset.action;
      if(action==='speak'){this.speak();return;}
      if(action!=='speak')this.cancelSpeech();
      if(action==='play')this.actions.play();
      if(action==='story')this.actions.play(true);
      if(action==='tap')this.actions.toggleTap();
      if(action==='next-story')this.actions.nextStory();
      if(action==='skip-story')this.actions.skipStory();
      if(action==='ready')this.game.ready();
      if(action==='choice')this.game.choose(button.dataset.choice);
      if(action==='replay')this.actions.replay();
      if(action==='resume')this.game.resume();
      if(action==='home')this.game.showStart();
      if(action==='retry')this.actions.retry();
      this.update(true);
    });
  }

  setLoading(error = '') {
    $('hud').hidden=true;$('mission-tools').hidden=true;$('shield-button').hidden=true;$('storm-tag').hidden=true;$('countdown').hidden=true;
    this.root.innerHTML=`<div class="shade"><section class="card" role="dialog" aria-labelledby="loading-title"><h2 id="loading-title">${error?'A little trouble loading':'Getting Red Base ready…'}</h2><p>${error?'We could not load the saved storm records.':'Opening the saved NASA storm records.'}</p>${error?`<p class="error-code">${escape(error)}</p><button class="button primary" data-action="retry" type="button">Try again</button>`:''}</section></div>`;
  }

  speechButton() { return 'speechSynthesis' in window ? '<div class="speech-row"><button class="button secondary" type="button" data-action="speak">🔊 Read to me</button></div>' : ''; }
  cancelSpeech() { window.speechSynthesis?.cancel(); }
  speak() {
    if (!('speechSynthesis' in window) || !this.speechText) return;
    this.cancelSpeech();
    const utterance = new SpeechSynthesisUtterance(this.speechText);
    utterance.lang='en-US';utterance.rate=CONFIG.speechRate;
    const voice=window.speechSynthesis.getVoices().find(voice=>voice.localService&&voice.lang.startsWith('en'));
    if(voice)utterance.voice=voice;
    window.speechSynthesis.speak(utterance);
  }

  openAbout() {
    this.cancelSpeech();this.aboutPaused=this.game.isActive;
    if(this.aboutPaused)this.game.pause();
    this.game.releaseShield();$('about-dialog').showModal();this.update();
  }
  closeAbout() { $('about-dialog').close(); }

  update(force=false) {
    const s=this.game.state;
    this.main.dataset.phase=s.phase;
    const tap=this.actions.getTap();
    const key=[s.phase,s.paused,s.index,s.storyPanel,s.practice,tap].join('|');
    if(force||key!==this.key){this.key=key;this.renderPanel();}
    this.updateHUD();
  }

  renderPanel() {
    const s=this.game.state,e=this.game.event;
    let html='',speech='';
    if(s.paused){
      html=`<div class="shade"><section class="card" role="dialog" aria-labelledby="pause-title"><span class="eyebrow">Red Base is waiting</span><h2 id="pause-title">Take your time.</h2><p>The mission clock is paused.</p><p class="small">Your shield is off. Press it again when you're ready.</p><div class="button-row"><button type="button" class="button primary" data-action="resume">Keep going ▶</button><button type="button" class="button secondary" data-action="home">Back to start</button></div></section></div>`;
    }else if(s.phase==='start'){
      html=`<section class="start-screen" aria-label="Start your mission"><div class="start-utilities"><button class="utility" type="button" data-action="story">❔ Story</button><button class="utility" type="button" data-action="tap" aria-pressed="${this.actions.getTap()}">✋ Tap mode: ${this.actions.getTap()?'on':'off'}</button></div><header class="brand"><h1>Storm <span>Waves</span></h1><p>Keep your Mars crew safe.<br>Save power for air and science.</p></header><div class="how"><span>☀️ A wave is coming</span><span>🛡️ Hold to shield</span><span>⚡ Save your power</span></div><button class="play-button" type="button" data-action="play">Play</button><div class="start-subtitle">A one-button game · real NASA storm records</div></section>`;
    }else if(s.phase==='story'){
      const story=STORIES[s.storyPanel];speech=story.speak;
      html=`<section class="story-screen ${s.storyPanel===1?'lesson':s.storyPanel===2?'power-story':''}" aria-label="Pip's story, panel ${s.storyPanel+1} of 4"><button class="utility story-skip" type="button" data-action="skip-story">Skip story</button><div class="story-bubble"><span class="who">Pip · your base robot</span><p>${story.text}</p>${this.speechButton()}</div><div class="story-dots" aria-label="Panel ${s.storyPanel+1} of 4">${[0,1,2,3].map(i=>i===s.storyPanel?'<b>●</b>':'○').join('')}</div><button class="button primary story-next" type="button" data-action="next-story">${s.storyPanel===3?"Let's go! ▶":'Next ▶'}</button></section>`;
    }else if(s.phase==='tutorial'){
      speech="These three bars are your crew's needs. Keep all of them above zero. This is a practice wave. Your crew is safe.";
      html=`<div class="tutorial-shade"></div><section class="tutorial-tip" role="dialog" aria-labelledby="tutorial-title"><p id="tutorial-title">These three bars are your crew's needs.<br>Keep them above zero.</p><p class="small">Practice first. The crew is safe!</p><button class="button primary" type="button" data-action="ready">Got it</button>${this.speechButton()}</section>`;
    }else if(s.phase==='intro'){
      const comparison=Math.round(CONFIG.comparisonDistanceKm/e.speedKmS*2)/2;
      const prediction=e.marsGlancingBlow?'NASA’s model predicted a glancing encounter near Mars.':'NASA’s model predicted a direct encounter near Mars.';
      speech=`Wave ${s.index+1} of ${s.run.length}. NASA spotted this storm on ${eventDate(e)}. Speed: ${Math.round(e.speedKmS)} kilometers per second. ${prediction} In our game a glancing wave is gentler. Your shield and the air machine share one battery. Ready?`;
      html=`<div class="shade"><section class="card" role="dialog" aria-labelledby="intro-title"><span class="eyebrow">☀️ Wave ${s.index+1} of ${s.run.length}</span><h2 id="intro-title">NASA spotted this storm<br>on ${escape(eventDate(e))}.</h2><p><strong>${Math.round(e.speedKmS)} km/s.</strong> About the distance from Manila to Davao in ${comparison} ${comparison===1?'second':'seconds'}!</p><p class="small">${prediction}<br>In this game, a glancing wave hits more gently.</p>${s.index===0?'<div class="fact">Get through <strong>8 waves</strong>. Do science to earn ⭐.<br>Keep at least <strong>20 power</strong> for the air machine.</div>':''}<div class="fact science-note">Real storm record · predicted Mars encounter.<br>Our shield and meter numbers are game rules.</div>${this.speechButton()}<button class="button primary" type="button" data-action="ready">Ready! ▶</button></section></div>`;
    }else if(s.phase==='debrief'){
      const result=s.lastResult;
      const heading=result.quality==='great'?'Great timing!':result.quality==='early'?'Safe, but early.':'The wave got through.';
      let explanation=result.quality==='great'?'Your shield covered the wave.':result.quality==='early'?`Your shield was up ${result.earlySeconds.toFixed(1)} seconds early. That used about ${Math.round(result.earlySeconds*CONFIG.shieldPowerPerSecond)} extra power.`:s.practice?'The crew is safe in practice. Try raising the shield a little sooner.':`The crew lost ${number(result.crewLost)} health. Try raising the shield a little sooner.`;
      const next=s.practice?this.game.event:this.game.nextEvent;
      const forecast=next?`<div class="forecast"><strong>Next wave: ☀️ ${escape(eventDate(next))}</strong><div class="chips"><span class="chip">${escape(speedLabel(next))}</span><span class="chip">${escape(sizeLabel(next))}</span><span class="chip">${next.marsGlancingBlow?'↗ Glancing model':'→ Direct model'}</span></div><div class="target">Game plan: the next shield needs about <strong>${protectionCost(next)} power</strong>. Aim for <strong>${reserveTarget(next)} before it hits</strong>, including 20 for air. Solar panels recharge while you wait.</div></div>`:'';
      const choice=(name,icon,title,gain,cost,disabled)=>`<button type="button" class="choice" data-action="choice" data-choice="${name}" ${disabled?'disabled':''}><span class="icon" aria-hidden="true">${icon}</span><span>${title}</span><small><span class="gain">${gain}</span><br><span class="cost">${disabled?'Not enough power':cost}</span></small></button>`;
      speech=`${heading} ${explanation} Your shield used about ${number(result.powerSpent)} power. NASA's model estimated about ${travelDays(e)} days to reach Mars. Our game shortened that trip to ${Math.round(this.game.warningDuration)} seconds. ${next?`The next wave is ${speedLabel(next)}, ${sizeLabel(next)}, and needs about ${protectionCost(next)} power for its shield. `:''}What will the crew do now? Science earns one star and uses fifteen power. Rest heals twenty crew and uses fifteen power. Charge adds twenty five power and earns no star.`;
      html=`<div class="shade"><section class="card debrief" role="dialog" aria-labelledby="debrief-title"><span class="eyebrow">${s.practice?'Practice complete · crew safe':`Wave ${s.index+1} complete`}</span><h2 id="debrief-title">${heading}</h2><p>${explanation} Your shield used about <strong>${number(result.powerSpent)} power</strong>.</p>${result.airLost>1?`<p class="small">Air fell by ${number(result.airLost)} because power went below the 20-unit reserve.</p>`:''}<div class="fact">NASA’s model estimated about <strong>${travelDays(e)} days</strong> to reach Mars. Our game shortened the trip to <strong>${Math.round(this.game.warningDuration)} seconds</strong>.</div>${forecast}<p><strong>What will the crew do now?</strong></p>${s.practice?'<p class="small">Every choice has a cost. Try one!<br>Your real mission starts next with fresh supplies.</p>':''}<div class="choices">${choice('science','🔬','Do science','Get 1 star','Uses 15 power',s.power<CONFIG.sciencePower)}${choice('rest','🛌','Rest the crew','Heal crew 20','Uses 15 power',s.power<CONFIG.restPower)}${choice('charge','🔋','Charge up','Gain 25 power','No star',false)}</div><p class="small">Keyboard: Space to choose · Enter to confirm</p>${this.speechButton()}</section></div>`;
    }else if(s.phase==='report'){
      const won=s.outcome==='won';
      const heading=won?`Mission complete, ${this.game.rank}!`:'Time for the safe room.';
      const pip=won?'Red Base made it through storm season! NASA scientists watch the Sun to help keep real astronauts safe.':"The crew went to the safe room. Let's try a different plan!";
      speech=`${heading} ${pip} You got through ${s.completed} waves and did ${s.stars} science jobs. The shield and the air machine share one battery. Real mission planners balance protection, power, and science too.`;
      html=`<div class="shade"><section class="card report" role="dialog" aria-labelledby="report-title"><span class="eyebrow">Red Base · mission report</span><h2 id="report-title">${heading}</h2><div class="stars-row" aria-label="${s.stars} of 8 stars">${Array.from({length:8},(_,i)=>i<s.stars?'⭐':'<span class="empty">⭐</span>').join('')}</div>${!won?`<p>The crew ran low on <strong>${s.reason==='air'?'air':'health'}</strong>.</p>`:''}<p>You got through <strong>${s.completed} waves</strong><br>and did <strong>${s.stars} science ${s.stars===1?'job':'jobs'}</strong>.</p><p class="small">Pip: “${pip}”</p><div class="fact">Protection, power, and science share limited resources. Real mission planners make trade-offs too.</div><details class="storm-list"><summary>📋 See the 8 NASA storm records</summary><ol>${s.run.map((storm,i)=>`<li><a href="${escape(storm.link)}" target="_blank" rel="noopener noreferrer">${escape(eventDate(storm))} ↗</a> · ${Math.round(storm.speedKmS)} km/s · ${sizeLabel(storm)} · ${encounterLabel(storm)}${i>=s.completed?' · not completed':''}</li>`).join('')}</ol><p class="small">Dates are UTC. Encounter descriptions are model predictions.</p></details>${this.speechButton()}<div class="button-row"><button class="button primary" type="button" data-action="replay">Play again ▶</button><button class="button secondary" type="button" data-action="home">Start screen</button></div><p class="small">NASA DONKI · ${escape(eventDate(s.run[0]))} to ${escape(eventDate(s.run.at(-1)))}<br>Snapshot saved ${CONFIG.capturedLabel} · <a href="${CONFIG.donkiUrl}" target="_blank" rel="noopener noreferrer">See NASA’s records ↗</a></p></section></div>`;
    }
    this.speechText=speech;
    this.root.innerHTML=html;
    this.cancelSpeech();
    $('announcer').textContent=s.paused?'Game paused.':s.phase==='warning'?(s.practice?'Practice wave. Your crew is safe.':`Wave ${s.index+1}. Watch for the storm.`):s.phase==='storm'?'The wave is here.':s.phase==='debrief'?s.lastResult.quality==='great'?'Great timing. Choose the next task.':'Wave complete. Choose the next task.':s.phase==='report'?'Mission report.':'';
    const target=this.root.querySelector(s.phase==='story'?'[data-action="next-story"]':s.phase==='debrief'?'[data-choice="science"]:not(:disabled),[data-choice="charge"]':s.phase==='start'?'[data-action="play"]':'[data-action="ready"],[data-action="resume"],[data-action="replay"]');
    if(target)requestAnimationFrame(()=>target.focus({preventScroll:true}));
    this.root.querySelector('.card')?.scrollTo(0,0);
  }

  updateHUD() {
    const s=this.game.state,active=['warning','storm'].includes(s.phase),showHud=active||s.phase==='tutorial'||(s.phase==='story'&&s.storyPanel===2);
    $('hud').hidden=!showHud;$('mission-tools').hidden=!active;
    for(const name of ['power','air','crew']){
      const value=number(s[name]),el=$(name+'-meter');$(name+'-value').textContent=value;$(name+'-fill').style.width=`${s[name]}%`;el.querySelector('[role="progressbar"]').setAttribute('aria-valuenow',value);el.classList.toggle('low',s[name]<25);
      if(value<this.previousMeters[name]-1){el.classList.remove('dropped');void el.offsetWidth;el.classList.add('dropped');}
      this.previousMeters[name]=value;
    }
    $('power-meter').classList.toggle('draining',s.shield);
    $('stars-label').textContent=`⭐ ${s.stars}`;$('storm-count').textContent=s.practice?'Practice':`${s.index+1} / ${s.run.length}`;
    $('storm-tag').hidden=!active;$('storm-tag').classList.toggle('practice',s.practice);
    $('storm-tag').textContent=s.practice?'Practice wave · the crew is safe':`☀️ ${eventDate(this.game.event)} · ${Math.round(this.game.event.speedKmS)} km/s`;
    $('countdown').hidden=!active||s.paused;
    $('countdown-value').textContent=s.phase==='warning'?Math.ceil(this.game.warningRemaining):s.shield?'🛡️':'☀️';
    $('countdown-caption').textContent=s.phase==='warning'?'game seconds away':s.shield?'Keep the crew covered':'The wave is here!';
    this.shieldButton.hidden=!active||s.paused;
    const practiceLocked=s.practice&&s.phase==='warning'&&this.game.warningRemaining>CONFIG.practiceButtonUnlockSeconds;
    this.shieldButton.disabled=practiceLocked;
    this.shieldButton.classList.toggle('on',s.shield);this.shieldButton.classList.toggle('exhausted',s.exhausted);
    this.shieldButton.setAttribute('aria-pressed',String(s.shield));
    $('shield-label').textContent=s.exhausted?'Empty! Let go.':s.shield?'Shield on!':this.actions.getTap()?'Tap for shield':'Hold for shield';
    $('shield-hint').textContent=s.exhausted?'Release, then wait for some power.':s.shield?(this.actions.getTap()?'Tap again when the wave is gone.':'Let go when the wave is gone.'):(this.actions.getTap()?'Tap again to switch it off.':'or hold the space bar');
    $('practice-hint').hidden=!(active&&s.practice&&!s.paused);
    $('practice-hint').textContent=practiceLocked?'Wait for it…':s.phase==='warning'?'Now! Hold it!':s.shield?'Keep holding…':'Raise your shield!';
    const low=active&&!s.practice&&s.power<CONFIG.airPowerReserve;
    $('reserve-hint').hidden=!low;
    $('reserve-hint').textContent='Air needs 20 power. Let go to recharge.';
  }
}
