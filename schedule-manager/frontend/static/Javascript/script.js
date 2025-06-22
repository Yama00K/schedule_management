// スケジュール一覧取得と表示
async function fetchSchedules() {
    try {
        const response = await fetch("/api/schedules");
        if (!response.ok) throw new Error("API通信失敗");

        const schedules = await response.json();
        console.log("取得したスケジュール:", schedules);
        renderCalendar(schedules.year, schedules.month)
        schedules.schedules.forEach(schedule => {
            const startDate = schedule.start.split('T')[0];
            const endDate = schedule.end.split('T')[0];
            console.log(`スケジュール: ${schedule.title}, 開始: ${startDate}, 終了: ${endDate}`);
            for(
                let date = new Date(startDate);
                date <= new Date(endDate);
                date.setDate(date.getDate() + 1)
            ){
                const dateStr = date.toISOString().split("T")[0]; // 'YYYY-MM-DD'
                const cell = document.querySelector(`td[data-date="${dateStr}"]`);
                if (cell) {
                    const div = document.createElement('div');
                    if (startDate === endDate) {
                        const start_time = schedule.start.slice(11, 16);
                        const end_time = schedule.end.slice(11, 16);
                        div.textContent = `${schedule.title} (${start_time} ~ ${end_time})`;
                    }
                    else {
                        if (dateStr === schedule.start.split("T")[0]) {
                            const time = schedule.start.slice(11, 16);
                            div.textContent = `${schedule.title} (${time} ~)`;
                        } else if (dateStr === schedule.end.split("T")[0]) {
                            const time = schedule.end.slice(11, 16);
                            div.textContent = `${schedule.title} (~ ${time})`;
                        } else {
                            div.textContent = `${schedule.title}`;
                        }
                    }
                    div.classList.add('schedule');
                    cell.appendChild(div);
                }
            }
        });
    } catch (err) {
        console.error("取得エラー:", err);
    }
}

function renderCalendar(year, month) {
  const calendarBody = document.querySelector('#calendar tbody');
  calendarBody.innerHTML = ''; // カレンダーを初期化

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const numDays = lastDay.getDate();
  const startWeekday = firstDay.getDay(); // 0 = 日曜

  let day = 1;
  let day_schedule = 1;
  while (day <= numDays) {
    const row_day = document.createElement('tr');

    for (let i = 0; i < 7; i++) {
      const cell = document.createElement('td');

      // 最初の行で曜日が始まる位置まで空セル
      if ((day === 1 && i < startWeekday) || day > numDays) {
        cell.textContent = '';
      } else {
        cell.textContent = day;
        day++;
      }
      row_day.appendChild(cell);
    }
    calendarBody.appendChild(row_day);

    const row_schedule = document.createElement('tr');

    for (let i = 0; i < 7; i++) {
      const cell = document.createElement('td');

      // 最初の行で曜日が始まる位置まで空セル
      if ((day_schedule === 1 && i < startWeekday) || day_schedule > numDays) {
        cell.textContent = '';
      } else {
        cell.setAttribute('data-date', `${year}-${String(month).padStart(2, '0')}-${String(day_schedule).padStart(2, '0')}`);
        console.log("")
        day_schedule++;
      }
      row_schedule.appendChild(cell);
    }
    calendarBody.appendChild(row_schedule);
  }
}

// ページロード時に取得
window.addEventListener("DOMContentLoaded", fetchSchedules);
