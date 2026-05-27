# Results Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two-stacked-iframes results page with a tabbed, sub-routed layout — team selector (1./2. Mannschaft) + tabs (Spielplan, Tabelle, Live) — where Spielplan shows the existing widget and Tabelle/Live show styled placeholders.

**Architecture:** Child routes under `/ergebnisse/:team/:tab` replace the current flat route. `ResultsComponent` reads `:team` and `:tab` from `ActivatedRoute` as signals and renders the team selector, tab bar, and either an iframe or a placeholder. No new sub-components — YAGNI.

**Tech Stack:** Angular 20, standalone components, Angular signals, `toSignal` from `@angular/core/rxjs-interop`, TailwindCSS, `TranslatePipe`, `MetaService`.

---

## File Map

| File | Change |
|---|---|
| `src/app/app.routes.ts` | Replace flat `ergebnisse` route with child routes + redirects |
| `src/app/app.config.server.ts` | Replace `ergebnisse` prerender with 6 explicit sub-routes |
| `src/app/i18n/de/results.ts` | Replace all keys with new tab/team/placeholder keys |
| `src/app/i18n/en/results.ts` | Same for English |
| `src/app/components/results/results.component.ts` | Full rewrite |
| `src/app/components/results/results.component.html` | Full rewrite |

---

### Task 1: Update i18n keys

**Files:**
- Modify: `src/app/i18n/de/results.ts`
- Modify: `src/app/i18n/en/results.ts`

- [ ] **Replace `src/app/i18n/de/results.ts` with:**

```typescript
export const results = {
  'results.title': 'Ergebnisse',
  'results.team1': '1. Mannschaft',
  'results.team2': '2. Mannschaft',
  'results.tab.spielplan': 'Spielplan',
  'results.tab.tabelle': 'Tabelle',
  'results.tab.live': 'Live',
  'results.placeholder': 'Demnächst verfügbar',
  'results.noLiveGame': 'Aktuell kein Spiel live',
};
```

- [ ] **Replace `src/app/i18n/en/results.ts` with:**

```typescript
export const results = {
  'results.title': 'Results',
  'results.team1': '1st Team',
  'results.team2': '2nd Team',
  'results.tab.spielplan': 'Schedule',
  'results.tab.tabelle': 'Standings',
  'results.tab.live': 'Live',
  'results.placeholder': 'Coming soon',
  'results.noLiveGame': 'No live game right now',
};
```

- [ ] **Commit**

```bash
git add src/app/i18n/de/results.ts src/app/i18n/en/results.ts
git commit -m "feat: update results i18n keys for tabbed layout"
```

---

### Task 2: Update routes

**Files:**
- Modify: `src/app/app.routes.ts`

- [ ] **Replace the `ergebnisse` entry in `src/app/app.routes.ts`:**

Find:
```typescript
  {
    path: 'ergebnisse',
    loadComponent: () => import('./components/results/results.component').then(m => m.ResultsComponent)
  },
```

Replace with:
```typescript
  {
    path: 'ergebnisse',
    children: [
      { path: '', redirectTo: '1-mannschaft/spielplan', pathMatch: 'full' },
      { path: '1-mannschaft', redirectTo: '1-mannschaft/spielplan', pathMatch: 'full' },
      { path: '2-mannschaft', redirectTo: '2-mannschaft/spielplan', pathMatch: 'full' },
      {
        path: ':team/:tab',
        loadComponent: () => import('./components/results/results.component').then(m => m.ResultsComponent)
      }
    ]
  },
```

- [ ] **Commit**

```bash
git add src/app/app.routes.ts
git commit -m "feat: add child routes for results page team/tab navigation"
```

---

### Task 3: Update SSR prerender config

**Files:**
- Modify: `src/app/app.config.server.ts`

- [ ] **Replace the `ergebnisse` line in `src/app/app.config.server.ts`:**

Find:
```typescript
  { path: 'ergebnisse', renderMode: RenderMode.Prerender },
```

Replace with:
```typescript
  { path: 'ergebnisse/1-mannschaft/spielplan', renderMode: RenderMode.Prerender },
  { path: 'ergebnisse/1-mannschaft/tabelle', renderMode: RenderMode.Prerender },
  { path: 'ergebnisse/1-mannschaft/live', renderMode: RenderMode.Prerender },
  { path: 'ergebnisse/2-mannschaft/spielplan', renderMode: RenderMode.Prerender },
  { path: 'ergebnisse/2-mannschaft/tabelle', renderMode: RenderMode.Prerender },
  { path: 'ergebnisse/2-mannschaft/live', renderMode: RenderMode.Prerender },
```

- [ ] **Commit**

```bash
git add src/app/app.config.server.ts
git commit -m "feat: add prerender routes for all team/tab combinations"
```

---

### Task 4: Rewrite ResultsComponent

**Files:**
- Modify: `src/app/components/results/results.component.ts`
- Modify: `src/app/components/results/results.component.html`

- [ ] **Replace `src/app/components/results/results.component.ts` with:**

```typescript
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser, NgClass } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { MetaService } from '../../services/meta.service';

type Team = '1-mannschaft' | '2-mannschaft';
type Tab = 'spielplan' | 'tabelle' | 'live';

const WIDGET_ORIGIN = 'https://claudiost.github.io';
const WIDGET_BASE = 'https://claudiost.github.io/renegades-scores/widget.html';
const MIN_HEIGHT = 400;
const TEAM_IDS: Record<Team, number> = { '1-mannschaft': 159, '2-mannschaft': 287 };

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [TranslatePipe, RouterLink, NgClass],
  templateUrl: './results.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsComponent implements OnInit, OnDestroy {
  #meta = inject(MetaService);
  #sanitizer = inject(DomSanitizer);
  #platformId = inject(PLATFORM_ID);
  #route = inject(ActivatedRoute);

  readonly tabs: Tab[] = ['spielplan', 'tabelle', 'live'];

  readonly #params = toSignal(this.#route.params, { initialValue: {} });

  readonly team = computed<Team>(() => {
    const t = this.#params()['team'];
    return t === '2-mannschaft' ? '2-mannschaft' : '1-mannschaft';
  });

  readonly tab = computed<Tab>(() => {
    const t = this.#params()['tab'];
    return t === 'tabelle' ? 'tabelle' : t === 'live' ? 'live' : 'spielplan';
  });

  readonly iframeHeight = signal(MIN_HEIGHT);

  readonly iframeUrl = computed<SafeResourceUrl | null>(() => {
    if (this.tab() !== 'spielplan') return null;
    const id = TEAM_IDS[this.team()];
    return this.#sanitizer.bypassSecurityTrustResourceUrl(
      `${WIDGET_BASE}?t=${id}&view=spielplan&color=ffab00`,
    );
  });

  readonly iframeRef = viewChild<ElementRef<HTMLIFrameElement>>('widgetIframe');

  readonly #resetHeight = effect(() => {
    this.iframeUrl(); // track URL changes (team or tab switch)
    untracked(() => this.iframeHeight.set(MIN_HEIGHT));
  });

  readonly #messageHandler = (event: MessageEvent) => {
    if (event.origin !== WIDGET_ORIGIN) return;
    const { type, height } = event.data ?? {};
    if (type !== 'iframeHeight' || typeof height !== 'number') return;
    if (event.source === this.iframeRef()?.nativeElement.contentWindow) {
      this.iframeHeight.set(Math.max(height, MIN_HEIGHT));
    }
  };

  ngOnInit(): void {
    this.#meta.updateMeta({
      title: 'Ergebnisse & Tabelle - Nürnberg Renegades',
      description:
        'Aktuelle Spielergebnisse, Tabelle und Spielplan der 1. und 2. Mannschaft der Nürnberg Renegades e.V. in der DFFL.',
      canonical: 'https://nuernberg-renegades.de/ergebnisse',
    });
    if (isPlatformBrowser(this.#platformId)) {
      window.addEventListener('message', this.#messageHandler);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.#platformId)) {
      window.removeEventListener('message', this.#messageHandler);
    }
  }
}
```

- [ ] **Replace `src/app/components/results/results.component.html` with:**

```html
<main class="main-content bg-secondary dark:bg-dark-secondary text-primary dark:text-white min-h-screen py-12">
  <div class="container mx-auto px-4">
    <h1 class="text-4xl font-bold mb-8 text-center tracking-tight">
      {{ 'results.title' | translate }}
    </h1>

    <!-- Team Selector -->
    <div class="flex gap-3 mb-8 justify-center">
      <a
        routerLink="/ergebnisse/1-mannschaft/spielplan"
        class="px-5 py-2 rounded-full font-semibold text-sm transition-colors duration-200"
        [ngClass]="team() === '1-mannschaft'
          ? 'bg-accent text-primary'
          : 'bg-secondary-dark dark:bg-dark-surface text-gray-400'"
      >{{ 'results.team1' | translate }}</a>
      <a
        routerLink="/ergebnisse/2-mannschaft/spielplan"
        class="px-5 py-2 rounded-full font-semibold text-sm transition-colors duration-200"
        [ngClass]="team() === '2-mannschaft'
          ? 'bg-accent text-primary'
          : 'bg-secondary-dark dark:bg-dark-surface text-gray-400'"
      >{{ 'results.team2' | translate }}</a>
    </div>

    <!-- Tab Bar -->
    <div class="border-b border-gray-200 dark:border-white/10 mb-8">
      <nav class="flex">
        @for (t of tabs; track t) {
          <a
            [routerLink]="'/ergebnisse/' + team() + '/' + t"
            class="px-4 py-3 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px flex items-center gap-2"
            [ngClass]="tab() === t
              ? 'border-accent text-accent'
              : 'border-transparent text-gray-500 dark:text-gray-400'"
          >
            @if (t === 'live') {
              <span class="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
            }
            {{ 'results.tab.' + t | translate }}
          </a>
        }
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="rounded-xl overflow-hidden bg-secondary-dark dark:bg-dark-surface">
      @if (tab() === 'spielplan') {
        @if (iframeUrl(); as url) {
          <iframe
            #widgetIframe
            [src]="url"
            [style.height.px]="iframeHeight()"
            class="w-full"
            style="border: none;"
            scrolling="no"
            [title]="'results.tab.spielplan' | translate"
            loading="lazy"
          ></iframe>
        }
      } @else if (tab() === 'tabelle') {
        <div class="flex flex-col items-center justify-center py-16 gap-4 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M3 14h18M10 3v18M14 3v18" />
          </svg>
          <p class="text-sm">{{ 'results.placeholder' | translate }}</p>
        </div>
      } @else {
        <div class="flex flex-col items-center justify-center py-16 gap-4 text-gray-400">
          <span class="inline-block w-3 h-3 rounded-full bg-gray-400"></span>
          <p class="text-sm">{{ 'results.noLiveGame' | translate }}</p>
        </div>
      }
    </div>

  </div>
</main>
```

- [ ] **Commit**

```bash
git add src/app/components/results/results.component.ts src/app/components/results/results.component.html
git commit -m "feat: rewrite ResultsComponent with team selector and tab navigation"
```

---

### Task 5: Verify in browser

- [ ] **Start the dev server**

```bash
npm run start
```

- [ ] **Check each scenario in the browser at http://localhost:4200:**

| URL | Expected |
|---|---|
| `/ergebnisse` | Redirects to `/ergebnisse/1-mannschaft/spielplan` |
| `/ergebnisse/1-mannschaft` | Redirects to `/ergebnisse/1-mannschaft/spielplan` |
| `/ergebnisse/1-mannschaft/spielplan` | Team 1 pill active (gold), Spielplan tab underlined, iframe visible and auto-sizing |
| `/ergebnisse/2-mannschaft/spielplan` | Team 2 pill active, iframe loads team 2 widget (`t=287`) |
| Click Tabelle tab | URL becomes `/ergebnisse/1-mannschaft/tabelle`, iframe gone, "Demnächst verfügbar" shown |
| Click Live tab | URL becomes `/ergebnisse/1-mannschaft/live`, grey dot + "Aktuell kein Spiel live" shown |
| Switch to 2. Mannschaft from Tabelle tab | URL becomes `/ergebnisse/2-mannschaft/spielplan` (resets to Spielplan) |
| Dark mode toggle | All states render correctly in dark mode |
| Mobile viewport (375px wide) | Team pills and tabs wrap/scroll without overflow |

- [ ] **Check browser console** — no errors, no missing translation key warnings

- [ ] **Commit if any fixes were needed**, otherwise done.
