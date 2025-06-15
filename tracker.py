import cv2
import numpy as np
from ultralytics import YOLO
from collections import deque
from datetime import datetime
import os

class BarbellPathTracker:
    def __init__(self, model_path):
        """
        Initialize the barbell path tracker.
        
        Args:
            model_path: Path to your YOLOv11 model
        """
        self.model = YOLO(model_path)
    
    def _process_frame(self, frame, positions):
        """Shared frame processing logic"""
        # Run detection
        results = self.model(frame)
        
        # Extract barbell position if detected
        if len(results) > 0 and len(results[0].boxes) > 0:
            boxes = results[0].boxes.xyxy.cpu().numpy()
            confidences = results[0].boxes.conf.cpu().numpy()
            
            # Get highest confidence detection
            best_idx = np.argmax(confidences)
            if confidences[best_idx] > 0.5:
                box = boxes[best_idx]
                center_x = int((box[0] + box[2]) / 2)
                center_y = int((box[1] + box[3]) / 2)
                positions.append((center_x, center_y))
        
        # Draw path
        if len(positions) > 1:
            points = np.array(list(positions), dtype=np.int32)
            
            for i in range(1, len(points)):
                color_ratio = i / len(points)
                color = (
                    int(255 * (1 - color_ratio)),  # Blue decreases
                    0,
                    int(255 * color_ratio)  # Red increases
                )
                cv2.line(frame, 
                        tuple(points[i-1]), 
                        tuple(points[i]), 
                        color, 3)
        
        return frame
        
    def process_video(self, video_path, save_output=False, output_path='tracked_video.mp4'):
        """
        Process video and display trajectory in real-time.
        
        Args:
            video_path: Path to input video (or 0 for webcam)
            save_output: Whether to save the output video
            output_path: Path to save output video if save_output=True
        """
        # Open video
        cap = cv2.VideoCapture(video_path)
        
        # Get video properties for saving
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Video writer if saving
        out = None
        if save_output:
            # Create output directory if it doesn't exist
            output_dir = os.path.dirname(output_path)
            if output_dir and not os.path.exists(output_dir):
                os.makedirs(output_dir)
                
            fourcc = cv2.VideoWriter_fourcc(*'mp4v') # type: ignore
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        # Store positions (using deque for efficiency)
        positions = deque(maxlen=1000)  # Keep last 1000 points
        
        print("Press 'q' to quit, 'c' to clear path")
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process frame
            frame = self._process_frame(frame, positions)
            
            # Display frame
            cv2.imshow('Barbell Tracking', frame)
            
            # Save frame if recording
            if save_output and out is not None:
                out.write(frame)
            
            # Handle key presses
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('c'):
                positions.clear()
        
        # Cleanup
        cap.release()
        if out is not None:
            out.release()
        cv2.destroyAllWindows()
        
        if save_output:
            print(f"\nVideo saved to: {output_path}")
    
    def process_video_headless(self, video_path, output_path):
        """Process video without display - for API use"""
        cap = cv2.VideoCapture(video_path)
        
        # Check if video opened successfully
        if not cap.isOpened():
            return {"status": "error", "message": "Could not open video file"}
        
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        # Read first frame to check if rotation needed
        ret, first_frame = cap.read()
        if not ret:
            return {"status": "error", "message": "Could not read video"}
        
        # Reset to beginning
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

        # If width > height but the actual frame is taller, need to rotate
        needs_rotation = width > height
        
        # Swap dimensions if rotating
        output_width = height if needs_rotation else width
        output_height = width if needs_rotation else height
        
        # Create output directory if it doesn't exist
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        fourcc = cv2.VideoWriter_fourcc(*'mp4v') # type: ignore
        # Use the corrected dimensions here
        out = cv2.VideoWriter(output_path, fourcc, fps, (output_width, output_height))
        
        positions = deque(maxlen=1000)
        processed_frames = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Rotation
            if needs_rotation:
                # Rotate 90 degrees clockwise for portrait videos
                frame = cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)
            
            # Process frame
            frame = self._process_frame(frame, positions)
            out.write(frame)
            
            processed_frames += 1
        
        cap.release()
        out.release()
        
        return {
            "status": "success",
            "output_path": output_path,
            "frames_processed": processed_frames,
            "total_frames": total_frames,
            "fps": fps,
            "resolution": f"{output_width}x{output_height}"  # Updated to use corrected dimensions
        }

# Usage
if __name__ == "__main__":
    tracker = BarbellPathTracker('PATH/TO/YOUR/MODEL')
    
    # For video file
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_filename = f'output/tracked_video_{timestamp}.mp4'
    input_filename = ''
    tracker.process_video(video_path=input_filename, save_output=True, output_path=output_filename)
    
    # For webcam
    # tracker.process_video(0)