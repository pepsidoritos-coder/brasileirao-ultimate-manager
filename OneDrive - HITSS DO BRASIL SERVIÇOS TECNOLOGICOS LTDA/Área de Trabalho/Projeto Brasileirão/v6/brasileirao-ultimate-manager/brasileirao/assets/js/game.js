/**
 * game.js
 * Lógica de simulação: partidas, rodadas, apostas, estado persistente
 * Melhorias: LocalStorage, controle de velocidade, substituições no intervalo
 */

/* ════════════════════════════════════════
   ESTADO GLOBAL
════════════════════════════════════════ */
let league        = [];
let schedule      = [];
let round         = 1;
let matches       = [];
let activeMIdx    = 0;
let isRunning     = false;
let tickIv        = null;
let uiIv          = null;
let roundFinished = false;
let logs          = {};
let scorers       = {};   // { playerName: { goals, team } } — acumula toda a temporada
let wallet        = 2500;
let bets          = [];
let gameSpeed     = 1;    // multiplicador: 0.5 | 1 | 2 | 5

/* ════════════════════════════════════════
   INICIALIZAÇÃO
════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  initLeague();
  buildSchedule();
  loadState();      // tenta restaurar do LocalStorage
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  requestAnimationFrame(renderLoop);
  setupSpeedControl();
});

function initLeague() {
  league = Object.keys(DB).map(n => ({
    nome:n, pts:0, j:0, v:0, e:0, d:0, gp:0, sg:0
  }));
  Object.values(DB).forEach(t => {
    t.skills = {};
    t.p.forEach((name, i) => {
      let b = t.r + (Math.random()*8|0) - 4;
      if (i >= 8) b += 4;
      if (i === 0) b += 3;
      t.skills[name] = Math.min(99, Math.max(50, b));
    });
  });
}

function buildSchedule() {
  let teams=Object.keys(DB), n=teams.length, half=n/2, arr=[...teams];
  for (let r=0; r<n-1; r++) {
    let row=[]; for (let i=0;i<half;i++) row.push({h:arr[i],a:arr[n-1-i]});
    schedule.push(row); arr.splice(1,0,arr.pop());
  }
  for (let r=0; r<n-1; r++) {
    let row=[]; for (let i=0;i<half;i++) row.push({h:arr[n-1-i],a:arr[i]});
    schedule.push(row); arr.splice(1,0,arr.pop());
  }
}

function initRound() {
  if (round > 38) { showChampion(); return; }
  safeSet('round-disp', `RODADA ${round}/38`);
  const btnGo = safeEl('btn-go');
  if (btnGo) {
    btnGo.innerHTML = `<i class="fas fa-play"></i> INICIAR RODADA ${round}`;
    btnGo.onclick = handleMainBtn;
    btnGo.disabled = false;
    btnGo.style.display = 'block';
  }
  const base = schedule[round-1];
  matches=[]; bets=[]; logs={};
  base.forEach((m,i) => {
    matches.push({
      h:m.h, a:m.a, sh:0, sa:0,
      clock:0, speed:.8+Math.random()*.5,
      htExtra:1+Math.floor(Math.random()*4),
      ftExtra:2+Math.floor(Math.random()*6),
      status:'1H', paused:false, pauseTick:0,
      paused30:false, paused75:false, isHT:false,
    });
    logs[i] = [];
  });
  activeMIdx=0; isExiting=false; isHuddle=false; isHalftimeExit=false; roundFinished=false;
  matches.forEach(m => buildPlayerStates(m));
  updateScoreboard(); renderRoundList(); renderBetsLive();
  updatePieChart(); renderBetForm(); renderNarrator();
}

/* ════════════════════════════════════════
   CONTROLE DE VELOCIDADE
════════════════════════════════════════ */
function setupSpeedControl() {
  const slider = safeEl('speed-slider');
  const label  = safeEl('speed-value');
  if (!slider) return;
  const speeds = [0.5, 1, 2, 5];
  slider.addEventListener('input', () => {
    gameSpeed = speeds[parseInt(slider.value)];
    if (label) label.textContent = gameSpeed + 'x';
  });
}

/* ════════════════════════════════════════
   GAME TICK — lógica de jogo
════════════════════════════════════════ */
function gameTick() {
  // Usa a flag `narrating` do ui.js para sincronia perfeita

  matches.forEach((m, idx) => {
    if (m.status === 'FT') return;

    /* Pausa / intervalo */
    if (m.paused) {
      if (idx === activeMIdx) isHuddle = true;
      m.pauseTick--;
      if (m.pauseTick <= 0) {
        m.paused = false;
        if (m.isHT) {
          m.isHT=false; m.status='2H'; m.clock=45;
          if (idx===activeMIdx) { isHalftimeExit=false; isHuddle=false; buildPlayerStates(); }
          addLog(idx, 45, 'p', pickNarr('resumeHalf'));
        } else {
          if (idx===activeMIdx) isHuddle = false;
          addLog(idx, fmtMin(m), 'p', pickNarr('resumePause'));
        }
      }
      return;
    }

    /* ~60s por partida com gameSpeed multiplicando */
    // Se o narrador está falando e é a partida ativa, o relógio PARA
    const isNarrating = (typeof narrating !== 'undefined' && narrating && idx === activeMIdx);
    if (isNarrating) return; // campo continua via physics, mas o relógio e eventos param
    
    m.clock += 0.045 * m.speed * gameSpeed;
    const min = Math.floor(m.clock);
    const mStr = fmtMin(m);

    /* Pausas técnicas */
    if (min>=30 && !m.paused30) {
      m.paused=true; m.pauseTick=40; m.paused30=true;
      addLog(idx, 30, 'p', '⏸ Pausa técnica — jogadores se reúnem com o técnico na linha lateral.');
    }
    if (min>=75 && !m.paused75) {
      m.paused=true; m.pauseTick=40; m.paused75=true;
      addLog(idx, 75, 'p', '⏸ Pausa técnica no segundo tempo. Bola fora de campo.');
    }

    /* Intervalo */
    if (m.status==='1H' && m.clock >= 45+m.htExtra) {
      m.status='HT'; m.clock=45;
      m.paused=true; m.pauseTick=60; m.isHT=true;
      if (idx===activeMIdx) isHalftimeExit=true;
      addLog(idx, 45, 'p', pickNarr('halftime'));
      return;
    }

    /* Fim de jogo */
    if (m.status==='2H' && m.clock >= 90+m.ftExtra) {
      m.status='FT'; m.clock=90;
      addLog(idx, 90, '', pickNarr('endgame'));
      if (idx===activeMIdx) { isExiting=true; isHuddle=false; }
      return;
    }

    if (m.status!=='1H' && m.status!=='2H') return;

    /* Se tem um ataque fluindo, não rola novos eventos! */
    if (m.activeAttack) {
       m.activeAttack.timer--;
       if (m.activeAttack.timer <= 0) {
         // Timer expirou: FORÇA o chute e a narração para nunca ficar mudo
         executeAttackShot(m, m.activeAttack);
         m.activeAttack = null;
       }
       return; 
    }

    /* Gol Aleatório */
    if (Math.random() < 0.00068) {
      const rH=DB[m.h].r, rA=DB[m.a].r;
      const isHome = Math.random() < rH/(rH+rA);
      const atkTeam = isHome ? m.h : m.a;
      const defTeam = isHome ? m.a : m.h;
      const scorer = regScorer(atkTeam);
      queueAttack(m, 'goal', scorer, atkTeam, pickGK(defTeam), isHome, idx);
    }

    /* Eventos aleatórios descritivos */
    if (Math.random() < 0.003) {
      const r       = Math.random();
      const isHome  = Math.random() > 0.5;
      const atkTeam = isHome ? m.h : m.a;
      const defTeam = isHome ? m.a : m.h;
      const atkPl   = pickPlayer(atkTeam);
      const defPl   = pickPlayer(defTeam);
      const defGK   = pickGK(defTeam);

      if (r > 0.97) { 
        // CARTÃO VERMELHO DIRETO
        addLog(idx,mStr,'r', Narrator.generate(m, 'foul', atkPl, atkTeam, defGK, defTeam, isHome)); 
        if(m.players){
          const pl=m.players.find(p=>p.name===defPl&&p.team===defTeam&&!p.isGK&&!p.expulso);
          if(pl){ pl.expulso=true; pl.yellows=2; }
        }
        triggerEvent(m, 'foul', atkPl); 
      }
      else if (r > 0.93) { 
        addLog(idx,mStr,'pen', Narrator.generate(m, 'penalty', atkPl, atkTeam, defGK, defTeam, isHome)); 
        triggerEvent(m, 'penalty', atkPl, false); 
        setTimeout(()=>{ 
          if(Math.random()<0.78){
            isHome?m.sh++:m.sa++; 
            regScorer(atkTeam, atkPl); 
            addLog(idx,mStr,'g', Narrator.generate(m, 'penaltyScored', atkPl, atkTeam, defGK, defTeam, isHome)); 
            triggerEvent(m, 'penaltyScored', atkPl, true); 
            if(idx===activeMIdx)showGoalCeleb(atkPl, atkTeam);
          } else {
            addLog(idx,mStr,'', Narrator.generate(m, 'penaltyMissed', atkPl, atkTeam, defGK, defTeam, isHome));
          }
        }, 800); 
      }
      else if (r > 0.88) { 
        // CARTÃO AMARELO
        if(m.players){
          const pl=m.players.find(p=>p.name===defPl&&p.team===defTeam&&!p.isGK&&!p.expulso);
          if(pl){
            pl.yellows = (pl.yellows||0) + 1;
            if(pl.yellows >= 2){
              // SEGUNDO AMARELO = VERMELHO
              pl.expulso = true;
              addLog(idx,mStr,'r', Narrator.generate(m, 'foul', atkPl, atkTeam, defGK, defTeam, isHome));
            } else {
              addLog(idx,mStr,'y', Narrator.generate(m, 'foul', atkPl, atkTeam, defGK, defTeam, isHome));
            }
          } else {
            addLog(idx,mStr,'y', Narrator.generate(m, 'foul', atkPl, atkTeam, defGK, defTeam, isHome));
          }
        } else {
          addLog(idx,mStr,'y', Narrator.generate(m, 'foul', atkPl, atkTeam, defGK, defTeam, isHome));
        }
        triggerEvent(m, 'foul', atkPl); 
      }
      else if (r > 0.82) { 
        addLog(idx,mStr,'foul', Narrator.generate(m, 'foul', atkPl, atkTeam, defGK, defTeam, isHome)); 
        triggerEvent(m, 'foul', atkPl); 
      }
      else if (r > 0.76) { 
        addLog(idx,mStr,'', Narrator.generate(m, 'corner', atkPl, atkTeam, defGK, defTeam, isHome)); 
        triggerEvent(m, 'corner', atkPl); 
      }
      else if (r > 0.70) { 
        queueAttack(m, 'save', atkPl, atkTeam, defGK, isHome, idx);
      }
      else if (r > 0.63) { 
        queueAttack(m, 'shot', atkPl, atkTeam, defGK, isHome, idx);
      }
      else if (r > 0.56) { 
        addLog(idx,mStr,'', Narrator.generate(m, 'dribble', atkPl, atkTeam, defGK, defTeam, isHome)); 
        triggerEvent(m, 'dribble', atkPl);
      }
      else if (r > 0.50) { 
        addLog(idx,mStr,'foul', Narrator.generate(m, 'foul', atkPl, atkTeam, defGK, defTeam, isHome)); 
        triggerEvent(m, 'foul', atkPl); 
      }
      else if (r > 0.44) { 
        addLog(idx,mStr,'', Narrator.generate(m, 'offside', atkPl, atkTeam, defGK, defTeam, isHome)); 
        triggerEvent(m, 'shot', atkPl); 
      }
      else { 
        addLog(idx,mStr,'', Narrator.generate(m, 'possession', atkPl, atkTeam, defGK, defTeam, isHome)); 
      }
    }

    /* Comentário de posse adicional */
    if (Math.random() < 0.002) {
      const isH = Math.random()>0.5;
      const t2 = isH ? m.h : m.a;
      addLog(idx, mStr, '', Narrator.generate(m, 'possession', pickPlayer(t2), t2, pickGK(isH?m.a:m.h), isH?m.a:m.h, isH));
    }
  });

  /* Checa se TODAS terminaram */
  if (matches.every(m => m.status === 'FT')) finishRound();
}

function fmtMin(m) {
  const min = Math.floor(m.clock);
  if (m.status==='1H' && m.clock>45) return `45+${min-45}`;
  if (m.status==='2H' && m.clock>90) return `90+${min-90}`;
  return min;
}

function updateUI() {
  renderRoundList(); renderBetsLive(); updateScoreboard();
  const m = matches[activeMIdx]; if (!m) return;
  safeSet('sc-h', m.sh); safeSet('sc-a', m.sa);
  let clk='', stop='';
  if      (m.status==='FT')                    { clk='FIM'; }
  else if (m.status==='HT')                    { clk='INT'; }
  else if (m.status==='2H' && m.clock>90)      { clk='90'; stop=`+${Math.floor(m.clock-90)}'`; }
  else if (m.status==='1H' && m.clock>45)      { clk='45'; stop=`+${Math.floor(m.clock-45)}'`; }
  else { const c=Math.floor(m.clock); clk=(c<10?'0':'')+c+':00'; }
  safeSet('sc-clock', clk+' '); safeSet('sc-stop', stop);
}

/* ════════════════════════════════════════
   FIM DE RODADA
════════════════════════════════════════ */
function finishRound() {
  if (roundFinished) return;
  roundFinished = true;
  clearInterval(tickIv); clearInterval(uiIv);
  tickIv=null; uiIv=null;
  isRunning=false; isHuddle=false;
  updateUI();

  /* Atualiza classificação */
  matches.forEach(m => {
    const h=league.find(l=>l.nome===m.h);
    const a=league.find(l=>l.nome===m.a);
    if (!h||!a) return;
    h.j++;a.j++; h.gp+=m.sh; a.gp+=m.sa;
    h.sg+=(m.sh-m.sa); a.sg+=(m.sa-m.sh);
    if (m.sh>m.sa){h.pts+=3;h.v++;} else if(m.sa>m.sh){a.pts+=3;a.v++;} else{h.pts++;a.pts++;h.e++;a.e++;}
  });

  /* Apostas */
  let betMsg = '';
  bets.forEach(b => {
    const m=matches[b.mi]; if(!m) return;
    if (m.sh===b.ph && m.sa===b.pa) {
      const win=+(b.stake*b.odd).toFixed(2); wallet+=win;
      betMsg+=`<div style="background:rgba(0,230,118,.1);border:1px solid var(--accent);border-radius:7px;padding:10px;margin-bottom:6px;font-size:.84rem">🎯 <b>PLACAR EXATO!</b> ${b.ph}×${b.pa} em ${b.h} vs ${b.a} — <b style="color:var(--accent)">+R$${win.toFixed(2)}</b></div>`;
    }
  });
  updateWallet();
  renderLeague();
  showRoundEndPanel(betMsg);
  saveState();
  const btnGo=safeEl('btn-go'); if(btnGo) btnGo.style.display='none';
}

function showRoundEndPanel(betMsg) {
  league.sort((a,b)=>b.pts-a.pts||b.sg-a.sg||b.gp-a.gp);
  safeSet('rep-title', `RESULTADOS — RODADA ${round}`);
  safeSetHTML('rep-results', matches.map(m=>`
    <div class="rep-match">
      <img src="${logoOf(m.h)}" onerror="this.style.opacity=0">
      <span style="font-size:.82rem;font-weight:700;flex:1;margin-left:5px">${m.h.substring(0,8)}</span>
      <span class="rep-sc">${m.sh} - ${m.sa}</span>
      <span style="font-size:.82rem;font-weight:700;flex:1;text-align:right;margin-right:5px">${m.a.substring(0,8)}</span>
      <img src="${logoOf(m.a)}" onerror="this.style.opacity=0">
    </div>`).join(''));
  safeSetHTML('rep-table-body', league.slice(0,14).map((t,i)=>{
    let z=''; if(i<4)z='z-lib';else if(i<6)z='z-pre';else if(i<12)z='z-sul';else if(i>=16)z='z-reb';
    return `<tr class="trow ${z}"><td><b>${i+1}º</b></td>
    <td><span style="display:flex;align-items:center;gap:7px"><img src="${logoOf(t.nome)}" style="width:18px;height:18px;object-fit:contain" onerror="this.style.opacity=0">${t.nome}</span></td>
    <td class="pts-val">${t.pts}</td><td>${t.j}</td><td>${t.sg}</td></tr>`;
  }).join(''));
  safeSetHTML('rep-bets', betMsg||'<div style="color:var(--muted);font-size:.82rem;padding:6px 0">Nenhum palpite exato nesta rodada.</div>');
  const btnNext=safeEl('btn-next');
  if (btnNext) {
    if (round >= 38) { btnNext.innerHTML='<i class="fas fa-trophy"></i> VER CAMPEÃO'; btnNext.onclick=()=>{ closeEndPanel(); showChampion(); }; }
    else             { btnNext.innerHTML=`<i class="fas fa-forward"></i> PRÓXIMA RODADA ${round+1}`; btnNext.onclick=goNextRound; }
    btnNext.style.display = 'block';
  }
  const rep=safeEl('round-end-panel'); if(rep) rep.style.display='flex';
}

function closeEndPanel() { const rep=safeEl('round-end-panel'); if(rep) rep.style.display='none'; }
function goNextRound()   { closeEndPanel(); round++; roundFinished=false; initRound(); }

function handleMainBtn() {
  if (!bets.length) { alert('Faça suas apostas primeiro!'); setTab('bets',safeEl('tab-bets')); return; }
  isRunning=true; isExiting=false; isHuddle=false; isHalftimeExit=false; roundFinished=false;
  const btnGo=safeEl('btn-go'); if(btnGo) btnGo.style.display='none';
  matches.forEach((m,i) => addLog(i,'00','',pickNarr('kickoff',{H:m.h,A:m.a})));
  tickIv = setInterval(gameTick, 30);
  uiIv   = setInterval(updateUI, 250);
}

/* ════════════════════════════════════════
   PERSISTÊNCIA — LocalStorage
════════════════════════════════════════ */
const SAVE_KEY = 'brasileirao_save_v1';

function saveState() {
  try {
    const state = { round, wallet, scorers, league };
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    showSaveIndicator();
  } catch(e) { console.warn('Falha ao salvar estado:', e); }
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) { initRound(); return; }
    const state = JSON.parse(raw);
    round   = state.round   || 1;
    wallet  = state.wallet  || 2500;
    scorers = state.scorers || {};
    if (state.league) {
      state.league.forEach(saved => {
        const t = league.find(l=>l.nome===saved.nome);
        if (t) Object.assign(t, saved);
      });
    }
    updateWallet(); renderScorers();
    initRound();
  } catch(e) { console.warn('Falha ao carregar estado:', e); initRound(); }
}

function showSaveIndicator() {
  const el = safeEl('save-indicator');
  if (!el) return;
  el.classList.add('saved');
  el.innerHTML = '<i class="fas fa-check-circle"></i> Salvo';
  setTimeout(() => { el.classList.remove('saved'); el.innerHTML='<i class="fas fa-cloud"></i> Auto-save'; }, 2000);
}

function resetSave() {
  if (!confirm('Tem certeza que deseja resetar toda a temporada?')) return;
  localStorage.removeItem(SAVE_KEY);
  round=1; wallet=2500; scorers={};
  initLeague(); buildSchedule(); initRound();
  updateWallet(); renderScorers();
}

/* ════════════════════════════════════════
   ARTILHARIA
════════════════════════════════════════ */
function pickPlayer(team) { return DB[team].p[1+Math.floor(Math.random()*10)]; }
function pickGK(team)     { return DB[team].p[0]; }

function regScorer(team, specificPlayer) {
  const t = DB[team]; if (!t) return '?';
  let sc = specificPlayer;
  if (!sc) {
    let pool = [];
    t.p.forEach((name,i) => {
      if (i===0) return;
      let w = Math.floor((t.skills[name]||70)/10);
      if (i>=8) w*=3;
      for (let j=0; j<w; j++) pool.push(name);
    });
    sc = pool[Math.floor(Math.random()*pool.length)] || t.p[1];
  }
  if (!scorers[sc]) scorers[sc] = { goals:0, team };
  scorers[sc].goals++;
  renderScorers();
  return sc;
}

function renderScorers() {
  const el = safeEl('scorers-list'); if (!el) return;
  const sorted = Object.entries(scorers).sort((a,b)=>b[1].goals-a[1].goals).slice(0,12);
  if (!sorted.length) {
    el.innerHTML='<div style="color:var(--muted);font-size:.8rem;text-align:center;padding:10px">Nenhum gol ainda.</div>'; return;
  }
  el.innerHTML = sorted.map(([name,data],i) => {
    const clr   = (DB[data.team]||{}).c || '#566070';
    const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
    return `<div class="sc-row" style="align-items:center;gap:6px">
      <span class="sc-rank" style="color:${i<3?'var(--gold)':'var(--muted)'}">${medal||((i+1)+'º')}</span>
      <span style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:.83rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${name}</div>
        <div style="font-size:.72rem;color:var(--muted);display:flex;align-items:center;gap:4px;margin-top:1px">
          <span style="width:8px;height:8px;border-radius:50%;background:${clr};display:inline-block;flex-shrink:0"></span>${data.team}
        </div>
      </span>
      <span class="sc-g" style="font-size:1rem">${data.goals}</span>
    </div>`;
  }).join('');
}

function queueAttack(m, type, pName, tName, gkName, isHome, idx) {
  m.activeAttack = { type, p: pName, t: tName, gk: gkName, isHome, idx, timer: 180 };
}

window.executeGlobalLog = function(idx, type, txtObj, isHome) {
  const m = matches[idx];
  if (!m) return;
  const mStr = fmtMin(m);
  addLog(idx, mStr, type, txtObj);
  if (type === 'g') {
     isHome ? m.sh++ : m.sa++;
     if (typeof updateScoreboard === 'function') updateScoreboard();
  }
};
