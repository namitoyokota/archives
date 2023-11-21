import {
    Component,
    ElementRef,
    AfterViewInit,
    Renderer2,
    HostListener,
    ViewChild,
    Output,
    EventEmitter
} from '@angular/core';

@Component({
    selector: 'hxgn-common-media-grid-cell',
    templateUrl: 'media-cell.component.html',
    styleUrls: ['media-cell.component.scss']
})
export class MediaCellComponent implements AfterViewInit {

    private readonly maxWidth = 595;
    private readonly maxHeight = 379;

    /** Ref to cell */
    @ViewChild('cell') cellRef: ElementRef;

    /** Event when the with changes */
    @Output() width = new EventEmitter<number>();

    /** Fired when window is resized */
    @HostListener('window:resize', ['$event.target'])
    public onResize(target) {
        this.adjustSize();
    }

    constructor(private elRef: ElementRef,
        private renderer: Renderer2
    ) { }

    /** OnInit */
    ngAfterViewInit(): void {
        // Wait for next angular tick
        setTimeout(() => {
            this.adjustSize();
        });
    }

    private adjustSize() {
        const nativeWidth: number = this.elRef.nativeElement.offsetWidth;
        const adjustedWidth: number = nativeWidth > this.maxWidth ? this.maxWidth : nativeWidth;

        const adjustedHeight = adjustedWidth * (this.maxHeight / this.maxWidth);

        this.renderer.setStyle(this.cellRef.nativeElement, 'width', adjustedWidth + 'px');
        this.renderer.setStyle(this.cellRef.nativeElement, 'height', adjustedHeight + 'px');
        this.width.emit(adjustedWidth);
    }
}
