# Barbell Path Tracker

As a former competitive athlete and fitness enthusiast with past injuries I've built a computer vision application that tracks and visualizes barbell movement patterns during weightlifting exercises. Perfect for form analysis, coaching, and performance optimization.

<img src="demo.gif" width="50%">

## Tech Stack

- **Frontend**: React Native, Expo, TypeScript
- **Backend**: AWS, FastAPI, Python

## Features

- **Real-time Barbell Detection**: Uses computer vision to detect and track barbells in video
- **Path Visualization**: Draws a color-coded trail showing the barbell's movement path
- **Mobile App**: Mobile app built in React Native with Expo
- **Processing**: FastAPI backend deployed to AWS EC2 instance integrated with AWS S3 for file storage
- **Video Management**: Save processed videos to personal in-app library or locally to camera roll

## Future Features

- [ ] Real-time streaming support
- [ ] Rep counting and velocity tracking
- [ ] Dashboard for analytics
- [ ] Form analysis and recommendations

## Key Learnings

**Computer Vision & AI**

- Object Detection: Implemented real-time barbell tracking using custom pre-trained models
- OpenCV Integration: Learned video processing, frame manipulation, and coordinate systems
- Model Optimization: Balanced accuracy vs performance for mobile video processing

**Full-Stack Development**

- FastAPI Backend: Built API endpoints with file upload handling and error management
- React Native with TypeScript: Developed cross-platform mobile app
- State Management: Handled video processing states, upload progress, and error handling across frontend/backend

**Cloud Architecture & DevOps**

- AWS EC2 Deployment: Configured Ubuntu server, managed dependencies, and environment setup
- AWS S3 Integration: Implemented cloud storage for video files with proper access controls
- Nginx Reverse Proxy: Set up production-ready web server
- Production Considerations: Learned about CORS, security headers, and API rate limiting

**Problem-Solving & Debugging**

- CORS Issues: Resolved cross-origin requests between mobile app and cloud backend
- Memory Management: Optimized video processing to handle large files without server crashes

**Development Workflow**

- Environment Management: Learned proper separation of development/production environments
- Error Handling: Implemented comprehensive error catching and user-friendly error messages
- Testing Strategies: Tested across different devices, networks, and file sizes

## Lessons for Future Projects

**What Worked Well**

- Incremental Development: Built and tested each component (AI → API → Mobile → Cloud) separately
- Documentation: Keeping detailed logs of configuration steps and debugging processes
- Version Control: Proper Git workflow for managing code across development and deployment

**What I'd Do Differently**

- Earlier Testing: Test deployment pipeline earlier in development process
- Monitoring Setup: Implement logging and monitoring from the start
- Automated Deployment: Set up CI/CD pipeline for easier updates and rollbacks

## Technologies I Want to Explore Next

- Docker Containerization: For more consistent deployment across environments
- Database Integration: Add user accounts and video history storage

## Impact & Results

- End-to-End Product: Successfully built and deployed a complete mobile application
- Real-World Usage: App processes actual workout videos and provides meaningful feedback
- Production Ready: Handles real users, real data, and real-world network conditions
