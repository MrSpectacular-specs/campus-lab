/**
 * CampusLab End-to-End Workflow Verification Suite
 * Tests full-stack Express + SQLite + REST API workflow
 */

const BASE_URL = 'http://localhost:3001';

let cookieJar = '';

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (cookieJar) {
    headers['Cookie'] = cookieJar;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    // Extract session cookie
    const match = setCookie.match(/campuslab_session=[^;]+/);
    if (match) {
      cookieJar = match[0];
    }
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return { status: res.status, ok: res.ok, data };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`✗ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ ${message}`);
}

async function runE2E() {
  console.log('\n======================================================');
  console.log('CampusLab Full-Stack End-to-End Test Suite');
  console.log('Testing against:', BASE_URL);
  console.log('======================================================\n');

  // 1. Healthcheck
  console.log('--- Step 1: Healthcheck ---');
  const health = await request('/api/health');
  assert(health.ok && health.data.status === 'ok', 'Server healthcheck /api/health returned 200 OK');

  // 2. Public Project Library
  console.log('\n--- Step 2: Public Project Library (Unauthenticated) ---');
  const publicProjects = await request('/api/projects');
  assert(publicProjects.ok, 'GET /api/projects returned 200 OK');
  assert(Array.isArray(publicProjects.data.projects), 'Projects array returned');
  assert(publicProjects.data.projects.length >= 3, `Returned ${publicProjects.data.projects.length} active projects from SQLite`);

  // 3. Admin Login & Session Cookie
  console.log('\n--- Step 3: Admin Login & Session Cookie ---');
  const adminLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@campuslab.dev', password: 'Admin@123' }),
  });
  assert(adminLogin.ok, 'POST /api/auth/login with Admin credentials succeeded');
  assert(adminLogin.data.user.role === 'admin', 'Admin user profile returned with role="admin"');
  assert(!!cookieJar, 'HTTP-only session cookie captured');

  // 4. Session Persistence Check
  console.log('\n--- Step 4: Verify Session Persistence ---');
  const sessionCheck = await request('/api/auth/session');
  assert(sessionCheck.ok, 'GET /api/auth/session returned 200 OK');
  assert(sessionCheck.data.user.email === 'admin@campuslab.dev', 'Session correctly identified Admin');

  // 5. Admin Creates Project
  console.log('\n--- Step 5: Admin Creates Project ---');
  const createProj = await request('/api/projects', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Autonomous Drone Delivery Fleet',
      code: 'CL-DRN-901',
      description: 'Fleet coordination and collision-avoidance algorithms for aerial parcel routing.',
      category: 'SYSTEMS',
      domain: 'Autonomous Systems / Aviation',
      difficulty: 'Advanced',
      duration: '12 Weeks',
      skills: ['Rust', 'ROS2', 'PX4', 'WebRTC'],
      problem_statement: 'Last-mile medical supply delivery across remote campus facilities requires autonomous drone fleets.',
    }),
  });
  assert(createProj.ok, 'POST /api/projects successfully created project in SQLite');
  const newProject = createProj.data.project;
  assert(newProject.code === 'CL-DRN-901', `Created project code is ${newProject.code}`);
  const createdProjectId = newProject.id;

  // 6. Verify Project Appears in Library
  console.log('\n--- Step 6: Verify Project in Library ---');
  const fetchCreated = await request(`/api/projects/${createdProjectId}`);
  assert(fetchCreated.ok, `GET /api/projects/${createdProjectId} loaded from database`);
  assert(fetchCreated.data.project.title === 'Autonomous Drone Delivery Fleet', 'Project title matches');
  assert(Array.isArray(fetchCreated.data.project.skills) && fetchCreated.data.project.skills.includes('Rust'), 'Skills parsed as JSON array');

  // 7. Student Login
  console.log('\n--- Step 7: Student Login ---');
  cookieJar = ''; // Clear cookie
  const studentLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'student1@campuslab.dev', password: 'Student@123' }),
  });
  assert(studentLogin.ok, 'Student login succeeded');
  assert(studentLogin.data.user.role === 'student', 'User role is student');

  // 8. Student Joins Project
  console.log('\n--- Step 8: Student Joins Project ---');
  const joinRes = await request(`/api/projects/${createdProjectId}/join`, {
    method: 'POST',
  });
  assert(joinRes.ok, 'POST /api/projects/:id/join enrolled student in project_members');

  // Prevent duplicate join
  const dupJoin = await request(`/api/projects/${createdProjectId}/join`, {
    method: 'POST',
  });
  assert(dupJoin.status === 409, 'Duplicate join rejected with 409 Conflict');

  // 9. Student Sees Project in Enrolled Projects
  console.log('\n--- Step 9: Student Workspace Enrolled Projects ---');
  const myProjects = await request('/api/projects?my=true');
  assert(myProjects.ok, 'GET /api/projects?my=true succeeded');
  const hasJoined = myProjects.data.projects.some((p) => p.id === createdProjectId);
  assert(hasJoined, 'Newly created project appears in student enrolled projects list');

  // 10. Admin Adds Milestone
  console.log('\n--- Step 10: Coordinator Adds Milestone ---');
  // Log back in as admin
  await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@campuslab.dev', password: 'Admin@123' }),
  });

  const createMs = await request(`/api/projects/${createdProjectId}/milestones`, {
    method: 'POST',
    body: JSON.stringify({
      title: 'PX4 Flight Control & Simulation',
      description: 'Implement Gazebo simulation environment and verify PX4 autopilot failsafe modes.',
      sequence: 1,
      due_date: '2026-11-01',
      status: 'active',
    }),
  });
  assert(createMs.ok, 'POST /api/projects/:id/milestones created milestone');
  const milestoneId = createMs.data.milestone.id;

  // Assign Mentor to Project
  console.log('\n--- Step 11: Admin Assigns Mentor ---');
  const assignMentor = await request(`/api/projects/${createdProjectId}/mentors`, {
    method: 'POST',
    body: JSON.stringify({ mentor_id: '00000000-0000-0000-0000-000000000003' }), // Elena Rostova
  });
  assert(assignMentor.ok, 'POST /api/projects/:id/mentors assigned mentor');

  // 12. Student Milestone Submission
  console.log('\n--- Step 12: Student Milestone Submission ---');
  await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'student1@campuslab.dev', password: 'Student@123' }),
  });

  const submitWork = await request(`/api/milestones/${milestoneId}/submissions`, {
    method: 'POST',
    body: JSON.stringify({
      title: 'Gazebo Simulation & PX4 SITL Telemetry Notes',
      content: 'Configured SITL environment with MAVLink bridge. Successfully completed autonomous waypoint navigation in simulation with zero collision events.',
      repository_url: 'https://github.com/campuslab/drone-sitl',
    }),
  });
  assert(submitWork.ok, 'POST /api/milestones/:id/submissions recorded student work in SQLite');
  const submissionId = submitWork.data.submission.id;

  // 13. Mentor Login & Review
  console.log('\n--- Step 13: Mentor Reviews Submission & Leaves Feedback ---');
  await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'mentor@campuslab.dev', password: 'Mentor@123' }),
  });

  // Verify mentor sees the project under assigned
  const mentorProjects = await request('/api/projects?assigned=true');
  assert(mentorProjects.ok, 'GET /api/projects?assigned=true succeeded');
  const isAssigned = mentorProjects.data.projects.some((p) => p.id === createdProjectId);
  assert(isAssigned, 'Mentor sees the assigned drone project');

  // Submit Feedback
  const feedbackRes = await request(`/api/projects/${createdProjectId}/feedback`, {
    method: 'POST',
    body: JSON.stringify({
      submission_id: submissionId,
      milestone_id: milestoneId,
      feedback: 'Excellent telemetry analysis. SITL tests demonstrate rock-solid waypoint tracking. Ready for physical bench testing.',
    }),
  });
  assert(feedbackRes.ok, 'POST /api/projects/:id/feedback recorded mentor review in SQLite');

  // 14. Rubric Criteria & Formal Defense Evaluation
  console.log('\n--- Step 14: Defense Evaluation ---');
  // Log in as admin to add criterion
  await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@campuslab.dev', password: 'Admin@123' }),
  });

  const addCrit = await request(`/api/projects/${createdProjectId}/evaluation/criteria`, {
    method: 'POST',
    body: JSON.stringify({
      criterion: 'Autonomous Flight Control Robustness',
      description: 'Failsafe recovery under simulated GPS dropouts.',
      max_score: 10,
      weight: 0.5,
    }),
  });
  assert(addCrit.ok, 'POST /api/projects/:id/evaluation/criteria provisioned rubric criterion');
  const criterionId = addCrit.data.criterion.id;

  // Mentor scores defense
  await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'mentor@campuslab.dev', password: 'Mentor@123' }),
  });

  const submitEval = await request(`/api/projects/${createdProjectId}/evaluation/results`, {
    method: 'POST',
    body: JSON.stringify({
      criterion_id: criterionId,
      student_id: '00000000-0000-0000-0000-000000000004',
      score: 10,
      feedback: 'Flawless autonomous return-to-launch during simulated signal loss.',
    }),
  });
  assert(submitEval.ok, 'POST /api/projects/:id/evaluation/results recorded defense marks');

  // 15. Institutional Reporting Metrics
  console.log('\n--- Step 15: Institutional Reporting Computed Metrics ---');
  await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@campuslab.dev', password: 'Admin@123' }),
  });

  const reports = await request('/api/reports');
  assert(reports.ok, 'GET /api/reports calculated metrics from SQLite');
  const rep = reports.data.report;
  assert(rep.totalProjects >= 6, `Total projects in institution: ${rep.totalProjects}`);
  assert(rep.activeProjects >= 4, `Active projects: ${rep.activeProjects}`);
  assert(rep.totalSubmissions >= 3, `Total submissions recorded: ${rep.totalSubmissions}`);
  assert(rep.totalEvaluations >= 5, `Total evaluations recorded: ${rep.totalEvaluations}`);
  assert(rep.totalFeedback >= 2, `Total feedback recorded: ${rep.totalFeedback}`);

  console.log('\n======================================================');
  console.log('✓ ALL 15 END-TO-END WORKFLOW TESTS PASSED SUCCESSFULLY!');
  console.log('======================================================\n');
}

runE2E();
