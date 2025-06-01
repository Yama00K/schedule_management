// APIエンドポイント
const API_BASE = "http://localhost:5000/schedules";  // Flaskが5000番ポートで直接起動している場合

// HTML要素の取得
const scheduleList = document.getElementById("schedule-list");

// スケジュール一覧取得と表示
async function fetchSchedules() {
    try {
        const response = await fetch(API_BASE);
        if (!response.ok) throw new Error("API通信失敗");

        const schedules = await response.json();
        scheduleList.innerHTML = ""; // 初期化

        schedules.forEach(schedule => {
            const item = document.createElement("li");
            item.textContent = `[${schedule.id}] ${schedule.title} (${schedule.start} ~ ${schedule.end})`;
            scheduleList.appendChild(item);
        });
    } catch (err) {
        console.error("取得エラー:", err);
        scheduleList.innerHTML = "<li>取得に失敗しました</li>";
    }
}

// ページロード時に取得
window.addEventListener("DOMContentLoaded", fetchSchedules);
