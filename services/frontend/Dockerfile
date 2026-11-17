FROM nginx:alpine

# Copy custom NGINX reverse-proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static frontend files to NGINX root directory
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]