console.log("[Editor] Component initializing...");
let monacoEditor = null;
let currentFilePath = null;
const openTabs = /* @__PURE__ */ new Map();
async function initMonaco() {
  console.log("[Editor] Initializing Monaco Editor...");
  require.config({ paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.50.0/min/vs" } });
  require(["vs/editor/editor.main"], function() {
    const editor = monaco.editor.create(document.getElementById("monaco-editor"), {
      value: '// Welcome to Code Editor Land\n// Click on a file in the explorer to edit it\n\nconsole.log("Hello, World!");',
      language: "typescript",
      theme: "vs-dark",
      automaticLayout: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      minimap: { enabled: false },
      scrollbar: {
        useShadows: false,
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10
      },
      padding: { top: 16, bottom: 16 }
    });
    editor.updateOptions({
      // @ts-expect-error - Monaco internal option
      "vscode-theme": true
    });
    monacoEditor = editor;
    console.log("[Editor] ✓ Monaco Editor initialized");
    editor.onDidChangeModelContent((e) => {
      console.log("[Editor] Content changed");
    });
  });
}
async function loadFile(filePath, fileName, isFolder) {
  if (isFolder) {
    console.log("[Editor] Skipping folder:", filePath);
    return;
  }
  console.log("[Editor] Loading file:", filePath);
  currentFilePath = filePath;
  openTabs.set(filePath, {
    name: fileName,
    icon: getFileIcon(fileName),
    content: getFileContent(fileName)
  });
  updateTabsUI();
  if (monacoEditor) {
    monacoEditor.setValue(getFileContent(fileName));
    const language = getLanguageForFile(fileName);
    const model = monaco.editor.createModel(getFileContent(fileName), language);
    monacoEditor.setModel(model);
  }
}
function getFileIcon(fileName) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const iconMap = {
    "ts": "📘",
    "js": "📜",
    "json": "📋",
    "md": "📝",
    "astro": "🚀",
    "rs": "⚙️",
    "html": "🌐",
    "css": "🎨"
  };
  return iconMap[ext || ""] || "📄";
}
function getLanguageForFile(fileName) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const langMap = {
    "ts": "typescript",
    "tsx": "typescript",
    "js": "javascript",
    "jsx": "javascript",
    "json": "json",
    "md": "markdown",
    "astro": "astro",
    "rs": "rust",
    "html": "html",
    "css": "css"
  };
  return langMap[ext || ""] || "text";
}
function getFileContent(fileName) {
  const contentMap = {
    "index.ts": '// index.ts\nexport function hello(name: string): string {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(hello("Code Editor Land"));',
    "package.json": '{\n  "name": "code-editor-land",\n  "version": "1.0.0",\n  "description": "Native code editor built with Wind, Sky, and Mountain"\n}',
    "Readme.md": "# Code Editor Land\n\nA native code editor built with:\n- **Wind** - Effect-TS service layer\n- **Sky** - Astro UI components\n- **Mountain** - Rust backend"
  };
  return contentMap[fileName] || `// ${fileName}

// Edit this file to see changes
`;
}
function updateTabsUI() {
  const tabsContainer = document.getElementById("wind-editor-tabs");
  if (!tabsContainer) return;
  tabsContainer.innerHTML = "";
  openTabs.forEach((tab, path) => {
    const tabEl = document.createElement("div");
    tabEl.className = `wind-editor-tab ${path === currentFilePath ? "active" : ""}`;
    tabEl.dataset.path = path;
    tabEl.innerHTML = `
				<span class="wind-editor-tab-icon">${tab.icon}</span>
				<span class="wind-editor-tab-title">${tab.name}</span>
				<span class="wind-editor-tab-close">×</span>
			`;
    tabEl.querySelector(".wind-editor-tab-title")?.addEventListener("click", () => {
      currentFilePath = path;
      updateTabsUI();
      if (monacoEditor) {
        monacoEditor.setValue(tab.content);
        const language = getLanguageForFile(tab.name);
        const model = monaco.editor.createModel(tab.content, language);
        monacoEditor.setModel(model);
      }
    });
    tabEl.querySelector(".wind-editor-tab-close")?.addEventListener("click", (e) => {
      e.stopPropagation();
      openTabs.delete(path);
      if (currentFilePath === path) {
        const firstPath = openTabs.keys().next().value;
        currentFilePath = firstPath || null;
        if (firstPath && monacoEditor) {
          const firstTab = openTabs.get(firstPath);
          if (firstTab) {
            monacoEditor.setValue(firstTab.content);
            const language = getLanguageForFile(firstTab.name);
            const model = monaco.editor.createModel(firstTab.content, language);
            monacoEditor.setModel(model);
          }
        }
      }
      updateTabsUI();
    });
    tabsContainer.appendChild(tabEl);
  });
}
window.addEventListener("file-selected", (event) => {
  const detail = event.detail;
  loadFile(detail.path, detail.name, detail.isFolder);
});
window.addEventListener("load", initMonaco);
window.addEventListener("resize", () => {
  if (monacoEditor) {
    monacoEditor.layout();
  }
});
//# sourceMappingURL=Editor.astro_astro_type_script_index_1_lang.BU9bh82I.js.map
