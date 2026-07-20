import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ trips: [] }, null, 2));
}

export function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading DB:', error);
    return { trips: [] };
  }
}

export function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing DB:', error);
  }
}

export function saveTrip(trip) {
  const db = readDB();
  const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  const newTrip = { id, ...trip, createdAt: new Date().toISOString() };
  db.trips.push(newTrip);
  writeDB(db);
  return newTrip;
}

export function getTrip(id) {
  const db = readDB();
  return db.trips.find(t => t.id === id) || null;
}

export function getAllTrips() {
  const db = readDB();
  return db.trips;
}
