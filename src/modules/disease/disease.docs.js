/**
 * @openapi
 * /diseases:
 *   get:
 *     summary: Autocomplete diseases by name or aliases
 *     tags:
 *       - Disease
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         description: Search query matched against disease names and aliases (minimum 2 characters)
 *         schema:
 *           type: string
 *           minLength: 2
 *         example: skin
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Maximum number of diseases to return (1 to 20, default 10)
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 20
 *         example: 10
 *     responses:
 *       200:
 *         description: Diseases fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: Diseases fetched successfully
 *               data:
 *                 - id: 550e8400-e29b-41d4-a716-446655440000
 *                   name: Skin Allergy
 *                   specialty:
 *                     id: 6f8e7b3c-912f-4c91-9e8c-8f479a32c10a
 *                     name: Dermatologist
 *                 - id: a47b2c9a-115f-402a-92b1-56c601e3b52a
 *                   name: Skin Rash
 *                   specialty:
 *                     id: 6f8e7b3c-912f-4c91-9e8c-8f479a32c10a
 *                     name: Dermatologist
 *       400:
 *         description: Validation failed (missing or too short query)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /specialties:
 *   get:
 *     summary: Fetch all medical specialties
 *     tags:
 *       - Disease
 *     responses:
 *       200:
 *         description: Specialties fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: Specialties fetched successfully
 *               data:
 *                 - id: 6f8e7b3c-912f-4c91-9e8c-8f479a32c10a
 *                   name: Cardiologist
 *                 - id: 550e8400-e29b-41d4-a716-446655440000
 *                   name: Dermatologist
 */

