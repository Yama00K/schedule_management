# ベースイメージ
FROM node:20-alpine

# 作業ディレクトリ
WORKDIR /app

# yarnを有効化（Node.js 16+ではcorepackに含まれる）
RUN corepack enable yarn

# 依存関係ファイルを先にコピーしてキャッシュを活用
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# ソースコードをコピー
COPY . .

# Next.jsが使用するポートを公開
EXPOSE 3000

# 開発サーバーの起動コマンド
CMD ["yarn", "dev"]