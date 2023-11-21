import moment from "moment";

export class CSVHelper {
    stringToCSVsafeString(obj) {
        var str = String(obj || '');
        var regexDateTime = /\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d/;
        var regexDateZeroTime = /(\d\d\d\d-\d\d-\d\d)T[0]+:[0]+:[0]+/;
        if (regexDateZeroTime.test(str))
            str = str.substring(0, 10);
        else if (regexDateTime.test(str))
            str = String(str).replace("T", " ");
        return '"' + String(str).replace('"', '\"') + '"';
    };

    convertJStoCSV(obj) {
        if (!Array.isArray(obj))
            return "";
        var csvbody = "";
        var csvhead = "";
        let firstRow = obj[0];
        var keys = [];

        for (var key in firstRow) {
            if (firstRow.hasOwnProperty(key)) keys.push(key);
            csvhead += this.stringToCSVsafeString(key) + ",";
        }

        for (var j = 0; j < obj.length; j++) {
            var row = "";
            for (var i = 0; i < keys.length; i++) {
                row += this.stringToCSVsafeString(obj[j][keys[i]]) + ",";
            }
            csvbody += row + "\n";
        }
        return csvhead + "\n" + csvbody;
    };

    downloadCsv(params: { csv: string, filename: string }): void {
        let data = this.encode(params.csv);
        var exportFilename = params.filename + '.' + moment().format('YYYY-MM-DD') + '.csv';
        var csvData = new Blob([data], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(csvData);
        link.setAttribute('download', exportFilename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    encode(data: any): Uint16Array {
        var out = [];
        for (var i = 0; i < data.length; i++) {
            out[i] = data.charCodeAt(i);
        }
        return new Uint16Array(out);
    }
}