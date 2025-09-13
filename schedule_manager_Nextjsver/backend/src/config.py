from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DEBUG: bool = False
    DATABASE_URL: str
    ALLOWED_ORIGINS: str
    API_PORT: int

    @property
    def origins_list(self) -> List[str]:
        """
        ALLOWED_ORIGINSの文字列をカンマで分割してリストに変換する。
        例: "http://a.com,http://b.com" -> ["http://a.com", "http://b.com"]
        """
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(',')]
settings = Settings()