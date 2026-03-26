/**
 * database.js
 * Dados dos clubes, escudos SVG, textos de narração
 */

/* ═══════════════════════════════════════════════════════════
   ESCUDOS — URLs externas (CDN confiável)
═══════════════════════════════════════════════════════════ */
const SHIELDS = {
  'Flamengo':      'https://logodetimes.com/times/flamengo/logo-flamengo-256.png',
  'Palmeiras':     'https://logodetimes.com/times/palmeiras/logo-palmeiras-256.png',
  'Botafogo':      'https://logodetimes.com/times/botafogo/logo-botafogo-256.png',
  'Santos':        'https://logodetimes.com/times/santos/logo-santos-256.png',
  'São Paulo':     'https://logodetimes.com/times/sao-paulo/logo-sao-paulo-256.png',
  'Atlético-MG':   'https://logodetimes.com/times/atletico-mineiro/logo-atletico-mineiro-256.png',
  'Cruzeiro':      'https://logodetimes.com/times/cruzeiro/logo-cruzeiro-256.png',
  'Corinthians':   'https://logodetimes.com/times/corinthians/logo-corinthians-256.png',
  'Internacional': 'https://logodetimes.com/times/internacional/logo-internacional-256.png',
  'Grêmio':        'https://logodetimes.com/times/gremio/logo-gremio-256.png',
  'Fluminense':    'https://logodetimes.com/times/fluminense/logo-fluminense-256.png',
  'Bahia':         'https://logodetimes.com/times/bahia/logo-bahia-256.png',
  'Fortaleza':     'https://logodetimes.com/times/fortaleza/logo-fortaleza-256.png',
  'Athletico-PR':  'https://logodetimes.com/times/atletico-paranaense/logo-atletico-paranaense-256.png',
  'Vasco':         null, // SVG inline abaixo
  'Bragantino':    'https://logodetimes.com/times/red-bull-bragantino/logo-red-bull-bragantino-256.png',
  'Vitória':       'https://logodetimes.com/times/vitoria/logo-vitoria-256.png',
  'Cuiabá':        'https://logodetimes.com/times/cuiaba/logo-cuiaba-256.png',
  'Criciúma':      null, // SVG inline abaixo
  'Juventude':     'https://logodetimes.com/times/juventude/logo-juventude-256.png',
};

/* ─── Escudos em SVG inline — Vasco e Criciúma ─── */
const SHIELDS_SVG = {

  // VASCO DA GAMA — oval preto, faixa diagonal branca, caravela, cruz de malta vermelha
  'Vasco': (function(){
    const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 210">
  <defs><clipPath id="vc"><ellipse cx="100" cy="100" rx="90" ry="95"/></clipPath></defs>
  <ellipse cx="100" cy="100" rx="90" ry="95" fill="#111"/>
  <polygon points="10,185 10,110 190,20 190,75" fill="#fff" clip-path="url(#vc)"/>
  <polygon points="10,10 190,10 190,20 10,110" fill="#111" clip-path="url(#vc)"/>
  <polygon points="10,185 190,75 190,190 10,190" fill="#111" clip-path="url(#vc)"/>
  <!-- Caravela -->
  <path d="M62,148 Q100,160 138,148 L132,155 Q100,163 68,155 Z" fill="#fff"/>
  <path d="M68,142 Q100,152 132,142 L132,155 Q100,163 68,155 Z" fill="#fff"/>
  <line x1="100" y1="100" x2="100" y2="145" stroke="#fff" stroke-width="3"/>
  <rect x="82" y="105" width="36" height="28" rx="2" fill="#fff" opacity=".9"/>
  <line x1="100" y1="105" x2="100" y2="133" stroke="#111" stroke-width="1.2"/>
  <path d="M78,100 L78,118 L96,115 Z" fill="#fff" opacity=".85"/>
  <path d="M100,100 L100,112 L120,108 Z" fill="#ddd" opacity=".8"/>
  <path d="M55,157 Q70,152 85,157 Q100,162 115,157 Q130,152 145,157" fill="none" stroke="#fff" stroke-width="1.5" opacity=".6"/>
  <!-- Cruz de Malta vermelha -->
  <g transform="translate(108,30)">
    <path d="M17,0 L20,8 L28,4 L24,12 L32,15 L24,18 L28,26 L20,22 L17,30 L14,22 L6,26 L10,18 L2,15 L10,12 L6,4 L14,8 Z" fill="#cc1111"/>
    <polygon points="5,4 14,8 8,13" fill="#fff" opacity=".9"/>
    <polygon points="29,4 20,8 26,13" fill="#fff" opacity=".9"/>
    <polygon points="5,26 14,22 8,17" fill="#fff" opacity=".9"/>
    <polygon points="29,26 20,22 26,17" fill="#fff" opacity=".9"/>
  </g>
  <!-- Monograma CR -->
  <text x="30" y="68" font-family="Georgia,serif" font-size="28" font-weight="900" fill="#fff" font-style="italic" transform="rotate(-5,30,68)">CR</text>
  <!-- VB -->
  <text x="74" y="190" font-family="Georgia,serif" font-size="22" font-weight="900" fill="#fff" font-style="italic">VB</text>
  <ellipse cx="100" cy="100" rx="90" ry="95" fill="none" stroke="#fff" stroke-width="5"/>
  <ellipse cx="100" cy="100" rx="85" ry="90" fill="none" stroke="#fff" stroke-width="1.2" stroke-dasharray="4 6"/>
</svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`;
  })(),

  // CRICIÚMA EC — retângulo creme, 3 losangos amarelos, 3 estrelas, texto base
  'Criciúma': (function(){
    const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220">
  <rect x="5" y="30" width="190" height="170" rx="12" fill="#f5f0e0"/>
  <rect x="5" y="30" width="190" height="170" rx="12" fill="none" stroke="#222" stroke-width="4"/>
  <line x1="5" y1="75" x2="195" y2="75" stroke="#222" stroke-width="3"/>
  <!-- Fundo amarelo do corpo -->
  <rect x="5" y="75" width="190" height="120" fill="#F5C800"/>
  <path d="M5,175 L5,188 Q5,200 17,200 L183,200 Q195,200 195,188 L195,175 Z" fill="#F5C800"/>
  <!-- Triângulos pretos formando 3 losangos amarelos -->
  <polygon points="5,75 100,145 5,145"   fill="#222"/>
  <polygon points="195,75 100,145 195,145" fill="#222"/>
  <polygon points="100,75 60,145 140,145" fill="#222"/>
  <!-- Diagonais estruturantes -->
  <line x1="5"   y1="75" x2="100" y2="200" stroke="#222" stroke-width="3"/>
  <line x1="195" y1="75" x2="100" y2="200" stroke="#222" stroke-width="3"/>
  <line x1="100" y1="75" x2="5"   y2="200" stroke="#222" stroke-width="3"/>
  <line x1="100" y1="75" x2="195" y2="200" stroke="#222" stroke-width="3"/>
  <!-- Cobertura arredondada inferior -->
  <path d="M5,188 Q5,200 17,200 L183,200 Q195,200 195,188 L195,175 L5,175 Z" fill="#F5C800" stroke="none"/>
  <!-- 3 estrelas amarelas no topo (fundo creme) -->
  <text x="55"  y="66" font-size="22" fill="#F5C800" text-anchor="middle" stroke="#c8a000" stroke-width=".5">★</text>
  <text x="100" y="62" font-size="22" fill="#F5C800" text-anchor="middle" stroke="#c8a000" stroke-width=".5">★</text>
  <text x="145" y="66" font-size="22" fill="#F5C800" text-anchor="middle" stroke="#c8a000" stroke-width=".5">★</text>
  <!-- Texto base -->
  <text x="100" y="215" font-family="Arial Black,Impact,sans-serif" font-size="13" font-weight="900" fill="#222" text-anchor="middle" letter-spacing="1">CRICIÚMA E.C.</text>
  <!-- Borda final -->
  <rect x="5" y="30" width="190" height="170" rx="12" fill="none" stroke="#222" stroke-width="4"/>
</svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`;
  })(),
};

/** Fallback SVG com iniciais do time */
function shieldFallback(name) {
  const initials = name.substring(0, 2).toUpperCase();
  return `data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' rx='8' fill='%23131a24'/><text x='32' y='42' text-anchor='middle' font-family='Arial Black' font-size='22' font-weight='900' fill='%2300e676'>${encodeURIComponent(initials)}</text></svg>`;
}

function logoOf(name) {
  if (SHIELDS_SVG[name]) return SHIELDS_SVG[name];
  return SHIELDS[name] || shieldFallback(name);
}

/* ═══════════════════════════════════════════════════════════
   BANCO DE DADOS DOS CLUBES
═══════════════════════════════════════════════════════════ */
const DB = {
  'Flamengo':      { r:85, c:'#e11d48', p:['Rossi','Léo Ortiz','Léo Pereira','Alex Sandro','Pulgar','Gerson','Arrascaeta','De La Cruz','Luiz Araújo','Pedro','Gabigol'] },
  'Palmeiras':     { r:84, c:'#16a34a', p:['Weverton','Mayke','G. Gómez','Murilo','Vanderlan','Moreno','R. Rios','Veiga','F. Anderson','Estêvão','López'] },
  'Botafogo':      { r:83, c:'#888',    p:['John','Adryelson','Barboza','Vitinho','Telles','Gregore','M. Freitas','Almada','L. Henrique','Savarino','Igor J.'] },
  'Santos':        { r:81, c:'#cbd5e1', p:['J. Paulo','Gil','Jair','Escobar','Schmidt','Pituca','Giuliano','Neymar Jr','Guilherme','Furch','Bigode'] },
  'São Paulo':     { r:82, c:'#dc2626', p:['Rafael','Rafinha','Arboleda','Franco','Welington','L. Gustavo','Bobadilla','Lucas','Luciano','Ferreira','Calleri'] },
  'Atlético-MG':   { r:82, c:'#666',    p:['Everson','Saravia','Battaglia','Alonso','Arana','Otávio','Fausto','Scarpa','Bernard','Hulk','Paulinho'] },
  'Cruzeiro':      { r:80, c:'#2563eb', p:['Cássio','William','Zé Ivaldo','Villalba','Marlon','Walace','Matheus H.','Barreal','M. Pereira','Veron','Kaio J.'] },
  'Corinthians':   { r:80, c:'#888',    p:['Hugo S.','Fagner','Ramalho','Torres','Bidu','Charles','Carrillo','Garro','Raniele','Memphis','Yuri Alberto'] },
  'Internacional': { r:80, c:'#dc2626', p:['Rochet','Vitão','Mercado','Gomes','Bernabei','Fernando','Maia','Alan P.','Carvalho','Wesley','Borré'] },
  'Grêmio':        { r:79, c:'#0ea5e9', p:['Marchesín','Ely','Jemerson','Pedro','Reinaldo','Villasanti','Dodi','Monsalve','Cristaldo','Soteldo','Braithwaite'] },
  'Fluminense':    { r:79, c:'#92400e', p:['Fábio','Samuel','T. Silva','Ignácio','Marcelo','Bernal','Martinelli','Ganso','Arias','Keno','K. Elias'] },
  'Bahia':         { r:79, c:'#3b82f6', p:['M. Felipe','S. Arias','G. Xavier','Kanu','Juba','Caio','Jean','E. Ribeiro','Cauly','Thaciano','Lucho'] },
  'Fortaleza':     { r:78, c:'#ef4444', p:['J. Ricardo','Brítez','Kuscevic','Titi','Pacheco','Hércules','Sasha','Pochettino','Pikachu','Moisés','Lucero'] },
  'Athletico-PR':  { r:77, c:'#dc2626', p:['Mycael','Madson','Kaique','Heleno','Esquivel','Fernandinho','Erick','Zapelli','Cuello','Canobbio','Mastriani'] },
  'Vasco':         { r:77, c:'#aaa',    p:['L. Jardim','Maicon','João Victor','Piton','P. Henrique','H. Moura','Sforza','Coutinho','Payet','David','Vegetti'] },
  'Bragantino':    { r:76, c:'#e5e7eb', p:['Cleiton','Hurtado','Mendes','Cunha','Luan','Jadsom','Raul','Evangelista','Lincoln','Helinho','Sasha'] },
  'Vitória':       { r:74, c:'#dc2626', p:['Arcanjo','Cáceres','Neris','Wagner','Esteves','Luan','Willian','Matheusinho','Eduardo','Osvaldo','Alerrandro'] },
  'Cuiabá':        { r:74, c:'#15803d', p:['Walter','Alexandre','Marllon','Alves','Ramon','Mineiro','Sobral','Max','Clayson','Fernandes','Pitta'] },
  'Criciúma':      { r:73, c:'#eab308', p:['Gustavo','Dudu','Rodrigo','Tobias','Hermes','Barreto','Newton','Fellipe','Arthur','Bolasie','Eder'] },
  'Juventude':     { r:72, c:'#15803d', p:['Gabriel','João Lucas','Danilo','Zé Marcos','Alan','Caíque','Oyama','Nenê','Lucas B.','Erick','Gilberto'] },
};

function faceURL(name, hex) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=${(hex||'131a24').replace('#','')}&style=circle`;
}

/* ═══════════════════════════════════════════════════════════
   TEXTOS DE NARRAÇÃO
═══════════════════════════════════════════════════════════ */
const NARR = {
  corner: [
    '🚩 Escanteio para o {T}! {P} ajeita com carinho, bola subindo com curva na pequena área!',
    '🚩 Cobrança de canto perigosa do {T}. A defesa sobe inteira, chuveirinho marcado pelo {P}!',
    '🚩 {P} vai colocar o escanteio do {T} na cabeça do centroavante!',
  ],
  freeKick: [
    '🎯 Falta perigosíssima! {P} toma distância, olha pro goleiro... lá vai a bomba do {T}!',
    '🎯 A barreira foi armada. {P} na batida da falta para o {T}, chance claríssima de gol!',
    '🎯 {P} corre pra bola na batida da falta! Ele tem muita categoria de fora da área para o {T}!',
  ],
  penalty: [
    '🚨 PÊNALTI MARCADO! O {P} foi derrubado na marcação dura na área! O árbitro apita com convicção pro {T}!',
    '🚨 VAR CONFIRMA: penalidade máxima a favor do {T}! {P} está com a bola na marca da cal!',
  ],
  penaltyScored: [
    '⚽ TÁ LÁ DENTRO! GOOOOOL DE PÊNALTI! {P} bateu deslocando totalmente o goleiro e faz pro {T}!',
    '⚽ É CAIXA! GOOOOL! {P} comemora muito após cobrar com precisão absurda!',
  ],
  penaltyMissed: [
    '😱 DEFENDEEEU {GK}! O QUE É ISSO?! {P} mandou no cantinho mas o goleiro voou para salvar o {T}!',
    '😱 ISOLOOOOOU! {P} bateu mal demais e jogou a oportunidade na arquibancada!',
    '😱 NA TRAVEEE! O goleiro nem se mexeu mas a cobrança do {P} explodiu no poste!',
  ],
  save: [
    '🧤 INCRÍVEL! O {P} encheu o pé rasgando a zaga pelo {T} e o goleirão {GK} espalmou lindamente!',
    '🧤 MILAGRE DO {GK}! O {P} pelo {T} testou os reflexos dele com uma finalização brutal no cantinho!',
    '🧤 OPA! Que defesaça do {GK}! {P} tirou os zagueiros e mandou a bomba, mas o goleirão estava atento!',
  ],
  shot: [
    '🔫 UHHHHHH! O {P} mandou um tirambaço do {T} de muito longe que assustou a zaga adversária!',
    '🔫 NA TRAVEEEEE! O {P} tirou do goleiro, a bola beijou o poste pelo lado de fora! Quase do {T}!',
    '🔫 PRA FORA! O {P} pelo {T} cortou dois defensores mas pegou mal demais na hora da batida.',
  ],
  dribble: [
    '🌀 {P} coloca na frente, dribla veloz desconcertando a marcação e impõe ritmo ao ataque do {T}!',
    '🌀 Lindo corte seco de {P}! Deixou o adversário sentado no gramado!',
  ],
  foul: [
    '⚠️ Entrada muito dura sofreu o jogador do {T}. Árbitro marcou falta que será batida por {P}!',
    '⚠️ Tesoura imprudente! O {P} arma a jogada na marcação da falta pro {T}.',
  ],
  offside: [
    '🚩 Bandeira sobe! O {P} tava muito adiantado na hora do lançamento. Impendido pelo {T}!',
    '🚩 Bola longa nas costas do zagueiro, mas o {P} pelo {T} correu antes da hora. Estava na banheira e é Impedimento marcado.',
  ],
  possession: [
    'E o {T} mantém a posse com bastante tranquilidade tentando achar buracos na defesa.',
    '{P} distribui muito bem o jogo lá de trás articulando a chegada do {T}.',
    'O {T} circula a bola de pé em pé, chamando o adversário pro combate...',
  ],
  kickoff: [
    '⚽ AUTORIZA O ÁRBITRO! Tá valendo a emoção do futebol brasileiro para {H} contra {A}!',
    '⚽ Bola rolando, cronômetro na tela! Que vença o melhor entre {H} e {A}!',
  ],
  endgame: [
    '🔚 APITA O ÁRBITRO, FIM DE PAPO! Acaba o jogo com muita luta em campo!',
    '🔚 TRÊS APITOS! O juizões decreta o final deste grandioso espetáculo!',
  ],
  goalMoment: [
    '⚽ GOOOOOOOOOOOOOOOOOOL! É DO {T}! O {P} domina livre, estufa as redes num chute maravilhoso e corre pro abraço dos torcedores!',
    '⚽ É GOOOOOOL! {P} infiltra na defesa como um trator e guarda o dele pelo {T} sem dó! Emoção à flor da pele!',
    '⚽ TÁ LÁ DENTRO! QUE GOLAÇO DO {T}! O {P} finalizou maravilhosamente bem e explodiu o estádio!',
  ],
};

function pickNarr(key, data = {}) {
  const arr = NARR[key];
  if (!arr || !arr.length) return '';
  let txt = arr[Math.floor(Math.random() * arr.length)];
  Object.entries(data).forEach(([k, v]) => { txt = txt.replaceAll('{' + k + '}', v || ''); });
  return txt;
}
