-- CreateTable
CREATE TABLE "model_photos" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "original_file_name" TEXT,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "model_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clothing_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "original_file_name" TEXT,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clothing_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outfit_results" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "model_photo_id" TEXT NOT NULL,
    "clothing_item_id" TEXT NOT NULL,
    "result_image_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "processing_duration" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "outfit_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processing_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "model_photo_id" TEXT NOT NULL,
    "clothing_item_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "result_id" TEXT,
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "processing_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "model_photos_user_id_idx" ON "model_photos"("user_id");

-- CreateIndex
CREATE INDEX "model_photos_deleted_at_idx" ON "model_photos"("deleted_at");

-- CreateIndex
CREATE INDEX "model_photos_uploaded_at_idx" ON "model_photos"("uploaded_at" DESC);

-- CreateIndex
CREATE INDEX "clothing_items_user_id_idx" ON "clothing_items"("user_id");

-- CreateIndex
CREATE INDEX "clothing_items_deleted_at_idx" ON "clothing_items"("deleted_at");

-- CreateIndex
CREATE INDEX "clothing_items_uploaded_at_idx" ON "clothing_items"("uploaded_at" DESC);

-- CreateIndex
CREATE INDEX "outfit_results_user_id_idx" ON "outfit_results"("user_id");

-- CreateIndex
CREATE INDEX "outfit_results_model_photo_id_idx" ON "outfit_results"("model_photo_id");

-- CreateIndex
CREATE INDEX "outfit_results_clothing_item_id_idx" ON "outfit_results"("clothing_item_id");

-- CreateIndex
CREATE INDEX "outfit_results_created_at_idx" ON "outfit_results"("created_at" DESC);

-- CreateIndex
CREATE INDEX "outfit_results_user_id_model_photo_id_clothing_item_id_idx" ON "outfit_results"("user_id", "model_photo_id", "clothing_item_id");

-- CreateIndex
CREATE INDEX "processing_sessions_user_id_idx" ON "processing_sessions"("user_id");

-- CreateIndex
CREATE INDEX "processing_sessions_status_idx" ON "processing_sessions"("status");

-- CreateIndex
CREATE INDEX "processing_sessions_created_at_idx" ON "processing_sessions"("created_at" DESC);

-- CreateIndex
CREATE INDEX "processing_sessions_user_id_status_idx" ON "processing_sessions"("user_id", "status");

-- AddForeignKey
ALTER TABLE "model_photos" ADD CONSTRAINT "model_photos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_items" ADD CONSTRAINT "clothing_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outfit_results" ADD CONSTRAINT "outfit_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outfit_results" ADD CONSTRAINT "outfit_results_model_photo_id_fkey" FOREIGN KEY ("model_photo_id") REFERENCES "model_photos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outfit_results" ADD CONSTRAINT "outfit_results_clothing_item_id_fkey" FOREIGN KEY ("clothing_item_id") REFERENCES "clothing_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processing_sessions" ADD CONSTRAINT "processing_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processing_sessions" ADD CONSTRAINT "processing_sessions_model_photo_id_fkey" FOREIGN KEY ("model_photo_id") REFERENCES "model_photos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processing_sessions" ADD CONSTRAINT "processing_sessions_clothing_item_id_fkey" FOREIGN KEY ("clothing_item_id") REFERENCES "clothing_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processing_sessions" ADD CONSTRAINT "processing_sessions_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "outfit_results"("id") ON DELETE SET NULL ON UPDATE CASCADE;
