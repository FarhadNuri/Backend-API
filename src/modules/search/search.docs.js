/**
 * @openapi
 * /search/doctors:
 *   get:
 *     summary: Search verified doctors and chambers sorted by distance
 *     description: Core search feature. Resolves coordinates via GPS (lat/lng), area name, or saved user profile. Public endpoint that accepts an optional bearer token to use saved user coordinates.
 *     tags:
 *       - Search
 *     security:
 *       - {}
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: disease
 *         schema:
 *           type: string
 *         description: Disease name or alias (e.g. "skin allergy", "itching")
 *         example: skin allergy
 *       - in: query
 *         name: specialtyId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Direct specialty UUID filter (overrides disease specialty)
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Case-insensitive partial match on doctor name
 *         example: Demo
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Search origin latitude (must be sent together with lng)
 *         example: 22.3594
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Search origin longitude (must be sent together with lat)
 *         example: 91.8213
 *       - in: query
 *         name: area
 *         schema:
 *           type: string
 *         description: Area name in Chattogram (e.g. "GEC Circle", "Agrabad")
 *         example: GEC Circle
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: City name
 *         example: Chattogram
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5
 *           minimum: 0.5
 *           maximum: 50
 *         description: Maximum search radius in kilometers (default 5 km, max 50 km)
 *         example: 5
 *       - in: query
 *         name: maxFee
 *         schema:
 *           type: integer
 *         description: Maximum chamber visiting fee
 *         example: 1000
 *       - in: query
 *         name: day
 *         schema:
 *           type: string
 *           enum: [SAT, SUN, MON, TUE, WED, THU, FRI]
 *         description: Filter chambers open on this weekday
 *         example: SAT
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *         description: Maximum items per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Doctors fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             examples:
 *               diseaseSearch:
 *                 summary: Example 1 - Disease and location search
 *                 value:
 *                   success: true
 *                   statusCode: 200
 *                   message: Doctors fetched successfully
 *                   data:
 *                     - doctorId: 696ff305-58b1-44f7-9c40-1526b17d50c1
 *                       name: Dr. Demo Verified
 *                       specialty: Dermatologist
 *                       degrees: ["MBBS", "FCPS (Dermatology)"]
 *                       experienceYears: 8
 *                       distanceKm: 0.2
 *                       chamber:
 *                         id: 6988b167-3616-4c6a-b38d-541c5fd1634c
 *                         name: Popular Diagnostic Centre, GEC
 *                         address: O.R. Nizam Road, GEC Circle
 *                         area: GEC Circle
 *                         city: Chattogram
 *                         lat: 22.3594
 *                         lng: 91.8213
 *                         phone: "01811000001"
 *                         fee: 1000
 *                         schedules:
 *                           - id: 55074061-efa8-45ab-8c72-7f92aa3cd8c8
 *                             day: SAT
 *                             startTime: "17:00"
 *                             endTime: "21:00"
 *                   meta:
 *                     page: 1
 *                     limit: 10
 *                     total: 1
 *                     matchedDisease:
 *                       id: 7e931bef-d515-485d-bd99-dc7da9eec1d0
 *                       name: Skin Allergy
 *                       specialty: Dermatologist
 *               nameAndFeeSearch:
 *                 summary: Example 2 - Name, area and fee filter
 *                 value:
 *                   success: true
 *                   statusCode: 200
 *                   message: Doctors fetched successfully
 *                   data:
 *                     - doctorId: 696ff305-58b1-44f7-9c40-1526b17d50c1
 *                       name: Dr. Demo Verified
 *                       specialty: Dermatologist
 *                       degrees: ["MBBS", "FCPS (Dermatology)"]
 *                       experienceYears: 8
 *                       distanceKm: 0.0
 *                       chamber:
 *                         id: 6988b167-3616-4c6a-b38d-541c5fd1634c
 *                         name: Popular Diagnostic Centre, GEC
 *                         address: O.R. Nizam Road, GEC Circle
 *                         area: GEC Circle
 *                         city: Chattogram
 *                         lat: 22.3594
 *                         lng: 91.8213
 *                         phone: "01811000001"
 *                         fee: 1000
 *                         schedules: []
 *                   meta:
 *                     page: 1
 *                     limit: 10
 *                     total: 1
 *       400:
 *         description: Validation failed (missing location, radius > 50, lat without lng)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Area not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
