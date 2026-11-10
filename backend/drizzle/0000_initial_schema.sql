CREATE SCHEMA IF NOT EXISTS "tickets";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "notifications";
--> statement-breakpoint
CREATE TABLE "tickets"."tickets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(150) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(20) NOT NULL,
	"priority" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL,
	"assigned_team_code" varchar(40) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "tickets_category_check" CHECK ("category" IN ('TECHNICAL', 'BILLING', 'GENERAL')),
	CONSTRAINT "tickets_priority_check" CHECK ("priority" IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
	CONSTRAINT "tickets_status_check" CHECK ("status" IN ('OPEN', 'IN_PROGRESS', 'RESOLVED'))
);
--> statement-breakpoint
CREATE TABLE "notifications"."notifications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"ticket_id" uuid NOT NULL,
	"type" varchar(40) NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
