import { Directive, ElementRef, Renderer2, Input, OnInit } from '@angular/core';
import { FeatureFlagRuntimeService } from './feature-flag-runtime.service';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[featureFlagStyle]',
})
export class FeatureFlagStyleDirective implements OnInit {

  /** Flags that must be active to show flagged html */
  @Input() flags: string | string[];

  /** Class that is applied if feature flags are active */
  @Input() ffClass: string;

  constructor(private elem: ElementRef, private renderer: Renderer2,
              private ffRuntime: FeatureFlagRuntimeService) {
  }

  ngOnInit() {
    if (this.ffRuntime.isActive(this.flags)) {
      this.renderer.addClass(this.elem.nativeElement, this.ffClass);
    }
  }
}
