# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies (skip optional packages that may fail)
RUN yarn install --frozen-lockfile --ignore-optional 2>/dev/null || yarn install --ignore-optional

# Copy source code
COPY . .

# Build the React app
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

RUN yarn build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Railway sets PORT env var, nginx uses it via envsubst
ENV PORT=8080

EXPOSE 8080

CMD ["sh", "-c", "envsubst '$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
