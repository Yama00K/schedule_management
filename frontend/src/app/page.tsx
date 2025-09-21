// Linkコンポーネントをnext/linkからインポート
import Link from 'next/link';
// shadcn/uiのButtonコンポーネントをインポート
import { Button } from '@/components/ui/button';
import LiveClock from '@/components/LiveClock'; // LiveClockコンポーネントをインポート
import PopCalendar from '@/components/PopCalendar'; // PopCalendarコンポーネントをインポート

export default function Home() {
  return (
    <div>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">スケジュール管理アプリ</h1>
        <LiveClock />
        <div className="flex justify-center mt-6 ">
          <PopCalendar />
        </div>
        <div className="mt-6 space-x-4">
          <Link href="/schedules">
            <Button variant="default">スケジュール一覧へ</Button>
          </Link>
          <Link href="/add-schedule">
            <Button variant="default">新しいスケジュールを作成</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
