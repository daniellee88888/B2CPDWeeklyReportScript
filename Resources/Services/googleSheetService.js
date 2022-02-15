// googleSheet.js

const { type } = require('express/lib/response');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const credentialsFilePath = './kkdayb2cproddevteamop202112-c01206c19bb4.json';

/**
 * @param  {String} docID the document ID
 * @param  {String} sheetID the google sheet table ID
 * @param  {String} credentialsPath the credentials path defalt is './credentials.json'
 */
async function getData(docID, sheetID, credentialsPath = credentialsFilePath) {
  const result = [];
  const doc = new GoogleSpreadsheet(docID);
  const creds = require(credentialsPath);
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  const sheet = doc.sheetsById[sheetID];
  const rows = await sheet.getRows();
  for (row of rows) {
    result.push(row._rawData);
  }
  return result;
};

/**
 * @param  {String} docID the document ID
 * @param  {String} sheetID the google sheet table ID
 * @param  {String} credentialsPath the credentials path defalt is './credentials.json'
 */
 async function getHeader(docID, sheetID, credentialsPath = credentialsFilePath) {
    const result = [];
    const doc = new GoogleSpreadsheet(docID);
    const creds = require(credentialsPath);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsById[sheetID];
    const rows = await sheet.getRows(); // fetch sheet
    const headers = sheet.headerValues;
    return headers;
};

function parseProjectName(str) {
	var regularExp = /@[[\u4e00-\u9fa5a-zA-Z0-9]+]/g;
    let typeToken = str.match(regularExp);//.toString();
    if (typeToken==null) {return ['',str];}
    let typeTokenStr = typeToken.toString();
    let typeStr = typeTokenStr.replace("@[","").replace("]","");
    let newStr = str.replace(typeTokenStr,"");
    return [typeStr,newStr];
}

/**transfer Gatt to raw data
 * @param  {Array} gattHeaders gatt headers in sheets
 * @param  {Array} gattDatas datas that confirms to gattHeaders
 */
function transGattToRawData(gattHeaders, gattDatas){
    const rawdata = [];
    let keyDeveloperName = 'developer_name';
    let keyTeam = 'team';
    let keyAddTimeProject = 'add_time';
    let keyDoneProject = 'done_project';
    let keyNewProject = 'new_project';
    let developNameIndex = gattHeaders.indexOf(keyDeveloperName);
    let teamIndex = gattHeaders.indexOf(keyTeam);
    let addTimeProjIndex = gattHeaders.indexOf(keyAddTimeProject);
    let doneProjIndex = gattHeaders.indexOf(keyDoneProject);
    let newProjectIndex = gattHeaders.indexOf(keyNewProject);
    for (const [index, gattData] of Object.entries(gattDatas)) {
        /*
        {
            team:"",
            developer_name:"",
            project_name:"",
            project_type:"",
            create_time:""
        }
        */ 
        let team = gattData[teamIndex];
        let develop_name = gattData[developNameIndex];
        const reserveKeys = [keyTeam,keyDeveloperName];
        // console.log(`gattData : ${gattData}`);
        // console.log(`reserveKeys : ${reserveKeys}`);
        console.log(`devlopname1 : ${develop_name}`);
        console.log(`devlopname1 : ${develop_name}`);
        let lastCreateTime;
        for (const [index, value] of Object.entries(gattData)) {
            if (reserveKeys.includes(gattHeaders[index])){ continue; }
            let isAddTimeProjs = index == addTimeProjIndex;
            let isDoneProjs = index == doneProjIndex;
            let isNewProjs = index == newProjectIndex;
            let create_time = gattHeaders[index];
            if (isAddTimeProjs || isDoneProjs || isNewProjs) {
                create_time = lastCreateTime;
            }else {
                lastCreateTime = create_time;
            }
            let projectNames = value.split('\n');
            console.log(`devlopname2 : ${develop_name}`);
            
            projectNames.forEach(rowValue => {
                let projType = '需求', addTime = 0, isDone = 0, projName = rowValue;

                if (isAddTimeProjs) {
                    projType = '加估時';
                    console.log(rowValue);
                    let [proj, addT] = rowValue.split('/');
                    if (proj == null || addT == null) {return;}
                    console.log(`加時：${proj}, ${addTime}`);
                    projName = proj;
                    addTime = addT;
                    create_time = null;
                }else if (isDoneProjs) {
                    isDone = 1;
                    create_time = null;
                }else if (isNewProjs) {
                    let [proj, addT] = rowValue.split('/');
                    if (proj == null || addT == null) {return;}
                    projName = proj;
                    addTime = addT;
                }

                const [type,newProjName] = parseProjectName(projName);
                if (type.length > 0) {
                    projType = type;
                    projName = newProjName;
                }
                if (projName.toString().length <= 0 || projName==null) {return;}
                const newData = {
                    'team':team,
                    'developer_name':develop_name,
                    'project_name':projName,
                    'project_type':projType,
                    'create_time':create_time,
                    'add_time':addTime,
                    'is_done':isDone
                }
                console.log(`devlopname3 : ${develop_name}`);
                console.log(`push data : ${JSON.stringify(newData)}`);
                rawdata.push(newData);
            });
        }
    }
    return rawdata;
}
/**
 * @param  {String} docID the document ID
 * @param  {String} sheetID the google sheet table ID
 * @param  {String} credentialsPath the credentials path defalt is './credentials.json'
 * @param  {String:String|number|bool} rawdata sheet data
 * array of row values as either:
     * - an object of header and value pairs (relative to the worksheet header columns)
     * - an array of values in column order
*/
async function updateDateToSheet(docID, sheetID, rawdata, credentialsPath = credentialsFilePath) {
    const doc = new GoogleSpreadsheet(docID);
    const creds = require(credentialsPath);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsById[sheetID];
    sheet.addRows(rawdata);
}

module.exports = {
  getData,
  getHeader,
  transGattToRawData,
  updateDateToSheet
};