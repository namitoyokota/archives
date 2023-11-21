import { Component, OnInit, Input, OnDestroy, EventEmitter, Output } from '@angular/core';
import { MapDisplayPropertiesTranslationTokens } from './map-display-properties.translation';
import { MapPresetOptionName, DefaultHighlightStyle, DefaultSelectionStyle } from '@galileo/web_commonmap/_common';
import { CommonmapCoreService$v1 } from '../../commonmap-core.service';

@Component({
    selector: 'hxgn-commonmap-map-display-properties',
    templateUrl: './map-display-properties.component.html',
    styleUrls: ['./map-display-properties.component.scss']
})
export class MapDisplayPropertiesComponent implements OnInit {
    @Input() mapPreset;

    @Output() mapDisplayPropertyChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**  Expose translation tokens to html template */
    tokens: typeof MapDisplayPropertiesTranslationTokens = MapDisplayPropertiesTranslationTokens;

    transStrings = {};

    highlightLineColor: string;
    highlightFillColor: string;
    selectionLineColor: string; 
    selectionFillColor: string; 

    colorsSystemDefaults = true;

    constructor(private mapCoreSvc: CommonmapCoreService$v1) {}

    ngOnInit() {
        if (this.mapPreset) {
            this.highlightLineColor = this.getHighlightLineColor();
            this.highlightFillColor = this.getHighlightFillColor();
            this.selectionLineColor = this.getSelectionLineColor();
            this.selectionFillColor = this.getSelectionFillColor();

            this.areColorsSystemDefaults();
        }
    }

    fireMapDisplayPropertyChanged(name: string, value: any) {
        this.mapDisplayPropertyChanged.emit({name: name, value: value});
    }

    getHighlightLineColor(): string {
        let value;
        const mapOption = this.mapPreset.getOption(MapPresetOptionName.HighlightLineColor);
        if (mapOption) {
            value = this.mapCoreSvc.convertOptionStringValueToType(mapOption);
        }
        return(value);
    }

    getHighlightFillColor(): string {
        let value;
        const mapOption = this.mapPreset.getOption(MapPresetOptionName.HighlightFillColor);
        if (mapOption) {
            value = this.mapCoreSvc.convertOptionStringValueToType(mapOption);
        }
        return(value);
    }

    getSelectionLineColor() {
        let value;
        const mapOption = this.mapPreset.getOption(MapPresetOptionName.SelectionLineColor);
        if (mapOption) {
            value = this.mapCoreSvc.convertOptionStringValueToType(mapOption);
        }
        return(value);
    }

    getSelectionFillColor() {
        let value;
        const mapOption = this.mapPreset.getOption(MapPresetOptionName.SelectionFillColor);
        if (mapOption) {
            value = this.mapCoreSvc.convertOptionStringValueToType(mapOption);
        }
        return(value);
    }

    setHighlightLineColor(color: string) {
        this.mapPreset.upsertOption(MapPresetOptionName.HighlightLineColor, color);
        this.highlightLineColor = color;
        this.areColorsSystemDefaults();
        this.fireMapDisplayPropertyChanged('highlightColor', {lineColor: this.highlightLineColor, fillColor: this.highlightFillColor});
    }
    setHighlightFillColor(color: string) {
        this.mapPreset.upsertOption(MapPresetOptionName.HighlightFillColor, color);
        this.highlightFillColor = color;
        this.areColorsSystemDefaults();
        this.fireMapDisplayPropertyChanged('highlightColor', {lineColor: this.highlightLineColor, fillColor: this.highlightFillColor});
    }
    setSelectionLineColor(color: string) {
        this.mapPreset.upsertOption(MapPresetOptionName.SelectionLineColor, color);
        this.selectionLineColor = color;
        this.areColorsSystemDefaults();
        this.fireMapDisplayPropertyChanged('selectionColor', {lineColor: this.selectionLineColor, fillColor: this.selectionFillColor});
    }
    setSelectionFillColor(color: string) {
        this.mapPreset.upsertOption(MapPresetOptionName.SelectionFillColor, color);
        this.selectionFillColor = color;
        this.areColorsSystemDefaults();
        this.fireMapDisplayPropertyChanged('selectionColor', {lineColor: this.selectionLineColor, fillColor: this.selectionFillColor});
    }

    resetToDefault() {
        this.mapPreset.upsertOption(MapPresetOptionName.HighlightLineColor, DefaultHighlightStyle.color);
        this.highlightLineColor = DefaultHighlightStyle.color;
        this.mapPreset.upsertOption(MapPresetOptionName.HighlightFillColor, DefaultHighlightStyle.fillColor);
        this.highlightFillColor = DefaultHighlightStyle.fillColor;
        this.mapPreset.upsertOption(MapPresetOptionName.SelectionLineColor, DefaultSelectionStyle.color);
        this.selectionLineColor = DefaultSelectionStyle.color;
        this.mapPreset.upsertOption(MapPresetOptionName.SelectionFillColor, DefaultSelectionStyle.fillColor);
        this.selectionFillColor = DefaultSelectionStyle.fillColor;
        this.colorsSystemDefaults = true;
        this.fireMapDisplayPropertyChanged('highlightColor', {lineColor: this.highlightLineColor, fillColor: this.highlightFillColor});
        this.fireMapDisplayPropertyChanged('selectionColor', {lineColor: this.selectionLineColor, fillColor: this.selectionFillColor});
    }

    areColorsSystemDefaults() {
        if (this.highlightLineColor !== DefaultHighlightStyle.color ||
            this.highlightFillColor !== DefaultHighlightStyle.fillColor ||
            this.selectionLineColor !== DefaultSelectionStyle.color ||
            this.selectionFillColor !== DefaultSelectionStyle.fillColor) {
            this.colorsSystemDefaults = false;
        } else {
            this.colorsSystemDefaults = true;
        }

    }
}
