import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TenantNameComponent } from './tenant-name.component';
import { IconModule } from '../tenant-icon/tenant-icon.module';

@NgModule({
    imports: [CommonModule, IconModule],
    exports: [TenantNameComponent],
    declarations: [TenantNameComponent],
    providers: [],
})
export class TenantNameModule { }
