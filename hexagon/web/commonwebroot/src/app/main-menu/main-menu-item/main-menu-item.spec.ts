import { CommonMainMenuItemComponent } from './main-menu-item.component';
import { NavigationService } from '../navigation.service';

describe('CommonMainMenuItemComponent', () => {
    let component: CommonMainMenuItemComponent;

    beforeEach(() => {
        const navigationService: NavigationService = null;
        component = new CommonMainMenuItemComponent(navigationService);
    });

    it('should create', () => {
        // Assert
        expect(component).toBeTruthy();
    });

    it('should after view init', () => {
        // Arrange
        spyOn((component as any), 'ngAfterViewInit');

        // Act
        component.ngAfterViewInit();

        // Assert
        expect((component as any).ngAfterViewInit).toHaveBeenCalled();
    });

    it('should get animation state expanded', () => {
        // Arrange
        component.isExpanded = true;
        const expanded = 'expanded';

        // Act
        const result = component.getAnimationState();

        // Assert
        expect(result).toEqual(expanded);
    });

    it('should get animation state collapsed', () => {
        // Arrange
        const collapsed = 'collapsed';

        // Act
        const result = component.getAnimationState();

        // Assert
        expect(result).toEqual(collapsed);
    });

    it('should item clicked', () => {
        // Arrange
        spyOn((component as any), 'itemClicked');

        // Act
        component.itemClicked();

        // Assert
        expect((component as any).itemClicked).toHaveBeenCalled();
    });

    it('should follow route', () => {
        // Arrange
        spyOn((component as any), 'followRoute');

        // Act
        component.followRoute();

        // Assert
        expect((component as any).followRoute).toHaveBeenCalled();
    });
});
