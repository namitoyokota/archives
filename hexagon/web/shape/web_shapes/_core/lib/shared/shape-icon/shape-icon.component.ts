import { Component, HostBinding, Input } from '@angular/core';
import { LineType$v1 } from '@galileo/web_common-libraries/graphical/line-type';

@Component({
  selector: 'hxgn-shapes-icon',
  template: '',
  styleUrls: ['shape-icon.component.scss']
})

export class ShapeIconComponent {

  /** Fill of shape icon */
  @Input('fillColor')
  @HostBinding('style.background-color') fillColor;

  /** Line color of the shape */
  @Input('lineColor')
  @HostBinding('style.border-color') lineColor;

  /** Css class for line type */
  @HostBinding('class') lineTypeClass;

  /** The line type of the shape */
  @Input('lineType')
  set setLineType(lType: LineType$v1) {
    this.lineTypeClass = lType.toString().toLowerCase();
  }

  constructor() { }
}
