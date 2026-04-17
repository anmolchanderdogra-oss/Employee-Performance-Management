/**
 * Employee Routes - CRUD REST API
 *
 * Demonstrates NodeJS CRUD operations with MongoDB and MySQL:
 * - GET    /api/employees        - List all employees
 * - GET    /api/employees/:id    - Get single employee
 * - POST   /api/employees        - Create employee
 * - PUT    /api/employees/:id    - Update employee
 * - DELETE /api/employees/:id    - Delete employee
 * - GET    /api/employees/search - Search employees
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { EmployeeModel } = require('../config/dbMySQL');
const { AuditService } = require('../config/dbMongo');

// ================================================
// VALIDATION MIDDLEWARE
// ================================================

const employeeValidation = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
    body('email')
        .trim()
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('phone')
        .optional()
        .matches(/^[+]?[0-9]{10,15}$/).withMessage('Invalid phone number'),
    body('dateOfJoining')
        .notEmpty().withMessage('Date of joining is required')
];

// ================================================
// GET ALL EMPLOYEES
// ================================================

router.get('/', async (req, res) => {
    try {
        const employees = await EmployeeModel.findAll();

        // Log the view action to MongoDB audit
        await AuditService.log(
            'VIEW',
            'Employee',
            'all',
            req.session?.userId || 0,
            req.session?.username || 'anonymous',
            null,
            req
        );

        res.json({
            success: true,
            count: employees.length,
            data: employees
        });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch employees',
            message: error.message
        });
    }
});

// ================================================
// GET SINGLE EMPLOYEE
// ================================================

router.get('/:id', async (req, res) => {
    try {
        const employee = await EmployeeModel.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                error: 'Employee not found'
            });
        }

        res.json({
            success: true,
            data: employee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ================================================
// SEARCH EMPLOYEES
// ================================================

router.get('/search/:query', async (req, res) => {
    try {
        const employees = await EmployeeModel.search(req.params.query);

        res.json({
            success: true,
            count: employees.length,
            query: req.params.query,
            data: employees
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ================================================
// CREATE EMPLOYEE (CRUD - CREATE)
// ================================================

router.post('/', employeeValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const employee = await EmployeeModel.create(req.body);

        // Log to MongoDB audit
        await AuditService.log(
            'CREATE',
            'Employee',
            employee.id,
            req.session?.userId || 0,
            req.session?.username || 'admin',
            { after: employee },
            req
        );

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: employee
        });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create employee',
            message: error.message
        });
    }
});

// ================================================
// UPDATE EMPLOYEE (CRUD - UPDATE)
// ================================================

router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // Get current employee for audit
        const oldEmployee = await EmployeeModel.findById(id);
        if (!oldEmployee) {
            return res.status(404).json({
                success: false,
                error: 'Employee not found'
            });
        }

        const updatedEmployee = await EmployeeModel.update(id, req.body);

        // Log to MongoDB audit
        await AuditService.log(
            'UPDATE',
            'Employee',
            id,
            req.session?.userId || 0,
            req.session?.username || 'admin',
            { before: oldEmployee, after: updatedEmployee },
            req
        );

        res.json({
            success: true,
            message: 'Employee updated successfully',
            data: updatedEmployee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ================================================
// DELETE EMPLOYEE (CRUD - DELETE)
// ================================================

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // Get employee for audit before deleting
        const employee = await EmployeeModel.findById(id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                error: 'Employee not found'
            });
        }

        const deleted = await EmployeeModel.delete(id);

        if (deleted) {
            // Log to MongoDB audit
            await AuditService.log(
                'DELETE',
                'Employee',
                id,
                req.session?.userId || 0,
                req.session?.username || 'admin',
                { before: employee },
                req
            );

            res.json({
                success: true,
                message: 'Employee deleted successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to delete employee'
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
