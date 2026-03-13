DROP TABLE `reminders`;--> statement-breakpoint
ALTER TABLE `cards` ADD `duration_minutes` integer DEFAULT 180 NOT NULL;