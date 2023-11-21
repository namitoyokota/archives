import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

import { CommonDropdownModule$v2 } from '../common-dropdown-v2/common-dropdown.module.v2';
import { CommonInputModule$v2 } from '../common-input-v2/common-input.module.v2';
import { CommonTimepickerComponent } from './common-timepicker.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    CommonInputModule$v2,
    CommonDropdownModule$v2
  ],
  declarations: [
    CommonTimepickerComponent
  ],
  exports: [
    CommonTimepickerComponent
  ]
})
export class CommonTimepickerModule { }
