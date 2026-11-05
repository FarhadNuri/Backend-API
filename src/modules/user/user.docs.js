/**
 * @openapi
 * /users/me:
 *   get:
 *     summary: View own user profile and saved location
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: Profile fetched successfully
 *               data:
 *                 id: 6f8e7b3c-912f-4c91-9e8c-8f479a32c10a
 *                 name: Farhad Nuri
 *                 email: farhad@example.com
 *                 phone: "01712345678"
 *                 role: USER
 *                 createdAt: "2026-11-04T10:00:00.000Z"
 *                 profile:
 *                   city: Chattogram
 *                   area: GEC
 *                   lat: 22.3594
 *                   lng: 91.8213
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (role is not USER)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /users/me/location:
 *   patch:
 *     summary: Update or save own user location
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lat
 *               - lng
 *             properties:
 *               lat:
 *                 type: number
 *                 description: Latitude between -90 and 90
 *                 example: 22.3594
 *               lng:
 *                 type: number
 *                 description: Longitude between -180 and 180
 *                 example: 91.8213
 *               city:
 *                 type: string
 *                 example: Chattogram
 *               area:
 *                 type: string
 *                 example: GEC
 *     responses:
 *       200:
 *         description: Location updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: Location updated successfully
 *               data:
 *                 city: Chattogram
 *                 area: GEC
 *                 lat: 22.3594
 *                 lng: 91.8213
 *       400:
 *         description: Validation failed (invalid coordinates or types)
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
 *         description: Forbidden (role is not USER)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

