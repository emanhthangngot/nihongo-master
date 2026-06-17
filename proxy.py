import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import httpx

app = FastAPI()
client = httpx.AsyncClient(base_url="http://localhost:54321")

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def proxy(request: Request, path: str):
    target_path = path.replace("rest/v1/", "")
    url = httpx.URL(path=target_path, query=request.url.query.encode("utf-8"))
    req = client.build_request(
        request.method, url,
        headers=request.headers.raw,
        content=request.stream()
    )
    r = await client.send(req, stream=True)
    return StreamingResponse(
        r.aiter_raw(),
        status_code=r.status_code,
        headers=r.headers
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=54323)
