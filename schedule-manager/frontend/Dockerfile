FROM nginx:alpine

# 作業ディレクトリ(デフォルトで /usr/share/nginx/html)
WORKDIR /usr/share/nginx/html

# 静的ファイルをコピー
# COPY ./static/ ./

# 証明書をコピー
# certsディレクトリの階層に注意(おそらく./frontend/certs/にする必要あり)
# docker-compose.ymlのvolumesで管理している場合は不要
# COPY ./certs/ /etc/nginx/certs/

# Nginx設定をコピー
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf