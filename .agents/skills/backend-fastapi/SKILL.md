---
name: backend-fastapi
description: >-
  Python FastAPI, Pydantic v2, and layered service architecture patterns for the Backend Dev Team (backend-dev). Activate when building REST API endpoints, Pydantic v2 validation schemas, dependency injection, or async business logic in backend/.
---

# Backend Team Runbook: FastAPI + Pydantic v2 + Async Services

## 1. Cấu trúc Thư mục Chuẩn (`backend/`)

```text
backend/
├── AGENTS.md                 # Quy chuẩn bắt buộc cho tầng Backend
├── app/
│   ├── __init__.py
│   ├── main.py               # Khởi tạo FastAPI app, CORS, Lifespan, Exception Handlers
│   ├── core/                 # Cấu hình (config.py), bảo mật (security.py), lỗi chuẩn
│   ├── schemas/              # Pydantic v2 Schemas (Create, Update, Response)
│   ├── services/             # Business Logic & Transaction Management
│   └── api/
│       └── v1/
│           ├── router.py     # Gộp các APIRouter
│           └── endpoints/    # Từng nhóm route theo resource
└── tests/                    # Bộ kiểm thử pytest + httpx.AsyncClient
    └── conftest.py
```

## 2. Mẫu Pydantic v2 Schema Chuẩn (`backend/app/schemas/`)

```python
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ItemCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Tiêu đề")
    description: str | None = Field(default=None, max_length=2000)


class ItemUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)


class ItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    created_at: datetime
    updated_at: datetime
```

## 3. Quy tắc Thiết kế Endpoint & Dependency Injection
- Dùng `Annotated[AsyncSession, Depends(get_db_session)]` cho DI gọn gàng, rõ kiểu.
- Luôn khai báo `response_model=...` và `status_code=status.HTTP_201_CREATED` (cho `POST`) hoặc `status.HTTP_204_NO_CONTENT` (cho `DELETE`).
- Mọi lỗi nghiệp vụ phải trả về `HTTPException(status_code=..., detail="...")` nhất quán với API Contract trong `plan.md`.
