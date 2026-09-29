CREATE TABLE `event_seats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`ticket_type_id` integer NOT NULL,
	`row_label` text NOT NULL,
	`seat_number` integer NOT NULL,
	`label` text NOT NULL,
	`position` integer NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ticket_type_id`) REFERENCES `ticket_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_seat_position_idx` ON `event_seats` (`event_id`,`row_label`,`seat_number`);--> statement-breakpoint
CREATE TABLE `seat_holds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`seat_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`seat_id`) REFERENCES `event_seats`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `seat_holds_seat_id_unique` ON `seat_holds` (`seat_id`);--> statement-breakpoint
ALTER TABLE `booking_items` ADD `seat_id` integer REFERENCES event_seats(id);--> statement-breakpoint
ALTER TABLE `booking_items` ADD `seat_label` text;--> statement-breakpoint
ALTER TABLE `tickets` ADD `seat_id` integer REFERENCES event_seats(id);--> statement-breakpoint
ALTER TABLE `tickets` ADD `seat_label` text;