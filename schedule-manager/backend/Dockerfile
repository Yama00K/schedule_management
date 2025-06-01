# Pythonの軽量イメージをベースに使用
FROM python:3.11-slim

# 作業ディレクトリを設定(全てここに展開される)
WORKDIR /backend

# Python依存パッケージをインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Flaskアプリケーションのコードをコピー
# COPY . .

# Flaskアプリケーションの起動
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]