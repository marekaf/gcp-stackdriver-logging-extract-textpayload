# Stackdriver log transfomer
Deploy a GCP Cloud Function (nodejs 6 runtime) that is triggered on `google.storage.object.finalize` event.

The function does:
* downloads the file from SOURCE_BUCKET_NAME bucket
* takes the whole json and extracts the `.textPayload` of each and every line
* writes it to a local fileStream
* changes the MIME type from `application/json` to `text/plain`
* uploads it to DEST_BUCKET_NAME with the same file name

This is useful as Stackdriver Logging exports to bucket are exporting json with metadata for each log entry BUT you need only the textPayload (the raw log entry).

You should have the export sink to bucket already created. 

More info here: 

## deploy it to google cloud functions
```
SOURCE_BUCKET_NAME=my-bucket-exported-logs
DEST_BUCKET_NAME=my-bucket-exported-logs-nojson

gcloud beta functions deploy logTransformer \ 
   --set-env-vars DEST_BUCKET_NAME="$DEST_BUCKET_NAME" \
   --runtime nodejs6 \
   --region europe-west1 \
   --memory 128MB  \
   --trigger-resource "$SOURCE_BUCKET_NAME" \
   --trigger-event google.storage.object.finalize
```
