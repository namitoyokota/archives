import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WazeSettingsInjectableComponent$v1, WazeSettings$v1 } from './waze-settings.component';
import * as jsc from 'jsverify';
import { TestConstants } from '@galileo/web_common-libraries';
import { ViewEditorSettings } from '@galileo/web_commonlayoutmanager/adapter';

describe('WazeSettingsComponent', () => {
    let component: WazeSettingsInjectableComponent$v1;
    const mockLocalization: any = jasmine.createSpyObj(['get']);
    const mockCdr: any = jasmine.createSpyObj(['get']);

    beforeEach(() => {
        const edSet = new ViewEditorSettings<WazeSettings$v1>();
        component = new WazeSettingsInjectableComponent$v1(edSet, mockLocalization, mockCdr);
        component.settings = {
            contextId: '',
            wazeUrl: 'https://www.waze.com',
            zoom: 0,
            latitude: 0,
            longitude: 0,
            enablePin: false,
            enablePortalFormatting: false
        };
    });

    it('should validate the input url is https', () => {
        component.wazeUrlIsValid = false;
        component.validateHttps();
        expect(component.wazeUrlIsValid).toBeTruthy();
    });

    it('should validate the input url is not https', () => {
        component.settings.wazeUrl = 'http://www.waze.com';
        component.wazeUrlIsValid = true;
        component.validateHttps();
        expect(!component.wazeUrlIsValid).toBeTruthy();
    });

    it('should validate that the input is not null and is a number', () => {
        jsc.assert(jsc.forall(jsc.integer, jsc.nat, (intNum, natNum) => {
            return component.validateNumber(intNum) && component.validateNumber(natNum);
        }), {
                tests: TestConstants.SmallTestRun
            });
    });

    it('should validate that the zoom is within the correct number range', () => {
        jsc.assert(jsc.forall(jsc.integer(3, 17), (num) => {
            component.zoomIsValid = false;
            component.settings.zoom = num;
            component.validateZoom(num);

            return component.zoomIsValid;
        }), {
                tests: TestConstants.SmallTestRun
            });
    });


    it('should validate that the zoom is not within the correct number range', () => {
        jsc.assert(jsc.forall(jsc.integer(18, 100), (num) => {
            component.zoomIsValid = true;
            component.settings.zoom = num;
            component.validateZoom(num);

            return !component.zoomIsValid;
        }), {
                tests: TestConstants.SmallTestRun
            });
    });

    it('should replace the zoom parameter in the url', () => {
        jsc.assert(jsc.forall(jsc.integer(3, 17), (num) => {
            const param = 'zoom';
            const url = 'https://embed.waze.com/iframe?zoom=3&lat=23&lon=23&pin=1&desc=1';
            component.settings.zoom = num;
            component.settings.wazeUrl = url;
            component.replaceParameter(param);

            const exists = component.settings.wazeUrl.indexOf(param + '=' + num) !== -1;

            return exists;
        }), {
                tests: TestConstants.SmallTestRun
            });
    });

    it('should replace the latitude parameter in the url', () => {
        jsc.assert(jsc.forall(jsc.number, (num) => {
            const param = 'lat';
            const url = 'https://embed.waze.com/iframe?zoom=3&lat=23&lon=23&pin=1&desc=1';
            component.settings.latitude = num;
            component.settings.wazeUrl = url;
            component.replaceParameter(param);

            const exists = component.settings.wazeUrl.indexOf(param + '=' + num) !== -1;

            return exists;
        }), {
                tests: TestConstants.SmallTestRun
            });
    });

    it('should replace the longitude parameter in the url', () => {
        jsc.assert(jsc.forall(jsc.number, (num) => {
            const param = 'lon';
            const url = 'https://embed.waze.com/iframe?zoom=3&lat=23&lon=23&pin=1&desc=1';
            component.settings.longitude = num;
            component.settings.wazeUrl = url;
            component.replaceParameter(param);

            const exists = component.settings.wazeUrl.indexOf(param + '=' + num) !== -1;

            return exists;
        }), {
                tests: TestConstants.SmallTestRun
            });
    });

    it('should replace the pin parameter in the url', () => {
        const param = 'pin';
        const url = 'https://embed.waze.com/iframe?zoom=3&lat=23&lon=23&pin=1&desc=1';
        component.settings.enablePin = false;
        component.settings.wazeUrl = url;
        component.replaceParameter(param);

        const exists = component.settings.wazeUrl.indexOf(param + '=0') !== -1;

        expect(exists).toBeTruthy();
    });


    it('should count the number of parameters in the url', () => {
        const url = 'https://embed.waze.com/iframe?zoom=3&lat=23&lon=23&pin=1&desc=1';
        component.settings.wazeUrl = url;
        const numParams = component.numberOfParameters();

        expect(numParams === 5).toBeTruthy();
    });

    it('should set the settings from the parameters in the url', () => {
        jsc.assert(jsc.forall(jsc.integer(3, 17), jsc.number, jsc.number, jsc.integer(0, 1), jsc.integer(0, 1),
                    (zoom, lat, lon, pin, desc) => {
                        const url: string = 'https://embed.waze.com/iframe?zoom=' + zoom + '&lat=' + lat + '&lon=' +
                                 lon + '&pin=' + pin + '&desc=' + desc;
                        component.settings.wazeUrl = url;
                        component.parseUrl();

                        const valid = (component.settings.zoom === zoom) && (component.settings.latitude === lat) &&
                                     (component.settings.longitude === lon) && (component.settings.enablePin === Boolean(Number(pin)));

                        return valid;
                    }), { tests: TestConstants.SmallTestRun});
    });

});
