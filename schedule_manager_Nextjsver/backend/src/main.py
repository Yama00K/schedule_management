from fastapi import FastAPI, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import crud
import models
import schemas
from database import engine, get_db
from config import settings
import logging

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    # allow_origins=["*"],  # 開発中は全許可、本番では適切に設定すること
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!", "debug_mode": settings.DEBUG}

# ✅ 完全修正版: すべてのケースを処理
@app.get("/api/events", response_model=List[schemas.ScheduleGet], status_code=status.HTTP_200_OK)
def get_events(
    year: Optional[int] = Query(None, description="年 (例: 2025)"),
    month: Optional[int] = Query(None, description="月 (例: 9)"),
    date: Optional[str] = Query(None, description="特定日 (例: 2025-09-10)"),
    limit: Optional[int] = Query(100, description="取得件数制限"),
    db: Session = Depends(get_db)
    ):
    """
    イベントを取得するエンドポイント
    
    使用例:
    - GET /api/events?year=2025&month=9 (年月指定)
    - GET /api/events?date=2025-09-10 (特定日)
    - GET /api/events (全イベント)
    """
    
    logger.info(f"📡 API呼び出し: year={year}, month={month}, date={date}, limit={limit}")
    
    try:
        schedules = []  # ✅ 初期化を必ず行う
        
        # バリデーション
        if not (1 <= month <= 12):
            raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
        if year < 1900 or year > 2100:
            raise HTTPException(status_code=400, detail="Year must be between 1900 and 2100")
        
        logger.info(f"📅 年月検索（シンプル版）: {year}年{month}月")
        # ✅ 一時的にシンプル版を使用
        schedules = crud.get_schedules_by_month(db=db, year=year, month=month)
        
        logger.info(f"✅ 取得結果: {len(schedules)}件")
        return schedules

    except Exception as e:
        logger.error(f"❌ 予期しないエラー: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal server error: {str(e)}")

# スケジュール追加エンドポイント
@app.post("/api/add-schedule", response_model=schemas.ScheduleGet, status_code=status.HTTP_201_CREATED)
def add_schedule(schedule: schemas.ScheduleCreate, db: Session = Depends(get_db)):
    """スケジュール追加用エンドポイント"""
    try:
        new_schedule = crud.create_schedule(db=db, schedule=schedule)
        return new_schedule
    except Exception as e:
        logger.error(f"❌ 予期しないエラー: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal server error: {str(e)}")

@app.delete("/api/delete-schedule/{schedule_id}", response_model=schemas.ScheduleGet, status_code=status.HTTP_200_OK)
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)):
    """スケジュール削除用エンドポイント"""
    try:
        deleted_schedule = crud.delete_schedule(db=db, schedule_id=schedule_id)
        if deleted_schedule is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")
        return deleted_schedule
    except Exception as e:
        logger.error(f"❌ 予期しないエラー: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal server error: {str(e)}")

@app.get("/api/schedules", response_model=List[schemas.ScheduleGet], status_code=status.HTTP_200_OK)
def get_schedules(
    tag: Optional[str] = Query(None, description="タグ (例: 'meeting')"),
    year: Optional[int] = Query(None, description="年 (例: 2025)"),
    month: Optional[int] = Query(None, description="月 (例: 9)"),
    day: Optional[int] = Query(None, description="日 (例: 10)"),
    db: Session = Depends(get_db)
    ):
    try:
        schedules = []
        schedules = crud.get_schedules(db=db, tag=tag, year=year, month=month, day=day)
        logger.info(f"✅ 取得結果: {len(schedules)}件")
        return schedules
    except Exception as e:
        logger.error(f"❌ 予期しないエラー: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal server error: {str(e)}")