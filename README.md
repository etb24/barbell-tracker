# Barbell Path Tracker

As a former competitive athlete and fitness enthusiast with past injuries I've built a computer vision application that tracks and visualizes barbell movement patterns during weightlifting exercises. Perfect for form analysis, coaching, and performance optimization.

<img src="demo.gif" height="50%">

## Features

- **Real-time Barbell Detection**: Uses YOLOv11 to detect and track barbells in video
- **Path Visualization**: Draws a color-coded trail showing the barbell's movement path
- **Mobile Optimized**: Processes videos efficiently for mobile devices
- **Multiple Interfaces**: Desktop GUI, REST API, and mobile app support
- **Video Processing**: Handles various video formats with automatic rotation correction

## Architecture

```
barbell-path-tracker/
├── tracker.py          # Core tracking logic with YOLOv8
├── main.py            # FastAPI server for mobile/web
├── app.py             # Desktop GUI application
├── requirements.txt   # Python dependencies
└── models/
    └── best.pt        # Trained YOLO model weights
```

## Quick Start

### Prerequisites

- Python 3.8+
- OpenCV
- PyTorch
- CUDA (optional, for GPU acceleration)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/etb24/barbell-tracker.git
```

2. **Create virtual environment**

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```

4. **Download YOLO model**

```bash
# Place your trained best.pt in the models/ directory
mkdir models
# Copy your best.pt file to models/
```

## Usage

### Desktop Application

Run the interactive GUI for real-time video processing:

```bash
python tracker.py
```

**Controls:**

- `SPACE`: Pause/Resume
- `S`: Save current frame
- `Q`: Quit

### API Server

Start the REST API for mobile/web integration:

```bash
python run_api.py
```

The API will be available at `http://localhost:8000`

**Endpoints:**

- `POST /process`: Upload video for processing
- `GET /health`: Check server status

**Example Request:**

```bash
curl -X POST "http://localhost:8000/process" \
  -H "accept: video/mp4" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@workout.mp4"
```

### Python Module

Use the tracker in your own code:

```python
from tracker import BarbellTracker

# Initialize tracker
tracker = BarbellTracker(model_path='models/best.pt')

# Process video
result = tracker.process_video_headless(
    video_path='input.mp4',
    output_path='output.mp4',
    mobile_config={
        'max_resolution': (720, 1280),
        'target_fps': 15,
        'quality': 'medium'
    }
)

print(f"Processed {result['frames_processed']} frames")
print(f"Output saved to: {result['output_path']}")
```

## Mobile Configuration

The tracker includes mobile-specific optimizations:

```python
mobile_config = {
    'max_resolution': (720, 1280),  # Max output resolution
    'target_fps': 15,               # Reduced frame rate
    'quality': 'low/medium/high',   # Compression quality
    'skip_frames': 2                # Process every Nth frame
}
```

**Quality Presets:**

- `low`: 360p, 10fps, high compression (fastest, smallest)
- `medium`: 720p, 15fps, balanced (recommended)
- `high`: 1080p, 30fps, low compression (best quality)

## Path Visualization

The tracker creates a color-gradient trail:

- **Blue**: Older positions
- **Purple**: Mid-trail positions
- **Red**: Most recent positions

Trail length is controlled by the `deque` maxlen parameter:

```python
positions = deque(maxlen=1000)  # ~33 seconds at 30fps
```

## Configuration

### Model Configuration

```python
tracker = BarbellTracker(
    model_path='models/best.pt',
    conf_threshold=0.7,      # Detection confidence
    iou_threshold=0.45,      # NMS threshold
    device='cuda'            # 'cuda' or 'cpu'
)
```

### Processing Options

```python
# Adjust trail length
tracker.trail_length = 500  # Shorter trail

# Change colors
tracker.start_color = (255, 0, 0)  # Red start
tracker.end_color = (0, 0, 255)    # Blue end

# Line thickness
tracker.line_thickness = 3
```

## Future Enhancements

- [ ] Real-time streaming support
- [ ] Form analysis and recommendations
- [ ] Rep counting and velocity tracking
- [ ] Cloud deployment with auto-scaling
- [ ] Web dashboard for analytics
