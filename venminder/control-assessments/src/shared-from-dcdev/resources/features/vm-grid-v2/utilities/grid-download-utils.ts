import type { IVmGridColumn, IVmGridToCsvMap } from "../interfaces/vm-grid-interfaces";
import { CSVHelper } from "../../../../shared/utilities/csv-helper";

export function getCsv(params: IVmGridToCsvMap) {
    let json = mapVmGridToJson({ ...params })
    const csvHelper = new CSVHelper();
    const csv = csvHelper.convertJStoCSV(json)
    csvHelper.downloadCsv({ csv, filename: params.Config.ButtonOptionsConfig.DownloadFilename })
}

function mapVmGridToJson(params: IVmGridToCsvMap): any[] {
  return params.Data.map((gridRow: any) => {
    let columns = params.Columns || params.Config.ColumnDefinitions;

    return Object.assign({}, ...columns.map((gridColumn: IVmGridColumn) => {
      if (gridColumn.ExcludeFromDownload) {
        return null;
      }

      let value = gridRow[gridColumn.ColumnName];

      if (!!gridColumn.Format) {
        value = gridColumn.Format(gridRow, gridColumn.ColumnName, gridColumn.ColumnValueConverter, true);
      }

      return { [gridColumn.ColumnHeaderText]: value };
    }));
  });
}
