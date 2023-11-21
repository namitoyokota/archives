import { AfterViewInit, Component, ComponentRef, EventEmitter, HostBinding, Input, OnDestroy, Output } from '@angular/core';
import { Guid } from '@galileo/web_common-libraries';
import {
  capabilityId as kCapabilityId,
  CompositeIconRequest$v1,
  IconRequest$v1,
  InjectableComponentNames,
} from '@galileo/web_commonkeywords/_common';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CommonkeywordsAdapterService$v1 } from '../../adapter.v1.service';

@Component({
  selector: 'hxgn-commonkeywords-composite-icon-v2',
  template: ``,
  styles: [
      `:host {
          display: flex;
          width: 100%;
          height: 100%;
      }`
  ]
})

export class CompositeIcon$v2Component implements AfterViewInit, OnDestroy {

  /** Id of the capability the icon is for */
  @Input('capabilityId')
  set setCapabilityId(id: string) {
    this.capabilityId.next(id);
  }

  /** Id of the industry the icon is for */
  @Input('industryId')
  set setIndustry(id: string) {
    this.industryId.next(id);
  }

  /** List of keywords that are used to get an icon */
  @Input('keywords')
  set setKeywords(k: string[]) {
    this.keywords.next(k);
  }

  /** Tenant that owns the data */
  @Input('tenantId')
  set setTenantId(id: string) {
    this.tenantId.next(id);
  }

  /** Height and width of icon */
  @Input('size')
  set setSize(s: number) {
    this.hostHeight = this.hostWidth = this.size = s;
    this.settings.size$.next(this.size);
  }

  /** Header text of the dropdown menu */
  @Input('title')
  set setTitle(t: string) {
    this.settings.title$.next(t);
  }

  /** Subtitle text of the dropdown menu */
  @Input('subtitle')
  set setDescription(s: string) {
    this.settings.subtitle$.next(s);
  }

  /** Keywords used to search icons */
  @Input('searchKeywords')
  set setSearchKeywords(k: string[]) {
    this.settings.keywords$.next(k);
  }

  /** Whether icon can be edited or not */
  @Input('editable')
  set setEditable(flag: boolean) {
    this.settings.editable$.next(flag);
  }

  /** Emits event when new icon selected */
  @Output() keywordsChange: EventEmitter<string[]> = new EventEmitter<string[]>();

  /** Height and width of icon */
  size = 30;

  /** Id of the capability the icon is for */
  private capabilityId = new BehaviorSubject<string>(null);

  /** Id of the industry the icon is for */
  private industryId = new BehaviorSubject<string>(null);

  /** List of keywords that are used to get an icon */
  private keywords = new BehaviorSubject<string[]>(null);

  /** Tenant that owns the data */
  private tenantId = new BehaviorSubject<string>(null);

  /** Portal host id */
  readonly componentId = 'comp_' + Guid.NewGuid();

  /** Reference to the injected component */
  private ref: ComponentRef<any>;

  /** Set the id attribute that will be used to inject a component */
  @HostBinding('attr.id') id = this.componentId;

  /** Set the width of the icon */
  @HostBinding('style.width.px') hostWidth = this.size;

  /** Set the height of the icon */
  @HostBinding('style.height.px') hostHeight = this.size;

  private settings = new IconRequest$v1();

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private layoutCompilerAdapter: LayoutCompilerAdapterService,
    private adapter: CommonkeywordsAdapterService$v1
  ) { }

  /** Function ran after view initialization. */
  async ngAfterViewInit() {
    combineLatest([
      this.tenantId,
      this.industryId,
      this.capabilityId,
      this.keywords
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([tenantId, industryId, capabilityId, keywords]) => {
      const request = new CompositeIconRequest$v1({
        tenantId, industryId, capabilityId, keywords
      });

      this.settings.icon$.next(request);
    });

    this.settings.keywordsChange$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((keywords: string[]) => {
        this.keywordsChange.emit(keywords);
    });

    this.adapter.waitOnCore().then(async () => {
      await this.injectComponentAsync();
    });
  }

  /** On destroy lifecycle hook */
  ngOnDestroy() {
    if (this.ref) {
        this.ref.destroy();
    }

    this.destroy$.next(true);
    this.destroy$.complete();
  }

  private async injectComponentAsync() {
    this.ref = await this.layoutCompilerAdapter.delegateInjectComponentPortalAsync(
        InjectableComponentNames.IconComponent,
        kCapabilityId, '#' + this.componentId, this.settings
    );
  }
}
