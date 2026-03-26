/**
 * ui.js
 * Funções de interface: tabela, apostas, narrador, scoreboard, modais, tabs
 */

/* ════════════════════════════════════════
   HELPERS DOM SEGUROS
════════════════════════════════════════ */
function safeEl(id)          { return document.getElementById(id); }
function safeSet(id, val)    { const el=safeEl(id); if(el) el.textContent=val; }
function safeSetHTML(id,val) { const el=safeEl(id); if(el) el.innerHTML=val; }
function safeSetAttr(id,attr,val){ const el=safeEl(id); if(el) el[attr]=val; }

/* ════════════════════════════════════════
   NARRADOR
════════════════════════════════════════ */
let narrationMuted = false;
let narrating = false;  // flag global: narrador está falando?

function getBestVoice() {
  const v = speechSynthesis.getVoices();
  // 1) Vozes Online/Natural do Edge (mais humanas)
  const online = v.filter(x => x.lang.includes('pt-BR') && (x.name.includes('Online') || x.name.includes('Natural')));
  const onlineFem = online.filter(x => x.name.includes('Francisca') || x.name.includes('Maria') || x.name.includes('Female') || x.name.includes('Thalita'));
  if (onlineFem.length) return onlineFem[0];
  if (online.length) return online[0];
  // 2) Vozes femininas pt-BR padrão
  const ptBR = v.filter(x => x.lang.includes('pt-BR'));
  const fem = ptBR.filter(x => x.name.includes('Maria') || x.name.includes('Francisca') || x.name.includes('Luciana') || x.name.includes('Vitoria') || x.name.includes('Thalita') || x.name.includes('Female'));
  return fem[0] || ptBR.find(x => x.name.includes('Google')) || ptBR[0] || v[0];
}

function toggleMute() {
  narrationMuted = !narrationMuted;
  const btn = safeEl('btn-mute');
  if (btn) btn.innerHTML = narrationMuted ? '<i class="fas fa-volume-mute"></i> Silenciado' : '<i class="fas fa-volume-up"></i> Narração Ativa';
  if (narrationMuted) speechSynthesis.cancel();
}

function addLog(idx, minStr, type, txtObj) {
  let cls = 'log';
  if (type==='g')    cls+=' log-g';
  if (type==='y')    cls+=' log-y';
  if (type==='r')    cls+=' log-r';
  if (type==='p')    cls+=' log-p';
  if (type==='pen')  cls+=' log-pen';
  if (type==='foul') cls+=' log-foul';

  if (typeof txtObj === 'string') {
    txtObj = { header: `<span class="mn">[${minStr}']</span> `, text: txtObj, cleanText: txtObj };
  }
  
  const fullHtml = `<div class="${cls}" style="display:flex;flex-direction:column;">
    ${txtObj.header}
    <div style="font-size:0.95rem; margin-top:3px">${txtObj.text.replace(/\n/g, '<br>')}</div>
  </div>`;

  logs[idx].unshift(fullHtml);
  if (logs[idx].length > 15) logs[idx].pop();
  if (idx === activeMIdx) renderNarrator();

  if (idx === activeMIdx && !narrationMuted && 'speechSynthesis' in window) {
    const cleanTxt = txtObj.cleanText.replace(/<[^>]+>/g, '').replace(/[\u{1F300}-\u{1F9FF}]/gu, '').replace(/[📻🚨😱⚽🎯⚠️🚩🔚🌀🔫🧤🟨🟥]/g,'').trim();
    if (cleanTxt) {
      // Cancela qualquer fala anterior para não acumular fila
      speechSynthesis.cancel();
      const ut = new SpeechSynthesisUtterance(cleanTxt);
      const bv = getBestVoice(); if (bv) ut.voice = bv;
      ut.lang = 'pt-BR';
      ut.volume = 1.0;
      // Emoção dinâmica por tipo de evento
      if (type === 'g') {
        ut.rate = 1.2;   // acelerado, emoção
        ut.pitch = 1.15; // tom mais alto, euforia
      } else if (type === 'pen') {
        ut.rate = 0.9;   // lento, tensão
        ut.pitch = 1.05;
      } else if (type === 'foul' || type === 'y' || type === 'r') {
        ut.rate = 1.05;
        ut.pitch = 0.95; // tom grave, seriedade
      } else {
        ut.rate = 1.05;  // natural fluido
        ut.pitch = 1.0;
      }
      // SINCRONIA: pausa o jogo enquanto narra
      narrating = true;
      ut.onend = () => { narrating = false; };
      ut.onerror = () => { narrating = false; };
      speechSynthesis.speak(ut);
    }
  }
}

function renderNarrator() {
  const el      = safeEl('narrator'); if (!el) return;
  const content = logs[activeMIdx];
  el.innerHTML  = (content && content.length)
    ? content.join('')
    : '<div style="text-align:center;padding:50px;color:var(--muted);font-size:.8rem">Aguardando início...</div>';
}

/* ════════════════════════════════════════
   SCOREBOARD
════════════════════════════════════════ */
function updateScoreboard() {
  const m = matches[activeMIdx]; if (!m) return;
  const imgH=safeEl('sb-lh'), imgA=safeEl('sb-la');
  if (imgH) { imgH.src=logoOf(m.h); imgH.style.display='block'; }
  if (imgA) { imgA.src=logoOf(m.a); imgA.style.display='block'; }
  safeSet('sb-ch', m.h.substring(0,3).toUpperCase());
  safeSet('sb-ca', m.a.substring(0,3).toUpperCase());
  safeSet('sc-h', m.sh); safeSet('sc-a', m.sa);

  const totalPos = (m.posH || 0) + (m.posA || 0);
  let pctH = 50, pctA = 50;
  if (totalPos > 0) {
    pctH = Math.round((m.posH / totalPos) * 100);
    pctA = 100 - pctH;
  }
  safeSet('pos-h-txt', pctH + '%');
  safeSet('pos-a-txt', pctA + '%');
  const bar = safeEl('pos-bar-h');
  if (bar) bar.style.width = pctH + '%';
}

/* ════════════════════════════════════════
   LISTA DE JOGOS (sidebar)
════════════════════════════════════════ */
function renderRoundList() {
  const el = safeEl('round-list'); if (!el) return;
  el.innerHTML = matches.map((m,i) => {
    let tb='';
    if      (m.status==='FT')  tb=`<span class="mm-time" style="color:var(--muted)">FIM</span>`;
    else if (m.status==='HT')  tb=`<span class="mm-time" style="color:#38bdf8">INT</span>`;
    else if (isRunning)        tb=`<span class="mm-time" style="color:var(--accent)"><span class="live-dot"></span>${Math.floor(m.clock)}'</span>`;
    else                       tb=`<span class="mm-time" style="color:var(--muted)">Em breve</span>`;
    return `<div class="mm ${i===activeMIdx?'view':''}" onclick="switchView(${i})">
      <div class="mm-logos">
        <img src="${logoOf(m.h)}" onerror="this.src='${shieldFallback(m.h)}'">
        <span class="mm-sc">${m.sh} - ${m.sa}</span>
        <img src="${logoOf(m.a)}" onerror="this.src='${shieldFallback(m.a)}'">
      </div>${tb}</div>`;
  }).join('');
}

function switchView(idx) {
  activeMIdx=idx; isExiting=false; isHuddle=false; isHalftimeExit=false;
  if(matches[idx]) buildPlayerStates(matches[idx]);
  updateScoreboard(); renderNarrator(); updatePieChart(); renderRoundList();
}

/* ════════════════════════════════════════
   PIE CHART (favorito)
════════════════════════════════════════ */
function updatePieChart() {
  const m = matches[activeMIdx]; if (!m) return;
  const d = DB[m.h].r - DB[m.a].r;
  let wH=Math.min(80,Math.max(15,40+d*3)), wA=Math.min(80,Math.max(15,30-d*3)), wD=100-wH-wA;
  safeSet('ph-pct', Math.round(wH)+'%'); safeSet('pd-pct', Math.round(wD)+'%'); safeSet('pa-pct', Math.round(wA)+'%');
  safeSet('ph-lbl', m.h.substring(0,8)); safeSet('pa-lbl', m.a.substring(0,8));
  function arc(pct,start){ const r=15.9,C=2*Math.PI*r; return `stroke-dasharray="${pct/100*C} ${C}" stroke-dashoffset="${-start/100*C}"`; }
  safeSetHTML('pie-svg',`
    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#1c2533" stroke-width="3.5"/>
    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="var(--accent)" stroke-width="3.5" ${arc(wH,0)} transform="rotate(-90 18 18)"/>
    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#566070" stroke-width="3.5" ${arc(wD,wH)} transform="rotate(-90 18 18)"/>
    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="var(--red)" stroke-width="3.5" ${arc(wA,wH+wD)} transform="rotate(-90 18 18)"/>`);
  safeSetHTML('pie-txt',
    wH>55 ? `<b>${m.h}</b> é amplo favorito. Elenco superior e mando de campo.` :
    wA>55 ? `<b>${m.a}</b> chega favorito mesmo fora de casa.` :
    'Equilíbrio total. Qualquer resultado é possível.');
}

/* ════════════════════════════════════════
   CELEBRAÇÃO DE GOL
════════════════════════════════════════ */
function showGoalCeleb(name, team) {
  const el  = safeEl('goal-cel'); if (!el) return;
  const img = safeEl('cel-img');  if (img) img.src = faceURL(name, (DB[team]||{}).c||'131a24');
  safeSet('cel-name', name);
  safeSet('cel-team', 'GOL DO '+team.toUpperCase());
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

/* ════════════════════════════════════════
   TABELA DE CLASSIFICAÇÃO
════════════════════════════════════════ */
function renderLeague() {
  league.sort((a,b) => b.pts-a.pts || b.sg-a.sg || b.gp-a.gp);
  const tb = safeEl('table-body'); if (!tb) return;
  tb.innerHTML = league.map((t,i) => {
    let z='';
    if (i<4) z='z-lib'; else if (i<6) z='z-pre'; else if (i<12) z='z-sul'; else if (i>=16) z='z-reb';
    return `<tr class="trow ${z}" onclick="openSquad('${t.nome}')">
      <td><b>${i+1}º</b></td>
      <td><span style="display:flex;align-items:center;gap:8px">
        <img src="${logoOf(t.nome)}" style="width:22px;height:22px;object-fit:contain" onerror="this.style.opacity=0">
        ${t.nome}
      </span></td>
      <td class="pts-val">${t.pts}</td><td>${t.j}</td><td>${t.v}</td><td>${t.e}</td><td>${t.d}</td><td>${t.gp}</td><td>${t.sg}</td>
    </tr>`;
  }).join('');
}

/* ════════════════════════════════════════
   MODAL ELENCO
════════════════════════════════════════ */
function openSquad(name) {
  const t = DB[name]; if (!t) return;
  safeSetAttr('m-logo','src',logoOf(name));
  safeSet('m-name', name);
  safeSetHTML('m-players', t.p.map((p,i) => `
    <div class="p-row">
      <div class="p-info">
        <b style="color:var(--muted)">${i+1}.</b>
        <img src="${faceURL(p,t.c)}" onerror="this.style.opacity=0">
        <span>${p}</span>
      </div>
      <span class="rat">${t.skills[p]||70}</span>
    </div>`).join(''));
  const modal = safeEl('modal-squad'); if(modal) modal.style.display='flex';
}

/* ════════════════════════════════════════
   APOSTAS
════════════════════════════════════════ */
function renderBetForm() {
  const panel = safeEl('bet-form'); if (!panel) return;
  if (isRunning || round>38) { panel.innerHTML='<p style="color:var(--muted);text-align:center;padding:18px">Mercados fechados.</p>'; return; }
  panel.innerHTML = matches.map((m,i) => {
    const pH  = Math.max(1, league.findIndex(t=>t.nome===m.h)+1);
    const pA  = Math.max(1, league.findIndex(t=>t.nome===m.a)+1);
    const odd = Math.max(4.0, 8.5-((pA-pH)*.15)).toFixed(2);
    return `<div class="bet-card">
      <div class="bt" style="justify-content:flex-end">
        ${m.h} <img src="${logoOf(m.h)}" onerror="this.style.opacity=0">
      </div>
      <div style="display:flex;align-items:center;gap:7px">
        <input type="number" id="bh-${i}" class="sinp" min="0" placeholder="0">
        <div style="text-align:center"><div style="color:var(--muted);font-weight:700;font-size:.88rem">×</div><div class="odd-b">Odd ${odd}</div></div>
        <input type="number" id="ba-${i}" class="sinp" min="0" placeholder="0">
      </div>
      <div class="bt">
        <img src="${logoOf(m.a)}" onerror="this.style.opacity=0"> ${m.a}
      </div>
    </div>`;
  }).join('');
}

function submitBets() {
  const stakeEl = safeEl('stake-val'); if (!stakeEl) return;
  const stake   = parseFloat(stakeEl.value);
  if (!stake||stake<=0) { alert('Valor inválido!'); return; }
  if (wallet<stake*10)  { alert('Saldo insuficiente!'); return; }
  let nb = [];
  for (let i=0; i<10; i++) {
    const phEl=safeEl(`bh-${i}`), paEl=safeEl(`ba-${i}`);
    const ph=parseInt(phEl?.value), pa=parseInt(paEl?.value);
    if (isNaN(ph)||isNaN(pa)) { alert('Preencha todos os 10 palpites!'); return; }
    const pH  = Math.max(1, league.findIndex(t=>t.nome===matches[i].h)+1);
    const pA  = Math.max(1, league.findIndex(t=>t.nome===matches[i].a)+1);
    const odd = Math.max(4.0, 8.5-((pA-pH)*.15)).toFixed(2);
    nb.push({ mi:i, h:matches[i].h, a:matches[i].a, ph, pa, odd:parseFloat(odd), stake });
  }
  bets=nb; wallet-=stake*10; updateWallet();
  setTab('live', safeEl('tab-live'));
  renderBetsLive();
}

function renderBetsLive() {
  const panel = safeEl('bets-live'); if (!panel) return;
  if (!bets.length) {
    panel.innerHTML='<div style="color:var(--muted);text-align:center;padding:18px;font-size:.82rem">Faça apostas na aba Apostas</div>';
    return;
  }
  panel.innerHTML = bets.map(b => {
    const m = matches[b.mi]; if (!m) return '';
    let bc = 'var(--border)';
    if      (m.status==='FT')                                          bc=(m.sh===b.ph&&m.sa===b.pa)?'var(--accent)':'var(--red)';
    else if (isRunning && (m.sh>b.ph || m.sa>b.pa))                   bc='rgba(255,61,61,.4)';
    return `<div class="bl-item" style="border-left-color:${bc}">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px">
        <b style="font-size:.82rem">${b.h} vs ${b.a}</b>
        <span style="color:var(--muted);font-size:.76rem">${m.status==='FT'?'FIM':m.status==='HT'?'INT':Math.floor(m.clock)+"'"}</span>
      </div>
      <div style="color:var(--muted);font-size:.78rem">
        Palpite: <b style="color:#fff">${b.ph}×${b.pa}</b> | Placar: <b style="color:var(--accent)">${m.sh}×${m.sa}</b> | <span style="color:var(--accent)">R$${b.stake}</span>
      </div>
    </div>`;
  }).join('');
}

/* ════════════════════════════════════════
   CARTEIRA
════════════════════════════════════════ */
function updateWallet() { safeSet('wallet-v', wallet.toFixed(2)); }

/* ════════════════════════════════════════
   CAMPEÃO
════════════════════════════════════════ */
function showChampion() {
  renderLeague();
  const champ = league[0]?.nome || '?';
  const top   = Object.entries(scorers).sort((a,b)=>b[1].goals-a[1].goals)[0];
  safeSet('champ-name', champ.toUpperCase());
  safeSet('champ-scorer', top ? `🥇 Artilheiro: ${top[0]} — ${top[1].goals} gols (${top[1].team})` : '');
  const scr=safeEl('champion-scr'); if(scr) scr.style.display='flex';
}

/* ════════════════════════════════════════
   TABS
════════════════════════════════════════ */
function setTab(id, btn) {
  document.querySelectorAll('.ntab').forEach(b => b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  ['sec-live','sec-bets','sec-table'].forEach(s => {
    const el=safeEl(s); if(el) el.style.display='none';
  });
  if (id==='live')  { const el=safeEl('sec-live');  if(el) el.style.display='grid'; }
  if (id==='bets')  { const el=safeEl('sec-bets');  if(el){ el.style.display='block'; renderBetForm(); }}
  if (id==='table') { const el=safeEl('sec-table'); if(el){ el.style.display='block'; renderLeague(); }}
}
