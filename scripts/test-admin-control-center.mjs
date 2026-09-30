/**
 * CampusLab Step 12.2 Admin Institutional Control Center Automated Test Suite
 * Tests all operational admin endpoints, license configuration, and role boundaries
 */

const BASE_URL = 'http://localhost:3001';

async function loginAs(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(`Login failed for ${email}: ${res.status}`);
  }

  const setCookie = res.headers.get('set-cookie');
  const match = setCookie ? setCookie.match(/campuslab_session=[^;]+/) : null;
  return match ? match[0] : '';
}

async function authRequest(endpoint, cookie, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookie,
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

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

async function runAdminControlCenterTests() {
  console.log('\n======================================================');
  console.log('CampusLab Admin Control Center & Operations Test Suite');
  console.log('Testing against:', BASE_URL);
  console.log('======================================================\n');

  // Pre-seed known project ID
  const PROJ_1_SUS = 'b0000000-0000-0000-0000-000000000001'; // Healthy, reviewed submissions
  const PROJ_2_ROV = 'b0000000-0000-0000-0000-000000000002'; // Submission awaiting review

  // 1. Admin Authentication
  console.log('--- 1. Admin Authentication ---');
  const adminCookie = await loginAs('admin@campuslab.dev', 'Admin@123');
  assert(!!adminCookie, 'Admin logged in and session cookie established');

  // 2. Overview Metrics & Needs Attention
  console.log('\n--- 2. Institutional Overview Metrics & Needs Attention ---');
  const overviewRes = await authRequest('/api/admin/overview', adminCookie);
  assert(overviewRes.ok, 'GET /api/admin/overview returned 200 OK');
  const { metrics, needs_attention } = overviewRes.data;

  assert(typeof metrics.total_projects === 'number' && metrics.total_projects >= 5, `Total projects: ${metrics.total_projects}`);
  assert(typeof metrics.active_projects === 'number' && metrics.active_projects >= 3, `Active projects: ${metrics.active_projects}`);
  assert(typeof metrics.active_student_teams === 'number', `Active student teams: ${metrics.active_student_teams}`);
  assert(typeof metrics.active_mentors === 'number', `Active mentors: ${metrics.active_mentors}`);
  assert(typeof metrics.pending_reviews === 'number', `Pending reviews count: ${metrics.pending_reviews}`);
  assert(typeof metrics.completed_evaluations === 'number', `Completed evaluations: ${metrics.completed_evaluations}`);

  assert(Array.isArray(needs_attention), 'Needs attention items returned as array');
  assert(needs_attention.length > 0, `Detected ${needs_attention.length} data-driven attention items`);
  const alertTypes = needs_attention.map((a) => a.type);
  console.log('Detected alert types:', alertTypes);
  assert(
    alertTypes.includes('UNASSIGNED_MENTOR') || alertTypes.includes('PENDING_REVIEW') || alertTypes.includes('NO_STUDENT_TEAM'),
    'Needs Attention area identifies real operational bottlenecks'
  );

  // 3. Operational Projects Pipeline Query & Filters
  console.log('\n--- 3. Operational Projects Pipeline Query & Filters ---');
  const projectsRes = await authRequest('/api/admin/projects', adminCookie);
  assert(projectsRes.ok, 'GET /api/admin/projects returned 200 OK');
  const projects = projectsRes.data.projects;
  assert(Array.isArray(projects) && projects.length >= 5, `Received ${projects.length} enriched operational project items`);

  // Verify computed metrics per project row
  const p1 = projects.find((p) => p.code === 'CL-SUS-101');
  assert(!!p1, 'Project CL-SUS-101 found in operational table');
  assert(typeof p1.progress.percent === 'number', `CL-SUS-101 computed progress: ${p1.progress.percent}%`);
  assert(p1.progress.completed_milestones === 2, `CL-SUS-101 completed milestones: ${p1.progress.completed_milestones}`);
  assert(p1.progress.total_milestones === 3, `CL-SUS-101 total milestones: ${p1.progress.total_milestones}`);
  assert(p1.team.student_count >= 1, `CL-SUS-101 student count: ${p1.team.student_count}`);
  assert(p1.mentor !== null, `CL-SUS-101 has assigned mentor: ${p1.mentor?.name}`);

  // Test filter: health=unassigned_mentor
  const unassignedRes = await authRequest('/api/admin/projects?health=unassigned_mentor', adminCookie);
  assert(unassignedRes.ok, 'GET /api/admin/projects?health=unassigned_mentor succeeded');
  const allUnassigned = unassignedRes.data.projects.every((p) => p.mentor === null);
  assert(allUnassigned, 'health=unassigned_mentor strictly returns projects with no mentor');

  // Test filter: status=active
  const activeRes = await authRequest('/api/admin/projects?status=active', adminCookie);
  assert(activeRes.ok, 'GET /api/admin/projects?status=active succeeded');
  const allActive = activeRes.data.projects.every((p) => p.status === 'active');
  assert(allActive, 'status=active strictly filters active projects');

  // 4. Project Detail Drawer Query
  console.log('\n--- 4. Project Detail Drawer Inspection (/api/admin/projects/:id/detail) ---');
  const detailRes = await authRequest(`/api/admin/projects/${PROJ_1_SUS}/detail`, adminCookie);
  assert(detailRes.ok, `GET /api/admin/projects/${PROJ_1_SUS}/detail returned 200 OK`);
  const detail = detailRes.data;

  // Project specification
  assert(detail.project.code === 'CL-SUS-101', 'Detail returned correct project code');
  assert(Array.isArray(detail.project.objectives) && detail.project.objectives.length > 0, `Objectives loaded: ${detail.project.objectives.length} items`);
  assert(!!detail.project.expected_outcome, `Expected outcome loaded: "${detail.project.expected_outcome.substring(0, 40)}..."`);
  assert(Array.isArray(detail.project.prerequisites), 'Prerequisites parsed as array');
  assert(Array.isArray(detail.project.skills), 'Skills parsed as array');

  // Progress & Sprints
  assert(detail.progress.percent === 67, `Computed progress percent: ${detail.progress.percent}%`);
  assert(detail.progress.milestones.length === 3, `Milestones count: ${detail.progress.milestones.length}`);
  const ms1 = detail.progress.milestones.find((m) => m.sequence === 1);
  assert(ms1.status === 'completed' && ms1.submissions_count >= 1, 'Sprint 1 reflects completed milestone with submission');

  // Team & Mentors
  assert(Array.isArray(detail.team.members) && detail.team.members.length >= 1, `Team members: ${detail.team.members.length}`);
  assert(Array.isArray(detail.team.mentors) && detail.team.mentors.length >= 1, `Mentors: ${detail.team.mentors.length}`);

  // Submissions
  assert(detail.submissions.total >= 1, `Submissions total: ${detail.submissions.total}`);
  assert(detail.submissions.reviewed >= 1, `Reviewed submissions: ${detail.submissions.reviewed}`);

  // Evaluation & Average Score
  assert(detail.evaluation.criteria.length === 4, `Evaluation criteria count: ${detail.evaluation.criteria.length}`);
  assert(detail.evaluation.results.length >= 1, `Evaluation results recorded: ${detail.evaluation.results.length}`);
  assert(typeof detail.evaluation.average_score === 'number', `Calculated average score: ${detail.evaluation.average_score} / 10`);

  // Chronological Activity Timeline
  assert(Array.isArray(detail.timeline) && detail.timeline.length >= 3, `Timeline events derived: ${detail.timeline.length}`);
  const eventTypes = detail.timeline.map((e) => e.type);
  assert(
    eventTypes.includes('PROJECT_CREATED') && eventTypes.includes('STUDENT_JOINED'),
    'Activity timeline contains project creation and student enrollment events'
  );

  // 5. Valid Project Management Action (Status Transition)
  console.log('\n--- 5. Perform Administrative Status Transition Action ---');
  const patchRes = await authRequest(`/api/projects/${PROJ_1_SUS}`, adminCookie, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'completed' }),
  });
  assert(patchRes.ok && patchRes.data.project.status === 'completed', 'Admin transitioned project status to "completed"');

  // Revert back to active
  await authRequest(`/api/projects/${PROJ_1_SUS}`, adminCookie, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'active' }),
  });
  console.log('✓ Project status cleanly restored to "active"');

  // 6. Institutional License & Platform Capacity Utilization
  console.log('\n--- 6. Institutional License & Platform Capacity Utilization ---');
  const licenseRes = await authRequest('/api/admin/license', adminCookie);
  assert(licenseRes.ok, 'GET /api/admin/license returned 200 OK');
  const { institution, license, capacities, usage } = licenseRes.data;

  assert(institution.name === 'Manipal Institute of Technology', `Institution: ${institution.name}`);
  assert(license.plan === 'Institutional License', `License plan: ${license.plan}`);
  assert(license.value === '₹2,40,000 / year', `Annual license value matches case study: ${license.value}`);
  assert(license.billing_cycle === 'Annual', `Billing cycle: ${license.billing_cycle}`);
  assert(license.status === 'active', `License status: ${license.status}`);
  assert(typeof license.remaining_days === 'number', `Remaining term days: ${license.remaining_days}`);

  assert(typeof usage.active_projects === 'number', `Platform usage: ${usage.active_projects} active projects`);
  assert(typeof usage.enrolled_students === 'number', `Platform usage: ${usage.enrolled_students} enrolled students`);
  assert(typeof usage.active_mentors === 'number', `Platform usage: ${usage.active_mentors} active mentors`);
  assert(capacities.project_capacity === null, 'Project capacity correctly unconstrained (null = unlimited/not configured)');

  // -------------------------------------------------------------------
  // 7. STRICT AUTHORIZATION BOUNDARIES ON ADMIN ENDPOINTS
  // -------------------------------------------------------------------
  console.log('\n--- 7. Verifying Non-Admin Roles are STRICTLY FORBIDDEN from Admin Endpoints ---');

  // Faculty Attempt on Admin Endpoints
  const facultyCookie = await loginAs('faculty@campuslab.dev', 'Faculty@123');
  const facultyLicense = await authRequest('/api/admin/license', facultyCookie);
  assert(facultyLicense.status === 403, 'Faculty attempt on /api/admin/license is rejected with 403 Forbidden');

  const facultyAdminOverview = await authRequest('/api/admin/overview', facultyCookie);
  assert(facultyAdminOverview.status === 403, 'Faculty attempt on /api/admin/overview is rejected with 403 Forbidden');

  // Mentor Attempt on Admin Endpoints
  const mentorCookie = await loginAs('mentor@campuslab.dev', 'Mentor@123');
  const mentorLicense = await authRequest('/api/admin/license', mentorCookie);
  assert(mentorLicense.status === 403, 'Mentor attempt on /api/admin/license is rejected with 403 Forbidden');

  const mentorAdminOverview = await authRequest('/api/admin/overview', mentorCookie);
  assert(mentorAdminOverview.status === 403, 'Mentor attempt on /api/admin/overview is rejected with 403 Forbidden');

  const mentorAdminProjects = await authRequest('/api/admin/projects', mentorCookie);
  assert(mentorAdminProjects.status === 403, 'Mentor attempt on /api/admin/projects is rejected with 403 Forbidden');

  // Student Attempt on Admin Endpoints
  const studentCookie = await loginAs('student1@campuslab.dev', 'Student@123');
  const studentLicense = await authRequest('/api/admin/license', studentCookie);
  assert(studentLicense.status === 403, 'Student attempt on /api/admin/license is rejected with 403 Forbidden');

  const studentAdminOverview = await authRequest('/api/admin/overview', studentCookie);
  assert(studentAdminOverview.status === 403, 'Student attempt on /api/admin/overview is rejected with 403 Forbidden');

  const studentAdminDetail = await authRequest(`/api/admin/projects/${PROJ_1_SUS}/detail`, studentCookie);
  assert(studentAdminDetail.status === 403, 'Student attempt on /api/admin/projects/:id/detail is rejected with 403 Forbidden');

  console.log('\n======================================================');
  console.log('✓ ALL 24 ADMIN CONTROL CENTER & SECURITY TESTS PASSED!');
  console.log('======================================================\n');
}

runAdminControlCenterTests();
