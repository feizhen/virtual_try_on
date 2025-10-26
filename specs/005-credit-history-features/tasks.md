# Tasks: Credit System and History Enhancements

**Input**: Design documents from `/specs/005-credit-history-features/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests tasks are included per feature specification requirements

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `server/src/` (backend), `client/src/` (frontend)
- Following existing project structure with NestJS + React

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [ ] T001 Install SWR library in client: `cd client && pnpm add swr@^2.2.5`
- [ ] T002 [P] Create database migration script file: `server/scripts/init-user-credits.sql`
- [ ] T003 [P] Create Prisma migration: Add CreditTransaction model and extend User, OutfitResult, ProcessingSession, ModelPhoto in `server/prisma/schema.prisma`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Execute Prisma migration: Run `npx prisma migrate dev --name add-credit-system` in server directory
- [ ] T005 Generate Prisma Client types: Run `npx prisma generate` in server directory
- [ ] T006 Execute initial credit data script: Run `npx prisma db execute --file ./scripts/init-user-credits.sql` in server directory
- [ ] T007 [P] Create Credit module structure: `server/src/credit/credit.module.ts`
- [ ] T008 [P] Create Credit DTOs directory and base files: `server/src/credit/dto/credit-balance.dto.ts` and `credit-transaction.dto.ts`
- [ ] T009 [P] Create Credit entity file: `server/src/credit/entities/credit-transaction.entity.ts`
- [ ] T010 [P] Create Credit API client file: `client/src/api/credit.ts`
- [ ] T011 [P] Create Credit TypeScript types file: `client/src/api/types.ts` (extend existing)
- [ ] T012 [P] Configure SWR global config in `client/src/App.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Credit System Foundation (Priority: P1) 🎯 MVP

**Goal**: 实现完整的 Credit 系统，包括余额管理、扣除、退还和交易记录

**Independent Test**: 注册新用户 → 检查初始 100 credits → 执行虚拟试衣 → 验证扣除 10 credits → 模拟失败 → 验证退还 10 credits

### Implementation for User Story 1

**Backend - Credit Service**

- [ ] T013 [P] [US1] Implement CreditService.deductCredit() with Prisma transaction in `server/src/credit/credit.service.ts`
- [ ] T014 [P] [US1] Implement CreditService.refundCredit() with transaction logging in `server/src/credit/credit.service.ts`
- [ ] T015 [P] [US1] Implement CreditService.getBalance() in `server/src/credit/credit.service.ts`
- [ ] T016 [P] [US1] Implement CreditService.getTransactions() with cursor pagination in `server/src/credit/credit.service.ts`
- [ ] T017 [P] [US1] Create InsufficientCreditException in `server/src/credit/exceptions/insufficient-credit.exception.ts`

**Backend - Credit Controller & API**

- [ ] T018 [US1] Implement GET /api/credit/balance endpoint in `server/src/credit/credit.controller.ts`
- [ ] T019 [US1] Implement GET /api/credit/transactions endpoint with pagination in `server/src/credit/credit.controller.ts`
- [ ] T020 [US1] Register CreditModule in AppModule: `server/src/app.module.ts`

**Backend - Integration with Try-On Flow**

- [ ] T021 [US1] Update OutfitChangeService.processTryOn() to deduct credit before processing in `server/src/outfit-change/outfit-change.service.ts`
- [ ] T022 [US1] Implement OutfitChangeService.handleProcessingFailure() to refund credit in `server/src/outfit-change/outfit-change.service.ts`
- [ ] T023 [US1] Add credit transaction IDs to ProcessingSession creation in `server/src/outfit-change/outfit-change.service.ts`

**Backend - User Registration**

- [ ] T024 [US1] Update UsersService.register() to initialize new users with 100 credits in `server/src/users/users.service.ts`

**Frontend - Credit Context**

- [ ] T025 [P] [US1] Create CreditContext with SWR integration in `client/src/contexts/CreditContext.tsx`
- [ ] T026 [US1] Wrap App with CreditProvider in `client/src/App.tsx`

**Frontend - Credit Display Components**

- [ ] T027 [P] [US1] Create CreditBadge component in `client/src/components/Credit/CreditBadge.tsx`
- [ ] T028 [P] [US1] Create CreditHistory component for transaction list in `client/src/components/Credit/CreditHistory.tsx`
- [ ] T029 [US1] Add CreditBadge to navigation/header in `client/src/components/Layout.tsx` or equivalent

**Frontend - Try-On Integration**

- [ ] T030 [US1] Update TryOnButton to check credit balance before request in `client/src/components/VirtualTryOn/TryOnButton.tsx`
- [ ] T031 [US1] Add optimistic credit deduction on try-on initiation in `client/src/pages/VirtualTryOn.tsx`
- [ ] T032 [US1] Display insufficient credit error message in try-on UI

**Testing for User Story 1**

- [ ] T033 [P] [US1] Unit test for CreditService.deductCredit() transaction logic in `server/test/credit.service.spec.ts`
- [ ] T034 [P] [US1] Unit test for CreditService.refundCredit() in `server/test/credit.service.spec.ts`
- [ ] T035 [P] [US1] E2E test for credit deduction on try-on in `server/test/credit.e2e-spec.ts`
- [ ] T036 [P] [US1] E2E test for credit refund on failure in `server/test/credit.e2e-spec.ts`
- [ ] T037 [P] [US1] Component test for CreditBadge in `client/src/components/Credit/CreditBadge.test.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional - users can see credit balance, credits are deducted on try-on, and refunded on failure

---

## Phase 4: User Story 2 - Try-On History Viewing (Priority: P2)

**Goal**: 用户可以查看完整的虚拟试衣历史记录，包括分页浏览、详情查看和软删除

**Independent Test**: 执行 3 次虚拟试衣 → 访问历史记录页面 → 验证显示 3 条记录（最新在前）→ 点击查看详情 → 删除一条记录 → 验证列表只剩 2 条

### Implementation for User Story 2

**Backend - History Service**

- [ ] T038 [P] [US2] Implement HistoryService.getHistory() with cursor pagination in `server/src/history/history.service.ts` (or extend OutfitChangeService)
- [ ] T039 [P] [US2] Implement HistoryService.getDetail() for single result in `server/src/history/history.service.ts`
- [ ] T040 [P] [US2] Implement HistoryService.softDelete() to mark deletedAt in `server/src/history/history.service.ts`

**Backend - History Controller**

- [ ] T041 [US2] Implement GET /api/history endpoint with cursor pagination in `server/src/outfit-change/outfit-change.controller.ts` (or new history.controller.ts)
- [ ] T042 [US2] Implement GET /api/history/:id endpoint in controller
- [ ] T043 [US2] Implement DELETE /api/history/:id endpoint for soft delete in controller

**Backend - Extend OutfitResult**

- [ ] T044 [US2] Update OutfitResult queries to exclude deletedAt != null in `server/src/outfit-change/outfit-change.service.ts`
- [ ] T045 [US2] Add creditsUsed field to OutfitResult creation logic

**Frontend - History API Client**

- [ ] T046 [P] [US2] Create History API client with SWR hooks in `client/src/api/history.ts`

**Frontend - History Page**

- [ ] T047 [P] [US2] Create History page with SWR infinite loading in `client/src/pages/History.tsx`
- [ ] T048 [P] [US2] Create HistoryList component in `client/src/components/History/HistoryList.tsx`
- [ ] T049 [P] [US2] Create HistoryItem component showing model, clothing, result, status in `client/src/components/History/HistoryItem.tsx`
- [ ] T050 [US2] Add History page route to App router in `client/src/App.tsx`

**Frontend - History Detail Modal**

- [ ] T051 [P] [US2] Create HistoryDetail modal component in `client/src/components/History/HistoryDetail.tsx`
- [ ] T052 [US2] Integrate HistoryDetail modal into HistoryItem click handler

**Frontend - Delete Functionality**

- [ ] T053 [US2] Add delete button to HistoryItem component
- [ ] T054 [US2] Implement delete confirmation dialog using shadcn AlertDialog
- [ ] T055 [US2] Call delete API and refresh SWR cache on successful deletion

**Testing for User Story 2**

- [ ] T056 [P] [US2] Unit test for HistoryService.getHistory() pagination in `server/test/history.service.spec.ts`
- [ ] T057 [P] [US2] E2E test for history listing and pagination in `server/test/history.e2e-spec.ts`
- [ ] T058 [P] [US2] Component test for History page in `client/src/pages/History.test.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can view and manage their try-on history

---

## Phase 5: User Story 3 - Retry Failed Try-Ons (Priority: P3)

**Goal**: 用户可以轻松重试失败的试衣或重新生成成功的结果，无需重新上传图片

**Independent Test**: 触发一次失败的试衣 → 在历史记录中找到该记录 → 点击"重试"按钮 → 验证扣除 credit → 验证创建新的处理会话 → 成功完成后验证历史中有两条记录（原始+重试）

### Implementation for User Story 3

**Backend - Retry Logic**

- [ ] T059 [P] [US3] Extend OutfitResult model to include retryFromId field (already in migration)
- [ ] T060 [P] [US3] Implement OutfitChangeService.retryTryOn() method in `server/src/outfit-change/outfit-change.service.ts`
- [ ] T061 [US3] Add validation in retryTryOn() to check if original images still exist
- [ ] T062 [US3] Add credit balance check before retry in retryTryOn()
- [ ] T063 [US3] Set isRetry=true and retryFromId when creating new OutfitResult

**Backend - Retry Controller**

- [ ] T064 [US3] Implement POST /api/outfit-change/retry/:resultId endpoint in `server/src/outfit-change/outfit-change.controller.ts`

**Frontend - Retry UI**

- [ ] T065 [P] [US3] Add "Retry" button to HistoryItem for failed results in `client/src/components/History/HistoryItem.tsx`
- [ ] T066 [P] [US3] Add "Regenerate" button to HistoryItem for successful results in `client/src/components/History/HistoryItem.tsx`
- [ ] T067 [US3] Implement retry click handler with credit check in HistoryItem
- [ ] T068 [US3] Display retry badge/icon on retried results in HistoryList
- [ ] T069 [US3] Show loading state during retry processing

**Frontend - Error Handling**

- [ ] T070 [US3] Display "Original image deleted" error message when retry fails
- [ ] T071 [US3] Display "Insufficient credit" error message when balance is low

**Testing for User Story 3**

- [ ] T072 [P] [US3] Unit test for retryTryOn() method in `server/test/outfit-change.service.spec.ts`
- [ ] T073 [P] [US3] E2E test for successful retry in `server/test/retry.e2e-spec.ts`
- [ ] T074 [P] [US3] E2E test for retry with deleted image in `server/test/retry.e2e-spec.ts`

**Checkpoint**: All three user stories (1, 2, 3) should now be independently functional - users can retry failed or successful try-ons

---

## Phase 6: User Story 4 - Re-upload Model Photo (Priority: P4)

**Goal**: 用户可以替换现有的模特照片，系统会保护历史记录的完整性

**Independent Test**: 上传模特图 A → 执行试衣 → 替换模特图为 B → 验证历史记录仍显示原始图片 A → 验证新试衣使用图片 B

### Implementation for User Story 4

**Backend - Image Replacement Logic**

- [ ] T075 [P] [US4] Extend ModelPhoto model to include version and replacementHistory (already in migration)
- [ ] T076 [P] [US4] Implement ModelPhotoService.replacePhoto() with reference check in `server/src/outfit-change/outfit-change.service.ts` or new model-photo.service.ts
- [ ] T077 [US4] Add logic to check if ModelPhoto is referenced by OutfitResults
- [ ] T078 [US4] If referenced: Keep old file, increment version, update replacementHistory JSON
- [ ] T079 [US4] If not referenced: Delete old file, replace with new file
- [ ] T080 [US4] Update ModelPhoto record with new imageUrl and metadata

**Backend - Replacement Controller**

- [ ] T081 [US4] Implement POST /api/outfit-change/models/:id/replace endpoint with file upload in `server/src/outfit-change/outfit-change.controller.ts`
- [ ] T082 [US4] Apply same validation as initial upload (file size ≤ 10MB, MIME type, Magic Number)

**Frontend - Replacement UI**

- [ ] T083 [P] [US4] Add "Replace" button to ModelSelector component in `client/src/components/VirtualTryOn/ModelSelector.tsx`
- [ ] T084 [US4] Create file input dialog for replacement in ModelSelector
- [ ] T085 [US4] Implement replacement API call with file upload
- [ ] T086 [US4] Update UI to show new model photo after successful replacement
- [ ] T087 [US4] Display version number in model photo card

**Frontend - Error Handling**

- [ ] T088 [US4] Display file validation errors (size, format)
- [ ] T089 [US4] Display upload failure errors
- [ ] T090 [US4] Show success notification after replacement

**Testing for User Story 4**

- [ ] T091 [P] [US4] Unit test for replacePhoto() with referenced image in `server/test/model-photo.service.spec.ts`
- [ ] T092 [P] [US4] Unit test for replacePhoto() with unreferenced image in `server/test/model-photo.service.spec.ts`
- [ ] T093 [P] [US4] E2E test for model photo replacement in `server/test/model-photo.e2e-spec.ts`

**Checkpoint**: All four user stories should now be complete and independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T094 [P] Add credit balance refresh on window focus in CreditContext
- [ ] T095 [P] Add error boundary for history page in `client/src/pages/History.tsx`
- [ ] T096 [P] Implement loading skeletons for history list in `client/src/components/History/HistoryList.tsx`
- [ ] T097 [P] Add database indexes verification: Run `npx prisma db push --accept-data-loss` to ensure indexes exist
- [ ] T098 Code cleanup: Remove any console.logs and debug statements
- [ ] T099 Update API error messages to be user-friendly across all endpoints
- [ ] T100 [P] Add JSDoc comments to all service methods in server/src/credit/ and server/src/history/
- [ ] T101 [P] Validate OpenAPI contracts match implementation using swagger-cli or similar tool
- [ ] T102 Run full test suite: `cd server && pnpm test && pnpm test:e2e`
- [ ] T103 Run frontend test suite: `cd client && pnpm test`
- [ ] T104 Perform manual quickstart.md validation following all steps
- [ ] T105 Update CLAUDE.md with implementation notes and learnings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - Credit system foundation
- **User Story 2 (Phase 4)**: Depends on Foundational - History viewing (can run parallel to US1 with different developers)
- **User Story 3 (Phase 5)**: Depends on Foundational + User Story 2 (needs history UI) - Retry functionality
- **User Story 4 (Phase 6)**: Depends on Foundational - Model photo replacement (can run parallel to US1-3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ Independent
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ Independent
- **User Story 3 (P3)**: Depends on User Story 2 (needs history UI to show retry button) ⚠️ Partial dependency
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ Independent

### Within Each User Story

**User Story 1 (Credit System)**:
1. Backend: Service → Controller → Integration (sequential)
2. Frontend: Context → Components (parallel after context)
3. Tests can run in parallel within each section

**User Story 2 (History)**:
1. Backend: Service → Controller (sequential)
2. Frontend: API Client → Page → Components (parallel after API client)
3. Tests can run in parallel

**User Story 3 (Retry)**:
1. Backend: Logic → Controller (sequential)
2. Frontend: UI components (parallel)
3. Must wait for US2 history UI to be complete

**User Story 4 (Model Replacement)**:
1. Backend: Logic → Controller (sequential)
2. Frontend: UI components (parallel)
3. Independent of other user stories

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002, T003 can run in parallel

**Phase 2 (Foundational)**:
- T007, T008, T009, T010, T011, T012 can all run in parallel

**Phase 3 (User Story 1)**:
- Backend services (T013-T017) can run in parallel
- Frontend components (T027, T028) can run in parallel after context (T025)
- Tests (T033-T037) can all run in parallel

**Phase 4 (User Story 2)**:
- Backend services (T038-T040) can run in parallel
- Frontend components (T047-T049) can run in parallel
- Tests (T056-T058) can all run in parallel

**Phase 5 (User Story 3)**:
- Backend logic (T059, T060) can run in parallel
- Frontend UI components (T065, T066) can run in parallel
- Tests (T072-T074) can all run in parallel

**Phase 6 (User Story 4)**:
- Backend logic (T075, T076) can run in parallel
- Frontend UI components (T083-T084) can run in parallel after API client
- Tests (T091-T093) can all run in parallel

**Phase 7 (Polish)**:
- T094-T101 can all run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all backend services for User Story 1 together:
Task: "Implement CreditService.deductCredit() in server/src/credit/credit.service.ts"
Task: "Implement CreditService.refundCredit() in server/src/credit/credit.service.ts"
Task: "Implement CreditService.getBalance() in server/src/credit/credit.service.ts"
Task: "Implement CreditService.getTransactions() in server/src/credit/credit.service.ts"
Task: "Create InsufficientCreditException in server/src/credit/exceptions/insufficient-credit.exception.ts"

# Launch all frontend components for User Story 1 together (after context ready):
Task: "Create CreditBadge component in client/src/components/Credit/CreditBadge.tsx"
Task: "Create CreditHistory component in client/src/components/Credit/CreditHistory.tsx"

# Launch all tests for User Story 1 together:
Task: "Unit test for CreditService.deductCredit() in server/test/credit.service.spec.ts"
Task: "Unit test for CreditService.refundCredit() in server/test/credit.service.spec.ts"
Task: "E2E test for credit deduction in server/test/credit.e2e-spec.ts"
Task: "E2E test for credit refund in server/test/credit.e2e-spec.ts"
Task: "Component test for CreditBadge in client/src/components/Credit/CreditBadge.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003) - ~30 mins
2. Complete Phase 2: Foundational (T004-T012) - ~1-2 hours
3. Complete Phase 3: User Story 1 (T013-T037) - ~2-3 days
4. **STOP and VALIDATE**: Test credit system independently
5. Deploy/demo MVP if ready

**MVP Deliverable**: Users can register with 100 credits, spend 10 credits per try-on, get refunds on failure, and view their balance.

### Incremental Delivery

1. **Week 1**: Setup + Foundational + User Story 1 → Credit System MVP
2. **Week 2**: User Story 2 → Add History Viewing
3. **Week 2**: User Story 3 → Add Retry Functionality
4. **Week 2**: User Story 4 → Add Model Photo Replacement
5. **Week 2**: Polish → Final validation and deployment

### Parallel Team Strategy

With 2 developers:

1. **Day 1**: Both complete Setup + Foundational together
2. **Day 2-3**:
   - Developer A: User Story 1 (Credit System)
   - Developer B: User Story 2 (History Viewing)
3. **Day 4**:
   - Developer A: User Story 3 (Retry) - depends on US2 UI
   - Developer B: User Story 4 (Model Replacement)
4. **Day 5**: Both work on Polish together

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [US1-4] labels map tasks to specific user stories for traceability
- Each user story should be independently completable and testable (except US3 has UI dependency on US2)
- Commit after each task or logical group of parallel tasks
- Stop at any checkpoint to validate story independently
- Follow research.md decisions for implementation patterns (Prisma transactions, cursor pagination, SWR hooks)
- Refer to data-model.md for exact schema definitions
- Refer to contracts/*.yaml for exact API contracts
- Avoid: vague tasks, same file conflicts, breaking independence of user stories

---

## Summary

- **Total Tasks**: 105
- **User Story 1 (Credit System)**: 25 tasks (T013-T037)
- **User Story 2 (History Viewing)**: 21 tasks (T038-T058)
- **User Story 3 (Retry)**: 16 tasks (T059-T074)
- **User Story 4 (Model Replacement)**: 19 tasks (T075-T093)
- **Setup + Foundational**: 12 tasks (T001-T012)
- **Polish**: 12 tasks (T094-T105)

**Parallel Opportunities**: 47 tasks marked [P] can run in parallel within their phase

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 37 tasks

**Estimated Timeline**:
- MVP (US1 only): 3-4 days
- MVP + US2: 5-7 days
- MVP + US2 + US3: 7-9 days
- Full Feature (all 4 stories): 9-12 days

**Team Size**: 1-2 full-stack developers recommended
