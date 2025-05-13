/* ========= ENUM TYPES ========= */
CREATE TYPE visibility_enum AS ENUM ('private', 'team', 'public');
CREATE TYPE role_enum       AS ENUM ('owner', 'member', 'observer');
CREATE TYPE priority_enum   AS ENUM ('low', 'medium', 'high', 'critical');

/* ========= TABLES ========= */

/* --- Пользователи --- */
CREATE TABLE users (
    user_id        SERIAL PRIMARY KEY,
    name           VARCHAR(255)        NOT NULL,
    email          VARCHAR(255)        NOT NULL UNIQUE,
    password_hash  TEXT                NOT NULL,
    avatar_url     TEXT,
    created_at     TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

/* --- Доски --- */
CREATE TABLE boards (
    board_id    SERIAL PRIMARY KEY,
    title       VARCHAR(255)        NOT NULL,
    description TEXT,
    owner_id    INT                NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    visibility  visibility_enum     NOT NULL DEFAULT 'private',
    created_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMPTZ
);

/* --- Участники досок (many‑to‑many) --- */
CREATE TABLE board_members (
    board_id INT NOT NULL REFERENCES boards(board_id) ON DELETE CASCADE,
    user_id  INT NOT NULL REFERENCES users(user_id)  ON DELETE CASCADE,
    role     role_enum        NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    PRIMARY KEY (board_id, user_id)
);

/* --- Колонки на доске --- */
CREATE TABLE board_columns (
    column_id SERIAL PRIMARY KEY,
    board_id  INT            NOT NULL REFERENCES boards(board_id) ON DELETE CASCADE,
    name      VARCHAR(255)   NOT NULL,
    position  INT            NOT NULL CHECK (position >= 0)
);
CREATE INDEX idx_board_columns_board_pos ON board_columns (board_id, position);

/* --- Карточки --- */
CREATE TABLE cards (
    card_id     SERIAL PRIMARY KEY,
    column_id   INT            NOT NULL REFERENCES board_columns(column_id) ON DELETE CASCADE,
    title       VARCHAR(255)   NOT NULL,
    description TEXT,
    position    INT            NOT NULL CHECK (position >= 0),
    due_date    DATE,
    priority    priority_enum,
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMPTZ
);
CREATE INDEX idx_cards_column_pos   ON cards (column_id, position);
CREATE INDEX idx_cards_due_date     ON cards (due_date);

/* --- Исполнители карточек (many‑to‑many) --- */
CREATE TABLE card_assignments (
    card_id    INT NOT NULL REFERENCES cards(card_id) ON DELETE CASCADE,
    user_id    INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (card_id, user_id)
);

/* --- Метки --- */
CREATE TABLE labels (
    label_id  SERIAL PRIMARY KEY,
    board_id  INT           NOT NULL REFERENCES boards(board_id) ON DELETE CASCADE,
    name      VARCHAR(100)  NOT NULL,
    color_hex CHAR(6)       NOT NULL CHECK (color_hex ~ '^[0-9A-Fa-f]{6}$')
);

/* --- Метки, назначенные карточкам (many‑to‑many) --- */
CREATE TABLE card_labels (
    card_id  INT NOT NULL REFERENCES cards(card_id)  ON DELETE CASCADE,
    label_id INT NOT NULL REFERENCES labels(label_id) ON DELETE CASCADE,
    PRIMARY KEY (card_id, label_id)
);

/* --- Комментарии --- */
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    card_id    INT NOT NULL REFERENCES cards(card_id)  ON DELETE CASCADE,
    user_id    INT NOT NULL REFERENCES users(user_id)  ON DELETE CASCADE,
    content    TEXT           NOT NULL,
    created_at TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);
CREATE INDEX idx_comments_card ON comments (card_id);

/* --- Вложения --- */
CREATE TABLE attachments (
    attachment_id SERIAL PRIMARY KEY,
    card_id     INT            NOT NULL REFERENCES cards(card_id) ON DELETE CASCADE,
    file_name   VARCHAR(255)   NOT NULL,
    file_url    TEXT           NOT NULL,
    size_bytes  INT            NOT NULL CHECK (size_bytes >= 0),
    uploaded_at TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

/* --- Чек‑листы --- */
CREATE TABLE checklists (
    checklist_id SERIAL PRIMARY KEY,
    card_id   INT            NOT NULL REFERENCES cards(card_id) ON DELETE CASCADE,
    title     VARCHAR(255)   NOT NULL,
    position  INT            NOT NULL CHECK (position >= 0)
);
CREATE INDEX idx_checklists_card_pos ON checklists (card_id, position);

/* --- Пункты чек‑листа --- */
CREATE TABLE checklist_items (
    item_id      SERIAL PRIMARY KEY,
    checklist_id INT           NOT NULL REFERENCES checklists(checklist_id) ON DELETE CASCADE,
    content      VARCHAR(255)  NOT NULL,
    position     INT           NOT NULL CHECK (position >= 0),
    is_done      BOOLEAN       NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ
);
CREATE INDEX idx_checklist_items_list_pos ON checklist_items (checklist_id, position);

