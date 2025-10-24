CREATE EXTENSION IF NOT EXISTS citext;
ALTER TABLE "levelpacks" ALTER COLUMN "packName" SET DATA TYPE "citext";--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "name" SET DATA TYPE "citext";--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "name" SET DEFAULT 'Unnamed';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "uname" SET DATA TYPE "citext";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE "citext";