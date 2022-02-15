

const client = require('pg/lib/native/client');
const { getData, getHeader, transGattToRawData, updateDateToSheet } = require('../Services/googleSheetService.js');
const sheetConfig = require('./Configs/sheetConfigs');

const pg = require('pg');
const config = {
    user:'postgres',
    database:'teamOperation',
    password:'kkday',
    host:'35.229.128.34',
    max:20, // 連線池最大連線數
    idleTimeoutMillis:3000, // 連線最大空閒時間 3s
}
var pool = new pg.Pool(config);


function executeQuery(queryString) {
    return new Promise((resolve,reject) => {
        pool.connect((err,client, done)=>{
            if (err) {
                reject(err.message);
            }
            client.query(queryString, (queryerr,result)=>{
                if (err) {
                    reject('[query issue]'+queryerr.message);
                }
                // console.log(result);
                // console.log(result.rows);
                if (result != null) {
                    resolve(result.rows);
                }else {
                    resolve(1);
                }
                
                done();
            });
        })
    });
}
//[ { proj_name: '首頁大分類', spent: 13, expected: 11, hasDone: '1' } ]
// function executeQuery2(queryString) {
//     async function query() {
//         var connect = await pool.connect();
//         try {
//             console.log('querry string : ' + queryString);
//             queryResult = await connect.query(queryString);
//             console.log(queryResult.rows);
//             console.log('try done');
//         } finally {
//             console.log('finally');
//             connect.release();
//         }
//     }
//     return query().catch(e => console.error(e.message, e.stack));
// }
async function insertData(projectName, projectType,createTime,team, developerName,humanDay,addExpectDay,isDone) {
    const queryString = `Insert INTO "TeamTasks" 
                ("proj_name","proj_type","create_time","${team}_developer","${team}_human_day","${team}_expect_day","is_${team}_done")
                Values 
                ('${projectName}','${projectType}','${createTime}','${developerName}',${humanDay},${addExpectDay},${isDone});`;
                // console.log(queryString);
    await executeQuery(queryString);
}
function insertTeamProgress(projectName, projectType,createTime,team, developerName,humanDay) {
    insertData(projectName,projectType,createTime,team,developerName,humanDay,0,0);
}
function addTask(projectName, projectType, createTime, team, developerName, expectDay) {
    insertData(projectName,projectType,createTime,team,developerName,0,expectDay,0);
}
function addExpectDay(projectName, team, expectDay,createTime) {
    //TODO : 取用原project資料
    insertData(projectName,"加估時",createTime,team,"",0,expectDay,0);
}
function projectDone(projectName, team) {
    //TODO : 取用原project資料
    
    insertData(projectName,"",createTime,team,"",0,0,1);
}
//[ { proj_name: '首頁大分類', spent: 13, expected: 11, hasDone: '1' } ]
async function getProjectProgressInfo(projectName, team) {
    let queryString = `Select "proj_name",SUM("${team}_human_day") as "spent",SUM("${team}_expect_day") as "expected",SUM("is_${team}_done") as "hasDone"
    from "TeamTasks"
    Where "proj_name" Like '${projectName}'
    GROUP BY "proj_name";`;
    return await executeQuery(queryString);
}
/*
[
  {
    id: 118,
    proj_name: '首頁大分類',
    proj_type: '需求',
    create_time: 2021-10-29T16:00:00.000Z,
    ios_human_day: 0,
    android_human_day: 0,
    web_human_day: 0,
    qa_human_day: 0,
    api_human_day: 0,
    ios_expect_day: 0,
    android_expect_day: 0,
    web_expect_day: 0,
    qa_expect_day: 0,
    api_expect_day: 0,
    is_ios_done: 0,
    is_android_done: 0,
    is_web_done: 0,
    is_qa_done: 0,
    is_api_done: 1,
    ios_developer: null,
    android_developer: null,
    web_developer: null,
    api_developer: 'Matt',
    qa_developer: null
  }
]
*/
async function getProjectDeveloperInfo(projectName, team) {
    let queryString = `Select *
    from "TeamTasks"
    Where "create_time" IN (
        select MIN("create_time")
        from "TeamTasks"
    ) and "proj_name" Like '${projectName}' and "${team}_developer" is not null;`;
    return await executeQuery(queryString);
}
async function getProjectDeveloperName(projectName, team) {
    let devInfo = await getProjectDeveloperInfo(projectName,team);
    return Array.from(devInfo,(data)=>{
        return data[`${team}_developer`];
    });
}
    
(async () => {
    // console.log('start');
    // const result = await getProjectProgressInfo("首頁大分類","ios")//.then((values)=>{console.log(values)});
    // const result = await getProjectDeveloperName("首頁大分類","api");
    // console.log('done result');
    // console.log(result);
    const docId = sheetConfig.excelDocID;
    const gattSheetId = sheetConfig.gattSheetID;
    const gattDatas = await getData(docId, gattSheetId);
    console.log(gattDatas);
    const gattHeaders = await getHeader(docId, gattSheetId);
    console.log(gattHeaders);
    
    let teamIndex = gattHeaders.indexOf('team');
    let developerNameIndex = gattHeaders.indexOf('developer_name');
    let projectNameIndex = gattHeaders.indexOf('project_name');
    let projectTypeIndex = gattHeaders.indexOf('project_type');
    let createTimeIndex = gattHeaders.indexOf('create_time');
    let addTimeProjIndex = gattHeaders.indexOf('add_time');
    let isDonIndex = gattHeaders.indexOf('is_done');

    async function insert(value,index){
        let team = value[teamIndex];
        let developerName = value[developerNameIndex];
        let projectName = value[projectNameIndex];
        let projectType = value[projectTypeIndex];
        let createTime = value[createTimeIndex];
        let addTime = value[addTimeProjIndex];
        let isDone = value[isDonIndex];
        let processTime = (addTime>0 || isDone>0) ? 0 : 1;
        await insertData(projectName, projectType,createTime,team, developerName,processTime,addTime,isDone);
    }
    gattDatas.forEach(insert);
    

})();

