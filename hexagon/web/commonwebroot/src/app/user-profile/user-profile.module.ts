import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileComponent } from './user-profile.component';
import { UserProfileModule as UserProfile } from '@galileo/web_commonidentity/app/admin/user-profile';
import { AppBarModule } from '../app-bar/app-bar.module';

@NgModule({
    imports: [
        CommonModule,
        UserProfile,
        AppBarModule
    ],
    exports: [
        UserProfileComponent
    ],
    declarations: [
        UserProfileComponent
    ]
})
export class UserProfileModule { }
