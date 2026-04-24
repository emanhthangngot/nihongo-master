from fastapi import APIRouter
from app.models.schemas import AnalyzeRequest
from app.nlp.morphology import analyze

router = APIRouter()

@router.post("/morphemes")
async def morpheme_analysis(req: AnalyzeRequest):
    """
    Tokenize Japanese text into morphemes using SudachiPy.
    Returns surface form, reading, POS, and base form for each token.
    """
    tokens = analyze(req.text)
    return {"text": req.text, "tokens": [t.model_dump() for t in tokens]}

@router.post("/furigana")
async def generate_furigana(req: AnalyzeRequest):
    """Generate ruby/furigana annotations for a Japanese text."""
    tokens = analyze(req.text)
    annotated = [
        {"surface": t.surface, "reading": t.reading if t.reading != t.surface else None}
        for t in tokens
    ]
    return {"tokens": annotated}