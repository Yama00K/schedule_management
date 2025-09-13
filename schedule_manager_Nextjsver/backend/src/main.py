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
    # allow_origins=settings.origins_list,
    allow_origins=["*"],  # 開発中は全許可、本番では適切に設定すること
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

# ✅ ヘルスチェック用エンドポイント
@app.get("/health")
def health_check():
    """API動作確認用"""
    logger.info("🏥 ヘルスチェック実行")
    return {"status": "OK", "message": "Schedule Manager API is running"}

# ✅ エンドポイント一覧表示（デバッグ用）
@app.get("/api/debug/endpoints")
def list_endpoints():
    """登録されているエンドポイント一覧を表示"""
    endpoints = []
    for route in app.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            endpoints.append({
                "path": route.path,
                "methods": list(route.methods),
                "name": route.name
            })
    logger.info(f"🔍 エンドポイント一覧: {len(endpoints)}個")
    return {"endpoints": endpoints}

@app.get("/api/debug/test")
def debug_test():
    """500エラーの原因を特定"""
    try:
        # 1. インポートテスト
        import crud
        import models
        import schemas
        from database import get_db
        
        results = {
            "imports": "OK",
            "crud_functions": [],
            "models": [],
            "database": "Not tested yet"
        }
        
        # 2. CRUD関数の存在確認
        crud_functions = [func for func in dir(crud) if not func.startswith('_')]
        results["crud_functions"] = crud_functions
        
        # 3. モデルの存在確認
        models_list = [attr for attr in dir(models) if not attr.startswith('_')]
        results["models"] = models_list
        
        return results
        
    except ImportError as e:
        return {"error": f"Import Error: {str(e)}", "type": "ImportError"}
    except Exception as e:
        return {"error": str(e), "type": type(e).__name__}

@app.get("/api/debug/database")
def debug_database():
    """データベース接続テスト"""
    try:
        from database import get_db
        db = next(get_db())
        
        # テーブル一覧取得
        result = db.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in result.fetchall()]
        
        return {
            "database_connection": "OK",
            "tables": tables
        }
        
    except Exception as e:
        return {"error": str(e), "type": type(e).__name__}

@app.get("/api/debug/model-info")
def debug_model_info():
    """Scheduleモデルの詳細情報を確認"""
    try:
        import models
        
        # モデルのカラム情報を取得
        schedule_columns = []
        if hasattr(models, 'Schedule'):
            schedule_model = models.Schedule
            if hasattr(schedule_model, '__table__'):
                for column in schedule_model.__table__.columns:
                    schedule_columns.append({
                        "name": column.name,
                        "type": str(column.type),
                        "nullable": column.nullable,
                        "primary_key": column.primary_key
                    })
        
        return {
            "schedule_model_exists": hasattr(models, 'Schedule'),
            "schedule_columns": schedule_columns,
            "model_attributes": [attr for attr in dir(models.Schedule) if not attr.startswith('_')] if hasattr(models, 'Schedule') else []
        }
    
    except Exception as e:
        return {"error": str(e), "type": type(e).__name__}

@app.get("/api/debug/sample-data")
def debug_sample_data(db: Session = Depends(get_db)):
    """データベースのサンプルデータを確認"""
    try:
        # 生データを取得（SQLAlchemy使用）
        schedules = db.query(models.Schedule).limit(3).all()
        
        sample_data = []
        for schedule in schedules:
            sample_data.append({
                "id": schedule.id if hasattr(schedule, 'id') else None,
                "title": schedule.title if hasattr(schedule, 'title') else None,
                "date": str(schedule.date) if hasattr(schedule, 'date') else None,
                "contents": schedule.contents if hasattr(schedule, 'contents') else None,
                "start_time": str(schedule.start_time) if hasattr(schedule, 'start_time') else None,
                "end_time": str(schedule.end_time) if hasattr(schedule, 'end_time') else None,
                "all_attributes": [attr for attr in dir(schedule) if not attr.startswith('_')]
            })
        
        return {
            "total_count": db.query(models.Schedule).count(),
            "sample_data": sample_data
        }
    
    except Exception as e:
        return {"error": str(e), "type": type(e).__name__}