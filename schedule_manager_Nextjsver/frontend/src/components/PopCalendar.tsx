"use client"

import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DayProps } from "react-day-picker";
import { format } from "date-fns";

// APIから取得するイベントデータの型
interface ApiEventData {
    created_at: string
    description: string
    end_time: string
    id: number
    start_time: string
    tag: string | null
    tag_id: number | null
    title: string
    updated_at: string
}

// 表示するイベントデータの型
interface EventData {
    date: string; // 'YYYY-MM-DD'形式の日付
    events: {
        title: string;
        start_time: string;
        end_time: string;
        contents: string;
    }[];
}

// APIからイベントデータを取得する関数
async function fetchEvents(date: Date): Promise<ApiEventData[]> {
    // ✅ 1. 入力検証 - dateが有効かチェック
    if (!date || isNaN(date.getTime())) {
        console.error('❌ Invalid date provided to fetchEvents');
        throw new Error('Valid date is required');
    }

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        // ✅ 2. 必須パラメータの取得
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        console.log('📡 必須パラメータ:', { year, month });
        
        // ✅ 3. 必須パラメータでURLSearchParamsを構築
        const params = new URLSearchParams({
            year: year.toString(),
            month: month.toString()
        });
        
        console.log('🔗 Request URL:', `${apiUrl}/api/events?${params.toString()}`);
        
        const response = await fetch(`${apiUrl}/api/events?${params.toString()}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
        }

        const data: ApiEventData[] = await response.json();
        console.log('✅ Fetched events:', data);
        return data;
    } catch (error) {
        console.error('❌ Error fetching events:', error);
        return [];
    }
}

// カレンダーへ埋め込むカスタムdayコンポーネント
function CustomDay(props: DayProps, eventdata: EventData[]) {
    const dateString = format(props.day.date, 'yyyy年M月d日');
    const dayData = eventdata.find(data => data.date === dateString);
    const isToday = format(new Date(), 'yyyy-MM-dd') === format(props.day.date, 'yyyy-MM-dd');

    if (dayData && dayData.events.length > 0) {
        return (
            <td>
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            className={`
                                relative flex items-center justify-center w-9 h-9 text-base font-normal 
                                hover:bg-accent rounded-md border border-red-500 
                                hover:border-2 hover:border-red-600
                                ${isToday ? 'bg-blue-500 text-white font-bold' : ''}
                                ${props.modifiers.selected ? 'bg-blue-100' : ''}
                            `}
                        >
                            {props.day.date.getDate()}
                            {/* ✅ 複数イベントの場合は数字を表示 */}
                            <span className="absolute bottom-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            {dayData.events.length > 1 && (
                                <span className="absolute top-0 right-0 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {dayData.events.length}
                                </span>
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4 max-w-sm">
                        <div className="space-y-3">
                            <h4 className="font-bold border-b pb-1">
                                {dayData.date} ({dayData.events.length}件のイベント)
                            </h4>
                            
                            {/* ✅ 複数のイベントを別々のdivで表示 */}
                            {dayData.events.map((event, index) => (
                                <div 
                                    key={index} 
                                    className={`
                                        p-3 rounded-lg border-l-4 
                                        ${index === 0 ? 'border-l-blue-500 bg-blue-50' : 
                                          index === 1 ? 'border-l-green-500 bg-green-50' : 
                                          index === 2 ? 'border-l-orange-500 bg-orange-50' : 
                                          'border-l-gray-500 bg-gray-50'}
                                    `}
                                >
                                    <div className="space-y-1">
                                        <h5 className="font-semibold text-sm">
                                            {event.title}
                                        </h5>
                                        <p className="text-xs text-gray-600">
                                            {event.contents}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            開始時刻:{event.start_time}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            終了時刻:{event.end_time}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            イベント {index + 1}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </td>
        );
    }

    return (
        <td>
            <button 
                className={`
                    flex items-center justify-center w-9 h-9 text-base font-normal 
                    hover:bg-accent rounded-md
                    ${isToday ? 'bg-blue-500 text-white font-bold ring-2 ring-blue-300' : ''}
                    ${props.modifiers.selected ? 'bg-blue-100' : ''}
                `}
            >
                {props.day.date.getDate()}
            </button>
        </td>
    );
}

// メインコンポーネント(イベントカレンダー)
export default function PopCalendar() {
    const [date, setDate] = useState<Date>(new Date()); // Date | undefined → Date
    const [eventdata, setEventdata] = useState<EventData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // dateが変わるたびにイベントを再取得
    useEffect(() => {
        const loadEvents = async () => {

            setLoading(true);
            setError('');
            
            try {
                // ✅ ページめくり検知ログ
                console.log(`📅 カレンダーページ変更: ${date.getFullYear()}年${date.getMonth() + 1}月`);
                console.log(`📅 依存配列トリガー: year=${date.getFullYear()}, month=${date.getMonth()}`);
                
                const rawEvents: ApiEventData[] = await fetchEvents(date);

                const eventsMap = new Map<string, { title: string; start_time: string; end_time: string; contents: string }[]>();

                rawEvents.forEach(event => {
                    const startDate = new Date(event.start_time + 'Z');
                    const endDate = new Date(event.end_time + 'Z');
                    const currentDate = new Date(startDate);
                    let startTimeDisplay = null;
                    let endTimeDisplay = null;
                    
                    while (currentDate <= endDate) {
                        const dateString = format(currentDate, 'yyyy年M月d日');
                        // 開始日か判断
                        if (currentDate.getDate() === startDate.getDate()) {
                            startTimeDisplay = startDate.toLocaleString(undefined, {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: false
                                                    });
                        } else{
                            startTimeDisplay = '';
                        };
                        // 終了日か判断
                        if (currentDate.getDate() === endDate.getDate()){
                            endTimeDisplay = endDate.toLocaleString(undefined, {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            });
                        } else {
                            endTimeDisplay = '';  
                        };

                        const eventItem = {
                            title: event.title,
                            start_time: startTimeDisplay,
                            end_time: endTimeDisplay,
                            contents: event.description || '詳細情報なし'
                        };

                        const existingEvents = eventsMap.get(dateString) || [];
                        existingEvents.push(eventItem);
                        eventsMap.set(dateString, existingEvents);
                        
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                });

                const finalEvents: EventData[] = Array.from(eventsMap.entries()).map(([date, events]) => ({
                    date,
                    events
                }));

                setEventdata(finalEvents);

                console.log(`✅ ページめくり完了: ${finalEvents.length}日分のデータ（総イベント数: ${finalEvents.reduce((sum, day) => sum + day.events.length, 0)}件）`);
            } catch (error) {
                console.error('Error loading events:', error);
                setError('イベントの取得に失敗しました');
            } finally {
                setLoading(false);
            }
        };
        
        loadEvents();
    }, [date]); // ✅ これで確実にページめくりを検知

    const handleMonthChange = (updatedMonth: Date) => {
        setDate(updatedMonth); // 月変更時にdateも更新
        console.log('📅 月変更:', updatedMonth);
    }

    const CustomDayWithEvents = useCallback((props: DayProps) => {
        return CustomDay(props, eventdata);
    }, [eventdata]); // eventdataが変わったときだけ、この関数を再生成する

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="animate-pulse bg-gray-200 h-64 rounded-md"></div>
                <p className="text-center text-gray-500">📅 イベントを読み込み中...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600">❌ {error}</p>
                    <button 
                        onClick={() => {
                            setError('');
                            setDate(new Date()); // 現在日時にリセット
                        }}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        再試行
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Calendar
                mode="single"
                selected={date}
                month={date}
                onMonthChange={handleMonthChange}
                className="rounded-md border"
                components={{
                    Day: CustomDayWithEvents
                }}
            />
        </div>
    );
}