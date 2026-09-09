import logging
import redis
from app.config import settings

logger = logging.getLogger("digitalization_advisor.redis")

class RedisStore:
    def __init__(self):
        self.client = None
        self._in_memory_store = {}
        try:
            r = redis.from_url(settings.REDIS_URL, decode_responses=True, socket_timeout=2)
            r.ping()
            self.client = r
            logger.info(f"Connected to Redis at {settings.REDIS_URL}")
        except Exception as e:
            logger.warning(f"Could not connect to Redis server ({e}). Operating with in-memory state store fallback.")

    def get_clarify_count(self, session_id: str) -> int:
        key = f"{session_id}:clarify_count"
        if self.client:
            try:
                val = self.client.get(key)
                return int(val) if val is not None else 0
            except Exception as e:
                logger.error(f"Redis get error: {e}")
        return int(self._in_memory_store.get(key, 0))

    def increment_clarify_count(self, session_id: str) -> int:
        key = f"{session_id}:clarify_count"
        if self.client:
            try:
                return int(self.client.incr(key))
            except Exception as e:
                logger.error(f"Redis incr error: {e}")
        current = int(self._in_memory_store.get(key, 0)) + 1
        self._in_memory_store[key] = str(current)
        return current

    def set_session_stage(self, session_id: str, stage: str):
        key = f"{session_id}:stage"
        if self.client:
            try:
                self.client.set(key, stage)
                return
            except Exception as e:
                logger.error(f"Redis set error: {e}")
        self._in_memory_store[key] = stage

    def get_session_stage(self, session_id: str) -> str:
        key = f"{session_id}:stage"
        if self.client:
            try:
                val = self.client.get(key)
                if val:
                    return val
            except Exception as e:
                logger.error(f"Redis get stage error: {e}")
        return self._in_memory_store.get(key, "INTAKE")

redis_store = RedisStore()
