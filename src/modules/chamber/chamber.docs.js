/**
 * @openapi
 * /doctors/me/chambers:
 *   get:
 *     summary: List all chambers with schedules for the logged-in doctor
 *     tags:
 *       - Chamber
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chambers fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: Chambers fetched successfully
 *               data:
 *                 - id: a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d
 *                   name: City Care Chamber
 *                   address: GEC Circle, Chattogram
 *                   city: Chattogram
 *                   area: GEC
 *                   lat: 22.3594
 *                   lng: 91.8213
 *                   phone: "01812345678"
 *                   fee: 800
 *                   isActive: true
 *                   schedules:
 *                     - id: f1e2d3c4-b5a6-4978-8765-4321fedcba09
 *                       day: SAT
 *                       startTime: "17:00"
 *                       endTime: "21:00"
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (role is not DOCTOR)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   post:
 *     summary: Add a new chamber with visiting schedules
 *     tags:
 *       - Chamber
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
 *               - address
 *               - city
 *               - area
 *               - lat
 *               - lng
 *               - fee
 *               - schedules
 *             properties:
 *               name:
 *                 type: string
 *                 example: City Care Chamber
 *               address:
 *                 type: string
 *                 example: GEC Circle, Chattogram
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
 *               phone:
 *                 type: string
 *                 example: "01812345678"
 *               fee:
 *                 type: integer
 *                 example: 800
 *               schedules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - day
 *                     - startTime
 *                     - endTime
 *                   properties:
 *                     day:
 *                       type: string
 *                       enum: [SAT, SUN, MON, TUE, WED, THU, FRI]
 *                       example: SAT
 *                     startTime:
 *                       type: string
 *                       example: "17:00"
 *                     endTime:
 *                       type: string
 *                       example: "21:00"
 *           example:
 *             name: City Care Chamber
 *             address: GEC Circle, Chattogram
 *             city: Chattogram
 *             area: GEC
 *             lat: 22.3594
 *             lng: 91.8213
 *             phone: "01812345678"
 *             fee: 800
 *             schedules:
 *               - day: SAT
 *                 startTime: "17:00"
 *                 endTime: "21:00"
 *               - day: MON
 *                 startTime: "17:00"
 *                 endTime: "21:00"
 *     responses:
 *       201:
 *         description: Chamber created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               statusCode: 201
 *               message: Chamber created successfully
 *               data:
 *                 id: a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d
 *                 name: City Care Chamber
 *                 fee: 800
 *                 isActive: true
 *                 schedules:
 *                   - id: f1e2d3c4-b5a6-4978-8765-4321fedcba09
 *                     day: SAT
 *                     startTime: "17:00"
 *                     endTime: "21:00"
 *       400:
 *         description: Validation failed (invalid time, duplicate weekday, bad coordinates)
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
 *         description: Forbidden (role is not DOCTOR)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Doctor profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /doctors/me/chambers/{chamberId}:
 *   patch:
 *     summary: Update own chamber details (replaces all schedules if provided)
 *     tags:
 *       - Chamber
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chamberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fee:
 *                 type: integer
 *                 example: 1000
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               schedules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                       enum: [SAT, SUN, MON, TUE, WED, THU, FRI]
 *                     startTime:
 *                       type: string
 *                     endTime:
 *                       type: string
 *           example:
 *             fee: 1000
 *             isActive: true
 *             schedules:
 *               - day: SUN
 *                 startTime: "16:00"
 *                 endTime: "20:00"
 *     responses:
 *       200:
 *         description: Chamber updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: Chamber updated successfully
 *               data:
 *                 id: a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d
 *                 fee: 1000
 *                 isActive: true
 *                 schedules:
 *                   - id: f1e2d3c4-b5a6-4978-8765-4321fedcba09
 *                     day: SUN
 *                     startTime: "16:00"
 *                     endTime: "20:00"
 *       400:
 *         description: Validation failed
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
 *         description: Forbidden (not your chamber)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Chamber not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   delete:
 *     summary: Delete own chamber and all associated schedules
 *     tags:
 *       - Chamber
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chamberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d
 *     responses:
 *       200:
 *         description: Chamber deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: Chamber deleted successfully
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (not your chamber)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Chamber not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

