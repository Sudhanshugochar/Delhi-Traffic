// Vercel Serverless Function wrapper for Express app
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const fetch = require('node-fetch');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
    console.log(new Date().toISOString(), req.method, req.path, req.ip);
    next();
});

// --- SSE (Server-Sent Events) manager for real-time notifications ---
const sseClients = new Map(); // userId -> Set of response objects

function addSseClient(userId, res) {
    if (!sseClients.has(userId)) sseClients.set(userId, new Set());
    sseClients.get(userId).add(res);
    try {
        console.log(`SSE: client connected for userId=${userId}. Total connections for user: ${sseClients.get(userId).size}`);
    } catch (e) { /* ignore logging errors */ }
}

function removeSseClient(userId, res) {
    if (!sseClients.has(userId)) return;
    sseClients.get(userId).delete(res);
    if (sseClients.get(userId).size === 0) sseClients.delete(userId);
    try {
        console.log(`SSE: client disconnected for userId=${userId}. Remaining connections: ${sseClients.has(userId) ? sseClients.get(userId).size : 0}`);
    } catch (e) { /* ignore */ }
}

function sendEventToUser(userId, eventData) {
    const clients = sseClients.get(String(userId));
    if (!clients) return false;
    for (const res of Array.from(clients)) {
        try {
            res.write(`event: notification\ndata: ${JSON.stringify(eventData)}\n\n`);
        } catch (e) {
            // If writing fails, remove the client
            try { removeSseClient(userId, res); } catch (er) { /* ignore */ }
        }
    }
    return true;
}

app.get('/subscribe', (req, res) => {
    const userId = req.query.userId || req.body && req.body.userId;
    if (!userId) return res.status(400).json({ success: false, message: 'Missing userId query parameter' });

    // SSE headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
    });
    res.write('\n');

    addSseClient(String(userId), res);
    console.log('SSE: subscription registered for userId=', String(userId));

    req.on('close', () => {
        removeSseClient(String(userId), res);
    });
});

// Debug endpoint to list current SSE subscribers (for troubleshooting)
app.get('/debug-sse-clients', (req, res) => {
    try {
        const info = {};
        for (const [userId, set] of sseClients.entries()) {
            info[userId] = set.size;
        }
        res.json({ success: true, clients: info });
    } catch (err) {
        console.error('Debug SSE clients error:', err);
        res.status(500).json({ success: false, message: 'Failed to list SSE clients' });
    }
});

// Debug endpoint to send a manual notification to a given userId via SSE
app.post('/debug-send-notif', (req, res) => {
    try {
        const { userId, jobTitle, message } = req.body || {};
        if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });
        const notif = {
            type: 'Debug Notification',
            timestamp: new Date().toISOString(),
            jobTitle: jobTitle || 'N/A',
            message: message || 'Test message'
        };
        const sent = sendEventToUser(userId, notif);
        res.json({ success: sent, message: sent ? 'Notification sent' : 'No SSE connection found for this userId' });
    } catch (err) {
        console.error('Debug send notif error:', err);
        res.status(500).json({ success: false, message: 'Failed to send notification', error: err.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export for Vercel
module.exports = app;
