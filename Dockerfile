FROM node:12-alpine

LABEL maintainer="ownCloud GmbH <devops@owncloud.com>" \
    org.label-schema.name="kimai-dashboard" \
    org.label-schema.vendor="ownCloud GmbH" \
    org.label-schema.schema-version="1.0"

ENV NEXT_TELEMETRY_DISABLED=1
ENV NO_UPDATE_NOTIFIER=true
ENV NODE_ENV=production
ENV PORT=3000

RUN mkdir -p /opt/app/database
WORKDIR /opt/app

ADD . /opt/app/
RUN addgroup -g 1001 -S nextjs && \
    adduser -S -D -H -u 1001 -h /var/www -s /sbin/nologin -G nextjs -g nextjs nextjs && \
    apk --update add --virtual .build-deps python3 make g++ && \
    apk --update --no-cache add libc6-compat && \
    npm ci --only=production && \
    npm run build && \
    chown -R nextjs:nextjs /opt/app && \
    apk del .build-deps && \
    rm -rf /var/cache/apk/* && \
    rm -rf /tmp/*

VOLUME /opt/app/database

EXPOSE 3000

USER nextjs

ENTRYPOINT [ "npm", "start" ]
