"use client"

import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DayProps } from "react-day-picker";

interface EventData {
    title: string;
    date: string; // 'YYYY-MM-DD'形式の日付
    contents: string;
}

async function fetchEvents(): Promise<EventData[]> {
    try {
        const response = await fetch('http://localhost:8000/api/events', {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        console.log('Fetched events:', data);
        return data.map((event: any) => ({
            title: event.title,
            date: event.date,
            contents: event.contents
        }));
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

function CustomDay(props: DayProps, eventdata: EventData[]) {
    // 日付をYYYY-MM-DD形式の文字列に変換
    const dateString = props.day.date.toISOString().split('T')[0];
    const events = new Map(eventdata.map(event => [event.date, event]));
    const event = events.get(dateString);
    const isToday = new Date().toDateString() === props.day.date.toDateString();

    // もしイベントがあれば、Popoverとして日付をレンダリング
    if (event) {
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
                            {/* イベントがあることを示すドット */}
                            <span className="absolute bottom-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4 max-w-xs">
                        <div className="space-y-2">
                            <h4 className="font-bold">{event.title}</h4>
                            <p className="text-sm text-gray-600">{event.contents}</p>
                            <p className="text-xs text-gray-400">日付: {event.date}</p>
                        </div>
                    </PopoverContent>
                </Popover>
            </td>
        );
    }

    // イベントがない場合のデフォルト表示
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

export default function PopCalendar() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [eventdata, setEventdata] = useState<EventData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    useEffect(() => {
        const loadEvents = async () => {
            setLoading(true);
            try {
                const events = await fetchEvents();
                setEventdata(events);
            } catch (error) {
                console.error('Error loading events:', error);
            } finally {
                setLoading(false);
            }
        };
        loadEvents();
    }, []);

    const CustomDayWithEvents = (props: DayProps) => CustomDay(props, eventdata);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="animate-pulse bg-gray-200 h-64 rounded-md"></div>
                <p className="text-center text-gray-500">イベントを読み込み中...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                components={{
                    Day: CustomDayWithEvents
                }}
            />
            
            {/* デバッグ情報 */}
            {process.env.NODE_ENV === 'development' && (
                <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                        取得されたイベント数: {eventdata.length}
                    </p>
                    {date && (
                        <p className="text-sm text-gray-600">
                            選択された日付: {date.getFullYear()}年{date.getMonth() + 1}月{date.getDate()}日
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}