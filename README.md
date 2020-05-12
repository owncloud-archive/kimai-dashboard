## Build the docker container: 
```
cat deployment/Chart.yaml | grep appVersion
# increase app Version in `Chart.yaml` and `package.json` based on semver versioning
docker build -t registry.gitlab.com/trieb.work/owncloud-dashboard:0.2.7 .
docker push registry.gitlab.com/trieb.work/owncloud-dashboard:0.2.7
``` 

## Deploy to kubernetes with helm:
```
helm upgrade -n owncloud -f deployment/values.yaml owncloud-dashboard deployment/
``` 

## Configure the Container via following environment variables:
```
KIMAI_API_URL
KIMAI_API_USER
KIMAI_API_TOKEN
JSONDB_FILE_PATH (default: 'database/db.json', relative from server.js or absolute file path)
SMTP_HOST (default: smtp.mailgun.org)
SMTP_PORT (default: 456)
SMTP_SECURE (default: TRUE)
SMTP_FROM_MAIL 
SMTP_USER
SMTP_PASS
```

## Or start docker locally:
```
docker run --rm --env KIMAI_API_URL="https://demo-stable.kimai.org" \
--env KIMAI_API_USER="susan_super" \
--env KIMAI_API_TOKEN="api_kitten" \
--env SMTP_HOST="smtp.ethereal.email" \
--env SMTP_USER="craig.doyle@ethereal.email" \
--env SMTP_PASS="CHUmzRF31QccWKh1EM" \
--env SMTP_FROM_MAIL="kimai.report@owncloud.com" \
--env JSONDB_FILE_PATH="/opt/app/database/db.json" \
-v `pwd`/database:'/opt/app/database' \
-p 3000:3000 \
registry.gitlab.com/trieb.work/owncloud-dashboard:0.2.8
```