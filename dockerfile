FROM httpd:2.4
COPY apache-angular.conf /usr/local/apache2/conf/httpd.conf
COPY .htaccess /usr/local/apache2/htdocs/
COPY dist/advanced_web_frontend /usr/local/apache2/htdocs/
