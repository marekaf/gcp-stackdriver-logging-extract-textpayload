'use strict';

const path = require('path');

// [START functions_word_count_setup]
const Storage = require('@google-cloud/storage');
const readline = require('readline');

const DEST_BUCKET_NAME = process.env.DEST_BUCKET_NAME;

// Instantiates a client
const storage = Storage();
// [END functions_word_count_setup]

function getFileStream (file) {
  if (!file.bucket) {
    throw new Error('Bucket not provided. Make sure you have a "bucket" property in your request');
  }
  if (!file.name) {
    throw new Error('Filename not provided. Make sure you have a "name" property in your request');
  }

  return storage.bucket(file.bucket).file(file.name).createReadStream();
}


exports.logTransformer = (event, callback) => {
  const file = event.data;

  const destBucketStr = DEST_BUCKET_NAME

  //console.log(`  Event: ${event.eventId}`);
  //console.log(`  Event Type: ${event.eventType}`);
  // make sure dest bucket is not source bucket
  console.log(`  Source bucket: ${file.bucket}`);
  console.log(`  Destination bucket: ${destBucketStr}`);
  console.log(`  File: ${file.name}`);

  const filePath = file.name; // File path in the bucket.
  const contentType = file.contentType; // File content type.

  const destBucket = storage.bucket(destBucketStr);

  // Get the file name.
  const fileName = path.basename(filePath);

  const options = {
    input: getFileStream(file)
  };

  // the output is no longer application/json but text/plain
  const metadata = {
    contentType: "text/plain",
  };

  console.log('reading file');

  const fs = require('fs');
  const logStream = fs.createWriteStream('/tmp/log.txt', {flags: 'w', encoding: 'utf-8'});

  logStream.on('open', function() {

    readline.createInterface(options)
    .on('line', (line) => {

        const clonedData = JSON.parse(line.replace(/\r?\n|\r/g, " "));
        logStream.write(clonedData.textPayload.toString()); 
      
    })
    .on('close', () => {
      logStream.end(function () { console.log('logstream end'); });

    });
  }).on('finish', () => {

     // We replace the .json suffix with .txt 
     const thumbFileName = fileName.replace('.json','.txt');
     const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);


    console.log('Uploading file to', thumbFilePath);
    // Uploading the thumbnail.
    destBucket.upload('/tmp/log.txt', {
      destination: thumbFilePath,
      metadata: metadata,
      resumable: false
    });
    
    console.log('All done, calling back');
    callback();
  });
};

