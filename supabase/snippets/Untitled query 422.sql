update public.profiles
set role = 'ADMIN'
where id = (
  select id
  from auth.users
  where email = 'suraj@gmail.com'
);


select * from  public.profiles