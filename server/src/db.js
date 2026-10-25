// Tiny JSON-file store. Good enough for a hackathon demo; swap for SQLite/Postgres later.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const file = process.env.DB_FILE
  || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'db.json');

const empty = () => ({ users: [], cafes: [], tasks: [] });

export const db = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : empty();

export function save() {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(db, null, 2));
}
