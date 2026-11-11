# 🎙️ 《喜閱龍的3分鐘圖書館奇遇》好書推薦與 Podcast 講稿平台 (GitHub Pages 版)

> **新北市龍埔國小 閱讀推廣 Podcast 系列專用**  
> **100% 免費、免主機伺服器、支援 GitHub Pages 隨開即用**

---

## 🌟 平台核心特色

1. **國小學童注音模式 (Zhuyin Mode)**：
   - 頂部一鍵開關，介面標題、欄位、提示、按鈕與喜閱龍對話氣泡自動加上國小標準注音符號 `<ruby>字<rt>ㄗˋ</rt></ruby>`。
   - **即時注音推薦卡片 (Live Ruby Preview)**：學童輸入書名與特色時，右側卡片即時自動加上注音展示！
2. **教師通行密碼隔絕 (防學童誤入)**：
   - 工作台預設具備通行碼保護（預設密碼：`115`，代表 115 課研組）。
   - 支援學生專用網址：`?mode=student`（完全隱藏工作台入口，徹底隔絕）。
3. **版面寬度全面自適應**：
   - 不產生左右水平拉條，在平板、手機或桌機上皆能流暢操作。
4. **複合聲學參數調校**：
   - 語速（rate）、音調（pitch）、音量（volume）支援「下拉選單推薦預設值」與「自由手動鍵入」雙模。
5. **瀏覽器端一鍵生成 Word 錄音講稿 (.docx)**：
   - 點擊「💾 講稿存檔」或「📄 下載 Word (.docx)」，直接由瀏覽器高速生成符合錄音排版的微軟 Word 文件供配音師生劃記閱讀！
   - 同步支援下載 Markdown 講稿與微軟 Edge-TTS Python 合成腳本。

---

## 🚀 3 分鐘上傳至 GitHub 並啟用網站 (GitHub Pages 指引)

### 步驟 1：在 GitHub 建立新儲存庫 (Repository)
1. 登入 [GitHub.com](https://github.com)。
2. 點擊右上角的 **「+」** ➔ 選擇 **「New repository」**。
3. **Repository name**（倉庫名稱）：填寫 `reading-podcast`（或您喜歡的名稱）。
4. 設定為 **Public**（公開，GitHub Pages 免費版需為公開）。
5. 點擊最下方綠色按鈕 **「Create repository」**。

---

### 步驟 2：上傳本資料夾內的所有檔案 (免裝 Git，網頁直接拖曳)
1. 在剛建立好的 GitHub 倉庫頁面中，點擊文字連結 **「uploading an existing file」**。
2. 將本資料夾（`推薦書平台_GitHub_Pages`）內的所有內容選取並直接拖曳進瀏覽器中：
   - `index.html`
   - `css/` 資料夾
   - `js/` 資料夾
   - `lib/` 資料夾
   - `images/` 資料夾
   - `README.md`
3. 拖曳完成後，滑動到網頁最下方，點擊綠色按鈕 **「Commit changes」**。

---

### 步驟 3：開啟 GitHub Pages 網站發布
1. 點擊倉庫頂部的 **「Settings」**（設定）標籤頁。
2. 在左側選單中找到並點擊 **「Pages」**。
3. 在 **Build and deployment** 下方的 **Branch**（分支）：
   - 點選下拉選單將 `None` 改為 **`main`**（若為 `master` 則選 `master`）。
   - 資料夾保持 **`/ (root)`**。
   - 點擊後方的 **「Save」**（儲存）。
4. 稍等約 1 ~ 2 分鐘，重新整理頁面，頂端就會出現綠色的專屬網站網址：
   👉 **`https://<您的GitHub帳號>.github.io/reading-podcast/`**

---

### 🔗 不同使用者專屬網址區隔 (最推薦直接使用獨立網址)

| 對象 | 專屬網址格式 | 說明 |
| :--- | :--- | :--- |
| **🎒 學生推薦專用網址**<br>*(最推薦發給學生)* | `https://<您的帳號>.github.io/reading-podcast/student.html`<br>或 `.../?mode=student` | **物理完全隔絕後台**：頁面內完全無教師工作台分頁與密碼彈窗，附帶注音工具與即時鏡射列，安心讓學生自由使用！ |
| **🎙️ 課研組教師工作台**<br>*(教師/管理員使用)* | `https://<您的帳號>.github.io/reading-podcast/teacher.html`<br>或 `.../?mode=teacher` 或 `.../?mode=studio` | **直接免密進入後台**：自動開啟 Podcast 講稿工作台，包含一鍵複製學生網址、收件匣審閱、Word/Python 匯出功能。 |
| **🏠 標準入口首頁** | `https://<您的帳號>.github.io/reading-podcast/` | 綜合入口，支援雙分頁切換（進入教師工作台需輸入密碼 `115`）。 |
