CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ghibliMovieId` varchar(64) NOT NULL,
	`movieTitle` text,
	`movieDescription` text,
	`releaseDate` varchar(10),
	`runningTime` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;