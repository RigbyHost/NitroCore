ALTER TABLE "quests" ALTER COLUMN "name" SET DEFAULT 'Unnamed';--> statement-breakpoint
ALTER TABLE "quests" ALTER COLUMN "needed" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "quests" ALTER COLUMN "reward" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "quests" ALTER COLUMN "lvl_id" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "quests" ALTER COLUMN "time_added" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "privs" SET DEFAULT '{"cRate":false,"cFeature":false,"cEpic":false,"cVerCoins":false,"cDaily":false,"cWeekly":false,"cDelete":false,"cLvlAccess":false,"aRateDemon":false,"aRateReq":false,"aRateStars":false,"aReqMod":false}'::json;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "vessels" SET DEFAULT '{"clr_primary":0,"clr_secondary":0,"clr_glow":0,"cube":0,"ship":0,"ball":0,"ufo":0,"wave":0,"robot":0,"spider":0,"swing":0,"jetpack":0,"trace":0,"death":0}'::jsonb;