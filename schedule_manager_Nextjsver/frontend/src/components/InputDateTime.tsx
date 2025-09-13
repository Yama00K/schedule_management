"use client";

import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";

// propsの型を定義
interface InputDateTimeProps {
    date?: Date;
    hour?: string;
    minute?: string;
    onDateChange?: (value: Date) => void;
    onHourChange: (value: string) => void;
    onMinuteChange: (value: string) => void;
}

export default function InputDateTime({
    date,
    hour,
    minute,
    onDateChange,
    onHourChange,
    onMinuteChange
}: InputDateTimeProps) {
  // 選択肢の配列はコンポーネントの外に出すか、useMemoでメモ化するのが望ましい
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className="space-y-2">
      <div id="time-picker" className="flex items-center gap-2">
        {/* 日付のセレクトボックス */}
        <Popover>
            <PopoverTrigger asChild>
                <Button
                variant={"outline"}
                className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                )}
                >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                    format(date, "PPP", { locale: ja })
                ) : (
                    <span>日付を選択</span>
                )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                mode="single"
                selected={date}
                onSelect={onDateChange}
                />
            </PopoverContent>
        </Popover>

        {/* 時間のセレクトボックス */}
        <Select value={hour} onValueChange={onHourChange}>
          <SelectTrigger>
            <SelectValue placeholder="時" />
          </SelectTrigger>
          <SelectContent>
            {hours.map((h) => (
              <SelectItem key={h} value={h}>
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span>:</span>

        {/* 分のセレクトボックス */}
        <Select value={minute} onValueChange={onMinuteChange}>
          <SelectTrigger>
            <SelectValue placeholder="分" />
          </SelectTrigger>
          <SelectContent>
            {minutes.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}