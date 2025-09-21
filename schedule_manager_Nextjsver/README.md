# スケジュール管理アプリ

## 実装背景

## 使用技術

## 実装機能

## 使用方法

このプロジェクトをローカル環境で動作させるための手順です。

### 1. 必要なもの

- Docker
- Docker Compose

### 2. インストールとセットアップ

1.  **リポジトリをクローン**

    ```bash
    git clone git@github.com:Yama00K/schedule_management.git
    cd schedule_manager_Nextjsver
    ```

2.  **環境変数ファイルを作成**
    プロジェクトのルートにある`.env.example`（もしなければ作成を推奨）をコピーして、`.env`ファイルを作成します。

    ```bash
    cp .env.example .env
    ```

    その後、`.env`ファイルの中身をあなたの環境に合わせて編集してください。

3.  **Docker イメージをビルド**

    ```bash
    docker-compose build
    ```

4.  **データベースを起動**
    マイグレーションの前に、まずデータベースコンテナだけを起動します。

    ```bash
    docker-compose up -d db
    ```

5.  **データベースマイグレーションを実行**
    Alembic を使って、データベースにテーブルを作成します。
    ```bash
    docker-compose exec backend alembic upgrade head
    ```

### 3. アプリケーションの起動

全てのコンテナをバックグラウンドで起動します。

```bash
docker-compose up -d
```
