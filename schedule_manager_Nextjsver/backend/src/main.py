from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
import uvicorn
import logging

# ✅ ログ設定を追加
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Schedule Manager API",
    description="スケジュール管理アプリのAPI",
    version="1.0.0"
)

# CORS設定（既存のまま）
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# データモデル（既存のまま）
class EventData(BaseModel):
    id: Optional[int] = None
    title: str
    date: str
    contents: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    created_at: Optional[datetime] = None

class EventCreate(BaseModel):
    title: str
    date: str
    contents: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None

# ✅ サンプルデータを現在の日付で更新
from datetime import datetime, timedelta

today = datetime.now()
tomorrow = today + timedelta(days=1)
day_after = today + timedelta(days=2)

sample_events: List[EventData] = [
    EventData(
        id=1,
        title="チーム会議",
        date=today.strftime("%Y-%m-%d"),  # 今日
        contents="週次の進捗確認会議",
        start_time="10:00",
        end_time="11:30",
        created_at=datetime.now()
    ),
    EventData(
        id=2,
        title="プレゼンテーション",
        date=tomorrow.strftime("%Y-%m-%d"),  # 明日
        contents="新プロジェクトの提案",
        start_time="14:00",
        end_time="15:00",
        created_at=datetime.now()
    ),
    EventData(
        id=3,
        title="重要タスク",
        date=day_after.strftime("%Y-%m-%d"),  # 明後日
        contents="重要なタスクの処理",
        start_time="09:00",
        end_time="17:00",
        created_at=datetime.now()
    )
]

# ✅ ログ付きルートエンドポイント
@app.get("/")
def read_root():
    logger.info("🏠 ルートエンドポイントにアクセスされました")
    return {
        "message": "Schedule Manager API is running!",
        "version": "1.0.0",
        "docs": "/docs",
        "events_count": len(sample_events),
        "sample_dates": [event.date for event in sample_events]
    }

# ✅ ログ付きイベント一覧取得
@app.get("/api/events", response_model=List[EventData])
def get_events():
    """全イベントを取得"""
    logger.info(f"📡 /api/events にアクセス - イベント数: {len(sample_events)}")
    logger.info(f"📦 返送するイベント: {[(e.id, e.title, e.date) for e in sample_events]}")
    return sample_events

# ✅ デバッグ用エンドポイントを追加
@app.get("/debug")
def debug_info():
    """デバッグ情報を表示"""
    return {
        "events_count": len(sample_events),
        "events": [
            {
                "id": event.id,
                "title": event.title,
                "date": event.date,
                "contents": event.contents
            }
            for event in sample_events
        ],
        "server_time": datetime.now().isoformat()
    }

# 他のエンドポイント（既存のまま）
@app.get("/api/events/{event_date}")
def get_events_by_date(event_date: str):
    logger.info(f"📅 特定日付のイベント取得: {event_date}")
    events = [event for event in sample_events if event.date == event_date]
    logger.info(f"📦 該当イベント数: {len(events)}")
    return events

@app.post("/api/events", response_model=EventData)
def create_event(event: EventCreate):
    logger.info(f"➕ 新しいイベント作成: {event.title}")
    new_id = max([e.id for e in sample_events], default=0) + 1
    new_event = EventData(
        id=new_id,
        title=event.title,
        date=event.date,
        contents=event.contents,
        start_time=event.start_time,
        end_time=event.end_time,
        created_at=datetime.now()
    )
    sample_events.append(new_event)
    logger.info(f"✅ イベント作成完了: ID {new_id}")
    return new_event

@app.put("/api/events/{event_id}", response_model=EventData)
def update_event(event_id: int, event: EventCreate):
    logger.info(f"✏️ イベント更新: ID {event_id}")
    for i, existing_event in enumerate(sample_events):
        if existing_event.id == event_id:
            updated_event = EventData(
                id=event_id,
                title=event.title,
                date=event.date,
                contents=event.contents,
                start_time=event.start_time,
                end_time=event.end_time,
                created_at=existing_event.created_at
            )
            sample_events[i] = updated_event
            logger.info(f"✅ イベント更新完了: ID {event_id}")
            return updated_event
    
    logger.warning(f"⚠️ イベントが見つかりません: ID {event_id}")
    raise HTTPException(status_code=404, detail="Event not found")

@app.delete("/api/events/{event_id}")
def delete_event(event_id: int):
    logger.info(f"🗑️ イベント削除: ID {event_id}")
    for i, event in enumerate(sample_events):
        if event.id == event_id:
            deleted_event = sample_events.pop(i)
            logger.info(f"✅ イベント削除完了: {deleted_event.title}")
            return {"message": f"Event '{deleted_event.title}' deleted successfully"}
    
    logger.warning(f"⚠️ 削除対象イベントが見つかりません: ID {event_id}")
    raise HTTPException(status_code=404, detail="Event not found")

@app.get("/api/events/month/{year}/{month}")
def get_events_by_month(year: int, month: int):
    logger.info(f"📅 月別イベント取得: {year}-{month:02d}")
    month_str = f"{year:04d}-{month:02d}"
    events = [event for event in sample_events if event.date.startswith(month_str)]
    logger.info(f"📦 該当イベント数: {len(events)}")
    return events

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "events_count": len(sample_events)
    }

# ✅ 起動時ログを追加
if __name__ == "__main__":
    logger.info("🚀 Schedule Manager API を起動中...")
    logger.info(f"📦 初期イベント数: {len(sample_events)}")
    logger.info(f"📅 イベント日付: {[event.date for event in sample_events]}")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
