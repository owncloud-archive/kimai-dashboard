# kimai-dashboard

[![Build Status](https://drone.owncloud.com/api/badges/owncloud/kimai-dashboard/status.svg)](https://drone.owncloud.com/owncloud/kimai-dashboard/)
[![Docker Hub](https://img.shields.io/badge/docker-latest-blue.svg?logo=docker&logoColor=white)](https://hub.docker.com/r/owncloudops/kimai-dashboard)

This is a custom extension for Kimai written in Node.js which provides a reprting dashboard and a custom time booking interface.

## Environment variables

```Shell
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

```Shell
cat deployment/Chart.yaml | grep appVersion
# increase app Version in `Chart.yaml` and `package.json` based on semver versioning
docker build -t kimai-dashboard:0.2.7 .
```

## Deploy to kubernetes with helm

```Shell
helm upgrade -n owncloud -f deployment/values.yaml kimai-dashboard deployment/
```

## Or start container locally

```Shell
docker run --rm \
    -e KIMAI_API_URL="https://demo-stable.kimai.org" \
    -e KIMAI_API_USER="susan_super" \
    -e KIMAI_API_TOKEN="api_kitten" \
    -e SMTP_HOST="mail.example.com" \
    -e SMTP_USER="smtp_user" \
    -e SMTP_PASS="smtp_pass" \
    -e SMTP_FROM_MAIL="kimai@example.com" \
    -p 3000:3000 \
kimai-dashboard
```

## Test SMTP settings

If you want to quickly send a test email to verify your SMTP use:

```Shell
docker run --rm --entrypoint node \
    -e SEND_TO="test@example.com" \
    -e SMTP_HOST="mail.example.com" \
    -e SMTP_PORT="465" \
    -e SMTP_SECURE="TRUE" \
    -e SMTP_FROM_MAIL="kimai@example.com" \
    -e SMTP_USER="smtp_user" \
    -e SMTP_PASS="smtp_pass" \
kimai-dashboard backend_modules/test_smtp.js
```
