(async function () {
  "use strict";

  const USER_ID = ""; // ここに AtCoder ID を入力
  const STORAGE_KEY = `synced_ids_${USER_ID}`;

  // ========================================
  // スタイルの注入
  // ========================================
  function injectStyles() {
    if (document.getElementById("ns-styles")) return;
    const style = document.createElement("style");
    style.id = "ns-styles";
    style.textContent = `
      @keyframes ns-slide-up {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes ns-fade-out {
        from { opacity: 1; transform: translateY(0); }
        to   { opacity: 0; transform: translateY(-8px); }
      }
      @keyframes ns-btn-appear {
        from { opacity: 0; transform: translateY(16px) scale(0.96); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      #ns-sync-btn {
        animation: ns-btn-appear 0.3s ease;
      }
      #ns-sync-btn:not(:disabled):hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3) !important;
      }
      #ns-sync-btn:not(:disabled):active {
        transform: translateY(0);
      }
      #ns-sync-progress {
        display: block;
        width: 0%;
        height: 3px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 0 0 10px 10px;
        position: absolute;
        bottom: 0;
        left: 0;
        transition: width 0.3s ease;
      }
    `;
    document.head.appendChild(style);
  }

  // ========================================
  // トースト通知（alert の代わり）
  // ========================================
  function showToast(message, type) {
    const old = document.getElementById("ns-toast");
    if (old) old.remove();

    const colors = {
      success: { bg: "#ecfdf5", border: "#86efac", text: "#065f46" },
      error: { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b" },
      info: { bg: "#f0f9ff", border: "#93c5fd", text: "#1e40af" },
    };
    const c = colors[type] || colors.info;

    const el = document.createElement("div");
    el.id = "ns-toast";
    el.textContent = message;
    el.style.cssText = `
      position: fixed; bottom: 80px; right: 24px; z-index: 999998;
      padding: 12px 20px; max-width: 320px;
      background: ${c.bg}; color: ${c.text};
      border: 1px solid ${c.border}; border-radius: 10px;
      font-family: "Hiragino Kaku Gothic ProN", "Noto Sans JP", system-ui, sans-serif;
      font-size: 13px; line-height: 1.7; white-space: pre-line;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      animation: ns-slide-up 0.25s ease;
    `;
    document.body.appendChild(el);

    setTimeout(() => {
      el.style.animation = "ns-fade-out 0.25s ease forwards";
      setTimeout(() => el.remove(), 250);
    }, 4000);
  }

  // ========================================
  // 確認モーダル（confirm の代わり）
  // ========================================
  function showConfirm(message) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 1000000;
        background: rgba(0, 0, 0, 0.25); backdrop-filter: blur(2px);
        display: flex; align-items: center; justify-content: center;
        animation: ns-slide-up 0.2s ease;
      `;

      const card = document.createElement("div");
      card.style.cssText = `
        background: #fff; border-radius: 14px; padding: 28px 32px;
        max-width: 340px; width: 88%; text-align: center;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        font-family: "Hiragino Kaku Gothic ProN", "Noto Sans JP", system-ui, sans-serif;
      `;

      const msg = document.createElement("p");
      msg.textContent = message;
      msg.style.cssText = `
        margin: 0 0 22px; font-size: 14px; line-height: 1.8;
        color: #374151; white-space: pre-line;
      `;

      const btnRow = document.createElement("div");
      btnRow.style.cssText =
        "display: flex; gap: 10px; justify-content: center;";

      const makeBtn = (text, primary) => {
        const b = document.createElement("button");
        b.textContent = text;
        b.style.cssText = `
          padding: 9px 26px; border-radius: 8px; font-size: 13px;
          font-weight: 600; cursor: pointer; border: none;
          transition: background 0.15s ease;
          font-family: inherit;
          ${
            primary
              ? "background: #22c55e; color: #fff;"
              : "background: #f3f4f6; color: #6b7280;"
          }
        `;
        if (primary) {
          b.onmouseover = () => (b.style.background = "#16a34a");
          b.onmouseleave = () => (b.style.background = "#22c55e");
        } else {
          b.onmouseover = () => (b.style.background = "#e5e7eb");
          b.onmouseleave = () => (b.style.background = "#f3f4f6");
        }
        return b;
      };

      const cancelBtn = makeBtn("やめておく", false);
      const okBtn = makeBtn("同期する", true);

      cancelBtn.onclick = () => {
        overlay.remove();
        resolve(false);
      };
      okBtn.onclick = () => {
        overlay.remove();
        resolve(true);
      };

      btnRow.append(cancelBtn, okBtn);
      card.append(msg, btnRow);
      overlay.appendChild(card);
      document.body.appendChild(overlay);
    });
  }

  // ========================================
  // リロード後の通知
  // ========================================
  const syncResult = sessionStorage.getItem("sync_result");
  if (syncResult) {
    sessionStorage.removeItem("sync_result");
    setTimeout(() => showToast(syncResult, "success"), 500);
  }

  // ========================================
  // 同期済みリストの読み書き
  // ========================================
  const getSyncedIds = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  };

  const saveSyncedIds = (idSet) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...idSet]));
  };

  // ========================================
  // 同期ボタンの注入
  // ========================================
  function injectSyncButton() {
    if (document.getElementById("ns-sync-btn") || !document.body) return;
    injectStyles();

    const btn = document.createElement("button");
    btn.id = "ns-sync-btn";

    const label = document.createElement("span");
    label.id = "ns-sync-label";
    label.textContent = "AC を同期";

    const progress = document.createElement("span");
    progress.id = "ns-sync-progress";

    btn.append(label, progress);
    btn.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 999999;
      padding: 11px 24px; background: #5cb88A; color: #fff;
      border: none; border-radius: 10px; cursor: pointer;
      font-family: "Hiragino Kaku Gothic ProN", "Noto Sans JP", system-ui, sans-serif;
      font-size: 13px; font-weight: 700; letter-spacing: 0.02em;
      box-shadow: 0 2px 10px rgba(34, 197, 94, 0.18);
      transition: all 0.2s ease;
      overflow: hidden;
    `;

    function resetBtn() {
      label.textContent = "AC を同期";
      btn.disabled = false;
      btn.style.cursor = "pointer";
      btn.style.opacity = "1";
      progress.style.width = "0%";
    }

    function setBusy(text) {
      btn.disabled = true;
      btn.style.cursor = "wait";
      btn.style.opacity = "0.85";
      label.textContent = text;
    }

    btn.onclick = async () => {
      if (!USER_ID) {
        showToast(
          "AtCoder ID が設定されていません。\ncontent.js の USER_ID を確認してください。",
          "error",
        );
        return;
      }

      setBusy("確認中…");

      try {
        const acRes = await fetch(
          `https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${encodeURIComponent(USER_ID)}&from_second=0`,
        );
        const submissions = await acRes.json();
        const allAcIds = [
          ...new Set(
            submissions
              .filter((s) => s.result === "AC")
              .map((s) => s.problem_id),
          ),
        ];

        const syncedIds = getSyncedIds();
        const tasksToSync = allAcIds.filter((id) => !syncedIds.has(id));

        if (tasksToSync.length === 0) {
          showToast("すべて同期済みです！", "success");
          resetBtn();
          return;
        }

        resetBtn();
        const ok = await showConfirm(
          `新しく ${tasksToSync.length} 問の AC が見つかりました！\nNoviSteps に同期しますか？`,
        );
        if (!ok) return;

        setBusy("同期中…");

        let successCount = 0;
        for (let i = 0; i < tasksToSync.length; i++) {
          const pid = tasksToSync[i];
          const formData = new FormData();
          formData.append("taskId", pid);
          formData.append("submissionStatus", "ac");

          const response = await fetch("/problems?/update", {
            method: "POST",
            body: formData,
            headers: { "x-sveltekit-action": "true" },
          });

          if (response.ok) {
            successCount++;
            syncedIds.add(pid);
          }

          const pct = Math.round(((i + 1) / tasksToSync.length) * 100);
          label.textContent = `同期中… ${i + 1} / ${tasksToSync.length}`;
          progress.style.width = `${pct}%`;
          await new Promise((r) => setTimeout(r, 500 + Math.random() * 200));
        }

        saveSyncedIds(syncedIds);

        sessionStorage.setItem(
          "sync_result",
          `同期が完了しました！\n${successCount} 問を追加しました`,
        );
        location.reload();
      } catch (e) {
        console.error(e);
        showToast(
          "同期に失敗しました。\nしばらくしてからもう一度お試しください。",
          "error",
        );
        label.textContent = "もう一度試す";
        btn.disabled = false;
        btn.style.cursor = "pointer";
        btn.style.opacity = "1";
      }
    };

    document.body.appendChild(btn);
  }

  injectSyncButton();
  new MutationObserver(injectSyncButton).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
