const xlsx = require("xlsx");
const fs = require("fs");
const { groupBy, flatten } = require("lodash");

const excelToJson = (fileName, sheetName, backupPath = "./test.json") => {
  if (fs.existsSync(backupPath)) {
    return JSON.parse(fs.readFileSync(backupPath, "utf-8"));
  }
  const workbook = xlsx.readFile(fileName);
  const workSheet = workbook.Sheets[sheetName];
  const result = xlsx.utils.sheet_to_json(workSheet);
  fs.writeFileSync(backupPath, JSON.stringify(result, null, 2), "utf-8");
  return result;
};

const jsonToExcel = (fileName, sheetName, jsonList) => {
  const workSheet = xlsx.utils.json_to_sheet(jsonList);
  const workbook = {
    SheetNames: [sheetName],
    Sheets: {
      [sheetName]: workSheet,
    },
  };
  xlsx.writeFile(workbook, fileName);
};

const checkData = (countryIndicatorMap) => {
  // 检查数据准确性
  const hasRepeatIndicator = Object.values(countryIndicatorMap).some(
    (item) => new Set(item).size !== item.length
  );
  console.log("准确性校验(是否存在重复指标)：", hasRepeatIndicator);
  // 开始做数据处理
  const allIndicators = [
    ...new Set(flatten(Object.values(countryIndicatorMap))),
  ];
  console.log("全指标合集：", allIndicators);
  return allIndicators;
};

const parseData = (jsonList) => {
  const usefulYear = new Array(2020 - 1996)
    .fill(0)
    .map((_, idx) => `${1997 + idx}`);
  const groupData = groupBy(jsonList, "Country Name");
  const countryNameToCode = Object.fromEntries(
    Object.entries(groupData).map(([k, v]) => [k, v?.[0]?.["Country Code"]])
  );
  const countryIndicatorMap = Object.fromEntries(
    Object.entries(groupData).map(([k, v]) => [
      k,
      v.map((v) => v?.["Indicator Name"]),
    ])
  );
  const allIndicators = checkData(countryIndicatorMap);
  // 生成这一年每一次的数据
  const result = []
  Object.entries(groupData).forEach(([countryName, rawData]) => {
    usefulYear.forEach(year => {
      const rawObjectData = rawData.reduce((prev, currentItem) => {
        const currentIndicatorName = currentItem?.["Indicator Name"];
        const currentYearData = currentItem?.[year] || undefined;
        if(currentIndicatorName){
          prev[currentIndicatorName] = currentYearData;
        }
        return prev;
      }, {})
      const item = {
        "Country Code": countryNameToCode?.[countryName],
        "Country Name": countryName,
        year,
        ...rawObjectData
      }
      result.push(item)
    })
  });
  console.log(result)
  return result;
};

const currentData = excelToJson("1.xlsx", "YDYL");
const result = parseData(currentData);
jsonToExcel('2.xlsx', 'Sheet1', result)
