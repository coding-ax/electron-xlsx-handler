import * as XLSX from 'xlsx'

export const excelToJsonV1 = (file, sheetName = ''): Promise<any> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e): void => {
      const data = e.target.result;
      const workbook = XLSX.read(data, {
        type: 'binary',
      });
      let jsonData = [];
      const ws = workbook.Sheets[sheetName? sheetName : workbook.SheetNames[0]];
      jsonData = XLSX.utils.sheet_to_json(ws);
      resolve(jsonData);
    };

    reader.onerror = (e): void => {
      console.error(e);
      reject(e);
    };

    reader.readAsBinaryString(file);
  });

 export const jsonToExcel = (fileName, sheetName, jsonList) => {
    const workSheet = XLSX.utils.json_to_sheet(jsonList);
    const workbook = {
      SheetNames: [sheetName],
      Sheets: {
        [sheetName]: workSheet,
      },
    };
    XLSX.writeFile(workbook, fileName);
  };