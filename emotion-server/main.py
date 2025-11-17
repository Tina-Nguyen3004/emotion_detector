from fastapi import FastAPI, File, Response, UploadFile, HTTPException, Form, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from deepface import DeepFace
from PIL import Image
import io
from helpers import top_k_emotions, validate_content_type, aggregate_emotions_weighted
import tempfile
import os
import cv2
import json

from database import get_db, init_db
from models import ImageAnalysis, VideoAnalysis, VideoFrame

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()
    print("✅ Database initialized!")

@app.post("/image")
async def analyze_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """ Analyze an uploaded image for emotions """
    validate_content_type(file, ["image/jpeg", "image/png"])
    file_bytes = await file.read()
    
    try:
        Image.open(io.BytesIO(file_bytes))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image data")
    
    # Check if image with same filename already exists
    existing_image = db.query(ImageAnalysis).filter(
        ImageAnalysis.filename == file.filename
    ).first()
    
    if existing_image:
        raise HTTPException(
            status_code=409, 
            detail=f"Image with filename '{file.filename}' already exists"
        )
    
    try:
        analysis = DeepFace.analyze(
            img_path=io.BytesIO(file_bytes),
            actions=['emotion'],
            enforce_detection=False
        )
        if isinstance(analysis, list):
            analysis = analysis[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DeepFace failed: {e}")
    
    top_k = top_k_emotions(analysis, k=3)
    dominant_emotion = top_k[0]["emotion"] if top_k else None
    dominant_conf = top_k[0]["confidence"] if top_k else None
    
    result = {
        "top_k_emotions": top_k,
        "dominant_emotion": dominant_emotion,
        "dominant_confidence": dominant_conf
    }
    
    # Save to database
    db_image = ImageAnalysis(
        filename=file.filename,
        file_type=file.content_type,
        dominant_emotion=dominant_emotion,
        dominant_confidence=dominant_conf,
        analysis_data=json.dumps(result),
        image_data=file_bytes
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    
    result["id"] = db_image.id
    result["upload_date"] = db_image.upload_date.isoformat()
    
    return JSONResponse(content=result)

@app.get("/images")
def get_all_images(db: Session = Depends(get_db)):
    """ Get all saved image analyses """
    images = db.query(ImageAnalysis).order_by(
        ImageAnalysis.upload_date.desc()
    ).all()
    
    return JSONResponse(content={
        "total": len(images),
        "images": [
            {
                "id": img.id,
                "filename": img.filename,
                "upload_date": img.upload_date.isoformat(),
                "dominant_emotion": img.dominant_emotion,
                "dominant_confidence": img.dominant_confidence,
            }
            for img in images
        ]
    })
    
@app.get("/image/{image_id}")
def get_image_analysis(image_id: int, db: Session = Depends(get_db)):
    """ Get a specific image analysis by ID """
    img = db.query(ImageAnalysis).filter(ImageAnalysis.id == image_id).first()
    
    if not img:
        raise HTTPException(status_code=404, detail="Image analysis not found")
    
    return JSONResponse(content={
        "id": img.id,
        "filename": img.filename,
        "upload_date": img.upload_date.isoformat(),
        "dominant_emotion": img.dominant_emotion,
        "dominant_confidence": img.dominant_confidence,
        "analysis_data": json.loads(img.analysis_data)
    })
    
@app.get("/image/{image_id}/file")
def get_image_file(image_id: int, db: Session = Depends(get_db)):
    """ Retrieve the original image file by ID """
    img = db.query(ImageAnalysis).filter(ImageAnalysis.id == image_id).first()
    
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    
    return Response(
        content=img.image_data,
        media_type=img.file_type
    )

@app.delete("/image/{image_id}")
def delete_image(image_id: int, db: Session = Depends(get_db)):
    """ Delete a specific image analysis by ID """
    img = db.query(ImageAnalysis).filter(ImageAnalysis.id == image_id).first()
    
    if not img:
        raise HTTPException(status_code=404, detail="Image analysis not found")
    
    db.delete(img)
    db.commit()
    
    return JSONResponse(content={"detail": "Image analysis deleted successfully"})

@app.post("/video")
async def analyze_video(
    file: UploadFile = File(...),
    frame_interval: int = Form(30),
    db: Session = Depends(get_db)
):
<<<<<<< HEAD
=======
    print(frame_interval)
>>>>>>> 6daa9892a9261d968075769abb94c6247287f4cb
    validate_content_type(
        file,
        [
            "video/mp4",
            "video/quicktime",       # .mov
            "video/x-msvideo"        # .avi
        ]
    )
    
    # Check if video with same filename already exists
    existing_video = db.query(VideoAnalysis).filter(
        VideoAnalysis.filename == file.filename
    ).first()
    
    if existing_video:
        raise HTTPException(
            status_code=409, 
            detail=f"Video with filename '{file.filename}' already exists"
        )
    
    file_bytes = await file.read()
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp_file:
        tmp_file.write(file_bytes)
        tmp_path = tmp_file.name
        
    try:
        cap = cv2.VideoCapture(tmp_path)
        
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not open video file")
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        duration = total_frames / fps if fps > 0 else 0
        
        frame_analyses = []
        frame_count = 0
        
        # Reset video to beginning
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        
        while True:
            ret, frame = cap.read()
            
            if not ret:
                break
            
            if frame_count % frame_interval == 0:
                try:
                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    
                    analysis = DeepFace.analyze(
                        img_path=rgb_frame,
                        actions=['emotion'],
                        enforce_detection=False
                    )
                    
                    if isinstance(analysis, list):
                        analysis = analysis[0]
                    
                    timestamp = frame_count / fps if fps > 0 else 0
                    top_k = top_k_emotions(analysis, k=3)
                    
                    # Convert frame to JPEG bytes for storage
                    _, buffer = cv2.imencode('.jpg', frame)
                    frame_bytes = buffer.tobytes()
                    
                    frame_analyses.append({
                        "frame": frame_count,
                        "timestamp": round(timestamp, 2),
                        "top_k_emotions": top_k,
                        "dominant_emotion": top_k[0]["emotion"] if top_k else None,
                        "dominant_confidence": top_k[0]["confidence"] if top_k else None,
                        "frame_image": frame_bytes  # Add image data
                    })
                    
                except Exception as e:
                    print(f"Failed to analyze frame {frame_count}: {e}")
            
            frame_count += 1
        
        cap.release()
        
        aggregated = aggregate_emotions_weighted(frame_analyses)
        
        # Save video analysis to database
        db_video = VideoAnalysis(
            filename=file.filename,
            file_type=file.content_type,
            duration_seconds=round(duration, 2),
            total_frames=total_frames,
            analyzed_frames=len(frame_analyses),
            fps=round(fps, 2),
            frame_interval=frame_interval,
            dominant_emotion=aggregated.get("dominant_emotion"),
            dominant_confidence=aggregated.get("dominant_average_confidence"),
            aggregated_data=json.dumps(aggregated)
        )
        
        db.add(db_video)
        db.commit()
        db.refresh(db_video)
        
        # Save individual frames with images
        for frame_data in frame_analyses:
            db_frame = VideoFrame(
                video_id=db_video.id,
                frame_number=frame_data["frame"],
                timestamp=frame_data["timestamp"],
                dominant_emotion=frame_data["dominant_emotion"],
                dominant_confidence=frame_data["dominant_confidence"],
                emotions_data=json.dumps(frame_data["top_k_emotions"]),
                frame_image=frame_data["frame_image"]  # Save image data
            )
            db.add(db_frame)
        
        db.commit()
        
        return JSONResponse(content={
            "id": db_video.id,
            "upload_date": db_video.upload_date.isoformat(),
            "video_info": {
                "total_frames": total_frames,
                "analyzed_frames": len(frame_analyses),
                "duration_seconds": round(duration, 2),
                "fps": round(fps, 2)
            },
            "frame_by_frame": [
                {k: v for k, v in frame.items() if k != "frame_image"}  # Exclude image bytes from response
                for frame in frame_analyses
            ],
            "aggregated_emotions": aggregated
        })
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Rollback any database changes if processing fails
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Video processing failed: {e}")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
            
@app.get("/videos")
def get_all_videos(db: Session = Depends(get_db)):
    """ Get all saved video analyses """
    videos = db.query(VideoAnalysis).order_by(
        VideoAnalysis.upload_date.desc()
    ).all()
    
    return JSONResponse(content={
        "total": len(videos),
        "videos": [
            {
                "id": vid.id,
                "filename": vid.filename,
                "upload_date": vid.upload_date.isoformat(),
                "duration_seconds": vid.duration_seconds,
                "total_frames": vid.total_frames,
                "analyzed_frames": vid.analyzed_frames,
                "fps": vid.fps,
                "dominant_emotion": vid.dominant_emotion,
                "dominant_confidence": vid.dominant_confidence,
            }
            for vid in videos
        ]
    })
    
@app.get("/video/{video_id}")
def get_video_analysis(video_id: int, db: Session = Depends(get_db)):
    """ Get a specific video analysis by ID """
    vid = db.query(VideoAnalysis).filter(VideoAnalysis.id == video_id).first()
    
    if not vid:
        raise HTTPException(status_code=404, detail="Video analysis not found")
    
    frames = db.query(VideoFrame).filter(
        VideoFrame.video_id == video_id
    ).order_by(VideoFrame.frame_number).all()
    
    frame_data = [
        {
            "frame_number": fr.frame_number,
            "timestamp": fr.timestamp,
            "dominant_emotion": fr.dominant_emotion,
            "dominant_confidence": fr.dominant_confidence,
            "emotions_data": json.loads(fr.emotions_data)
        }
        for fr in frames
    ]
    
    return JSONResponse(content={
        "id": vid.id,
        "filename": vid.filename,
        "upload_date": vid.upload_date.isoformat(),
        "duration_seconds": vid.duration_seconds,
        "total_frames": vid.total_frames,
        "analyzed_frames": vid.analyzed_frames,
        "fps": vid.fps,
        "frame_interval": vid.frame_interval,
        "dominant_emotion": vid.dominant_emotion,
        "dominant_confidence": vid.dominant_confidence,
        "aggregated_data": json.loads(vid.aggregated_data),
        "frames": frame_data
    })
    
@app.get("/video/{video_id}/frame/{frame_number}/file")
def get_video_frame_file(video_id: int, frame_number: int, db: Session = Depends(get_db)):
    """ Get the actual image file for a specific video frame """
    frame = db.query(VideoFrame).filter(
        VideoFrame.video_id == video_id,
        VideoFrame.frame_number == frame_number
    ).first()

    if not frame or not frame.frame_image:
        raise HTTPException(status_code=404, detail="Frame image not found")

    return Response(content=frame.frame_image, media_type="image/jpeg")

@app.get("/video/{video_id}/frame/{frame_number}")
def get_video_frame_analysis(video_id: int, frame_number: int, db: Session = Depends(get_db)):
    """ Get analysis data for a specific video frame """
    frame = db.query(VideoFrame).filter(
        VideoFrame.video_id == video_id,
        VideoFrame.frame_number == frame_number
    ).first()

    if not frame:
        raise HTTPException(status_code=404, detail="Frame analysis not found")

    return JSONResponse(content={
        "frame_number": frame.frame_number,
        "timestamp": frame.timestamp,
        "dominant_emotion": frame.dominant_emotion,
        "dominant_confidence": frame.dominant_confidence,
        "emotions_data": json.loads(frame.emotions_data)
    })
    
@app.delete("/video/{video_id}")
def delete_video(video_id: int, db: Session = Depends(get_db)):
    """ Delete a specific video analysis and its frames by ID """
    vid = db.query(VideoAnalysis).filter(VideoAnalysis.id == video_id).first()
    
    if not vid:
        raise HTTPException(status_code=404, detail="Video analysis not found")
    
    db.query(VideoFrame).filter(VideoFrame.video_id == video_id).delete()
    
    db.delete(vid)
    db.commit()
    
    return JSONResponse(content={"detail": "Video analysis and associated frames deleted successfully"})