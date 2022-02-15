const { getData, getHeader, transGattToRawData, updateDateToSheet } = require('../Services/googleSheetService.js');
const config = require('./Configs/sheetConfigs');
(async () => {
    const docId = config.excelDocID;
    const gattSheetId = config.gattSheetID;
    const gattDatas = await getData(docId, gattSheetId);
    console.log(gattDatas);
    const gattHeaders = await getHeader(docId, gattSheetId);
    console.log(gattHeaders);
    
    //transfer Gatt to raw data
    const rawdata = transGattToRawData(gattHeaders, gattDatas);

    console.log(`raw data count : ${JSON.stringify(rawdata)}`);

    //update
    updateDateToSheet(docId,config.rawDataSheetID,rawdata);
})();