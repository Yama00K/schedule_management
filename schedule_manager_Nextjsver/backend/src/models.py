# backend/src/models.py
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey
)
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func

# 1. Baseクラスの作成
#    全てのモデル（テーブル）はこのBaseクラスを継承します
Base = declarative_base()

# 2. Scheduleモデル（テーブル）の定義
class Schedule(Base):
    """
    スケジュール情報を格納するテーブル
    """
    __tablename__ = 'schedules'  # データベース上でのテーブル名

    # --- カラムの定義 ---
    # id: 主キー（Primary Key）
    id = Column(Integer, primary_key=True, index=True)

    # title: スケジュールのタイトル
    title = Column(String(100), nullable=False)

    # tag_id: スケジュールのタグ
    tag_id = Column(Integer, ForeignKey("tags.id"), nullable=True)

    # description: スケジュールの詳細
    description = Column(String(255), nullable=True)

    # start_time: スケジュールの開始日時
    start_time = Column(DateTime, nullable=False)

    # end_time: スケジュールの終了日時
    end_time = Column(DateTime, nullable=False)

    # created_at: 作成日時
    created_at = Column(DateTime, server_default=func.now())

    # updated_at: 更新日時
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # tags: スケジュールに関連するタグ情報（リレーションシップ）
    tags = relationship("Tag", back_populates="schedules", lazy='joined')

class Tag(Base):
    """
    タグ情報を格納するテーブル
    """
    __tablename__ = 'tags'  # データベース上でのテーブル名

    # --- カラムの定義 ---
    # id: 主キー（Primary Key）
    id = Column(Integer, primary_key=True, index=True)

    # name: タグの名前
    name = Column(String(50), nullable=False, unique=True)

    # schedules: タグに関連するスケジュールのリスト（リレーションシップ）
    schedules = relationship("Schedule", back_populates="tags", lazy='dynamic')