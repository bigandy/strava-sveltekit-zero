ALTER TABLE "activity" ADD COLUMN "summaryPolyline" text NOT NULL;--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "startCoords" "point" NOT NULL;--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "endCoords" "point" NOT NULL;