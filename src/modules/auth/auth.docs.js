/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new patient (user signup)
 *     description: Creates a user account with role USER and optional initial location profile.
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
 *           example:
 *             name: Farhad Nuri
 *             email: farhad@example.com
 *             phone: "01712345678"
 *             password: Password@123
 *             city: Chattogram
 *             area: GEC
 *             lat: 22.3594
 *             lng: 91.8213
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
 *     description: Registers a new doctor account with role DOCTOR and status PENDING. Doctor must be approved by admin before appearing in search results.
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
 *           example:
 *             name: Dr. Rahim Uddin
 *             email: rahim@example.com
 *             phone: "01712345678"
 *             password: Password@123
 *             bmdcNumber: A-12345
 *             specialtyId: 550e8400-e29b-41d4-a716-446655440000
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
 *     description: Authenticates any registered user (patient, doctor, or admin) and returns a signed JWT. Use the example dropdown to quickly try seeded demo accounts.
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
 *               password:
 *                 type: string
 *                 format: password
 *           examples:
 *             demoUser:
 *               summary: Demo User (Patient)
 *               value:
 *                 email: user@demo.com
 *                 password: User@12345
 *             demoDoctor:
 *               summary: Demo Doctor (Verified Dermatologist)
 *               value:
 *                 email: doctor@demo.com
 *                 password: Doctor@12345
 *             demoPendingDoctor:
 *               summary: Demo Pending Doctor (Waiting Approval)
 *               value:
 *                 email: pending@demo.com
 *                 password: Doctor@12345
 *             demoAdmin:
 *               summary: Demo System Admin
 *               value:
 *                 email: admin@daktarkothay.com
 *                 password: Admin@12345
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
 *                   name: Demo User
 *                   email: user@demo.com
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
