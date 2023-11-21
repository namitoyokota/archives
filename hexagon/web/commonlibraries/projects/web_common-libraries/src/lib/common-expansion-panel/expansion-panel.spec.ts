import {
    CommonExpansionPanelContentComponent, CommonExpansionPanelTitleComponent,
    CommonExpansionPanelHeaderComponent, CommonExpansionPanelComponent
} from './expansion-panel.component';
import { ICommonConstants } from '../common-constants.interfaces';

describe('CommonExpansionPanelContentComponent', () => {
    let component: CommonExpansionPanelContentComponent;

    beforeEach(() => {
        component = new CommonExpansionPanelContentComponent();
    });

    it('should create', () => {
        // Assert
        expect(component).toBeTruthy();
    });
});

describe('CommonExpansionPanelTitleComponent', () => {
    let component: CommonExpansionPanelTitleComponent;

    beforeEach(() => {
        component = new CommonExpansionPanelTitleComponent();
    });

    it('should create', () => {
        // Assert
        expect(component).toBeTruthy();
    });
});

describe('CommonExpansionPanelHeaderComponent', () => {
    let component: CommonExpansionPanelHeaderComponent;

    beforeEach(() => {
        component = new CommonExpansionPanelHeaderComponent();
    });

    it('should create', () => {
        // Assert
        expect(component).toBeTruthy();
    });
});

describe('CommonExpansionPanelComponent', () => {
    let component: CommonExpansionPanelComponent;

    beforeEach(() => {
        const constants = <ICommonConstants>{ BUILD_NUMBER: '', DEPLOY_URL: ''};
        component = new CommonExpansionPanelComponent(constants);
    });

    it('should create', () => {
        // Assert
        expect(component).toBeTruthy();
    });

    it('should toggle', () => {
        // Arrange
        spyOn((component as any), 'toggle');

        // Act
        component.toggle();

        // Assert
        expect((component as any).toggle).toHaveBeenCalled();
    });

    it('should header toggle click', () => {
        // Act
        component.headerToggleClick();

        // Assert
        expect((component.panelState)).toBeDefined();
    });
});
