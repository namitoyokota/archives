import { Component, Input, OnInit } from '@angular/core';
import { ChangeOperation$v1, ChangeOperator$v1, Utils } from '@galileo/web_common-libraries';
import { RestrictIds$v1, Shape$v1 } from '@galileo/web_shapes/_common';

import { TranslationTokens } from './history-item.translation';

enum OperationProperties {
    name = 'Name',
    description = 'Description',
    filteringType = 'FilteringType',
    primaryContact = 'PrimaryContact',
    keywords = 'Keywords',
    properties = 'Properties',
    radius = 'Radius',
    coordinates = 'Coordinates',
    graphicsSettings = 'GraphicsSettings',
    centerPoint = 'CenterPoint',
    hyperlinks = 'Hyperlinks'
}

@Component({
    selector: 'hxgn-shapes-history-item',
    templateUrl: 'history-item.component.html',
    styleUrls: ['history-item.component.scss']
})
export class HistoryItemComponent implements OnInit {

    /** Whether or not to show the concise history item view */
    @Input() concise = false;

    /** Operations to display */
    @Input() operations: ChangeOperation$v1[];

    /** Expose change operator to html */
    changeOperator: typeof ChangeOperator$v1 = ChangeOperator$v1;

    /** Created shape object */
    createdShape: Shape$v1;

    /** Determines whether or not these operations are for the creation of an shape */
    isCreation = false;

    /** Expose operation properties to html */
    OperationProperties: typeof OperationProperties = OperationProperties;

    /** Expose restrict ids to html */
    RestrictIds: typeof RestrictIds$v1 = RestrictIds$v1;

    /** Expose translation tokens to html */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor() { }

    /** On init lifecycle hook */
    async ngOnInit() {
        const isCreation = this.operations[0]?.operator === ChangeOperator$v1.addition;
        if (isCreation) {
            this.isCreation = true;
            this.setShapeProperties();
        }
    }

    /** Whether or not to show the connector between icons */
    showConnector(index: number): boolean {
        let show = false;
        if (this.operations.length === 1) {
            return show;
        }

        const operations = Utils.deepCopy(this.operations);
        operations.splice(0, index);
        if (operations.length) {
            operations.forEach(operation => {
                if (this.operations[index].propertyName !== operation.propertyName) {
                    show = true;
                }
            });
        }

        return show;
    }

    /** Sets the required properties for the created shape card */
    private setShapeProperties(): void {
        const shape = {} as Shape$v1;

        const nameOperation = this.operations.find(x => x.propertyName === OperationProperties.name);
        if (nameOperation) {
            shape.name = nameOperation.value;
        }

        const radiusOperation = this.operations.find(x => x.propertyName === OperationProperties.radius);
        if (radiusOperation) {
            shape.radius = radiusOperation.value;
        }

        const coordinateOperation = this.operations.find(x => x.propertyName === OperationProperties.coordinates);
        if (coordinateOperation) {
            shape.coordinates = coordinateOperation.value;
        }

        const graphicsOperation = this.operations.find(x => x.propertyName === OperationProperties.graphicsSettings);
        if (graphicsOperation) {
            shape.graphicsSettings = graphicsOperation.value;
        }

        const descriptionOperation = this.operations.find(x => x.propertyName === OperationProperties.description);
        if (descriptionOperation) {
            shape.description = descriptionOperation.redact ? undefined : descriptionOperation.value;
        }

        const keywordsOperation = this.operations.find(x => x.propertyName === OperationProperties.keywords);
        if (keywordsOperation) {
            shape.keywords = keywordsOperation.redact ? undefined : keywordsOperation.value;
        }

        const primaryContactOperation = this.operations.find(x => x.propertyName === OperationProperties.primaryContact);
        if (primaryContactOperation) {
            shape.primaryContact = primaryContactOperation.redact ? undefined : primaryContactOperation.value;
        }

        const propertiesOperation = this.operations.find(x => x.propertyName === OperationProperties.properties);
        if (propertiesOperation) {
            shape.properties = propertiesOperation.redact ? undefined : propertiesOperation.value;
        }

        const hyperlinksOperation = this.operations.find(x => x.propertyName === OperationProperties.hyperlinks);
        if (hyperlinksOperation) {
            shape.hyperlinks = hyperlinksOperation.redact ? undefined : hyperlinksOperation.value;
        }

        this.createdShape = new Shape$v1(shape);
    }
}
