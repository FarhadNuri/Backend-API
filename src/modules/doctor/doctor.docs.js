/**
 * @openapi
 * /doctors/me:
 *   get:
 *     summary: View own doctor profile, chambers, and completion status
 *     description: Returns the authenticated doctor's profile, qualifications, all chambers (active and inactive), and profile completion status.
 *     tags:
 *       - Doctor
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: Doctor profile fetched successfully
 *               data:
 *                 id: e47b2c9a-115f-402a-92b1-56c601e3b52a
 *                 name: Dr. Demo Verified
 *                 email: doctor@demo.com
 *                 phone: "01711000001"
 *                 bmdcNumber: A-99991
 *                 specialty:
 *                   id: 550e8400-e29b-41d4-a716-446655440000
 *                   name: Dermatologist
 *                 degrees:
 *                   - MBBS
 *                   - FCPS (Dermatology)
 *                 experienceYears: 8
 *                 bio: Experienced Dermatologist providing comprehensive skin care and allergy treatment.
 *                 status: VERIFIED
 *                 chambers:
 *                   - id: a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d
 *                     name: Popular Diagnostic Centre, GEC
 *                     address: O.R. Nizam Road, GEC Circle
 *                     city: Chattogram
 *                     area: GEC Circle
 *                     lat: 22.3594
 *                     lng: 91.8213
 *                     phone: "01811000001"
 *                     fee: 1000
 *                     isActive: true
 *                     schedules:
 *                       - id: f1e2d3c4-b5a6-4978-8765-4321fedcba09
 *                         day: SAT
 *                         startTime: "17:00"
 *                         endTime: "21:00"
 *                 completion:
 *                   hasBio: true
 *                   hasDegrees: true
 *                   hasChamber: true
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
 *   patch:
 *     summary: Update own doctor profile
 *     description: Updates bio, degrees, years of experience, or specialty for the logged-in doctor. At least one field is required.
 *     tags:
 *       - Doctor
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dr. Demo Verified
 *               phone:
 *                 type: string
 *                 example: "01711000001"
 *               specialtyId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               degrees:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["MBBS", "FCPS (Dermatology)"]
 *               experienceYears:
 *                 type: integer
 *                 example: 9
 *               bio:
 *                 type: string
 *                 example: Updated bio with expanded clinic consultation details.
 *           example:
 *             degrees: ["MBBS", "FCPS (Dermatology)"]
 *             experienceYears: 9
 *             bio: Updated bio with expanded clinic consultation details.
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: Profile updated successfully
 *               data:
 *                 id: e47b2c9a-115f-402a-92b1-56c601e3b52a
 *                 name: Dr. Demo Verified
 *                 specialty:
 *                   id: 550e8400-e29b-41d4-a716-446655440000
 *                   name: Dermatologist
 *                 degrees:
 *                   - MBBS
 *                   - FCPS (Dermatology)
 *                 experienceYears: 9
 *                 bio: Updated bio with expanded clinic consultation details.
 *                 status: VERIFIED
 *       400:
 *         description: Validation failed or empty body
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
 *         description: Specialty or doctor profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Phone number already used
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /doctors/{id}:
 *   get:
 *     summary: View public details and active chambers of a verified doctor
 *     description: Public endpoint returning verified doctor profile info and active visiting chambers with schedules. Only returns doctors who have been verified by an admin.
 *     tags:
 *       - Doctor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Doctor UUID
 *         schema:
 *           type: string
 *           format: uuid
 *         example: e47b2c9a-115f-402a-92b1-56c601e3b52a
 *     responses:
 *       200:
 *         description: Doctor fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: Doctor fetched successfully
 *               data:
 *                 id: e47b2c9a-115f-402a-92b1-56c601e3b52a
 *                 name: Dr. Demo Verified
 *                 specialty:
 *                   id: 550e8400-e29b-41d4-a716-446655440000
 *                   name: Dermatologist
 *                 degrees:
 *                   - MBBS
 *                   - FCPS (Dermatology)
 *                 experienceYears: 8
 *                 bio: Experienced Dermatologist providing comprehensive skin care and allergy treatment.
 *                 chambers:
 *                   - id: a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d
 *                     name: Popular Diagnostic Centre, GEC
 *                     address: O.R. Nizam Road, GEC Circle
 *                     area: GEC Circle
 *                     city: Chattogram
 *                     lat: 22.3594
 *                     lng: 91.8213
 *                     phone: "01811000001"
 *                     fee: 1000
 *                     isActive: true
 *                     schedules:
 *                       - id: f1e2d3c4-b5a6-4978-8765-4321fedcba09
 *                         day: SAT
 *                         startTime: "17:00"
 *                         endTime: "21:00"
 *       400:
 *         description: Invalid UUID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Doctor not found or not verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
