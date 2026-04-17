/**
 * Audit Log Routes - MongoDB
 *
 * Demonstrates MongoDB usage for storing audit trails
 * Query audit logs by entity, user, or time range
 */

const express = require('express');
const router = express.Router();
const { AuditService } = require('../config/dbMongo');

// GET ALL AUDIT LOGS (with pagination)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const entity = req.query.entity || null;

        const result = await AuditService.getLogs(page, limit, entity);

        res.json({
            success: true,
            data: result.logs,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                pages: result.pages
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET AUDIT LOGS BY ENTITY
router.get('/entity/:entityId', async (req, res) => {
    try {
        const history = await AuditService.getEntityHistory(req.params.entityId);
        res.json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET AUDIT LOGS BY USER
router.get('/user/:userId', async (req, res) => {
    try {
        const { AuditLog } = require('../config/dbMongo');
        const logs = await AuditLog.find({ userId: parseInt(req.params.userId) })
            .sort({ timestamp: -1 })
            .limit(100);

        res.json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET RECENT AUDIT LOGS
router.get('/recent/:limit?', async (req, res) => {
    try {
        const limit = parseInt(req.params.limit) || 20;
        const { AuditLog } = require('../config/dbMongo');
        const logs = await AuditLog.find()
            .sort({ timestamp: -1 })
            .limit(limit);

        res.json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
