CREATE TABLE `cards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`image_path` text NOT NULL,
	`headline` text NOT NULL,
	`title` text NOT NULL,
	`location` text NOT NULL,
	`datetime` text NOT NULL,
	`message` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recipients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`card_id` integer NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`token` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`response_message` text,
	`responded_at` text,
	FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `recipients_token_unique` ON `recipients` (`token`);--> statement-breakpoint
CREATE INDEX `idx_recipients_card_id` ON `recipients` (`card_id`);--> statement-breakpoint
CREATE INDEX `idx_recipients_token` ON `recipients` (`token`);