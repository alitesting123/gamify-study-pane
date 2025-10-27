# How to Apply Backend Changes

## Quick Instructions

The backend changes are in the `backend-changes.patch` file. Apply them with:

```bash
cd /path/to/your/game-learn-backend

# Make sure you're on main branch at commit b7b5a57
git log --oneline -1
# Should show: b7b5a57 Merge pull request #5...

# Apply the patch
git apply /path/to/gamify-study-pane/backend-changes.patch

# Or if you downloaded the patch file:
# git apply backend-changes.patch

# Verify the changes
git status

# You should see all the new files and modifications
```

## What the Patch Contains

**13 files changed, 1076 insertions:**

### New Files:
- `apps/study_materials/__init__.py` - New Django app
- `apps/study_materials/models.py` - StudyMaterial model
- `apps/study_materials/serializers.py` - Upload serializers
- `apps/study_materials/utils.py` - Text extraction utilities
- `apps/study_materials/api/__init__.py`
- `apps/study_materials/api/views.py` - Upload endpoints
- `apps/study_materials/api/urls.py` - URL routing
- `apps/ai_engine/question_generator.py` - RAG question generator
- `apps/games/api/views_extensions.py` - Question generation endpoints

### Modified Files:
- `apps/games/models.py` - Added progress tracking fields
- `apps/games/api/urls.py` - Added new routes
- `config/settings.py` - Added study_materials app
- `config/urls.py` - Added study materials routes

## After Applying the Patch

1. **Stage and commit the changes:**
   ```bash
   git add .
   git commit -m "Implement document upload and RAG question generation

   - Add study materials app with file upload endpoint
   - Add RAG-based question generator using OpenAI GPT-4
   - Add question generation and status polling endpoints
   - Update UserGame model with progress tracking

   New endpoints:
   - POST /api/study-materials/upload
   - POST /api/games/generate-questions
   - GET /api/games/generate-questions/{gameId}/status"
   ```

2. **Push to GitHub:**
   ```bash
   git push origin main
   ```

3. **Create and run migrations:**
   ```bash
   python manage.py makemigrations study_materials
   python manage.py makemigrations games
   python manage.py migrate
   ```

4. **Verify your .env has OpenAI key:**
   ```bash
   echo "OPENAI_API_KEY=sk-..." >> .env
   ```

5. **Start the backend:**
   ```bash
   python manage.py runserver
   ```

## Testing the Integration

Once both frontend and backend are running:

1. Open frontend: http://localhost:5173
2. Login/Register
3. Click "Start Playing" button
4. Upload a PDF/DOC file
5. Generate questions
6. Watch progress (0-100%)
7. Play the game!

See `INTEGRATION_COMPLETE.md` for detailed testing instructions.

## Troubleshooting

**If `git apply` fails:**
```bash
# Try with 3-way merge
git apply --3way backend-changes.patch

# Or check what would be applied
git apply --check backend-changes.patch
```

**If there are conflicts:**
The patch was created from commit `b7b5a57`, so it should apply cleanly to your main branch at that commit. If you have local modifications, stash them first:
```bash
git stash
git apply backend-changes.patch
git stash pop
```
