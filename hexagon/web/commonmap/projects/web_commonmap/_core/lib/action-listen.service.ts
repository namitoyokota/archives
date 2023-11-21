import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { mergeMap } from 'rxjs/operators';
import { CommonAdapterService$v1 } from '@galileo/web_common/adapter';

@Injectable()
export class ActionListenService {

    constructor(private commonAdapter: CommonAdapterService$v1) { }

    /**
     * Returns an observable that emits when selection changes
     * @param contextId The view's context id
     */
    onSelectionChange$(contextId: string) {
        return from(this.commonAdapter.selectChangeAsync(contextId)).pipe(
            mergeMap(bus => bus)
        );
    }

}

