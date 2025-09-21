'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DateFilter from '@/components/DateFilter';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';

// APIから取得するスケジュールデータの型を定義
interface ApiEventData {
  created_at: string;
  description: string;
  end_time: string;
  id: number;
  start_time: string;
  tag: string | null;
  tag_id: number | null;
  title: string;
  updated_at: string;
}

// コンポーネント内で使用するスケジュールの型を定義
interface AppSchedule {
  created_at: Date;
  description: string;
  end_time: Date;
  id: number;
  start_time: Date;
  tag: string | null;
  tag_id: number | null;
  title: string;
  updated_at: Date;
}

// メインコンポーネント
export default function Home() {
  const [schedules, setSchedules] = useState<AppSchedule[] | undefined>(
    undefined
  );
  const [deleteMode, setDeleteMode] = useState(false);
  const [tag, setTag] = useState<string>('');
  const [year, setYear] = useState<number | undefined>();
  const [month, setMonth] = useState<number | undefined>();
  const [day, setDay] = useState<number | undefined>();
  const customOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  // フィルター条件が変わるたびにAPIを叩く関数
  const handleFilterChange = async (filters: {
    tag?: string;
    year?: number;
    month?: number;
    day?: number;
  }) => {
    // URLSearchParamsを使って、存在するパラメータだけをURLに追加
    const params = new URLSearchParams();
    if (filters.tag) params.append('tag', String(filters.tag));
    if (filters.year) params.append('year', String(filters.year));
    if (filters.month) params.append('month', String(filters.month));
    if (filters.day) params.append('day', String(filters.day));

    console.log(`Fetching with params: ${params.toString()}`);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/schedules?${params.toString()}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: ApiEventData[] = await response.json();
      const processedSchedules: AppSchedule[] = data.map((item) => ({
        id: item.id,
        title: item.title,
        start_time: new Date(item.start_time + 'Z'),
        end_time: new Date(item.end_time + 'Z'),
        created_at: new Date(item.created_at + 'Z'),
        updated_at: new Date(item.updated_at + 'Z'),
        description: item.description,
        tag: item.tag,
        tag_id: item.tag_id,
      }));
      setSchedules(processedSchedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };
  // 削除ボタンが押された時の処理
  const handleDelete = async (id: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/delete-schedule/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const deleted = await response.json();
      console.log('Deleted:', deleted);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('スケジュールの削除に失敗しました!');
    } finally {
      handleFilterChange({ tag, year, month, day });
    }
  };
  // 検索条件を親コンポーネントに渡す関数
  const handleSearch = (params: {
    tag?: string;
    year?: number;
    month?: number;
    day?: number;
  }) => {
    setTag(params.tag || '');
    setYear(params.year || undefined);
    setMonth(params.month || undefined);
    setDay(params.day || undefined);
  };
  // 検索条件や削除状態が変わるたびにAPIを叩く
  useEffect(() => {
    handleFilterChange({ tag, year, month, day });
  }, [tag, year, month, day]);

  return (
    <div>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">スケジュール一覧</h1>
        <div className="flex items-center gap-4">
          <DateFilter onFilterChange={handleSearch} />
        </div>
        <div className="mt-6">
          {schedules == undefined ? (
            <p>表示条件を選択してください</p>
          ) : (
            <Accordion type="single" collapsible className="w-full max-w-md">
              {schedules.map((schedule) => (
                <AccordionItem key={schedule.id} value={`item-${schedule.id}`}>
                  <AccordionTrigger>{schedule.title}</AccordionTrigger>
                  <AccordionContent>
                    <p>{schedule.description}</p>
                    <p>
                      開始日時:{' '}
                      {schedule.start_time.toLocaleString(
                        undefined,
                        customOptions
                      )}
                    </p>
                    <p>
                      終了日時:{' '}
                      {schedule.end_time.toLocaleString(
                        undefined,
                        customOptions
                      )}
                    </p>
                  </AccordionContent>
                  {deleteMode && (
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(schedule.id)}
                      >
                        削除
                      </Button>
                    </div>
                  )}
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
        <div className="mt-6 space-x-4">
          <Button variant="default" onClick={() => setDeleteMode(!deleteMode)}>
            編集
          </Button>
          <Link href="/">
            <Button variant="default">戻る</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
