"use client"

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import InputDateTime from "@/components/InputDateTime";
import { UserStarIcon } from "lucide-react";

// APIに送信するデータの型を定義
interface ScheduleData {
    title: string;
    start_time: Date;
    end_time: Date;
    tag: string;
    description: string;
}

// スケジュールを追加するAPIを呼び出す関数
async function addSchedule(data: ScheduleData) {
    try{
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/add-schedule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.json();
        console.log('Success:', result);
        alert("スケジュールが追加されました!");
        return result;
    } catch (error) {
        console.error('Error adding schedule:', error);
        alert("スケジュールの追加に失敗しました!");
        return error;
    }
    
}

export default function Home() {
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [startHour, setStartHour] = useState('00');
    const [startMinute, setStartMinute] = useState('00');
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [endHour, setEndHour] = useState('00');
    const [endMinute, setEndMinute] = useState('00');
    const [title, setTitle] = useState('');
    const [tag, setTag] = useState('');
    const [description, setDescription] = useState('');

    // 選択肢の配列を生成
    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

    // ローディング状態
    const [isLoading, setIsLoading] = useState(false);

    // 入力内容をクリアする関数
    const clearForm = () => {
        setStartDate(new Date());
        setEndDate(new Date());
        setStartHour('00');
        setStartMinute('00');
        setEndHour('00');
        setEndMinute('00');
        setTitle('');
        setTag('');
        setDescription('');
    };

    // 追加ボタンのクリックハンドラー
    const handleAddClick = async () => {
        if (!title || !startHour || !startMinute || !endHour || !endMinute) {
            alert('タスク名、開始時刻、終了時刻は必須です。');
            return;
        }

        // ✅ 日付チェックを追加
        if (!startDate || !endDate) {
            alert('開始日と終了日を選択してください。');
            return;
        }

        setIsLoading(true);

        try {
            // 開始日時のDateオブジェクトを作成
            const startDateTime = new Date(startDate);
            startDateTime.setHours(parseInt(startHour, 10), parseInt(startMinute, 10), 0, 0);
            console.log('startDateTime:', startDateTime);

            // 終了日時のDateオブジェクトを作成
            const endDateTime = new Date(endDate);
            endDateTime.setHours(parseInt(endHour, 10), parseInt(endMinute, 10), 0, 0);
            console.log('endDateTime:', endDateTime);

            console.log('startDateTime.toISOString():', startDateTime.toISOString());
            console.log('endDateTime.toISOString():', endDateTime.toISOString());
            // 保存するスケジュールデータを作成
            const scheduleData: ScheduleData = {
                title: title.trim(),
                start_time: startDateTime,
                end_time: endDateTime,
                tag: tag.trim(),
                description,
            };

            console.log('📝 送信データ:', scheduleData);
            
            // ✅ 開始時刻が終了時刻より前かチェック
            if (new Date(scheduleData.start_time) >= new Date(scheduleData.end_time)) {
                alert('開始時刻は終了時刻より前にしてください。');
                return;
            }

            const response = await addSchedule(scheduleData);
            clearForm();
        } catch (error: any) {
            console.error('Error in handleAddClick:', error);
        } finally {
            setIsLoading(false);
        }
    };
    // ロード時に日付をリセット
    useEffect(() => {
        setStartDate(new Date());
        setEndDate(new Date());
    }, []);
    
    // 開始日時が変更されたら、終了日時も変更する
    useEffect(() => {
        setEndDate(startDate);
    }, [startDate]);

    useEffect(() => {
        setEndHour(startHour);
    }, [startHour]);

    useEffect(() => {
        setEndMinute(startMinute);
    }, [startMinute]);

    return (
        <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-sm space-y-4">
                {/* ✅ タイトル */}
                <div>
                    <label className="text-2xl font-bold mb-2 text-left block" htmlFor="title">
                        タイトル
                    </label>
                    <Input 
                        placeholder="タイトル" 
                        className="w-full" 
                        id="title"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* ✅ 開始時刻 */}
                <div>
                    <label className="text-2xl font-bold mb-2 text-left block">
                        開始時刻
                    </label>
                    <InputDateTime 
                        date={startDate}
                        hour={startHour} 
                        minute={startMinute} 
                        onDateChange={setStartDate}
                        onHourChange={setStartHour}
                        onMinuteChange={setStartMinute}
                    />
                </div>

                {/* ✅ 終了時刻 */}
                <div>
                    <label className="text-2xl font-bold mb-2 text-left block">
                        終了時刻
                    </label>
                    <InputDateTime 
                        date={endDate}
                        hour={endHour} 
                        minute={endMinute} 
                        onDateChange={setEndDate}
                        onHourChange={setEndHour}
                        onMinuteChange={setEndMinute}
                    />
                </div>

                {/* ✅ タグ */}
                <div>
                    <label className="text-2xl font-bold mb-2 text-left block" htmlFor="tag">
                        タグ
                    </label>
                    <Input 
                        placeholder="タグ" 
                        className="w-full" 
                        id="tag" 
                        name="tag"
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                    />
                </div>

                {/* ✅ タスク内容 */}
                <div>
                    <label className="text-2xl font-bold mb-2 text-left block" htmlFor="description">
                        タスク内容
                    </label>
                    <Textarea 
                        placeholder="タスク内容" 
                        className="w-full !min-h-48 !h-48" 
                        rows={8} 
                        id="description"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* ✅ アクションボタン */}
                <div className="flex space-x-4 mt-6">
                    <Button
                        variant="default"
                        onClick={handleAddClick}
                        disabled={isLoading}
                        className={`
                            transition-all duration-200 font-medium
                            ${isLoading 
                                ? 'bg-slate-400 text-slate-100 cursor-wait animate-pulse' 
                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:transform active:scale-95'
                            }
                        `}
                    >
                        追加
                    </Button>
                    <Link href="/">
                        <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:transform active:scale-95">戻る</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}