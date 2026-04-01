<div align="center">

# ⚽ Brasileirão Ultimate Manager 2026
**Engine de Simulação Esportiva Multithread-like em Vanilla JS**

[Acessar Demo Live](https://marvincoast.github.io/brasileirao-ultimate-manager/)

---
`Vanilla JS` · `Canvas 2D` · `Web Speech API` · `Zero Dependencies`
</div>

## 🛠️ Visão Geral Técnica
Este projeto é um simulador de alta performance do Campeonato Brasileiro, focado em **renderização eficiente via Canvas** e **IA autônoma**. Desenvolvido sem frameworks ou gerenciadores de pacotes, priorizando o uso nativo das APIs do navegador.

## 🚀 Diferenciais de Engenharia

### 🧠 Inteligência Artificial & Física
* **Steering Behaviors:** Implementação de algoritmos de direção (Seek, Separation, Wander) para movimentação realista de 220 jogadores simultâneos (10 partidas em paralelo).
* **Kinematic Engine:** Física da bola com cálculo de atrito, vetor de rebote e spin rotacional.
* **Contextual Narrator:** Motor de narração baseado em **Web Speech API** com fila de prioridades para eventos de jogo em tempo real.

### 💾 Arquitetura de Dados & UI
* **State Management:** Persistência de estado da temporada (38 rodadas) utilizando **LocalStorage API** com serialização JSON.
* **Real-time Dashboard:** Interface responsiva utilizando **CSS Grid/Flexbox** e variáveis nativas, otimizada para monitoramento de múltiplos eventos.
* **Simulação Concorrente:** Lógica de processamento de 10 partidas simultâneas com controle de ticks de jogo (0.5x a 5x).

## 📁 Estrutura do Projeto
```text
.
├── index.html          # Entry point e estrutura DOM
├── assets/
│   ├── js/
│   │   ├── engine.js   # Core: Canvas 2D, Física e IA (Steering)
│   │   ├── database.js # Camada de dados: Clubes, elencos e assets
│   │   ├── narrator.js # Controller: Interface de voz e eventos
│   │   ├── ui.js       # View: Manipulação de DOM e Scoreboard
│   │   └── game.js     # Logic: Persistência e regras de negócio
│   └── css/style.css   # Design System e Temas
🛠️ Stack Tecnológica
Runtime: Browser Native (Chrome/Edge/Firefox/Safari).

Graphics: HTML5 Canvas API (60 FPS).

Audio: Web Speech Synthesis (PT-BR).

Storage: Window.localStorage.

Typography: Google Fonts (Bebas Neue / Barlow).

👨‍💻 Autor
Marvin Costa Cloud Infrastructure Analyst & Solutions Architecture Specialist.

<div align="center">
<sub>Projeto desenvolvido para demonstração de lógica de programação e manipulação de APIs nativas.</sub>
</div>