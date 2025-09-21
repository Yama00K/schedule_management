# スケジュール管理アプリ

## 実装背景

就職活動を進める中で、説明会や面接、エントリーシートの締め切りなど、管理すべきスケジュールが複雑化し、既存のツールでは対応しきれないと感じるようになりました。

このアプリケーションは、そんな自身の課題を解決するために「本当に必要な機能だけを備えたシンプルなスケジュール管理ツール」として開発しています。今後もアップデートを重ねていき、使いやすさを追求していく予定です。

## 使用技術

- Next.js
- FastAPI
- MySQL
- Python
- TypeScript
- SQLAlchemy
- shadcn/ui
- Docker

## 実装機能

- スケジュールの表示機能
- スケジュールの追加機能
- スケジュールの削除機能

## 使用方法

このプロジェクトをローカル環境で動作させるための手順です。

### 1. 必要なもの

- Docker
- Docker Compose

### 2. インストールとセットアップ

1.  **リポジトリをクローン**

    ```bash
    git clone git@github.com:Yama00K/schedule_management.git
    cd schedule_management
    ```

2.  **環境変数ファイルを作成**

    プロジェクトのルートにある`.env.example`（もしなければ作成を推奨）をコピーして、`.env`ファイルを作成します。

    ```bash
    cp .env.example .env
    ```

    その後、`.env`ファイルの中身をあなたの環境に合わせて編集してください。

3.  **Docker イメージをビルドし、立ち上げる**

    ```bash
    docker-compose up --build
    ```

4.  **データベースマイグレーションを実行**

    Alembic を使って、データベースにテーブルを作成します。

    ```bash
    docker-compose exec backend alembic upgrade head
    ```

5.  **データベースに仮データを作成**

    ```bash
    docker-compose exec backend bash
    python seed.py
    ```
