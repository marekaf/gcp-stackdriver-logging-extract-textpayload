# Stackdriver log transfomer
Deploy a GCP Cloud Function (nodejs 6 runtime) that is triggered on google.storage.object.finalize event.
The function downloads the file from bucket, takes the whole json, extracts the .textPayload of each and every line, writes it to a local fileStream, changes the MIME type from application/json to text/plain and uploads it to a new bucket with the same file name

This is useful as Stackdriver Logging exports to bucket are exporting json with metadata for each log entry BUT you need only the textPayload (the raw log entry).

## deploy it to google cloud functions
```
SOURCE_BUCKET_NAME=my-bucket-exported-logs
DEST_BUCKET_NAME=my-bucket-exported-logs-nojson
gcloud beta functions deploy logTransformer --set-env-vars DEST_BUCKET_NAME="$DEST_BUCKET_NAME" --runtime nodejs6 --region europe-west1 --memory 128MB  --trigger-resource "$SOURCE_BUCKET_NAME" --trigger-event google.storage.object.finalize
```
