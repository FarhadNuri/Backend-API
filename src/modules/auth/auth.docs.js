/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new patient (user signup)
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Farhad Nuri
 *               email:
 *                 type: string
 *                 format: email
 *                 example: farhad@example.com
 *               phone:
 *                 type: string
 *                 example: "01712345678"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password@123
 *               city:
 *                 type: string
 *                 example: Chattogram
 *               area:
 *                 type: string
 *                 example: GEC
 *               lat:
 *                 type: number
 *                 example: 22.3594
 *               lng:
 *                 type: number
 *                 example: 91.8213
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               statusCode: 201
 *               message: User registered successfully
 *               data:
 *                 user:
 *                   id: 6f8e7b3c-912f-4c91-9e8c-8f479a32c10a
 *                   name: Farhad Nuri
 *                   email: farhad@example.com
 *                   phone: "01712345678"
 *                   role: USER
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Validation failed (missing required fields, bad formats, or mismatched lat/lng)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email or phone already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /auth/register/doctor:
 *   post:
 *     summary: Register a new doctor (pending admin verification)
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *               - bmdcNumber
 *               - specialtyId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dr. Rahim Uddin
 *               email:
 *                 type: string
 *                 format: email
 *                 example: rahim@example.com
 *               phone:
 *                 type: string
 *                 example: "01712345678"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password@123
 *               bmdcNumber:
 *                 type: string
 *                 example: A-12345
 *               specialtyId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       201:
 *         description: Doctor registered. Waiting for admin approval
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               statusCode: 201
 *               message: Doctor registered. Waiting for admin approval
 *               data:
 *                 user:
 *                   id: 6f8e7b3c-912f-4c91-9e8c-8f479a32c10a
 *                   name: Dr. Rahim Uddin
 *                   email: rahim@example.com
 *                   role: DOCTOR
 *                 doctor:
 *                   id: e47b2c9a-115f-402a-92b1-56c601e3b52a
 *                   bmdcNumber: A-12345
 *                   status: PENDING
 *                   specialty:
 *                     id: 550e8400-e29b-41d4-a716-446655440000
 *                     name: Dermatologist
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Specialty not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email, phone, or BMDC number already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: farhad@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: Login successful
 *               data:
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   id: 6f8e7b3c-912f-4c91-9e8c-8f479a32c10a
 *                   name: Farhad Nuri
 *                   email: farhad@example.com
 *                   role: USER
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Account is deactivated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

