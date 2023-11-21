import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LayoutBuilderAdapterService$v1 } from './layout-builder-adapter.v1.service';

describe('LayoutBuilderAdapterService$v1', () => {
    let service: LayoutBuilderAdapterService$v1;
    const mockMailboxService = jasmine.createSpyObj(['getViewByBlockId']);

    beforeEach(() => {
        service = new LayoutBuilderAdapterService$v1(mockMailboxService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
