# API Integration Analysis - Frontend vs Backend

## Executive Summary

The frontend and backend have an **API mismatch** that prevents the document upload → question generation flow from working. This document outlines the gaps and provides implementation guidance.

---

## Current State

### Frontend Expectations (gamify-study-pane)

The frontend expects these endpoints:

| Method | Endpoint | Purpose | Frontend File |
|--------|----------|---------|---------------|
| POST | `/api/games/create-new-game` | Create game from prompt | `gameService.ts:107-128` |
| POST | `/api/study-materials/upload` | Upload document (PDF/DOC/TXT) | `gameService.ts:139-162` |
| POST | `/api/games/generate-questions` | Generate questions from uploaded document | `gameService.ts:169-190` |
| GET | `/api/games/generate-questions/{gameId}/status` | Poll generation status | `gameService.ts:197-212` |

### Backend Reality (game-learn-backend)

The backend currently provides:

| Method | Endpoint | Purpose | Backend File |
|--------|----------|---------|---------------|
| POST | `/api/auth/register/` | User registration | `users/api/views.py:8-25` |
| POST | `/api/auth/token/` | Login (get JWT) | Django SimpleJWT |
| POST | `/api/auth/token/refresh/` | Refresh access token | Django SimpleJWT |
| POST | `/api/games/generate/` | Generate game from prompt only | `games/api/views.py:16-59` |
| GET | `/api/games/` | List user's games | `games/api/views.py:62-71` |
| GET | `/api/games/{id}/play/` | Get game code & data | `games/api/views.py:74-90` |

---

## API Gaps Analysis

### ❌ Missing Backend Endpoints

#### 1. File Upload Endpoint
**Frontend expects:** `POST /api/study-materials/upload`

**Status:** ❌ **DOES NOT EXIST**

**Requirements:**
- Accept multipart/form-data file upload
- Validate file type (PDF, DOC, DOCX, TXT, MD)
- Validate file size (max 10MB)
- Store file in `MEDIA_ROOT`
- Extract text content using PyPDF2, python-docx
- Return `fileId` for later use

**Backend has capabilities:**
- ✅ PyPDF2 installed (line 25 in requirements.txt)
- ✅ python-docx installed (line 26)
- ✅ MEDIA_ROOT configured (settings.py:97)
- ✅ django-storages installed (line 33)

---

#### 2. RAG Question Generation Endpoint
**Frontend expects:** `POST /api/games/generate-questions`

**Status:** ❌ **DOES NOT EXIST**

**Requirements:**
- Accept `{ templateId, fileId, gameType, questionsCount, difficulty }`
- Load uploaded document text by fileId
- Use RAG to generate questions from document
- Store questions in game_data JSON field
- Return game with `status='processing'`
- Process asynchronously

**Backend has capabilities:**
- ✅ ChromaDB for RAG (chroma_manager.py)
- ✅ LangChain + OpenAI (pixijs_generator.py)
- ✅ Celery for async tasks (celery.py configured)
- ✅ JSONField in UserGame model for game_data

---

#### 3. Generation Status Polling Endpoint
**Frontend expects:** `GET /api/games/generate-questions/{gameId}/status`

**Status:** ❌ **DOES NOT EXIST**

**Requirements:**
- Return `{ status, progress, questionsGenerated, totalQuestions, message, error }`
- Status values: 'processing' | 'ready' | 'error'
- Progress: 0-100 percentage

**Current workaround:**
- Frontend can poll `GET /api/games/{id}/play/` and check `status` field
- But doesn't provide progress percentage or detailed status

---

#### 4. Create New Game Endpoint Mismatch
**Frontend expects:** `POST /api/games/create-new-game`
**Backend has:** `POST /api/games/generate/`

**Status:** ⚠️ **PARTIAL MISMATCH**

**Differences:**

| Field | Frontend Sends | Backend Expects |
|-------|----------------|-----------------|
| Request | `{ title, prompt, gameType, category, difficulty }` | `{ prompt }` only |
| Response | `{ id, title, description, category, difficulty, gameType, playUrl, thumbnail, createdAt, status }` | Backend wraps in `{ success, data }` |

---

## Data Flow Comparison

### Frontend Expected Flow

```
User uploads PDF
     ↓
POST /api/study-materials/upload
     ↓
Backend extracts text, returns fileId
     ↓
Frontend sends: POST /api/games/generate-questions
   { templateId: 1, fileId: "abc123", gameType: "plane", questionsCount: 10, difficulty: "Medium" }
     ↓
Backend starts RAG processing (Celery task)
     ↓
Returns: { id: "game-uuid", status: "processing", progress: 0 }
     ↓
Frontend polls: GET /api/games/generate-questions/{id}/status
     ↓
Backend returns: { status: "processing", progress: 45, message: "Extracting questions..." }
     ↓
... (poll every 2 seconds) ...
     ↓
Backend returns: { status: "ready", progress: 100, questionsGenerated: 10 }
     ↓
Frontend calls: GET /api/games/{id}/play/
     ↓
Backend returns: { pixijs_code, game_data: { questions: [...] } }
     ↓
Frontend renders game with questions
```

### Current Backend Flow

```
User provides text prompt
     ↓
POST /api/games/generate/
   { prompt: "Create a quiz about Python" }
     ↓
Backend generates game synchronously (GPT-4)
     ↓
Returns: { success: true, data: { id, title, description, status: "generating" } }
     ↓
Frontend polls: GET /api/games/
     ↓
Once status='ready', call: GET /api/games/{id}/play/
     ↓
Returns: { pixijs_code, game_data }
     ↓
Frontend renders game
```

**Key Differences:**
- ❌ No document upload support
- ❌ No RAG-based question extraction from documents
- ❌ No progress percentage tracking
- ❌ Questions are generated from LLM imagination, not from user's study material

---

## Database Schema Requirements

### New Model Needed: StudyMaterial

```python
class StudyMaterial(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to='study_materials/')
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField()  # in bytes
    file_type = models.CharField(max_length=50)  # 'pdf', 'docx', 'txt', etc.

    # Extracted content
    extracted_text = models.TextField(blank=True)
    extraction_status = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('extracted', 'Extracted'), ('failed', 'Failed')],
        default='pending'
    )

    # Timestamps
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    metadata = models.JSONField(default=dict)  # page count, word count, etc.
```

### Extended UserGame Model Fields

Add these fields to existing UserGame model:

```python
class UserGame(models.Model):
    # ... existing fields ...

    # NEW: Link to source study material
    study_material = models.ForeignKey(
        'StudyMaterial',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='generated_games'
    )

    # NEW: Generation progress tracking
    generation_progress = models.IntegerField(default=0)  # 0-100
    generation_message = models.CharField(max_length=500, blank=True)

    # NEW: Question metrics
    questions_count = models.IntegerField(default=0)
    questions_generated = models.IntegerField(default=0)
```

---

## Implementation Roadmap

### Phase 1: Backend Endpoints (PRIORITY)

#### Step 1: Create StudyMaterial Model & Migration
- [ ] Create `apps/study_materials/models.py`
- [ ] Create migration: `python manage.py makemigrations`
- [ ] Run migration: `python manage.py migrate`

#### Step 2: File Upload Endpoint
- [ ] Create `apps/study_materials/api/views.py`
- [ ] Implement `upload_study_material` view
- [ ] Add text extraction logic (PyPDF2 for PDF, python-docx for DOCX)
- [ ] Create serializer: `StudyMaterialSerializer`
- [ ] Add URL route: `/api/study-materials/upload`

#### Step 3: RAG Question Generator
- [ ] Create `apps/ai_engine/question_generator.py`
- [ ] Implement `generate_questions_from_text()` method
- [ ] Use ChromaDB + LangChain for RAG
- [ ] Prompt engineering for question extraction

#### Step 4: Question Generation Endpoint
- [ ] Extend `apps/games/api/views.py`
- [ ] Implement `generate_questions` view
- [ ] Create Celery task for async processing
- [ ] Link StudyMaterial with UserGame
- [ ] Add URL route: `/api/games/generate-questions`

#### Step 5: Status Polling Endpoint
- [ ] Extend `apps/games/api/views.py`
- [ ] Implement `get_generation_status` view
- [ ] Return progress percentage from Celery task state
- [ ] Add URL route: `/api/games/generate-questions/<game_id>/status`

#### Step 6: Align Create Game Endpoint
- [ ] Update `/api/games/generate/` to accept additional fields
- [ ] OR create `/api/games/create-new-game` as alias
- [ ] Ensure response format matches frontend expectations

---

### Phase 2: Frontend Adjustments (if needed)

If backend changes are insufficient:

- [ ] Update API base URL in `src/config/env.ts`
- [ ] Ensure proper error handling for new endpoints
- [ ] Add loading states for document processing
- [ ] Display progress percentage in UI

---

### Phase 3: Testing & Integration

- [ ] Test file upload with various file types
- [ ] Test RAG question generation
- [ ] Test polling mechanism
- [ ] Test error scenarios (invalid file, too large, etc.)
- [ ] End-to-end test: Upload PDF → Generate questions → Display in game

---

## Quick Win Solution

### Temporary Workaround (Frontend Only)

Update `gameService.ts` to map to existing backend:

```typescript
// Map frontend calls to existing backend endpoint
async createNewGame(request: CreateNewGameRequest) {
  // Call existing backend endpoint
  const response = await apiClient.post('/api/games/generate/', {
    prompt: `Create a ${request.gameType} game about ${request.category}
             with ${request.difficulty} difficulty. Title: ${request.title}. ${request.prompt}`
  });

  // Map response to frontend format
  return {
    data: {
      id: response.data.id,
      title: response.data.title,
      description: response.data.description,
      category: request.category,
      difficulty: request.difficulty,
      gameType: request.gameType,
      playUrl: `/game/${response.data.id}`,
      createdAt: response.data.created_at,
      status: response.data.status
    }
  };
}
```

**Limitations:**
- ❌ No document upload support
- ❌ Questions not based on study materials
- ❌ No RAG functionality

---

## Recommended Implementation Priority

### HIGH PRIORITY (Core Functionality)
1. ✅ Backend: File upload endpoint
2. ✅ Backend: Text extraction (PyPDF2, python-docx)
3. ✅ Backend: RAG question generation
4. ✅ Backend: Status polling endpoint

### MEDIUM PRIORITY (User Experience)
5. Frontend: Progress bar for upload
6. Frontend: Progress bar for generation
7. Backend: Celery async tasks
8. Backend: Error handling & retry logic

### LOW PRIORITY (Nice to Have)
9. Backend: File preview/thumbnail
10. Backend: Support more file types (PPT, images with OCR)
11. Frontend: Drag-and-drop file upload
12. Frontend: File validation UI

---

## Expected API Contracts (Final State)

### POST /api/study-materials/upload

**Request:**
```
Content-Type: multipart/form-data
file: <File>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "fileId": "550e8400-e29b-41d4-a716-446655440000",
    "fileName": "study-notes.pdf",
    "fileSize": 1024000,
    "uploadedAt": "2025-10-27T12:00:00Z",
    "extractionStatus": "extracted",
    "wordCount": 5000
  }
}
```

---

### POST /api/games/generate-questions

**Request:**
```json
{
  "templateId": 1,
  "fileId": "550e8400-e29b-41d4-a716-446655440000",
  "gameType": "plane",
  "questionsCount": 10,
  "difficulty": "Medium"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "game-uuid-12345",
    "templateId": 1,
    "title": "Generating game...",
    "description": "Questions are being generated from your study material",
    "difficulty": "Medium",
    "questionsCount": 10,
    "status": "processing",
    "progress": 0,
    "createdAt": "2025-10-27T12:01:00Z"
  }
}
```

---

### GET /api/games/generate-questions/{gameId}/status

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "gameId": "game-uuid-12345",
    "status": "processing",
    "progress": 65,
    "message": "Generating question 7 of 10...",
    "questionsGenerated": 6,
    "totalQuestions": 10
  }
}
```

**When complete:**
```json
{
  "success": true,
  "data": {
    "gameId": "game-uuid-12345",
    "status": "ready",
    "progress": 100,
    "message": "Game ready to play!",
    "questionsGenerated": 10,
    "totalQuestions": 10
  }
}
```

---

## Technical Debt & Considerations

### Security
- [ ] Implement file size limits (10MB)
- [ ] Validate file types (magic bytes, not just extension)
- [ ] Scan uploaded files for malware
- [ ] Rate limit upload endpoint
- [ ] Clean up old uploaded files (cron job)

### Performance
- [ ] Use Celery for async processing (avoid blocking requests)
- [ ] Implement caching for extracted text
- [ ] Optimize RAG retrieval (limit vector search)
- [ ] Add request timeout handling

### Scalability
- [ ] Consider S3 storage instead of local filesystem
- [ ] Implement CDN for static assets
- [ ] Database indexing on fileId and gameId
- [ ] Connection pooling for database

---

## Next Steps

1. **Immediate:** Implement missing backend endpoints (Steps 1-5)
2. **Short-term:** Test end-to-end flow
3. **Medium-term:** Add async processing with Celery
4. **Long-term:** Optimize RAG performance and add more features

---

## Contact & Support

For implementation questions:
- Frontend: Check `src/services/gameService.ts`
- Backend: Check `apps/games/api/views.py`
- API Docs: `API_DOCUMENTATION.md`
