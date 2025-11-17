CREATE TABLE "actions_downloads" (
	"id" integer NOT NULL,
	"ip" "inet" NOT NULL,
	CONSTRAINT "actions_downloads_id_ip_pk" PRIMARY KEY("id","ip")
);
