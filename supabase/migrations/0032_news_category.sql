-- News gets a category (ข่าวสาร / ระบบ) in place of the article/steps layout,
-- and the body becomes HTML written in the /admin/news editor. Run this in
-- the Supabase SQL editor BEFORE deploying the code that reads `category`.
--
-- Steps-layout rows are converted to an article: each step becomes a
-- numbered <h3>, an optional <img> and a <p>, and the row is filed under
-- 'system'. Every other row becomes 'news'. The old `layout` and `steps`
-- columns are left in place (nothing reads them any more), so this is safe to
-- run once and the original step data is still there if you need it.

alter table news
  add column if not exists category text not null default 'news'
  check (category in ('news', 'system'));

update news n
set
  category = 'system',
  body = (
    select string_agg(
      '<h3>' || s.ord || '. ' ||
        replace(replace(replace(s.step->>'title', '&', '&amp;'), '<', '&lt;'), '>', '&gt;') ||
      '</h3>' ||
      case
        when coalesce(s.step->>'image_url', '') <> ''
          then '<img src="' || replace(s.step->>'image_url', '"', '%22') || '" alt="">'
        else ''
      end ||
      case
        when coalesce(s.step->>'description', '') <> ''
          then '<p>' ||
            replace(
              replace(replace(replace(s.step->>'description', '&', '&amp;'), '<', '&lt;'), '>', '&gt;'),
              E'\n', '<br>'
            ) ||
          '</p>'
        else ''
      end,
      ''
      order by s.ord
    )
    from jsonb_array_elements(n.steps) with ordinality as s(step, ord)
  )
where n.layout = 'steps' and jsonb_array_length(n.steps) > 0;

-- Steps rows without any step still move to the system category.
update news set category = 'system' where layout = 'steps' and category = 'news';
