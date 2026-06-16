from pydantic import BaseModel
from typing import Optional

class ChatMessage(BaseModel):
    role:    str          # "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    messages:       list[ChatMessage]
    conversation_id: Optional[str] = None
    user_id:        Optional[str] = None
    jlpt_level:     Optional[str] = "N4"
    language:       str = "en"   # response language preference

class ChatChunk(BaseModel):
    delta:   str
    done:    bool = False
    grammar: Optional[dict] = None

class EmbedRequest(BaseModel):
    text:     str
    entry_id: Optional[str] = None
    type:     str = "word"    # word | grammar | kanji

class AnalyzeRequest(BaseModel):
    text: str

class MorphemeToken(BaseModel):
    surface:    str
    reading:    str
    pos:        str           # part of speech
    base_form:  str
    is_unknown: bool