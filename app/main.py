from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import sys
import tempfile
import boto3
import uuid
from botocore.exceptions import ClientError
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from tracker import BarbellPathTracker

app = FastAPI(title="Barbell Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# S3 and model config
BUCKET_NAME = "barbell-tracker-videos"
s3_client = boto3.client('s3')
tracker = BarbellPathTracker('models/barbell-tracking-model.pt')

@app.get("/")
def read_root():
    return {"message": "Barbell Tracker API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/process")
async def process_video(file: UploadFile = File(...)):
    """Process video and return S3 download URL"""

    # Genereate a unique identifiers
    job_id = str(uuid.uuid4())
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # S3 key for processed video
    processed_key = f"processed/{job_id}/output_{timestamp}_{file.filename}"


    # Create temp directories
    temp_dir = tempfile.gettempdir()  # Gets system temp directory
    local_input = os.path.join(temp_dir, f"{job_id}_input.mp4")
    local_output = os.path.join(temp_dir, f"{job_id}_output.mp4")


    # Generate unique filename
    input_filename = f"temp/input_{timestamp}_{file.filename}"
    output_filename = f"processed/output_{timestamp}_{file.filename}"
    
    try:
        with open(local_input, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        result = tracker.process_video_headless(local_input, local_output)

        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Video processing failed")
        
        # Upload processed video to S3
        s3_client.upload_file(local_output, BUCKET_NAME, processed_key)

        # Generate S3 download URL
        download_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': BUCKET_NAME, 'Key': processed_key},
            ExpiresIn=3600  # URL valid for 1 hour
        )

        # Clean up local files
        if os.path.exists(local_input):
            os.remove(local_input)
        if os.path.exists(local_output):
            os.remove(local_output) 
        
        return {
            "success": True,
            "message": "Video processed successfully",
            "job_id": job_id,
            "download_url": download_url,
            "s3_key": processed_key,
            "video_info": result.get("video", {})
        }
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"S3 error: {e.response['Error']['Message']}")
    
    except Exception as e:
        # Clean up local files in case of error
        for temp_file in [local_input, local_output]:
            if os.path.exists(temp_file):
                os.remove(temp_file)
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
        
@app.get("/list")
async def list_videos():
    """List all processed videos in S3 bucket (testing purposes)"""
    try:
        response = s3_client.list_objects_v2(Bucket=BUCKET_NAME, Prefix='processed/')
        if 'Contents' not in response:
            return {"videos": []}

        videos = []
        for obj in response['Contents']:
            videos.append({
                "key": obj['Key'],
                "size": obj['Size'],
                "last_modified": obj['LastModified'].isoformat(),
                "download_url": f"/download/{obj['Key']}"
            })
        return {"videos": videos}
    
    
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error listing videos: {e.response['Error']['Message']}")