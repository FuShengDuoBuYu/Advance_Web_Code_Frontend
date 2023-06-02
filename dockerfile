#设置一个基本的镜像，FROM 后面是镜像的名字，这个镜像是 Docker 官方提供的，这个镜像里面包含了 Node.js，可以在node后跟冒号 声明镜像版本。as builder 是给它起了个别名
FROM node as builder
#WORKDIR 指令设置了工作目录的位置，意思就是进入到 /usr/src/app 这个目录，然后要在这个目录里去做一些事情。这里的目录是在镜像里的一个位置。
WORKDIR /usr/src/app

#COPY 指令可以复制本地主机上的文件到镜像里，第一个点指的是 Dockerfile 文件所在的目录，这个目录是本地主机上的位置。第二个点指的是镜像里的当前目录，因为之前用 WORKDIR 设置了工作目录的位置，所以第二个点在这里指的就是镜像里的 /usr/src/app 这个目录。

#这一步做的事情就是把在本地上的 Angular 应用复制到镜像里面。
COPY . .
# 远程下载
RUN wget --load-cookies ./cookies.txt "https://docs.google.com/uc?export=download&confirm=$(wget --quiet --save-cookies ./cookies.txt --keep-session-cookies --no-check-certificate 'https://docs.google.com/uc?export=download&id=1fGlOY9zs5xeyWL4K5vcIDQI4vMn6gX_d' -O- | sed -rn 's/.*confirm=([0-9A-Za-z_]+).*/\1\n/p')&id=1fGlOY9zs5xeyWL4K5vcIDQI4vMn6gX_d" -O /usr/src/app/src/assets/model/rac_advanced_sample_project.obj && rm -rf ./cookies.txt
#运行了一下 npm install 命令，也就是安装 Angular 项目需要的所有的东西
RUN npm install
#它运行的是 ng build --prod，作用就是构建一个适合在生产环境上运行的 Angular 应用
RUN npm run build --prod
#这里的nginx版本可以去掉 就会下载 latest
FROM nginx:1.17
#copy一份obj
COPY --from=builder /usr/src/app/src/assets/model/rac_advanced_sample_project.obj /usr/src/app/dist/advanced_web_frontend/assets/model/rac_advanced_sample_project.obj
#你需要将这里的angulardemo10换成你执行ng build在dist下生成的目录 一般是你的项目名称
COPY --from=builder /usr/src/app/dist/advanced_web_frontend /usr/share/nginx/html
#这是将你配置好的nginx配置替换docker里默认的nginx 建议学习nginx
COPY ./nginx-angular.conf /etc/nginx/conf.d/default.conf