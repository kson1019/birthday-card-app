CREATE TABLE `goal_tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`goal_id` integer NOT NULL,
	`week_number` integer NOT NULL,
	`week_theme` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`is_completed` integer DEFAULT 0 NOT NULL,
	`completed_at` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_goal_tasks_goal_id` ON `goal_tasks` (`goal_id`);--> statement-breakpoint
CREATE TABLE `goals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
