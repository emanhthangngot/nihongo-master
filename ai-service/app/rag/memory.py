"""
Per-conversation chat memory manager.
Stores recent turns in RAM; for production, persist to Supabase chat_messages.
"""
from collections import deque
from dataclasses import dataclass, field
from typing import Optional

MAX_TURNS = 20  # Keep last 20 exchanges per conversation


@dataclass
class Turn:
    role: str     # "user" | "assistant"
    content: str


@dataclass
class ConversationMemory:
    conversation_id: str
    turns: deque = field(default_factory=lambda: deque(maxlen=MAX_TURNS * 2))

    def add_turn(self, role: str, content: str) -> None:
        self.turns.append(Turn(role=role, content=content))

    def get_history_text(self) -> list[str]:
        lines = []
        for t in self.turns:
            prefix = "User" if t.role == "user" else "Sensei"
            lines.append(f"{prefix}: {t.content[:200]}")
        return lines


class MemoryManager:
    def __init__(self) -> None:
        self._store: dict[str, ConversationMemory] = {}

    def get(self, conversation_id: str) -> ConversationMemory:
        if conversation_id not in self._store:
            self._store[conversation_id] = ConversationMemory(conversation_id=conversation_id)
        return self._store[conversation_id]

    def add_turn(self, conversation_id: str, role: str, content: str) -> None:
        self.get(conversation_id).add_turn(role, content)

    def get_history(self, conversation_id: Optional[str]) -> list[str]:
        if not conversation_id:
            return []
        return self.get(conversation_id).get_history_text()


memory_manager = MemoryManager()
