import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  viewChild,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

import { TranslatePipe } from "../../pipes/translate.pipe";
import { MetaService } from "../../services/meta.service";

const WIDGET_ORIGIN = "https://claudiost.github.io";
const MIN_HEIGHT = 1454;

@Component({
  selector: "app-results",
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: "./results.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsComponent implements OnInit, OnDestroy {
  #meta = inject(MetaService);
  #sanitizer = inject(DomSanitizer);
  #platformId = inject(PLATFORM_ID);

  firstTeamIframe = viewChild<ElementRef<HTMLIFrameElement>>("firstTeamIframe");
  secondTeamIframe = viewChild<ElementRef<HTMLIFrameElement>>(
    "secondTeamIframe",
  );

  firstTeamHeight = signal(MIN_HEIGHT);
  secondTeamHeight = signal(MIN_HEIGHT);

  firstTeamUrl: SafeResourceUrl = this.#sanitizer
    .bypassSecurityTrustResourceUrl(
      "https://claudiost.github.io/renegades-scores/widget.html?t=159&color=ffab00",
    );
  secondTeamUrl: SafeResourceUrl = this.#sanitizer
    .bypassSecurityTrustResourceUrl(
      "https://claudiost.github.io/renegades-scores/widget.html?t=287&color=ffab00",
    );

  #messageHandler = (event: MessageEvent) => {
    if (event.origin !== WIDGET_ORIGIN) return;
    const { type, height } = event.data ?? {};
    console.log({ type, height });
    if (type !== "iframeHeight" || typeof height !== "number") return;

    const adjusted = Math.max(height, MIN_HEIGHT);
    if (event.source === this.firstTeamIframe()?.nativeElement.contentWindow) {
      this.firstTeamHeight.set(adjusted);
    } else if (
      event.source === this.secondTeamIframe()?.nativeElement.contentWindow
    ) {
      this.secondTeamHeight.set(adjusted);
    }
  };

  ngOnInit() {
    this.#meta.updateMeta({
      title: "Ergebnisse & Tabelle - Nürnberg Renegades",
      description:
        "Aktuelle Ergebnisse und Tabellenstände der 1. und 2. Mannschaft der Nürnberg Renegades e.V. in der DFFL.",
      canonical: "https://nuernberg-renegades.de/ergebnisse",
    });

    if (isPlatformBrowser(this.#platformId)) {
      window.addEventListener("message", this.#messageHandler);
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.#platformId)) {
      window.removeEventListener("message", this.#messageHandler);
    }
  }
}
