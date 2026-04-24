"""
SudachiPy morphological analysis — tokenizes Japanese text into morphemes.
"""
import sudachipy
from sudachipy import tokenizer as stoken
from app.models.schemas import MorphemeToken

_tokenizer = None

def get_tokenizer():
    global _tokenizer
    if _tokenizer is None:
        _tokenizer = sudachipy.Dictionary().create()
    return _tokenizer

def analyze(text: str) -> list[MorphemeToken]:
    """
    Tokenize Japanese text using SudachiPy (SplitMode.C = longest unit).
    Returns a list of MorphemeToken with surface form, reading, POS, and base form.
    """
    t = get_tokenizer()
    morphemes = t.tokenize(text, stoken.Tokenizer.SplitMode.C)
    result = []
    for m in morphemes:
        result.append(MorphemeToken(
            surface=m.surface(),
            reading=m.reading_form(),
            pos=m.part_of_speech()[0],
            base_form=m.dictionary_form(),
            is_unknown=m.is_oov(),
        ))
    return result