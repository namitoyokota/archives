import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonFaultPoliciesService } from './fault-policies.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [CommonFaultPoliciesService]
})
export class CommonFaultPoliciesModule { }
