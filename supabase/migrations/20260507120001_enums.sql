-- Migration 0002: Lookup tables para roles e status
-- Decisão: TEXT + CHECK em vez de PostgreSQL native ENUM (difícil alterar em produção)
-- Roles e order_status definidos como CHECK constraints nas tabelas que os usam

-- Nenhum DDL necessário aqui — roles e status são TEXT + CHECK aplicados diretamente
-- nas tabelas (profiles.role, team_members.role, orders.status, etc.)
-- Esta migration existe como placeholder documentando a decisão.

-- Roles válidos no sistema (referência):
-- 'atelier_owner'  — dono do atelier
-- 'atelier_member' — membro do atelier
-- 'lojista_owner'  — dono da loja
-- 'lojista_buyer'  — comprador da loja
-- 'admin'          — administrador MOBIO
