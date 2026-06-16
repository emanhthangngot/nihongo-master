import pytest
from unittest.mock import patch, MagicMock
from app.routers.chat import rewrite_query
from app.rag.retriever import retrieve_notebook_items

@pytest.mark.asyncio
async def test_rewrite_query_no_history():
    query = "テスト"
    history = []
    
    # Without history, it should just return the query
    result = await rewrite_query(query, history)
    assert result == "テスト"

@pytest.mark.asyncio
async def test_retrieve_notebook_items():
    # Test fallback when db is not available
    with patch("app.rag.retriever._sb", None):
        result = await retrieve_notebook_items("user-1", [0.1, 0.2], top_k=2)
        assert result == []

    # Test with mock db
    mock_sb = MagicMock()
    mock_execute = MagicMock()
    mock_execute.execute.return_value = MagicMock(data=[
        {"pattern": "N1はN2", "meaning": "N1 is N2", "example_jp": "私は学生です"}
    ])
    mock_sb.rpc.return_value = mock_execute
    
    with patch("app.rag.retriever._sb", mock_sb):
        result = await retrieve_notebook_items("user-1", [0.1, 0.2], top_k=2)
        assert len(result) == 1
        assert "[Personal Note] N1はN2: N1 is N2 (e.g. 私は学生です)" in result[0]
