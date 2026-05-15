# Claude Pacer — Design Spec
**Data:** 2026-05-15  
**Autor:** Arquiteto Somo  
**Status:** Aprovado para implementação

---

## 1. Problema

O plano MAX 20x do Claude tem dois limites de uso semanal:
- **Todos os modelos** — reinicia toda quarta-feira às 17h59
- **Somente Sonnet** — reinicia toda quarta-feira às 17h59

O usuário consome tokens principalmente via Claude Code e não tem referência visual de qual deveria ser o uso acumulado em cada dia da semana para não esgotar o limite antes da renovação.

---

## 2. Solução

Single-page React app hospedado no GitHub Pages.  
Core: **calculadora de ritmo de consumo semanal** com entrada manual de % atual e curva de teto ideal por dia.

Dados persistidos em `localStorage`. Sem backend, sem autenticação, sem dependências externas de dados.

---

## 3. Modelo de Dados

```ts
// Leitura de uso registrada pelo usuário
type Reading = {
  timestamp: number   // Date.now() — unix ms
  percent: number     // 0–100, exatamente o que aparece na UI do Claude
}

// Um limite do plano
type Limit = {
  id: 'all_models' | 'sonnet_only'
  label: string       // "Todos os modelos" | "Somente Sonnet"
  readings: Reading[]
}

// Estado completo da aplicação
type AppState = {
  limits: Limit[]
  cycle: {
    resetDayOfWeek: number  // 3 = quarta-feira
    resetHour: number       // 17
    resetMinute: number     // 59
  }
}
```

**Chave no localStorage:** `claude-pacer-state`

**Estado inicial (seed):**
```ts
{
  limits: [
    { id: 'all_models', label: 'Todos os modelos', readings: [] },
    { id: 'sonnet_only', label: 'Somente Sonnet', readings: [] }
  ],
  cycle: { resetDayOfWeek: 3, resetHour: 17, resetMinute: 59 }
}
```

---

## 4. Lógica de Negócio

### 4.1 Calcular início e fim do ciclo atual

```
cycleStart = última quarta às 17h59 (no passado)
cycleEnd   = próxima quarta às 17h59
cycleDuration = cycleEnd - cycleStart  (≈ 168h em ms)
elapsed = now - cycleStart
progress = elapsed / cycleDuration  (0.0 → 1.0)
```

### 4.2 Teto ideal por momento

```
SAFETY_MARGIN = 0.10   // reserva 10% para não zerar

tetoIdeal(t) = progress(t) × 100
tetoSeguro(t) = tetoIdeal(t) × (1 - SAFETY_MARGIN)
```

Significado: às 12h de quarta, o ciclo tem 50% do tempo decorrido → teto seguro é 45%.

### 4.3 Tetos por dia da semana (para a timeline)

Para cada dia Qui→Qua do ciclo, calcular `tetoSeguro` no fim daquele dia (23h59):

```
Dia 1 (Qui): progress ≈ 14.3% → teto ≈ 12.9%
Dia 2 (Sex): progress ≈ 28.6% → teto ≈ 25.7%
Dia 3 (Sáb): progress ≈ 42.9% → teto ≈ 38.6%
Dia 4 (Dom): progress ≈ 57.1% → teto ≈ 51.4%
Dia 5 (Seg): progress ≈ 71.4% → teto ≈ 64.3%
Dia 6 (Ter): progress ≈ 85.7% → teto ≈ 77.1%
Dia 7 (Qua): progress = 100%  → teto ≈ 90.0%
```

### 4.4 Status do uso atual

Dado `usoAtual` (última leitura registrada) e `tetoSeguro` agora:

```
delta = tetoSeguro - usoAtual

se delta >= 10  → 'ok'       (🟢 usando menos que o ideal)
se delta >= 0   → 'warning'  (🟡 próximo do teto)
se delta < 0    → 'critical' (🔴 acima do teto, risco de esgotar)
```

### 4.5 Projeção de esgotamento

Usando as últimas 2+ leituras, calcular taxa de consumo por hora:

```
taxa = (leituraAtual.percent - leituraAnterior.percent) / deltaHoras
horasRestantes = (100 - usoAtual) / taxa
esgotaEm = now + horasRestantes

se esgotaEm < cycleEnd → "Esgota antes de renovar ⚠️"
se esgotaEm >= cycleEnd → "Renova com X% sobrando ✓"
```

Com menos de 2 leituras: mostrar apenas status, sem projeção.

---

## 5. Componentes React

```
src/
├── App.tsx                    — root, gerencia AppState, passa props
├── hooks/
│   ├── useAppState.ts         — lê/escreve localStorage, expõe state + actions
│   └── useCycleCalc.ts        — toda lógica de datas e cálculos do ciclo
├── components/
│   ├── atoms/
│   │   ├── GaugeArc.tsx       — arco SVG de progresso (0–100%)
│   │   ├── StatusBadge.tsx    — pill ok/warning/critical
│   │   └── PercentInput.tsx   — input numérico controlado 0–100
│   ├── molecules/
│   │   ├── LimitCard.tsx      — gauge + uso atual + status + projeção
│   │   ├── WeekTimeline.tsx   — 7 colunas com teto e marcador de hoje
│   │   └── RegisterModal.tsx  — modal com 2 PercentInputs + submit
│   └── organisms/
│       ├── Header.tsx         — nome do app + countdown até renovação
│       └── Dashboard.tsx      — composição: Header + 2×LimitCard + WeekTimeline
├── lib/
│   └── cycleCalc.ts           — funções puras de cálculo (testáveis isoladamente)
├── types/
│   └── index.ts               — Reading, Limit, AppState, Status
└── styles/
    └── tokens.css             — CSS custom properties (cores, tipografia, spacing)
```

---

## 6. Design System — Anthropic Aesthetic

### 6.1 Tipografia

- **Display / Números grandes:** `Styrene B` (ou fallback: `Georgia`) — peso 700
- **Corpo / Labels:** `Söhne` (ou fallback: `'Helvetica Neue', sans-serif`) — pesos 400 e 500
- Jumps: número KPI em `4rem`, label em `0.75rem` — ratio > 5x ✓
- Zero uso de Inter, Roboto, Poppins ou qualquer fonte SOMO-proibida

### 6.2 Paleta de cores (tokens CSS)

```css
:root {
  /* Anthropic coral — accent principal */
  --color-accent: #D97757;
  --color-accent-dim: #b85e3f;

  /* Superfícies — light mode */
  --color-bg: #FAF9F5;
  --color-surface: #F0EDE6;
  --color-surface-raised: #FFFFFF;
  --color-border: #E2DDD5;

  /* Texto */
  --color-text-primary: #1A1915;
  --color-text-secondary: #6B6560;
  --color-text-muted: #A09890;

  /* Status semântico — não herdar do Tailwind */
  --color-ok: #4A7C59;        /* verde sálvia */
  --color-warning: #B07D2E;   /* âmbar terroso */
  --color-critical: #D97757;  /* coral = accent, unifica linguagem */

  /* Gauge arco */
  --color-gauge-track: #E2DDD5;
  --color-gauge-fill: #D97757;
}

[data-theme="dark"] {
  --color-bg: #141412;
  --color-surface: #1E1D1A;
  --color-surface-raised: #252420;
  --color-border: #2E2D29;
  --color-text-primary: #F0EDE6;
  --color-text-secondary: #9B9488;
  --color-text-muted: #6B6560;
  --color-gauge-track: #2E2D29;
}
```

### 6.3 Spacing e shape

- **Border-radius:** cards `4px` sharp · modal `8px` · badges `9999px` pill
- **Sombras:** só no modal (elevação semântica real) — `0 8px 32px rgba(0,0,0,0.12)`
- **Grid:** 2 colunas em desktop (os dois LimitCards), 1 coluna em mobile
- **Sem glassmorphism, sem glow, sem gradientes decorativos**

### 6.4 Motion

- 1 momento orquestrado: page load com staggered fade-in dos cards (delay 0ms, 80ms, 160ms)
- Gauge arc: transição `stroke-dashoffset` com `transition: 600ms ease-out` no mount
- Modal: fade + scale sutil (`scale(0.97) → scale(1)`, 150ms)
- Nenhum scroll-triggered animation, nenhum loop infinito

---

## 7. Fluxo de Usuário

### 7.1 Primeiro acesso
1. App carrega com state vazio
2. Dashboard exibe os dois cards com gauge zerado e empty state: *"Registre seu uso agora"*
3. Timeline mostra os tetos ideais (calculados mesmo sem leitura)
4. Header mostra countdown até próxima renovação

### 7.2 Registro de uso
1. Usuário clica "Registrar uso"
2. Modal abre com dois campos: `% Todos os modelos` e `% Somente Sonnet`
3. Submit salva reading com timestamp atual no localStorage
4. Modal fecha, dashboard atualiza instantaneamente

### 7.3 Retorno (dias seguintes)
1. App carrega, lê localStorage
2. Exibe última leitura de cada limite + status vs. teto de agora
3. Se última leitura tem mais de 4h, mostra nudge: *"Última leitura há X horas — atualizar?"*
4. Timeline destaca o dia atual com marcador

### 7.4 Renovação de ciclo
1. Quando `now >= cycleEnd`, app detecta novo ciclo automaticamente
2. Readings antigas (ciclo anterior) são arquivadas (mantidas no array, ignoradas nos cálculos)
3. Gauges resetam para 0% até nova leitura ser registrada

---

## 8. Estados de Interface

| Estado | LimitCard mostra |
|--------|-----------------|
| Sem leituras | Gauge 0%, empty state com CTA |
| 1 leitura | Gauge + status, sem projeção |
| 2+ leituras | Gauge + status + projeção de esgotamento |
| Leitura desatualizada (+4h) | Badge "Desatualizado" + nudge |
| Crítico (acima do teto) | Gauge em `--color-critical`, badge vermelho |

---

## 9. Constraints Técnicas

- **React 18** com hooks funcionais — sem classes
- **TypeScript strict** — sem `any`, todas as interfaces exportadas de `types/index.ts`
- **Tailwind** apenas para utilitários de layout (gap, flex, grid) — cores SEMPRE via CSS variables, nunca classes de cor do Tailwind
- **Sem dependências de UI** (sem shadcn, sem Radix direto, sem Aceternity)
- **Vite** como bundler — `vite.config.ts` com `base: '/nome-do-repo/'` para GitHub Pages
- **GitHub Actions** para deploy automático no push para `main`
- **localStorage** como única fonte de persistência — sem cookies, sem IndexedDB

---

## 10. Fora do Escopo (v1)

- Notificações push / alertas por email
- Múltiplos usuários ou planos
- Sync entre devices
- Importação de dados históricos
- Modo offline avançado (PWA)
- Comparativo entre ciclos

---

## 11. Critérios de Sucesso

- [ ] Usuário consegue registrar uso em menos de 10 segundos
- [ ] Teto diário é visualmente óbvio sem precisar ler texto explicativo
- [ ] Status ok/warning/critical é compreensível sem legenda
- [ ] Funciona corretamente na virada de ciclo (quarta 17h59)
- [ ] Responsivo: usável no celular sem zoom
- [ ] Dados persistem ao fechar e reabrir o browser

