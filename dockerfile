#这里的nginx版本可以去掉 就会下载 latest
FROM nginx:1.17
#你需要将这里的angulardemo10换成你执行ng build在dist下生成的目录 一般是你的项目名称
COPY dist/advanced_web_frontend /usr/share/nginx/html
#这是将你配置好的nginx配置替换docker里默认的nginx 建议学习nginx
COPY ./nginx-angular.conf /etc/nginx/conf.d/default.conf