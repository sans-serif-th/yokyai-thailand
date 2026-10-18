-- Optional show-from / show-until dates for news (inclusive, Thai calendar
-- day). Null = no limit on that side. `published` still has to be true; the
-- window only narrows when a published item is visible in the app.
alter table news
  add column if not exists publish_start date,
  add column if not exists publish_end date,
  add constraint news_publish_window_order
    check (publish_start is null or publish_end is null or publish_start <= publish_end);
