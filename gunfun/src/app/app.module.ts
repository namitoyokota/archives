import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NyDialogModule, NyInputModule } from '@namitoyokota/ng-components';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import {
    NbActionsModule,
    NbButtonModule,
    NbCardModule,
    NbCheckboxModule,
    NbContextMenuModule,
    NbDatepickerModule,
    NbDialogModule,
    NbFormFieldModule,
    NbIconModule,
    NbInputModule,
    NbLayoutModule,
    NbMenuModule,
    NbRadioModule,
    NbSelectModule,
    NbTagModule,
    NbThemeModule,
    NbToastrModule,
    NbToggleModule,
    NbTreeGridModule,
} from '@nebular/theme';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PrintItemComponent } from './components/print-item/print-item.component';
import { ColorFilterDialogComponent } from './dialogs/color-filter/color-filter.dialog';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { TypeFilterDialogComponent } from './dialogs/type-filter/type-filter.dialog';
import { AdminComponent } from './pages/admin/admin.component';
import { HistoryComponent } from './pages/history/history.component';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { PrintComponent } from './pages/print/print.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        PrintComponent,
        HistoryComponent,
        AdminComponent,
        NotFoundComponent,
        PrintItemComponent,
        ConfirmDialogComponent,
        ColorFilterDialogComponent,
        TypeFilterDialogComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        DragDropModule,
        AppRoutingModule,
        NyDialogModule,
        NyInputModule,
        NbThemeModule.forRoot({ name: 'default' }),
        NbLayoutModule,
        NbEvaIconsModule,
        NbIconModule,
        NbCardModule,
        NbInputModule,
        NbDatepickerModule.forRoot(),
        NbRadioModule,
        NbButtonModule,
        NbToastrModule.forRoot(),
        NbFormFieldModule,
        NbSelectModule,
        NbDialogModule.forRoot(),
        NbTagModule,
        NbTreeGridModule,
        NbMenuModule.forRoot(),
        NbContextMenuModule,
        NbActionsModule,
        NbCheckboxModule,
        NbToggleModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
