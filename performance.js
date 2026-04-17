/**
 * Performance Evaluation Routes - CRUD REST API
 */

const express = require('express');
const router = express.Router();
const { PerformanceModel } = require('../config/dbMySQL');
const { AuditService } = require('../config/dbMongo');

// GET ALL EVALUATIONS
router.get('/', async (req, res) => {
    try {
        const evaluations = await PerformanceModel.findAll();
        res.json({
            success: true,
            count: evaluations.length,
            data: evaluations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET EVALUATIONS BY EMPLOYEE
router.get('/employee/:employeeId', async (req, res) => {
    try {
        const evaluations = await PerformanceModel.findByEmployee(req.params.employeeId);
        res.json({
            success: true,
            count: evaluations.length,
            data: evaluations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// CREATE EVALUATION
router.post('/', async (req, res) => {
    try {
        const { employeeId, evaluatorId, evaluationDate, technicalRating, communicationRating, teamworkRating, initiativeRating, comments } = req.body;

        // Validate required fields
        if (!employeeId || !technicalRating || !communicationRating || !teamworkRating || !initiativeRating) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Validate ratings (1-5)
        const ratings = [technicalRating, communicationRating, teamworkRating, initiativeRating];
        if (ratings.some(r => r < 1 || r > 5)) {
            return res.status(400).json({
                success: false,
                error: 'Ratings must be between 1 and 5'
            });
        }

        const evaluation = await PerformanceModel.create(req.body);

        await AuditService.log(
            'CREATE',
            'Performance',
            evaluation.id,
            req.session?.userId || 0,
            req.session?.username || 'admin',
            { after: evaluation },
            req
        );

        res.status(201).json({
            success: true,
            message: 'Evaluation created successfully',
            data: evaluation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// DELETE EVALUATION
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await PerformanceModel.delete(req.params.id);
        if (deleted) {
            await AuditService.log(
                'DELETE',
                'Performance',
                req.params.id,
                req.session?.userId || 0,
                req.session?.username || 'admin',
                null,
                req
            );
            res.json({
                success: true,
                message: 'Evaluation deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Evaluation not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
