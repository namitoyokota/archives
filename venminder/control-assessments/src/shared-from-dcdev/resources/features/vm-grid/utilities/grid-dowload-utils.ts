import type { IVmGridToCsvMap } from "../interfaces/vm-grid-interfaces";
import { CSVHelper } from "../../../../shared/utilities/csv-helper";
import moment from 'moment';
import { VmGridDateModel, VmGridNumberModel } from "./grid-filter-utils";
import numeral from "numeral";

export function getCsv(params: IVmGridToCsvMap) {
    let json = mapVmGridToJson({ ...params })
    let csv = new CSVHelper().convertJStoCSV(json)
    downloadCsv({ csv, filename: params.config.ButtonOptionsConfig.DownloadFilename })
}

function mapVmGridToJson(params: IVmGridToCsvMap): any[] {
    return params.data.map((gridRow: any) => {
        let columns = params.columns || params.config.ColumnDefinitions;

        return Object.assign({}, ...columns.map((gridColumn: any) => {
            if (gridColumn.ColumnFieldType.contains('action') || gridColumn.ExcludeFromDownload) {
                return null;
            }

            let value = gridRow[gridColumn.ColumnName];

            if (gridColumn.ColumnFieldType === 'address' && !!value) {
                let render = [
                    value.address,
                    value.address2,
                    [value.city, value.state].filter(el => el && el.length).join(', '),
                    value.phoneNumber
                ].filter(el => el && el.length).join(' ');

                value = (render.length) ? render : '';
            }
            else if (gridColumn.ColumnFieldType === 'boolean') {
                value = value ? gridColumn.ColumnValueConverter.TrueState : gridColumn.ColumnValueConverter.FalseState;
            }
            else if (gridColumn.ColumnFieldType === 'literal' && gridColumn.ColumnValueConverter) {
                value = !value ? gridColumn.ColumnValueConverter.ReplaceText : value
            }
            else if (gridColumn.ColumnFieldType === 'custom' && !!value) {
                let params = gridColumn.SearchModel?.Params;

                if (params) {
                    const formatText = params.displayFormatText || params.formatText;

                    switch (params.dataType) {
                        case 'number':
                            value = numeral(value).format(formatText);
                            break;
                        case 'date':
                            value = moment(value).format(formatText);
                            break;
                        case 'stringArray':
                            value = value.join(', ');
                            break;
                        case 'mappedArray':
                            value = value.map(params.func).join(', ');
                            break;
                        default:
                            break;
                    }
                }
            }

            return { [gridColumn.ColumnHeaderText]: value };
        }));
    });
}

function downloadCsv(params: { csv: string, filename: string }): void {
    let data = encode(params.csv);
    var exportFilename = params.filename + '.' + moment().format('YYYY-MM-DD') + '.csv';
    var csvData = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(csvData);
    link.setAttribute('download', exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function encode(data: any): Uint16Array {
    var out = [];
    for (var i = 0; i < data.length; i++) {
        out[i] = data.charCodeAt(i);
    }
    return new Uint16Array(out);
}