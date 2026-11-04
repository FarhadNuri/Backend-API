const bcrypt = require("bcrypt");
const { pool, withTransaction } = require("../config/db");
const { env } = require("../config/envConfig");

// 12 Specialties
const SPECIALTIES = [
  "Dermatologist",
  "Cardiologist",
  "Neurologist",
  "Orthopedic Surgeon",
  "Pediatrician",
  "Gynecologist",
  "ENT Specialist",
  "Eye Specialist",
  "Gastroenterologist",
  "Medicine Specialist",
  "Psychiatrist",
  "Urologist",
];

// About 30 diseases mapped to specialties with lowercase aliases
const DISEASES = [
  // Dermatologist
  { name: "Skin Allergy", specialty: "Dermatologist", aliases: ["rash", "itching", "allergy"] },
  { name: "Acne", specialty: "Dermatologist", aliases: ["pimple"] },
  { name: "Eczema", specialty: "Dermatologist", aliases: [] },
  { name: "Fungal Infection", specialty: "Dermatologist", aliases: ["ringworm"] },
  { name: "Hair Fall", specialty: "Dermatologist", aliases: ["hair loss"] },

  // Cardiologist
  { name: "Chest Pain", specialty: "Cardiologist", aliases: ["heart pain"] },
  { name: "High Blood Pressure", specialty: "Cardiologist", aliases: ["hypertension", "bp"] },
  { name: "Palpitations", specialty: "Cardiologist", aliases: ["fast heartbeat"] },

  // Neurologist
  { name: "Migraine", specialty: "Neurologist", aliases: ["headache"] },
  { name: "Epilepsy", specialty: "Neurologist", aliases: ["seizure"] },
  { name: "Stroke", specialty: "Neurologist", aliases: [] },

  // Orthopedic Surgeon
  { name: "Back Pain", specialty: "Orthopedic Surgeon", aliases: [] },
  { name: "Knee Pain", specialty: "Orthopedic Surgeon", aliases: ["joint pain"] },
  { name: "Fracture", specialty: "Orthopedic Surgeon", aliases: ["broken bone"] },

  // Pediatrician
  { name: "Child Fever", specialty: "Pediatrician", aliases: [] },
  { name: "Cough in Children", specialty: "Pediatrician", aliases: [] },

  // Gynecologist
  { name: "Pregnancy Care", specialty: "Gynecologist", aliases: [] },
  { name: "PCOS", specialty: "Gynecologist", aliases: ["irregular periods"] },

  // ENT Specialist
  { name: "Ear Infection", specialty: "ENT Specialist", aliases: ["earache"] },
  { name: "Sinusitis", specialty: "ENT Specialist", aliases: ["blocked nose"] },
  { name: "Tonsillitis", specialty: "ENT Specialist", aliases: ["sore throat"] },

  // Eye Specialist
  { name: "Cataract", specialty: "Eye Specialist", aliases: ["blurred vision"] },
  { name: "Eye Infection", specialty: "Eye Specialist", aliases: ["red eye"] },

  // Gastroenterologist
  { name: "Gastric Pain", specialty: "Gastroenterologist", aliases: ["acidity", "gastritis", "ulcer"] },
  { name: "Jaundice", specialty: "Gastroenterologist", aliases: [] },

  // Medicine Specialist
  { name: "Fever", specialty: "Medicine Specialist", aliases: ["flu", "viral fever"] },
  { name: "Diabetes", specialty: "Medicine Specialist", aliases: ["sugar"] },

  // Psychiatrist
  { name: "Depression", specialty: "Psychiatrist", aliases: ["anxiety", "stress"] },

  // Urologist
  { name: "Kidney Stone", specialty: "Urologist", aliases: [] },
  { name: "Urine Infection", specialty: "Urologist", aliases: ["uti"] },
];

// 12 Chattogram areas with approximate coordinates
const AREAS = [
  { name: "GEC Circle", city: "Chattogram", lat: 22.3594, lng: 91.8213 },
  { name: "Agrabad", city: "Chattogram", lat: 22.3242, lng: 91.8124 },
  { name: "Khulshi", city: "Chattogram", lat: 22.3688, lng: 91.8025 },
  { name: "Nasirabad", city: "Chattogram", lat: 22.3639, lng: 91.8239 },
  { name: "Panchlaish", city: "Chattogram", lat: 22.3654, lng: 91.8347 },
  { name: "Chawkbazar", city: "Chattogram", lat: 22.3547, lng: 91.8412 },
  { name: "Halishahar", city: "Chattogram", lat: 22.3211, lng: 91.7765 },
  { name: "Pahartali", city: "Chattogram", lat: 22.3582, lng: 91.7786 },
  { name: "Muradpur", city: "Chattogram", lat: 22.3685, lng: 91.8441 },
  { name: "Bayezid", city: "Chattogram", lat: 22.3892, lng: 91.8189 },
  { name: "Kotwali", city: "Chattogram", lat: 22.3364, lng: 91.8361 },
  { name: "Oxygen", city: "Chattogram", lat: 22.4047, lng: 91.8208 },
];

// Bangladeshi sample doctor names
const SAMPLE_NAMES = [
  "Dr. Mohammad Rahman", "Dr. Farhana Ahmed", "Dr. Tanvir Hasan", "Dr. Nusrat Jahan",
  "Dr. Shahriar Kabir", "Dr. Anika Tabassum", "Dr. Mahmudul Haque", "Dr. Sabina Yasmin",
  "Dr. Tariqul Islam", "Dr. Sadia Afrin", "Dr. Kamrul Ahsan", "Dr. Tasnim Ara",
  "Dr. Mizanur Chowdhury", "Dr. Rashedul Karim", "Dr. Shamima Nasrin", "Dr. Ariful Islam",
  "Dr. Mehedi Hasan", "Dr. Sharmin Akter", "Dr. Ashraful Alam", "Dr. Fahmida Sultana",
  "Dr. Ziaur Rahman", "Dr. Nazmul Huda", "Dr. Shirin Sultana", "Dr. Kazi Mostafa",
  "Dr. Dilruba Khanam", "Dr. Saiful Islam", "Dr. Nahid Parvez", "Dr. Salma Khatun",
  "Dr. Rezaul Karim", "Dr. Monirul Islam", "Dr. Rubina Parvin", "Dr. Asaduzzaman Nur",
  "Dr. Jahangir Alam", "Dr. Shamim Ara Begum", "Dr. Mustafizur Rahman", "Dr. Farzana Boby",
  "Dr. Habibur Rahman", "Dr. Shakila Parveen", "Dr. Emdadul Hoque", "Dr. Rokeya Begum",
];

const seed = async () => {
  console.log("Starting database seed...");

  // Hash passwords once upfront to keep the seed fast
  const adminPasswordHash = await bcrypt.hash(env.ADMIN_PASSWORD, env.BCRYPT_SALT_ROUNDS);
  const userPasswordHash = await bcrypt.hash("User@12345", env.BCRYPT_SALT_ROUNDS);
  const doctorPasswordHash = await bcrypt.hash("Doctor@12345", env.BCRYPT_SALT_ROUNDS);

  await withTransaction(async (client) => {
    // 1. Truncate all tables in one statement
    console.log("Clearing existing data...");
    await client.query(
      "TRUNCATE TABLE users, user_profiles, specialties, doctors, chambers, chamber_schedules, diseases, areas RESTART IDENTITY CASCADE;"
    );

    // 2. Insert Admin
    console.log("Creating admin account...");
    await client.query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, 'ADMIN')`,
      ["System Admin", env.ADMIN_EMAIL, "01700000001", adminPasswordHash]
    );

    // 3. Insert Demo User with saved location
    console.log("Creating demo user...");
    const demoUserRes = await client.query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, 'USER')
       RETURNING id`,
      ["Demo User", "user@demo.com", "01700000002", userPasswordHash]
    );
    const demoUserId = demoUserRes.rows[0].id;

    await client.query(
      `INSERT INTO user_profiles (user_id, city, area, lat, lng)
       VALUES ($1, $2, $3, $4, $5)`,
      [demoUserId, "Chattogram", "GEC Circle", 22.3594, 91.8213]
    );

    // 4. Insert 12 Specialties and keep a map of name -> id
    console.log("Inserting specialties...");
    const specialtyMap = {};
    for (const specName of SPECIALTIES) {
      const res = await client.query(
        `INSERT INTO specialties (name) VALUES ($1) RETURNING id, name`,
        [specName]
      );
      specialtyMap[res.rows[0].name] = res.rows[0].id;
    }

    // 5. Insert Diseases
    console.log("Inserting diseases...");
    for (const d of DISEASES) {
      const specialtyId = specialtyMap[d.specialty];
      await client.query(
        `INSERT INTO diseases (name, aliases, specialty_id) VALUES ($1, $2, $3)`,
        [d.name, d.aliases, specialtyId]
      );
    }

    // 6. Insert 12 Chattogram Areas
    console.log("Inserting areas...");
    for (const area of AREAS) {
      await client.query(
        `INSERT INTO areas (name, city, lat, lng) VALUES ($1, $2, $3, $4)`,
        [area.name, area.city, area.lat, area.lng]
      );
    }

    // 7. Insert Demo Verified Doctor (Dermatologist with 2 chambers)
    console.log("Creating demo verified doctor...");
    const demoVerifiedUserRes = await client.query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, 'DOCTOR')
       RETURNING id`,
      ["Dr. Demo Verified", "doctor@demo.com", "01711000001", doctorPasswordHash]
    );
    const demoVerifiedUserId = demoVerifiedUserRes.rows[0].id;
    const dermSpecialtyId = specialtyMap["Dermatologist"];

    const demoDocRes = await client.query(
      `INSERT INTO doctors (user_id, specialty_id, bmdc_number, degrees, experience_years, bio, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'VERIFIED')
       RETURNING id`,
      [
        demoVerifiedUserId,
        dermSpecialtyId,
        "A-99991",
        ["MBBS", "FCPS (Dermatology)"],
        8,
        "Experienced Dermatologist providing comprehensive skin care and allergy treatment.",
      ]
    );
    const demoDocId = demoDocRes.rows[0].id;

    // Chamber 1 for demo doctor
    const demoChamber1Res = await client.query(
      `INSERT INTO chambers (doctor_id, name, address, city, area, lat, lng, phone, fee)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        demoDocId,
        "Popular Diagnostic Centre, GEC",
        "O.R. Nizam Road, GEC Circle",
        "Chattogram",
        "GEC Circle",
        22.3594,
        91.8213,
        "01811000001",
        1000,
      ]
    );
    const demoChamber1Id = demoChamber1Res.rows[0].id;

    await client.query(
      `INSERT INTO chamber_schedules (chamber_id, day, start_time, end_time)
       VALUES ($1, 'SAT', '17:00', '21:00'),
              ($1, 'MON', '17:00', '21:00'),
              ($1, 'WED', '17:00', '21:00')`,
      [demoChamber1Id]
    );

    // Chamber 2 for demo doctor
    const demoChamber2Res = await client.query(
      `INSERT INTO chambers (doctor_id, name, address, city, area, lat, lng, phone, fee)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        demoDocId,
        "Chevron Clinical Laboratory, Panchlaish",
        "12/12 O.R. Nizam Road, Panchlaish",
        "Chattogram",
        "Panchlaish",
        22.3654,
        91.8347,
        "01811000002",
        1200,
      ]
    );
    const demoChamber2Id = demoChamber2Res.rows[0].id;

    await client.query(
      `INSERT INTO chamber_schedules (chamber_id, day, start_time, end_time)
       VALUES ($1, 'SUN', '18:00', '21:00'),
              ($1, 'TUE', '18:00', '21:00'),
              ($1, 'THU', '18:00', '21:00')`,
      [demoChamber2Id]
    );

    // 8. Insert Demo Pending Doctor (No chambers yet, for demoing admin approval)
    console.log("Creating demo pending doctor...");
    const demoPendingUserRes = await client.query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, 'DOCTOR')
       RETURNING id`,
      ["Dr. Demo Pending", "pending@demo.com", "01711000002", doctorPasswordHash]
    );
    const demoPendingUserId = demoPendingUserRes.rows[0].id;

    await client.query(
      `INSERT INTO doctors (user_id, specialty_id, bmdc_number, degrees, experience_years, bio, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')`,
      [
        demoPendingUserId,
        dermSpecialtyId,
        "A-99992",
        ["MBBS", "DDV"],
        3,
        "Junior dermatologist awaiting admin verification.",
      ]
    );

    // 9. Insert 40 sample doctors
    // Status breakdown: 34 VERIFIED, 5 PENDING, 1 REJECTED
    console.log("Creating 40 sample doctors with chambers and schedules...");
    const sampleChamberNames = [
      "Square Hospital Consultation Center",
      "Epic Health Care",
      "Metropolitan Hospital Chamber",
      "Mount Hospital",
      "Parkview Hospital Chamber",
      "CSCR Consultant Center",
      "Max Hospital & Diagnostic",
      "National Hospital Chamber",
    ];

    const weekdayOptions = [
      ["SAT", "MON", "WED"],
      ["SUN", "TUE", "THU"],
      ["SAT", "SUN", "TUE", "THU"],
      ["MON", "WED", "FRI"],
    ];

    for (let i = 0; i < 40; i++) {
      const doctorIndex = i + 1;
      const numStr = String(doctorIndex).padStart(2, "0");
      const email = `doctor${numStr}@sample.com`;
      const bmdcNumber = `A-100${numStr}`;
      const phone = `0172000${String(doctorIndex).padStart(4, "0")}`;
      const name = SAMPLE_NAMES[i] || `Dr. Sample Doctor ${numStr}`;

      // 34 VERIFIED, 5 PENDING, 1 REJECTED
      let status = "VERIFIED";
      if (i >= 34 && i < 39) {
        status = "PENDING";
      } else if (i === 39) {
        status = "REJECTED";
      }

      // Distribute across 12 specialties (2 to 5 per specialty)
      const specIndex = i % SPECIALTIES.length;
      const specialtyName = SPECIALTIES[specIndex];
      const specialtyId = specialtyMap[specialtyName];

      const userRes = await client.query(
        `INSERT INTO users (name, email, phone, password_hash, role)
         VALUES ($1, $2, $3, $4, 'DOCTOR')
         RETURNING id`,
        [name, email, phone, doctorPasswordHash]
      );
      const userId = userRes.rows[0].id;

      const experienceYears = 2 + (i % 20);
      const degrees = ["MBBS", `MD (${specialtyName})`];
      const bio = `${name} is a dedicated ${specialtyName} with ${experienceYears} years of medical experience.`;

      const docRes = await client.query(
        `INSERT INTO doctors (user_id, specialty_id, bmdc_number, degrees, experience_years, bio, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [userId, specialtyId, bmdcNumber, degrees, experienceYears, bio, status]
      );
      const doctorId = docRes.rows[0].id;

      // VERIFIED doctors get 1 or 2 chambers
      // PENDING doctors get 0 or 1 chamber (first 2 pending get 1 chamber, rest 0)
      // REJECTED gets 1 chamber
      let chambersCount = 0;
      if (status === "VERIFIED") {
        chambersCount = (i % 2) + 1; // 1 or 2 chambers
      } else if (status === "PENDING") {
        chambersCount = i < 36 ? 1 : 0;
      } else if (status === "REJECTED") {
        chambersCount = 1;
      }

      for (let c = 0; c < chambersCount; c++) {
        // Pick an area for the chamber
        const areaIndex = (i + c * 3) % AREAS.length;
        const area = AREAS[areaIndex];

        // Small offset of ~0.002 degrees so chambers don't sit on the exact same coordinate
        const latOffset = ((i * 17 + c * 31) % 10 - 5) * 0.0004;
        const lngOffset = ((i * 13 + c * 23) % 10 - 5) * 0.0004;
        const lat = Number((area.lat + latOffset).toFixed(6));
        const lng = Number((area.lng + lngOffset).toFixed(6));

        const chamberName = `${sampleChamberNames[(i + c) % sampleChamberNames.length]}, ${area.name}`;
        const chamberAddress = `Road ${c + 1}, Block ${String.fromCharCode(65 + (i % 4))}, ${area.name}`;
        const fee = 500 + ((i * 100) % 1100); // 500 to 1500
        const chamberPhone = `0182000${String(doctorIndex * 2 + c).padStart(4, "0")}`;

        const chamberRes = await client.query(
          `INSERT INTO chambers (doctor_id, name, address, city, area, lat, lng, phone, fee)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id`,
          [doctorId, chamberName, chamberAddress, "Chattogram", area.name, lat, lng, chamberPhone, fee]
        );
        const chamberId = chamberRes.rows[0].id;

        // Add 2 to 4 schedule slots for the chamber
        const scheduleDays = weekdayOptions[(i + c) % weekdayOptions.length];
        for (const day of scheduleDays) {
          const startTime = `${16 + ((i + c) % 3)}:00`; // 16:00, 17:00, or 18:00
          const endTime = `${20 + ((i + c) % 2)}:00`;   // 20:00 or 21:00
          await client.query(
            `INSERT INTO chamber_schedules (chamber_id, day, start_time, end_time)
             VALUES ($1, $2, $3, $4)`,
            [chamberId, day, startTime, endTime]
          );
        }
      }
    }
  });

  console.log("Database seeded successfully!");
  await pool.end();
};

seed().catch((error) => {
  console.error("Database seed failed:", error);
  process.exit(1);
});

