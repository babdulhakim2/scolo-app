#!/bin/bash

# Deploy Backend to Google Cloud Run

PROJECT_ID="scolo-ai"
REGION="us-central1"
SERVICE_NAME="scolo-bot"

echo "🚀 Starting backend deployment to Google Cloud Run..."

# Check if user is logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ You are not logged in to gcloud. Please run: gcloud auth login"
    exit 1
fi

# Set project
echo "📋 Setting project to ${PROJECT_ID}..."
gcloud config set project ${PROJECT_ID}

# Grant necessary permissions (run these once)
echo "🔑 Checking permissions..."
echo "If you get permission errors, run these commands:"
echo ""
echo "# Artifact Registry permissions"
echo "gcloud projects add-iam-policy-binding ${PROJECT_ID} \\"
echo "  --member=\"user:\$(gcloud config get-value account)\" \\"
echo "  --role=\"roles/artifactregistry.writer\""
echo ""
echo "# Cloud Run deployment permissions"
echo "gcloud projects add-iam-policy-binding ${PROJECT_ID} \\"
echo "  --member=\"user:\$(gcloud config get-value account)\" \\"
echo "  --role=\"roles/run.admin\""
echo ""
echo "# Cloud Build permissions"
echo "gcloud projects add-iam-policy-binding ${PROJECT_ID} \\"
echo "  --member=\"user:\$(gcloud config get-value account)\" \\"
echo "  --role=\"roles/cloudbuild.builds.editor\""
echo ""
echo "# Secret Manager access permissions"
echo "gcloud projects add-iam-policy-binding ${PROJECT_ID} \\"
echo "  --member=\"user:\$(gcloud config get-value account)\" \\"
echo "  --role=\"roles/secretmanager.secretAccessor\""
echo ""

# Ensure Artifact Registry repo exists
echo "📦 Checking Artifact Registry repository..."
if ! gcloud artifacts repositories describe scolo-repo --location=${REGION} &>/dev/null; then
    echo "Creating Artifact Registry repository..."
    gcloud artifacts repositories create scolo-repo \
        --repository-format=docker \
        --location=${REGION} \
        --description="Scolo backend Docker images"
fi

# Ensure secret exists
echo "🔐 Checking for production secrets..."
if ! gcloud secrets describe scolo-production-secrets &>/dev/null; then
    echo "❌ Secret 'scolo-production-secrets' not found!"
    echo "Create it with: gcloud secrets create scolo-production-secrets --data-file=.env"
    exit 1
fi

# Submit build
echo "🏗️ Starting Cloud Build..."
gcloud builds submit --config=cloudbuild.yaml

# Check deployment status
echo "✅ Checking deployment status..."
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.url)")

if [ -n "$SERVICE_URL" ]; then
    echo "🎉 Deployment successful!"
    echo "Service URL: ${SERVICE_URL}"
    echo ""
    echo "Test the API:"
    echo "curl ${SERVICE_URL}/health"
else
    echo "❌ Failed to get service URL. Check Cloud Run console for details."
    exit 1
fi