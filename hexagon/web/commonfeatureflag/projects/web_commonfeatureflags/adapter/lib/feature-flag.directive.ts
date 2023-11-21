import { Directive, Input, OnInit, ViewContainerRef, TemplateRef, ElementRef} from '@angular/core';
import { FeatureFlagRuntimeService } from './feature-flag-runtime.service';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[featureFlag]'
})
export class FeatureFlagDirective implements OnInit {

  private activeFlags: string | string[];
  private currentRef: TemplateRef<any>;

  /** Flags that must be active to show flagged html */
  @Input()
  set featureFlag(flags: string | string[]) {
    this.activeFlags = flags;
  }

  /** Template reference to the current html */
  @Input()
  set featureFlagCurrent(cur: TemplateRef<any>) {
    this.currentRef = cur;
  }


  constructor(
    private vcr: ViewContainerRef,
    private tpl: TemplateRef<any>,
    private ffRuntime: FeatureFlagRuntimeService
  ) { }

  ngOnInit() {
    this.vcr.remove();
    if (this.ffRuntime.isActive(this.activeFlags)) {
      this.vcr.createEmbeddedView(this.tpl);
    } else if (this.currentRef) {
      this.vcr.createEmbeddedView(this.currentRef);
    }
  }
}
