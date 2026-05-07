-- Migration 0007: Profiles (1:1 com auth.users)
-- Dados públicos do usuário. Não armazena role (role fica em team_members + app_metadata).

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  avatar_path TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Usuário lê o próprio perfil
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (id = (SELECT auth.uid()));

-- Usuário insere o próprio perfil (signup flow)
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT WITH CHECK (id = (SELECT auth.uid()));

-- Usuário atualiza o próprio perfil
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- Policy profiles_select_team adicionada na migration 0008 (depende de team_members)
