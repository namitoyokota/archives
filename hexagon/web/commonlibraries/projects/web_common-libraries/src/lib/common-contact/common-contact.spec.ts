import { CommonContactComponent } from './common-contact.component';

describe('CommonContactComponent', () => {
    let component: CommonContactComponent;
    const mockLocalizationSrv = jasmine.createSpyObj(['localizeStringsAsync']);

    beforeEach(() => {
        component = new CommonContactComponent(mockLocalizationSrv);
    });

    it('should create', () => {
        // Assert
        expect(component).toBeTruthy();
    });

    it('should init localization', () => {
        // Arrange
        spyOn((component as any), 'initLocalization');

        // Act
        component.ngOnInit();

        // Assert
        expect(component.tokens).toBeDefined();
    });
});
