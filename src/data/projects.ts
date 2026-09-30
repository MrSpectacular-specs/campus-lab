export interface Milestone {
  sprint: string;
  weekRange: string;
  title: string;
  objective: string;
  deliverable: string;
  acceptanceCriteria: string[];
  rubricWeight: string;
}

export interface MentorInfo {
  name: string;
  title: string;
  organization: string;
  podRatio: string;
  turnaround: string;
  cadence: string;
  bio: string;
}

export interface EvaluationCriterion {
  category: string;
  weight: string;
  description: string;
  scoringRange: string;
}

export interface Project {
  id: string;
  code: string;
  title: string;
  domain: string;
  difficulty: 'Intermediate' | 'Advanced';
  duration: '8 Weeks' | '10 Weeks' | '12 Weeks';
  industry: string;
  skills: string[];
  summary: string;
  projectBrief: string;
  mentorAvailability: string;
  mentorPod: string;
  mentorTurnaround: string;
  problemStatement: string;
  learningObjectives: string[];
  expectedDeliverables: string[];
  milestones: Milestone[];
  mentorInfo: MentorInfo;
  evaluationCriteria: EvaluationCriterion[];
  prerequisites: string[];
  accreditationFit: string;
}

export const projectsData: Project[] = [
  {
    id: 'ai-campus-assistant',
    code: 'CL-AI-101',
    title: 'AI Campus Assistant',
    domain: 'Generative AI & NLP',
    difficulty: 'Advanced',
    duration: '12 Weeks',
    industry: 'EdTech & Higher Education',
    skills: ['Python', 'LangChain', 'Vector DB', 'RAG', 'FastAPI', 'Llama-3', 'Docker'],
    summary:
      'A retrieval-augmented institutional assistant that indexes campus syllabi, university regulations, and course prerequisites with strict factual citation, low-latency search, and zero hallucination.',
    projectBrief:
      'A retrieval-augmented institutional assistant that indexes campus syllabi, university regulations, and course prerequisites with strict factual citation, low-latency search, and zero hallucination.',
    mentorAvailability: '4 Allocated Practitioners',
    mentorPod: 'Pod 02 · AI Systems',
    mentorTurnaround: '< 16h',
    problemStatement:
      'University students face fragmented information across dozens of course syllabi, academic advisories, and department PDF manuals. Traditional keyword search fails to answer contextual academic questions (e.g., "Which courses satisfy my elective requirements while avoiding schedule clashes with Operating Systems lab?"). Standard generative AI models hallucinate institutional policies without auditable references. Colleges require a verified, private, on-premise retrieval pipeline with strict source citation guarantees.',
    learningObjectives: [
      'Design and benchmark chunking strategies for multi-page institutional PDF documents.',
      'Implement hybrid dense-sparse semantic retrieval using open-source vector databases (Qdrant/ChromaDB).',
      'Build contextual hallucination guardrails that verify prompt groundedness against retrieved context chunks.',
      'Deploy production-grade asynchronous REST APIs with latency profiling and Prometheus telemetry.',
      'Defend architecture choices and trade-offs in a formal oral viva defense.',
    ],
    expectedDeliverables: [
      'Production-ready FastAPI backend containerized with Docker and docker-compose.',
      'Semantic document ingestion pipeline indexing 100+ academic syllabus PDFs.',
      'Automated evaluation benchmark script reporting RAGAS faithfulness, recall, and latency metrics.',
      '15-minute recorded video oral defense explaining architectural trade-offs and privacy boundaries.',
    ],
    milestones: [
      {
        sprint: 'Sprint 01',
        weekRange: 'Weeks 1–4',
        title: 'Document Ingestion, Preprocessing & Vector Indexing',
        objective: 'Establish the core data parsing layer and semantic vector store.',
        deliverable: 'Tested parsing pipeline with semantic chunking & vector indexing.',
        rubricWeight: '30%',
        acceptanceCriteria: [
          'Ingestion of 100+ multi-page institutional syllabus PDFs with metadata extraction',
          'Comparative benchmark between sliding-window and semantic boundary chunking',
          'Hybrid dense + sparse embedding generation with Qdrant vector database',
          'Top-5 retrieval precision > 0.85 on standardized question validation set',
        ],
      },
      {
        sprint: 'Sprint 02',
        weekRange: 'Weeks 5–8',
        title: 'Context Retrieval, Hallucination Guardrails & API Service',
        objective: 'Implement the inference pipeline, citation schema, and safety filters.',
        deliverable: 'FastAPI microservice with prompt guardrails and citation generator.',
        rubricWeight: '35%',
        acceptanceCriteria: [
          'Sub-800ms context retrieval latency under 50 concurrent requests',
          'Strict hallucination filter rejecting ungrounded claims with fallback explanations',
          'Structured citation JSON schema returning exact page, section, and confidence score',
          'Session conversation memory store supporting multi-turn curricular advisories',
        ],
      },
      {
        sprint: 'Sprint 03',
        weekRange: 'Weeks 9–12',
        title: 'End-to-End Evaluation, Containerization & Defense Viva',
        objective: 'Validate performance, benchmark accuracy, and defend the project architecture.',
        deliverable: 'Deployed Docker container, latency profiler, and recorded oral defense.',
        rubricWeight: '35%',
        acceptanceCriteria: [
          'RAGAS evaluation suite reporting Faithfulness > 0.90 and Answer Relevance > 0.88',
          'Docker container configuration with zero hardcoded API secrets or local paths',
          '15-minute recorded technical oral defense video evaluated by faculty and mentor',
          'Complete Git commit history with conventional commit messages and unit tests (>80% coverage)',
        ],
      },
    ],
    mentorInfo: {
      name: 'Dr. Anita Rao',
      title: 'Principal AI Architect',
      organization: 'Hexa Cognitive Systems',
      podRatio: '1 : 12 Student Pod',
      turnaround: '< 16 Hours',
      cadence: 'Bi-Weekly Live Architecture Reviews',
      bio: 'Former senior research scientist with 12+ years in production information retrieval, vector embeddings, and language model deployment.',
    },
    evaluationCriteria: [
      {
        category: 'Architecture & System Design',
        weight: '30%',
        description: 'Quality of vector store schema, chunking logic, data isolation, and API design.',
        scoringRange: '0.0 – 4.0 Scale',
      },
      {
        category: 'Code Quality & Test Coverage',
        weight: '25%',
        description: 'Adherence to PEP 8, asynchronous idioms, type hints, and automated unit test suite.',
        scoringRange: '0.0 – 4.0 Scale',
      },
      {
        category: 'Evaluation Fidelity & Metrics',
        weight: '25%',
        description: 'Rigorous benchmark validation using RAGAS, precision/recall metrics, and latency logs.',
        scoringRange: '0.0 – 4.0 Scale',
      },
      {
        category: 'Oral Defense & Technical Viva',
        weight: '20%',
        description: 'Individual student technical mastery demonstrated during the recorded defense panel.',
        scoringRange: '0.0 – 4.0 Scale',
      },
    ],
    prerequisites: ['Data Structures & Algorithms', 'Python Programming', 'Basic Machine Learning'],
    accreditationFit: 'NEP 2020 Experiential Credit · NBA Program Outcome PO3 & PO5',
  },
  {
    id: 'fintech-risk-monitor',
    code: 'CL-FIN-204',
    title: 'FinTech Risk Monitor',
    domain: 'FinTech & Distributed Systems',
    difficulty: 'Advanced',
    duration: '12 Weeks',
    industry: 'Banking & Financial Services',
    skills: ['Go', 'Apache Kafka', 'TimescaleDB', 'Python', 'Docker', 'Anomaly Detection'],
    summary:
      'Real-time streaming ledger monitoring high-throughput payment streams to detect velocity anomalies, fraudulent patterns, and transaction latency spikes.',
    projectBrief:
      'Real-time streaming ledger monitoring high-throughput payment streams to detect velocity anomalies, fraudulent patterns, and transaction latency spikes.',
    mentorAvailability: '3 Allocated Practitioners',
    mentorPod: 'Pod 05 · FinTech Architecture',
    mentorTurnaround: '< 18h',
    problemStatement:
      'Modern digital payment switches process tens of thousands of transactions per second. Fraud detection must occur within the transaction authorization window (sub-50ms) without causing false positive blocks for legitimate merchants. Batch analytics systems identify fraud hours after settlement, when capital has already left the account. Financial institutions need a distributed event-driven risk evaluation pipeline operating with deterministic low latency and complete auditability.',
    learningObjectives: [
      'Design high-throughput distributed event streaming architectures with Apache Kafka.',
      'Implement sliding-window aggregation algorithms with sub-50ms decision latency in Go.',
      'Model time-series financial ledgers in TimescaleDB with partition pruning and hypertable indexes.',
      'Develop dynamic anomaly detection rules without disrupting transaction throughput.',
      'Defend financial system integrity and fault tolerance under simulated node failure.',
    ],
    expectedDeliverables: [
      'High-throughput Go event processor consuming simulated ISO 20022 message streams.',
      'Kafka cluster configuration with partition keys and consumer group balancing.',
      'Real-time WebSocket telemetry dashboard displaying transaction risk scores and velocity alerts.',
      'Audit compliance report verifying deterministic decision-making under network partition.',
    ],
    milestones: [
      {
        sprint: 'Sprint 01',
        weekRange: 'Weeks 1–4',
        title: 'Event Streaming Schema & Ingestion Pipeline',
        objective: 'Construct the high-throughput message ingestion and time-series database.',
        deliverable: 'High-throughput Kafka cluster with Avro schema serialization.',
        rubricWeight: '30%',
        acceptanceCriteria: [
          'Ingestion rate verified at 10,000 synthetic transaction events per second',
          'Zero message loss under simulated broker failover testing',
          'TimescaleDB hypertable schema design with partition pruning',
          'Comprehensive integration tests verifying end-to-end event delivery',
        ],
      },
      {
        sprint: 'Sprint 02',
        weekRange: 'Weeks 5–8',
        title: 'Sliding Window Anomaly Rules & Risk Engine',
        objective: 'Implement real-time velocity scoring and risk decision algorithms.',
        deliverable: 'Go-based stream processor computing velocity risk scores.',
        rubricWeight: '35%',
        acceptanceCriteria: [
          'Sub-50ms p99 decision latency for transaction scoring',
          'Implementation of dynamic z-score and velocity threshold rules',
          'Prometheus metrics export monitoring worker saturation and message lag',
          'Dead-letter queue handling for malformed transaction schemas',
        ],
      },
      {
        sprint: 'Sprint 03',
        weekRange: 'Weeks 9–12',
        title: 'Telemetry Dashboard, Audit Trail & Defense Viva',
        objective: 'Build executive visibility, export compliance logs, and defend system design.',
        deliverable: 'Real-time incident review dashboard with tamper-proof audit trails.',
        rubricWeight: '35%',
        acceptanceCriteria: [
          'WebSocket dashboard displaying live risk telemetry and merchant heatmaps',
          'Immutable ledger audit export verifying decision determinism',
          'Complete chaos engineering report testing node crash resilience',
          'Recorded viva defense explaining distributed consensus and trade-offs',
        ],
      },
    ],
    mentorInfo: {
      name: 'Vikram Malhotra',
      title: 'VP of Payments Infrastructure',
      organization: 'Apex Ledger Systems',
      podRatio: '1 : 12 Student Pod',
      turnaround: '< 18 Hours',
      cadence: 'Bi-Weekly Live Engineering Syncs',
      bio: 'Specialist in distributed transaction processing, low-latency Go microservices, and regulatory compliance for global payment networks.',
    },
    evaluationCriteria: [
      {
        category: 'Distributed Systems & Throughput',
        weight: '30%',
        description: 'Kafka partition strategy, consumer scaling, latency guarantees, and fault resilience.',
        scoringRange: '0.0 – 4.0 Scale',
      },
      {
        category: 'Algorithmic Accuracy & Anomaly Logic',
        weight: '25%',
        description: 'Precision of sliding-window algorithms and false-positive minimization.',
        scoringRange: '0.0 – 4.0 Scale',
      },
      {
        category: 'Code Quality & Benchmarking',
        weight: '25%',
        description: 'Clean Go idioms, concurrent safety, benchmark suite, and Prometheus instrumentation.',
        scoringRange: '0.0 – 4.0 Scale',
      },
      {
        category: 'Oral Defense & Viva Performance',
        weight: '20%',
        description: 'Mastery of event-driven architecture principles demonstrated in recorded viva.',
        scoringRange: '0.0 – 4.0 Scale',
      },
    ],
    prerequisites: ['Operating Systems', 'Networking & Protocols', 'Relational Databases'],
    accreditationFit: 'NBA Criterion 4 (Design & Development) · AICTE Experiential Project',
  },
  {
    id: 'sustainable-supply-chain',
    code: 'CL-LOG-309',
    title: 'Sustainable Supply Chain',
    domain: 'Systems & Logistics',
    difficulty: 'Intermediate',
    duration: '10 Weeks',
    industry: 'Logistics & Manufacturing',
    skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'GIS Telemetry', 'Carbon Accounting'],
    summary:
      'Multi-tier freight tracking and carbon calculation platform modeling Scope 3 logistics emissions, supplier route optimization, and cold-chain compliance.',
    projectBrief:
      'Multi-tier freight tracking and carbon calculation platform modeling Scope 3 logistics emissions, supplier route optimization, and cold-chain compliance.',
    mentorAvailability: '3 Allocated Practitioners',
    mentorPod: 'Pod 01 · Systems Engineering',
    mentorTurnaround: '< 14h',
    problemStatement:
      'Enterprise logistics operations face strict regulatory mandates (including EU CSRD and SEBI BRSR) to disclose Scope 3 greenhouse gas emissions. Most supply chain software tracks shipments purely by cost and arrival time, leaving carbon calculations to rough annual estimates. Freight coordinators lack real-time visibility into route-specific emissions, multimodal transit alternatives, or cold-chain compliance alerts across third-party carrier fleets.',
    learningObjectives: [
      'Model complex multi-facility supplier graphs using relational and geospatial databases.',
      'Implement standardized carbon accounting formulas compliant with the GLEC freight framework.',
      'Build route optimization algorithms identifying low-emission transit alternatives.',
      'Design RESTful microservices with strict schema validation and audit trails.',
      'Present findings in an executive sustainability report and oral defense.',
    ],
    expectedDeliverables: [
      'PostgreSQL database schema with PostGIS spatial indices for freight waypoints.',
      'Carbon calculation engine computing emissions per ton-kilometer across road, rail, air, and sea.',
      'Interactive web dashboard displaying route emissions and supplier compliance ratings.',
      'Exportable corporate sustainability disclosure report compliant with ISO 14064.',
    ],
    milestones: [
      {
        sprint: 'Sprint 01',
        weekRange: 'Weeks 1–3',
        title: 'Logistics Graph & Geospatial Modeling',
        objective: 'Establish the supply chain network model and spatial database schema.',
        deliverable: 'PostgreSQL schema with PostGIS spatial extensions for facility graphs.',
        rubricWeight: '30%',
        acceptanceCriteria: [
          'Relational graph representing suppliers, transit hubs, and retail destinations',
          'Geospatial distance and waypoint calculation functions with PostGIS',
          'REST API endpoints for shipment creation, tracking, and carrier assignment',
          'Sample dataset modeling 500+ regional shipment journeys',
        ],
      },
      {
        sprint: 'Sprint 02',
        weekRange: 'Weeks 4–7',
        title: 'GHG Scope 3 Calculation Engine & Route Optimization',
        objective: 'Build the emission calculation algorithms and route comparison engine.',
        deliverable: 'Carbon estimation service compliant with GLEC freight standards.',
        rubricWeight: '35%',
        acceptanceCriteria: [
          'Implementation of GLEC freight emission factors across 4 transit modes',
          'Route comparison engine identifying alternative paths with >15% carbon reduction',
          'Automated data validation flags for missing telemetry coordinates',
          'Unit test suite verifying arithmetic precision for compliance reporting',
        ],
      },
      {
        sprint: 'Sprint 03',
        weekRange: 'Weeks 8–10',
        title: 'Sustainability Dashboard, Audit Export & Defense Viva',
        objective: 'Deliver executive analytics, compliance documentation, and oral project defense.',
        deliverable: 'Executive sustainability dashboard with downloadable compliance exports.',
        rubricWeight: '35%',
        acceptanceCriteria: [
          'Interactive web dashboard rendering map routes and carbon breakdown charts',
          'ISO 14064-compliant carbon footprint summary report generated in PDF/CSV format',
          'Integration test suite covering all API routes with >85% code coverage',
          'Recorded oral defense video explaining methodology and data constraints',
        ],
      },
    ],
    mentorInfo: {
      name: 'Priya Sundaram',
      title: 'Head of Supply Chain Solutions',
      organization: 'GreenRoute Global',
      podRatio: '1 : 12 Student Pod',
      turnaround: '< 14 Hours',
      cadence: 'Bi-Weekly Live Engineering Syncs',
      bio: '14+ years in freight logistics, enterprise ERP integration, and carbon accounting standards across Asia-Pacific transport corridors.',
    },
    evaluationCriteria: [
      {
        category: 'Geospatial Modeling & Data Design',
        weight: '30%',
        description: 'Database normalization, PostGIS spatial queries, and graph efficiency.',
        scoringRange: '0.0 – 4.0 Scale',
      },
      {
        category: 'Emission Calculation Accuracy',
        weight: '25%',
        description: 'Adherence to GLEC framework and verification against reference datasets.',
        scoringRange: '0.0 – 4.0 Scale',
      },
      {
        category: 'Software Engineering & Clean Code',
        weight: '25%',
        description: 'TypeScript typings, modular service architecture, and test coverage.',
        scoringRange: '0.0 – 4.0 Scale',
      },
      {
        category: 'Oral Defense & Academic Viva',
        weight: '20%',
        description: 'Clarity of student explanation regarding logistics trade-offs.',
        scoringRange: '0.0 – 4.0 Scale',
      },
    ],
    prerequisites: ['Database Systems', 'Web Application Architecture', 'Object-Oriented Design'],
    accreditationFit: 'NEP 2020 Multidisciplinary Credit · NBA PO7 (Environment & Sustainability)',
  },
  {
    id: 'smart-retail-analytics',
    code: 'CL-CV-412',
    title: 'Smart Retail Analytics',
    domain: 'Computer Vision & Edge Computing',
    difficulty: 'Intermediate',
    duration: '10 Weeks',
    industry: 'Retail & Consumer Operations',
    skills: ['C++', 'OpenCV', 'YOLOv8', 'TensorRT', 'MQTT', 'React'],
    summary:
      'Privacy-preserving edge camera vision pipeline measuring store footfall density, dwell-time heatmaps, and queue lengths without storing facial biometric data.',
    projectBrief:
      'Privacy-preserving edge camera vision pipeline measuring store footfall density, dwell-time heatmaps, and queue lengths without storing facial biometric data.',
    mentorAvailability: '2 Allocated Practitioners',
    mentorPod: 'Pod 04 · Computer Vision',
    mentorTurnaround: '< 18h',
    problemStatement:
      'Retail stores struggle to evaluate product merchandising, aisle bottlenecks, and checkout queue wait times with accuracy. Manual surveying is unreliable and expensive. Cloud-based video streaming consumes massive network bandwidth and poses severe customer privacy risks under data protection laws (such as DPDP Act, 2023). Retailers require edge-computed spatial analytics that extract actionable metrics locally while immediately discarding raw video feeds.',
    learningObjectives: [
      'Optimize deep learning object detection models for real-time edge execution using TensorRT.',
      'Implement spatial tracking algorithms (centroid tracking / ByteTrack) across camera occlusions.',
      'Enforce privacy-by-design principles eliminating persistent biometric storage.',
      'Publish lightweight telemetry messages over MQTT to cloud dashboards.',
      'Defend performance trade-offs between frame rate, model quantization, and tracking accuracy.',
    ],
    expectedDeliverables: [
      'Optimized C++/Python edge inference pipeline processing 30+ FPS at 1080p resolution.',
      'Centroid tracking service computing aisle dwell times and queue length telemetry.',
      'Web-based heat mapping dashboard projecting shopper density over store floor plans.',
      'Privacy compliance audit report certifying zero facial image persistence.',
    ],
    milestones: [
      {
        sprint: 'Sprint 01',
        weekRange: 'Weeks 1–3',
        title: 'Edge Inference & Centroid Tracking Pipeline',
        objective: 'Build the hardware-accelerated detection and multi-object tracking core.',
        deliverable: 'Optimized YOLOv8 TensorRT pipeline on edge GPU/NPU simulator.',
        rubricWeight: '30%',
        acceptanceCriteria: [
          '30+ FPS detection throughput verified at 1080p video stream resolution',
          'Centroid association tracking maintaining consistent IDs across brief occlusions',
          'Immediate memory deallocation of raw frame buffers after coordinate extraction',
          'Benchmarking script recording GPU/NPU resource utilization and thermal profiles',
        ],
      },
      {
        sprint: 'Sprint 02',
        weekRange: 'Weeks 4–7',
        title: 'Spatial Heatmap & Queue Dwell Telemetry',
        objective: 'Aggregate spatial trajectories into dwell-time metrics and queue wait alerts.',
        deliverable: 'Aggregator microservice computing spatial dwell time and queue lengths.',
        rubricWeight: '35%',
        acceptanceCriteria: [
          'MQTT event publishing for zone entries, dwell durations, and queue thresholds',
          'Queue wait time estimation algorithm verified with <10% margin of error',
          'Configurable virtual polygonal boundary editor for store zone mapping',
          'Zero transmission or persistent storage of biometric or facial feature vectors',
        ],
      },
      {
        sprint: 'Sprint 03',
        weekRange: 'Weeks 8–10',
        title: 'Retail Analytics Dashboard & Defense Viva',
        objective: 'Deploy visualization surface, document DPDP compliance, and defend viva.',
        deliverable: 'Live web dashboard displaying store footfall analytics and heatmaps.',
        rubricWeight: '35%',
        acceptanceCriteria: [
          'Real-time heatmap visualization rendered over store architectural floor plans',
          'DPDP Act 2023 compliance audit report verifying privacy safeguards',
          'Complete repository documentation with automated build scripts and Docker container',
          'Individual recorded oral defense video evaluated by faculty and mentor panel',
        ],
      },
    ],
    mentorInfo: {
      name: 'Rohan Deshmukh',
      title: 'Principal Edge AI Engineer',
      organization: 'VisionScale Robotics',
      podRatio: '1 : 12 Student Pod',
      turnaround: '< 18 Hours',
      cadence: 'Bi-Weekly Live Engineering Syncs',
      bio: 'Specialist in embedded computer vision, model quantization on Jetson/Coral platforms, and privacy-preserving sensory telemetry.',
    },
    evaluationCriteria: [
      {
        category: 'Edge Optimization & Throughput',
        weight: '30%',
        description: 'Inference latency, TensorRT pipeline efficiency, and FPS stability.',
        scoringRange: '0.0 – 4.0 Scale',
      },
      {
        category: 'Tracking Robustness & Metric Precision',
        weight: '25%',
        description: 'Tracking accuracy across occlusions, dwell time accuracy, and queue logic.',
        scoringRange: '0.0 – 4.0 Scale',
      },
      {
        category: 'Privacy by Design & Code Hygiene',
        weight: '25%',
        description: 'Verification of zero biometric retention, C++ memory safety, and documentation.',
        scoringRange: '0.0 – 4.0 Scale',
      },
      {
        category: 'Oral Defense & Technical Viva',
        weight: '20%',
        description: 'Student mastery of edge computing and computer vision fundamentals.',
        scoringRange: '0.0 – 4.0 Scale',
      },
    ],
    prerequisites: ['Computer Vision Fundamentals', 'C++ or Python', 'Linear Algebra'],
    accreditationFit: 'NBA PO3 (Component Design) & PO6 (Engineer & Society / Privacy)',
  },
  {
    id: 'campus-sustainability-system',
    code: 'CL-IOT-516',
    title: 'Campus Sustainability System',
    domain: 'IoT & Smart Grid',
    difficulty: 'Intermediate',
    duration: '8 Weeks',
    industry: 'Energy & Smart Infrastructure',
    skills: ['Embedded C', 'ESP32 / Pi', 'Modbus', 'InfluxDB', 'Grafana'],
    summary:
      'Multi-building solar microgrid telemetry network monitoring power generation, battery storage discharge cycles, and power quality across collegiate facilities.',
    projectBrief:
      'Multi-building solar microgrid telemetry network monitoring power generation, battery storage discharge cycles, and power quality across collegiate facilities.',
    mentorAvailability: '3 Allocated Practitioners',
    mentorPod: 'Pod 03 · IoT & Hardware',
    mentorTurnaround: '< 14h',
    problemStatement:
      'University campuses operate complex decentralized electrical networks combining rooftop solar photovoltaic arrays, diesel backup generators, and grid electricity. Facility managers lack consolidated real-time telemetry to balance peak power loads, detect power factor degradation, or optimize battery storage charging schedules. Without building-level sub-metering, campuses incur expensive peak demand utility penalties and miss institutional sustainability targets.',
    learningObjectives: [
      'Interface industrial digital power meters with embedded microcontrollers via Modbus RTU (RS-485).',
      'Package and transmit telemetry packets with TLS encryption over campus Wi-Fi/Ethernet.',
      'Model high-frequency electrical time-series data using InfluxDB.',
      'Develop automated alert heuristics for power factor degradation and peak load warnings.',
      'Present campus energy conservation recommendations in an engineering oral defense.',
    ],
    expectedDeliverables: [
      'ESP32 firmware polling industrial digital energy meters over Modbus RTU.',
      'MQTT ingestion bridge with InfluxDB time-series database storage.',
      'Multi-building energy monitoring dashboard rendered in Grafana.',
      'Engineering audit report identifying campus energy conservation opportunities.',
    ],
    milestones: [
      {
        sprint: 'Sprint 01',
        weekRange: 'Weeks 1–2',
        title: 'Hardware Interfacing & Modbus Telemetry Protocol',
        objective: 'Establish reliable serial polling between microcontrollers and energy meters.',
        deliverable: 'Firmware communicating with digital energy meters over RS-485.',
        rubricWeight: '30%',
        acceptanceCriteria: [
          'Reliable Modbus RTU packet polling at 1Hz sampling frequency',
          'Decoding of active power, reactive power, voltage, current, and power factor registers',
          'Hardware watchdog timer preventing sensor node lockups under line noise',
          'Schematic diagrams and wiring documentation for meter connections',
        ],
      },
      {
        sprint: 'Sprint 02',
        weekRange: 'Weeks 3–5',
        title: 'Time-Series Ingestion & Peak Demand Alert Heuristics',
        objective: 'Build the telemetry ingestion pipeline and threshold alert triggers.',
        deliverable: 'MQTT broker pipeline feeding InfluxDB time-series database.',
        rubricWeight: '35%',
        acceptanceCriteria: [
          'TLS 1.3 encrypted sensor payload transmission over campus network',
          'InfluxDB schema with retention policies optimized for 1-second interval data',
          'Automated threshold alerts notifying facility staff of peak demand surcharge risks',
          'Solar yield vs grid consumption aggregation queries running in sub-100ms',
        ],
      },
      {
        sprint: 'Sprint 03',
        weekRange: 'Weeks 6–8',
        title: 'Facility Dashboard, Audit Report & Defense Viva',
        objective: 'Deploy the facility dashboard, complete energy audit, and defend the project.',
        deliverable: 'Deployed Grafana dashboard with building energy efficiency scores.',
        rubricWeight: '35%',
        acceptanceCriteria: [
          'Building-level energy breakdown visible to collegiate facility engineers',
          'Comprehensive engineering audit report calculating potential peak demand savings',
          'Complete repository containing embedded C source code, PCB layouts, and configs',
          'Recorded oral defense viva explaining electrical engineering and IoT concepts',
        ],
      },
    ],
    mentorInfo: {
      name: 'Siddharth Sen',
      title: 'Principal Smart Grid Architect',
      organization: 'EcoGrid Technologies',
      podRatio: '1 : 12 Student Pod',
      turnaround: '< 14 Hours',
      cadence: 'Bi-Weekly Live Engineering Syncs',
      bio: '15+ years in SCADA systems, industrial Modbus/BACnet automation, renewable microgrid control, and utility demand response networks.',
    },
    evaluationCriteria: [
      {
        category: 'Embedded Hardware & Protocol Hygiene',
        weight: '30%',
        description: 'Modbus polling stability, serial communication reliability, and firmware safety.',
        scoringRange: '0.0 – 4.0 Scale',
      },
      {
        category: 'Data Pipeline & Telemetry Infrastructure',
        weight: '25%',
        description: 'MQTT transport security, InfluxDB schema performance, and dashboard design.',
        scoringRange: '0.0 – 4.0 Scale',
      },
      {
        category: 'Energy Analysis & Recommendations',
        weight: '25%',
        description: 'Accuracy of electrical engineering calculations and demand charge analysis.',
        scoringRange: '0.0 – 4.0 Scale',
      },
      {
        category: 'Oral Defense & Viva Performance',
        weight: '20%',
        description: 'Student understanding of electrical circuits, power factor, and IoT protocols.',
        scoringRange: '0.0 – 4.0 Scale',
      },
    ],
    prerequisites: ['Digital Electronics', 'Basic Microcontroller Programming', 'Networking Basics'],
    accreditationFit: 'NEP 2020 Campus Innovation Project · NBA PO7 (Environment Sustainability)',
  },
];
