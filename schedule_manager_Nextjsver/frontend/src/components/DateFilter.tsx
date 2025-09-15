"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// APIにリクエストを送る関数の型を定義
interface DateFilterProps {
  onFilterChange: (filters: { tag?: string; year?: number; month?: number; day?: number }) => void;
}

export default function DateFilter({ onFilterChange }: DateFilterProps) {
  // 年・月・日の状態をそれぞれ管理
  const [tag, setTag] = useState<string>("");
  const [year, setYear] = useState<number | undefined>();
  const [month, setMonth] = useState<number | undefined>();
  const [day, setDay] = useState<Date | undefined>();
  const [searchState, setSearchState] = useState<boolean>(false);

  // 年と月の選択肢を生成
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i); // 直近10年分
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // フィルターの状態が変化したら、親コンポーネントに通知
  useEffect(() => {
    onFilterChange({ 
        tag,
        year, 
        month, 
        day: day ? day.getDate() : undefined 
    });
    setSearchState(false);
  }, [searchState, onFilterChange]);

  // DatePickerで日付が選択されたら、年と月のStateも更新
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDay(selectedDate);
    if (selectedDate) {
      setYear(selectedDate.getFullYear());
      setMonth(selectedDate.getMonth() + 1);
    }
  };
  const handleClear = () => {
    setTag("");
    setYear(undefined);
    setMonth(undefined);
    setDay(undefined);
    setSearchState(!searchState);
  };

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 border rounded-lg">
        
        <div>
            <Label>タグ</Label>
            <Input id="tag" placeholder="タグを入力" className="w-60" value={tag} onChange={(e) => setTag(e.target.value)}/>
        </div>

        {/* 年フィルター */}
        <div>
            <Label>年</Label>
            <Select 
            value={year ? String(year) : undefined} 
            onValueChange={(value) => setYear(Number(value))}
            >
            <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="年を選択" />
            </SelectTrigger>
            <SelectContent>
                {years.map(y => <SelectItem key={y} value={String(y)}>{y}年</SelectItem>)}
            </SelectContent>
            </Select>
        </div>

        {/* 月フィルター */}
        <div>
            <Label>月</Label>
            <Select 
            value={month ? String(month) : undefined}
            onValueChange={(value) => setMonth(Number(value))}
            >
            <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="月を選択" />
            </SelectTrigger>
            <SelectContent>
                {months.map(m => <SelectItem key={m} value={String(m)}>{m}月</SelectItem>)}
            </SelectContent>
            </Select>
        </div>

        {/* 日フィルター */}
        <div>
            <Label>日</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                    variant={"outline"}
                    className={cn("w-[240px] justify-start text-left font-normal", !day && "text-muted-foreground")}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {day ? format(day, "PPP", { locale: ja }) : <span>日付を選択</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                    mode="single"
                    selected={day}
                    onSelect={handleDateSelect}
                    />
                </PopoverContent>
            </Popover>
        </div>

        <div>
            <Button onClick={() => setSearchState(!searchState)}>検索</Button>
        </div>
        <div>
            <Button onClick={handleClear}>リセット</Button>
        </div>
    </div>
  );
}