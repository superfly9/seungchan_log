-- DB설계도

-- 주제(Topic) 테이블
create table topics (
  id bigint primary key generated always as identity, -- 1, 2, 3... 자동으로 늘어나는 고유 번호
  user_id uuid references auth.users not null,        -- "누가 만들었니?" (Supabase 로그인 유저 ID와 연결)
  name text not null,                                 -- 주제 이름 (비어있으면 안 됨)
  created_at timestamptz default now()                -- 언제 만들어졌는지 (자동 입력)
);

-- RLS(행 단위 보안) 켜기: 허락된 사람만 데이터를 볼 수 있음
alter table topics enable row level security;

-- 정책 만들기: "내 데이터는 내가 보고 관리"
create policy "Users can see and manage their own topics"
  on topics for all -- 모든 동작(보기/수정/삭제)에 대해
  using (auth.uid() = user_id); -- "현재 로그인한 사람 ID(auth.uid)"가 "데이터 주인(user_id)"과 같을 때만 허용

-- 글(Post) 테이블
create table posts (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users not null,
  title text,
  content text,
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table posts enable row level security;

create policy "Public posts are viewable by everyone"
  on posts for select
  using (is_public = true);

create policy "Users can manage their own posts"
  on posts for all
  using (auth.uid() = user_id);

-- 글-주제(Post Topics) 연결 테이블
create table post_topics (
  post_id bigint references posts on delete cascade,    -- 글 ID (글이 지워지면 연결도 같이 삭제: cascade)
  topic_id bigint references topics on delete cascade,  -- 주제 ID
  primary key (post_id, topic_id)                       -- (글, 주제) 쌍은 중복될 수 없음
);

alter table post_topics enable row level security;

-- 글에 접근 권한이 있다면 주제 연결 정보도 관리 가능
-- 이상적으로는: 공개된 글의 주제는 공개되어야 함?
-- 또는 더 간단하게: 작성자는 관리 가능, 공개 글이면 누구나 읽기 가능.
-- MVP를 위해 간단하게:
create policy "Users can manage their own post_topics"
  on post_topics for all
  using (
      exists ( select 1 from posts where id = post_topics.post_id and user_id = auth.uid() )
  );

create policy "Public view of post topics"
  on post_topics for select
  using (
      exists ( select 1 from posts where id = post_topics.post_id and is_public = true )
  );
