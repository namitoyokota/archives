import { CommonTabComponent } from './tab.component';

describe('CommonTabComponent', () => {
    let component: CommonTabComponent;

    beforeEach(() => {
        component = new CommonTabComponent();
    });

    it('should create', () => {
        // Assert
        expect(component).toBeTruthy();
    });

    it('should init true', () => {
        // Assert
        component.theme = component.dark;

        // Act
        component.ngOnInit();

        // Assert
        expect((component.showDarkTheme)).toBeTruthy();
    });

    it('should init false', () => {
        // Act
        component.ngOnInit();

        // Assert
        expect((component.showDarkTheme)).toBeFalsy();
    });
});
