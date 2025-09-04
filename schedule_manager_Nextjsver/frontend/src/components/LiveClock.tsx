"use client";

import { useState, useEffect } from 'react';

export default function LiveClock() {
  // 1. 現在の時刻を"記憶"する場所を用意
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // このコードはブラウザでのみ実行される
    // 最初に現在の時刻を設定
    setCurrentTime(new Date());

    // 1秒ごとに時刻を更新するタイマーを設定
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // コンポーネントが消えるときにタイマーを停止
    return () => clearInterval(timer);
  }, []); // 空の配列[]は「最初の1回だけ実行して」という意味

  return (
    <div className="p-4 border rounded-lg text-center bg-gray-50">
      <p className="font-medium">現在の時刻 (Live)</p>
      <p className="text-2xl font-bold font-mono mt-2">
        {/* currentTimeが設定されるまでローディング表示 */}
        {currentTime ? currentTime.toLocaleString('ja-JP') : '...'}
      </p>
    </div>
  );
}