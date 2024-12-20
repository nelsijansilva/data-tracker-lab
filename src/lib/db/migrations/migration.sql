-- CreateTable
CREATE TABLE "facebook_ad_accounts" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "app_secret" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facebook_ad_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facebook_campaigns" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "account_id" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "objective" TEXT,
    "spend" DOUBLE PRECISION,
    "impressions" INTEGER,
    "clicks" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facebook_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facebook_ad_sets" (
    "id" TEXT NOT NULL,
    "ad_set_id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "budget_remaining" DOUBLE PRECISION,
    "daily_budget" DOUBLE PRECISION,
    "lifetime_budget" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facebook_ad_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facebook_ads" (
    "id" TEXT NOT NULL,
    "ad_id" TEXT NOT NULL,
    "ad_set_id" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "preview_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facebook_ads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_metrics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "is_custom" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "selected_metrics" (
    "id" TEXT NOT NULL,
    "metric_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "selected_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "raw_payload" JSONB NOT NULL,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_logs" (
    "id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "headers" JSONB NOT NULL,
    "source" TEXT,
    "status" TEXT DEFAULT 'received',
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "facebook_campaigns" ADD CONSTRAINT "facebook_campaigns_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "facebook_ad_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facebook_ad_sets" ADD CONSTRAINT "facebook_ad_sets_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "facebook_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facebook_ads" ADD CONSTRAINT "facebook_ads_ad_set_id_fkey" FOREIGN KEY ("ad_set_id") REFERENCES "facebook_ad_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selected_metrics" ADD CONSTRAINT "selected_metrics_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "custom_metrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;