import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, ContentChildren, Inject, Input, QueryList } from '@angular/core';
import { Guid } from '@galileo/web_common-libraries';
import { NavigationService } from '../navigation.service';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'hxgn-main-menu-item',
    templateUrl: 'main-menu-item.component.html',
    styleUrls: ['main-menu-item.component.scss'],
    animations: [
        trigger('expansionState', [
            state('collapsed', style({
                height: '0',
                overflow: 'hidden'
            })),
            state('expanded', style({
                overflow: 'hidden'
            })),
            transition('collapsed=>expanded', animate('150ms')),
            transition('expanded=>collapsed', animate('150ms'))
        ]),
        trigger('rotateArrow', [
            state('collapsed', style({
                transform: 'rotate(-90deg)'
            })),
            state('expanded', style({
                transform: 'rotate(0deg)'
            })),
            transition('collapsed=>expanded', animate('150ms')),
            transition('expanded=>collapsed', animate('150ms'))
        ])
    ]
})
export class CommonMainMenuItemComponent implements AfterViewInit {

    /** Path to the image to display on the menu item */
    @Input() imageSrc: string;

    /** Path to the page associated with the menu item */
    @Input() routerLink: string;

    /** Whether or not to show the provisioner icon on the menu item. */
    @Input() isProvisioner = false;

    /** Gets any child menu items that a menu item may have */
    @ContentChildren(CommonMainMenuItemComponent, { descendants: true }) subItems !: QueryList<CommonMainMenuItemComponent>;

    /** Unique identifier for the menu item */
    id = Guid.NewGuid();

    /** True if this menu item has any sub menu items */
    hasSubItems: boolean;

    /** True if this menu items children are expanded */
    isExpanded = false;

    constructor(public navigationService: NavigationService) { }


    /** OnInit */
    ngAfterViewInit() {
        setTimeout(() => {
            this.hasSubItems = this.subItems.length > 0;
        });
    }

    /**
     * Returns whether the menu item's sub menu is expanded
     */
    getAnimationState(): string {
        return this.isExpanded ? 'expanded' : 'collapsed';
    }

    /** Handles a click event on the menu item by either navigating to a new page or expanding its sub menu */
    itemClicked() {
        if (this.routerLink) {
            this.followRoute();
        } else if (this.hasSubItems) {
                const currentState = this.isExpanded;
                this.subItems.forEach((subItem) => {
                    subItem.isExpanded = false;
                });
                this.isExpanded = !currentState;
        }
    }

    /** Navigates the user to a new page */
    followRoute(): void {
        this.navigationService.currentRouteId = this.id;
        this.navigationService.closeMainMenu();
        setTimeout(() => { this.navigationService.navigate(this.routerLink); }, 400);
    }
}
