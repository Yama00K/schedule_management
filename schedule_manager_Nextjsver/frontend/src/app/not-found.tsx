import Link from 'next/link'; // トップページへ戻るためにLinkコンポーネントをインポート
import { Button } from '@/components/ui/button'; // ボタンスタイルのためにButtonコンポーネントをインポート

// 404 Not Foundページコンポーネント
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-600">
        ページが見つかりませんでした
      </h2>
      <p className="mt-2 text-gray-500">
        お探しのページは存在しないか、移動された可能性があります。
      </p>

      {/* トップページへ戻るリンク */}
      <Link href="/">
        <Button className="mt-6" variant="default">
          トップページへ戻る
        </Button>
      </Link>
    </div>
  );
}
