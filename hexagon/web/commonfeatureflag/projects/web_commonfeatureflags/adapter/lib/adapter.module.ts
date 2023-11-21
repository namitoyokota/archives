import { NgModule } from '@angular/core';
import { CommonfeatureflagsAdapterService$v1 } from './adapter.v1.service';
import { FeatureFlagDirective } from './feature-flag.directive';
import { FeatureFlagStyleDirective } from './feature-flag-style.directive';

@NgModule({
  imports: [],
  declarations: [
    FeatureFlagDirective,
    FeatureFlagStyleDirective
  ],
  exports: [
    FeatureFlagDirective,
    FeatureFlagStyleDirective
  ],
  providers: [
    CommonfeatureflagsAdapterService$v1
  ]
})
export class CommonfeatureflagsAdapterModule {
  constructor(private adapter: CommonfeatureflagsAdapterService$v1 ) {}
}
