from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from r2_client import (
    generate_presigned_upload_url,
    list_user_objects,
    delete_user_object,
    rename_user_object,
)

uploads_router = APIRouter()

@uploads_router.get('/api/uploads/sign')
def get_signed_upload_url(user_id: str = Query(...), filename: str = Query(...)):
    try:
        url = generate_presigned_upload_url(user_id, filename)
        return {'url': url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@uploads_router.get('/api/uploads/list')
def list_uploads(user_id: str = Query(...)):
    try:
        files = list_user_objects(user_id)
        return {'files': files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@uploads_router.post('/api/uploads/delete')
def delete_upload(user_id: str = Query(...), filename: str = Query(...)):
    try:
        delete_user_object(user_id, filename)
        return {"status": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@uploads_router.post('/api/uploads/rename')
def rename_upload(user_id: str = Query(...), old_name: str = Query(...), new_name: str = Query(...)):
    try:
        rename_user_object(user_id, old_name, new_name)
        return {"status": "renamed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
