/**
 * 國小學童閱讀推薦平台 & 喜閱龍 Podcast 講稿編寫系統 - GitHub Pages 專用版
 * 100% 純前端架構：免後端伺服器、支援離線運作、直接在瀏覽器生成 Word (.docx) 與 Python 腳本
 */

(function () {
  'use strict';

  // 本機儲存金鑰
  const STORAGE_KEY_SUBMISSIONS = 'dragon_reading_submissions_v1';
  const STORAGE_KEY_SCRIPTS = 'dragon_reading_saved_scripts_v1';

  // 預設樣本文檔 (初次造訪時自動載入，避免收件匣空白)
  const INITIAL_SEED_SUBMISSIONS = [
    {
      id: "sub_seed_01",
      studentName: "林小晨",
      gradeClass: "三年二班",
      bookTitle: "小妖怪系列12：動物界的小妖怪",
      author: "角野榮子 / 繪者：佐佐木洋子",
      features: "故事超級幽默搞笑又很溫馨！每一隻動物小妖怪都有特別的怪癖和搞笑的弱點，而且插圖顏色好漂亮、表情超生動，讓人忍不住一口氣看完！",
      favoriteQuote: "最喜歡「洗乾淨小妖怪」偷偷把森林所有動物的衣服拿去河邊洗，結果大家穿上去通通縮水變小的那一段，真的笑到肚子痛！",
      message: "喜閱龍和大樹哥哥好！我每天下課都會衝去圖書館看有沒有小妖怪的新書，希望喜閱龍在節目裡唸出我的推薦信，推薦給全校的小朋友！",
      timestamp: "2026-10-21T09:15:00.000Z"
    },
    {
      id: "sub_seed_02",
      studentName: "張允菲",
      gradeClass: "四年一班",
      bookTitle: "神奇柑仔店1：帶來幸福的錢天堂",
      author: "廣嶋玲子 / 繪者：jyajya",
      features: "店老闆紅子賣的神奇零食都有一種神奇魔法，但如果不遵守食用說明書的規則，就會發生意想不到的驚險危機！故事懸疑又很有道理，教大家要心存善良與知足。",
      favoriteQuote: "「美人魚軟糖可以讓不會游泳的人變成游泳高手，但千萬不能吃太多，否則皮膚會長出魚鱗喔！」這段超刺激！",
      message: "大樹哥哥和喜閱龍好！我和班上同學都搶著排隊借這本書，希望能在Podcast聽到大樹哥哥介紹錢天堂的神奇零食！",
      timestamp: "2026-10-21T10:30:00.000Z"
    },
    {
      id: "sub_seed_03",
      studentName: "陳小安",
      gradeClass: "二年三班",
      bookTitle: "野貓軍團開麵包店",
      author: "工藤紀子",
      features: "野貓們每次都偷偷溜進汪汪老闆的店裡搞破壞，引發大爆炸後認真反省做麵包！又搞笑又可愛！",
      favoriteQuote: "「喵——！我們知道錯了！」這句台詞配上野貓們跪坐反省的表情超級無厘頭！",
      message: "希望大樹哥哥和喜閱龍學野貓叫，一定超好笑！",
      timestamp: "2026-10-21T11:20:00.000Z"
    }
  ];

  // 預設聲學參數選項庫 (下拉選單常用值)
  const PRESET_OPTIONS = {
    rate: [
      { val: '+0%', label: '標準 (1.0x)' },
      { val: '+3%', label: '大樹開場/對白 (+3%)' },
      { val: '+5%', label: '輕快推進 (+5%)' },
      { val: '+10%', label: '激昂推進 (+10%)' },
      { val: '+15%', label: '情境提問 (+15%)' },
      { val: '+18%', label: '喜閱龍童趣收尾 (+18%)' },
      { val: '+28%', label: '喜閱龍歡讀 (+28%)' },
      { val: '+30%', label: '喜閱龍特色朗讀 (+30%)' },
      { val: '+32%', label: '喜閱龍揭曉書名 (+32%)' },
      { val: '+33%', label: '喜閱龍核心自介 (+33%)' },
      { val: '+34%', label: '喜閱龍宣傳信件 (+34%)' },
      { val: '-5%', label: '驚喜長音拉慢 (-5%)' },
      { val: '-10%', label: '從容介紹背景 (-10%)' },
      { val: '-15%', label: '溫和說書感悟 (-15%)' },
      { val: '-25%', label: '深度作者說書 (-25%)' }
    ],
    pitch: [
      { val: '+0Hz', label: '大樹標準 (+0Hz)' },
      { val: '+2Hz', label: '親切熱情開場 (+2Hz)' },
      { val: '+4Hz', label: '興奮讚嘆 (+4Hz)' },
      { val: '+5Hz', label: '驚喜收尾 (+5Hz)' },
      { val: '+7Hz', label: '極限驚喜長音 (+7Hz)' },
      { val: '+35Hz', label: '喜閱龍標準童音 (+35Hz)' },
      { val: '+36Hz', label: '喜閱龍揭曉書名 (+36Hz)' },
      { val: '+40Hz', label: '喜閱龍高音收尾 (+40Hz)' }
    ],
    volume: [
      { val: '+0%', label: '標準音量 (+0%)' },
      { val: '+5%', label: '微幅加強 (+5%)' },
      { val: '+10%', label: '熱情致謝 (+10%)' },
      { val: '+15%', label: '興奮語氣 (+15%)' },
      { val: '+20%', label: '讚嘆加強 (+20%)' },
      { val: '+40%', label: '驚喜長音 (+40%)' },
      { val: '+50%', label: '極限驚喜讚嘆 (+50%)' }
    ]
  };

  // 全域狀態
  const state = {
    zhuyinEnabled: true,
    activeTab: 'recommendTab',
    submissions: [],
    savedScripts: [],
    selectedSubmission: null,
    activeScriptLines: [],
    previewMode: 'markdown',
    lastFocusedInput: null,
    isTeacherAuthenticated: false,
    studentOnlyMode: false,
    floatingZhuyinOpen: false
  };

  // DOM 元素快取
  const dom = {
    zhuyinToggleBtn: document.getElementById('zhuyinToggleBtn'),
    zhuyinSwitchText: document.getElementById('zhuyinSwitchText'),
    tabBtnRecommend: document.getElementById('tabBtnRecommend'),
    tabBtnStudio: document.getElementById('tabBtnStudio'),
    studioLockIcon: document.getElementById('studioLockIcon'),
    recommendTab: document.getElementById('recommendTab'),
    studioTab: document.getElementById('studioTab'),
    inboxCountBadge: document.getElementById('inboxCountBadge'),

    // 教師驗證彈窗
    teacherAuthModal: document.getElementById('teacherAuthModal'),
    teacherPasscodeInput: document.getElementById('teacherPasscodeInput'),
    btnConfirmAuth: document.getElementById('btnConfirmAuth'),
    btnCancelAuth: document.getElementById('btnCancelAuth'),
    btnCancelAuth2: document.getElementById('btnCancelAuth2'),
    authErrorMsg: document.getElementById('authErrorMsg'),
    btnLockStudio: document.getElementById('btnLockStudio'),

    // 表單元素
    recommendForm: document.getElementById('recommendForm'),
    studentName: document.getElementById('studentName'),
    gradeClass: document.getElementById('gradeClass'),
    bookTitle: document.getElementById('bookTitle'),
    author: document.getElementById('author'),
    bookFeatures: document.getElementById('bookFeatures'),
    favoriteQuote: document.getElementById('favoriteQuote'),
    studentMessage: document.getElementById('studentMessage'),
    featureTagList: document.getElementById('featureTagList'),
    assistantToggle: document.getElementById('assistantToggle'),
    zhuyinKeypad: document.getElementById('zhuyinKeypad'),
    assistantArrow: document.getElementById('assistantArrow'),

    // 浮動注音小工具元素
    floatingZhuyinFab: document.getElementById('floatingZhuyinFab'),
    floatingZhuyinContainer: document.getElementById('floatingZhuyinContainer'),
    fzhuyinFieldPills: document.getElementById('fzhuyinFieldPills'),
    fzhuyinCurrentFieldName: document.getElementById('fzhuyinCurrentFieldName'),
    fzhuyinMirrorContent: document.getElementById('fzhuyinMirrorContent'),
    fzhuyinKeypad: document.getElementById('fzhuyinKeypad'),
    fzhuyinBackspaceBtn: document.getElementById('fzhuyinBackspaceBtn'),
    fzhuyinSpaceBtn: document.getElementById('fzhuyinSpaceBtn'),
    fzhuyinCloseBtn: document.getElementById('fzhuyinCloseBtn'),
    btnOpenFloatingKeypad: document.getElementById('btnOpenFloatingKeypad'),
    btnCopyStudentUrl: document.getElementById('btnCopyStudentUrl'),
    btnCopyTeacherUrl: document.getElementById('btnCopyTeacherUrl'),
    studentUrlText: document.getElementById('studentUrlText'),

    // 即時注音預覽元素
    previewBookTitle: document.getElementById('previewBookTitle'),
    previewMeta: document.getElementById('previewMeta'),
    previewFeatures: document.getElementById('previewFeatures'),
    previewQuote: document.getElementById('previewQuote'),
    previewMessage: document.getElementById('previewMessage'),

    // Studio 元素
    inboxList: document.getElementById('inboxList'),
    btnExportData: document.getElementById('btnExportData'),
    btnImportData: document.getElementById('btnImportData'),
    importFileInput: document.getElementById('importFileInput'),
    scriptEpisodeName: document.getElementById('scriptEpisodeName'),
    scriptRecommenderInfo: document.getElementById('scriptRecommenderInfo'),
    scriptLinesContainer: document.getElementById('scriptLinesContainer'),
    scriptLineCount: document.getElementById('scriptLineCount'),
    btnAddScriptLine: document.getElementById('btnAddScriptLine'),
    btnSaveScript: document.getElementById('btnSaveScript'),
    btnDownloadDocx: document.getElementById('btnDownloadDocx'),
    btnDownloadPython: document.getElementById('btnDownloadPython'),
    btnCopyMarkdown: document.getElementById('btnCopyMarkdown'),
    btnToggleMdPreview: document.getElementById('btnToggleMdPreview'),
    btnTogglePyPreview: document.getElementById('btnTogglePyPreview'),
    codePreviewBlock: document.getElementById('codePreviewBlock'),
    savedScriptsList: document.getElementById('savedScriptsList'),

    // Toast
    toastBox: document.getElementById('toastBox'),
    toastMessage: document.getElementById('toastMessage'),
    toastIcon: document.getElementById('toastIcon')
  };

  // ==========================================
  // 1. 初始化
  // ==========================================
  function init() {
    initZhuyinMode();
    initTeacherAuth();
    initTabNavigation();
    initFeatureTags();
    initZhuyinKeypad();
    initFormLivePreview();
    initStudioActions();

    loadSubmissionsFromStorage();
    loadSavedScriptsFromStorage();
  }

  // ==========================================
  // 2. 注音模式管理
  // ==========================================
  function initZhuyinMode() {
    const saved = localStorage.getItem('zhuyin_mode');
    state.zhuyinEnabled = saved !== null ? saved === 'true' : true;
    applyZhuyinState();

    dom.zhuyinToggleBtn.addEventListener('click', () => {
      state.zhuyinEnabled = !state.zhuyinEnabled;
      localStorage.setItem('zhuyin_mode', state.zhuyinEnabled);
      applyZhuyinState();
      showToast(state.zhuyinEnabled ? '注音模式已開啟 🔤' : '注音模式已關閉', 'info');
    });

    renderStaticLabelsZhuyin();
  }

  function applyZhuyinState() {
    if (state.zhuyinEnabled) {
      document.body.classList.remove('zhuyin-off');
      dom.zhuyinSwitchText.textContent = '🔤 注音模式：開啟';
    } else {
      document.body.classList.add('zhuyin-off');
      dom.zhuyinSwitchText.textContent = '🔤 注音模式：關閉';
    }
    if (typeof updateFloatingMirror === 'function') {
      updateFloatingMirror();
    }
  }

  function renderStaticLabelsZhuyin() {
    if (!window.ZhuyinEngine) return;
    const targets = [
      { id: 'siteTitle', text: '喜閱龍好書推薦平台' },
      { id: 'bannerHeading', text: '嗨～全臺灣最厲害的小讀者們！' },
      { id: 'formTitle', text: '填寫好書推薦信' },
      { id: 'lblStudentName', text: '推薦小達人姓名' },
      { id: 'lblGradeClass', text: '年級與班級' },
      { id: 'lblBookTitle', text: '推薦好書名稱' },
      { id: 'lblAuthor', text: '書籍作者 / 繪者' },
      { id: 'lblBookFeatures', text: '這本書最大的特色是什麼？' },
      { id: 'lblFavoriteQuote', text: '你最喜歡的情節、角色或一句話？' },
      { id: 'lblStudentMessage', text: '想對喜閱龍和大樹哥哥說的話 / 推薦原因' },
      { id: 'btnSubmitText', text: '送出推薦信給喜閱龍' },
      { id: 'previewBadgeText', text: '✨ 即時注音預覽卡片' },
      { id: 'lblPreviewFeatures', text: '【書籍特色】' },
      { id: 'lblPreviewQuote', text: '【最愛的情節或金句】' },
      { id: 'lblPreviewMessage', text: '【給喜閱龍的悄悄話】' }
    ];

    targets.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) {
        el.innerHTML = ZhuyinEngine.toRubyHtml(item.text);
      }
    });
  }

  // ==========================================
  // 3. 教師安全權限驗證與學生模式隔絕
  // ==========================================
  function initTeacherAuth() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const path = window.location.pathname.toLowerCase();
    const isStudentPage = path.endsWith('student.html') || mode === 'student';
    const isTeacherPage = path.endsWith('teacher.html') || path.endsWith('studio.html') || mode === 'studio' || mode === 'teacher';

    if (isStudentPage) {
      state.studentOnlyMode = true;
      if (dom.tabBtnStudio) dom.tabBtnStudio.style.display = 'none';
      if (dom.teacherAuthModal) dom.teacherAuthModal.style.display = 'none';
      switchTab('recommendTab');
    } else if (isTeacherPage) {
      sessionStorage.setItem('teacher_auth', 'true');
      state.isTeacherAuthenticated = true;
      updateAuthUI();
      switchTab('studioTab');
    } else {
      state.isTeacherAuthenticated = sessionStorage.getItem('teacher_auth') === 'true';
      updateAuthUI();
    }

    // 更新工作室頂部的專屬網址分享連結
    initUrlShareBar();

    if (dom.btnConfirmAuth) dom.btnConfirmAuth.addEventListener('click', verifyPasscode);
    if (dom.teacherPasscodeInput) {
      dom.teacherPasscodeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          verifyPasscode();
        }
      });
    }

    [dom.btnCancelAuth, dom.btnCancelAuth2].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          dom.teacherAuthModal.style.display = 'none';
          dom.authErrorMsg.style.display = 'none';
          dom.teacherPasscodeInput.value = '';
        });
      }
    });

    if (dom.btnLockStudio) {
      dom.btnLockStudio.addEventListener('click', () => {
        sessionStorage.removeItem('teacher_auth');
        state.isTeacherAuthenticated = false;
        updateAuthUI();
        switchTab('recommendTab');
        showToast('🔒 已安全鎖定工作台並切換回學生推薦專區！', 'info');
      });
    }
  }

  function initUrlShareBar() {
    const origin = window.location.origin;
    let basePath = window.location.pathname;
    basePath = basePath.replace(/(index|student|teacher|studio)\.html$/i, '');
    if (!basePath.endsWith('/')) basePath += '/';

    const fullStudentUrl = `${origin}${basePath}student.html`;
    const fullTeacherUrl = `${origin}${basePath}teacher.html`;

    if (dom.studentUrlText) {
      dom.studentUrlText.textContent = fullStudentUrl;
    }

    if (dom.btnCopyStudentUrl) {
      dom.btnCopyStudentUrl.addEventListener('click', () => {
        copyToClipboard(fullStudentUrl, '📋 學生專用網址已複製！可直接發給學生或班級群組～');
      });
    }

    if (dom.btnCopyTeacherUrl) {
      dom.btnCopyTeacherUrl.addEventListener('click', () => {
        copyToClipboard(fullTeacherUrl, '📋 教師工作台網址已複製！');
      });
    }
  }

  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg, 'success');
      }).catch(() => fallbackCopy(text, successMsg));
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(successMsg, 'success');
    } catch (e) {
      showToast('請手動選取網址進行複製', 'info');
    }
    document.body.removeChild(ta);
  }

  function updateAuthUI() {
    if (dom.studioLockIcon) {
      dom.studioLockIcon.textContent = state.isTeacherAuthenticated ? '🔓' : '🔒';
    }
  }

  function verifyPasscode() {
    const inputVal = dom.teacherPasscodeInput.value.trim();
    if (inputVal === '115') {
      state.isTeacherAuthenticated = true;
      sessionStorage.setItem('teacher_auth', 'true');
      dom.teacherAuthModal.style.display = 'none';
      dom.authErrorMsg.style.display = 'none';
      dom.teacherPasscodeInput.value = '';
      updateAuthUI();
      switchTab('studioTab');
      showToast('🔓 課研組教師驗證成功，歡迎進入 Podcast 工作台！', 'success');
    } else {
      dom.authErrorMsg.style.display = 'block';
      dom.teacherPasscodeInput.focus();
      dom.teacherPasscodeInput.select();
    }
  }

  // ==========================================
  // 4. 分頁切換導覽
  // ==========================================
  function initTabNavigation() {
    if (dom.tabBtnRecommend) {
      dom.tabBtnRecommend.addEventListener('click', () => switchTab('recommendTab'));
    }

    if (dom.tabBtnStudio) {
      dom.tabBtnStudio.addEventListener('click', () => {
        if (!state.isTeacherAuthenticated) {
          if (dom.teacherAuthModal) {
            dom.teacherAuthModal.style.display = 'flex';
            if (dom.authErrorMsg) dom.authErrorMsg.style.display = 'none';
            if (dom.teacherPasscodeInput) {
              dom.teacherPasscodeInput.value = '';
              setTimeout(() => dom.teacherPasscodeInput.focus(), 100);
            }
          }
          return;
        }
        switchTab('studioTab');
      });
    }
  }

  function switchTab(tabId) {
    state.activeTab = tabId;
    if (tabId === 'recommendTab') {
      if (dom.tabBtnRecommend) dom.tabBtnRecommend.classList.add('active');
      if (dom.tabBtnStudio) dom.tabBtnStudio.classList.remove('active');
      if (dom.recommendTab) dom.recommendTab.classList.add('active');
      if (dom.studioTab) dom.studioTab.classList.remove('active');
      if (dom.floatingZhuyinFab) dom.floatingZhuyinFab.style.display = 'flex';
    } else {
      if (dom.tabBtnStudio) dom.tabBtnStudio.classList.add('active');
      if (dom.tabBtnRecommend) dom.tabBtnRecommend.classList.remove('active');
      if (dom.studioTab) dom.studioTab.classList.add('active');
      if (dom.recommendTab) dom.recommendTab.classList.remove('active');
      setFloatingZhuyinOpen(false);
      if (dom.floatingZhuyinFab) dom.floatingZhuyinFab.style.display = 'none';
      renderInboxList();
    }
  }

  // ==========================================
  // 5. 快捷靈感標籤與浮動注音小鍵盤
  // ==========================================
  function initFeatureTags() {
    if (!window.ZhuyinEngine || !ZhuyinEngine.FEATURE_TAGS) return;
    dom.featureTagList.innerHTML = '';
    ZhuyinEngine.FEATURE_TAGS.forEach(tag => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tag-btn';
      btn.innerHTML = `${tag.emoji} ${ZhuyinEngine.toRubyHtml(tag.text)}`;
      btn.addEventListener('click', () => {
        const currentVal = dom.bookFeatures.value.trim();
        const addition = `${tag.text}！`;
        if (!currentVal) {
          dom.bookFeatures.value = addition;
        } else if (!currentVal.includes(tag.text)) {
          dom.bookFeatures.value = `${currentVal}，${addition}`;
        }
        dom.bookFeatures.dispatchEvent(new Event('input'));
        updateFloatingMirror();
      });
      dom.featureTagList.appendChild(btn);
    });
  }

  const FIELD_MAP = {};
  const FIELD_LABELS = {
    'bookFeatures': '這本書最有特色或吸引人的地方',
    'bookTitle': '推薦書籍名稱',
    'author': '書籍作者',
    'favoriteQuote': '書中最喜歡的一句話',
    'studentMessage': '想對喜閱龍和大樹哥哥說的話',
    'studentName': '推薦小達人姓名',
    'gradeClass': '年級與班級'
  };

  function updateFloatingMirror() {
    const target = state.lastFocusedInput || dom.bookFeatures;
    if (!target) return;

    const fieldKey = target.id;
    const label = FIELD_LABELS[fieldKey] || '目前欄位';
    if (dom.fzhuyinCurrentFieldName) {
      dom.fzhuyinCurrentFieldName.textContent = `【${label}】`;
    }

    if (dom.fzhuyinFieldPills) {
      const pills = dom.fzhuyinFieldPills.querySelectorAll('.fzhuyin-pill');
      pills.forEach(pill => {
        pill.classList.toggle('active', pill.dataset.field === fieldKey);
      });
    }

    if (dom.fzhuyinMirrorContent) {
      const val = target.value;
      if (!val || val.trim() === '') {
        dom.fzhuyinMirrorContent.innerHTML = `<span class="fzhuyin-placeholder">（目前欄位尚無文字，點選下方注音即可直接輸入）</span>`;
      } else {
        if (state.zhuyinEnabled && window.ZhuyinEngine && ZhuyinEngine.toRubyHtml) {
          dom.fzhuyinMirrorContent.innerHTML = ZhuyinEngine.toRubyHtml(val);
        } else {
          dom.fzhuyinMirrorContent.textContent = val;
        }
        // 自動水平滾動到最右側，確保看得到最新輸入的字
        dom.fzhuyinMirrorContent.scrollLeft = dom.fzhuyinMirrorContent.scrollWidth;
      }
    }
  }

  function setFloatingZhuyinOpen(isOpen) {
    state.floatingZhuyinOpen = isOpen;
    if (dom.floatingZhuyinContainer) {
      dom.floatingZhuyinContainer.style.display = isOpen ? 'block' : 'none';
    }
    if (dom.floatingZhuyinFab) {
      dom.floatingZhuyinFab.classList.toggle('active', isOpen);
      const fabText = dom.floatingZhuyinFab.querySelector('.fab-text');
      if (fabText) {
        fabText.textContent = isOpen ? '✕ 收合注音' : 'ㄅㄆㄇ 注音工具';
      }
    }
    document.body.classList.toggle('zhuyin-dock-open', isOpen);
    if (isOpen) {
      if (!state.lastFocusedInput) {
        state.lastFocusedInput = dom.bookFeatures;
      }
      updateFloatingMirror();
    }
  }

  function initZhuyinKeypad() {
    const path = window.location.pathname.toLowerCase();
    const isTeacherPage = path.endsWith('teacher.html') || path.endsWith('studio.html');
    if (isTeacherPage) {
      // 教師工作台不需要注音工具，完全隱藏與停用
      if (dom.floatingZhuyinFab) dom.floatingZhuyinFab.style.display = 'none';
      if (dom.floatingZhuyinContainer) dom.floatingZhuyinContainer.style.display = 'none';
      return;
    }

    if (!window.ZhuyinEngine || !ZhuyinEngine.ZHUYIN_ALPHABET) return;

    FIELD_MAP['bookTitle'] = dom.bookTitle;
    FIELD_MAP['author'] = dom.author;
    FIELD_MAP['bookFeatures'] = dom.bookFeatures;
    FIELD_MAP['favoriteQuote'] = dom.favoriteQuote;
    FIELD_MAP['studentMessage'] = dom.studentMessage;
    FIELD_MAP['studentName'] = dom.studentName;
    FIELD_MAP['gradeClass'] = dom.gradeClass;

    // 追蹤所有輸入欄位焦點，即時更新浮動預覽鏡射條
    const inputs = [
      dom.studentName, dom.gradeClass, dom.bookTitle,
      dom.author, dom.bookFeatures, dom.favoriteQuote, dom.studentMessage
    ];
    inputs.forEach(input => {
      if (!input) return;
      input.addEventListener('focus', () => {
        state.lastFocusedInput = input;
        updateFloatingMirror();
      });
      input.addEventListener('input', () => {
        if (state.lastFocusedInput === input) {
          updateFloatingMirror();
        }
      });
    });

    // 通用按鍵點擊與觸控綁定輔助函式（完美相容手機觸控螢幕、iPad 與桌機滑鼠）
    function attachKeyAction(element, actionFn) {
      if (!element) return;
      // 桌機滑鼠點擊時避免 input 焦點失焦
      element.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });

      let touchHandled = false;
      element.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchHandled = true;
        actionFn();
        setTimeout(() => { touchHandled = false; }, 250);
      }, { passive: false });

      element.addEventListener('click', (e) => {
        e.preventDefault();
        if (touchHandled) return;
        actionFn();
      });
    }

    // 1. FAB 快捷懸浮鈕點擊開關
    if (dom.floatingZhuyinFab) {
      attachKeyAction(dom.floatingZhuyinFab, () => {
        setFloatingZhuyinOpen(!state.floatingZhuyinOpen);
      });
    }

    // 2. 表單內引導卡片點擊開啟 (若存在)
    if (dom.assistantToggle) {
      attachKeyAction(dom.assistantToggle, () => {
        setFloatingZhuyinOpen(true);
        if (!state.lastFocusedInput) {
          state.lastFocusedInput = dom.bookFeatures;
        }
        updateFloatingMirror();
      });
    }

    // 3. 浮動面板收合按鈕
    if (dom.fzhuyinCloseBtn) {
      attachKeyAction(dom.fzhuyinCloseBtn, () => {
        setFloatingZhuyinOpen(false);
      });
    }

    // 4. 目標欄位快速切換標籤 (Pills)
    if (dom.fzhuyinFieldPills) {
      dom.fzhuyinFieldPills.addEventListener('click', (e) => {
        const btn = e.target.closest('.fzhuyin-pill');
        if (!btn) return;
        const fieldKey = btn.dataset.field;
        const targetInput = FIELD_MAP[fieldKey];
        if (targetInput) {
          state.lastFocusedInput = targetInput;
          updateFloatingMirror();
        }
      });
    }

    // 5. 倒退刪除按鈕 (Backspace)
    if (dom.fzhuyinBackspaceBtn) {
      attachKeyAction(dom.fzhuyinBackspaceBtn, () => {
        const target = state.lastFocusedInput || dom.bookFeatures;
        deleteAtCursor(target);
        target.dispatchEvent(new Event('input', { bubbles: true }));
        updateFloatingMirror();
      });
    }

    // 6. 空格按鈕 (Space)
    if (dom.fzhuyinSpaceBtn) {
      attachKeyAction(dom.fzhuyinSpaceBtn, () => {
        const target = state.lastFocusedInput || dom.bookFeatures;
        insertAtCursor(target, ' ');
        target.dispatchEvent(new Event('input', { bubbles: true }));
        updateFloatingMirror();
      });
    }

    // 7. 動態產生注音按鍵 (包含 37 個注音符號 + 4 個聲調 + 6 個常用標點)
    if (dom.fzhuyinKeypad) {
      dom.fzhuyinKeypad.innerHTML = '';
      const tones = ['ˊ', 'ˇ', 'ˋ', '˙'];
      const punctuations = ['，', '。', '！', '？', '「', '」'];
      const allSymbols = [...ZhuyinEngine.ZHUYIN_ALPHABET, ...punctuations];

      allSymbols.forEach(symbol => {
        const key = document.createElement('button');
        key.type = 'button';
        const isTone = tones.includes(symbol);
        const isPunct = punctuations.includes(symbol);
        key.className = `fzhuyin-key ${isTone ? 'tone' : ''} ${isPunct ? 'punct' : ''}`;
        key.textContent = symbol;
        if (isTone) {
          key.title = symbol === 'ˊ' ? '二聲' : symbol === 'ˇ' ? '三聲' : symbol === 'ˋ' ? '四聲' : '輕聲';
        }

        attachKeyAction(key, () => {
          const target = state.lastFocusedInput || dom.bookFeatures;
          insertAtCursor(target, symbol);
          target.dispatchEvent(new Event('input', { bubbles: true }));
          updateFloatingMirror();
        });

        dom.fzhuyinKeypad.appendChild(key);
      });
    }
  }

  function insertAtCursor(myField, myValue) {
    if (!myField) return;
    const oldVal = myField.value || '';
    let startPos = (typeof myField.selectionStart === 'number') ? myField.selectionStart : oldVal.length;
    let endPos = (typeof myField.selectionEnd === 'number') ? myField.selectionEnd : oldVal.length;

    myField.value = oldVal.substring(0, startPos) + myValue + oldVal.substring(endPos);
    const newPos = startPos + myValue.length;
    if (typeof myField.setSelectionRange === 'function') {
      try {
        myField.setSelectionRange(newPos, newPos);
      } catch (err) {}
    }
  }

  function deleteAtCursor(myField) {
    if (!myField) return;
    const oldVal = myField.value || '';
    if (!oldVal) return;
    let startPos = (typeof myField.selectionStart === 'number') ? myField.selectionStart : oldVal.length;
    let endPos = (typeof myField.selectionEnd === 'number') ? myField.selectionEnd : oldVal.length;

    if (startPos !== endPos) {
      myField.value = oldVal.substring(0, startPos) + oldVal.substring(endPos);
      if (typeof myField.setSelectionRange === 'function') {
        try { myField.setSelectionRange(startPos, startPos); } catch (err) {}
      }
    } else if (startPos > 0) {
      myField.value = oldVal.substring(0, startPos - 1) + oldVal.substring(endPos);
      const newPos = startPos - 1;
      if (typeof myField.setSelectionRange === 'function') {
        try { myField.setSelectionRange(newPos, newPos); } catch (err) {}
      }
    }
  }

  // ==========================================
  // 6. 表單即時注音預覽 (Live Ruby Preview)
  // ==========================================
  function initFormLivePreview() {
    let debounceTimer = null;
    const updatePreview = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        renderLivePreview();
      }, 150);
    };

    [
      dom.studentName, dom.gradeClass, dom.bookTitle,
      dom.author, dom.bookFeatures, dom.favoriteQuote, dom.studentMessage
    ].forEach(el => {
      el.addEventListener('input', updatePreview);
    });

    dom.recommendForm.addEventListener('submit', handleFormSubmit);
  }

  function renderLivePreview() {
    if (!window.ZhuyinEngine) return;

    const title = dom.bookTitle.value.trim() || '請在左邊輸入書名';
    const name = dom.studentName.value.trim() || '等待輸入中...';
    const grade = dom.gradeClass.value.trim() || '';
    const author = dom.author.value.trim();
    const features = dom.bookFeatures.value.trim() || '在左邊輸入書籍特色後，這裡會立即顯示帶有注音的漂亮文字喔！';
    const quote = dom.favoriteQuote.value.trim() || '還沒填寫最愛的情節唷～';
    const msg = dom.studentMessage.value.trim() || '（期待收到你的悄悄話！）';

    dom.previewBookTitle.innerHTML = ZhuyinEngine.toRubyHtml(`《${title}》`);

    let metaText = `推薦小達人：${grade} ${name}`;
    if (author) metaText += ` ｜ 作者：${author}`;
    dom.previewMeta.innerHTML = ZhuyinEngine.toRubyHtml(metaText);

    dom.previewFeatures.innerHTML = ZhuyinEngine.toRubyHtml(features);
    dom.previewQuote.innerHTML = ZhuyinEngine.toRubyHtml(quote);
    dom.previewMessage.innerHTML = ZhuyinEngine.toRubyHtml(msg);
  }

  // 學生表單送出 -> 儲存至瀏覽器 LocalStorage
  function handleFormSubmit(e) {
    e.preventDefault();

    const now = new Date();
    const sub = {
      id: `sub_${now.getTime()}_${Math.floor(Math.random() * 1000)}`,
      studentName: dom.studentName.value.trim(),
      gradeClass: dom.gradeClass.value.trim(),
      bookTitle: dom.bookTitle.value.trim(),
      author: dom.author.value.trim(),
      features: dom.bookFeatures.value.trim(),
      favoriteQuote: dom.favoriteQuote.value.trim(),
      message: dom.studentMessage.value.trim(),
      timestamp: now.toISOString()
    };

    state.submissions.unshift(sub);
    saveSubmissionsToStorage();

    showToast('🎉 太棒了！推薦信已送達喜閱龍與大樹哥哥！', 'success');
    dom.recommendForm.reset();
    renderLivePreview();
    updateFloatingMirror();
    renderInboxList();
  }

  // ==========================================
  // 7. 本機資料管理 (LocalStorage ＆ 匯出備份/匯入)
  // ==========================================
  function loadSubmissionsFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
      if (raw) {
        state.submissions = JSON.parse(raw);
      } else {
        state.submissions = [...INITIAL_SEED_SUBMISSIONS];
        saveSubmissionsToStorage();
      }
    } catch (e) {
      state.submissions = [...INITIAL_SEED_SUBMISSIONS];
    }
    if (dom.inboxCountBadge) dom.inboxCountBadge.textContent = state.submissions.length;
    if (dom.inboxList) renderInboxList();
  }

  function saveSubmissionsToStorage() {
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(state.submissions));
    if (dom.inboxCountBadge) dom.inboxCountBadge.textContent = state.submissions.length;
  }

  function loadSavedScriptsFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SCRIPTS);
      state.savedScripts = raw ? JSON.parse(raw) : [];
    } catch (e) {
      state.savedScripts = [];
    }
    renderSavedScriptsList();
  }

  function saveScriptsToStorage() {
    localStorage.setItem(STORAGE_KEY_SCRIPTS, JSON.stringify(state.savedScripts));
    renderSavedScriptsList();
  }

  // ==========================================
  // 8. 推薦信收件匣渲染
  // ==========================================
  function renderInboxList() {
    if (!dom.inboxList) return;
    dom.inboxList.innerHTML = '';
    if (state.submissions.length === 0) {
      dom.inboxList.innerHTML = `
        <div style="text-align: center; color: #94a3b8; padding: 24px;">
          📭 目前還沒有收到的推薦信<br>快邀請小朋友來推薦好書吧！
        </div>
      `;
      return;
    }

    state.submissions.forEach((item) => {
      const card = document.createElement('div');
      card.className = `inbox-card ${state.selectedSubmission && state.selectedSubmission.id === item.id ? 'active' : ''}`;
      
      const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleDateString('zh-TW', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }) : '';

      card.innerHTML = `
        <div class="inbox-card-header">
          <span class="inbox-student">👦 ${escapeHtml(item.gradeClass)} ${escapeHtml(item.studentName)}</span>
          <span class="inbox-time">${timeStr}</span>
        </div>
        <div class="inbox-book">《${escapeHtml(item.bookTitle)}》</div>
        <div class="inbox-features-snippet">
          ${escapeHtml(item.features || '無填寫特色')}
        </div>
        <div style="margin-top: 8px; display: flex; justify-content: flex-end;">
          <button class="btn-action primary" style="padding: 4px 10px; font-size: 0.8rem;" data-id="${item.id}">
            ⚡ 一鍵轉換成 Podcast 講稿
          </button>
        </div>
      `;

      card.addEventListener('click', () => {
        selectSubmissionAndGenerate(item);
      });

      dom.inboxList.appendChild(card);
    });
  }

  function selectSubmissionAndGenerate(sub) {
    state.selectedSubmission = sub;
    renderInboxList();
    generatePodcastScriptFromSubmission(sub);
  }

  /**
   * 核心：依據龍埔國小《喜閱龍的3分鐘圖書館奇遇》SOP 智慧生成廣播劇對白！
   */
  function generatePodcastScriptFromSubmission(sub) {
    const student = sub.studentName || '小讀者';
    const grade = sub.gradeClass || '三年級';
    const book = sub.bookTitle || '好書';
    const author = sub.author || '知名作家';
    const features = sub.features || '故事精彩有趣，插圖美麗生動';
    const quote = sub.favoriteQuote || '這本書裡的角色非常特別，充滿勇氣！';
    const message = sub.message || '希望大家都能愛上看書！';

    dom.scriptEpisodeName.value = `喜閱龍_閱讀推廣_${book.replace(/[《》\s]/g, '')}`;
    dom.scriptRecommenderInfo.value = `${grade} ${student} 小朋友`;

    const lines = [
      {
        index: 1,
        role: '大樹',
        text: '嗨～～！全台灣最厲害的小讀者們，大家早安！歡迎收聽——',
        pitch: '+2Hz',
        rate: '+3%',
        volume: '+0%',
        note: '大樹哥哥(語速1.02)：嗨~~(語調上揚，親切熱情開場)'
      },
      {
        index: 2,
        role: '喜閱龍',
        text: '——《喜閱龍的3分鐘圖書館奇遇》！我是最愛看書、肚子裡腮滿故事的「喜閱龍」！',
        pitch: '+35Hz',
        rate: '+33%',
        volume: '+0%',
        note: '喜閱龍【指定有感提速 +33%】：塞[Sai]正音(ㄙㄞ 第一聲)，俐落自介'
      },
      {
        index: 3,
        role: '大樹',
        text: '喜閱龍今天很有精神喔！每天用短短 3 分鐘，帶大家探索圖書館的無窮寶藏！大樹哥哥聽說——你今天收到了一封超級特別的「秘密信件」？！',
        pitch: '+0Hz',
        rate: '+3%',
        volume: '+0%',
        note: '大樹哥哥：拋出懸念，引導喜閱龍展示信件'
      },
      {
        index: 4,
        role: '喜閱龍',
        text: `沒錯沒錯！是一封來自我們學校——${grade}「${student}」小朋友親手寄來的口袋好書推薦信耶！`,
        pitch: '+35Hz',
        rate: '+34%',
        volume: '+10%',
        note: `喜閱龍【提速 +34%】：歡呼公佈小讀者推薦人`
      },
      {
        index: 5,
        role: '大樹',
        text: '太棒了！',
        pitch: '+4Hz',
        rate: '+0%',
        volume: '+15%',
        note: '大樹哥哥(語速1)：太棒了(興奮語氣)'
      },
      {
        index: 6,
        role: '大樹',
        text: `那我們今天這集節目，${student} 小朋友要帶大家——看什麼超厲害的好書呢？！`,
        pitch: '+0Hz',
        rate: '+0%',
        volume: '+0%',
        note: '大樹哥哥：看什麼書呢(疑惑探詢，呼吸停頓)'
      },
      {
        index: 7,
        role: '喜閱龍',
        text: `隆重登場～就是這本超人氣的——《${book}》！`,
        pitch: '+36Hz',
        rate: '+32%',
        volume: '+15%',
        note: `喜閱龍【提速 +32%】：元氣滿滿直接揭曉書名`
      },
      {
        index: 8,
        role: '大樹',
        text: `哇！這本書是由 ${author} 創作的，在圖書館真的超級搶手！喜閱龍，信裡面說這本書最吸引人的地方是什麼呢？`,
        pitch: '+0Hz',
        rate: '-10%',
        volume: '+0%',
        note: '大樹哥哥：從容介紹作者背景與借閱熱度'
      },
      {
        index: 9,
        role: '喜閱龍',
        text: `嘿嘿！${student} 在信裡超級興奮地寫著：${features}`,
        pitch: '+35Hz',
        rate: '+30%',
        volume: '+5%',
        note: '喜閱龍：朗讀學童寫下的特色重點'
      },
      {
        index: 10,
        role: '大樹',
        text: '「哇～～～～～～！」',
        pitch: '+7Hz',
        rate: '-5%',
        volume: '+40%',
        note: '大樹哥哥：黃金公式！三段式極限驚喜讚嘆拉長音'
      },
      {
        index: 11,
        role: '大樹',
        text: '光是聽喜閱龍這樣念，大樹哥哥的眼睛都發亮了！這本書的特色真的太吸引人了！',
        pitch: '+5Hz',
        rate: '+10%',
        volume: '+20%',
        note: '大樹哥哥：驚喜讚嘆收尾'
      },
      {
        index: 12,
        role: '喜閱龍',
        text: `而且而且，信裡還提到最讓人回味無窮的精彩段落喔！${student} 最喜歡的是：${quote}`,
        pitch: '+35Hz',
        rate: '+28%',
        volume: '+5%',
        note: '喜閱龍：朗讀最愛的情節或金句'
      },
      {
        index: 13,
        role: '大樹',
        text: '哈哈！這段真的超級有畫面感，難怪會讓人忍不住一口氣看完！一本好書就像一扇打開新世界的魔法大門，給了我們滿滿的歡笑與啟發！',
        pitch: '+0Hz',
        rate: '-15%',
        volume: '+0%',
        note: '大樹哥哥：溫和說書者感悟'
      },
      {
        index: 14,
        role: '喜閱龍',
        text: `對呀！${student} 還說：${message}`,
        pitch: '+35Hz',
        rate: '+32%',
        volume: '+0%',
        note: '喜閱龍：念出給主持人的悄悄話'
      },
      {
        index: 15,
        role: '大樹',
        text: `非常感謝 ${grade} 的 ${student} 小朋友！為全校同學帶來這麼棒的好書推薦！`,
        pitch: '+2Hz',
        rate: '+5%',
        volume: '+10%',
        note: '大樹哥哥：溫暖致謝小推薦人'
      },
      {
        index: 16,
        role: '喜閱龍',
        text: `小朋友們，下課鐘聲一響，別忘了——手刀衝去圖書館找這本《${book}》來看喔！如果你也有超級愛的私房好書，趕快寫推薦信給喜閱龍！`,
        pitch: '+36Hz',
        rate: '+34%',
        volume: '+10%',
        note: '喜閱龍：熱情 Call To Action 衝圖書館借書'
      },
      {
        index: 17,
        role: '大樹',
        text: '別忘了——寫推薦信給喜閱龍喔～！我們下次見，BYE BYE囉～～！',
        pitch: '+0Hz',
        rate: '+5%',
        volume: '+0%',
        note: '大樹哥哥(語速1.05)：別忘了——(呼吸停頓)歡樂上揚道別'
      },
      {
        index: 18,
        role: '喜閱龍',
        text: 'BYE BYE～圖書館見！',
        pitch: '+40Hz',
        rate: '+18%',
        volume: '+0%',
        note: '喜閱龍(語速1.05)：童趣語氣，BYE BYE~圖書館見！(俐落上揚，無囉字)'
      }
    ];

    state.activeScriptLines = lines;
    renderScriptLines();
    updateOutputPreviews();
    showToast(`✨ 已成功套用《${book}》推薦信生成 Podcast 講稿！`, 'success');
  }

  // ==========================================
  // 9. 視覺化對白行編輯器 (雙模調校與無左右拉條)
  // ==========================================
  function renderScriptLines() {
    if (!dom.scriptLinesContainer) return;
    dom.scriptLinesContainer.innerHTML = '';
    if (dom.scriptLineCount) dom.scriptLineCount.textContent = state.activeScriptLines.length;

    state.activeScriptLines.forEach((line, idx) => {
      line.index = idx + 1;

      const card = document.createElement('div');
      let roleClass = 'role-dashu';
      if (line.role === '喜閱龍') roleClass = 'role-dragon';
      else if (line.role === '小讀者') roleClass = 'role-student';

      card.className = `script-line-card ${roleClass}`;

      const rateOptionsHtml = PRESET_OPTIONS.rate.map(opt =>
        `<option value="${opt.val}">${opt.val} ${opt.label}</option>`
      ).join('');

      const pitchOptionsHtml = PRESET_OPTIONS.pitch.map(opt =>
        `<option value="${opt.val}">${opt.val} ${opt.label}</option>`
      ).join('');

      const volumeOptionsHtml = PRESET_OPTIONS.volume.map(opt =>
        `<option value="${opt.val}">${opt.val} ${opt.label}</option>`
      ).join('');

      card.innerHTML = `
        <div class="line-header">
          <div class="line-header-left">
            <span class="line-index-badge">第 ${line.index} 句</span>
            <select class="role-select" data-index="${idx}">
              <option value="大樹" ${line.role === '大樹' ? 'selected' : ''}>🌳 大樹哥哥 (YunJhe)</option>
              <option value="喜閱龍" ${line.role === '喜閱龍' ? 'selected' : ''}>🦕 喜閱龍 (HsiaoYu)</option>
              <option value="小讀者" ${line.role === '小讀者' ? 'selected' : ''}>👦 小讀者 (學生)</option>
            </select>
          </div>

          <div class="line-controls">
            <!-- 語速複合控制項 (手動輸入 ＋ 下拉挑選) -->
            <div class="param-combo" title="語速調校：可手動輸入或由右側選單挑選">
              <span class="param-combo-label">語速:</span>
              <input type="text" class="param-combo-input param-rate" value="${escapeHtml(line.rate || '+0%')}" data-index="${idx}">
              <select class="param-combo-select param-rate-select" data-index="${idx}">
                <option value="" disabled selected>▼選單</option>
                ${rateOptionsHtml}
              </select>
            </div>

            <!-- 音調複合控制項 (手動輸入 ＋ 下拉挑選) -->
            <div class="param-combo" title="音調調校：可手動輸入或由右側選單挑選">
              <span class="param-combo-label">音調:</span>
              <input type="text" class="param-combo-input param-pitch" value="${escapeHtml(line.pitch || '+0Hz')}" data-index="${idx}">
              <select class="param-combo-select param-pitch-select" data-index="${idx}">
                <option value="" disabled selected>▼選單</option>
                ${pitchOptionsHtml}
              </select>
            </div>

            <!-- 音量複合控制項 (手動輸入 ＋ 下拉挑選) -->
            <div class="param-combo" title="音量調校：可手動輸入或由右側選單挑選">
              <span class="param-combo-label">音量:</span>
              <input type="text" class="param-combo-input param-volume" value="${escapeHtml(line.volume || '+0%')}" data-index="${idx}">
              <select class="param-combo-select param-volume-select" data-index="${idx}">
                <option value="" disabled selected>▼選單</option>
                ${volumeOptionsHtml}
              </select>
            </div>

            <button type="button" class="line-delete-btn" data-index="${idx}" title="刪除此句">🗑️</button>
          </div>
        </div>

        <textarea class="line-content-input" data-index="${idx}" placeholder="請輸入錄音對白內容...">${escapeHtml(line.text)}</textarea>
        <input type="text" class="line-note-input" data-index="${idx}" value="${escapeHtml(line.note || '')}" placeholder="導演表情備註（例如：親切開場、驚喜長音、有感提速、塞[Sai]正音）">
      `;

      card.querySelector('.role-select').addEventListener('change', (e) => {
        line.role = e.target.value;
        renderScriptLines();
        updateOutputPreviews();
      });

      card.querySelector('.line-content-input').addEventListener('input', (e) => {
        line.text = e.target.value;
        updateOutputPreviews();
      });

      card.querySelector('.line-note-input').addEventListener('input', (e) => {
        line.note = e.target.value;
        updateOutputPreviews();
      });

      const rateInput = card.querySelector('.param-rate');
      const rateSelect = card.querySelector('.param-rate-select');
      rateInput.addEventListener('input', (e) => {
        line.rate = e.target.value;
        updateOutputPreviews();
      });
      rateSelect.addEventListener('change', (e) => {
        line.rate = e.target.value;
        rateInput.value = e.target.value;
        updateOutputPreviews();
        rateSelect.selectedIndex = 0;
      });

      const pitchInput = card.querySelector('.param-pitch');
      const pitchSelect = card.querySelector('.param-pitch-select');
      pitchInput.addEventListener('input', (e) => {
        line.pitch = e.target.value;
        updateOutputPreviews();
      });
      pitchSelect.addEventListener('change', (e) => {
        line.pitch = e.target.value;
        pitchInput.value = e.target.value;
        updateOutputPreviews();
        pitchSelect.selectedIndex = 0;
      });

      const volumeInput = card.querySelector('.param-volume');
      const volumeSelect = card.querySelector('.param-volume-select');
      volumeInput.addEventListener('input', (e) => {
        line.volume = e.target.value;
        updateOutputPreviews();
      });
      volumeSelect.addEventListener('change', (e) => {
        line.volume = e.target.value;
        volumeInput.value = e.target.value;
        updateOutputPreviews();
        volumeSelect.selectedIndex = 0;
      });

      card.querySelector('.line-delete-btn').addEventListener('click', () => {
        state.activeScriptLines.splice(idx, 1);
        renderScriptLines();
        updateOutputPreviews();
      });

      dom.scriptLinesContainer.appendChild(card);
    });
  }

  // ==========================================
  // 10. 純前端 Word (.docx) 生成模組 (docx.js)
  // ==========================================
  async function generateAndDownloadDocx() {
    if (!window.docx) {
      showToast('Docx 函式庫載入中，請稍後...', 'error');
      return;
    }

    const epTitle = dom.scriptEpisodeName.value.trim() || '喜閱龍Podcast廣播劇';
    const recommender = dom.scriptRecommenderInfo.value.trim() || '小讀者';
    const sub = state.selectedSubmission || {};
    const safeTitle = epTitle.replace(/[\\/:*?"<>|]/g, '_');

    const { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, ShadingType } = window.docx;

    // 建立表頭
    const headers = ['分軌序號', '播客角色', '錄音台詞 (請劃記)', '表情與調校備註'];
    const colWidths = [12, 20, 48, 20]; // 百分比

    const headerCells = headers.map((h, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.PERCENTAGE },
      shading: { type: ShadingType.CLEAR, fill: '047857' },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 21, font: '微軟正黑體' })]
        })
      ]
    }));

    const rows = [new TableRow({ children: headerCells })];

    // 填入對白列
    state.activeScriptLines.forEach((l, idx) => {
      const isDragon = l.role === '喜閱龍';
      const bgColor = isDragon ? (idx % 2 === 0 ? 'ECFDF5' : 'E6F9F0') : (idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC');
      const roleColor = isDragon ? '10B981' : (l.role === '大樹' ? '7C3AED' : 'D97706');
      const roleLabel = isDragon ? '🦕 喜閱龍' : (l.role === '大樹' ? '🌳 大樹哥哥' : `👦 ${l.role}`);

      const row = new TableRow({
        children: [
          // 序號
          new TableCell({
            width: { size: colWidths[0], type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: bgColor },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `分軌 ${String(l.index).padStart(2, '0')}`, bold: true, color: '64748B', size: 20, font: '微軟正黑體' })]
              })
            ]
          }),
          // 角色
          new TableCell({
            width: { size: colWidths[1], type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: bgColor },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: roleLabel, bold: true, color: roleColor, size: 22, font: '微軟正黑體' })]
              })
            ]
          }),
          // 台詞 (大字體 26 = 13pt，方便看稿)
          new TableCell({
            width: { size: colWidths[2], type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: bgColor },
            children: [
              new Paragraph({
                spacing: { line: 320, after: 60 },
                children: [new TextRun({ text: `「${l.text}」`, bold: true, color: '0F172A', size: 26, font: '微軟正黑體' })]
              })
            ]
          }),
          // 表情與參數備註
          new TableCell({
            width: { size: colWidths[3], type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: bgColor },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: l.note ? `${l.note}\n` : '', italics: true, color: 'B45309', size: 18, font: '微軟正黑體' }),
                  new TextRun({ text: `語速:${l.rate}\n音調:${l.pitch}\n音量:${l.volume}`, color: '64748B', size: 17, font: '微軟正黑體' })
                ]
              })
            ]
          })
        ]
      });
      rows.push(row);
    });

    const scriptTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows
    });

    // 文件整體結構
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 1152, bottom: 1152, left: 1152, right: 1152 } // 0.8 inch
          }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: '🎙️ 《喜閱龍的3分鐘圖書館奇遇》Podcast 廣播劇錄音講稿', bold: true, color: '107850', size: 36, font: '微軟正黑體' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({ text: '新北市龍埔國小 閱讀推廣 Podcast 節目錄音專用稿 (錄音者閱讀劃記專用)', color: '64748B', size: 22, font: '微軟正黑體' })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `【本集主題】：${epTitle}  |  【推薦小達人】：${recommender}\n`, bold: true, size: 20, font: '微軟正黑體' }),
              new TextRun({ text: `【書籍作者】：${sub.author || '知名作家'}  |  【主持陣容】：🌳大樹哥哥 ＋ 🦕喜閱龍`, size: 20, font: '微軟正黑體' })
            ]
          }),
          new Paragraph({
            spacing: { before: 120, after: 180 },
            children: [
              new TextRun({ text: '📢 錄音注意事項：', bold: true, color: 'D97706', size: 19, font: '微軟正黑體' }),
              new TextRun({ text: '括號內文字為導演語態建議，錄音時請勿讀出；遇到破折號「——」請保持 0.3 秒自然呼吸停頓。', color: '475569', size: 19, font: '微軟正黑體' })
            ]
          }),
          scriptTable,
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 240 },
            children: [
              new TextRun({ text: '新北市龍埔國小 課研組 閱讀推廣 Podcast 製作團隊 敬製', color: '94A3B8', size: 19, font: '微軟正黑體' })
            ]
          })
        ]
      }]
    });

    showToast('📄 正在生成 Word (.docx) 錄音講稿...', 'info');
    const blob = await window.docx.Packer.toBlob(doc);
    saveAs(blob, `${safeTitle}.docx`);
    showToast(`✅ Word 講稿下載成功: ${safeTitle}.docx`, 'success');
  }

  // ==========================================
  // 11. Markdown ＆ Python 產生與下載
  // ==========================================
  function generateMarkdownScript() {
    const epName = dom.scriptEpisodeName.value.trim() || '喜閱龍Podcast節目';
    const recommender = dom.scriptRecommenderInfo.value.trim() || '國小閱讀小讀者';

    let md = `# 🎙️ 《喜閱龍的3分鐘圖書館奇遇》Podcast 廣播劇腳本\n\n`;
    md += `> **本集主題**：${epName}  \n`;
    md += `> **好書推薦人**：${recommender}  \n`;
    md += `> **主辦單位**：新北市龍埔國小 課研組  \n`;
    md += `> **主持搭檔**：🌳 大樹哥哥 (微軟雲哲聲線) ＋ 🦕 喜閱龍 (微軟曉臻高音聲線)  \n\n`;
    md += `---\n\n`;
    md += `## 📜 廣播劇完整對白分軌表\n\n`;

    state.activeScriptLines.forEach(l => {
      const roleIcon = l.role === '喜閱龍' ? '🦕 喜閱龍' : (l.role === '大樹' ? '🌳 大樹哥哥' : '👦 小讀者');
      md += `### [分軌 ${String(l.index).padStart(2, '0')}] ${roleIcon}\n`;
      if (l.note) {
        md += `> 🎬 **導演表情指示**：${l.note}  \n`;
      }
      md += `> 🎛️ **聲學參數**：語速 \`${l.rate}\` ｜ 音調 \`${l.pitch}\` ｜ 音量 \`${l.volume}\`  \n\n`;
      md += `**對白**：\n> 「${l.text}」\n\n`;
    });

    md += `---\n\n`;
    md += `*由新北市龍埔國小《喜閱龍好書推薦與 Podcast 講稿平台》自動編寫產出*\n`;
    return md;
  }

  function generatePythonScript() {
    const epName = dom.scriptEpisodeName.value.trim() || '喜閱龍_範本集';
    const safeEpName = epName.replace(/[\\/:*?"<>|]/g, '_');

    const scriptItems = state.activeScriptLines.map(l => {
      const roleStr = l.role === '喜閱龍' ? "'喜閱龍'" : "'大樹'";
      const escapedText = l.text.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      const escapedNote = (l.note || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      return `    # ${String(l.index).padStart(2, '0')}: ${escapedNote || l.role}
    (${l.index}, ${roleStr}, [
        ('${escapedText}', '${l.pitch || '+0Hz'}', '${l.rate || '+0%'}', '${l.volume || '+0%'}')
    ], '${escapedNote}'),\n`;
    }).join('\n');

    return `"""
《喜閱龍的3分鐘圖書館奇遇》Podcast 自動生成神經語音合成腳本
本集主題：${safeEpName}
龍埔國小 課研組 v2.0 SOP 標準相容
"""

import sys
import os
import time
import uuid
import hashlib
import ssl
from xml.sax.saxutils import escape
import websocket

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

EPISODE_NAME = "${safeEpName}"
ROOT_DIR     = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR   = os.path.join(ROOT_DIR, f"{EPISODE_NAME}_segments")
FINAL_MP3    = os.path.join(ROOT_DIR, f"{EPISODE_NAME}.mp3")

VOICE_MAP = {
    '大樹': 'zh-TW-YunJheNeural',
    '喜閱龍': 'zh-TW-HsiaoYuNeural'
}

BASE_URL = 'speech.platform.bing.com/consumer/speech/synthesize/readaloud'
TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4'
CHROMIUM_FULL_VERSION = '143.0.3650.75'
CHROMIUM_MAJOR_VERSION = '143'
SEC_MS_GEC_VERSION = f'1-{CHROMIUM_FULL_VERSION}'
WIN_EPOCH = 11644473600
S_TO_NS = 1e9

SCRIPT = [
${scriptItems}
]

def get_unix_timestamp():
    from datetime import datetime as dt, timezone as tz
    return int(dt.now(tz.utc).timestamp())

def generate_sec_ms_gec():
    now_unix = get_unix_timestamp()
    now_ticks = (now_unix + WIN_EPOCH) * S_TO_NS // 100
    rounded_ticks = now_ticks - (now_ticks % 3000000000)
    str_to_hash = f"{rounded_ticks}{TRUSTED_CLIENT_TOKEN}"
    return hashlib.sha256(str_to_hash.encode('ascii')).hexdigest().upper()

def make_connection():
    sec_ms_gec = generate_sec_ms_gec()
    conn_id = uuid.uuid4().hex
    full_url = f"wss://{BASE_URL}/edge/v1?TrustedClientToken={TRUSTED_CLIENT_TOKEN}&Sec-MS-GEC={sec_ms_gec}&Sec-MS-GEC-Version={SEC_MS_GEC_VERSION}&ConnectionId={conn_id}"
    ws = websocket.create_connection(
        full_url,
        header={
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
            'User-Agent': f'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{CHROMIUM_MAJOR_VERSION}.0.0.0 Safari/537.36 Edg/{CHROMIUM_MAJOR_VERSION}.0.0.0',
            'Origin': 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
            'Accept-Encoding': 'gzip, deflate, br'
        },
        sslopt={"cert_reqs": ssl.CERT_NONE}
    )
    ws.send(
        "Content-Type:application/json; charset=utf-8\\r\\nPath:speech.config\\r\\n\\r\\n"
        '{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}\\r\\n'
    )
    return ws

def synthesize_one_segment(role, parts, filename, max_retries=3):
    voice = VOICE_MAP.get(role, VOICE_MAP['大樹'])
    prosody_blocks = ""
    for (text, pitch, rate, vol) in parts:
        prosody_blocks += f'<prosody pitch="{pitch}" rate="{rate}" volume="{vol}">{escape(text)}</prosody>'
    ssml = (
        f"<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='zh-TW'>"
        f"<voice name='{voice}'>{prosody_blocks}</voice>"
        f"</speak>"
    )
    for attempt in range(max_retries):
        try:
            ws = make_connection()
            req_id = uuid.uuid4().hex
            req_headers = (
                f"X-RequestId:{req_id}\\r\\n"
                f"Content-Type:application/ssml+xml\\r\\n"
                f"Path:ssml\\r\\n\\r\\n"
            )
            ws.send(req_headers + ssml)
            audio_bytes = bytearray()
            while True:
                msg = ws.recv()
                if isinstance(msg, bytes):
                    header_end = msg.find(b"Path:audio\\r\\n")
                    if header_end != -1:
                        audio_data = msg[header_end + 12:]
                        audio_bytes.extend(audio_data)
                elif isinstance(msg, str):
                    if "Path:turn.end" in msg:
                        break
            ws.close()
            if len(audio_bytes) > 0:
                with open(filename, 'wb') as f:
                    f.write(audio_bytes)
                return True
        except Exception as e:
            time.sleep(1)
    return False

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"🎙️ 開始生成 Podcast 分軌音檔至: {OUTPUT_DIR}")
    for idx, role, parts, note in SCRIPT:
        seg_file = os.path.join(OUTPUT_DIR, f"seg_{idx:02d}_{role}.mp3")
        print(f"  正在合成第 {idx:02d} 句: [{role}] {note[:20]}...")
        ok = synthesize_one_segment(role, parts, seg_file)
        if not ok:
            print(f"  ❌ 第 {idx} 句合成失敗！")
    
    print(f"\\n🎵 正在合併全集至: {FINAL_MP3}")
    full_audio = bytearray()
    for idx, role, parts, _ in SCRIPT:
        seg_file = os.path.join(OUTPUT_DIR, f"seg_{idx:02d}_{role}.mp3")
        if os.path.exists(seg_file):
            with open(seg_file, 'rb') as f:
                full_audio.extend(f.read())
    with open(FINAL_MP3, 'wb') as f:
        f.write(full_audio)
    print(f"✅ 《{EPISODE_NAME}》全集生成完成！檔案大小: {len(full_audio)} 位元組")

if __name__ == '__main__':
    main()
`;
  }

  function updateOutputPreviews() {
    if (!dom.codePreviewBlock) return;
    if (state.previewMode === 'markdown') {
      dom.codePreviewBlock.textContent = generateMarkdownScript();
    } else {
      dom.codePreviewBlock.textContent = generatePythonScript();
    }
  }

  // ==========================================
  // 12. 工作台動作綁定 (存檔/下載 Word/Python/複製)
  // ==========================================
  function initStudioActions() {
    if (!dom.btnAddScriptLine) return;
    dom.btnAddScriptLine.addEventListener('click', () => {
      const newIdx = state.activeScriptLines.length + 1;
      state.activeScriptLines.push({
        index: newIdx,
        role: newIdx % 2 === 0 ? '喜閱龍' : '大樹',
        text: '請輸入新對白內容...',
        pitch: newIdx % 2 === 0 ? '+35Hz' : '+0Hz',
        rate: '+0%',
        volume: '+0%',
        note: '自訂對白句'
      });
      renderScriptLines();
      updateOutputPreviews();
      showToast('已新增對白句', 'info');
    });

    dom.btnToggleMdPreview.addEventListener('click', () => {
      state.previewMode = 'markdown';
      dom.btnToggleMdPreview.classList.add('primary');
      dom.btnTogglePyPreview.classList.remove('primary');
      updateOutputPreviews();
    });

    dom.btnTogglePyPreview.addEventListener('click', () => {
      state.previewMode = 'python';
      dom.btnTogglePyPreview.classList.add('primary');
      dom.btnToggleMdPreview.classList.remove('primary');
      updateOutputPreviews();
    });

    dom.btnCopyMarkdown.addEventListener('click', () => {
      const md = generateMarkdownScript();
      navigator.clipboard.writeText(md).then(() => {
        showToast('📋 已複製 Markdown 講稿到剪貼簿！', 'success');
      }).catch(() => {
        showToast('複製失敗，請手動複製', 'error');
      });
    });

    // 講稿存檔
    dom.btnSaveScript.addEventListener('click', handleSaveScript);

    // 下載 Word 講稿 (.docx)
    dom.btnDownloadDocx.addEventListener('click', generateAndDownloadDocx);

    // 下載 Python 語音合成腳本 (.py)
    dom.btnDownloadPython.addEventListener('click', () => {
      const py = generatePythonScript();
      const safeTitle = (dom.scriptEpisodeName.value.trim() || '喜閱龍Podcast').replace(/[\\/:*?"<>|]/g, '_');
      const blob = new Blob([py], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `generate_${safeTitle}.py`);
      showToast('🐍 已下載 Python 語音合成腳本！', 'success');
    });

    // 匯出資料備份 (JSON)
    dom.btnExportData.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state.submissions, null, 2)], { type: 'application/json;charset=utf-8' });
      saveAs(blob, `喜閱龍好書推薦信備份_${new Date().toISOString().slice(0, 10)}.json`);
      showToast('💾 推薦信資料已成功匯出備份！', 'success');
    });

    // 匯入資料 (JSON)
    dom.btnImportData.addEventListener('click', () => {
      dom.importFileInput.click();
    });

    dom.importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const list = JSON.parse(evt.target.result);
          if (Array.isArray(list)) {
            state.submissions = list;
            saveSubmissionsToStorage();
            renderInboxList();
            showToast(`📥 成功匯入 ${list.length} 筆好書推薦信！`, 'success');
          } else {
            showToast('匯入格式不符合 (需為 JSON 陣列)', 'error');
          }
        } catch (err) {
          showToast(`匯入失敗：${err.message}`, 'error');
        }
      };
      reader.readAsText(file, 'utf-8');
      dom.importFileInput.value = '';
    });
  }

  function handleSaveScript() {
    if (state.activeScriptLines.length === 0) {
      showToast('請先生成或新增對白內容', 'error');
      return;
    }

    const epTitle = dom.scriptEpisodeName.value.trim() || '喜閱龍Podcast講稿';
    const sub = state.selectedSubmission || {};
    const safeTitle = epTitle.replace(/[\\/:*?"<>|]/g, '_');

    const scriptRecord = {
      id: `script_${Date.now()}`,
      fileBaseName: safeTitle,
      episodeTitle: epTitle,
      bookTitle: sub.bookTitle || epTitle,
      studentName: sub.studentName || '',
      gradeClass: sub.gradeClass || '',
      author: sub.author || '',
      features: sub.features || '',
      favoriteQuote: sub.favoriteQuote || '',
      lines: state.activeScriptLines,
      markdown: generateMarkdownScript(),
      pythonCode: generatePythonScript(),
      updatedAt: new Date().toISOString()
    };

    // 儲存至本機
    const existingIdx = state.savedScripts.findIndex(s => s.episodeTitle === epTitle);
    if (existingIdx >= 0) {
      state.savedScripts[existingIdx] = scriptRecord;
    } else {
      state.savedScripts.unshift(scriptRecord);
    }
    saveScriptsToStorage();

    showToast(`💾 講稿存檔成功！已更新至已存檔講稿庫！`, 'success');
  }

  function renderSavedScriptsList() {
    if (!dom.savedScriptsList) return;
    dom.savedScriptsList.innerHTML = '';
    if (state.savedScripts.length === 0) {
      dom.savedScriptsList.innerHTML = `
        <div style="text-align: center; color: #94a3b8; padding: 20px;">
          🗂️ 目前還沒有已存檔的講稿
        </div>
      `;
      return;
    }

    state.savedScripts.forEach(script => {
      const row = document.createElement('div');
      row.style.cssText = 'background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; width: 100%; box-sizing: border-box;';
      
      const timeStr = script.updatedAt ? new Date(script.updatedAt).toLocaleDateString('zh-TW', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }) : '';

      row.innerHTML = `
        <div style="min-width: 0; max-width: 100%;">
          <div style="font-weight: 800; color: #1e293b; font-size: 0.95rem; word-break: break-all;">
            📜 ${escapeHtml(script.episodeTitle || script.fileBaseName)}
          </div>
          <div style="font-size: 0.8rem; color: #64748b;">
            推薦人：${escapeHtml(script.gradeClass || '')} ${escapeHtml(script.studentName || '未指定')} ｜ 存檔時間：${timeStr} ｜ 對白共 ${script.lines ? script.lines.length : 0} 句
          </div>
        </div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button class="btn-action" data-load-id="${script.id}">📖 載入編輯</button>
          <button class="btn-action warm" data-docx-id="${script.id}">📄 下載 Word (.docx)</button>
        </div>
      `;

      row.querySelector('[data-load-id]').addEventListener('click', () => {
        loadSavedScript(script);
      });

      row.querySelector('[data-docx-id]').addEventListener('click', () => {
        loadSavedScript(script);
        generateAndDownloadDocx();
      });

      dom.savedScriptsList.appendChild(row);
    });
  }

  function loadSavedScript(script) {
    dom.scriptEpisodeName.value = script.episodeTitle || script.fileBaseName;
    dom.scriptRecommenderInfo.value = `${script.gradeClass || ''} ${script.studentName || ''}`.trim() || '小讀者';
    state.activeScriptLines = script.lines || [];
    renderScriptLines();
    updateOutputPreviews();
    showToast(`已載入講稿《${script.episodeTitle}》`, 'info');
    window.scrollTo({ top: 250, behavior: 'smooth' });
  }

  // ==========================================
  // 13. 通用輔助函式
  // ==========================================
  let toastTimer = null;
  function showToast(msg, type = 'info') {
    clearTimeout(toastTimer);
    dom.toastMessage.textContent = msg;
    dom.toastBox.className = `toast show ${type === 'success' ? 'success' : (type === 'error' ? 'error' : '')}`;
    
    if (type === 'success') dom.toastIcon.textContent = '✅';
    else if (type === 'error') dom.toastIcon.textContent = '⚠️';
    else dom.toastIcon.textContent = '✨';

    toastTimer = setTimeout(() => {
      dom.toastBox.classList.remove('show');
    }, 3200);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.addEventListener('DOMContentLoaded', init);

})();
