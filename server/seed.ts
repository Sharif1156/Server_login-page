import { seedDatabase, db } from './db.js';
seedDatabase(true);
console.log('Demo database reseeded.');
db.close();
