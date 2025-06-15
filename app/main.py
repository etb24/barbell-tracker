from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import sys
import shutil
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

tracker = BarbellPathTracker('PATH/TO/YOUR/MODEL')

@app.post("/process")
async def process_video(file: UploadFile = File(...)):
    # Create temp directories
    os.makedirs("temp", exist_ok=True)
    os.makedirs("processed", exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    input_filename = f"temp/input_{timestamp}_{file.filename}"
    output_filename = f"processed/output_{timestamp}_{file.filename}"
    
    try:
        # Save uploaded file
        with open(input_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process video
        result = tracker.process_video_headless(input_filename, output_filename)
        
        # Return processed video
        if os.path.exists(output_filename):
            return FileResponse(
                output_filename,
                media_type="video/mp4",
                filename=f"tracked_{file.filename}"
            )
        else:
            return {"error": "Processing failed"}
            
    finally:
        # Cleanup temp file
        if os.path.exists(input_filename):
            os.remove(input_filename)

@app.get("/")
def read_root():
    return {"message": "Barbell Tracker API"}