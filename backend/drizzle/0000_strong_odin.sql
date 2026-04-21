CREATE TABLE IF NOT EXISTS "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(32) DEFAULT 'admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agenda" (
	"id" serial PRIMARY KEY NOT NULL,
	"date_time" timestamp NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "budzet" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date,
	"for_year" integer,
	"documents" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "institucii" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_of_institution" varchar(500) NOT NULL,
	"mesto_naseleno" varchar(255),
	"director_full_name" varchar(255),
	"director_biography" text,
	"email" varchar(255),
	"website" varchar(500),
	"facebook" varchar(500),
	"instagram" varchar(500)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legislativa" (
	"id" serial PRIMARY KEY NOT NULL,
	"type_id" integer,
	"title" varchar(500),
	"document" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "naseleni_mesta" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "odnosi_so_javnost" (
	"id" serial PRIMARY KEY NOT NULL,
	"type_id" integer,
	"title" varchar(500) NOT NULL,
	"picture" text,
	"description" text,
	"documents" jsonb DEFAULT '[]'::jsonb,
	"date_valid_to" date,
	"made_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prijaveni_problemi" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"type_of_problem_id" integer,
	"description" text NOT NULL,
	"picture" text,
	"naseleno_mesto_id" integer,
	"date" timestamp DEFAULT now() NOT NULL,
	"phone_number" varchar(64),
	"email" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "proekti" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"picture" text,
	"documents" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sluzben_glasnik" (
	"id" serial PRIMARY KEY NOT NULL,
	"broj" varchar(64) NOT NULL,
	"date" date,
	"document" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "type_legislativa" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "type_objava" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "type_of_problems" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vraboteni" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(128) NOT NULL,
	"last_name" varchar(128) NOT NULL,
	"email" varchar(255),
	"oddel" varchar(255),
	"function" varchar(255)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legislativa" ADD CONSTRAINT "legislativa_type_id_type_legislativa_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."type_legislativa"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "odnosi_so_javnost" ADD CONSTRAINT "odnosi_so_javnost_type_id_type_objava_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."type_objava"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prijaveni_problemi" ADD CONSTRAINT "prijaveni_problemi_type_of_problem_id_type_of_problems_id_fk" FOREIGN KEY ("type_of_problem_id") REFERENCES "public"."type_of_problems"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prijaveni_problemi" ADD CONSTRAINT "prijaveni_problemi_naseleno_mesto_id_naseleni_mesta_id_fk" FOREIGN KEY ("naseleno_mesto_id") REFERENCES "public"."naseleni_mesta"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
