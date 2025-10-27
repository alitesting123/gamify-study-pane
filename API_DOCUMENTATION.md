# Secured API Documentation for Question Creation

## Overview

This document describes the secured API endpoints used for creating questions and generating games from study materials. All API calls are authenticated using JWT Bearer tokens.

## Base Configuration

The API is configured in `src/config/env.ts`:

```typescript
VITE_API_URL=http://localhost:8000  // Default backend URL
```

## Authentication & Security

### Security Features

All API requests use the following security mechanisms:

1. **JWT Bearer Token Authentication**
   - Access tokens stored in localStorage (`auth_access_token`)
   - Refresh tokens stored in localStorage (`auth_refresh_token`)
   - Automatic token refresh on 401 Unauthorized responses

2. **Request Headers**
   ```
   Authorization: Bearer {access_token}
   Content-Type: application/json
   ```

3. **Rate Limiting**
   - Handles 429 Too Many Requests
   - Respects `retry-after` header
   - Default 5-second retry delay

4. **Error Handling**
   - Automatic retry with exponential backoff
   - Request queuing during token refresh
   - Comprehensive error logging

### Authentication Endpoints

#### Login
```
POST /api/auth/token/
```

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access": "eyJ...",
  "refresh": "eyJ...",
  "user": {
    "id": 1,
    "username": "user@example.com",
    "email": "user@example.com"
  }
}
```

**Implementation:** `src/services/authService.ts:69-90`

#### Refresh Token
```
POST /api/auth/token/refresh/
```

**Request:**
```json
{
  "refresh": "eyJ..."
}
```

**Response:**
```json
{
  "access": "eyJ..."
}
```

**Implementation:** `src/services/authService.ts:136-159`

---

## Game Creation APIs

### 1. Create New Game from Prompt

Create a brand new game from a text prompt without study materials.

```
POST /api/games/create-new-game
```

**Request:**
```typescript
{
  title: string;           // Game title
  prompt: string;          // Description/prompt for game generation
  gameType?: string;       // 'plane' | 'fishing' | 'circuit' | 'quiz'
  category: string;        // Game category (e.g., "Math", "Science")
  difficulty: string;      // 'Easy' | 'Medium' | 'Hard'
}
```

**Response:**
```json
{
  "game_id": "123",
  "title": "Math Adventure",
  "status": "created",
  "message": "Game created successfully"
}
```

**Validation:**
- Title: Required, 3-100 characters
- Prompt: Required, 10-1000 characters
- Category: Required
- Difficulty: Must be 'Easy', 'Medium', or 'Hard'

**Implementation:** `src/services/gameService.ts:101-128`

**Error Handling:**
- 400: Validation error
- 401: Authentication required
- 500: Server error

---

### 2. Upload Study Material

Upload a study material file (PDF, DOC, DOCX, TXT, MD) for RAG processing.

```
POST /api/study-materials/upload
```

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file` (File)

**Response:**
```json
{
  "file_id": "abc123",
  "filename": "study-notes.pdf",
  "size": 1024000,
  "uploaded_at": "2025-10-27T12:00:00Z"
}
```

**File Constraints:**
- Max size: 10MB (configurable via `VITE_MAX_FILE_SIZE`)
- Allowed types:
  - `application/pdf` (.pdf)
  - `text/plain` (.txt)
  - `application/msword` (.doc)
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (.docx)
  - `text/markdown` (.md)

**Implementation:** `src/services/gameService.ts:139-162`

**Progress Tracking:**
```typescript
uploadStudyMaterial(file, {
  onProgress: (progress) => {
    console.log(`Upload: ${progress}%`);
  }
});
```

**Validation:** `src/services/gameService.ts:438-455`

**Error Handling:**
- 400: File too large or invalid type
- 401: Authentication required
- 413: Payload too large
- 500: Upload failed

---

### 3. Generate Questions from Study Material

Generate questions using RAG (Retrieval-Augmented Generation) from uploaded study material.

```
POST /api/games/generate-questions
```

**Request:**
```typescript
{
  templateId: number;       // Game template ID (1=plane, 2=fishing, 3=circuit)
  fileId: string;           // File ID from upload endpoint
  gameType: string;         // 'plane' | 'fishing' | 'circuit'
  questionsCount: number;   // Number of questions to generate (1-50)
  difficulty: string;       // 'Easy' | 'Medium' | 'Hard'
}
```

**Response:**
```json
{
  "game_id": "456",
  "status": "processing",
  "message": "Question generation started",
  "estimated_time": "2-5 minutes"
}
```

**Validation:**
- Template ID: Required, must exist
- File ID: Required, must be valid uploaded file
- Questions count: 1-50
- Game type: Must be 'plane', 'fishing', or 'circuit'
- Difficulty: Must be 'Easy', 'Medium', or 'Hard'

**Implementation:** `src/services/gameService.ts:164-190`

**Validation:** `src/services/gameService.ts:420-433`

**Error Handling:**
- 400: Invalid parameters
- 401: Authentication required
- 404: Template or file not found
- 500: Generation failed

---

### 4. Check Question Generation Status

Poll the status of ongoing question generation.

```
GET /api/games/generate-questions/{gameId}/status
```

**Response:**
```json
{
  "status": "processing" | "completed" | "failed",
  "progress": 75,
  "questions_generated": 8,
  "total_questions": 10,
  "message": "Processing document...",
  "error": null
}
```

**Status Values:**
- `processing`: Generation in progress
- `completed`: Generation finished successfully
- `failed`: Generation failed (see `error` field)

**Implementation:** `src/services/gameService.ts:197-212`

**Polling Mechanism:**
The client automatically polls this endpoint every 2 seconds for up to 60 attempts (2 minutes).

```typescript
// Implementation in gameService.ts:218-253
const pollStatus = async (gameId: string) => {
  const maxAttempts = 60;
  const pollInterval = 2000; // 2 seconds

  for (let i = 0; i < maxAttempts; i++) {
    const status = await checkGenerationStatus(gameId);

    if (status.status === 'completed') {
      return status;
    }

    if (status.status === 'failed') {
      throw new Error(status.error);
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Generation timeout');
};
```

**Error Handling:**
- 401: Authentication required
- 404: Game not found
- 500: Server error

---

## Security Implementation Details

### API Client (`src/services/api/client.ts`)

#### Automatic Token Refresh
```typescript
// Lines 76-107
- Intercepts 401 responses
- Automatically refreshes access token
- Queues requests during refresh
- Retries failed requests with new token
```

#### Rate Limiting
```typescript
// Lines 109-118
- Detects 429 responses
- Reads retry-after header
- Delays retry by specified time
- Default 5-second delay if no header
```

#### Request Resilience
```typescript
// Lines 120-129
- Handles 503 Service Unavailable
- Exponential backoff: 1s, 2s, 4s
- Max 3 retry attempts
- Request ID tracking
```

#### Protected Routes
All pages requiring authentication are wrapped with `ProtectedRoute` component:

```typescript
// src/components/ProtectedRoute.tsx:17-24
- Checks for valid access token
- Redirects to /login if not authenticated
- Preserves intended destination
```

### Token Storage
```typescript
// localStorage keys
auth_access_token   // JWT access token
auth_refresh_token  // JWT refresh token
```

**Security Note:** Tokens are stored in localStorage for persistence across sessions. In production, consider additional security measures such as:
- HTTP-only cookies for tokens
- Short-lived access tokens (15 minutes)
- Refresh token rotation
- CSRF protection

---

## Example Usage

### Complete Flow: Upload Material and Generate Questions

```typescript
import { uploadStudyMaterial, generateQuestions, checkGenerationStatus } from '@/services/gameService';

async function createGameFromMaterial(file: File) {
  try {
    // Step 1: Upload study material
    const uploadResult = await uploadStudyMaterial(file, {
      onProgress: (progress) => {
        console.log(`Upload progress: ${progress}%`);
      }
    });

    console.log('File uploaded:', uploadResult.file_id);

    // Step 2: Generate questions
    const generateResult = await generateQuestions({
      templateId: 1,           // Sky Pilot Adventure
      fileId: uploadResult.file_id,
      gameType: 'plane',
      questionsCount: 10,
      difficulty: 'Medium'
    });

    console.log('Generation started:', generateResult.game_id);

    // Step 3: Poll for completion
    const maxAttempts = 60;
    for (let i = 0; i < maxAttempts; i++) {
      const status = await checkGenerationStatus(generateResult.game_id);

      console.log(`Progress: ${status.progress}% - ${status.message}`);

      if (status.status === 'completed') {
        console.log('Questions generated successfully!');
        return status;
      }

      if (status.status === 'failed') {
        throw new Error(status.error);
      }

      // Wait 2 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Generation timeout after 2 minutes');

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

---

## Environment Configuration

### Required Variables
```bash
# .env file
VITE_API_URL=http://localhost:8000
```

### Optional Variables
```bash
VITE_API_TIMEOUT=30000           # Request timeout (ms)
VITE_MAX_FILE_SIZE=10485760      # Max upload size (bytes)
VITE_DEBUG_MODE=true             # Enable debug logging
VITE_ENABLE_GAME_CREATION=true   # Enable/disable game creation UI
```

---

## API Response Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 400 | Bad Request | Check request validation |
| 401 | Unauthorized | Login or refresh token |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Verify resource exists |
| 413 | Payload Too Large | Reduce file size |
| 429 | Too Many Requests | Wait and retry |
| 500 | Internal Server Error | Report to backend team |
| 503 | Service Unavailable | Retry with backoff |

---

## Security Best Practices

1. **Never expose tokens in logs or error messages**
2. **Use HTTPS in production** (set `VITE_API_URL=https://...`)
3. **Implement token refresh before expiry**
4. **Clear tokens on logout**
5. **Validate file types on both client and server**
6. **Implement rate limiting on sensitive endpoints**
7. **Use secure token storage** (consider HTTP-only cookies)
8. **Enable CORS only for trusted domains**
9. **Implement CSRF protection for state-changing operations**
10. **Log security events** (failed logins, token refresh, etc.)

---

## Troubleshooting

### Common Issues

**401 Unauthorized**
- Token expired: Refresh token automatically handled
- Invalid token: Re-login required
- Missing token: User not authenticated

**File Upload Fails**
- Check file size < 10MB
- Verify file type is supported
- Check network connectivity

**Question Generation Timeout**
- Large files may take longer
- Check backend processing status
- Increase timeout in polling logic

**CORS Errors**
- Verify `VITE_API_URL` is correct
- Check backend CORS configuration
- Ensure credentials are included in requests

---

## File Locations

- **API Client**: `src/services/api/client.ts`
- **Game Service**: `src/services/gameService.ts`
- **Auth Service**: `src/services/authService.ts`
- **Environment Config**: `src/config/env.ts`
- **Protected Route**: `src/components/ProtectedRoute.tsx`

---

## Support

For issues or questions:
1. Check browser console for detailed error messages
2. Verify environment configuration
3. Check network tab for API request/response details
4. Review backend logs for server-side errors
