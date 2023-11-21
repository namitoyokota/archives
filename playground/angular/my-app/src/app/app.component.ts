import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { annotate, annotationGroup } from 'rough-notation';
import { RoughCanvas } from 'roughjs/bin/canvas';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
    /** Canvas Element for displaying Rough.js shapes */
    @ViewChild('shapeCanvas')
    shapeCanvas: ElementRef<HTMLCanvasElement>;

    /** Paragraph Element for displaying circle demo */
    @ViewChild('textParagraph1')
    textParagraph1: ElementRef<HTMLParagraphElement>;

    /** Paragraph Element for displaying box demo */
    @ViewChild('textParagraph2')
    textParagraph2: ElementRef<HTMLParagraphElement>;

    /** Paragraph Element for displaying underline demo */
    @ViewChild('textParagraph3')
    textParagraph3: ElementRef<HTMLParagraphElement>;

    /** After view lifecycle hook */
    ngAfterViewInit(): void {
        this.generateShapes();
        this.generateDecorations();
    }

    /**
     * Populates Rough.js shapes
     */
    private generateShapes(): void {
        const rc = new RoughCanvas(this.shapeCanvas.nativeElement);

        rc.circle(50, 50, 80, { fill: 'red' });
        rc.rectangle(120, 15, 80, 80, { fill: 'red' });
        rc.circle(50, 150, 80, {
            fill: 'rgb(10,150,10)',
            fillWeight: 3,
        });
        rc.rectangle(220, 15, 80, 80, {
            fill: 'red',
            hachureAngle: 60,
            hachureGap: 8,
        });
        rc.rectangle(120, 105, 80, 80, {
            fill: 'rgba(255,0,200,0.2)',
            fillStyle: 'solid',
        });
    }

    /**
     * Add Rough Notations to texts
     */
    private generateDecorations(): void {
        const annotation1 = annotate(this.textParagraph1.nativeElement, { type: 'circle', color: 'blue' });
        const annotation2 = annotate(this.textParagraph2.nativeElement, { type: 'box', color: 'red' });
        const annotation3 = annotate(this.textParagraph3.nativeElement, { type: 'underline', color: 'yellow' });

        const annGroup = annotationGroup([annotation1, annotation2, annotation3]);
        annGroup.show();
    }
}
