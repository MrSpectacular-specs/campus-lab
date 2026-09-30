import bcrypt from 'bcryptjs';
import { db } from './database';

export function seedDatabase() {
  console.log('[Seed] Seeding SQLite database with CampusLab cohort data...');

  const now = new Date().toISOString();

  // 1. Institution
  const instId = 'a0000000-0000-0000-0000-000000000001';
  db.prepare(`
    INSERT OR REPLACE INTO institutions (
      id, name, license_plan, license_status, billing_cycle, license_value,
      license_start, license_end, student_capacity, mentor_capacity, project_capacity,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    instId,
    'Manipal Institute of Technology',
    'Institutional License',
    'active',
    'Annual',
    '₹2,40,000 / year',
    '2026-01-01',
    '2026-12-31',
    null,
    null,
    null,
    now,
    now
  );

  // 2. Users (Hashed with bcrypt)
  const users = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@campuslab.dev',
      password: 'Admin@123',
      fullName: 'Dean Academics',
      role: 'admin',
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'faculty@campuslab.dev',
      password: 'Faculty@123',
      fullName: 'Dr. Aris Thorne',
      role: 'faculty',
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      email: 'mentor@campuslab.dev',
      password: 'Mentor@123',
      fullName: 'Elena Rostova',
      role: 'mentor',
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      email: 'student1@campuslab.dev',
      password: 'Student@123',
      fullName: 'Aarav Patel',
      role: 'student',
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      email: 'student2@campuslab.dev',
      password: 'Student@123',
      fullName: 'Diya Sharma',
      role: 'student',
    },
    {
      id: '00000000-0000-0000-0000-000000000006',
      email: 'student3@campuslab.dev',
      password: 'Student@123',
      fullName: 'Rohan Gupta',
      role: 'student',
    },
  ];

  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, email, password_hash, full_name, role, institution_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of users) {
    const passwordHash = bcrypt.hashSync(u.password, 10);
    insertUser.run(u.id, u.email, passwordHash, u.fullName, u.role, instId, now, now);
  }

  // 3. Projects with Rich Metadata (objectives, expected_outcome, prerequisites)
  const projects = [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      title: 'Campus Sustainability Tracker',
      code: 'CL-SUS-101',
      description: 'IoT-driven environmental monitoring for campus infrastructure with real-time analytics and energy telemetry.',
      category: 'IOT',
      problemStatement: 'Colleges lack real-time environmental monitoring to detect energy wastage, monitor ambient indoor air quality, and verify carbon footprint reduction initiatives.',
      expectedOutcome: 'A deployable sensor mesh network connected to an edge gateway, streaming real-time power and air metrics to a reactive web dashboard with anomaly alerts.',
      objectives: JSON.stringify([
        'Calibrate multi-sensor microcontroller boards for CO2, PM2.5, and power telemetry',
        'Build a secure MQTT pub/sub data ingestion pipeline with backpressure handling',
        'Store time-series metrics in an indexed SQLite database with 15-minute aggregation rollups',
        'Design a responsive institutional dashboard with SLA uptime monitors and exportable compliance reports',
      ]),
      prerequisites: JSON.stringify(['Basic Python or C++', 'Networking fundamentals (TCP/IP, MQTT)', 'Relational database basics']),
      status: 'active',
      difficulty: 'Intermediate',
      duration: '8 Weeks',
      domain: 'IoT / Green Tech',
      skills: JSON.stringify(['Python', 'MQTT', 'React', 'SQLite', 'Embedded C']),
      createdBy: '00000000-0000-0000-0000-000000000001',
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
      title: 'Autonomous Rover Guidance',
      code: 'CL-ROV-204',
      description: 'RTOS firmware and sensor-fusion algorithm for autonomous campus parcel rover navigation and obstacle avoidance.',
      category: 'SYSTEMS',
      problemStatement: 'Manual campus logistics, departmental mail delivery, and library book transfer are labor-intensive, slow, and expensive.',
      expectedOutcome: 'A functional differential-drive mobile rover capable of navigating collegiate pedestrian walkways using 2D LiDAR SLAM and ultrasonic collision avoidance.',
      objectives: JSON.stringify([
        'Configure FreeRTOS task scheduling with deterministic motor control loops',
        'Implement 2D LiDAR SLAM utilizing the Cartographer algorithm in Gazebo simulation',
        'Fuse wheel odometry and 9-DOF IMU telemetry using an Extended Kalman Filter (EKF)',
        'Conduct hardware-in-the-loop field trials with automated return-to-base failsafes',
      ]),
      prerequisites: JSON.stringify(['Proficiency in C/C++', 'Linux operating system basics', 'Linear algebra & kinematics']),
      status: 'active',
      difficulty: 'Advanced',
      duration: '12 Weeks',
      domain: 'Robotics / Systems',
      skills: JSON.stringify(['C/C++', 'ROS2', 'SLAM', 'FreeRTOS', 'EKF']),
      createdBy: '00000000-0000-0000-0000-000000000001',
    },
    {
      id: 'b0000000-0000-0000-0000-000000000003',
      title: 'Distributed Event Ledger',
      code: 'CL-LED-309',
      description: 'High-throughput event coordination and distributed consistency verification engine for collegiate records.',
      category: 'SYSTEMS',
      problemStatement: 'Cross-departmental credentialing and event registration suffer from synchronization lag and lack verifiable audit trails.',
      expectedOutcome: 'A 3-node distributed consensus cluster running Raft protocol over gRPC with persistent state snapshots and atomic commit guarantees.',
      objectives: JSON.stringify([
        'Implement Raft leader election, heartbeats, and log replication in Go',
        'Define typed gRPC service definitions for cluster communication and client append RPCs',
        'Benchmark distributed state machine throughput under network partition simulations',
        'Provide a cryptographic hash audit chain ensuring immutability of recorded events',
      ]),
      prerequisites: JSON.stringify(['Concurrency in Go', 'Distributed systems theory', 'Docker containerization']),
      status: 'active',
      difficulty: 'Advanced',
      duration: '10 Weeks',
      domain: 'Distributed Systems',
      skills: JSON.stringify(['Go', 'gRPC', 'Raft', 'Docker', 'Protocol Buffers']),
      createdBy: '00000000-0000-0000-0000-000000000002', // Faculty coordinated
    },
    {
      id: 'b0000000-0000-0000-0000-000000000004',
      title: 'Edge Acoustic Diagnostic Engine',
      code: 'CL-ACO-412',
      description: 'Signal processing and edge inference pipeline for industrial acoustic anomaly detection across campus facilities.',
      category: 'AI / ML',
      problemStatement: 'Heavy HVAC machinery and campus water treatment pumps fail without warning, incurring catastrophic emergency repair costs.',
      expectedOutcome: 'An edge audio processing appliance capturing microphone array signals, generating log-mel spectrograms, and classifying mechanical bearing degradation in real time.',
      objectives: JSON.stringify([
        'Collect and preprocess baseline mechanical audio data with FFT spectrogram conversion',
        'Train a lightweight 1D/2D convolutional neural network optimized for quantized INT8 deployment',
        'Deploy the inference engine to an edge microcomputer with < 50ms latency',
        'Publish anomaly severity notifications to the facility supervisor maintenance portal',
      ]),
      prerequisites: JSON.stringify(['Digital signal processing (DSP)', 'PyTorch or TensorFlow', 'Python data science stack']),
      status: 'draft',
      difficulty: 'Advanced',
      duration: '10 Weeks',
      domain: 'AI / Signal Processing',
      skills: JSON.stringify(['Python', 'TensorFlow', 'DSP', 'Edge Computing', 'PyTorch']),
      createdBy: '00000000-0000-0000-0000-000000000002', // Faculty coordinated
    },
    {
      id: 'b0000000-0000-0000-0000-000000000005',
      title: 'AI Curriculum Indexer',
      code: 'CL-AI-505',
      description: 'NLP-powered curriculum analysis and skill-gap identification tool for accredited engineering syllabi.',
      category: 'AI / ML',
      problemStatement: 'Curriculum alignment with rapidly evolving industry tech competencies is manual, opaque, and requires months of committee review.',
      expectedOutcome: 'A semantic indexing engine parsing university syllabus documents and generating vector similarity reports against active industry job requisitions.',
      objectives: JSON.stringify([
        'Build document ingestion pipelines for PDF and DOCX academic course syllabi',
        'Fine-tune domain embeddings for technical skills taxonomy mapping',
        'Calculate curriculum coverage gap ratios with interactive heatmaps',
        'Generate accredited compliance export matrices for ABET / NBA accreditation bodies',
      ]),
      prerequisites: JSON.stringify(['Python programming', 'NLP fundamentals', 'FastAPI web development']),
      status: 'completed',
      difficulty: 'Intermediate',
      duration: '8 Weeks',
      domain: 'NLP / EdTech',
      skills: JSON.stringify(['Python', 'spaCy', 'FastAPI', 'React', 'Sentence-Transformers']),
      createdBy: '00000000-0000-0000-0000-000000000001',
    },
  ];

  const insertProject = db.prepare(`
    INSERT OR REPLACE INTO projects (
      id, title, code, description, category, problem_statement,
      objectives, expected_outcome, prerequisites,
      status, difficulty, duration, domain, skills, institution_id, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of projects) {
    insertProject.run(
      p.id, p.title, p.code, p.description, p.category, p.problemStatement,
      p.objectives, p.expectedOutcome, p.prerequisites,
      p.status, p.difficulty, p.duration, p.domain, p.skills, instId, p.createdBy, now, now
    );
  }

  // 4. Project Memberships (Distinct Teams per Student)
  // Student 1 -> Projects 1 & 2
  // Student 2 -> Projects 3 & 5
  // Student 3 -> Project 4
  db.prepare('DELETE FROM project_members').run();
  const members = [
    { projectId: 'b0000000-0000-0000-0000-000000000001', userId: '00000000-0000-0000-0000-000000000004', role: 'student' },
    { projectId: 'b0000000-0000-0000-0000-000000000002', userId: '00000000-0000-0000-0000-000000000004', role: 'student' },
    { projectId: 'b0000000-0000-0000-0000-000000000003', userId: '00000000-0000-0000-0000-000000000005', role: 'student' },
    { projectId: 'b0000000-0000-0000-0000-000000000005', userId: '00000000-0000-0000-0000-000000000005', role: 'student' },
    { projectId: 'b0000000-0000-0000-0000-000000000004', userId: '00000000-0000-0000-0000-000000000006', role: 'student' },
  ];

  const insertMember = db.prepare(`
    INSERT INTO project_members (id, project_id, user_id, role, joined_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const m of members) {
    const memId = `m-${m.projectId.slice(-4)}-${m.userId.slice(-4)}`;
    insertMember.run(memId, m.projectId, m.userId, m.role, now);
  }

  // 5. Mentor Assignments (Elena is ONLY assigned to Projects 1 & 2!)
  // Project 3 is intentionally UNASSIGNED to Elena so we can test that
  // mentor attempts to access project 3 strictly receive 403 Forbidden!
  db.prepare('DELETE FROM mentor_assignments').run();
  const assignments = [
    { projectId: 'b0000000-0000-0000-0000-000000000001', mentorId: '00000000-0000-0000-0000-000000000003', assignedBy: '00000000-0000-0000-0000-000000000001', status: 'active' },
    { projectId: 'b0000000-0000-0000-0000-000000000002', mentorId: '00000000-0000-0000-0000-000000000003', assignedBy: '00000000-0000-0000-0000-000000000001', status: 'active' },
  ];

  const insertAssignment = db.prepare(`
    INSERT INTO mentor_assignments (id, project_id, mentor_id, assigned_by, status, assigned_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const a of assignments) {
    const aId = `as-${a.projectId.slice(-4)}-${a.mentorId.slice(-4)}`;
    insertAssignment.run(aId, a.projectId, a.mentorId, a.assignedBy, a.status, now);
  }

  // 6. Milestones
  const milestones = [
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      projectId: 'b0000000-0000-0000-0000-000000000001',
      title: 'Project Brief & Literature Research',
      description: 'Define technical requirements, environmental metric review, sensor hardware selection.',
      sequence: 1,
      dueDate: '2026-09-09',
      status: 'completed',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000002',
      projectId: 'b0000000-0000-0000-0000-000000000001',
      title: 'System Architecture & Data Schema',
      description: 'Design ingestion architecture, MQTT topic hierarchy, relational schema.',
      sequence: 2,
      dueDate: '2026-09-23',
      status: 'completed',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000003',
      projectId: 'b0000000-0000-0000-0000-000000000001',
      title: 'Prototype Sprint & Sensor Pipeline',
      description: 'Implement working data ingestion pipeline from IoT microcontrollers into persistent store.',
      sequence: 3,
      dueDate: '2026-10-14',
      status: 'active',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000004',
      projectId: 'b0000000-0000-0000-0000-000000000002',
      title: 'RTOS Setup & Sensor Calibration',
      description: 'Embedded firmware architecture, IMU and LiDAR calibration, FreeRTOS task prioritization.',
      sequence: 1,
      dueDate: '2026-09-16',
      status: 'completed',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000005',
      projectId: 'b0000000-0000-0000-0000-000000000002',
      title: 'SLAM Integration & Simulation',
      description: 'Simultaneous Localization and Mapping algorithm integration in Gazebo simulation.',
      sequence: 2,
      dueDate: '2026-10-07',
      status: 'active',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000006',
      projectId: 'b0000000-0000-0000-0000-000000000002',
      title: 'Campus Field Trials & Defense',
      description: 'Autonomous navigation test drives across campus walkways and obstacle avoidance trials.',
      sequence: 3,
      dueDate: '2026-10-28',
      status: 'upcoming',
    },
  ];

  const insertMilestone = db.prepare(`
    INSERT OR REPLACE INTO milestones (id, project_id, title, description, sequence, due_date, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const ms of milestones) {
    insertMilestone.run(ms.id, ms.projectId, ms.title, ms.description, ms.sequence, ms.dueDate, ms.status, now, now);
  }

  // 7. Milestone Submissions
  const submissions = [
    {
      id: 'd0000000-0000-0000-0000-000000000001',
      milestoneId: 'c0000000-0000-0000-0000-000000000001',
      submittedBy: '00000000-0000-0000-0000-000000000004',
      title: 'Sprint 1 Research Document & Technical Brief',
      content: 'Comprehensive project brief covering scope, environmental metrics (PM2.5, CO2, Temp), hardware specs (ESP32 + BME680), and MQTT broker design.',
      status: 'reviewed',
      submittedAt: '2026-09-10T14:30:00Z',
    },
    {
      id: 'd0000000-0000-0000-0000-000000000002',
      milestoneId: 'c0000000-0000-0000-0000-000000000002',
      submittedBy: '00000000-0000-0000-0000-000000000004',
      title: 'Sprint 2 Relational Architecture & Ingestion Schema',
      content: 'Architecture documentation with database schema models, MQTT payload specifications, and React dashboard component mockups.',
      status: 'submitted',
      submittedAt: '2026-09-25T11:15:00Z',
    },
  ];

  const insertSubmission = db.prepare(`
    INSERT OR REPLACE INTO milestone_submissions (id, milestone_id, submitted_by, title, content, status, submitted_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const s of submissions) {
    insertSubmission.run(s.id, s.milestoneId, s.submittedBy, s.title, s.content, s.status, s.submittedAt, now);
  }

  // 8. Mentor Feedback
  const feedback = [
    {
      id: 'fb-00000000-0000-0000-0000-000000000001',
      submissionId: 'd0000000-0000-0000-0000-000000000001',
      milestoneId: 'c0000000-0000-0000-0000-000000000001',
      projectId: 'b0000000-0000-0000-0000-000000000001',
      mentorId: '00000000-0000-0000-0000-000000000003',
      feedback: 'Strong technical brief. Sensor selection is well-justified for collegiate climate bounds. Recommend adding a local buffering mechanism for intermittent Wi-Fi connectivity.',
      createdAt: '2026-09-12T16:00:00Z',
    },
  ];

  const insertFeedback = db.prepare(`
    INSERT OR REPLACE INTO mentor_feedback (id, submission_id, milestone_id, project_id, mentor_id, feedback, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const f of feedback) {
    insertFeedback.run(f.id, f.submissionId, f.milestoneId, f.projectId, f.mentorId, f.feedback, f.createdAt);
  }

  // 9. Evaluation Criteria
  const criteria = [
    {
      id: 'e0000000-0000-0000-0000-000000000001',
      projectId: 'b0000000-0000-0000-0000-000000000001',
      criterion: 'Technical Implementation & Architecture',
      description: 'Code quality, architecture separation, data pipeline robustness.',
      maxScore: 10,
      weight: 0.35,
      sequence: 1,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000002',
      projectId: 'b0000000-0000-0000-0000-000000000001',
      criterion: 'Engineering Problem Solving',
      description: 'Decomposition of environmental monitoring challenge and edge constraints.',
      maxScore: 10,
      weight: 0.25,
      sequence: 2,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000003',
      projectId: 'b0000000-0000-0000-0000-000000000001',
      criterion: 'Documentation & Verification',
      description: 'Quality of API schemas, testing suites, and sprint logs.',
      maxScore: 10,
      weight: 0.20,
      sequence: 3,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000004',
      projectId: 'b0000000-0000-0000-0000-000000000001',
      criterion: 'Accredited Defense & Presentation',
      description: 'Team defense presentation, technical articulation, and demonstration.',
      maxScore: 10,
      weight: 0.20,
      sequence: 4,
    },
  ];

  const insertCriterion = db.prepare(`
    INSERT OR REPLACE INTO evaluation_criteria (id, project_id, criterion, description, max_score, weight, sequence)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of criteria) {
    insertCriterion.run(c.id, c.projectId, c.criterion, c.description, c.maxScore, c.weight, c.sequence);
  }

  // 10. Evaluation Results
  const results = [
    {
      id: 'res-00000000-0000-0000-0000-000000000001',
      criterionId: 'e0000000-0000-0000-0000-000000000001',
      projectId: 'b0000000-0000-0000-0000-000000000001',
      studentId: '00000000-0000-0000-0000-000000000004',
      evaluatorId: '00000000-0000-0000-0000-000000000003',
      score: 9,
      feedback: 'Clean data pipeline with good asynchronous queuing and error handling.',
      createdAt: '2026-09-28T15:00:00Z',
    },
    {
      id: 'res-00000000-0000-0000-0000-000000000002',
      criterionId: 'e0000000-0000-0000-0000-000000000002',
      projectId: 'b0000000-0000-0000-0000-000000000001',
      studentId: '00000000-0000-0000-0000-000000000004',
      evaluatorId: '00000000-0000-0000-0000-000000000003',
      score: 8,
      feedback: 'Thoughtful approach to handling unreliable campus Wi-Fi at edge nodes.',
      createdAt: '2026-09-28T15:05:00Z',
    },
    {
      id: 'res-00000000-0000-0000-0000-000000000003',
      criterionId: 'e0000000-0000-0000-0000-000000000003',
      projectId: 'b0000000-0000-0000-0000-000000000001',
      studentId: '00000000-0000-0000-0000-000000000004',
      evaluatorId: '00000000-0000-0000-0000-000000000003',
      score: 9,
      feedback: 'Exemplary schema documentation and well-annotated MQTT topics.',
      createdAt: '2026-09-28T15:10:00Z',
    },
    {
      id: 'res-00000000-0000-0000-0000-000000000004',
      criterionId: 'e0000000-0000-0000-0000-000000000004',
      projectId: 'b0000000-0000-0000-0000-000000000001',
      studentId: '00000000-0000-0000-0000-000000000004',
      evaluatorId: '00000000-0000-0000-0000-000000000003',
      score: 8,
      feedback: 'Clear, confident presentation during milestone checkpoint.',
      createdAt: '2026-09-28T15:15:00Z',
    },
  ];

  const insertResult = db.prepare(`
    INSERT OR REPLACE INTO evaluation_results (id, criterion_id, project_id, student_id, evaluator_id, score, feedback, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const r of results) {
    insertResult.run(r.id, r.criterionId, r.projectId, r.studentId, r.evaluatorId, r.score, r.feedback, r.createdAt, now);
  }

  console.log('[Seed] SQLite database seeded successfully!');
}

// Auto-run if executed directly via tsx/node
if (process.argv[1]?.includes('seed.ts') || process.argv[1]?.includes('seed.js')) {
  seedDatabase();
}
