CREATE TABLE `records` (
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`data` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`user_id`, `date`)
);
