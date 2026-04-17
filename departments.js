/**
 * Department Routes - CRUD REST API
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { DepartmentModel } = require('../config/dbMySQL');
const { AuditService } = require('../config/dbMongo');

// GET ALL DEPARTMENTS
router.get('/', async (req, res) => {
    try {
        const departments = await DepartmentModel.findAll();
        res.json({
            success: true,
            count: departments.length,
            data: departments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET SINGLE DEPARTMENT
router.get('/:id', async (req, res) => {
    try {
        const department = await DepartmentModel.findById(req.params.id);
        if (!department) {
            return res.status(404).json({
                success: false,
                error: 'Department not found'
            });
        }
        res.json({
            success: true,
            data: department
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// CREATE DEPARTMENT
router.post('/', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('code').trim().notEmpty().withMessage('Code is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const department = await DepartmentModel.create(req.body);

        await AuditService.log(
            'CREATE',
            'Department',
            department.id,
            req.session?.userId || 0,
            req.session?.username || 'admin',
            { after: department },
            req
        );

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: department
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// UPDATE DEPARTMENT
router.put('/:id', async (req, res) => {
    try {
        const department = await DepartmentModel.update(req.params.id, req.body);
        if (!department) {
            return res.status(404).json({
                success: false,
                error: 'Department not found'
            });
        }
        res.json({
            success: true,
            message: 'Department updated successfully',
            data: department
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// DELETE DEPARTMENT
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await DepartmentModel.delete(req.params.id);
        if (deleted) {
            await AuditService.log(
                'DELETE',
                'Department',
                req.params.id,
                req.session?.userId || 0,
                req.session?.username || 'admin',
                null,
                req
            );
            res.json({
                success: true,
                message: 'Department deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Department not found'
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
