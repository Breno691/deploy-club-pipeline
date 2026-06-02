@echo off
cd /d "C:\Users\Breno Luiz\Desktop\claude  code"
node prospecting/send_daily.js >> outputs/prospecting/task_scheduler.log 2>&1
