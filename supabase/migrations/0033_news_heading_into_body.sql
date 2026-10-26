-- The "heading on the detail page" field is gone: the heading is now the
-- first line of the HTML body, written in the /admin/news editor. This moves
-- every existing heading to the top of its body as an <h2> (plain-text bodies
-- become <p> paragraphs on the way) and clears the old column. Safe to run
-- more than once — rows are only touched while `heading` is still set.
-- Run it in the Supabase SQL editor right after deploying the code that no
-- longer shows `heading` (a heading is simply missing from the page until then).

update news
set
  body =
    '<h2>' ||
      replace(replace(replace(replace(btrim(heading), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), E'\n', '<br>') ||
    '</h2>' ||
    case
      when body is null or btrim(body) = '' then ''
      when ltrim(body) like '<%' then body
      else '<p>' ||
        replace(
          regexp_replace(
            replace(replace(replace(btrim(body), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'),
            E'\\n{2,}', '</p><p>', 'g'
          ),
          E'\n', '<br>'
        ) ||
      '</p>'
    end,
  heading = null
where heading is not null and btrim(heading) <> '';
