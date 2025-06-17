CREATE TABLE `api_key` (
  `id` text PRIMARY KEY NOT NULL,
  `description` text NOT NULL,
  `token` text NOT NULL,
  `hash_fn` text NOT NULL,
  `is_active` integer NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

--> statement-breakpoint
CREATE TABLE `invitation` (
  `id` text PRIMARY KEY NOT NULL,
  `code` text NOT NULL,
  `first_name` text NOT NULL,
  `last_name` text NOT NULL,
  `email` text NOT NULL,
  `duration` integer NOT NULL,
  `expirty_at` integer NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

--> statement-breakpoint
CREATE UNIQUE INDEX `invitation_code_unique` ON `invitation` (`code`);

--> statement-breakpoint
CREATE TABLE `provider_login` (
  `id` text PRIMARY KEY NOT NULL,
  `provider_id` text NOT NULL,
  `subject_id` text NOT NULL,
  `user_id` text NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `app_user`(`id`) ON UPDATE no action ON DELETE cascade
);

--> statement-breakpoint
CREATE UNIQUE INDEX `provider_unique_id` ON `provider_login` (`provider_id`, `subject_id`);

--> statement-breakpoint
CREATE TABLE `app_user` (
  `id` text PRIMARY KEY NOT NULL,
  `first_name` text NOT NULL,
  `last_name` text NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

--> statement-breakpoint
CREATE TABLE `user_email` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `verified` integer NOT NULL,
  `user_id` text NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `app_user`(`id`) ON UPDATE no action ON DELETE cascade
);

--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_email_unique` ON `user_email` (`email`);

--> statement-breakpoint
CREATE TABLE `user_token` (
  `id` text PRIMARY KEY NOT NULL,
  `generated_at` integer NOT NULL,
  `duration` integer NOT NULL,
  `user_id` text NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `app_user`(`id`) ON UPDATE no action ON DELETE cascade
);
