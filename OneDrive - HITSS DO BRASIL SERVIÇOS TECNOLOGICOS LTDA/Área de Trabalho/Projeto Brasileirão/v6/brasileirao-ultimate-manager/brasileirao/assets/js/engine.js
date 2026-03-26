/**
 * engine.js
 * Motor gráfico Canvas 2D: campo, jogadas roteirizadas e background physics
 */

/* ─── Canvas globals ─── */
const canvas = document.getElementById('pitch-canvas');
const ctx    = canvas.getContext('2d');
let W = 800, H = 450;

/* ─── Imagens em Cache ─── */
const ShieldCache = {};
Object.keys(DB).forEach(team => {
  const img = new Image();
  img.src = logoOf(team);
  ShieldCache[team] = img;
});

const ballImg = new Image();
ballImg.src = 'assets/img/ball.png';

/* ─── Margens do campo no canvas ─── */
const M = { l:0.05, r:0.05, t:0.05, b:0.05 };
const px  = fx => M.l*W + fx*(W*(1-M.l-M.r));
const py  = fy => M.t*H + fy*(H*(1-M.t-M.b));
const fw  = ()  => W*(1-M.l-M.r);
const fh  = ()  => H*(1-M.t-M.b);

/* ─── Formação 4-3-3 ─── */
const FORM = [
  [0.04,0.50],
  [0.22,0.17],[0.22,0.38],[0.22,0.62],[0.22,0.83],
  [0.43,0.26],[0.43,0.50],[0.43,0.74],
  [0.65,0.22],[0.65,0.50],[0.65,0.78],
];

/* ─── Física Globais (Apenas controle HUD) ─── */
let isExiting      = false;
let isHuddle       = false;
let isHalftimeExit = false;

/* ════════════════════════════════════════
   STEERING BEHAVIORS
════════════════════════════════════════ */
const MAX_SPD = 0.0075;
const MAX_F   = 0.0005;

function vLimit(vx, vy, max) {
  const m = Math.hypot(vx, vy);
  if (m > max) { const s = max/m; return [vx*s, vy*s]; }
  return [vx, vy];
}

function seek(p, tx, ty, slowR = 0.08) {
  let dx = tx-p.x, dy = ty-p.y;
  const dist = Math.hypot(dx,dy) || 0.0001;
  const spd = dist < slowR ? MAX_SPD*(dist/slowR) : MAX_SPD*(0.6+p.skill/200);
  const [dvx,dvy] = [(dx/dist)*spd, (dy/dist)*spd];
  return vLimit(dvx-p.vx, dvy-p.vy, MAX_F*(0.8+p.skill/130));
}

function separate(p, others, radius = 0.055) {
  let fx=0, fy=0, n=0;
  others.forEach(o => {
    if (o===p || o.expulso) return;
    const dx=p.x-o.x, dy=p.y-o.y, d=Math.hypot(dx,dy);
    if (d>0 && d<radius) { fx+=dx/d/d; fy+=dy/d/d; n++; }
  });
  if (!n) return [0,0];
  fx/=n; fy/=n;
  const m = Math.hypot(fx,fy) || 0.0001;
  [fx,fy] = [(fx/m)*MAX_SPD, (fy/m)*MAX_SPD];
  return vLimit(fx-p.vx, fy-p.vy, MAX_F*0.65);
}

function wander(p) {
  p.wanderAngle += (Math.random()-0.5)*0.16;
  const cx = p.x + (p.vx||0.001)*5;
  const cy = p.y + (p.vy||0.001)*5;
  const wx = cx + Math.cos(p.wanderAngle)*0.025;
  const wy = cy + Math.sin(p.wanderAngle)*0.025;
  const [fx,fy] = seek(p, wx, wy, 999);
  return [fx*0.18, fy*0.18];
}

/* ════════════════════════════════════════
   PLAYER STATES
════════════════════════════════════════ */
function buildPlayerStates(m) {
  if (m.players) return; // Não reseta se já foi criado
  m.players = [];
  ['h','a'].forEach((side, si) => {
    const tn  = side === 'h' ? m.h : m.a;
    const tDB = DB[tn];
    FORM.forEach((pos, pi) => {
      const bx = si===0 ? pos[0] : 1-pos[0];
      const by = pos[1];
      const sk = tDB.skills[tDB.p[pi]];
      m.players.push({
        name: tDB.p[pi], team: tn, side: si, isGK: pi===0,
        bx, by, x: bx, y: by, vx: 0, vy: 0,
        skill: sk, wanderAngle: Math.random()*Math.PI*2,
        expulso: false, hasBall: false, yellows: 0,
        posIdx: pi, // 0=GK, 1-4=DEF, 5-7=MID, 8-10=ATK
        runTargetX: bx, runTargetY: by,
        runTimer: Math.floor(40 + Math.random()*80),
        exitVx: (si===0?-1:1)*0.004*(0.5+Math.random()*0.8),
        exitVy: (Math.random()-0.5)*0.005,
        exitAlpha: 1.0,
        huddleX: si===0 ? (0.08+Math.random()*0.06) : (0.86+Math.random()*0.06),
        huddleY: 0.80+Math.random()*0.15,
      });
    });
  });
  m.ball = { x:.5, y:.5, vx:0, vy:0, spin:0 };
  m.trailPts = [];
  m.scriptTimer = 0;
}

/* ════════════════════════════════════════
   FLOWING ATTACKS (Novos)
════════════════════════════════════════ */
function executeAttackShot(m, atk) {
  const isSide0 = atk.isHome ? m.h === atk.t : m.a === atk.t;
  const targetX = isSide0 ? 1 : 0;
  const defTeam = atk.isHome ? m.a : m.h;
  
  if (atk.type === 'goal') {
     kickBall(m, targetX, 0.45 + (Math.random()-0.5)*0.1, 0.045);
     if (typeof window.executeGlobalLog !== 'undefined') window.executeGlobalLog(atk.idx, 'g', Narrator.generate(m, 'goal', atk.p, atk.t, atk.gk, defTeam, atk.isHome), atk.isHome);
     if (atk.idx === activeMIdx && typeof window.showGoalCeleb !== 'undefined') window.showGoalCeleb(atk.p, atk.t);
  } else if (atk.type === 'save') {
     kickBall(m, isSide0 ? 0.98 : 0.02, 0.45 + (Math.random()-0.5)*0.1, 0.04);
     m.currentAction = { type: 'save', player: m.players.find(p=>p.name===atk.p), gk: m.players.find(p=>p.name===atk.gk) };
     m.scriptTimer = 85; 
     if (typeof window.executeGlobalLog !== 'undefined') window.executeGlobalLog(atk.idx, '', Narrator.generate(m, 'save', atk.p, atk.t, atk.gk, defTeam, atk.isHome), atk.isHome);
  } else if (atk.type === 'shot') {
     kickBall(m, isSide0 ? 1.05 : -0.05, Math.random()>0.5 ? 0.2 : 0.8, 0.045);
     if (typeof window.executeGlobalLog !== 'undefined') window.executeGlobalLog(atk.idx, '', Narrator.generate(m, 'shot', atk.p, atk.t, atk.gk, defTeam, atk.isHome), atk.isHome);
  }
}

/* ════════════════════════════════════════
   SCRIPTS DEAD-BALL (Estáticos)
════════════════════════════════════════ */
function triggerEvent(m, type, playerName, isGoal=false) {
  if (!m || !m.players) return;
  const pl = m.players.find(p=>p.name===playerName) || m.players[1];
  m.currentAction = { type, player: pl, side: pl.side, isGoal, foulX: m.ball.x, foulY: m.ball.y };
  m.attackingSide = pl.side;
  
  if (type==='penalty' || type==='penaltyScored') m.scriptTimer = 120;
  else m.scriptTimer = 130;
}

function handleMatchScript(m, ts) {
  const b = m.ball;
  if (!m.currentAction) return;
  const atk = m.currentAction.player;
  const isSide0 = atk.side === 0;
  const type = m.currentAction.type;

  if (type === 'penalty' || type === 'penaltyScored') {
    const penX = isSide0 ? 0.895 : 0.105;
    if (m.scriptTimer > 115) {
      b.x = penX; b.y = 0.5; b.vx=0; b.vy=0;
      atk.x = penX - (isSide0 ? 0.04 : -0.04); atk.y = 0.5;
      const gk = m.players.find(p=> p.side !== atk.side && p.isGK);
      if(gk) { gk.x = isSide0 ? 0.99 : 0.01; gk.y = 0.5; }
      m.players.forEach(p => {
        if(p!==atk && p!==gk) { p.x = isSide0 ? Math.min(0.7, p.x) : Math.max(0.3, p.x); }
      });
    }
    if (m.scriptTimer <= 90 && m.scriptTimer > 80) {
       kickBall(m, isSide0 ? 1 : 0, 0.45 + (Math.random()-0.5)*0.15, type==='penaltyScored' ? 0.038 : 0.02);
       if (!m.currentAction.isGoal && type!=='penaltyScored') b.vy += (Math.random()-0.5)*0.03; 
    }
  }
  else if (type === 'save') {
    if (m.scriptTimer < 80 && m.scriptTimer > 50) {
       const gk = m.currentAction.gk;
       if (gk) {
         const [fx, fy] = seek(gk, b.x, b.y, 0.015); gk.vx+=fx*5; gk.vy+=fy*5;
         if (Math.hypot(gk.x-b.x, gk.y-b.y) < 0.06 && b.vx*b.vx > 0.00001) { b.vx *= -0.5; b.vy *= -0.5; } 
       }
    }
  }
  else if (type === 'foul') {
    if (m.scriptTimer > 115) {
      const foulX = Math.max(0.05, Math.min(0.95, m.currentAction.foulX || b.x));
      const foulY = Math.max(0.05, Math.min(0.95, m.currentAction.foulY || b.y));
      b.x = foulX; b.y = foulY; b.vx=0; b.vy=0;
      atk.x = foulX - (isSide0 ? 0.05 : -0.05); atk.y = foulY;
      const gk = m.players.find(p=> p.side !== atk.side && p.isGK);
      if(gk) { gk.x = isSide0 ? 0.98 : 0.02; gk.y = 0.5; }
      
      let defenders = m.players.filter(p=> p.side !== atk.side && !p.isGK);
      for(let i=0; i<Math.min(4, defenders.length); i++) {
        defenders[i].x = foulX + (isSide0 ? 0.10 : -0.10); defenders[i].y = foulY + (i-1.5)*0.04;
      }
    }
    if (m.scriptTimer <= 85 && m.scriptTimer > 75) {
       kickBall(m, isSide0 ? 1 : 0, 0.45 + (Math.random()-0.5)*0.2, 0.035);
       b.vy += (Math.random()-0.5)*0.03; 
    }
  }
  else if (type === 'corner') {
    if (m.scriptTimer > 115) {
      const cy = Math.random()>0.5 ? 0.01 : 0.99;
      b.x = isSide0 ? 0.99 : 0.01; b.y = cy; b.vx=0; b.vy=0;
      atk.x = b.x; atk.y = cy === 0.01 ? 0.05 : 0.95;
      m.players.forEach(p => {
        if(p!==atk && !p.isGK) { p.x = isSide0 ? (0.8+Math.random()*0.15) : (0.05+Math.random()*0.15); p.y = 0.3+Math.random()*0.4; }
      });
    }
    if (m.scriptTimer <= 85 && m.scriptTimer > 75) {
       kickBall(m, isSide0 ? 0.9 : 0.1, 0.5 + (Math.random()-0.5)*0.1, 0.03);
    }
  }

  b.x += b.vx * ts; b.y += b.vy * ts;
  if(b.x<0.01)b.x=0.01; if(b.x>0.99)b.x=0.99;
}

/* ════════════════════════════════════════
   FÍSICA GLOBAL E GAMEPLAY LOOP
════════════════════════════════════════ */
function updatePhysics() {
  matches.forEach((m, idx) => updateMatchPhysics(m, idx === activeMIdx));
}

function updateMatchPhysics(m, isVisual) {
  if (!m || !m.players || !m.players.length) return;

  const ft     = m.status === 'FT';
  const paused = m.paused;
  const active = isRunning && !ft && !paused;
  const activePlayers = m.players.filter(p => !p.expulso);

  const ts = 1.0; // Física sempre 100% — sincronia é feita pelo relógio no game.js

  if ((isVisual && (isHalftimeExit || isExiting)) || (!active && m.status !== '1H' && m.status !== '2H')) {
    m.players.forEach(p => {
      p.x += p.exitVx * ts; p.y += p.exitVy * ts;
      if (p.y < -0.15 || p.y > 1.15) p.exitVy *= -1;
      p.exitAlpha = Math.max(0, p.exitAlpha - 0.003 * ts);
    });
    return;
  }

  if ((isVisual && isHuddle) || paused) {
    activePlayers.forEach(p => {
      const [fx,fy] = seek(p, p.huddleX, p.huddleY, 0.18);
      p.vx += fx; p.vy += fy;
      [p.vx,p.vy] = vLimit(p.vx, p.vy, MAX_SPD*0.55);
      p.x += p.vx * ts; p.y += p.vy * ts;
    });
    return;
  }

  if (!active) return;

  if (m.scriptTimer > 0) {
    m.scriptTimer -= ts;
    handleMatchScript(m, ts);
    return;
  }

  let carrier = null, cDist = Infinity;
  activePlayers.forEach(p => {
    const d = Math.hypot(p.x-m.ball.x, p.y-m.ball.y);
    if (d < cDist) { cDist = d; carrier = p; }
  });
  activePlayers.forEach(p => p.hasBall = false);
  if (carrier && cDist < 0.04) {
    carrier.hasBall = true;
    if (carrier.side === 0) m.posH++; else m.posA++;
  }

  // Define organic attacking side based on ball pos naturally
  if (m.ball.x > 0.6) m.attackingSide = 0; else if (m.ball.x < 0.4) m.attackingSide = 1;

  if (m.activeAttack) {
    const atk = m.activeAttack;
    const isAtkSide0 = atk.isHome ? m.h === atk.t : m.a === atk.t;
    const targetX = isAtkSide0 ? 1 : 0;
    const atker = m.players.find(p=>p.name===atk.p);
    m.attackingSide = isAtkSide0 ? 0 : 1;
    
    if (carrier === atker && Math.abs(carrier.x - targetX) < 0.25) {
       executeAttackShot(m, atk);
       m.activeAttack = null;
       return;
    }
    
    activePlayers.forEach(p => {
       let fx=0, fy=0;
       if (p.isGK) {
          const [sfx,sfy] = seek(p, p.bx, p.by, 0.05); fx+=sfx; fy+=sfy;
       } else if (p.side === (isAtkSide0 ? 0 : 1)) {
          let cx = isAtkSide0 ? Math.min(0.85, p.x + 0.15) : Math.max(0.15, p.x - 0.15);
          if (p === atker) cx = isAtkSide0 ? 0.80 : 0.20; 
          const [sfx,sfy] = seek(p, cx, p.by + (Math.random()-0.5)*0.2, 0.15);
          fx += sfx*2; fy += sfy*2;
          
          if (p === atker && Math.abs(m.ball.x - targetX) < 0.35 && carrier !== atker) {
              const [bfx,bfy] = seek(p, m.ball.x, m.ball.y, 0.05);
              fx += bfx*3; fy += bfy*3;
          }
       } else {
          const [sfx,sfy] = seek(p, isAtkSide0 ? 0.9 : 0.1, p.by, 0.1);
          fx += sfx*1.5; fy += sfy*1.5;
       }
       const [sx,sy] = separate(p, activePlayers); fx+=sx; fy+=sy;
       p.vx+=fx; p.vy+=fy;
       [p.vx,p.vy] = vLimit(p.vx, p.vy, MAX_SPD*(0.8 + p.skill/100)); 
       p.x += p.vx * ts; p.y += p.vy * ts;
       p.x = Math.max(0.01, Math.min(0.99, p.x)); p.y = Math.max(0.01, Math.min(0.99, p.y));
    });
    
    if (carrier && carrier.side === (isAtkSide0 ? 0 : 1)) {
       if (carrier !== atker && atker) {
          kickBall(m, atker.x + (Math.random()-0.5)*0.02, atker.y + (Math.random()-0.5)*0.02, 0.025);
       } else if (carrier === atker) {
          m.ball.vx += (targetX - m.ball.x)*0.0015; m.ball.vy += (0.5 - m.ball.y)*0.0015;
       }
    } else if (carrier) {
       kickBall(m, isAtkSide0 ? 0.8 : 0.2, 0.5, 0.035);
    } else {
       if (atker && m.ball.vx*m.ball.vx < 0.0001) {
           m.ball.vx += (atker.x - m.ball.x)*0.0005; m.ball.vy += (atker.y - m.ball.y)*0.0005;
       }
    }
    
    m.ball.x += m.ball.vx * ts; m.ball.y += m.ball.vy * ts;
    m.ball.vx *= 0.94; m.ball.vy *= 0.94; m.ball.spin *= 0.91;
    if(m.ball.x<0.01)m.ball.x=0.01; if(m.ball.x>0.99)m.ball.x=0.99;
    
    m.trailPts.push({ x:m.ball.x, y:m.ball.y, spd:Math.hypot(m.ball.vx,m.ball.vy) });
    if (m.trailPts.length > 22) m.trailPts.shift();
    return; 
  }

  // ═══════════════════════════════════════════════════
  // MOTOR DE FÍSICA V6 — FUTEBOL FLUIDO E DINÂMICO
  // ═══════════════════════════════════════════════════

  // Jogador mais perto da bola solta SEMPRE corre pra ela
  const nearestToBall = activePlayers.reduce((best, p) => {
    if (p.isGK) return best;
    const d = Math.hypot(p.x-m.ball.x, p.y-m.ball.y);
    return (!best || d < best.d) ? {p, d} : best;
  }, null);

  // Formação como bloco: centro do time segue a bola 
  const blockOff0 = (m.ball.x - 0.5) * 0.45; // time side 0
  const blockOff1 = (0.5 - m.ball.x) * 0.45; // time side 1
  const ballYOff = (m.ball.y - 0.5) * 0.25;

  activePlayers.forEach(p => {
    let fx=0, fy=0;

    // Atualiza posição-alvo com frequência (jogo rápido)
    p.runTimer--;
    if (p.runTimer <= 0) {
      p.runTimer = 30 + Math.floor(Math.random()*30);
      const off = p.side===0 ? blockOff0 : blockOff1;
      if (p.isGK) {
        p.runTargetX = p.bx;
        p.runTargetY = Math.max(0.28, Math.min(0.72, m.ball.y));
      } else {
        const jitX = p.posIdx>=8 ? 0.14 : p.posIdx>=5 ? 0.10 : 0.06;
        const jitY = p.posIdx>=8 ? 0.20 : p.posIdx>=5 ? 0.15 : 0.10;
        p.runTargetX = Math.max(0.04, Math.min(0.96,
          p.bx + off + (Math.random()-0.5)*jitX));
        p.runTargetY = Math.max(0.04, Math.min(0.96,
          p.by + ballYOff + (Math.random()-0.5)*jitY));
      }
    }

    // --- DECISÕES DE MOVIMENTO ---
    if (p.isGK) {
      // Goleiro: acompanha bola em Y, preso em X
      const [sfx,sfy] = seek(p, p.runTargetX, p.runTargetY, 0.05);
      fx+=sfx; fy+=sfy;

    } else if (p.hasBall) {
      // TEM A BOLA: avança com diagonais
      const fwd = p.side===0 ? 0.10 : -0.10;
      const lat = (Math.random()-0.5) * 0.06;
      const [sfx,sfy] = seek(p, 
        Math.max(0.05,Math.min(0.95, p.x+fwd)), 
        Math.max(0.05,Math.min(0.95, p.y+lat)), 0.03);
      fx += sfx*2.5; fy += sfy*2.5;

    } else if (nearestToBall && nearestToBall.p === p && !carrier?.hasBall) {
      // MAIS PERTO DA BOLA SOLTA: sprint pra bola
      const [sfx,sfy] = seek(p, m.ball.x, m.ball.y, 0.02);
      fx += sfx*3.0; fy += sfy*3.0;

    } else if (carrier && carrier.side === p.side) {
      // COMPANHEIRO tem bola: apoio ofensivo + desmarcação
      let tx = p.runTargetX, ty = p.runTargetY;
      // Atacantes buscam profundidade
      if (p.posIdx >= 8) {
        tx = p.side===0
          ? Math.max(carrier.x+0.05, Math.min(0.93, tx))
          : Math.min(carrier.x-0.05, Math.max(0.07, tx));
      }
      const [sfx,sfy] = seek(p, tx, ty, 0.08);
      fx += sfx*1.5; fy += sfy*1.5;
      const [wfx,wfy] = wander(p); fx+=wfx*0.4; fy+=wfy*0.4;

    } else if (carrier && carrier.side !== p.side) {
      // ADVERSÁRIO tem bola: defende por posição/setor
      const distBall = Math.hypot(m.ball.x-p.x, m.ball.y-p.y);
      if (p.posIdx <= 4) {
        // Zagueiros: mantêm linha, sobem se bola perto
        const [sfx,sfy] = seek(p, p.runTargetX, p.runTargetY, 0.07);
        fx += sfx*1.4; fy += sfy*1.4;
        if (distBall < 0.18) {
          const [bx,by] = seek(p, m.ball.x, m.ball.y, 0.04);
          fx += bx*2.0; fy += by*2.0;
        }
      } else if (p.posIdx <= 7) {
        // Meias: pressionam zona da bola
        if (distBall < 0.28) {
          const presX = m.ball.x + (p.side===0 ? -0.05 : 0.05);
          const [sfx,sfy] = seek(p, presX, m.ball.y, 0.05);
          fx += sfx*2.0; fy += sfy*2.0;
        } else {
          const [sfx,sfy] = seek(p, p.runTargetX, p.runTargetY, 0.09);
          fx += sfx*1.3; fy += sfy*1.3;
        }
      } else {
        // Atacantes: esperam contra-ataque
        const [sfx,sfy] = seek(p, p.runTargetX, p.runTargetY, 0.12);
        fx += sfx*1.2; fy += sfy*1.2;
      }
    } else {
      // Bola solta: cada um vai pra seu target
      const [sfx,sfy] = seek(p, p.runTargetX, p.runTargetY, 0.10);
      fx += sfx*1.3; fy += sfy*1.3;
    }

    // Separação
    const [sx,sy] = separate(p, activePlayers, 0.04); fx+=sx; fy+=sy;

    // Integração com damping LEVE (0.95 = mais fluido que 0.92)
    p.vx += fx; p.vy += fy;
    p.vx *= 0.95; p.vy *= 0.95;
    [p.vx,p.vy] = vLimit(p.vx, p.vy, MAX_SPD*(0.7+p.skill/140));
    p.x += p.vx * ts; p.y += p.vy * ts;
    p.x = Math.max(0.02, Math.min(0.98, p.x));
    p.y = Math.max(0.02, Math.min(0.98, p.y));
  });

  // ── FÍSICA DA BOLA ──
  m.ball.x += m.ball.vx * ts; m.ball.y += m.ball.vy * ts;
  m.ball.vx *= 0.98; m.ball.vy *= 0.98; // ATRITO LEVE = bola rola muito mais
  m.ball.spin *= 0.95;
  if(m.ball.x<0.01){m.ball.x=0.02;m.ball.vx=Math.abs(m.ball.vx)*0.4;m.ball.spin*=-1;}
  if(m.ball.x>0.99){m.ball.x=0.98;m.ball.vx=-Math.abs(m.ball.vx)*0.4;m.ball.spin*=-1;}
  if(m.ball.y<0.01){m.ball.y=0.02;m.ball.vy=Math.abs(m.ball.vy)*0.5;}
  if(m.ball.y>0.99){m.ball.y=0.98;m.ball.vy=-Math.abs(m.ball.vy)*0.5;}

  // ── DESARME (raro mas impactante) ──
  if (carrier && carrier.hasBall) {
    for (const def of activePlayers) {
      if (def.side === carrier.side || def.isGK) continue;
      if (Math.hypot(def.x-carrier.x, def.y-carrier.y) < 0.035) {
        if (Math.random() < (def.skill/(def.skill+carrier.skill))*0.05) {
          const clearX = def.side===0 ? def.x-0.10 : def.x+0.10;
          kickBall(m, clearX, def.y+(Math.random()-0.5)*0.10, 0.009);
          carrier.hasBall = false;
          break;
        }
      }
    }
  }

  // ── AÇÕES DO PORTADOR ──
  if (carrier && cDist < 0.04) {
    // Verificar pressão
    const pressed = activePlayers.some(t =>
      t.side!==carrier.side && !t.isGK &&
      Math.hypot(t.x-carrier.x, t.y-carrier.y) < 0.06
    );

    if (cDist < 0.025) {
      const r = Math.random();
      const mates = activePlayers.filter(t =>
        t.side===carrier.side && !t.isGK && t!==carrier
      );

      if (r < (pressed ? 0.50 : 0.30) && mates.length) {
        // PASSE: escolhe companheiro avançado e livre
        const free = mates.filter(t => {
          const marked = activePlayers.filter(e =>
            e.side!==t.side && Math.hypot(e.x-t.x,e.y-t.y)<0.07
          );
          return marked.length < 2;
        });
        const tgt = (free.length ? free : mates)
          .sort((a,b) => carrier.side===0 ? b.x-a.x : a.x-b.x)[0];
        const err = Math.max(0.03, 0.8-carrier.skill/120);
        kickBall(m,
          tgt.x + (Math.random()-0.5)*err*0.12,
          tgt.y + (Math.random()-0.5)*err*0.10,
          0.008 + carrier.skill/8000
        );
      } else if (r < (pressed ? 0.60 : 0.70)) {
        // CONDUÇÃO: toque curto pra frente (NÃO teleporte!)
        const fwd = carrier.side===0 ? 0.025 : -0.025;
        kickBall(m,
          carrier.x + fwd + (Math.random()-0.5)*0.01,
          carrier.y + (Math.random()-0.5)*0.015,
          0.004
        );
      } else if (r < 0.88) {
        // CHUTE ao gol
        const inAtk = (carrier.side===0&&carrier.x>0.50)||(carrier.side===1&&carrier.x<0.50);
        if (inAtk) {
          kickBall(m,
            carrier.side===0 ? 0.99 : 0.01,
            0.38 + Math.random()*0.24,
            0.014 + carrier.skill/6000
          );
        } else {
          // Longe demais: conduz
          kickBall(m, carrier.x + (carrier.side===0?0.025:-0.025),
            carrier.y + (Math.random()-0.5)*0.015, 0.004);
        }
      } else {
        // LANÇAMENTO longo
        const lx = carrier.side===0
          ? Math.min(0.92, carrier.x+0.25+Math.random()*0.12)
          : Math.max(0.08, carrier.x-0.25-Math.random()*0.12);
        kickBall(m, lx, 0.15+Math.random()*0.70, 0.014);
      }
    } else {
      // Bola perto: atrai com impulso suave
      const dx=m.ball.x-carrier.x, dy=m.ball.y-carrier.y;
      const d=Math.hypot(dx,dy)||0.001;
      m.ball.vx += (dx/d)*0.0008; m.ball.vy += (dy/d)*0.0008;
    }
  }

  // Se bola está MUITO parada e ninguém tem, chuta pra mais perto
  const bSpd = Math.hypot(m.ball.vx, m.ball.vy);
  if (bSpd < 0.001 && (!carrier || !carrier.hasBall) && nearestToBall) {
    const np = nearestToBall.p;
    if (nearestToBall.d < 0.04) {
      // Chuta pra frente!
      const fwd = np.side===0 ? 0.15 : -0.15;
      kickBall(m, np.x+fwd, np.y+(Math.random()-0.5)*0.1, 0.006);
    }
  }

  // Interceptação de passes em trânsito
  if (bSpd > 0.005) {
    for (const p of activePlayers) {
      if (p.isGK) continue;
      if (Math.hypot(p.x-m.ball.x, p.y-m.ball.y) < 0.03) {
        if (Math.random() < (p.skill/100)*0.07) {
          m.ball.vx *= 0.06; m.ball.vy *= 0.06;
          m.ball.x = p.x; m.ball.y = p.y;
          break;
        }
      }
    }
  }

  m.trailPts.push({x:m.ball.x, y:m.ball.y, spd:bSpd});
  if (m.trailPts.length > 22) m.trailPts.shift();
}




function kickBall(m, tx, ty, spd) {
  const dx=tx-m.ball.x, dy=ty-m.ball.y, d=Math.hypot(dx,dy)||0.001;
  m.ball.vx=(dx/d)*spd; m.ball.vy=(dy/d)*spd; m.ball.spin=(Math.random()-0.5)*0.5;
}

/* ════════════════════════════════════════
   RENDER LOOP E DRAWING SCENE
════════════════════════════════════════ */
function resizeCanvas() {
  const wrap = document.getElementById('pitch-wrap');
  if (!wrap) return;
  canvas.width  = wrap.clientWidth;
  canvas.height = 450;
  W = canvas.width; H = canvas.height;
}

function renderLoop() {
  updatePhysics();
  drawScene();
  requestAnimationFrame(renderLoop);
}

function drawScene() {
  ctx.clearRect(0,0,W,H);
  drawPitch();
  drawTrail();
  drawPlayers();
  const m = matches[activeMIdx];
  if (!isExiting && !isHalftimeExit && m) {
    drawBall();
  }

  if (m && m.attackingSide !== undefined && isRunning) {
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 16px Bebas Neue,sans-serif';
    ctx.textAlign = 'center';
    if (m.attackingSide === 0) {
      ctx.fillText(m.h.toUpperCase() + ' ATACANDO ▶', W/2 + 100, 25);
    } else {
      ctx.fillText('◀ ATACANDO ' + m.a.toUpperCase(), W/2 - 100, 25);
    }
    ctx.restore();
  }

  if ((isHuddle || (m && m.paused)) && isRunning) {
    ctx.save();
    ctx.font = 'bold 11px Bebas Neue,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(4,6,13,.82)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    const lx = px(0.5), ly = py(0.94);
    const tw = ctx.measureText('⏸ PAUSA TÉCNICA').width;
    ctx.fillRect(lx-tw/2-6, ly-13, tw+12, 20);
    ctx.strokeRect(lx-tw/2-6, ly-13, tw+12, 20);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('⏸ PAUSA TÉCNICA', lx, ly);
    ctx.restore();
  }
}

function drawPitch() {
  const nStripes = 10;
  for (let i=0; i<nStripes; i++) {
    const x0=px(i/nStripes), x1=px((i+1)/nStripes);
    ctx.fillStyle = i%2===0 ? '#1a4a21' : '#1e5527';
    ctx.fillRect(x0, py(0), x1-x0, fh());
  }
  ctx.fillStyle = '#0d1c0e';
  ctx.fillRect(0,0,W,py(0)); ctx.fillRect(0,py(1),W,H-py(1));
  ctx.fillRect(0,0,px(0),H); ctx.fillRect(px(1),0,W-px(1),H);

  const vg = ctx.createRadialGradient(W/2,H/2,H*0.1,W/2,H/2,H*0.85);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,0.5)');
  ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);

  const FW=fw(), FH=fh();
  const L=px(0),R=px(1),T=py(0),B=py(1),CX=px(0.5),CY=py(0.5);

  ctx.save();
  ctx.strokeStyle='rgba(255,255,255,0.88)'; ctx.lineJoin='round'; ctx.lineWidth=2;

  ctx.strokeRect(L,T,FW,FH);
  ctx.beginPath(); ctx.moveTo(CX,T); ctx.lineTo(CX,B); ctx.stroke();
  const circR = FH*0.134;
  ctx.beginPath(); ctx.arc(CX,CY,circR,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.9)';
  ctx.beginPath(); ctx.arc(CX,CY,3.5,0,Math.PI*2); ctx.fill();
  const aW=FW*0.157, aH=FH*0.593, aYo=(FH-aH)/2;
  ctx.strokeRect(L,T+aYo,aW,aH); ctx.strokeRect(R-aW,T+aYo,aW,aH);
  const saW=FW*0.052, saH=FH*0.269, saYo=(FH-saH)/2;
  ctx.strokeRect(L,T+saYo,saW,saH); ctx.strokeRect(R-saW,T+saYo,saW,saH);
  const penX=FW*0.105;
  ctx.fillStyle='rgba(255,255,255,0.9)';
  ctx.beginPath(); ctx.arc(L+penX,CY,3.5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(R-penX,CY,3.5,0,Math.PI*2); ctx.fill();
  const arcR=FW*0.087;
  ctx.save(); ctx.beginPath(); ctx.rect(L+aW+1,T,FW-2*aW-2,FH); ctx.clip();
  ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(L+penX,CY,arcR,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(R-penX,CY,arcR,0,Math.PI*2); ctx.stroke();
  ctx.restore();
  const goalH=FH*0.1076, goalD=12, goalYo=(FH-goalH)/2;
  ctx.lineWidth=2.5; ctx.strokeStyle='rgba(255,255,255,0.95)';
  ctx.strokeRect(L-goalD,T+goalYo,goalD,goalH);
  ctx.strokeRect(R,T+goalYo,goalD,goalH);
  ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(L,T+goalYo); ctx.lineTo(L,T+goalYo+goalH); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(R,T+goalYo); ctx.lineTo(R,T+goalYo+goalH); ctx.stroke();
  const cR=Math.max(7,FW*0.0095);
  ctx.lineWidth=1.5; ctx.strokeStyle='rgba(255,255,255,0.75)';
  ctx.beginPath(); ctx.arc(L,T,cR,0,Math.PI/2); ctx.stroke();
  ctx.beginPath(); ctx.arc(R,T,cR,Math.PI/2,Math.PI); ctx.stroke();
  ctx.beginPath(); ctx.arc(L,B,cR,-Math.PI/2,0); ctx.stroke();
  ctx.beginPath(); ctx.arc(R,B,cR,Math.PI,-Math.PI/2); ctx.stroke();
  ctx.restore();
}

function drawTrail() {
  const m = matches[activeMIdx];
  if (!m || !m.trailPts || m.trailPts.length < 2) return;
  for (let i=1; i<m.trailPts.length; i++) {
    const t = i/m.trailPts.length;
    const r = 3.8*t*Math.min(1, m.trailPts[i].spd*90);
    if (r < 0.4) continue;
    ctx.beginPath(); ctx.arc(px(m.trailPts[i].x), py(m.trailPts[i].y), r, 0, Math.PI*2);
    ctx.fillStyle=`rgba(255,255,200,${t*0.25})`; ctx.fill();
  }
}

function drawPlayers() {
  const m = matches[activeMIdx];
  if (!m || !m.players) return;
  m.players.forEach(p => {
    const alpha = (isExiting||isHalftimeExit) ? p.exitAlpha : 1;
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha = alpha*0.28;
    ctx.beginPath(); ctx.ellipse(px(p.x)+2, py(p.y)+11, 10, 4, 0, 0, Math.PI*2);
    ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fill(); ctx.restore();
  });
  m.players.forEach(p => {
    const alpha = (isExiting||isHalftimeExit) ? p.exitAlpha : p.expulso ? 0.22 : 1;
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha = alpha;
    if (p.expulso) ctx.filter='grayscale(1)';
    drawPlayer(p); ctx.restore();
  });
}

function drawPlayer(p) {
  const tDB  = DB[p.team];
  const cx   = px(p.x), cy = py(p.y);
  const r    = p.isGK ? 13 : 11;
  const clr  = tDB.c;

  const img = ShieldCache[p.team];
  if (img && img.complete) {
    if (p.hasBall) {
      ctx.beginPath(); ctx.arc(cx,cy,r+5,0,Math.PI*2);
      ctx.strokeStyle='rgba(255,255,255,0.8)'; ctx.lineWidth=2; ctx.stroke();
    }
    const size = r * 2.5;
    ctx.drawImage(img, cx - size/2, cy - size/2, size, size);
  } else {
    const bright = ['#cbd5e1','#e5e7eb','#aaa','#999','#bbb','#eee'].includes(clr);
    ctx.beginPath(); ctx.arc(cx,cy,r+2,0,Math.PI*2);
    ctx.fillStyle='rgba(0,0,0,0.22)'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.fillStyle = bright ? '#bfc8d4' : clr; ctx.fill();
    ctx.strokeStyle = p.hasBall ? '#ffffff' : 'rgba(255,255,255,0.6)';
    ctx.lineWidth = p.hasBall ? 2.5 : 1.6; ctx.stroke();
  }

  if (p.isGK) {
    ctx.beginPath(); ctx.arc(cx,cy,r+3,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,215,0,0.55)'; ctx.lineWidth=1.5; ctx.stroke();
  }

  ctx.fillStyle='rgba(255,255,255,0.95)';
  ctx.font='bold 9px Barlow Condensed,sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  const nameParts = p.name.split(' ');
  const shortName = nameParts.length > 1 ? nameParts[nameParts.length-1] : nameParts[0];
  ctx.fillText(shortName.toUpperCase(), cx, cy + r + 8);
}

function drawBall() {
  const b = matches[activeMIdx]?.ball;
  if (!b) return;
  const cx = px(b.x), cy = py(b.y);
  const spd = Math.hypot(b.vx, b.vy);
  const r = 10;

  // Sombra dinâmica
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx+2, cy+r+2+spd*W*0.2, r*0.9+spd*W*0.2, r*0.35, 0, 0, Math.PI*2);
  ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fill();
  ctx.restore();

  // Bola sprite com rotação + clip circular (sem fundo quadrado)
  if (ballImg.complete && ballImg.naturalWidth > 0) {
    const rot = b.spin*5 + Date.now()*0.003*Math.max(0.15,spd*35);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    // Clip circular para remover qualquer fundo da imagem
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI*2);
    ctx.clip();
    const size = r * 2.4;
    ctx.drawImage(ballImg, -size/2, -size/2, size, size);
    ctx.restore();
    // Contorno suave circular
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  } else {
    // Fallback simples caso imagem não carregue
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.fillStyle = '#f2f2f2'; ctx.fill();
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.stroke();
  }
}
