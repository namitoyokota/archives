import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColorType$v1 } from '@galileo/web_common-libraries/graphical/color-selector';
import { LineType$v1 } from '@galileo/web_common-libraries/graphical/line-type';
import { ShapeGraphicsSettings$v1 } from '@galileo/web_shapes/_common';

import { GraphicsEditorTranslationTokens } from './graphics-editor.translation';

@Component({
  selector: 'hxgn-shapes-graphics-editor',
  templateUrl: 'graphics-editor.component.html',
  styleUrls: ['graphics-editor.component.scss']
})

export class GraphicsEditorComponent {

  /** Shape graphics settings that can be edited */
  @Input('graphics')
  set setGraphics(g: ShapeGraphicsSettings$v1) {
    this.graphics = new ShapeGraphicsSettings$v1(g);
  }

  /** A flag that is true if the editor is read only */
  @Input() readOnly = false;

  /** Graphics that is being edited */
  graphics: ShapeGraphicsSettings$v1;

  /** Event when graphic settings have been updated */
  @Output() graphicsUpdated = new EventEmitter<ShapeGraphicsSettings$v1>();

  /** Expose GraphicsEditorTranslationTokens to HTML */
  tokens: typeof GraphicsEditorTranslationTokens = GraphicsEditorTranslationTokens;

  /** Fill or line */
  colorType: typeof ColorType$v1 = ColorType$v1;

  constructor() { }

  /**
   * Sets the given line type
   * @param line The line type to set
   */
  setLineType(line: LineType$v1): void {
    this.graphicsUpdated.emit(new ShapeGraphicsSettings$v1({...this.graphics, lineType: line}));
  }

  /**
   * Sets the given line weight
   * @param weight The line weight to set
   */
  setLineWeight(weight: number): void {
    this.graphicsUpdated.emit(new ShapeGraphicsSettings$v1({...this.graphics, lineWeight: weight}));
  }

  /**
   * Sets the line color
   * @param color Color to set for the line color
   */
  setLineColor(color: string): void {
    this.graphicsUpdated.emit(new ShapeGraphicsSettings$v1({...this.graphics, lineColor: color}));
  }


  /**
   * Sets the fill color
   * @param color Color to set for the line color
   */
  setFillColor(color: string): void {
    this.graphicsUpdated.emit(new ShapeGraphicsSettings$v1({...this.graphics, fillColor: color}));
  }
}
