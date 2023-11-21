import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonDatepickerComponent } from './common-datepicker.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatRippleModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
    MatDatepickerModule,
    MatInputModule,
    MatRippleModule,
    MatMomentDateModule,
    FormsModule
  ],
  declarations: [
    CommonDatepickerComponent
  ],
  exports: [
    CommonDatepickerComponent
  ]
})
export class CommonDatepickerModule { }
