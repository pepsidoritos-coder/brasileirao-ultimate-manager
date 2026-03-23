/**
 * engine.js
 * Motor gráfico Canvas 2D: campo, jogadores, bola, física
 * Algoritmos: Steering Behaviors (Seek/Arrive, Separation, Wander)
 */

/* ─── Canvas globals ─── */
const canvas = document.getElementById('pitch-canvas');
const ctx    = canvas.getContext('2d');
let W = 800, H = 450;

/* ─── Margens do campo no canvas ─── */
const M = { l:0.05, r:0.05, t:0.05, b:0.05 };
const px  = fx => M.l*W + fx*(W*(1-M.l-M.r));
const py  = fy => M.t*H + fy*(H*(1-M.t-M.b));
const fw  = ()  => W*(1-M.l-M.r);
const fh  = ()  => H*(1-M.t-M.b);

/* ─── Formação 4-3-3 (proporção 0-1 do campo) ─── */
const FORM = [
  [0.04,0.50],
  [0.22,0.17],[0.22,0.38],[0.22,0.62],[0.22,0.83],
  [0.43,0.26],[0.43,0.50],[0.43,0.74],
  [0.65,0.22],[0.65,0.50],[0.65,0.78],
];

/* ─── Física ─── */
let allPlayers = [];
let ball = { x:.5, y:.5, vx:0, vy:0, spin:0 };
let trailPts = [];
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

/** Seek com Arrive (decelera ao chegar) */
function seek(p, tx, ty, slowR = 0.08) {
  let dx = tx-p.x, dy = ty-p.y;
  const dist = Math.hypot(dx,dy) || 0.0001;
  const spd = dist < slowR ? MAX_SPD*(dist/slowR) : MAX_SPD*(0.6+p.skill/200);
  const [dvx,dvy] = [(dx/dist)*spd, (dy/dist)*spd];
  return vLimit(dvx-p.vx, dvy-p.vy, MAX_F*(0.8+p.skill/130));
}

/** Separation: evita sobreposição entre jogadores */
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

/** Wander: movimento orgânico aleatório */
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
function buildPlayerStates() {
  const m = matches[activeMIdx];
  allPlayers = [];
  ['h','a'].forEach((side, si) => {
    const tn  = m[side];
    const tDB = DB[tn];
    FORM.forEach((pos, pi) => {
      const bx = si===0 ? pos[0] : 1-pos[0];
      const by = pos[1];
      const sk = tDB.skills[tDB.p[pi]];
      allPlayers.push({
        name: tDB.p[pi], team: tn, side: si, isGK: pi===0,
        bx, by, x: bx, y: by, vx: 0, vy: 0,
        skill: sk, wanderAngle: Math.random()*Math.PI*2,
        expulso: false, hasBall: false,
        exitVx: (si===0?-1:1)*0.004*(0.5+Math.random()*0.8),
        exitVy: (Math.random()-0.5)*0.005,
        exitAlpha: 1.0,
        huddleX: si===0 ? (0.08+Math.random()*0.06) : (0.86+Math.random()*0.06),
        huddleY: 0.80+Math.random()*0.15,
      });
    });
  });
  ball = { x:.5, y:.5, vx:0, vy:0, spin:0 };
  trailPts = [];
}

/* ════════════════════════════════════════
   FÍSICA (atualizada a cada frame)
════════════════════════════════════════ */
function updatePhysics() {
  const m = matches[activeMIdx];
  if (!m || !allPlayers.length) return;

  const ft     = m.status === 'FT';
  const paused = m.paused;
  const active = isRunning && !ft && !paused;
  const activePlayers = allPlayers.filter(p => !p.expulso);

  /* Saída do campo (intervalo ou FT) */
  if (isHalftimeExit || isExiting) {
    allPlayers.forEach(p => {
      p.x += p.exitVx; p.y += p.exitVy;
      if (p.y < -0.15 || p.y > 1.15) p.exitVy *= -1;
      p.exitAlpha = Math.max(0, p.exitAlpha - 0.003);
    });
    return;
  }

  /* Huddle — jogadores vão para o banco */
  if (isHuddle || paused) {
    activePlayers.forEach(p => {
      const [fx,fy] = seek(p, p.huddleX, p.huddleY, 0.18);
      p.vx += fx; p.vy += fy;
      [p.vx,p.vy] = vLimit(p.vx, p.vy, MAX_SPD*0.55);
      p.x += p.vx; p.y += p.vy;
    });
    return;
  }

  if (!active) return;

  /* Portador da bola */
  let carrier = null, cDist = Infinity;
  activePlayers.forEach(p => {
    const d = Math.hypot(p.x-ball.x, p.y-ball.y);
    if (d < cDist) { cDist = d; carrier = p; }
  });
  activePlayers.forEach(p => p.hasBall = false);
  if (carrier && cDist < 0.04) carrier.hasBall = true;

  /* Movimento de cada jogador */
  activePlayers.forEach(p => {
    let fx=0, fy=0;

    if (p.isGK) {
      const gkY = Math.max(p.by-0.14, Math.min(p.by+0.14, ball.y));
      const [sfx,sfy] = seek(p, p.bx, gkY, 0.05);
      fx+=sfx; fy+=sfy;
    } else if (p.hasBall) {
      const advX = p.side===0 ? Math.min(0.93, p.x+0.10) : Math.max(0.07, p.x-0.10);
      const advY = p.y + (Math.random()-0.5)*0.05;
      const [sfx,sfy] = seek(p, advX, advY, 0.04);
      fx += sfx*1.5; fy += sfy*1.5;
    } else if (p === carrier && !p.hasBall) {
      const [sfx,sfy] = seek(p, ball.x, ball.y, 0.03);
      fx += sfx*2.0; fy += sfy*2.0;
    } else {
      const infl = 0.28;
      let tX = p.bx + (ball.x-0.5)*infl;
      let tY = p.by + (ball.y-0.5)*infl;
      if (carrier && carrier.side !== p.side) {
        const pdx=carrier.x-p.x, pdy=carrier.y-p.y, pd=Math.hypot(pdx,pdy)||0.001;
        if (pd < 0.3) { tX+=pdx/pd*0.07*(p.skill/90); tY+=pdy/pd*0.07*(p.skill/90); }
      }
      const [sfx,sfy] = seek(p, tX, tY, 0.10);
      const [wfx,wfy] = wander(p);
      fx+=sfx+wfx; fy+=sfy+wfy;
    }

    const [sx,sy] = separate(p, activePlayers);
    fx+=sx; fy+=sy;
    p.vx+=fx; p.vy+=fy;
    [p.vx,p.vy] = vLimit(p.vx, p.vy, MAX_SPD*(0.7+p.skill/130));
    p.x += p.vx; p.y += p.vy;
    p.x = Math.max(0.01, Math.min(0.99, p.x));
    p.y = Math.max(0.01, Math.min(0.99, p.y));
  });

  /* Física da bola */
  ball.x += ball.vx; ball.y += ball.vy;
  ball.vx *= 0.955; ball.vy *= 0.955; ball.spin *= 0.91;
  if (ball.x<0.01){ball.x=0.01; ball.vx=Math.abs(ball.vx)*0.65; ball.spin*=-1;}
  if (ball.x>0.99){ball.x=0.99; ball.vx=-Math.abs(ball.vx)*0.65; ball.spin*=-1;}
  if (ball.y<0.01){ball.y=0.01; ball.vy=Math.abs(ball.vy)*0.7;}
  if (ball.y>0.99){ball.y=0.99; ball.vy=-Math.abs(ball.vy)*0.7;}

  /* Interação portador→bola */
  if (carrier && cDist < 0.04) {
    if (cDist < 0.02) {
      const r = Math.random();
      const teammates = activePlayers.filter(t => t.side===carrier.side && !t.isGK && t!==carrier);
      if (r < 0.45 && teammates.length) {
        const tgt = teammates.sort((a,b) => {
          const sA = (carrier.side===0?a.x:-a.x) - (Math.hypot(a.x-carrier.x,a.y-carrier.y)*0.3);
          const sB = (carrier.side===0?b.x:-b.x) - (Math.hypot(b.x-carrier.x,b.y-carrier.y)*0.3);
          return sB - sA;
        })[0];
        kickBall(tgt.x+(Math.random()-0.5)*0.08, tgt.y+(Math.random()-0.5)*0.05, 0.009+carrier.skill/8000);
      } else if (r < 0.72) {
        const goalX = carrier.side===0 ? 0.99 : 0.01;
        const goalY = 0.40 + Math.random()*0.20;
        kickBall(goalX, goalY, 0.013+carrier.skill/5500);
      } else {
        ball.x = carrier.x + (carrier.side===0?0.02:-0.02);
        ball.y = carrier.y + (Math.random()-0.5)*0.008;
        ball.vx = carrier.vx*0.85; ball.vy = carrier.vy*0.85;
      }
    } else {
      const dx=ball.x-carrier.x, dy=ball.y-carrier.y, d=Math.hypot(dx,dy)||0.001;
      ball.vx+=dx/d*0.0008; ball.vy+=dy/d*0.0008;
    }
  }

  trailPts.push({ x:ball.x, y:ball.y, spd:Math.hypot(ball.vx,ball.vy) });
  if (trailPts.length > 22) trailPts.shift();
}

function kickBall(tx, ty, spd) {
  const dx=tx-ball.x, dy=ty-ball.y, d=Math.hypot(dx,dy)||0.001;
  ball.vx=(dx/d)*spd; ball.vy=(dy/d)*spd; ball.spin=(Math.random()-0.5)*0.5;
}

/* ════════════════════════════════════════
   RENDER LOOP (60fps)
════════════════════════════════════════ */
function resizeCanvas() {
  const wrap = document.getElementById('pitch-wrap');
  if (!wrap) return;
  canvas.width  = wrap.clientWidth;
  canvas.height = 450;
  W = canvas.width; H = canvas.height;
}

function renderLoop() {
  W = canvas.width; H = canvas.height;
  updatePhysics();
  drawScene();
  requestAnimationFrame(renderLoop);
}

/* ════════════════════════════════════════
   DRAW SCENE
════════════════════════════════════════ */
function drawScene() {
  ctx.clearRect(0,0,W,H);
  drawPitch();
  drawTrail();
  drawPlayers();
  const m = matches[activeMIdx];
  if (!isExiting && !isHalftimeExit) drawBall();

  /* Label pausa técnica */
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

/* ════════════════════════════════════════
   CAMPO FIEL — PROPORÇÕES FIFA 105×68m
════════════════════════════════════════ */
function drawPitch() {
  /* Grama em listras */
  const nStripes = 10;
  for (let i=0; i<nStripes; i++) {
    const x0=px(i/nStripes), x1=px((i+1)/nStripes);
    ctx.fillStyle = i%2===0 ? '#1a4a21' : '#1e5527';
    ctx.fillRect(x0, py(0), x1-x0, fh());
  }
  /* Terra fora do campo */
  ctx.fillStyle = '#0d1c0e';
  ctx.fillRect(0,0,W,py(0));
  ctx.fillRect(0,py(1),W,H-py(1));
  ctx.fillRect(0,0,px(0),H);
  ctx.fillRect(px(1),0,W-px(1),H);

  /* Vinheta */
  const vg = ctx.createRadialGradient(W/2,H/2,H*0.1,W/2,H/2,H*0.85);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,0.5)');
  ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);

  const FW=fw(), FH=fh();
  const L=px(0),R=px(1),T=py(0),B=py(1),CX=px(0.5),CY=py(0.5);

  ctx.save();
  ctx.strokeStyle='rgba(255,255,255,0.88)'; ctx.lineJoin='round'; ctx.lineWidth=2;

  /* Borda */
  ctx.strokeRect(L,T,FW,FH);
  /* Linha do meio */
  ctx.beginPath(); ctx.moveTo(CX,T); ctx.lineTo(CX,B); ctx.stroke();
  /* Círculo central (r=9.15m/68m≈13.4% FH) */
  const circR = FH*0.134;
  ctx.beginPath(); ctx.arc(CX,CY,circR,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.9)';
  ctx.beginPath(); ctx.arc(CX,CY,3.5,0,Math.PI*2); ctx.fill();
  /* Área grande (16.5m/105m=15.7%; 40.32m/68m=59.3%) */
  const aW=FW*0.157, aH=FH*0.593, aYo=(FH-aH)/2;
  ctx.strokeRect(L,T+aYo,aW,aH); ctx.strokeRect(R-aW,T+aYo,aW,aH);
  /* Área pequena (5.5m/105m=5.2%; 18.32m/68m=26.9%) */
  const saW=FW*0.052, saH=FH*0.269, saYo=(FH-saH)/2;
  ctx.strokeRect(L,T+saYo,saW,saH); ctx.strokeRect(R-saW,T+saYo,saW,saH);
  /* Pontos de pênalti (11m/105m=10.5%) */
  const penX=FW*0.105;
  ctx.fillStyle='rgba(255,255,255,0.9)';
  ctx.beginPath(); ctx.arc(L+penX,CY,3.5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(R-penX,CY,3.5,0,Math.PI*2); ctx.fill();
  /* Arcos da área (r=9.15m/105m≈8.7% FW — apenas fora das áreas) */
  const arcR=FW*0.087;
  ctx.save();
  ctx.beginPath(); ctx.rect(L+aW+1,T,FW-2*aW-2,FH); ctx.clip();
  ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(L+penX,CY,arcR,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(R-penX,CY,arcR,0,Math.PI*2); ctx.stroke();
  ctx.restore();
  /* Balizas (7.32m/68m=10.76% FH) */
  const goalH=FH*0.1076, goalD=12, goalYo=(FH-goalH)/2;
  ctx.lineWidth=2.5; ctx.strokeStyle='rgba(255,255,255,0.95)';
  ctx.strokeRect(L-goalD,T+goalYo,goalD,goalH);
  ctx.strokeRect(R,T+goalYo,goalD,goalH);
  ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(L,T+goalYo); ctx.lineTo(L,T+goalYo+goalH); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(R,T+goalYo); ctx.lineTo(R,T+goalYo+goalH); ctx.stroke();
  /* Arcos de canto (r=1m/105m≈0.95% FW) */
  const cR=Math.max(7,FW*0.0095);
  ctx.lineWidth=1.5; ctx.strokeStyle='rgba(255,255,255,0.75)';
  ctx.beginPath(); ctx.arc(L,T,cR,0,Math.PI/2); ctx.stroke();
  ctx.beginPath(); ctx.arc(R,T,cR,Math.PI/2,Math.PI); ctx.stroke();
  ctx.beginPath(); ctx.arc(L,B,cR,-Math.PI/2,0); ctx.stroke();
  ctx.beginPath(); ctx.arc(R,B,cR,Math.PI,-Math.PI/2); ctx.stroke();
  ctx.restore();
}

function drawTrail() {
  if (trailPts.length < 2) return;
  for (let i=1; i<trailPts.length; i++) {
    const t = i/trailPts.length;
    const r = 3.8*t*Math.min(1, trailPts[i].spd*90);
    if (r < 0.4) continue;
    ctx.beginPath(); ctx.arc(px(trailPts[i].x), py(trailPts[i].y), r, 0, Math.PI*2);
    ctx.fillStyle=`rgba(255,255,200,${t*0.25})`; ctx.fill();
  }
}

function drawPlayers() {
  /* Sombras */
  allPlayers.forEach(p => {
    const alpha = (isExiting||isHalftimeExit) ? p.exitAlpha : 1;
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha = alpha*0.28;
    ctx.beginPath(); ctx.ellipse(px(p.x)+2, py(p.y)+11, 10, 4, 0, 0, Math.PI*2);
    ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fill(); ctx.restore();
  });
  /* Corpos */
  allPlayers.forEach(p => {
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
  const bright = ['#cbd5e1','#e5e7eb','#aaa','#999','#bbb','#eee'].includes(clr);

  ctx.beginPath(); ctx.arc(cx,cy,r+2,0,Math.PI*2);
  ctx.fillStyle='rgba(0,0,0,0.22)'; ctx.fill();
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
  ctx.fillStyle = bright ? '#bfc8d4' : clr; ctx.fill();
  ctx.strokeStyle = p.hasBall ? '#ffffff' : 'rgba(255,255,255,0.6)';
  ctx.lineWidth = p.hasBall ? 2.5 : 1.6; ctx.stroke();

  if (p.hasBall) {
    ctx.beginPath(); ctx.arc(cx,cy,r+5,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx,cy,r+9,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1; ctx.stroke();
  }
  if (p.isGK) {
    ctx.beginPath(); ctx.arc(cx,cy,r+3,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,215,0,0.55)'; ctx.lineWidth=1.5; ctx.stroke();
  }

  ctx.fillStyle='#fff';
  ctx.font=`bold ${p.isGK?9:8}px Barlow Condensed,sans-serif`;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(p.name.split(' ')[0].substring(0,3).toUpperCase(), cx, cy);
  ctx.fillStyle='rgba(255,255,255,0.82)';
  ctx.font='bold 7.5px Barlow Condensed,sans-serif';
  ctx.fillText(p.name.split(' ')[0], cx, cy-r-4);
}

function drawBall() {
  const cx = px(ball.x), cy = py(ball.y);
  const spd = Math.hypot(ball.vx, ball.vy);
  ctx.beginPath();
  ctx.ellipse(cx+2, cy+8+spd*W*0.3, 8+spd*W*0.35, 4, 0, 0, Math.PI*2);
  ctx.fillStyle='rgba(0,0,0,0.42)'; ctx.fill();
  const g = ctx.createRadialGradient(cx-3,cy-3,1,cx,cy,8);
  g.addColorStop(0,'#ffffff'); g.addColorStop(0.4,'#e2e2e2'); g.addColorStop(1,'#5a5a5a');
  ctx.beginPath(); ctx.arc(cx,cy,8,0,Math.PI*2);
  ctx.fillStyle=g; ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=0.8; ctx.stroke();
  const rot = ball.spin*5 + Date.now()*0.002*Math.max(0.2,spd*40);
  ctx.save(); ctx.translate(cx,cy); ctx.rotate(rot);
  ctx.strokeStyle='rgba(0,0,0,0.22)'; ctx.lineWidth=0.8;
  for (let i=0; i<5; i++) {
    const a = i*(Math.PI*2/5);
    ctx.beginPath();
    ctx.moveTo(Math.cos(a)*4, Math.sin(a)*4);
    ctx.lineTo(Math.cos(a+Math.PI*2/5)*4, Math.sin(a+Math.PI*2/5)*4);
    ctx.stroke();
  }
  ctx.restore();
}
