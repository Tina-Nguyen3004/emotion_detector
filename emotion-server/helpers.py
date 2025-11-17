from fastapi import UploadFile, HTTPException
import numpy as np

def top_k_emotions(analysis: dict, k: int = 3):
    """Extract the top K emotions from the analysis dictionary. Default k=3."""
    emotions = analysis.get("emotion", {})
    if not emotions:
        return []

    scores = {emo: float(val) for emo, val in emotions.items()}
    sorted_emotions = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    top_k = sorted_emotions[:k]

    return [{"emotion": emo, "confidence": conf} for emo, conf in top_k]

def validate_content_type(file: UploadFile, allowed_types: list[str]):
    """Validate the content type of an uploaded file."""
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types are: {allowed_types}"
        )

def aggregate_emotions_weighted(frame_analyses: list):
    """Aggregate emotions across frames using time-weighted averages."""
    if not frame_analyses:
        return {}
    
    emotion_weighted_scores = {}
    
    for i, frame in enumerate(frame_analyses):
        # Calculate time weight (duration until next frame)
        if i < len(frame_analyses) - 1:
            duration = frame_analyses[i + 1]["timestamp"] - frame["timestamp"]
        else:
            duration = 1.0  # Default for last frame
        
        for emotion_data in frame.get("top_k_emotions", []):
            emotion = emotion_data["emotion"]
            confidence = emotion_data["confidence"]
            
            if emotion not in emotion_weighted_scores:
                emotion_weighted_scores[emotion] = {
                    "total_weight": 0, 
                    "weighted_sum": 0, 
                    "scores": []
                }
            
            emotion_weighted_scores[emotion]["weighted_sum"] += confidence * duration
            emotion_weighted_scores[emotion]["total_weight"] += duration
            emotion_weighted_scores[emotion]["scores"].append(confidence)
    
    aggregated = {}
    for emotion, data in emotion_weighted_scores.items():
        aggregated[emotion] = {
            "average": round(data["weighted_sum"] / data["total_weight"], 2),
            "simple_average": round(np.mean(data["scores"]), 2),
            "max": round(np.max(data["scores"]), 2),
            "min": round(np.min(data["scores"]), 2),
            "std": round(np.std(data["scores"]), 2),
            "presence_percentage": round((data["total_weight"] / frame_analyses[-1]["timestamp"]) * 100, 2)
        }
    
    sorted_aggregated = dict(
        sorted(aggregated.items(), key=lambda x: x[1]["average"], reverse=True)
    )
    
    dominant_emotion = list(sorted_aggregated.keys())[0] if sorted_aggregated else None
    
    return {
        "emotions": sorted_aggregated,
        "dominant_emotion": dominant_emotion,
        "dominant_average_confidence": sorted_aggregated[dominant_emotion]["average"] if dominant_emotion else None
    }