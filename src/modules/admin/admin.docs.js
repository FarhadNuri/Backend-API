/**
 * @openapi
 * /admin/doctors:
 *   get:
 *     summary: List doctors filtered by approval status
 *     description: Administrative endpoint to list doctors by their status (PENDING, VERIFIED, REJECTED), ordered newest first, with their chamber count.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, VERIFIED, REJECTED]
 *           default: PENDING
 *         description: Doctor approval status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page (max 50)
 *     responses:
 *       200:
 *         description: Doctors fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: Doctors fetched successfully
 *               data:
 *                 - id: 550e8400-e29b-41d4-a716-446655440000
 *                   name: Dr. Demo Pending
 *                   email: pending@demo.com
 *                   phone: "01711000002"
 *                   bmdcNumber: A-99992
 *                   specialty:
 *                     id: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
 *                     name: Dermatologist
 *                   status: PENDING
 *                   chamberCount: 0
 *                   createdAt: "2026-11-04T10:00:00.000Z"
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 1
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   post:
 *     summary: Add a verified doctor directly with optional chambers and schedules
 *     description: Administrative endpoint to onboard a doctor directly with VERIFIED status and initial chambers in a single transaction.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
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
 *               - tempPassword
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
 *               tempPassword:
 *                 type: string
 *                 example: Doctor@123
 *               bmdcNumber:
 *                 type: string
 *                 example: A-12345
 *               specialtyId:
 *                 type: string
 *                 format: uuid
 *                 example: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
 *               degrees:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["MBBS", "FCPS"]
 *               experienceYears:
 *                 type: integer
 *                 example: 8
 *               bio:
 *                 type: string
 *                 example: Skin specialist with 8 years of experience.
 *               chambers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - address
 *                     - city
 *                     - area
 *                     - lat
 *                     - lng
 *                     - fee
 *                     - schedules
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: City Care Chamber
 *                     address:
 *                       type: string
 *                       example: GEC Circle, Chattogram
 *                     city:
 *                       type: string
 *                       example: Chattogram
 *                     area:
 *                       type: string
 *                       example: GEC
 *                     lat:
 *                       type: number
 *                       example: 22.3594
 *                     lng:
 *                       type: number
 *                       example: 91.8213
 *                     phone:
 *                       type: string
 *                       example: "01812345678"
 *                     fee:
 *                       type: integer
 *                       example: 800
 *                     schedules:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required:
 *                           - day
 *                           - startTime
 *                           - endTime
 *                         properties:
 *                           day:
 *                             type: string
 *                             enum: [SAT, SUN, MON, TUE, WED, THU, FRI]
 *                             example: SAT
 *                           startTime:
 *                             type: string
 *                             example: "17:00"
 *                           endTime:
 *                             type: string
 *                             example: "21:00"
 *           example:
 *             name: Dr. Rahim Uddin
 *             email: rahim@example.com
 *             phone: "01712345678"
 *             tempPassword: Doctor@123
 *             bmdcNumber: A-12345
 *             specialtyId: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
 *             degrees: ["MBBS", "FCPS"]
 *             experienceYears: 8
 *             bio: Skin specialist with 8 years of experience.
 *             chambers:
 *               - name: City Care Chamber
 *                 address: GEC Circle, Chattogram
 *                 city: Chattogram
 *                 area: GEC
 *                 lat: 22.3594
 *                 lng: 91.8213
 *                 phone: "01812345678"
 *                 fee: 800
 *                 schedules:
 *                   - day: SAT
 *                     startTime: "17:00"
 *                     endTime: "21:00"
 *     responses:
 *       201:
 *         description: Doctor added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               statusCode: 201
 *               message: Doctor added successfully
 *               data:
 *                 id: 550e8400-e29b-41d4-a716-446655440000
 *                 name: Dr. Rahim Uddin
 *                 email: rahim@example.com
 *                 bmdcNumber: A-12345
 *                 specialty:
 *                   id: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
 *                   name: Dermatologist
 *                 status: VERIFIED
 *                 chambers: []
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
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
 *         description: Email, phone, or BMDC number already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /admin/doctors/{id}/approve:
 *   patch:
 *     summary: Approve a pending doctor
 *     description: Administrative endpoint to verify a pending doctor. Sets their status to VERIFIED so they can appear in search once they have active chambers.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor UUID
 *     responses:
 *       200:
 *         description: Doctor approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: Doctor approved successfully
 *               data:
 *                 id: 550e8400-e29b-41d4-a716-446655440000
 *                 name: Dr. Rahim Uddin
 *                 status: VERIFIED
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Doctor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Doctor is already verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /admin/doctors/{id}/reject:
 *   patch:
 *     summary: Reject a doctor
 *     description: Administrative endpoint to reject a doctor. Sets status to REJECTED, immediately hiding them from public search and doctor details.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor UUID
 *     responses:
 *       200:
 *         description: Doctor rejected
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: Doctor rejected
 *               data:
 *                 id: 550e8400-e29b-41d4-a716-446655440000
 *                 name: Dr. Rahim Uddin
 *                 status: REJECTED
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Doctor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Doctor is already rejected
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
