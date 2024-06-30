echo "please run pytest tests before deploying"


# using shared bucket
gcloud config set project netwrck

gsutil -m rsync -r ./static/bower_components gs://static.netwrck.com/simstatic/bower_components
gsutil -m rsync -r ./static/css gs://static.netwrck.com/simstatic/css
gsutil -m rsync -r ./static/cssbuild gs://static.netwrck.com/simstatic/cssbuild
gsutil -m rsync -r ./static/docs gs://static.netwrck.com/simstatic/docs
gsutil -m rsync -r ./static/jsbuild gs://static.netwrck.com/simstatic/jsbuild
gsutil -m rsync -r ./static/fonts gs://static.netwrck.com/simstatic/fonts
gsutil -m rsync -r ./static/img gs://static.netwrck.com/simstatic/img
gsutil -m rsync -r ./static/images gs://static.netwrck.com/simstatic/images
gsutil -m rsync -r ./static/stylesheets gs://static.netwrck.com/simstatic/stylesheets
# gsutil -m rsync -r ./static/ gs://static.netwrck.com/simstatic/
gsutil -m rsync -r ./static/js gs://static.netwrck.com/simstatic/js
gsutil -m rsync -r ./static/less gs://static.netwrck.com/simstatic/less
gsutil -m rsync -r ./static/libs gs://static.netwrck.com/simstatic/libs

gcloud config set project websim2

gcloud app deploy --project websim2
