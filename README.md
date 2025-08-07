# Financial-management 財務管理小助手

> 幫助用戶透過 Line 操作記帳、查詢支出，並同步雲端資料的財務管理小工具。  
> 專為行動使用者打造，支援即時訊息互動與多平台整合。

---

## 專案簡介

這是一個以 **Line Bot 為主要介面** 的財務管理 Side-project，用戶可以透過 Line 訊息快速記帳、查詢收支紀錄、設定預算與儲蓄目標。  
後端結合 FastAPI 與多種 AWS 雲端服務（如 Lambda、DynamoDB、S3），前端則採用 React + Tailwind CSS 製作管理介面。

本專案目標在於提供輕量、可擴充、適合日常使用的行動財務管理方式。

---

## 功能特色

- **Line Bot 記帳**：使用者可透過 Line 傳送訊息快速記帳
- **查詢功能**：查詢今天/本月的支出總額、類別統計等
- **設定儲蓄目標**：使用者可設定目標金額與時間，自動追蹤進度
- **資料雲端同步**：所有記錄自動儲存於 DynamoDB，支援跨設備查詢
- **Web 管理後台**：提供 React 打造的前端介面供用戶瀏覽、管理財務紀錄
- **定期背景任務**：透過 Celery 處理定期備份與提醒任務
- **資料視覺化（可選）**：可整合 Chart.js 顯示收支圖表

---

## 技術架構

- **前端:** React + Vite + Tailwind CSS
- **後端 API:** FastAPI
- **資料庫:** MongoDB（主）、MySQL（輔助處理）、Redis（快取）
- **容器化:** Docker、Docker Compose
- **非同步任務:** Celery
- **雲端服務:**
  - EC2：後端服務與 Celery 任務部署
  - S3：儲存備份資料與報表
  - DynamoDB：儲存記帳資料
  - Lambda + API Gateway：串接 Line Webhook
- **第三方整合:**
  - Line Login、Line Message API

---

## 專案部署

- 使用 Docker Compose 快速部署整體應用（含資料庫、FastAPI、前端）
- Webhook 採用 AWS Lambda + API Gateway 設定，支援 HTTPS 與高可用
- EC2 執行主應用與非同步任務，資料備份至 S3

---

## 專案畫面 / Demo

<!-- - Line 記帳畫面（待補）
- 前端報表截圖（待補）
- Demo Link：[https://your-demo-link](https://your-demo-link)（可選） -->

---

## 測試與開發細節

- API 測試使用 Postman 進行驗證
- Celery 任務以模擬資料進行效能測試
- 可擴充為 Pytest 自動化測試流程（未來規劃）

---

## Reference

`/reference` 資料夾內包含 Flask + sqlite3 的原型系統，作為初期快速開發與功能驗證使用。

---
