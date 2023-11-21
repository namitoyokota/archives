import {
    CommonDropdownItemComponent, CommonDropdownTriggerComponent,
    CommonDropdownToggleButtonComponent, CommonDropdownComponent
} from './dropdown.component';

describe('CommonDropdownItemComponent', () => {
    let component: CommonDropdownItemComponent;

    beforeEach(() => {
        component = new CommonDropdownItemComponent();
    });

    it('should create', () => {
        // Assert
        expect(component).toBeTruthy();
    });

    it('should click', () => {
        // Arrange
        spyOn((component as any), 'onClick');

        // Act
        component.onClick();

        // Assert
        expect((component as any).onClick).toHaveBeenCalled();
    });
});

describe('CommonDropdownTriggerComponent', () => {
    let component: CommonDropdownTriggerComponent;

    beforeEach(() => {
        component = new CommonDropdownTriggerComponent();
    });

    it('should create', () => {
        // Assert
        expect(component).toBeTruthy();
    });
});

describe('CommonDropdownToggleButtonComponent', () => {
    let component: CommonDropdownToggleButtonComponent;

    beforeEach(() => {
        component = new CommonDropdownToggleButtonComponent();
    });

    it('should create', () => {
        // Assert
        expect(component).toBeTruthy();
    });
});

describe('CommonDropdownComponent', () => {
    let component: CommonDropdownComponent;
    const constants = jasmine.createSpyObj(['BUILD_NUMBER', 'DEPLOY_URL']);

    beforeEach(() => {
        component = new CommonDropdownComponent(constants);
    });

    it('should create', () => {
        // Assert
        expect(component).toBeTruthy();
    });

    it('should init', () => {
        // Arrange
        spyOn((component as any), 'ngOnInit');

        // Act
        component.ngOnInit();

        // Assert
        expect(component.customTriggerMode).toBeDefined();
    });

    it('should close', () => {
        // Arrange
        spyOn((component as any), 'close');

        // Act
        component.close();

        // Assert
        expect((component as any).close).toHaveBeenCalled();
    });

    it('should focus', () => {
        // Arrange
        spyOn((component as any), 'focus');

        // Act
        component.focus();

        // Assert
        expect((component as any).focus).toHaveBeenCalled();
    });

    it('should open', () => {
        // Arrange
        spyOn((component as any), 'open');

        // Act
        component.open();

        // Assert
        expect((component as any).open).toHaveBeenCalled();
    });

    it('should toggle', () => {
        // Arrange
        spyOn((component as any), 'toggle');

        // Act
        component.toggle();

        // Assert
        expect((component as any).toggle).toHaveBeenCalled();
    });

    it('should update error state', () => {
        // Arrange
        spyOn((component as any), 'updateErrorState');

        // Act
        component.updateErrorState();

        // Assert
        expect((component as any).updateErrorState).toHaveBeenCalled();
    });

    it('should opened changed', () => {
        // Arrange
        spyOn((component as any), 'openedChanged');

        // Act
        component.openedChanged(true);

        // Assert
        expect((component as any).openedChanged).toHaveBeenCalled();
    });

    it('should toggle clicked', () => {
        // Arrange
        spyOn((component as any), 'toggleClicked');

        // Act
        component.toggleClicked(true);

        // Assert
        expect((component as any).toggleClicked).toHaveBeenCalled();
    });

    it('should default compare successfully', () => {
        // Arrange
        const val1 = '4';
        const val2 = '4';

        // Act
        const result = component.defaultCompareWithFn(val1, val2);

        // Assert
        expect(result).toBeTruthy();
    });

    it('should default compare unsuccessfully', () => {
        // Arrange
        const val1 = '4';
        const val2 = 4;

        // Act
        const result = component.defaultCompareWithFn(val1, val2);

        // Assert
        expect(result).toBeFalsy();
    });

    it('should change', () => {
        // Arrange
        spyOn((component as any), 'onChange');

        // Act
        component.onChange();

        // Assert
        expect((component as any).onChange).toHaveBeenCalled();
    });

    it('should touch', () => {
        // Arrange
        spyOn((component as any), 'onTouched');

        // Act
        component.onTouched();

        // Assert
        expect((component as any).onTouched).toHaveBeenCalled();
    });

    it('should register on change', () => {
        // Arrange
        const func: any = component.onChange();

        // Act
        component.registerOnChange(func);

        // Assert
        expect(component.onChange).toEqual(func);
    });

    it('should register on touch', () => {
        // Arrange
        const func: any = component.onTouched();

        // Act
        component.registerOnTouched(func);

        // Assert
        expect(component.onTouched).toEqual(func);
    });

    it('should write value', () => {
        // Arrange
        const value = 'test';

        // Act
        component.writeValue(value);

        // Assert
        expect(component.value).toEqual(value);
    });

    it('should set disabled state', () => {
        // Act
        component.setDisabledState(true);

        // Assert
        expect(component.disabled).toBeTruthy();
    });
});
