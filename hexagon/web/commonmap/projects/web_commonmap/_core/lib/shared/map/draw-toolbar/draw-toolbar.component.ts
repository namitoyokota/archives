import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonfeatureflagsAdapterService$v1 } from '@galileo/web_commonfeatureflags/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Draw, FeatureFlags, Geometry$v1, GeometryType$v1 } from '@galileo/web_commonmap/_common';
import { Observable, Subject, Subscription } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

import { DrawToolbarTranslatedTokens, DrawToolbarTranslationTokens } from './draw-toolbar.translation';


@Component({
    selector: 'hxgn-commonmap-draw-toolbar',
    templateUrl: 'draw-toolbar.component.html',
    styleUrls: ['draw-toolbar.component.scss']
})

export class DrawToolbarComponent implements OnInit, OnDestroy {

    /**
     * Digitizer used to draw geometry
     */
    @Input('digitizer')
    set setDigitizer(d: Draw) {
        this.digitizer = d;
        this.canUndo$ = this.digitizer.canUndo$;
        this.canRedo$ = this.digitizer.canRedo$;
        this.geometry$ = this.digitizer.geometry$;

        this.digitizer.toggleEdit(true);

        if (this.radiusChangeSub) {
            this.radiusChangeSub.unsubscribe();
            this.radiusChangeSub = null;
        }

        this.radius = null;

        this.radiusChangeSub = this.digitizer.radiusChange$.subscribe(r => {
            this.radius = r;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
        });

        if (this.geoChangeSub) {
            this.geoChangeSub.unsubscribe();
            this.geoChangeSub = null;
        }

        this.geoChangeSub = this.digitizer.geometry$.subscribe(g => {
            if (g?.type) {
                this.selectedShape = g.type;
            } else {
                this.selectedShape = null;
            }
        });
    }

    /** The selected shape */
    selectedShape: GeometryType$v1;

    /** Title to show on draw toolbar */
    @Input() toolbarTitle: string;

    /** A flag that is true if the done button should be hidden */
    @Input() persistentEdit: boolean;

    /** Event when draw id done */
    @Output() done = new EventEmitter<Geometry$v1>();

    /** The draw digitizer */
    digitizer: Draw;

    /** Can a draw step be undone */
    canUndo$: Observable<boolean>;

    /** Can a draw step be redone */
    canRedo$: Observable<boolean>;

    /** The current draw geometry */
    geometry$: Observable<Geometry$v1>;

    /** Shapes that can be drawn */
    shapes = [
        GeometryType$v1.polygon,
        GeometryType$v1.rectangle,
        GeometryType$v1.circle
    ];

    /** Expose GeometryType$v1 to HTML */
    geometryType: typeof GeometryType$v1 = GeometryType$v1;

    /** List of translated tokens. */
    tTokens: DrawToolbarTranslatedTokens = {} as DrawToolbarTranslatedTokens;

    /** Expose DrawToolbarTranslationTokens to HTML */
    tokens: typeof DrawToolbarTranslationTokens = DrawToolbarTranslationTokens;

    /** Radius of a circle in km */
    radius: number;

    private radiusChangeSub: Subscription;

    private geoChangeSub: Subscription;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private localizationAdapter: CommonlocalizationAdapterService$v1,
        private ffAdapter: CommonfeatureflagsAdapterService$v1,
        private cdr: ChangeDetectorRef
    ) { }

    /**
     * On init lifecycle hook
     */
    ngOnInit() {
        this.initLocalization();

        const lineFF = this.ffAdapter.isActive(FeatureFlags.Line);
        if (lineFF) {
            this.shapes = [...this.shapes, GeometryType$v1.line];
        }

        this.localizationAdapter.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });
    }

    /**
     * On Destroy lifecycle hook
     */
    ngOnDestroy(): void {
        if (!this.persistentEdit) {
            this.geometry$.pipe(first()).subscribe(g => {
                if (!g) {
                    this.cancelDraw();
                } else {
                    this.completeDraw();
                }
            });
        }

        if (this.radiusChangeSub) {
            this.radiusChangeSub.unsubscribe();
            this.radiusChangeSub = null;
        }

        if (this.geoChangeSub) {
            this.geoChangeSub.unsubscribe();
            this.geoChangeSub = null;
        }

        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Undo last draw
     */
    undo(): void {
        this.digitizer.undo();

        this.digitizer.canUndo$.pipe(
            first()
        ).subscribe(canUndo => {
            if (!canUndo) {
                this.undoAll();
            }
        });
    }

    /**
     * Redo last undone draw
     */
    redo(): void {
        this.digitizer.redo();
    }

    /**
     * Cancel drawing geometry
     */
    cancelDraw(): void {
        this.selectedShape = null;
        this.digitizer.cancel();
    }

    /**
     * Complete drawing geometry
     */
    completeDraw(): void {
        this.digitizer.toggleEdit(false);

        // Cancel draw if no geometry
        this.geometry$.pipe(
            first()
        ).subscribe(g => {
            if (!g) {
                this.digitizer.cancel();
            }
            this.done.emit(g);
        });
    }

    /**
     * Undo all changes
     */
    undoAll(): void {
        this.digitizer.undoAll();

        if (this.selectedShape) {
            this.drawShape(this.selectedShape);
        }
    }

    /**
     * Start draw shape
     * @param shape Shape to draw
     */
    drawShape(shape: GeometryType$v1): void {
        this.selectedShape = shape;
        this.digitizer.draw(shape);

        const isLine = this.selectedShape === GeometryType$v1.line;
        if (isLine) {
            this.radius = 2;
        }
    }

    /**
     * Gets title for specified shape
     * @param shape Shape to get title for
     */
    getTitle(shape: GeometryType$v1): string {
        switch (shape) {
            case GeometryType$v1.circle:
                return this.tTokens.circle;
            case GeometryType$v1.polygon:
                return this.tTokens.polygon;
            case GeometryType$v1.rectangle:
                return this.tTokens.rectangle;
            case GeometryType$v1.line:
                return this.tTokens.line;
        }
    }

    /**
     * Sets the geometry on the geometry
     */
    setRadius(): void {
        // Validate radius
        if (!this.validateRadius()) {
            return;
        }

        this.geometry$.pipe(first()).subscribe(g => {
            if (g) {
                const updatedGeometry = g;
                updatedGeometry.radius = this.radius * 1000; // Convert km to m

                // Limit to 2 decimal places
                if (this.radius) {
                    this.radius = +parseFloat(this.radius.toString()).toFixed(2);
                }

                this.digitizer.updateGeometryEdit(updatedGeometry);
            }
        })
    }

    /**
     * Limit to 2 decimal places
     */
    limit(): void {
        if (this.radius) {
            this.radius = +parseFloat(this.radius.toString()).toFixed(2);
        }
    }

    /**
     * Returns true if the given radius is valid
     */
    validateRadius(): boolean {
        return !(!this.radius || this.radius < 0.1 ||
            this.radius > 9999 || isNaN(this.radius));
    }

    /**
     * Init localization of string
     */
    private async initLocalization(): Promise<void> {
        const tokens: string[] = Object.values(DrawToolbarTranslationTokens);
        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);

        this.tTokens.circle = translatedTokens[DrawToolbarTranslationTokens.circle];
        this.tTokens.clickAndDrag = translatedTokens[DrawToolbarTranslationTokens.clickAndDrag];
        this.tTokens.clickTheFirstPointToFinish = translatedTokens[DrawToolbarTranslationTokens.clickTheFirstPointToFinish];
        this.tTokens.clickToAddMorePoints = translatedTokens[DrawToolbarTranslationTokens.clickToAddMorePoints];
        this.tTokens.clickToStartDrawing = translatedTokens[DrawToolbarTranslationTokens.clickToStartDrawing];
        this.tTokens.polygon = translatedTokens[DrawToolbarTranslationTokens.polygon];
        this.tTokens.rectangle = translatedTokens[DrawToolbarTranslationTokens.rectangle];
        this.tTokens.line = translatedTokens[DrawToolbarTranslationTokens.line];
        this.tTokens.redo = translatedTokens[DrawToolbarTranslationTokens.redo];
        this.tTokens.releaseToFinish = translatedTokens[DrawToolbarTranslationTokens.releaseToFinish];
        this.tTokens.startOver = translatedTokens[DrawToolbarTranslationTokens.startOver];
        this.tTokens.undo = translatedTokens[DrawToolbarTranslationTokens.undo];
        this.tTokens.drawToolbarTitle = translatedTokens[DrawToolbarTranslationTokens.drawToolbarTitle];
        this.tTokens.noIntersect = translatedTokens[DrawToolbarTranslationTokens.noIntersect];

        if (!this.toolbarTitle) {
            this.toolbarTitle = this.tTokens.drawToolbarTitle;
        }
    }
}
