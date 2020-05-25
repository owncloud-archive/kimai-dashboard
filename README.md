# kimai-dashboard

[![Build Status](https://drone.owncloud.com/api/badges/owncloud/kimai-dashboard/status.svg)](https://drone.owncloud.com/owncloud/kimai-dashboard/)
[![Docker Hub](https://img.shields.io/badge/docker-latest-blue.svg?logo=docker&logoColor=white)](https://hub.docker.com/r/owncloudops/kimai-dashboard)

## Environment variables

```console
KIMAI_API_URL=
KIMAI_API_USER=
KIMAI_API_TOKEN=
# relative from server.js or absolute file path
JSONDB_FILE_PATH=database/db.json
SMTP_HOST=
SMTP_PORT=465
SMTP_SECURE=TRUE
SMTP_FROM_MAIL=
SMTP_USER=
SMTP_PASS=
```

## Build the docker container

When using helm to deploy the dashboard to Kubernetes, you need to match the container version with the appVersion of the Helm chart.

```console
cat deployment/Chart.yaml | grep appVersion
# increase app Version in `Chart.yaml` and `package.json` based on semver versioning
docker build -t kimai-dashboard:0.2.7 .
```

## Deploy to kubernetes with helm

```console
helm upgrade -n owncloud -f deployment/values.yaml kimai-dashboard deployment/
```

## Or start container locally

```console
docker run --rm --env KIMAI_API_URL="https://demo-stable.kimai.org" \
-e KIMAI_API_USER="susan_super" \
-e KIMAI_API_TOKEN="api_kitten" \
-e SMTP_HOST="smtp.ethereal.email" \
-e SMTP_USER="craig.doyle@ethereal.email" \
-e SMTP_PASS="CHUmzRF31QccWKh1EM" \
-e SMTP_FROM_MAIL="kimai.report@owncloud.com" \
-p 3000:3000 \
kimai-dashboard
```
