/**
 * narrator.js — Motor Narrativo V4
 * Textos otimizados para pronúncia TTS brasileira.
 * Emoção via vocabulário (CAPS, reticências, exclamações).
 */

const Narrator = {

  getArea(x, isHome) {
    const nx = isHome ? x : 1 - x;
    if (nx < 0.25) return 'campo de defesa';
    if (nx < 0.50) return 'meio de campo';
    if (nx < 0.75) return 'campo de ataque';
    return 'entrada da área';
  },

  getCorridor(y) {
    if (y < 0.33) return 'lado esquerdo';
    if (y > 0.67) return 'lado direito';
    return 'centro';
  },

  buildHeader(m, evt) {
    const min = Math.floor(m.clock);
    return `<div style="font-family:monospace;font-size:0.72rem;color:var(--accent);margin-bottom:3px;padding:3px 5px;background:rgba(0,0,0,0.4);border-radius:4px;">
      [${min}'] ${m.h} ${m.sh} × ${m.sa} ${m.a} — ${evt}
    </div>`;
  },

  generate(m, type, atkName, atkTeam, defName, defTeam, isHome) {
    let p = m.players.find(x => x.name === atkName);
    if (!p) p = { x: 0.5, y: 0.5 };
    const area = this.getArea(p.x, isHome);
    const corr = this.getCorridor(p.y);
    let evt = '', txt = '';

    switch (type) {
      case 'possession': {
        const opts = [
          `${atkTeam} toca a bola no ${area}. ${atkName} recebe pelo ${corr} e procura o companheiro.`,
          `Bola com o ${atkTeam}. ${atkName} controla pelo ${corr}, olha pra frente e toca curtinho.`,
          `${atkName} do ${atkTeam} trabalha a bola no ${area}, sem pressa, circulando pelo ${corr}.`,
          `${atkTeam} mantém a posse. ${atkName} recebe e toca de primeira pelo ${corr}!`
        ];
        evt = 'Posse de bola';
        txt = opts[Math.floor(Math.random() * opts.length)];
        break;
      }

      case 'dribble': {
        const opts = [
          `${atkName} recebe e parte pra cima pelo ${corr}! Corta um, corta dois! Que jogada sensacional!`,
          `Olha o drible do ${atkName}! Puxou pro corpo, tirou o marcador do lance e abriu espaço!`,
          `${atkName} com a bola, faz o giro bonito pelo ${corr} e deixa o adversário pra trás!`
        ];
        evt = 'Drible';
        txt = opts[Math.floor(Math.random() * opts.length)];
        break;
      }

      case 'corner': {
        const opts = [
          `Escanteio pro ${atkTeam}! ${atkName} vai cobrar. Levanta na área, e a zaga do ${defTeam} afasta!`,
          `Tiro de canto! ${atkName} coloca a bola na área, todo mundo sobe, mas o ${defTeam} tira de cabeça!`
        ];
        evt = 'Escanteio';
        txt = opts[Math.floor(Math.random() * opts.length)];
        break;
      }

      case 'foul': {
        const opts = [
          `Falta em cima do ${atkName}! Entrada dura no ${area}. Bola parada pro ${atkTeam}.`,
          `O juiz marca falta! Pegada forte em ${atkName} pelo ${corr}. Lance perigoso!`,
          `Parou o jogo! Falta cometida sobre ${atkName}. O ${atkTeam} vai cobrar do ${area}.`
        ];
        evt = 'Falta';
        txt = opts[Math.floor(Math.random() * opts.length)];
        break;
      }

      case 'offside':
        evt = 'Impedimento';
        txt = `Levantou a bandeira o auxiliar! ${atkName} saiu na frente da zaga, mas estava impedido. Lance anulado!`;
        break;

      case 'shot': {
        const post = Math.random() > 0.5;
        if (post) {
          evt = 'Na Trave!';
          txt = `${atkName} solta o chute de fora da área! A bola vai, vai... BATE NA TRAAAVE! Quase! Por muito pouco!`;
        } else {
          evt = 'Pra fora';
          txt = `${atkName} arrisca o chute pelo ${corr}... mas mandou por cima do gol! Tiro de meta pro ${defTeam}.`;
        }
        break;
      }

      case 'save': {
        const miracle = Math.random() > 0.6;
        if (miracle) {
          evt = 'DEFESAAÇA!';
          txt = `${atkName} chega cara a cara com o goleiro! Chuta firme e... ${defName} FAZ UMA DEFESA INCRÍVEL! Que intervenção espetacular do goleiro do ${defTeam}!`;
        } else {
          evt = 'Boa defesa';
          txt = `${atkName} finaliza pelo ${corr}. ${defName} cai pro lado certo e faz a defesa tranquila!`;
        }
        break;
      }

      case 'goal': {
        const assist = m.players.find(q => q.team === atkTeam && q.name !== atkName && !q.isGK);
        const astN = assist ? assist.name : 'companheiro';
        evt = 'É GOOOOL!';
        const opts = [
          `${astN} lança ${atkName} na cara do gol! Ele domina, ajusta e chuta! A BOLA ENTROU! GOOOOOL DO ${atkTeam.toUpperCase()}! ${atkName.toUpperCase()} BALANÇA A REDE!`,
          `Jogada sensacional! A bola chega em ${atkName}! Ele não perdoa, chuta com vontade e... GOOOOL! É DO ${atkTeam.toUpperCase()}! Que momento!`,
          `${atkName} aparece livre na área! Recebe de ${astN}, bate colocado e... GOOOOOL! ${atkTeam.toUpperCase()} abre o placar! A torcida vai à loucura!`
        ];
        txt = opts[Math.floor(Math.random() * opts.length)];
        break;
      }

      case 'penalty':
        evt = 'PÊNALTI!';
        txt = `O juiz marca pênalti! ${atkName} foi derrubado dentro da área! Penalidade máxima pro ${atkTeam}!`;
        break;

      case 'penaltyScored':
        evt = 'GOL DE PÊNALTI!';
        txt = `${atkName} na cobrança... bate! GOOOOOL! Mandou no cantinho! ${defName} até pulou, mas não alcançou! É gol do ${atkTeam}!`;
        break;

      case 'penaltyMissed':
        evt = 'Pênalti perdido!';
        txt = `${atkName} vai pra cobrança... bateu e... ${defName.toUpperCase()} DEFENDEU! Espalmou o pênalti! Que momento dramático aqui!`;
        break;

      default:
        evt = 'Lance';
        txt = `Bola rolando no ${area}. ${atkTeam} tenta articular uma jogada pelo ${corr}.`;
    }

    return {
      header: this.buildHeader(m, evt),
      text: txt,
      cleanText: txt
    };
  }
};
