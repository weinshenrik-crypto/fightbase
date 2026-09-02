-- Tracks whether a user has already been shown the "email me about my
-- favorites?" popup after logging in, so it only appears once per account.
alter table profiles add column if not exists notif_prompt_seen boolean not null default false;
