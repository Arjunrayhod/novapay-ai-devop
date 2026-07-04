#!/bin/sh
# MinIO Bucket Initialization Script
# Creates required buckets for local development.

set -e

echo "Connecting to MinIO at ${MINIO_ENDPOINT}..."

# Wait for MinIO to be ready
sleep 2

# Configure alias
mc alias set local "http://${MINIO_ENDPOINT}" "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}"

# Create buckets
buckets="aegisai-platform aegisai-logs aegisai-backups aegisai-artifacts aegisai-tfstate"

for bucket in $buckets; do
    if mc ls "local/${bucket}" > /dev/null 2>&1; then
        echo "Bucket '${bucket}' already exists."
    else
        mc mb "local/${bucket}"
        echo "Bucket '${bucket}' created."
    fi

    # Set bucket versioning
    mc version enable "local/${bucket}"
    echo "Versioning enabled for '${bucket}'."
done

# Set bucket policies
mc anonymous set download "local/aegisai-artifacts"
echo "Artifacts bucket set to public download."

echo "MinIO initialization complete."
