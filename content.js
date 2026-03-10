// ==UserScript==
// @name         AtCoder NoviSteps Auto Sync
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  AtCoder ProblemsのAC状況をNoviStepsに自動反映します
// @author       YourName
// @match        https://atcoder-novisteps.vercel.app/workbooks/*
// @grant        none
// ==/UserScript==

(async function () {
  "use strict";

  // ユーザー名をLocalStorageに保存して、初回だけ聞くようにする
  let user = localStorage.getItem("atcoder_user_id");
  if (!user) {
    user = prompt("AtCoderのユーザー名を入力してください（同期用）:");
    if (user) localStorage.setItem("atcoder_user_id", user);
    else return;
  }

  const workbookId = location.pathname.split("/").pop();
  console.log("🚀 同期中...");

  try {
    const res = await fetch(
      `https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${user}&from_second=0`,
    );
    const submissions = await res.json();
    const acProblemIds = new Set(
      submissions.filter((s) => s.result === "AC").map((s) => s.problem_id),
    );

    const scriptTag = Array.from(document.querySelectorAll("script")).find(
      (s) => s.textContent.includes("workBookTasks"),
    );
    const taskIds = [...scriptTag.textContent.matchAll(/taskId:"(.*?)"/g)].map(
      (m) => m[1],
    );

    for (const atcoderId of taskIds) {
      // ここで「まだ未挑戦(ns)」かどうかを判定するロジックを入れるとさらに効率的
      if (acProblemIds.has(atcoderId)) {
        const formData = new FormData();
        formData.append("taskId", atcoderId);
        formData.append("submissionStatus", "ac");

        await fetch(`/workbooks/${workbookId}?/update`, {
          method: "POST",
          body: formData,
          headers: { "x-sveltekit-action": "true" },
        });
        await new Promise((r) => setTimeout(r, 200));
      }
    }
    console.log("✅ 同期完了");
  } catch (e) {
    console.error("❌ 同期エラー:", e);
  }
})();
