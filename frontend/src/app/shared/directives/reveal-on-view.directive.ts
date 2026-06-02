import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appRevealOnView]',
  standalone: true,
})
export class RevealOnViewDirective implements OnInit, OnDestroy {
  @Input() revealAttribute = 'data-animate';
  @Input() revealValue = 'true';
  @Input() revealThreshold = 0.45;
  @Input() revealOnce = true;

  private observer?: IntersectionObserver;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2
  ) {}

  ngOnInit(): void {
    const element = this.elementRef.nativeElement;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      this.renderer.setAttribute(element, this.revealAttribute, this.revealValue);
      return;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        this.renderer.setAttribute(element, this.revealAttribute, this.revealValue);

        if (this.revealOnce) {
          this.observer?.unobserve(element);
        }
      },
      {
        threshold: this.revealThreshold,
      }
    );

    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
