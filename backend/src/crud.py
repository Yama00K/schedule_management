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
    if schedule.tag is not None:
        if db.query(models.Tag).filter(models.Tag.name == schedule.tag).count() == 0:
            db_tag = models.Tag(name=schedule.tag)
            db.add(db_tag)
            db.commit()
            db.refresh(db_tag)
        tag_id = db.query(models.Tag).filter(models.Tag.name == schedule.tag).first().id
    else:
        tag_id = None
    db_schedule = models.Schedule(
        title=schedule.title,
        description=schedule.description,
        start_time=schedule.start_time,
        end_time=schedule.end_time,
        tag_id=tag_id
    )
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

def delete_schedule(db: Session, schedule_id: int):
    db_schedule = db.query(models.Schedule).filter(models.Schedule.id == schedule_id).first()
    if db_schedule is None:
        return None
    db.delete(db_schedule)
    db.commit()
    return db_schedule

# スケジュールを全件取得する関数
def get_schedules_all(db: Session):
    return db.query(models.Schedule).all()

def get_schedules(
        db: Session,
        tag: str | None,
        year: int | None,
        month: int | None,
        day: int | None
    ):
    if tag is not None:
        tag_id = db.query(models.Tag).filter(models.Tag.name == tag).first().id
    else:
        tag_id = None
    schedules = db.query(models.Schedule)
    if tag_id is not None:
        schedules = schedules.filter(models.Schedule.tag_id == tag_id)
    if year is not None:
        schedules = schedules.filter(extract('year', models.Schedule.start_time) == year)
    if month is not None:
        schedules = schedules.filter(extract('month', models.Schedule.start_time) == month)
    if day is not None:
        schedules = schedules.filter(extract('day', models.Schedule.start_time) == day)
    return schedules.all()


# ✅ 修正版：日付範囲での年月取得
def get_schedules_by_month(db: Session, year: int, month: int):
    """start_timeから年月でスケジュールを取得（日付範囲使用）"""
    logger.info(f"📅 CRUD: 年月検索 {year}年{month}月")
    try:
        # ✅ 指定年月の開始日と終了日を計算
        # 前月、翌月の一部も表示するため、前後3ヶ月分を取得
        if month == 1:
            start_date = datetime(year - 1, 12, 1)
        else:
            start_date = datetime(year, month - 1, 1)

        # 次の月の1日を計算（月末を求めるため）
        if month == 12:
            end_date = datetime(year + 1, 2, 1)
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