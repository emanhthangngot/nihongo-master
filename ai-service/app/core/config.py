from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # LLM settings
    ollama_base_url:   str  = "http://localhost:11434"
    ollama_model:      str  = "gemma2:9b"
    groq_api_key:      str  = ""
    groq_model:        str  = "llama3-70b-8192"
    gemini_api_key:    str  = ""
    embed_model:       str  = "models/embedding-001"
    use_groq_fallback: bool = True

    # Database / Supabase
    supabase_url:          str = ""
    supabase_service_key:  str = ""   # SUPABASE_SERVICE_ROLE_KEY alias
    database_url:          str = "postgresql+asyncpg://postgres:postgres@localhost:54322/postgres"

    # Redis
    redis_url: str = "redis://localhost:6379"

    class Config:
        env_file = ".env"
        # Allow SUPABASE_SERVICE_ROLE_KEY → supabase_service_key
        env_prefix = ""
        populate_by_name = True

    def model_post_init(self, __context) -> None:  # type: ignore[override]
        import os
        if not self.supabase_service_key:
            self.supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        if not self.supabase_url:
            self.supabase_url = os.getenv("SUPABASE_URL", "")


settings = Settings()
