-- ================================================
-- EmployeeLC Database Setup Script
-- MySQL 8.0
-- ================================================

CREATE DATABASE IF NOT EXISTS employeelc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE employeelc;

CREATE TABLE IF NOT EXISTS departments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    head_id BIGINT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_dept_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employees (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_code VARCHAR(20) UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    date_of_joining DATE NOT NULL,
    department_id BIGINT,
    designation VARCHAR(100),
    manager_id BIGINT,
    status ENUM('ACTIVE', 'ON_LEAVE', 'TERMINATED', 'RETIRED') DEFAULT 'ACTIVE',
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_emp_code (employee_code),
    INDEX idx_emp_email (email),
    INDEX idx_emp_dept (department_id),
    INDEX idx_emp_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE departments ADD CONSTRAINT fk_dept_head FOREIGN KEY (head_id) REFERENCES employees(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS performance_evaluations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    evaluator_id BIGINT,
    evaluation_date DATE NOT NULL,
    technical_rating INT NOT NULL CHECK (technical_rating BETWEEN 1 AND 5),
    communication_rating INT NOT NULL CHECK (communication_rating BETWEEN 1 AND 5),
    teamwork_rating INT NOT NULL CHECK (teamwork_rating BETWEEN 1 AND 5),
    initiative_rating INT NOT NULL CHECK (initiative_rating BETWEEN 1 AND 5),
    overall_rating DECIMAL(3, 2),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluator_id) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_perf_emp (employee_id),
    INDEX idx_perf_date (evaluation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================
-- ATTENDANCE TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('PRESENT', 'ABSENT', 'LEAVE') NOT NULL,
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY uk_attendance (employee_id, attendance_date),
    INDEX idx_att_date (attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================
-- USERS TABLE (for authentication)
-- ================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    employee_id BIGINT,
    role ENUM('ADMIN', 'HR_MANAGER', 'DEPT_HEAD', 'EMPLOYEE') DEFAULT 'EMPLOYEE',
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_user_username (username),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================
-- INSERT SAMPLE DATA
-- ================================================

-- Insert departments
INSERT INTO departments (name, code, description) VALUES
('Engineering', 'ENG', 'Software Development and IT Operations'),
('Human Resources', 'HR', 'People Operations and Talent Management'),
('Marketing', 'MKT', 'Brand Management and Market Growth'),
('Finance', 'FIN', 'Financial Planning and Accounting'),
('Operations', 'OPS', 'Business Operations and Logistics');

-- Insert employees (sample data)
INSERT INTO employees (employee_code, first_name, last_name, email, phone, date_of_birth, date_of_joining, department_id, designation, status) VALUES
('EMP00001', 'Paras', 'Sharma', 'paras.sharma@company.com', '+91234567890', '1985-03-15', '2020-01-15', 1, 'Senior Software Engineer', 'Terminated'),
('EMP00002', 'Sherya', 'Kapoor', 'sherya.kapoor@company.com', '+91234567891', '1988-07-22', '2019-06-01', 1, 'Tech Lead', 'ACTIVE'),
('EMP00003', 'Krish', 'Khan', 'krish.khan@company.com', '+91234567892', '1990-11-30', '2021-03-10', 2, 'HR Manager', 'ACTIVE'),
('EMP00004', 'Purnima', 'Aggarwal', 'purnima.aggarwal@company.com', '+91234567893', '1992-05-18', '2020-09-01', 3, 'Marketing Director', 'ACTIVE'),
('EMP00005', 'Sahil', 'Sagar', 'sahil.sagar@company.com', '+91234567894', '1987-09-25', '2018-04-15', 4, 'Finance Manager', 'ACTIVE'),
('EMP00006', 'Aditi', 'Arora', 'aditi.arora@company.com', '+91234567895', '1995-01-08', '2022-01-10', 1, 'Software Engineer', 'ACTIVE'),
('EMP00007', 'Priyanka', 'Pandey', 'priyanka.pandey@company.com', '+91234567896', '1991-12-03', '2021-07-20', 5, 'Operations Manager', 'ACTIVE'),
('EMP00008', 'Gaurav', 'Patara', 'gaurav.patara@company.com', '+91234567897', '1993-...'
UPDATE departments SET head_id = 7 WHERE code = 'OPS';

-- Set managers for employees
UPDATE employees SET manager_id = 2 WHERE employee_code = 'EMP00001';
UPDATE employees SET manager_id = 2 WHERE employee_code = 'EMP00006';
UPDATE employees SET manager_id = 3 WHERE employee_code = 'EMP00008';

-- Insert users (password is 'admin123' - hashed with bcrypt in production)
INSERT INTO users (username, password, employee_id, role) VALUES
('admin', 'admin123', NULL, 'ADMIN'),
('jsmith', 'admin123', 1, 'EMPLOYEE'),
('sjohnson', 'admin123', 2, 'DEPT_HEAD'),
('mwilliams', 'admin123', 3, 'HR_MANAGER');

-- Insert sample performance evaluations
INSERT INTO performance_evaluations (employee_id, evaluator_id, evaluation_date, technical_rating, communication_rating, teamwork_rating, initiative_rating, comments) VALUES
(1, 2, '2024-01-15', 5, 4, 5, 4, 'Excellent technical skills, great team player'),
(6, 2, '2024-01-15', 4, 4, 4, 5, 'Good performance, shows initiative'),
(8, 3, '2024-02-01', 4, 5, 5, 4, 'Currently on leave, good performance before leave');

-- Insert sample attendance
INSERT INTO attendance (employee_id, attendance_date, status) VALUES
(1, CURDATE(), 'PRESENT'),
(2, CURDATE(), 'PRESENT'),
(3, CURDATE(), 'PRESENT'),
(4, CURDATE(), 'PRESENT'),
(5, CURDATE(), 'PRESENT'),
(6, CURDATE(), 'PRESENT'),
(7, CURDATE(), 'PRESENT'),
(8, CURDATE(), 'LEAVE');

-- ================================================
-- VERIFICATION
-- ================================================
SELECT 'Database setup completed successfully!' AS status;
SELECT COUNT(*) AS department_count FROM departments;
SELECT COUNT(*) AS employee_count FROM employees;
SELECT COUNT(*) AS user_count FROM users;
