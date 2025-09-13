from sqlalchemy.orm import Session
from sqlalchemy import extract, desc, text
import models
from datetime import datetime, date
import logging
import schemas
from sqlalchemy.types import String

logger = logging.getLogger(__name__)

# スケジュールを作成（保存）する関数
def create_schedule(db: Session, schedule: schemas.ScheduleCreate):
    if db.query(models.Tag).filter(models.Tag.name == schedule.tag).count() == 0:
        db_tag = models.Tag(name=schedule.tag)
        db.add(db_tag)
        db.commit()
        db.refresh(db_tag)
    tag_id = db.query(models.Tag).filter(models.Tag.name == schedule.tag).first().id
    db_schedule = models.Schedule(
        title=schedule.title,
        description=schedule.description,
        start_time=datetime.strptime(schedule.start_time, '%Y-%m-%dT%H:%M:%S'),
        end_time=datetime.strptime(schedule.end_time, '%Y-%m-%dT%H:%M:%S'),
        tag_id=tag_id
    )
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

# スケジュールを全件取得する関数
def get_schedules(db: Session):
    return db.query(models.Schedule).all()

# ✅ 修正版：日付範囲での年月取得
def get_schedules_by_month(db: Session, year: int, month: int):
    """start_timeから年月でスケジュールを取得（日付範囲使用）"""
    logger.info(f"📅 CRUD: 年月検索 {year}年{month}月")
    try:
        # ✅ 指定年月の開始日と終了日を計算
        start_date = datetime(year, month, 1)

        # 次の月の1日を計算（月末を求めるため）
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        
        logger.info(f"📅 検索範囲: {start_date} ~ {end_date}")
        
        # ✅ start_timeが指定範囲内のレコードを取得
        schedules = db.query(models.Schedule).filter(
            models.Schedule.start_time >= start_date,
            models.Schedule.start_time < end_date
        ).order_by(models.Schedule.start_time.asc()).all()
        schedules_all = db.query(models.Schedule).all()
        logger.info(f"✅ CRUD: {len(schedules)}件取得")
        logger.info(f"📅 全件数: {len(schedules_all)}件")
        return schedules
    except Exception as e:
        logger.error(f"❌ CRUD エラー（日付範囲使用）: {str(e)}")
        # ✅ フォールバック: extract を使用
        try:
            logger.info("📅 フォールバック: extract関数を使用")
            schedules = db.query(models.Schedule).filter(
                extract('year', models.Schedule.start_time) == year,
                extract('month', models.Schedule.start_time) == month
            ).order_by(models.Schedule.start_time.asc()).all()
            logger.info(f"✅ フォールバック成功: {len(schedules)}件取得")
            return schedules
        except Exception as fallback_error:
            logger.error(f"❌ フォールバックも失敗: {str(fallback_error)}")
            # ✅ 最終フォールバック: 全件取得
            try:
                logger.info("📅 最終フォールバック: 全件取得")
                schedules = db.query(models.Schedule).all()
                logger.info(f"✅ 最終フォールバック成功: {len(schedules)}件取得")
                return schedules
            except Exception as final_error:
                logger.error(f"❌ 最終フォールバックも失敗: {str(final_error)}")
                return []

def get_schedules_by_month_simple(db: Session, year: int, month: int):
    """詳細デバッグ版：エラーの原因を特定"""
    logger.info(f"📅 CRUD (Simple): 年月検索 {year}年{month}月")
    
    # ✅ 1. モデルの属性を詳細確認
    try:
        logger.info("🔍 モデル属性の確認開始")
        
        # Scheduleクラスの属性一覧
        schedule_attrs = dir(models.Schedule)
        logger.info(f"📋 Schedule属性: {[attr for attr in schedule_attrs if not attr.startswith('_')]}")
        
        # テーブルカラムの確認
        if hasattr(models.Schedule, '__table__'):
            columns = [col.name for col in models.Schedule.__table__.columns]
            logger.info(f"🗂️ テーブルカラム: {columns}")
            
            # 各カラムの詳細
            for col in models.Schedule.__table__.columns:
                logger.info(f"   {col.name}: {col.type}")
        
        # start_time属性の存在確認
        if hasattr(models.Schedule, 'start_time'):
            logger.info("✅ start_time属性が存在します")
        else:
            logger.error("❌ start_time属性が存在しません！")
        
        # date属性の存在確認
        if hasattr(models.Schedule, 'date'):
            logger.warning("⚠️ date属性が存在します（予期しない）")
        else:
            logger.info("✅ date属性は存在しません（期待通り）")
            
    except Exception as e:
        logger.error(f"❌ モデル確認エラー: {str(e)}")
    
    # ✅ 2. 段階的にクエリを実行
    try:
        logger.info("🔍 段階的クエリ実行")
        
        # 段階1: 基本的なクエリ
        logger.info("📊 段階1: 基本クエリ")
        basic_query = db.query(models.Schedule)
        logger.info(f"✅ 基本クエリ成功")
        
        # 段階2: カウント取得
        logger.info("📊 段階2: カウント取得")
        count = basic_query.count()
        logger.info(f"✅ 総件数: {count}件")
        
        # 段階3: 全件取得
        logger.info("📊 段階3: 全件取得")
        all_schedules = basic_query.all()
        logger.info(f"✅ 全件取得成功: {len(all_schedules)}件")
        
        # 段階4: start_timeフィルタ（単純な条件）
        logger.info("📊 段階4: start_time条件フィルタ")
        simple_filter = db.query(models.Schedule).filter(
            models.Schedule.start_time.isnot(None)
        ).count()
        logger.info(f"✅ start_time NOT NULL: {simple_filter}件")
        
        # 段階5: 日付範囲フィルタ
        logger.info("📊 段階5: 日付範囲フィルタ")
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        
        logger.info(f"📅 検索範囲: {start_date} ~ {end_date}")
        
        # フィルタを一つずつ適用
        logger.info("🔍 フィルタ1: start_time >= start_date")
        filter1 = db.query(models.Schedule).filter(
            models.Schedule.start_time >= start_date
        ).count()
        logger.info(f"✅ フィルタ1結果: {filter1}件")
        
        logger.info("🔍 フィルタ2: start_time < end_date")
        filter2 = db.query(models.Schedule).filter(
            models.Schedule.start_time < end_date
        ).count()
        logger.info(f"✅ フィルタ2結果: {filter2}件")
        
        # 段階6: 両方のフィルタ適用
        logger.info("📊 段階6: 両方のフィルタ適用")
        filtered_query = db.query(models.Schedule).filter(
            models.Schedule.start_time >= start_date,
            models.Schedule.start_time < end_date
        )
        filtered_count = filtered_query.count()
        logger.info(f"✅ フィルタ済み件数: {filtered_count}件")
        
        # 段階7: ORDER BY適用
        logger.info("📊 段階7: ORDER BY適用")
        ordered_query = filtered_query.order_by(models.Schedule.start_time.asc())
        logger.info(f"✅ ORDER BY成功")
        
        # 段階8: 最終実行
        logger.info("📊 段階8: 最終実行")
        schedules = ordered_query.all()
        logger.info(f"✅ 最終結果: {len(schedules)}件取得")
        
        return schedules
        
    except Exception as e:
        logger.error(f"❌ CRUD (Simple) エラー: {str(e)}")
        logger.error(f"❌ エラー型: {type(e)}")
        logger.error(f"❌ エラー詳細: {str(e)}")
        
        # スタックトレースも出力
        import traceback
        logger.error(f"❌ スタックトレース: {traceback.format_exc()}")
        
        return []