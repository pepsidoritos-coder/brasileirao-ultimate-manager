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
    '🚩 Escanteio para {T}! {P} corre para a cobrança, bola vai com muita curva na área!',
    '🚩 Cobrança de canto de {T}. A defesa tenta organizar a barreira humana na pequena área!',
    '🚩 {P} vai cobrar o escanteio de {T}. Levantamento perigoso, ninguém antecipa!',
    '🚩 Escanteio! {P} coloca a bola no segundo pau, a confusão é geral dentro da área!',
    '🚩 {T} cobra o canto com veneno. {P} cabeceia, vai para fora por centímetros!',
    '🚩 Fumacinha na área! Escanteio de {T} — goleiro soca para longe.',
    '🚩 Canto de {T} por cima de todo mundo. Tiro de meta adversário.',
    '🚩 {P} cobra magistralmente. A bola raspa a trave e sai! Quase, quase!',
  ],
  freeKick: [
    '🎯 Falta perigosa! {P} coloca a bola no chão. {T} tem grande chance aqui!',
    '🎯 Cobrança de falta direta de {P}! A barreira pula mas a bola passa por baixo — defendeu o goleiro!',
    '🎯 {P} bate com efeito inacreditável! A bola contorna a barreira e espalma na trave!',
    '🎯 Falta frontal! {P} arma o chute — a bola vai na barreira e volta para o campo.',
    '🎯 {T} tem falta próxima à área. {P} bate colocado no ângulo... para fora por um palmo!',
    '🎯 Que cobrança de falta de {P}! O goleiro voa e espalmou no último segundo!',
    '🎯 Falta lateral. {P} levanta na área, bate na zaga e vai escanteio.',
    '🎯 {P} cobra em velocidade! Ninguém esperava — a bola vai rente à trave esquerda!',
  ],
  penalty: [
    '🚨 PÊNALTI MARCADO! A arbitragem não teve dúvidas! {P} derrubado dentro da área!',
    '🚨 VAR CONFIRMA: pênalti para {T}! O estádio inteiro explode!',
    '🚨 Mão na bola! O árbitro apita imediatamente. Pênalti polêmico para {T}!',
    '🚨 {P} invade a área, leva a rasteira e cai! Pênalti incontestável para {T}!',
    '🚨 PÊNALTI! O zagueiro perdeu o tempo da bola e derrubou {P}. {T} vai cobrar!',
  ],
  penaltyScored: [
    '⚽ GOOOOOL DE PÊNALTI! {P} deslocou o goleiro e mandou no canto! {T} balança as redes!',
    '⚽ {P} bate com categoria! Goleiro foi pro lado errado! GOL de {T}!',
    '⚽ Cobrança perfeita de {P}! No ângulo! Impossível para o goleiro! {T} marca!',
    '⚽ GOOOOL! {P} converteu com frieza total! {T} amplia o marcador!',
  ],
  penaltyMissed: [
    '😱 PERDEU! {P} bateu no meio do gol mas o goleiro adivinhou e defendeu!',
    '😱 NA TRAVE! {P} bateu colocado mas a bola explodiu na trave! Ufa!',
    '😱 PRA FORA! {P} escorregou na hora do chute e a bola foi à arquibancada!',
    '😱 Que desperdício de {P}! O goleiro voou no canto e fez defesa milagrosa!',
  ],
  save: [
    '🧤 DEFESAAAÇA! {GK} voa no canto e tira a bola do gol com a ponta dos dedos!',
    '🧤 Incrível {GK}! {P} finalizou no ângulo mas o goleiro estava lá!',
    '🧤 {GK} fecha o gol! Defesa espetacular!',
    '🧤 Que paradão de {GK}! {P} chutou cruzado forte mas o goleiro se esticou todo!',
    '🧤 {P} domina na área e bate colocado. {GK} mergulha e salva!',
    '🧤 Chute de longe de {P}! {GK} lê a trajetória e segura no peito!',
    '🧤 {GK} milagroso! Dois chutes seguidos e o goleiro defendeu os dois!',
    '🧤 Coquinho na área! {P} manda de cabeça e {GK} voa para espalmar!',
  ],
  shot: [
    '🔫 {P} arma o chute de fora da área! A bola vai à esquerda da trave.',
    '🔫 Jogada individual de {P}, chute cruzado — vai no canto externo.',
    '🔫 {P} domina no peito e bate de primeira! Vai por cima do travessão.',
    '🔫 Triangulação rápida, {P} finaliza no ângulo — a bola risca a trave!',
    '🔫 {P} recebe na entrada da área e bate de voleio! A zaga bloqueou.',
    '🔫 Bomba de {P}! A bola foi três metros acima do gol.',
    '🔫 {P} tenta o chute em efeito. A bola faz a curva mas vai para fora.',
    '🔫 {P} corta para o meio e bate! Vai rente à trave direita!',
  ],
  dribble: [
    '🌀 {P} entra em campo de cabeça baixa e deixa dois adversários no bolso!',
    '🌀 Que drible de {P}! Enganou o defensor com um corte fulminante!',
    '🌀 {P} recebe sob pressão, gira sobre si mesmo e acha o espaço. Genial!',
    '🌀 {P} faz o elástico e deixa o marcador sentado! A torcida vai à loucura!',
    '🌀 Tabela rápida, {P} se livra com categoria!',
    '🌀 {P} coloca a bola no bolso do adversário e sai acelerado pela esquerda!',
  ],
  foul: [
    '⚠️ Entrada dura de {P}! O árbitro paralisa imediatamente o jogo.',
    '⚠️ {P} toca com o cotovelo no adversário. Falta marcada.',
    '⚠️ Carrinho imprudente de {P}. Reclamações dos dois lados!',
    '⚠️ Infração flagrante de {P}. O árbitro nem hesitou em apitar.',
    '⚠️ {P} antecipa mal e derruba o adversário. Falta marcada.',
  ],
  offside: [
    '🚩 Impedimento! O assistente levanta a bandeira contra {T}.',
    '🚩 {P} estava dois metros adiantado. A linha não perdoa!',
    '🚩 Que gol anulado! {P} estava impedido por centímetros. VAR confirmou.',
    '🚩 Bandeirinha levantada contra {T}. {P} estava na frente da última linha.',
  ],
  possession: [
    '{T} toca a bola no meio-campo buscando o espaço certo para atacar.',
    '{T} circula bem a bola, atraindo a marcação para abrir espaços.',
    '{P} recebe nas costas da marcação e avança pelo corredor central.',
    '{T} domina a posse e impõe seu ritmo à partida.',
    'Bola trabalhada por {T} no campo defensivo, esperando o momento certo.',
    '{P} serve em profundidade. O companheiro domina mas é travado.',
    '{T} troca passes rápidos pela meia-direita buscando a infiltração.',
    '{P} acha espaço entre as linhas e conduz em direção à área.',
    '{T} mantém a bola com paciência. A defesa adversária recua o bloco.',
    'Contra-ataque relâmpago de {T}! {P} lança em velocidade!',
  ],
  halftime: [
    'Apita o árbitro! Fim do primeiro tempo. As equipes se recolhem ao vestiário.',
    '45 minutos intensos chegam ao fim. Intervalo obrigatório!',
    'Três apitos! Encerra-se a primeira etapa desta batalha.',
  ],
  resumeHalf: [
    'As equipes voltam para os 45 minutos decisivos! Bola no ar!',
    'Segundo tempo em andamento! O jogo recomeça mais intenso!',
    'Os jogadores retornam ao gramado. Começa a segunda etapa!',
  ],
  resumePause: [
    'Pausa técnica encerrada. Árbitro autoriza o reinício!',
    'Hidratação concluída. A bola volta a rolar!',
    'Jogadores recarregados. Jogo retomado!',
  ],
  kickoff: [
    '⚽ Apita o árbitro! A bola rola para {H} x {A}! Começa a partida!',
    '⚽ {H} e {A} entram em campo! A torcida lota as arquibancadas!',
    '⚽ Começa o jogo! {H} recebe {A} em duelo imperdível!',
    '⚽ Árbitro autoriza o início! {H} contra {A} — quem vai levar os 3 pontos?',
    '⚽ Que tarde de futebol! {H} e {A} se enfrentam em busca da vitória!',
  ],
  endgame: [
    '🔚 Fim de jogo! O árbitro encerra a partida com três apitos!',
    '🔚 Apito final! O resultado está confirmado!',
    '🔚 Acabou! O juiz deu por encerrada esta partida emocionante!',
    '🔚 TRÊS APITOS! Resultado final estabelecido aqui.',
  ],
  goalMoment: [
    '⚽ GOOOOOOOL! {P} marca para {T}! Que gol fantástico! A torcida enlouquece!',
    '⚽ É GOOOOL! {P} não perdoa e coloca {T} na frente!',
    '⚽ GOOOOOL! {P} finaliza com categoria e faz estourar a festa!',
    '⚽ GOOOOL de {T}! {P} estava no lugar certo na hora certa!',
    '⚽ QUE GOOOOL de {P}! {T} balança as redes e o estádio vai abaixo!',
    '⚽ GOOOOL! {P} dribla o goleiro e empurra para o fundo das redes! {T} marca!',
    '⚽ GOOOOOOL! Que jogada! {P} recebe, domina e bate no canto! {T}!',
  ],
};

function pickNarr(key, data = {}) {
  const arr = NARR[key];
  if (!arr || !arr.length) return '';
  let txt = arr[Math.floor(Math.random() * arr.length)];
  Object.entries(data).forEach(([k, v]) => { txt = txt.replaceAll('{' + k + '}', v || ''); });
  return txt;
}
