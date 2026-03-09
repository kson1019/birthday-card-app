CREATE TABLE `reminders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`recipient_id` integer NOT NULL,
	`remind_at` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`sent_at` text,
	FOREIGN KEY (`recipient_id`) REFERENCES `recipients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_reminders_remind_at` ON `reminders` (`remind_at`);