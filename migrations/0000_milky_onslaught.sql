CREATE TABLE "acccomments" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" integer NOT NULL,
	"comment" text NOT NULL,
	"postedTime" timestamp DEFAULT now() NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"isSpam" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"uid" integer NOT NULL,
	"type" integer NOT NULL,
	"target_id" integer NOT NULL,
	"isMod" boolean DEFAULT false NOT NULL,
	"data" json DEFAULT '{}'::json NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" integer NOT NULL,
	"lvl_id" integer NOT NULL,
	"comment" text NOT NULL,
	"postedTime" timestamp DEFAULT now() NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"isSpam" boolean DEFAULT false NOT NULL,
	"percent" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendreqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid_src" integer NOT NULL,
	"uid_dest" integer NOT NULL,
	"uploadDate" timestamp DEFAULT now() NOT NULL,
	"comment" text DEFAULT '' NOT NULL,
	"isNew" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid1" integer NOT NULL,
	"uid2" integer NOT NULL,
	"u1_new" boolean DEFAULT false NOT NULL,
	"u2_new" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "levelpacks" (
	"id" serial PRIMARY KEY NOT NULL,
	"packType" boolean NOT NULL,
	"packName" text NOT NULL,
	"levels" text NOT NULL,
	"packStars" integer DEFAULT 0 NOT NULL,
	"packCoins" integer DEFAULT 0 NOT NULL,
	"packDifficulty" integer NOT NULL,
	"packColor" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "levels" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'Unnamed' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"uid" integer NOT NULL,
	"password" text DEFAULT '' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"length" integer DEFAULT 0 NOT NULL,
	"difficulty" integer DEFAULT 0 NOT NULL,
	"demonDifficulty" integer DEFAULT -1 NOT NULL,
	"suggestDifficulty" double precision DEFAULT 0 NOT NULL,
	"suggestDifficultyCount" integer DEFAULT 0 NOT NULL,
	"track_id" integer DEFAULT 0 NOT NULL,
	"song_id" integer DEFAULT 0 NOT NULL,
	"versionGame" integer NOT NULL,
	"versionBinary" integer NOT NULL,
	"stringExtra" json,
	"stringSettings" text DEFAULT '' NOT NULL,
	"stringLevel" text NOT NULL,
	"stringLevelInfo" text DEFAULT '' NOT NULL,
	"original_id" integer DEFAULT 0 NOT NULL,
	"objects" integer DEFAULT 0 NOT NULL,
	"starsRequested" integer DEFAULT 0 NOT NULL,
	"starsGot" integer DEFAULT 0 NOT NULL,
	"ucoins" integer DEFAULT 0 NOT NULL,
	"coins" integer DEFAULT 0 NOT NULL,
	"downloads" integer DEFAULT 0 NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"reports" integer DEFAULT 0 NOT NULL,
	"collab" text DEFAULT '' NOT NULL,
	"is2p" boolean DEFAULT false NOT NULL,
	"isVerified" boolean DEFAULT false NOT NULL,
	"isFeatured" boolean DEFAULT false NOT NULL,
	"isHall" boolean DEFAULT false NOT NULL,
	"isEpic" integer DEFAULT 0 NOT NULL,
	"isUnlisted" integer DEFAULT 0 NOT NULL,
	"isLDM" boolean DEFAULT false NOT NULL,
	"uploadDate" timestamp DEFAULT now() NOT NULL,
	"updateDate" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'Unnamed' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"uid" integer DEFAULT 0 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"difficulty" integer DEFAULT -1 NOT NULL,
	"downloads" integer DEFAULT 0 NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"isFeatured" boolean DEFAULT false NOT NULL,
	"isUnlisted" boolean DEFAULT false NOT NULL,
	"levels" text,
	"diamonds" integer DEFAULT 0 NOT NULL,
	"lvlDiamonds" integer DEFAULT 0 NOT NULL,
	"uploadDate" timestamp DEFAULT now() NOT NULL,
	"updateDate" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid_src" integer NOT NULL,
	"uid_dest" integer NOT NULL,
	"subject" text DEFAULT '' NOT NULL,
	"message" text NOT NULL,
	"postedTime" timestamp DEFAULT now() NOT NULL,
	"isNew" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quests" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" integer NOT NULL,
	"name" text NOT NULL,
	"needed" integer NOT NULL,
	"reward" integer NOT NULL,
	"lvl_id" integer NOT NULL,
	"time_added" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rateQueue" (
	"id" serial PRIMARY KEY NOT NULL,
	"lvl_id" integer NOT NULL,
	"name" text DEFAULT 'Unnamed' NOT NULL,
	"uid" integer NOT NULL,
	"mod_uid" integer NOT NULL,
	"stars" integer DEFAULT 0 NOT NULL,
	"isFeatured" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"roleName" text DEFAULT 'Moderator' NOT NULL,
	"commentColor" text DEFAULT '0,0,255' NOT NULL,
	"modLevel" integer DEFAULT 1 NOT NULL,
	"privs" json DEFAULT '{"cRate":0,"cFeature":0,"cEpic":0,"cVerCoins":0,"cDaily":0,"cWeekly":0,"cDelete":0,"cLvlAccess":0,"aRateDemon":0,"aRateReq":0,"aRateStars":0,"aReqMod":0}'::json NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" integer NOT NULL,
	"lvl_id" integer NOT NULL,
	"postedTime" timestamp DEFAULT now() NOT NULL,
	"percent" integer DEFAULT 0 NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"coins" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "songs" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"name" text DEFAULT 'Unnamed' NOT NULL,
	"artist" text DEFAULT 'Unknown' NOT NULL,
	"size" numeric(10, 2) NOT NULL,
	"url" text NOT NULL,
	"isBanned" boolean DEFAULT false NOT NULL,
	"downloads" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"uid" serial PRIMARY KEY NOT NULL,
	"uname" text NOT NULL,
	"passhash" text NOT NULL,
	"gjphash" text NOT NULL,
	"email" text NOT NULL,
	"role_id" integer DEFAULT 0 NOT NULL,
	"stars" integer DEFAULT 0 NOT NULL,
	"diamonds" integer DEFAULT 0 NOT NULL,
	"coins" integer DEFAULT 0 NOT NULL,
	"ucoins" integer DEFAULT 0 NOT NULL,
	"demons" integer DEFAULT 0 NOT NULL,
	"cpoints" integer DEFAULT 0 NOT NULL,
	"orbs" integer DEFAULT 0 NOT NULL,
	"moons" integer DEFAULT 0 NOT NULL,
	"extraData" jsonb,
	"regDate" timestamp DEFAULT now() NOT NULL,
	"accessDate" timestamp DEFAULT now() NOT NULL,
	"lastIP" text DEFAULT 'Unknown' NOT NULL,
	"gameVer" integer DEFAULT 20 NOT NULL,
	"lvlsCompleted" integer DEFAULT 0 NOT NULL,
	"special" integer DEFAULT 0 NOT NULL,
	"protect_meta" jsonb DEFAULT '{"comment_time":0,"post_time":0,"message_time":0}'::jsonb NOT NULL,
	"protect_levelsToday" integer DEFAULT 0 NOT NULL,
	"protect_todayStars" integer DEFAULT 0 NOT NULL,
	"isBanned" integer DEFAULT 1 NOT NULL,
	"blacklist" text,
	"friends_cnt" integer DEFAULT 0 NOT NULL,
	"friendship_ids" text,
	"iconType" integer DEFAULT 0 NOT NULL,
	"vessels" jsonb DEFAULT '{"clr_primary":0,"clr_secondary":0,"cube":0,"ship":0,"ball":0,"ufo":0,"wave":0,"robot":0,"spider":0,"swing":0,"jetpack":0,"trace":0,"death":0}'::jsonb NOT NULL,
	"chests" jsonb DEFAULT '{"small_count":0,"big_count":0,"small_time":0,"big_time":0}'::jsonb NOT NULL,
	"settings" jsonb DEFAULT '{"frS":0,"cS":0,"mS":0,"youtube":"","twitch":"","twitter":""}'::jsonb NOT NULL
);
