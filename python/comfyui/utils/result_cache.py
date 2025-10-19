from collections import OrderedDict
from threading import RLock
from typing import Optional


class ResultCache:
    """Simple thread-safe LRU cache for storing small binary results (e.g., PNG bytes)."""

    def __init__(self, max_items: int = 64):
        self._lock = RLock()
        self._store: OrderedDict[str, bytes] = OrderedDict()
        self._max_items = max_items

    def get(self, key: str) -> Optional[bytes]:
        with self._lock:
            value = self._store.get(key)
            if value is not None:
                self._store.move_to_end(key)
            return value

    def set(self, key: str, value: bytes) -> None:
        with self._lock:
            self._store[key] = value
            self._store.move_to_end(key)
            if len(self._store) > self._max_items:
                self._store.popitem(last=False)


GLOBAL_RESULT_CACHE = ResultCache(max_items=96)


