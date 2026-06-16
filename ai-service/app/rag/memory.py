"""
Per-conversation chat memory manager.
Now persists to Supabase chat_messages.
"""
from typing import Optional

try:
    from supabase import create_client, Client
    from app.core.config import settings
    _sb: Optional[Client] = (
        create_client(settings.supabase_url, settings.supabase_service_key)
        if settings.supabase_url and settings.supabase_service_key
        else None
    )
except Exception:
    _sb = None

MAX_TURNS = 20

class MemoryManager:
    def __init__(self) -> None:
        # Fallback RAM storage if no DB
        self._store: dict[str, list[dict]] = {}

    def get_history(self, conversation_id: Optional[str]) -> list[str]:
        if not conversation_id:
            return []
        
        if _sb:
            try:
                res = _sb.table("chat_messages").select("role, content").eq("conversation_id", conversation_id).order("created_at", desc=False).limit(MAX_TURNS).execute()
                lines = []
                for row in res.data or []:
                    prefix = "User" if row["role"] == "user" else "Sensei"
                    lines.append(f"{prefix}: {row['content'][:200]}")
                return lines
            except Exception as e:
                print(f"Error reading chat_messages: {e}")
                return []
        else:
            turns = self._store.get(conversation_id, [])
            lines = []
            for t in turns:
                prefix = "User" if t["role"] == "user" else "Sensei"
                lines.append(f"{prefix}: {t['content'][:200]}")
            return lines

    def add_turn(self, conversation_id: str, role: str, content: str, grammar: dict | None = None) -> None:
        if not conversation_id:
            return
            
        if _sb:
            try:
                data = {
                    "conversation_id": conversation_id,
                    "role": role,
                    "content": content
                }
                if grammar:
                    data["grammar_data"] = grammar
                _sb.table("chat_messages").insert(data).execute()
            except Exception as e:
                print(f"Error inserting chat_messages: {e}")
        else:
            if conversation_id not in self._store:
                self._store[conversation_id] = []
            self._store[conversation_id].append({"role": role, "content": content})
            if len(self._store[conversation_id]) > MAX_TURNS:
                self._store[conversation_id].pop(0)

memory_manager = MemoryManager()
