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
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { MetaService } from '../../services/meta.service';
import { ThemeService } from '../../services/theme.service';
import { LocalePathPipe } from '../../pipes/locale-path.pipe';

type Team = '1-mannschaft' | '2-mannschaft';
type Tab = 'spielplan' | 'tabelle' | 'live';

const WIDGET_ORIGIN = 'https://claudiost.github.io';
const WIDGET_BASE = 'https://claudiost.github.io/renegades-scores/widget.html';
const MIN_HEIGHT = 400;
const TEAM_IDS: Record<Team, number> = { '1-mannschaft': 159, '2-mannschaft': 287 };
// Accent per theme, mirroring the `accent` / `--brand-amber` tokens of the site.
const WIDGET_ACCENT_LIGHT = '8a5d00';
const WIDGET_ACCENT_DARK = 'ffc03a';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [TranslatePipe, RouterLink, NgClass, LocalePathPipe],
  templateUrl: './results.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsComponent implements OnInit, OnDestroy {
  #meta = inject(MetaService);
  #sanitizer = inject(DomSanitizer);
  #platformId = inject(PLATFORM_ID);
  #route = inject(ActivatedRoute);
  #theme = inject(ThemeService);

  readonly tabs: Tab[] = ['spielplan', 'tabelle', 'live'];

  readonly #params = toSignal(this.#route.params, { initialValue: {} as Params });

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
    const t = this.tab();
    const id = TEAM_IDS[this.team()];
    const view = t === 'tabelle' ? 'table' : t === 'live' ? 'live' : 'spielplan';
    // Read untracked: theme changes are pushed via postMessage instead of reloading the iframe.
    const theme = untracked(() => this.#theme.theme());
    return this.#sanitizer.bypassSecurityTrustResourceUrl(
      `${WIDGET_BASE}?t=${id}&view=${view}&color=${WIDGET_ACCENT_LIGHT}&color_dark=${WIDGET_ACCENT_DARK}&theme=${theme}`,
    );
  });

  readonly iframeRef = viewChild<ElementRef<HTMLIFrameElement>>('widgetIframe');

  readonly #syncWidgetTheme = effect(() => {
    const theme = this.#theme.theme();
    this.iframeRef()?.nativeElement.contentWindow?.postMessage(
      { type: 'setTheme', theme },
      WIDGET_ORIGIN,
    );
  });

  readonly #resetHeight = effect(() => {
    this.iframeUrl(); // track URL changes (team or tab switch)
    untracked(() => this.iframeHeight.set(MIN_HEIGHT));
  });

  readonly #updateMeta = effect(() => {
    const team = this.team();
    const tab = this.tab();
    this.#meta.updateMeta({
      titleKey: 'meta.results.title',
      descriptionKey: 'meta.results.description',
      path: `/ergebnisse/${team}/${tab}`,
    });
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
