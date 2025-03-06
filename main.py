#!/usr/bin/env python
import json
import os
from pathlib import Path

from fastapi import FastAPI, Request, Response
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
# from fastapi.middleware.sessions import SessionMiddleware

import fixtures
from gameon_utils import GameOnUtils
from mirror.mirror import mirror_router
from models import Fiddle, default_fiddle

app = FastAPI()

# # Use SessionMiddleware instead of secret_key
# app.add_middleware(
#     SessionMiddleware,
#     secret_key='93986c9cdd240540f70efaea56a9e3f2'
# )

templates = Jinja2Templates(directory=".")

current_dir = Path(__file__).parent
debug = (
    os.environ.get("SERVER_SOFTWARE", "").startswith("Development")
    or os.environ.get("IS_DEVELOP", "") == "1"
    or Path(current_dir / "models/debug.env").exists()
)

GCLOUD_STATIC_BUCKET_URL = "/static" if debug else "https://static.netwrck.com/simstatic"

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def main_handler(request: Request):
    # Convert default_fiddle to a dict for JSON serialization
    current_saved_fiddle = {
        "id": default_fiddle.id,
        "title": default_fiddle.title,
        "description": default_fiddle.description,
        "start_url": default_fiddle.start_url,
        "script": default_fiddle.script,
        "style": default_fiddle.style,
        "script_language": default_fiddle.script_language,
        "style_language": default_fiddle.style_language
    }
    
    return templates.TemplateResponse("templates/index.jinja2", {
        "request": request,
        "fiddle": default_fiddle,
        "current_saved_fiddle": current_saved_fiddle,
        "title": "WebSim by Netwrck!",
        "description": "AI Creator - Make CSS and JavaScript To Create any and every web page! Share the results!",
        "json": json,
        "fixtures": fixtures,
        "GameOnUtils": GameOnUtils,
        "static_url": GCLOUD_STATIC_BUCKET_URL,
        "url": request.url,
    })

@app.get("/_ah/warmup")
async def warmup_handler():
    return ""

@app.get("/createfiddle")
async def create_fiddle_handler(request: Request):
    fiddle = Fiddle()
    fiddle.id = request.query_params.get('id')
    fiddle.title = request.query_params.get('title')
    fiddle.description = request.query_params.get('description')
    fiddle.start_url = request.query_params.get('start_url')
    fiddle.script = request.query_params.get('script')
    fiddle.style = request.query_params.get('style')
    
    # Fix type issues with None values
    script_language = request.query_params.get('script_language')
    style_language = request.query_params.get('style_language')
    
    fiddle.script_language = fixtures.SCRIPT_TYPES[script_language] if script_language else fixtures.SCRIPT_TYPES['javascript']
    fiddle.style_language = fixtures.STYLE_TYPES[style_language] if style_language else fixtures.STYLE_TYPES['css']
    
    Fiddle.save(fiddle)
    return "success"

@app.get("/{fiddlekey}", response_class=HTMLResponse)
async def get_fiddle_handler(request: Request, fiddlekey: str):
    current_fiddle = Fiddle.byUrlKey(fiddlekey)
    if not current_fiddle:
        current_fiddle = default_fiddle
        
    # Convert fiddle to a dict for JSON serialization
    current_saved_fiddle = {
        "id": current_fiddle.id,
        "title": current_fiddle.title,
        "description": current_fiddle.description,
        "start_url": current_fiddle.start_url,
        "script": current_fiddle.script,
        "style": current_fiddle.style,
        "script_language": current_fiddle.script_language,
        "style_language": current_fiddle.style_language
    }
    
    return templates.TemplateResponse("templates/index.jinja2", {
        "request": request,
        "fiddle": current_fiddle,
        "current_saved_fiddle": current_saved_fiddle,
        "title": current_fiddle.title,
        "description": current_fiddle.description,
        "json": json,
        "fixtures": fixtures,
        "GameOnUtils": GameOnUtils,
        "static_url": GCLOUD_STATIC_BUCKET_URL,
        "url": request.url,
    })

@app.get("/sitemap.xml", response_class=HTMLResponse)
async def sitemap_handler(request: Request):
    content = templates.get_template("sitemap.xml").render({"request": request})
    return Response(content=content, media_type="text/xml")

@app.get("/{url:path}/")
async def slash_murderer(url: str):
    return RedirectResponse(url=f"/{url}")

# Include the mirror router
app.include_router(mirror_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
