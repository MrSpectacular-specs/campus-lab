import type {
  Institution,
  Profile,
  Project,
  ProjectMember,
  MentorAssignment,
  Milestone,
  MilestoneSubmission,
  MentorFeedback,
  EvaluationCriterion,
  EvaluationResult,
} from '../lib/types';

export interface MockStoreData {
  institution: Institution;
  users: (Profile & { password: string })[];
  projects: Project[];
  projectMembers: ProjectMember[];
  mentorAssignments: MentorAssignment[];
  milestones: Milestone[];
  submissions: MilestoneSubmission[];
  mentorFeedback: MentorFeedback[];
  evaluationCriteria: EvaluationCriterion[];
  evaluationResults: EvaluationResult[];
  activeUserId: string | null;
}

const STORAGE_KEY = 'campuslab_state_v1';

export const INITIAL_INSTITUTION: Institution = {
  id: 'a0000000-0000-0000-0000-000000000001',
  name: 'Manipal Institute of Technology',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

export const INITIAL_USERS: (Profile & { password: string })[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@campuslab.dev',
    password: 'Admin@123',
    full_name: 'Dean Academics',
    role: 'admin',
    institution_id: INITIAL_INSTITUTION.id,
    avatar_url: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'faculty@campuslab.dev',
    password: 'Faculty@123',
    full_name: 'Dr. Aris Thorne',
    role: 'faculty',
    institution_id: INITIAL_INSTITUTION.id,
    avatar_url: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'mentor@campuslab.dev',
    password: 'Mentor@123',
    full_name: 'Elena Rostova',
    role: 'mentor',
    institution_id: INITIAL_INSTITUTION.id,
    avatar_url: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'student1@campuslab.dev',
    password: 'Student@123',
    full_name: 'Aarav Patel',
    role: 'student',
    institution_id: INITIAL_INSTITUTION.id,
    avatar_url: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'student2@campuslab.dev',
    password: 'Student@123',
    full_name: 'Diya Sharma',
    role: 'student',
    institution_id: INITIAL_INSTITUTION.id,
    avatar_url: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    email: 'student3@campuslab.dev',
    password: 'Student@123',
    full_name: 'Rohan Gupta',
    role: 'student',
    institution_id: INITIAL_INSTITUTION.id,
    avatar_url: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    title: 'Campus Sustainability Tracker',
    code: 'CL-SUS-101',
    description: 'IoT-driven environmental monitoring for campus infrastructure with real-time analytics and energy telemetry.',
    category: 'IOT',
    problem_statement: 'Colleges lack real-time environmental monitoring to detect energy wastage, monitor ambient indoor air quality, and verify carbon footprint reduction initiatives.',
    expected_outcome: 'A deployable sensor mesh network connected to an edge gateway, streaming real-time power and air metrics to a reactive web dashboard with anomaly alerts.',
    objectives: [
      'Calibrate multi-sensor microcontroller boards for CO2, PM2.5, and power telemetry',
      'Build a secure MQTT pub/sub data ingestion pipeline with backpressure handling',
      'Store time-series metrics in an indexed SQLite database with 15-minute aggregation rollups',
      'Design a responsive institutional dashboard with SLA uptime monitors and exportable compliance reports',
    ],
    prerequisites: ['Basic Python or C++', 'Networking fundamentals (TCP/IP, MQTT)', 'Relational database basics'],
    status: 'active',
    difficulty: 'Intermediate',
    duration: '8 Weeks',
    domain: 'IoT / Green Tech',
    skills: ['Python', 'MQTT', 'React', 'SQLite', 'Embedded C'],
    institution_id: INITIAL_INSTITUTION.id,
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    title: 'Autonomous Rover Guidance',
    code: 'CL-ROV-204',
    description: 'RTOS firmware and sensor-fusion algorithm for autonomous campus parcel rover navigation and obstacle avoidance.',
    category: 'SYSTEMS',
    problem_statement: 'Manual campus logistics, departmental mail delivery, and library book transfer are labor-intensive, slow, and expensive.',
    expected_outcome: 'A functional differential-drive mobile rover capable of navigating collegiate pedestrian walkways using 2D LiDAR SLAM and ultrasonic collision avoidance.',
    objectives: [
      'Configure FreeRTOS task scheduling with deterministic motor control loops',
      'Implement 2D LiDAR SLAM utilizing the Cartographer algorithm in Gazebo simulation',
      'Fuse wheel odometry and 9-DOF IMU telemetry using an Extended Kalman Filter (EKF)',
      'Conduct hardware-in-the-loop field trials with automated return-to-base failsafes',
    ],
    prerequisites: ['Proficiency in C/C++', 'Linux operating system basics', 'Linear algebra & kinematics'],
    status: 'active',
    difficulty: 'Advanced',
    duration: '12 Weeks',
    domain: 'Robotics / Systems',
    skills: ['C/C++', 'ROS2', 'SLAM', 'FreeRTOS', 'EKF'],
    institution_id: INITIAL_INSTITUTION.id,
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    title: 'Distributed Event Ledger',
    code: 'CL-LED-309',
    description: 'High-throughput event coordination and distributed consistency verification engine for collegiate records.',
    category: 'SYSTEMS',
    problem_statement: 'Cross-departmental credentialing and event registration suffer from synchronization lag and lack verifiable audit trails.',
    expected_outcome: 'A 3-node distributed consensus cluster running Raft protocol over gRPC with persistent state snapshots and atomic commit guarantees.',
    objectives: [
      'Implement Raft leader election, heartbeats, and log replication in Go',
      'Define typed gRPC service definitions for cluster communication and client append RPCs',
      'Benchmark distributed state machine throughput under network partition simulations',
      'Provide a cryptographic hash audit chain ensuring immutability of recorded events',
    ],
    prerequisites: ['Concurrency in Go', 'Distributed systems theory', 'Docker containerization'],
    status: 'active',
    difficulty: 'Advanced',
    duration: '10 Weeks',
    domain: 'Distributed Systems',
    skills: ['Go', 'gRPC', 'Raft', 'Docker', 'Protocol Buffers'],
    institution_id: INITIAL_INSTITUTION.id,
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    title: 'Edge Acoustic Diagnostic Engine',
    code: 'CL-ACO-412',
    description: 'Signal processing and edge inference pipeline for industrial acoustic anomaly detection across campus facilities.',
    category: 'AI / ML',
    problem_statement: 'Heavy HVAC machinery and campus water treatment pumps fail without warning, incurring catastrophic emergency repair costs.',
    expected_outcome: 'An edge audio processing appliance capturing microphone array signals, generating log-mel spectrograms, and classifying mechanical bearing degradation in real time.',
    objectives: [
      'Collect and preprocess baseline mechanical audio data with FFT spectrogram conversion',
      'Train a lightweight 1D/2D convolutional neural network optimized for quantized INT8 deployment',
      'Deploy the inference engine to an edge microcomputer with < 50ms latency',
      'Publish anomaly severity notifications to the facility supervisor maintenance portal',
    ],
    prerequisites: ['Digital signal processing (DSP)', 'PyTorch or TensorFlow', 'Python data science stack'],
    status: 'draft',
    difficulty: 'Advanced',
    duration: '10 Weeks',
    domain: 'AI / Signal Processing',
    skills: ['Python', 'TensorFlow', 'DSP', 'Edge Computing', 'PyTorch'],
    institution_id: INITIAL_INSTITUTION.id,
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000005',
    title: 'AI Curriculum Indexer',
    code: 'CL-AI-505',
    description: 'NLP-powered curriculum analysis and skill-gap identification tool for accredited engineering syllabi.',
    category: 'AI / ML',
    problem_statement: 'Curriculum alignment with rapidly evolving industry tech competencies is manual, opaque, and requires months of committee review.',
    expected_outcome: 'A semantic indexing engine parsing university syllabus documents and generating vector similarity reports against active industry job requisitions.',
    objectives: [
      'Build document ingestion pipelines for PDF and DOCX academic course syllabi',
      'Fine-tune domain embeddings for technical skills taxonomy mapping',
      'Calculate curriculum coverage gap ratios with interactive heatmaps',
      'Generate accredited compliance export matrices for ABET / NBA accreditation bodies',
    ],
    prerequisites: ['Python programming', 'NLP fundamentals', 'FastAPI web development'],
    status: 'completed',
    difficulty: 'Intermediate',
    duration: '8 Weeks',
    domain: 'NLP / EdTech',
    skills: ['Python', 'spaCy', 'FastAPI', 'React', 'Sentence-Transformers'],
    institution_id: INITIAL_INSTITUTION.id,
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000006',
    title: 'Decentralized Research Registry',
    code: 'CL-RES-601',
    description: 'Cryptographic attestation and immutable provenance protocol for peer-reviewed undergraduate laboratory research publications.',
    category: 'FINTECH',
    problem_statement: 'Academic paper fabrication, predatory publishing, and lack of reproducible laboratory datasets undermine undergraduate research credibility.',
    expected_outcome: 'A tamper-proof ledger storing research paper hashes, experiment raw data IPFS hashes, and peer evaluation certificates.',
    objectives: [
      'Design Solidity smart contracts for peer reviewer registry and consensus sign-offs',
      'Implement IPFS chunked pinning for multi-gigabyte raw experiment datasets',
      'Build verification API with cryptographic signatures checking paper authenticity',
      'Deliver web verification portal with verifiable accreditation audit badges',
    ],
    prerequisites: ['Solidity or Rust basics', 'Web3 / Cryptography fundamentals', 'Full-stack TypeScript'],
    status: 'active',
    difficulty: 'Advanced',
    duration: '10 Weeks',
    domain: 'FinTech / Web3',
    skills: ['Solidity', 'IPFS', 'TypeScript', 'Ethers.js', 'Next.js'],
    institution_id: INITIAL_INSTITUTION.id,
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000007',
    title: 'Smart Microgrid Power Allocator',
    code: 'CL-PWR-702',
    description: 'Demand-response optimization model for campus solar panels and battery storage banks using stochastic predictive control.',
    category: 'IOT',
    problem_statement: 'Peak demand surges cause steep university utility penalties while local campus solar arrays run unthrottled with excess waste.',
    expected_outcome: 'An automated load-shedding controller balancing campus HVAC demand against solar generation forecasts in real-time.',
    objectives: [
      'Ingest campus smart meter pulse data over Modbus/RS-485 industrial protocols',
      'Develop hourly solar irradiance prediction model using weather forecast APIs',
      'Formulate Mixed-Integer Linear Programming (MILP) cost-minimization dispatch schedule',
      'Implement automated relay triggers to shift thermal storage loads to peak solar hours',
    ],
    prerequisites: ['Linear Programming & Optimization', 'Python numerical libraries', 'Power system fundamentals'],
    status: 'active',
    difficulty: 'Intermediate',
    duration: '8 Weeks',
    domain: 'CleanTech / IoT',
    skills: ['Python', 'PuLP', 'Modbus', 'Time-Series DB', 'FastAPI'],
    institution_id: INITIAL_INSTITUTION.id,
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000008',
    title: 'Vision Defect Inspection Appliance',
    code: 'CL-VIS-803',
    description: 'High-speed edge camera computer vision system for real-time PCB solder defect classification on manufacturing lines.',
    category: 'AI / ML',
    problem_statement: 'Manual optical inspection of assembled circuit boards in university prototyping labs leads to high component failure rates and rework delay.',
    expected_outcome: 'A macro-lens vision rig running real-time YOLOv8 models detecting bridging, cold joints, and missing surface-mount parts in < 30ms.',
    objectives: [
      'Construct a calibrated macro photography lighting chamber with telecentric optics',
      'Curate and label a dataset of 3,000 PCB assembly surface joints',
      'Train and quantize a YOLOv8-nano model for OpenVINO edge acceleration',
      'Develop real-time pass/fail graphical HUD for student lab operators',
    ],
    prerequisites: ['OpenCV & Computer Vision', 'PyTorch / YOLO architectures', 'Python GUIs'],
    status: 'active',
    difficulty: 'Intermediate',
    duration: '8 Weeks',
    domain: 'Computer Vision / Robotics',
    skills: ['OpenCV', 'PyTorch', 'YOLOv8', 'OpenVINO', 'Python'],
    institution_id: INITIAL_INSTITUTION.id,
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000009',
    title: 'Zero-Trust Campus Access Mesh',
    code: 'CL-SEC-904',
    description: 'WireGuard-based identity-aware proxy and continuous mutual TLS verification mesh for high-security engineering labs.',
    category: 'SYSTEMS',
    problem_statement: 'Traditional collegiate VPNs give flat perimeter network access, making critical server racks vulnerable to lateral lateral compromise.',
    expected_outcome: 'A zero-trust micro-segmented proxy granting granular, short-lived session tokens based on device posture and university role.',
    objectives: [
      'Deploy kernel-space WireGuard tunnels managed via automated REST control plane',
      'Implement SPIFFE/SPIRE workload identity attestation and short-lived mTLS cert issuance',
      'Enforce role-based access control policies using Open Policy Agent (OPA)',
      'Benchmark cryptographic handshake latency and throughput under high concurrent load',
    ],
    prerequisites: ['Computer Networking (mTLS, TCP/IP)', 'Linux systems administration', 'Golang or Rust basics'],
    status: 'active',
    difficulty: 'Advanced',
    duration: '12 Weeks',
    domain: 'Cybersecurity / Systems',
    skills: ['Go', 'WireGuard', 'mTLS', 'OPA', 'SPIFFE/SPIRE'],
    institution_id: INITIAL_INSTITUTION.id,
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000010',
    title: 'FinTech Algorithmic Risk Auditor',
    code: 'CL-FIN-010',
    description: 'High-frequency transaction stream simulation and automated compliance rule engine evaluating Value at Risk (VaR).',
    category: 'FINTECH',
    problem_statement: 'Student finance laboratories lack realistic market order feed environments to backtest quantitative trading strategies against strict regulatory margin rules.',
    expected_outcome: 'An asynchronous market matching engine generating synthetic L2 order books and evaluating real-time portfolio risk matrices.',
    objectives: [
      'Build order book matching engine supporting LIMIT and MARKET execution in Rust',
      'Implement Monte Carlo simulation computing 99% 1-day Value at Risk (VaR)',
      'Provide WebSocket streaming API with microsecond-level timestamps',
      'Create institutional risk dashboard with real-time margin violation alerts',
    ],
    prerequisites: ['Quantitative finance basics', 'Systems programming (Rust or C++)', 'Asynchronous I/O'],
    status: 'active',
    difficulty: 'Advanced',
    duration: '10 Weeks',
    domain: 'FinTech / Quant',
    skills: ['Rust', 'WebSockets', 'Monte Carlo', 'React', 'TimescaleDB'],
    institution_id: INITIAL_INSTITUTION.id,
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
];

export const INITIAL_PROJECT_MEMBERS: ProjectMember[] = [
  { id: 'm-0001-0004', project_id: 'b0000000-0000-0000-0000-000000000001', user_id: '00000000-0000-0000-0000-000000000004', role: 'student', joined_at: '2026-01-05T00:00:00.000Z' },
  { id: 'm-0002-0004', project_id: 'b0000000-0000-0000-0000-000000000002', user_id: '00000000-0000-0000-0000-000000000004', role: 'student', joined_at: '2026-01-05T00:00:00.000Z' },
  { id: 'm-0003-0005', project_id: 'b0000000-0000-0000-0000-000000000003', user_id: '00000000-0000-0000-0000-000000000005', role: 'student', joined_at: '2026-01-06T00:00:00.000Z' },
  { id: 'm-0005-0005', project_id: 'b0000000-0000-0000-0000-000000000005', user_id: '00000000-0000-0000-0000-000000000005', role: 'student', joined_at: '2026-01-06T00:00:00.000Z' },
  { id: 'm-0004-0006', project_id: 'b0000000-0000-0000-0000-000000000004', user_id: '00000000-0000-0000-0000-000000000006', role: 'student', joined_at: '2026-01-07T00:00:00.000Z' },
  { id: 'm-0006-0004', project_id: 'b0000000-0000-0000-0000-000000000006', user_id: '00000000-0000-0000-0000-000000000004', role: 'student', joined_at: '2026-01-08T00:00:00.000Z' },
  { id: 'm-0007-0005', project_id: 'b0000000-0000-0000-0000-000000000007', user_id: '00000000-0000-0000-0000-000000000005', role: 'student', joined_at: '2026-01-09T00:00:00.000Z' },
  { id: 'm-0008-0006', project_id: 'b0000000-0000-0000-0000-000000000008', user_id: '00000000-0000-0000-0000-000000000006', role: 'student', joined_at: '2026-01-10T00:00:00.000Z' },
];

export const INITIAL_MENTOR_ASSIGNMENTS: MentorAssignment[] = [
  { id: 'as-0001-0003', project_id: 'b0000000-0000-0000-0000-000000000001', mentor_id: '00000000-0000-0000-0000-000000000003', assigned_by: '00000000-0000-0000-0000-000000000001', status: 'active', assigned_at: '2026-01-02T00:00:00.000Z' },
  { id: 'as-0002-0003', project_id: 'b0000000-0000-0000-0000-000000000002', mentor_id: '00000000-0000-0000-0000-000000000003', assigned_by: '00000000-0000-0000-0000-000000000001', status: 'active', assigned_at: '2026-01-02T00:00:00.000Z' },
  { id: 'as-0006-0003', project_id: 'b0000000-0000-0000-0000-000000000006', mentor_id: '00000000-0000-0000-0000-000000000003', assigned_by: '00000000-0000-0000-0000-000000000001', status: 'active', assigned_at: '2026-01-03T00:00:00.000Z' },
];

export const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    project_id: 'b0000000-0000-0000-0000-000000000001',
    title: 'Project Brief & Literature Research',
    description: 'Define technical requirements, environmental metric review, sensor hardware selection.',
    sequence: 1,
    due_date: '2026-09-09',
    status: 'completed',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    project_id: 'b0000000-0000-0000-0000-000000000001',
    title: 'System Architecture & Data Schema',
    description: 'Design ingestion architecture, MQTT topic hierarchy, relational schema.',
    sequence: 2,
    due_date: '2026-09-23',
    status: 'completed',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    project_id: 'b0000000-0000-0000-0000-000000000001',
    title: 'Prototype Sprint & Sensor Pipeline',
    description: 'Implement working data ingestion pipeline from IoT microcontrollers into persistent store.',
    sequence: 3,
    due_date: '2026-10-14',
    status: 'active',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    project_id: 'b0000000-0000-0000-0000-000000000002',
    title: 'RTOS Setup & Sensor Calibration',
    description: 'Embedded firmware architecture, IMU and LiDAR calibration, FreeRTOS task prioritization.',
    sequence: 1,
    due_date: '2026-09-16',
    status: 'completed',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    project_id: 'b0000000-0000-0000-0000-000000000002',
    title: 'SLAM Integration & Simulation',
    description: 'Simultaneous Localization and Mapping algorithm integration in Gazebo simulation.',
    sequence: 2,
    due_date: '2026-10-07',
    status: 'active',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000006',
    project_id: 'b0000000-0000-0000-0000-000000000002',
    title: 'Campus Field Trials & Defense',
    description: 'Autonomous navigation test drives across campus walkways and obstacle avoidance trials.',
    sequence: 3,
    due_date: '2026-10-28',
    status: 'upcoming',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
];

export const INITIAL_SUBMISSIONS: MilestoneSubmission[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    milestone_id: 'c0000000-0000-0000-0000-000000000001',
    submitted_by: '00000000-0000-0000-0000-000000000004',
    title: 'Sprint 1 Research Document & Technical Brief',
    content: 'Comprehensive project brief covering scope, environmental metrics (PM2.5, CO2, Temp), hardware specs (ESP32 + BME680), and MQTT broker design.',
    status: 'reviewed',
    submitted_at: '2026-09-10T14:30:00.000Z',
    updated_at: '2026-09-10T14:30:00.000Z',
    repository_url: 'https://github.com/campuslab/sustainability-tracker',
    pr_url: 'https://github.com/campuslab/sustainability-tracker/pull/1',
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    milestone_id: 'c0000000-0000-0000-0000-000000000002',
    submitted_by: '00000000-0000-0000-0000-000000000004',
    title: 'Sprint 2 Relational Architecture & Ingestion Schema',
    content: 'Architecture documentation with database schema models, MQTT payload specifications, and React dashboard component mockups.',
    status: 'submitted',
    submitted_at: '2026-09-25T11:15:00.000Z',
    updated_at: '2026-09-25T11:15:00.000Z',
    repository_url: 'https://github.com/campuslab/sustainability-tracker',
    pr_url: 'https://github.com/campuslab/sustainability-tracker/pull/2',
  },
];

export const INITIAL_FEEDBACK: MentorFeedback[] = [
  {
    id: 'fb-00000000-0000-0000-0000-000000000001',
    submission_id: 'd0000000-0000-0000-0000-000000000001',
    milestone_id: 'c0000000-0000-0000-0000-000000000001',
    project_id: 'b0000000-0000-0000-0000-000000000001',
    mentor_id: '00000000-0000-0000-0000-000000000003',
    feedback: 'Strong technical brief. Sensor selection is well-justified for collegiate climate bounds. Recommend adding a local buffering mechanism for intermittent Wi-Fi connectivity.',
    created_at: '2026-09-12T16:00:00.000Z',
  },
];

export const INITIAL_CRITERIA: EvaluationCriterion[] = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    project_id: 'b0000000-0000-0000-0000-000000000001',
    criterion: 'Technical Implementation & Architecture',
    description: 'Code quality, architecture separation, data pipeline robustness.',
    max_score: 10,
    weight: 0.35,
    sequence: 1,
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    project_id: 'b0000000-0000-0000-0000-000000000001',
    criterion: 'Engineering Problem Solving',
    description: 'Decomposition of environmental monitoring challenge and edge constraints.',
    max_score: 10,
    weight: 0.25,
    sequence: 2,
  },
  {
    id: 'e0000000-0000-0000-0000-000000000003',
    project_id: 'b0000000-0000-0000-0000-000000000001',
    criterion: 'Documentation & Verification',
    description: 'Quality of API schemas, testing suites, and sprint logs.',
    max_score: 10,
    weight: 0.20,
    sequence: 3,
  },
  {
    id: 'e0000000-0000-0000-0000-000000000004',
    project_id: 'b0000000-0000-0000-0000-000000000001',
    criterion: 'Accredited Defense & Presentation',
    description: 'Team defense presentation, technical articulation, and demonstration.',
    max_score: 10,
    weight: 0.20,
    sequence: 4,
  },
];

export const INITIAL_RESULTS: EvaluationResult[] = [
  {
    id: 'res-00000000-0000-0000-0000-000000000001',
    criterion_id: 'e0000000-0000-0000-0000-000000000001',
    project_id: 'b0000000-0000-0000-0000-000000000001',
    student_id: '00000000-0000-0000-0000-000000000004',
    evaluator_id: '00000000-0000-0000-0000-000000000003',
    score: 9,
    feedback: 'Clean data pipeline with good asynchronous queuing and error handling.',
    created_at: '2026-09-28T15:00:00.000Z',
    updated_at: '2026-09-28T15:00:00.000Z',
  },
  {
    id: 'res-00000000-0000-0000-0000-000000000002',
    criterion_id: 'e0000000-0000-0000-0000-000000000002',
    project_id: 'b0000000-0000-0000-0000-000000000001',
    student_id: '00000000-0000-0000-0000-000000000004',
    evaluator_id: '00000000-0000-0000-0000-000000000003',
    score: 8,
    feedback: 'Thoughtful approach to handling unreliable campus Wi-Fi at edge nodes.',
    created_at: '2026-09-28T15:05:00.000Z',
    updated_at: '2026-09-28T15:05:00.000Z',
  },
  {
    id: 'res-00000000-0000-0000-0000-000000000003',
    criterion_id: 'e0000000-0000-0000-0000-000000000003',
    project_id: 'b0000000-0000-0000-0000-000000000001',
    student_id: '00000000-0000-0000-0000-000000000004',
    evaluator_id: '00000000-0000-0000-0000-000000000003',
    score: 9,
    feedback: 'Exemplary schema documentation and well-annotated MQTT topics.',
    created_at: '2026-09-28T15:10:00.000Z',
    updated_at: '2026-09-28T15:10:00.000Z',
  },
  {
    id: 'res-00000000-0000-0000-0000-000000000004',
    criterion_id: 'e0000000-0000-0000-0000-000000000004',
    project_id: 'b0000000-0000-0000-0000-000000000001',
    student_id: '00000000-0000-0000-0000-000000000004',
    evaluator_id: '00000000-0000-0000-0000-000000000003',
    score: 8,
    feedback: 'Clear, confident presentation during milestone checkpoint.',
    created_at: '2026-09-28T15:15:00.000Z',
    updated_at: '2026-09-28T15:15:00.000Z',
  },
];

class MockStore {
  private data: MockStoreData;

  constructor() {
    this.data = this.loadState();
  }

  private loadState(): MockStoreData {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Quick integrity check
          if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.projects)) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('[MockStore] Failed to load cached state from localStorage, falling back to initial seed:', e);
      }
    }

    return {
      institution: INITIAL_INSTITUTION,
      users: [...INITIAL_USERS],
      projects: [...INITIAL_PROJECTS],
      projectMembers: [...INITIAL_PROJECT_MEMBERS],
      mentorAssignments: [...INITIAL_MENTOR_ASSIGNMENTS],
      milestones: [...INITIAL_MILESTONES],
      submissions: [...INITIAL_SUBMISSIONS],
      mentorFeedback: [...INITIAL_FEEDBACK],
      evaluationCriteria: [...INITIAL_CRITERIA],
      evaluationResults: [...INITIAL_RESULTS],
      activeUserId: null,
    };
  }

  public saveState() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.warn('[MockStore] Failed to persist state to localStorage:', e);
      }
    }
  }

  public resetToDefault() {
    this.data = {
      institution: INITIAL_INSTITUTION,
      users: [...INITIAL_USERS],
      projects: [...INITIAL_PROJECTS],
      projectMembers: [...INITIAL_PROJECT_MEMBERS],
      mentorAssignments: [...INITIAL_MENTOR_ASSIGNMENTS],
      milestones: [...INITIAL_MILESTONES],
      submissions: [...INITIAL_SUBMISSIONS],
      mentorFeedback: [...INITIAL_FEEDBACK],
      evaluationCriteria: [...INITIAL_CRITERIA],
      evaluationResults: [...INITIAL_RESULTS],
      activeUserId: null,
    };
    this.saveState();
  }

  public getState(): MockStoreData {
    return this.data;
  }

  // Active User session helpers
  public getActiveUser(): Profile | null {
    if (!this.data.activeUserId) return null;
    const u = this.data.users.find((user) => user.id === this.data.activeUserId);
    if (!u) return null;
    const { password: _, ...profile } = u;
    return profile;
  }

  public setActiveUser(userId: string | null) {
    this.data.activeUserId = userId;
    this.saveState();
  }

  // Project Mutations
  public addProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Project {
    const newProj: Project = {
      ...project,
      id: `b0000000-0000-0000-0000-${String(this.data.projects.length + 1).padStart(12, '0')}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.projects.unshift(newProj);
    this.saveState();
    return newProj;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | null {
    const idx = this.data.projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.projects[idx] = {
      ...this.data.projects[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveState();
    return this.data.projects[idx];
  }

  public deleteProject(id: string): boolean {
    const initLen = this.data.projects.length;
    this.data.projects = this.data.projects.filter((p) => p.id !== id);
    this.saveState();
    return this.data.projects.length < initLen;
  }

  // Membership Mutations
  public joinProject(projectId: string, userId: string, role: Profile['role'] = 'student'): ProjectMember {
    const existing = this.data.projectMembers.find((m) => m.project_id === projectId && m.user_id === userId);
    if (existing) return existing;

    const newMember: ProjectMember = {
      id: `m-${projectId.slice(-4)}-${userId.slice(-4)}`,
      project_id: projectId,
      user_id: userId,
      role,
      joined_at: new Date().toISOString(),
    };
    this.data.projectMembers.push(newMember);
    this.saveState();
    return newMember;
  }

  public removeMember(projectId: string, userId: string): boolean {
    const initLen = this.data.projectMembers.length;
    this.data.projectMembers = this.data.projectMembers.filter(
      (m) => !(m.project_id === projectId && m.user_id === userId)
    );
    this.saveState();
    return this.data.projectMembers.length < initLen;
  }

  // Mentor Assignment Mutations
  public assignMentor(projectId: string, mentorId: string, assignedBy?: string): MentorAssignment {
    const existing = this.data.mentorAssignments.find(
      (a) => a.project_id === projectId && a.mentor_id === mentorId
    );
    if (existing) {
      existing.status = 'active';
      this.saveState();
      return existing;
    }

    const assignment: MentorAssignment = {
      id: `as-${projectId.slice(-4)}-${mentorId.slice(-4)}`,
      project_id: projectId,
      mentor_id: mentorId,
      assigned_by: assignedBy || this.data.activeUserId,
      status: 'active',
      assigned_at: new Date().toISOString(),
    };
    this.data.mentorAssignments.push(assignment);
    this.saveState();
    return assignment;
  }

  public removeMentorAssignment(projectId: string, mentorId: string): boolean {
    const assignment = this.data.mentorAssignments.find(
      (a) => a.project_id === projectId && a.mentor_id === mentorId
    );
    if (!assignment) return false;
    assignment.status = 'removed';
    this.saveState();
    return true;
  }

  // Milestone Mutations
  public addMilestone(milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>): Milestone {
    const newMs: Milestone = {
      ...milestone,
      id: `c0000000-0000-0000-0000-${String(this.data.milestones.length + 1).padStart(12, '0')}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.milestones.push(newMs);
    this.saveState();
    return newMs;
  }

  public updateMilestone(id: string, updates: Partial<Milestone>): Milestone | null {
    const idx = this.data.milestones.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.data.milestones[idx] = {
      ...this.data.milestones[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveState();
    return this.data.milestones[idx];
  }

  public deleteMilestone(id: string): boolean {
    const initLen = this.data.milestones.length;
    this.data.milestones = this.data.milestones.filter((m) => m.id !== id);
    this.saveState();
    return this.data.milestones.length < initLen;
  }

  // Submission Mutations
  public addSubmission(submission: Omit<MilestoneSubmission, 'id' | 'updated_at'>): MilestoneSubmission {
    const newSub: MilestoneSubmission = {
      ...submission,
      id: `d0000000-0000-0000-0000-${String(this.data.submissions.length + 1).padStart(12, '0')}`,
      updated_at: new Date().toISOString(),
    };
    this.data.submissions.unshift(newSub);
    this.saveState();
    return newSub;
  }

  public updateSubmission(id: string, updates: Partial<MilestoneSubmission>): MilestoneSubmission | null {
    const idx = this.data.submissions.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.data.submissions[idx] = {
      ...this.data.submissions[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveState();
    return this.data.submissions[idx];
  }

  // Feedback Mutations
  public addFeedback(fb: Omit<MentorFeedback, 'id' | 'created_at'>): MentorFeedback {
    const newFb: MentorFeedback = {
      ...fb,
      id: `fb-00000000-0000-0000-0000-${String(this.data.mentorFeedback.length + 1).padStart(12, '0')}`,
      created_at: new Date().toISOString(),
    };
    this.data.mentorFeedback.unshift(newFb);
    this.saveState();
    return newFb;
  }

  // Evaluation Criteria & Results Mutations
  public addCriterion(criterion: Omit<EvaluationCriterion, 'id'>): EvaluationCriterion {
    const newCrit: EvaluationCriterion = {
      ...criterion,
      id: `e0000000-0000-0000-0000-${String(this.data.evaluationCriteria.length + 1).padStart(12, '0')}`,
    };
    this.data.evaluationCriteria.push(newCrit);
    this.saveState();
    return newCrit;
  }

  public updateCriterion(id: string, updates: Partial<EvaluationCriterion>): EvaluationCriterion | null {
    const idx = this.data.evaluationCriteria.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.evaluationCriteria[idx] = {
      ...this.data.evaluationCriteria[idx],
      ...updates,
    };
    this.saveState();
    return this.data.evaluationCriteria[idx];
  }

  public deleteCriterion(id: string): boolean {
    const initLen = this.data.evaluationCriteria.length;
    this.data.evaluationCriteria = this.data.evaluationCriteria.filter((c) => c.id !== id);
    this.saveState();
    return this.data.evaluationCriteria.length < initLen;
  }

  public addEvaluationResult(res: Omit<EvaluationResult, 'id' | 'created_at' | 'updated_at'>): EvaluationResult {
    const newRes: EvaluationResult = {
      ...res,
      id: `res-00000000-0000-0000-0000-${String(this.data.evaluationResults.length + 1).padStart(12, '0')}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.evaluationResults.unshift(newRes);
    this.saveState();
    return newRes;
  }
}

export const mockStore = new MockStore();
