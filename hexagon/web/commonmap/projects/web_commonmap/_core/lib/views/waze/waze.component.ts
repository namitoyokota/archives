import { Component, AfterViewInit,
  Injector, Input, Inject, OnInit } from '@angular/core';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { WazeSettings$v1 } from '../waze-settings/waze-settings.component';
import { PortalInjector } from '@angular/cdk/portal';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as Common from '@galileo/web_commonmap/_common';
import { Guid } from '@galileo/web_common-libraries';

@Component({
  templateUrl: './waze.component.html',
  styleUrls: ['./waze.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class WazeComponent$v1 implements OnInit {
  @Input() settings: WazeSettings$v1;
  url: SafeResourceUrl;

  constructor(public sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.settings.wazeUrl);
  }

}

@Component({
    templateUrl: './waze.component.html',
    styleUrls: ['./waze.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class WazeInjectableComponent$v1 extends WazeComponent$v1 {
  constructor(@Inject(Common.LAYOUT_MANAGER_SETTINGS) public settings: WazeSettings$v1, public sanitizer: DomSanitizer) {
    super(sanitizer);
  }
}


