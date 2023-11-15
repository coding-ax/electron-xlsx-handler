import { useState } from "react";
import "./App.css";
import {
  Upload,
  Button,
  Empty,
  Spin,
  Tooltip,
  Typography,
  Input,
} from "@douyinfe/semi-ui";
import { groupBy } from 'lodash'
import { IllustrationIdle } from "@douyinfe/semi-illustrations";
import { excelToJsonV1, jsonToExcel } from "./utils";
const emptyStyle = {
  padding: 30,
};

const parseData = (jsonList) => {
  const usefulYear = new Array(2020 - 1996)
    .fill(0)
    .map((_, idx) => `${1997 + idx}`);
  const groupData = groupBy(jsonList, "Country Name");
  const countryNameToCode = Object.fromEntries(
    Object.entries(groupData).map(([k, v]) => [k, v?.[0]?.["Country Code"]])
  );
  // 生成这一年每一次的数据
  const result = [];
  Object.entries(groupData).forEach(([countryName, rawData]) => {
    usefulYear.forEach((year) => {
      const rawObjectData = rawData.reduce((prev, currentItem) => {
        const currentIndicatorName = currentItem?.["Indicator Name"];
        const currentYearData = currentItem?.[year] || undefined;
        if (currentIndicatorName) {
          prev[currentIndicatorName] = currentYearData;
        }
        return prev;
      }, {});
      const item = {
        "Country Code": countryNameToCode?.[countryName],
        "Country Name": countryName,
        year,
        ...rawObjectData,
      };
      result.push(item);
    });
  });
  return result;
};

const centerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
};
function App() {
  const [uploadFileMeta, setUploadFileMeta] = useState<unknown>();
  const [loading, setLoading] = useState(false);
  const [sheetName, setSheetName] = useState('');
  const handleBtnClick = async () => {
    setLoading(true);
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve(1);
      }, 100)
    );
    try {
      const data = await excelToJsonV1(uploadFileMeta, sheetName);
      console.log(data);
      const result = parseData(data)
      console.log(result);
      jsonToExcel('culeLCX.xlsx', 'ax', result)
    } finally {
      setLoading(false);
    }
  };
  return (
    <Spin tip="解析中，占用时间可能比较长" spinning={loading}>
      <div style={centerStyle}>
        <Empty
          image={<IllustrationIdle style={{ width: 170, height: 170 }} />}
          description={
            <Typography.Text type="secondary">
              点击下方上传你的 Excel 文件
            </Typography.Text>
          }
          style={emptyStyle}
        />
        <div style={{ width: 250 }}>
          <Upload
            action=""
            style={{ width: "100%" }}
            customRequest={(metaInfo) => {
              setUploadFileMeta(metaInfo.fileInstance);
              metaInfo?.onSuccess?.(undefined);
            }}
            onRemove={() => {
              setUploadFileMeta(undefined);
            }}
            onClear={() => {
              setUploadFileMeta(undefined);
            }}
            draggable={true}
            dragMainText={"点击上传文件或拖拽文件到这里"}
            dragSubText="支持任意类型文件"
            limit={1}
            accept=".xlsx,.xls"
          ></Upload>
        </div>
        <Input style={{margin: '8px'}} value={sheetName} onChange={(v) => setSheetName(v)} prefix="单元表名称"  />
        {uploadFileMeta ? (
          <Button
            onClick={handleBtnClick}
            style={{ marginTop: 16 }}
            theme="solid"
          >
            执行转换
          </Button>
        ) : (
          <Tooltip content="请先上传你的文件">
            <Button
              disabled={!uploadFileMeta}
              style={{ marginTop: 16 }}
              theme="solid"
            >
              执行转换
            </Button>
          </Tooltip>
        )}
      </div>
    </Spin>
  );
}

export default App;
