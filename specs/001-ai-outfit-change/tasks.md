# Tasks: AI-Powered Virtual Outfit Change

**Input**: Design documents from `/specs/001-ai-outfit-change/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: NOT included (not explicitly requested in feature specification)

**Storage Strategy**: For MVP (US1, US2, US3), use local file storage instead of 阿里云 OSS to accelerate development. OSS integration can be added later in US5 or polish phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Backend**: `server/src/`
- **Frontend**: `client/src/`
- **Database**: `server/prisma/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [x] T001 Install backend dependencies: `@google/generative-ai`, `bull`, `@nestjs/bull`, `sharp`, `file-type`, `multer`, `@nestjs/platform-express` in server/package.json
- [x] T002 [P] Install frontend dependencies (if needed) in client/package.json
- [x] T003 [P] Configure environment variables in server/.env: GEMINI_API_KEY, REDIS_HOST, REDIS_PORT, UPLOAD_DIR (for local storage)
- [x] T004 [P] Add example environment variables to server/.env.example
- [x] T005 [P] Create uploads directory structure: server/uploads/models/, server/uploads/clothing/, server/uploads/results/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create Prisma schema: Add ModelPhoto, ClothingItem, OutfitResult, ProcessingSession models to server/prisma/schema.prisma (update imageUrl to store local file paths)
- [ ] T007 Generate Prisma migration: Run `npx prisma migrate dev --name add_outfit_change_tables` in server/
- [ ] T008 Generate Prisma Client: Run `npx prisma generate` in server/
- [ ] T009 [P] Create outfit-change module: Generate with `nest g module outfit-change` in server/src/modules/
- [ ] T010 [P] Create outfit-change controller: Generate with `nest g controller outfit-change` in server/src/modules/outfit-change/
- [ ] T011 [P] Create outfit-change service: Generate with `nest g service outfit-change` in server/src/modules/outfit-change/
- [ ] T012 [P] Create storage service: Generate with `nest g service outfit-change/storage` in server/src/modules/outfit-change/
- [ ] T013 [P] Create gemini service: Generate with `nest g service outfit-change/gemini` in server/src/modules/outfit-change/
- [ ] T014 Implement StorageService with local file system storage (save files to server/uploads/) in server/src/modules/outfit-change/storage.service.ts
- [ ] T015 Add saveFile() method to StorageService for saving uploaded files locally in server/src/modules/outfit-change/storage.service.ts
- [ ] T016 Add getFileUrl() method to StorageService to generate local file URLs (e.g., /uploads/models/xxx.jpg) in server/src/modules/outfit-change/storage.service.ts
- [ ] T017 Add deleteFile() method to StorageService for local file deletion in server/src/modules/outfit-change/storage.service.ts
- [ ] T018 Configure static file serving for /uploads directory in server/src/main.ts
- [ ] T019 Implement GeminiService with Google Generative AI client initialization in server/src/modules/outfit-change/gemini.service.ts
- [ ] T020 Configure Bull queue module: Create queue module in server/src/modules/outfit-change/queue.module.ts
- [ ] T021 Create Bull queue processor for outfit processing in server/src/modules/outfit-change/outfit.processor.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Upload Model Photo (Priority: P1) 🎯 MVP

**Goal**: Enable authenticated users to upload a model photo that displays in the center area of the home page

**Independent Test**: Log in, navigate to home page, upload a model photo, verify it displays in the center area

**Storage**: Uses local file system (server/uploads/models/)

### Implementation for User Story 1

- [ ] T022 [P] [US1] Create upload-model.dto.ts with UploadModelDto in server/src/modules/outfit-change/dto/
- [ ] T023 [US1] Implement POST /models/upload endpoint with Multer file interceptor in server/src/modules/outfit-change/outfit-change.controller.ts
- [ ] T024 [US1] Implement uploadModelPhoto() method to save file locally and create ModelPhoto record in server/src/modules/outfit-change/outfit-change.service.ts
- [ ] T025 [US1] Implement GET /models endpoint to list user's model photos in server/src/modules/outfit-change/outfit-change.controller.ts
- [ ] T026 [US1] Implement getModelPhotos() method to return list with local file URLs in server/src/modules/outfit-change/outfit-change.service.ts
- [ ] T027 [US1] Add file validation: check MIME type, file size (<10MB), and magic number in server/src/modules/outfit-change/outfit-change.service.ts
- [ ] T028 [P] [US1] Create ModelUpload component with drag-and-drop area in client/src/components/OutfitChange/ModelUpload.tsx
- [ ] T029 [P] [US1] Create outfit-change API client with uploadModel() function (FormData upload) in client/src/api/outfit-change.ts
- [ ] T030 [P] [US1] Create useImageUpload custom hook in client/src/hooks/useImageUpload.ts
- [ ] T031 [US1] Update Home page to include ModelUpload component in center area in client/src/pages/Home.tsx
- [ ] T032 [US1] Implement client-side file validation (type, size) in client/src/utils/image-validation.ts
- [ ] T033 [US1] Add loading spinner during model photo upload in client/src/components/OutfitChange/ModelUpload.tsx
- [ ] T034 [US1] Display uploaded model photo in center area after upload completes in client/src/components/OutfitChange/ModelUpload.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - users can upload and view model photos

---

## Phase 4: User Story 2 - Upload Clothing Images (Priority: P2)

**Goal**: Enable users to upload multiple clothing items to build their wardrobe collection in the right sidebar

**Independent Test**: With a model photo uploaded, use the right sidebar to upload multiple clothing images, verify they appear as selectable thumbnails

**Storage**: Uses local file system (server/uploads/clothing/)

### Implementation for User Story 2

- [ ] T035 [P] [US2] Create upload-clothing.dto.ts with UploadClothingDto in server/src/modules/outfit-change/dto/
- [ ] T036 [US2] Implement POST /clothing/upload endpoint with Multer file interceptor in server/src/modules/outfit-change/outfit-change.controller.ts
- [ ] T037 [US2] Implement uploadClothingItem() method to save file locally and create ClothingItem record in server/src/modules/outfit-change/outfit-change.service.ts
- [ ] T038 [US2] Implement GET /clothing endpoint to list user's clothing items in server/src/modules/outfit-change/outfit-change.controller.ts
- [ ] T039 [US2] Implement getClothingItems() method to return list with local file URLs in server/src/modules/outfit-change/outfit-change.service.ts
- [ ] T040 [P] [US2] Create ClothingUpload component with upload button in client/src/components/OutfitChange/ClothingUpload.tsx
- [ ] T041 [P] [US2] Create ClothingGallery component to display clothing thumbnails in client/src/components/OutfitChange/ClothingGallery.tsx
- [ ] T042 [US2] Add uploadClothing() function to outfit-change API client (FormData upload) in client/src/api/outfit-change.ts
- [ ] T043 [US2] Update Home page to include ClothingUpload and ClothingGallery in right sidebar in client/src/pages/Home.tsx
- [ ] T044 [US2] Add loading spinner during clothing uploads in client/src/components/OutfitChange/ClothingUpload.tsx
- [ ] T045 [US2] Fetch and display user's saved clothing items on page load in client/src/components/OutfitChange/ClothingGallery.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can upload models and build clothing collections

---

## Phase 5: User Story 3 - Perform AI Outfit Change (Priority: P1)

**Goal**: Enable users to click a clothing item to trigger AI-powered outfit change with loading state and interaction blocking

**Independent Test**: With model photo and clothing uploaded, click a clothing item, verify loading indicator appears, interactions are disabled, and result displays after processing

**Storage**: Result images saved to local file system (server/uploads/results/)

### Implementation for User Story 3

- [ ] T046 [P] [US3] Create process-outfit.dto.ts with ProcessOutfitDto in server/src/modules/outfit-change/dto/
- [ ] T047 [US3] Implement POST /process endpoint in server/src/modules/outfit-change/outfit-change.controller.ts
- [ ] T048 [US3] Implement processOutfit() method to create ProcessingSession and queue job in server/src/modules/outfit-change/outfit-change.service.ts
- [ ] T049 [US3] Implement GET /sessions/:id endpoint to check processing status in server/src/modules/outfit-change/outfit-change.controller.ts
- [ ] T050 [US3] Implement getSessionStatus() method in server/src/modules/outfit-change/outfit-change.service.ts
- [ ] T051 [US3] Implement Bull queue processor handleOutfitChange() in server/src/modules/outfit-change/outfit.processor.ts
- [ ] T052 [US3] Add Gemini API call logic with multimodal prompt (model + clothing images) in server/src/modules/outfit-change/gemini.service.ts
- [ ] T053 [US3] Load local image files from server/uploads/ in queue processor in server/src/modules/outfit-change/outfit.processor.ts
- [ ] T054 [US3] Save AI-generated result image to server/uploads/results/ in queue processor in server/src/modules/outfit-change/outfit.processor.ts
- [ ] T055 [US3] Save OutfitResult to database with local file path after successful processing in server/src/modules/outfit-change/outfit.processor.ts
- [ ] T056 [US3] Update ProcessingSession status transitions (pending → processing → completed/failed) in server/src/modules/outfit-change/outfit.processor.ts
- [ ] T057 [US3] Add retry logic with exponential backoff (max 3 attempts) in server/src/modules/outfit-change/outfit.processor.ts
- [ ] T058 [P] [US3] Create LoadingOverlay component with spinner in client/src/components/OutfitChange/LoadingOverlay.tsx
- [ ] T059 [P] [US3] Create ResultDisplay component to show AI-generated result in client/src/components/OutfitChange/ResultDisplay.tsx
- [ ] T060 [P] [US3] Create useOutfitProcessing custom hook with polling logic in client/src/hooks/useOutfitProcessing.ts
- [ ] T061 [US3] Add processOutfit() and getSessionStatus() to API client in client/src/api/outfit-change.ts
- [ ] T062 [US3] Add click handler to ClothingGallery items to trigger processing in client/src/components/OutfitChange/ClothingGallery.tsx
- [ ] T063 [US3] Implement polling mechanism (every 2 seconds) for session status in client/src/hooks/useOutfitProcessing.ts
- [ ] T064 [US3] Show LoadingOverlay when processing starts in client/src/pages/Home.tsx
- [ ] T065 [US3] Disable all interactions (uploads, clicks) during processing in client/src/pages/Home.tsx
- [ ] T066 [US3] Display result in ResultDisplay component when processing completes in client/src/pages/Home.tsx
- [ ] T067 [US3] Re-enable interactions after processing completes or fails in client/src/pages/Home.tsx
- [ ] T068 [US3] Add error handling and user-friendly error messages in client/src/hooks/useOutfitProcessing.ts

**Checkpoint**: At this point, User Story 3 should be fully functional - core AI outfit change feature works end-to-end

---

## Phase 6: User Story 4 - Try Different Outfits (Priority: P2)

**Goal**: Enable users to sequentially try multiple clothing items on the same model to compare options

**Independent Test**: After completing one outfit change, click a different clothing item, verify new processing cycle begins and most recent result displays

### Implementation for User Story 4

- [ ] T074 [US4] Update processOutfit() to allow sequential processing requests in server/src/modules/outfit-change/outfit-change.service.ts
- [ ] T075 [US4] Implement GET /results endpoint to list user's outfit results in server/src/modules/outfit-change/outfit-change.controller.ts
- [ ] T076 [US4] Implement getOutfitResults() method in server/src/modules/outfit-change/outfit-change.service.ts
- [ ] T077 [US4] Add GET /results/:id endpoint to fetch specific result with signed URL in server/src/modules/outfit-change/outfit-change.controller.ts
- [ ] T078 [US4] Implement getOutfitResult() method in server/src/modules/outfit-change/outfit-change.service.ts
- [ ] T079 [US4] Update useOutfitProcessing hook to handle multiple sequential requests in client/src/hooks/useOutfitProcessing.ts
- [ ] T080 [US4] Ensure most recent result always displays in center area in client/src/pages/Home.tsx
- [ ] T081 [US4] Add visual feedback for currently selected/processing clothing item in client/src/components/OutfitChange/ClothingGallery.tsx

**Checkpoint**: At this point, User Story 4 should work - users can try multiple outfits sequentially

---

## Phase 7: User Story 5 - Manage Saved Images (Priority: P3)

**Goal**: Enable users to view saved images across sessions and delete items they no longer need

**Independent Test**: Upload images, log out, log back in, verify images persist, test deletion functionality

### Implementation for User Story 5

- [ ] T082 [US5] Implement DELETE /models/:id endpoint in server/src/modules/outfit-change/outfit-change.controller.ts
- [ ] T083 [US5] Implement deleteModelPhoto() method with soft delete (set deletedAt) in server/src/modules/outfit-change/outfit-change.service.ts
- [ ] T084 [US5] Implement DELETE /clothing/:id endpoint in server/src/modules/outfit-change/outfit-change.controller.ts
- [ ] T085 [US5] Implement deleteClothingItem() method with soft delete in server/src/modules/outfit-change/outfit-change.service.ts
- [ ] T086 [US5] Implement DELETE /results/:id endpoint in server/src/modules/outfit-change/outfit-change.controller.ts
- [ ] T087 [US5] Implement deleteOutfitResult() method with soft delete in server/src/modules/outfit-change/outfit-change.service.ts
- [ ] T088 [US5] Add OSS file deletion in delete methods (call StorageService.deleteFile()) in server/src/modules/outfit-change/outfit-change.service.ts
- [ ] T089 [P] [US5] Create ImageManager component with delete buttons in client/src/components/OutfitChange/ImageManager.tsx
- [ ] T090 [US5] Add deleteModel(), deleteClothing(), deleteResult() to API client in client/src/api/outfit-change.ts
- [ ] T091 [US5] Add delete button to ModelUpload component in client/src/components/OutfitChange/ModelUpload.tsx
- [ ] T092 [US5] Add delete buttons to ClothingGallery thumbnails in client/src/components/OutfitChange/ClothingGallery.tsx
- [ ] T093 [US5] Implement useImageManager custom hook for deletion logic in client/src/hooks/useImageManager.ts
- [ ] T094 [US5] Add confirmation dialog before deletion in client/src/components/OutfitChange/ImageManager.tsx
- [ ] T095 [US5] Refresh image lists after successful deletion in client/src/hooks/useImageManager.ts
- [ ] T096 [US5] Verify saved images load on login in client/src/pages/Home.tsx

**Checkpoint**: All user stories should now be independently functional - complete feature set implemented

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T097 [P] Add rate limiting to all endpoints using @nestjs/throttler in server/src/modules/outfit-change/outfit-change.controller.ts
- [ ] T098 [P] Add comprehensive error handling for Gemini API failures in server/src/modules/outfit-change/gemini.service.ts
- [ ] T099 [P] Add comprehensive error handling for OSS failures in server/src/modules/outfit-change/storage.service.ts
- [ ] T100 [P] Add image optimization with sharp library (resize, quality adjustment) in server/src/modules/outfit-change/outfit.processor.ts
- [ ] T101 [P] Add logging for all outfit processing operations in server/src/modules/outfit-change/outfit.processor.ts
- [ ] T102 [P] Add TypeScript type definitions in client/src/types/outfit-change.ts
- [ ] T103 [P] Add responsive design for mobile in client/src/pages/Home.tsx and all OutfitChange components
- [ ] T104 [P] Optimize image loading with lazy loading and thumbnails in client/src/components/OutfitChange/
- [ ] T105 Add navigation to OutfitChange page from Home page in client/src/App.tsx
- [ ] T106 Update CLAUDE.md with implementation completion notes
- [ ] T107 Run quickstart.md validation: Test complete user flow from upload to AI processing

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order: US1(P1) → US3(P1) → US2(P2) → US4(P2) → US5(P3)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent from US1 but logically follows
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Requires US1 and US2 for full user flow but can be developed independently
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Builds on US3 but independently testable
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Independent enhancement

### Within Each User Story

- DTOs before endpoints
- Service methods before controller endpoints
- Backend endpoints before frontend API client
- API client before components
- Components before page integration
- Core implementation before error handling

### Parallel Opportunities

#### Phase 1 (Setup)
```bash
# All setup tasks can run in parallel:
T002 (frontend deps) || T003 (env vars) || T004 (.env.example)
```

#### Phase 2 (Foundational)
```bash
# After Prisma setup (T005-T007), all service creation can run in parallel:
T008 (module) || T009 (controller) || T010 (service) || T011 (storage service) || T012 (gemini service)
```

#### Phase 3 (User Story 1)
```bash
# DTOs in parallel:
T021 (upload-model.dto) || T022 (confirm-upload-model.dto)

# Frontend components in parallel:
T030 (ModelUpload component) || T031 (API client) || T032 (useImageUpload hook)
```

#### Phase 4 (User Story 2)
```bash
# DTOs in parallel:
T037 (upload-clothing.dto) || T038 (confirm-upload-clothing.dto)

# Frontend components in parallel:
T045 (ClothingUpload) || T046 (ClothingGallery)
```

#### Phase 5 (User Story 3)
```bash
# Frontend components in parallel:
T063 (LoadingOverlay) || T064 (ResultDisplay) || T065 (useOutfitProcessing hook)
```

#### Phase 7 (User Story 5)
```bash
# All deletion endpoints in parallel:
T082 (DELETE models) || T084 (DELETE clothing) || T086 (DELETE results)
```

#### Phase 8 (Polish)
```bash
# Most polish tasks can run in parallel:
T097 (rate limiting) || T098 (Gemini errors) || T099 (OSS errors) || T100 (optimization) || T101 (logging) || T102 (types) || T103 (responsive) || T104 (lazy loading)
```

---

## Parallel Example: User Story 1

```bash
# Step 1: Create DTOs in parallel
Task: "Create upload-model.dto.ts with RequestUploadUrlDto in server/src/modules/outfit-change/dto/"
Task: "Create confirm-upload-model.dto.ts with ConfirmModelUploadDto in server/src/modules/outfit-change/dto/"

# Step 2: After backend endpoints complete, create frontend components in parallel
Task: "Create ModelUpload component with drag-and-drop area in client/src/components/OutfitChange/ModelUpload.tsx"
Task: "Create outfit-change API client with uploadModel() function in client/src/api/outfit-change.ts"
Task: "Create useImageUpload custom hook in client/src/hooks/useImageUpload.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Upload Model Photo)
4. Complete Phase 5: User Story 3 (AI Outfit Change)
5. **STOP and VALIDATE**: Test core flow - upload model, upload one clothing item, perform AI outfit change
6. Deploy/demo if ready - this is the minimum viable product!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Users can upload models
3. Add User Story 3 → Test independently → Core AI outfit change works (MVP!)
4. Add User Story 2 → Test independently → Users can build clothing collections
5. Add User Story 4 → Test independently → Sequential outfit trying
6. Add User Story 5 → Test independently → Image management
7. Add Polish → Final production-ready version

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Upload Model)
   - Developer B: User Story 2 (Upload Clothing)
   - Developer C: User Story 3 (AI Processing) - depends on A & B for integration
3. Developer A moves to User Story 5 after completing US1
4. Developer B moves to User Story 4 after completing US2
5. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All API endpoints require JWT authentication (handled by existing auth module)
- All database queries must filter by userId for security
- Use soft deletes (deletedAt) for user-facing data
- Gemini API key must be kept secure in environment variables
- **Local storage for MVP**: Images stored in server/uploads/ directory (阿里云 OSS integration deferred to later phase)

---

## Total Task Count

- **Setup**: 5 tasks
- **Foundational**: 16 tasks
- **User Story 1**: 13 tasks
- **User Story 2**: 11 tasks
- **User Story 3**: 23 tasks
- **User Story 4**: 8 tasks
- **User Story 5**: 15 tasks
- **Polish**: 11 tasks
- **TOTAL**: 102 tasks

## Parallel Opportunities Identified

- Phase 1: 4 parallel tasks
- Phase 2: 5 parallel tasks
- Phase 3 (US1): 5 parallel tasks
- Phase 4 (US2): 4 parallel tasks
- Phase 5 (US3): 4 parallel tasks
- Phase 7 (US5): 3 parallel tasks
- Phase 8: 8 parallel tasks
- **TOTAL**: 33 parallelizable tasks

## Independent Test Criteria

- **US1**: Upload model photo → displays in center area
- **US2**: Upload clothing items → appear as thumbnails in sidebar
- **US3**: Click clothing → loading indicator → AI result displays
- **US4**: Click different clothing → new result replaces previous
- **US5**: Images persist across sessions, can be deleted

## Suggested MVP Scope

**Minimum Viable Product** = Setup + Foundational + User Story 1 + User Story 2 + User Story 3
- Users can upload a model photo (US1: 13 tasks)
- Users can upload clothing items (US2: 11 tasks)
- Users can perform AI outfit change and see the result (US3: 23 tasks)
- Uses local file storage for rapid development
- Total: ~68 tasks (Setup 5 + Foundational 16 + US1 13 + US2 11 + US3 23)
- This delivers the complete core value proposition without cloud storage complexity
- 阿里云 OSS integration can be added later in US5 or polish phase
