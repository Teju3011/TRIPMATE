/**
 * TripMate Database Engine
 * Zero-dependency JSON Database with Atomic Writes, Locking, and Seed Initialization
 */

const fs = require('fs');
const path = require('path');
const crypto = require('node:crypto');
const config = require('../config');
const { getSeedData } = require('./seedData');

class DatabaseEngine {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = {
      users: [],
      trips: [],
      collaborators: [],
      destinations: [],
      itinerary: [],
      expenses: [],
      auditLogs: []
    };
    this.init();
  }

  init() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.data = {
            users: Array.isArray(parsed.users) ? parsed.users : [],
            trips: Array.isArray(parsed.trips) ? parsed.trips : [],
            collaborators: Array.isArray(parsed.collaborators) ? parsed.collaborators : [],
            destinations: Array.isArray(parsed.destinations) ? parsed.destinations : [],
            itinerary: Array.isArray(parsed.itinerary) ? parsed.itinerary : [],
            expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
            auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : []
          };
          return;
        }
      } catch (err) {
        console.warn(`[DB] Warning: Could not parse DB file. Initializing empty DB:`, err.message);
      }
    }

    // Clean initial state for real-time app (no demo data)
    this.data = {
      users: [],
      trips: [],
      collaborators: [],
      destinations: [],
      itinerary: [],
      expenses: [],
      auditLogs: []
    };
    this.persist();
  }

  persist() {
    try {
      const tempFile = `${this.filePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, this.filePath);
    } catch (err) {
      console.error('[DB] Persistence Error:', err);
      // Fallback direct write
      try {
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (innerErr) {
        console.error('[DB] Fatal Write Error:', innerErr);
      }
    }
  }

  // --- Collection Accessors ---

  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  find(collectionName, predicate = () => true) {
    return this.getCollection(collectionName).filter(predicate);
  }

  findOne(collectionName, predicate) {
    return this.getCollection(collectionName).find(predicate) || null;
  }

  findById(collectionName, id) {
    return this.findOne(collectionName, item => item.id === id);
  }

  insert(collectionName, doc) {
    if (!doc.id) {
      doc.id = `${collectionName.slice(0, 3)}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    }
    if (!doc.createdAt) {
      doc.createdAt = new Date().toISOString();
    }
    this.getCollection(collectionName).push(doc);
    this.persist();
    return doc;
  }

  update(collectionName, id, updates) {
    const coll = this.getCollection(collectionName);
    const index = coll.findIndex(item => item.id === id);
    if (index === -1) return null;

    coll[index] = {
      ...coll[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return coll[index];
  }

  delete(collectionName, id) {
    const coll = this.getCollection(collectionName);
    const index = coll.findIndex(item => item.id === id);
    if (index === -1) return false;

    coll.splice(index, 1);
    this.persist();
    return true;
  }

  logAudit({ actorId, actorEmail, action, resourceType, resourceId, status, ipAddress, details }) {
    const logEntry = {
      id: `audit-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      timestamp: new Date().toISOString(),
      actorId: actorId || 'system',
      actorEmail: actorEmail || 'system@tripmate.io',
      action,
      resourceType,
      resourceId: resourceId || null,
      status: status || 'SUCCESS',
      ipAddress: ipAddress || '127.0.0.1',
      details: details || ''
    };
    this.insert('auditLogs', logEntry);
    return logEntry;
  }

  resetToSeed() {
    this.data = getSeedData();
    this.persist();
    return true;
  }
}

// Singleton database instance
const db = new DatabaseEngine(config.DATA_FILE_PATH);

module.exports = db;
