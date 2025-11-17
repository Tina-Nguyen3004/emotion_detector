from sqlalchemy import Column, Integer, String, Float, DateTime, Text, LargeBinary, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class ImageAnalysis(Base):
    __tablename__ = "image_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_type = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    dominant_emotion = Column(String)
    dominant_confidence = Column(Float)
    analysis_data = Column(Text)  # Store full JSON result
    image_data = Column(LargeBinary)
    
    def to_dict(self, include_image=False):
        """Convert model to dictionary"""
        result = {
            "id": self.id,
            "filename": self.filename,
            "file_type": self.file_type,
            "upload_date": self.upload_date.isoformat(),
            "dominant_emotion": self.dominant_emotion,
            "dominant_confidence": self.dominant_confidence,
        }
        if include_image:
            result["has_image"] = self.image_data is not None
            result["image_url"] = f"/image/{self.id}/file"
        return result

class VideoAnalysis(Base):
    __tablename__ = "video_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_type = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    duration_seconds = Column(Float, nullable=False)
    total_frames = Column(Integer, nullable=False)
    analyzed_frames = Column(Integer, nullable=False)
    fps = Column(Float, nullable=False)
    frame_interval = Column(Integer, nullable=False)
    dominant_emotion = Column(String)
    dominant_confidence = Column(Float)
    aggregated_data = Column(Text)  # JSON string of aggregated emotions
    
    # Relationship to frames
    frames = relationship("VideoFrame", back_populates="video", cascade="all, delete-orphan")
    
    def to_dict(self, include_frames=False):
        """Convert model to dictionary"""
        result = {
            "id": self.id,
            "filename": self.filename,
            "file_type": self.file_type,
            "upload_date": self.upload_date.isoformat(),
            "duration_seconds": self.duration_seconds,
            "total_frames": self.total_frames,
            "analyzed_frames": self.analyzed_frames,
            "fps": self.fps,
            "frame_interval": self.frame_interval,
            "dominant_emotion": self.dominant_emotion,
            "dominant_confidence": self.dominant_confidence,
        }
        if include_frames:
            result["frames_count"] = len(self.frames)
        return result

class VideoFrame(Base):
    __tablename__ = "video_frames"
    
    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("video_analyses.id"), nullable=False)
    frame_number = Column(Integer, nullable=False)
    timestamp = Column(Float, nullable=False)
    dominant_emotion = Column(String)
    dominant_confidence = Column(Float)
    emotions_data = Column(Text)  # JSON string of top_k_emotions
    frame_image = Column(LargeBinary)  # Store the actual frame image
    
    # Relationship to video
    video = relationship("VideoAnalysis", back_populates="frames")
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "video_id": self.video_id,
            "frame_number": self.frame_number,
            "timestamp": self.timestamp,
            "dominant_emotion": self.dominant_emotion,
            "dominant_confidence": self.dominant_confidence,
        }