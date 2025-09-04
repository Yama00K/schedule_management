# ベースイメージ
FROM node:20-alpine

# 作業ディレクトリ
WORKDIR /app

# 依存関係ファイルを先にコピーしてキャッシュを活用
COPY package*.json ./
RUN npm install

# ソースコードをコピー
COPY . .

# Next.jsが使用するポートを公開
EXPOSE 3000

# 開発サーバーの起動コマンド
CMD ["npm", "run", "dev"]