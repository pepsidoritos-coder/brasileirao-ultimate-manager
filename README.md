# ⚽ Brasileirão Ultimate Manager 2026

> Simulador completo do Campeonato Brasileiro em tempo real. Campo 2D com proporções FIFA, jogadores com IA de Steering Behaviors, sistema de apostas e narração ao vivo — tudo com **HTML, CSS e JavaScript puro**. Zero frameworks. Zero dependências de npm.

<br>

## 🎮 Demo ao Vivo

**[▶ Jogar agora](https://SEU_USUARIO.github.io/brasileirao-ultimate-manager/)**


<br>

## 📸 Preview

```
┌──────────────────────────────────────────────────────────────┐
│  ⚽ BRASILEIRÃO MARVIN COSTA 2026           RODADA 12/38     │
│  ┌────────────┐  ┌──────────────────────┐  ┌─────────────┐  │
│  │ Jogos da   │  │  Campo 2D Canvas     │  │  Palpites   │  │
│  │ Rodada     │  │                      │  │  ao Vivo    │  │
│  │ FLA 2-1    │  │  ● ● ●  ○  ● ● ●   │  │             │  │
│  │ PAL 0-0    │  │     ⚽               │  │  Artilharia │  │
│  │ BOT 1-3    │  │  ● ● ●  ○  ● ● ●   │  │  da Temporada│ │
│  │ ...        │  │                      │  │             │  │
│  │ Favorito   │  │ ─────────────────── │  │             │  │
│  │ Público    │  │ [⏸ PAUSA TÉCNICA]  │  │             │  │
│  └────────────┘  └──────────────────────┘  └─────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

<br>

## ✨ Funcionalidades

| Feature | Detalhe |
|---|---|
| ⚽ **10 jogos simultâneos** | Todas as partidas da rodada correm em paralelo com relógio real |
| 🎨 **Campo 2D fiel** | Proporções FIFA reais (105×68m): área grande, pequena, pênalti, arcos, balizas e arcos de canto |
| 🤖 **IA dos jogadores** | Steering Behaviors: Seek/Arrive, Separation, Wander e Pressure — movimento emergente natural |
| 🏃 **Física da bola** | Atrito, rebote, spin girando, trail de trajetória e sombra dinâmica proporcional à velocidade |
| 🗣️ **Narração dinâmica** | +65 textos únicos: gol, pênalti, falta, escanteio, drible, defesaça, impedimento, posse... |
| ⏸️ **Pausas técnicas** | Jogadores se reúnem no banco em huddle com o técnico aos 30' e 75' |
| 🚪 **Saída de campo** | Animação de saída com fade no intervalo e no apito final |
| 🏆 **Tabela oficial** | Classificação atualizada automaticamente após cada rodada com zonas coloridas |
| 🎯 **Sistema de apostas** | Palpite de placar exato com odds dinâmicas baseadas na posição na tabela |
| 💰 **Carteira virtual** | Saldo acumulado ao longo das 38 rodadas |
| ⚡ **Controle de velocidade** | Slider 0.5× / 1× / 2× / 5× para ajustar o ritmo da simulação |
| 💾 **Auto-save** | Estado da temporada salvo em LocalStorage — fecha e retoma depois |
| 🥇 **Artilharia da temporada** | Ranking acumulado com medalhas 🥇🥈🥉, cor do time e total de gols |
| 📱 **Responsivo** | Layout adaptado para desktop, tablet e mobile |

<br>

## 🛠️ Stack & Tecnologias

### Linguagens e APIs Web Nativas

| Tecnologia | Uso |
|---|---|
| **HTML5** | Estrutura semântica, canvas, elementos de interface |
| **CSS3** | Design system com variáveis, Grid, Flexbox, animações `@keyframes`, `backdrop-filter`, media queries |
| **JavaScript ES2022** | Toda a lógica de simulação, física, IA e renderização |
| **Canvas 2D API** | Renderização do campo e jogadores a 60fps via `requestAnimationFrame` |
| **LocalStorage API** | Persistência do estado da temporada entre sessões |
| **SVG** | Escudos dos times como Data URIs inline — sem dependência de rede |

### Algoritmos e Técnicas

| Técnica | Descrição |
|---|---|
| **Steering Behaviors** | Sistema de IA de Craig Reynolds: Seek/Arrive, Separation, Wander, Pressure |
| **Game Loop duplo** | `setInterval` para lógica de jogo + `requestAnimationFrame` para render visual desacoplados |
| **State Machine** | Máquina de estados para cada partida: `1H → HT → 2H → FT` com transições controladas |
| **Round-Robin Scheduling** | Algoritmo de geração de calendário equilibrado para 20 times × 38 rodadas |
| **Física de partícula** | Atrito, rebote, spin rotacional e trail de trajetória para a bola |
| **ClipPath SVG** | Recorte preciso dos arcos de área dentro dos limites do campo |
| **Data-driven Design** | Banco de dados JSON dos 20 clubes com elenco, habilidades e cores — fácil de expandir |

### Fontes & Ícones (CDN, sem instalação)
- **Google Fonts** — Bebas Neue · Barlow Condensed · Barlow
- **Font Awesome 6** — ícones de interface

<br>

## 📁 Estrutura do Projeto

```
brasileirao-ultimate-manager/
│
├── index.html              ← Ponto de entrada da aplicação
├── README.md               ← Este arquivo
├── LICENSE                 ← Licença MIT
├── .gitignore
│
└── assets/
    ├── css/
    │   └── style.css       ← Design system completo + responsivo
    └── js/
        ├── database.js     ← Clubes, elencos, escudos SVG, textos de narração
        ├── engine.js       ← Canvas 2D: campo, jogadores, bola, física, steering behaviors
        ├── ui.js           ← Interface: tabela, apostas, narrador, scoreboard, modais, tabs
        └── game.js         ← Lógica de jogo: partidas, rodadas, persistência, velocidade
```

**Ordem de carregamento dos scripts:**
```
database.js → engine.js → ui.js → game.js
```
Cada módulo depende dos anteriores. Não há bundler — os scripts são carregados sequencialmente no `<head>` do HTML.

<br>

## 🚀 Como Usar

### Opção 1 — Direto no navegador
```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/brasileirao-ultimate-manager.git

# 2. Abra o arquivo
# Simplesmente arraste index.html para o navegador
# Não precisa de servidor, node, npm, nada.
```

### Opção 2 — Com servidor local simples
```bash
# Python 3
cd brasileirao-ultimate-manager
python -m http.server 8000
# Acesse: http://localhost:8000

# Node.js (sem instalar nada)
npx serve .
```

### GitHub Pages (deploy gratuito)
```
Repositório → Settings → Pages → Source: main → / (root) → Save
URL: https://SEU_USUARIO.github.io/brasileirao-ultimate-manager/
```

<br>

## 🎲 Como Jogar

1. **Faça as apostas** na aba "Apostas" — preencha o placar exato dos 10 jogos
2. Volte para **Match Center** e clique em **INICIAR RODADA**
3. Acompanhe os jogos ao vivo com narração em tempo real
4. Clique em qualquer partida na lista lateral para assistir aquela específica
5. Ao fim, confira os resultados e clique em **PRÓXIMA RODADA**
6. Use o **slider de velocidade** para acelerar até 5× se quiser passar mais rápido
7. Seu progresso é salvo automaticamente — pode fechar e voltar depois
8. Repita por **38 rodadas** até o campeão ser coroado! 🏆

<br>

## 💡 Destaques Técnicos

### Por que os jogadores se movem de forma natural?

Cada jogador é um **agente autônomo com velocidade e aceleração**. Em vez de animações pré-programadas, o movimento emerge de 4 forças combinadas:

```
Força Total = Seek(alvo tático) + Separation(evitar colisões) + Wander(aleatoriedade orgânica) + Pressure(marcação ao adversário)
```

O resultado é que nenhum jogador se move igual a outro — mesmo sem mocap, parece fluido e imprevisível.

### Como o campo tem as proporções corretas?

Todas as dimensões são calculadas como frações das **proporções FIFA reais (105×68m)**:

```js
área grande:    15.7% de largura × 59.3% de altura do campo
círculo central: raio = 13.4% da altura
ponto de pênalti: 10.5% do comprimento
baliza:          7.32m / 68m = 10.76% da altura
```

O canvas se redimensiona com `ResizeObserver` e todos os valores se recalculam automaticamente.

<br>

## 📊 Dados dos Clubes

Os 20 clubes da Série A com:
- **Rating geral** do clube (72–85)
- **Elenco de 11 jogadores reais** por time
- **Habilidade individual** gerada com variação aleatória por rodada (±4 do rating base)
- **Cor primária** para renderização no canvas
- **Escudos SVG** inline — Vasco e Criciúma redesenhados fielmente

<br>

## 🤝 Contribuições

Pull requests são bem-vindos! Algumas ideias para futuras melhorias:

- [ ] Substituições no intervalo com impacto real nas habilidades
- [ ] Estatísticas por partida (posse %, chutes, faltas)
- [ ] Histórico de rodadas anteriores
- [ ] Modo torneio (Copa do Brasil)
- [ ] Exportar temporada como JSON
- [ ] PWA com ícone instalável

<br>

## 👨‍💻 Autor

**Marvin Costa**

Desenvolvido com foco em simulação esportiva, algoritmos de IA para jogos e renderização canvas de alta performance.

---

<div align="center">

⭐ **Se curtiu o projeto, deixa uma estrela no repositório!** ⭐

*Desenvolvido com HTML · CSS · JavaScript puro — sem frameworks, sem bundler, sem npm*

</div>
