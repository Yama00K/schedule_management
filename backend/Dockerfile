# ベースイメージ
FROM python:3.12-slim

# 環境変数
ENV PYTHONUNBUFFERED=1

# 作業ディレクトリ
WORKDIR /app

# uvのインストール
RUN pip install uv

# 依存関係ファイルをコピーしてインストール
COPY requirements.txt .
RUN uv pip install -r requirements.txt --system

COPY ./src .

# アプリケーションの起動コマンド
# uvicornをuv経由で実行し、ホットリロードを有効にする
# CMD ["uv", "run", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]