from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# --- Schedule Schemas ---
class ScheduleBase(BaseModel):
    title: str
    description: str | None = None
    start_time: datetime
    end_time: datetime

# ✅ 作成・更新時は、関連付けるタグのIDだけを受け取る
class ScheduleCreate(BaseModel):
    title: str
    description: str | None = None
    start_time: datetime
    end_time: datetime
    tag: str | None = None

# ✅ 読み取り時は、完全なTagオブジェクト（nameを含む）をネストして返す
class ScheduleGet(ScheduleBase):
    id: int
    tag: str | None = None
    tag_id: int | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True