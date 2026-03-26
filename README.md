<div align="center">

# ⚽ Brasileirão Ultimate Manager 2026

**Simulador completo do Campeonato Brasileiro — em tempo real, direto no navegador.**

Campo 2D • IA de jogadores • Narração ao vivo • Apostas • 38 rodadas

---

`HTML` · `CSS` · `JavaScript puro` — sem frameworks, sem npm, sem dependências.

</div>

---

## 🎮 Funcionalidades

| | Feature | Descrição |
|---|---|---|
| ⚽ | **10 jogos simultâneos** | Todas as partidas da rodada rolam em paralelo com relógio real |
| 🏟️ | **Campo 2D realista** | Proporções FIFA com áreas, pênaltis, arcos e balizas |
| 🤖 | **IA com Steering Behaviors** | Jogadores autônomos: Seek, Separation, Wander e Pressure |
| 跑 | **Física da bola** | Atrito, rebote, spin rotacional, trail e sombra dinâmica |
| 🗣️ | **Narração com voz** | Narração feminina sintetizada e sincronizada com os eventos do campo |
| 🟨 | **Sistema de cartões** | Amarelo com acúmulo, segundo amarelo = vermelho, expulsão visual |
| 📊 | **Posse de bola ao vivo** | Barra de posse atualiza em tempo real durante a partida |
| ⏸️ | **Pausas técnicas** | Jogadores se reúnem com o técnico aos 30' e 75' |
| 🏆 | **Tabela de classificação** | Atualizada automaticamente com zonas (Libertadores, Sul-Americana, Rebaixamento) |
| 🎯 | **Apostas de placar exato** | Odds dinâmicas baseadas na classificação |
| 💰 | **Carteira virtual** | Saldo acumulado ao longo das 38 rodadas |
| ⚡ | **Controle de velocidade** | 0.5× · 1× · 2× · 5× |
| 💾 | **Auto-save** | Temporada salva em LocalStorage — fecha e retoma depois |
| 🥇 | **Artilharia** | Ranking com medalhas 🥇🥈🥉 e total de gols por jogador |

---

## 🚀 Como Jogar

1. Abra `index.html` no navegador (arraste ou duplo-clique).
2. Vá na aba **"Apostas"** e preencha o placar dos 10 jogos.
3. Clique em **"CONFIRMAR E JOGAR"**.
4. Volte ao Match Center e clique em **"INICIAR RODADA"**.
5. Assista aos jogos ao vivo — clique na lista lateral para trocar de partida.
6. No fim da rodada, confira resultados e avance.
7. Repita por 38 rodadas até o campeão! 🏆

> **Dica:** Use o slider de velocidade para acelerar até 5× quando quiser.

---

## 📁 Estrutura do Projeto

```text
brasileirao-ultimate-manager/
├── index.html          ← Ponto de entrada
├── README.md
├── LICENSE
└── assets/
    ├── css/style.css   ← Design system completo
    ├── img/ball.png    ← Sprite da bola
    ├── shields/        ← Escudos dos times
    └── js/
        ├── database.js ← Clubes, elencos, escudos, narração
        ├── narrator.js ← Motor de narração contextual
        ├── engine.js   ← Canvas 2D, física, IA dos jogadores
        ├── ui.js       ← Interface, tabs, apostas, scoreboard
        └── game.js     ← Lógica de simulação e persistência
