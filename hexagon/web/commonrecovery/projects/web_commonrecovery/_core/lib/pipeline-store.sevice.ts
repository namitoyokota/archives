import { Injectable } from '@angular/core';
import { Pipeline$v1 } from '@galileo/web_commonrecovery/_common';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
/**
 * Service that stores the pipeline data state
 */
export class PipelineStoreService {

    /** Bus for pipeline list */
    private pipelines = new BehaviorSubject<Pipeline$v1[]>([]);

    /** Observable that emits when the list of pipelines changes */
    readonly pipelines$ = this.pipelines.asObservable();

    /** Bus for pipeline updated event */
    private updated = new Subject<Pipeline$v1>();

    /** Event that is raised when an pipeline is updated */
    readonly updated$: Observable<Pipeline$v1> = this.updated.asObservable();

    /**
     * Clears the pipeline store
     */
    clear(): void {
        this.pipelines.next([]);
    }

    /**
     * Concatenates a list of pipelines to the current store of pipelines. If any of the
     * Pipelines are already in the store they will be updated.
     * @param pipelines Array of pipelines to add to the current store of pipelines
     */
    concatenate(pipelines: Pipeline$v1[]): void {
        pipelines.forEach(pipeline => {
            this.upsert(pipeline);
        });
    }

    /**
     * Updates a pipeline in the store. If the pipeline is not in the store
     * it will be added.
     * @param pipeline The updated pipeline
     */
    upsert(pipeline: Pipeline$v1): void {
        const found = !!this.pipelines.getValue().find(i => i.runId === pipeline.runId);
        if (!found) {
            this.pipelines.next([...this.pipelines.getValue(), pipeline]);
        } else {
            this.pipelines.next(this.pipelines.getValue().map(item => {
                if (item.runId === pipeline.runId) {
                    item = pipeline;
                }
                return item;
            }));
        }
    }

    /**
     * Removes a pipeline for the store
     * @param id Pipeline id of the item to remove
     */
    remove(id: string): void {
        this.pipelines.next(this.pipelines.getValue().filter(item => {
            return item.runId !== id;
        }));
    }
}
