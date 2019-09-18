FROM node:8.16-alpine

WORKDIR /home/node/

COPY teamcity-push-gw-proxy/ $WORKDIR

RUN npm config set package-lock false &&\
    npm install request express console-stamp

ENV PGADDRESS http://localhost:9091

ENV PORT 9100

USER node

ENTRYPOINT ["/bin/sh"]

CMD ["start_proxy.sh"]
