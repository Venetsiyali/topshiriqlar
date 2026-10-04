-- players jadvalini ustun darajasida cheklash Supabase Realtime (postgres_changes) bilan
-- mos ishlamaydi. device_token ustunida faqat SHA-256 xesh saqlangani uchun uni ochiq
-- o'qish xavfsiz: xeshdan tokenni tiklab, boshqa talabaning o'rniga kirib bo'lmaydi.
grant select on public.players to anon, authenticated;
