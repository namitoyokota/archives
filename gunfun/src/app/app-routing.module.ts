import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './pages/admin/admin.component';
import { HistoryComponent } from './pages/history/history.component';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { PrintComponent } from './pages/print/print.component';

const routes: Routes = [
    {
        path: 'home',
        title: 'GunFun | Dashboard',
        component: HomeComponent,
    },
    {
        path: 'history',
        title: 'GunFun | History',
        component: HistoryComponent,
    },
    {
        path: 'admin',
        title: 'GunFun | Administrator',
        component: AdminComponent,
    },
    {
        path: 'print/:id',
        title: 'GunFun | Target Press Production Form',
        component: PrintComponent,
    },
    {
        path: 'print',
        title: 'GunFun | Target Press Production Form',
        component: PrintComponent,
    },
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full',
    },
    { path: '**', pathMatch: 'full', component: NotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
