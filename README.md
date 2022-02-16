# B2CPDWeeklyReportScript

## 概述
順序上
1. 把週報甘特圖，貼到 Excel Gatt Sheet
2. Excel Gatt Sheet 上加入需要輸入資料的 DSL
3. 跑 `transferGattDataToRaw` 腳本，將 Excel Gatt Sheet 的資料匯入成 Excel Raw Data Sheet
4. 在 Excel Raw Data Sheet 整資料 及 debug
5. 跑 `dumpRawDataToTeamOperationDB` 將 Excel Raw Data Sheet 中的資料導入資料庫

![image](https://github.com/daniellee88888/B2CPDWeeklyReportScript/blob/master/readme_resource/relationShip.png)

## 使用
1. 開一個 google sheet，記下 docId
2. 開一個 Gatt Sheet，記下 sheetId ，並填上 team	developer_name 日期[2022-01-10	... YYYY-MM-DD]	add_time	done_project	new_project 等欄位
在甘特圖任務欄中名稱前置填上 @[proj_type]，換行當作指令結束．另外在 add_time, new_project 欄位填入 [proj_name]/[date]，同樣以換行當作指令結束．
![imgae](https://github.com/daniellee88888/B2CPDWeeklyReportScript/blob/master/readme_resource/GattDemo.png)

3. 開一個 raw data sheet ，記下 sheetId，並填上 team	developer_name	project_name	project_type	create_time	add_time	is_done 等欄位．
![image](https://github.com/daniellee88888/B2CPDWeeklyReportScript/blob/master/readme_resource/rawDataDemo.png)

最後在 /Resources/Commands/Configs/sheetConfigs.js 裡填入必要值以客製腳本表單．

## TODO
1. 整 code : db service 還沒從 dumpRawDataToTeamOperationDB 中分離．google token 還沒釋出．命令跟腳本服務還沒拆層．
2. Visuallize 月報輔助腳本
3. Include PM table.
