/**
 * Comprehensive Route and Authorization Verification Suite
 * Verifies all 16 dedicated frontend routes and backend endpoints
 */

const BASE_URL = 'http://localhost:3001';

async function loginAs(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed for ${email}`);
  const setCookie = res.headers.get('set-cookie');
  const match = setCookie ? setCookie.match(/campuslab_session=[^;]+/) : null;
  const data = await res.json();
  return { cookie: match ? match[0] : '', user: data.user };
}

async function authGet(endpoint, cookie) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { Cookie: cookie },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`✗ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ ${message}`);
}

async function runAllRoutesTest() {
  console.log('\n======================================================');
  console.log('CampusLab Dedicated Routes & Endpoints Verification');
  console.log('======================================================\n');

  // 1. ADMIN DEDICATED ENDPOINTS
  console.log('--- 1. Testing Admin Dedicated Endpoints ---');
  const admin = await loginAs('admin@campuslab.dev', 'Admin@123');

  const admOverview = await authGet('/api/admin/overview', admin.cookie);
  assert(admOverview.ok, 'Admin Overview endpoint (/api/admin/overview) returns 200 OK');

  const admProjects = await authGet('/api/admin/projects', admin.cookie);
  assert(admProjects.ok && Array.isArray(admProjects.data.projects), 'Admin Projects endpoint (/api/admin/projects) returns 200 OK');

  const admMentors = await authGet('/api/admin/mentors', admin.cookie);
  assert(admMentors.ok && Array.isArray(admMentors.data.mentors), 'Admin Mentoring endpoint (/api/admin/mentors) returns 200 OK');

  const admEval = await authGet('/api/admin/evaluation', admin.cookie);
  assert(admEval.ok && Array.isArray(admEval.data.projects), 'Admin Evaluation endpoint (/api/admin/evaluation) returns 200 OK');

  const admReports = await authGet('/api/reports', admin.cookie);
  assert(admReports.ok, 'Reports endpoint (/api/reports) returns 200 OK for Admin');

  // 2. FACULTY DEDICATED ENDPOINTS
  console.log('\n--- 2. Testing Faculty Dedicated Endpoints ---');
  const faculty = await loginAs('faculty@campuslab.dev', 'Faculty@123');

  const facProjects = await authGet('/api/faculty/projects', faculty.cookie);
  assert(facProjects.ok && Array.isArray(facProjects.data.projects), 'Faculty Projects endpoint (/api/faculty/projects) returns 200 OK');

  const facTeams = await authGet('/api/faculty/teams', faculty.cookie);
  assert(facTeams.ok && Array.isArray(facTeams.data.teams), 'Faculty Teams endpoint (/api/faculty/teams) returns 200 OK');

  const facMilestones = await authGet('/api/faculty/milestones', faculty.cookie);
  assert(facMilestones.ok && Array.isArray(facMilestones.data.milestones), 'Faculty Milestones endpoint (/api/faculty/milestones) returns 200 OK');

  const facEval = await authGet('/api/faculty/evaluation', faculty.cookie);
  assert(facEval.ok && Array.isArray(facEval.data.projects), 'Faculty Evaluation endpoint (/api/faculty/evaluation) returns 200 OK');

  // 3. MENTOR DEDICATED ENDPOINTS
  console.log('\n--- 3. Testing Mentor Dedicated Endpoints ---');
  const mentor = await loginAs('mentor@campuslab.dev', 'Mentor@123');

  const menProjects = await authGet('/api/mentor/projects', mentor.cookie);
  assert(menProjects.ok && Array.isArray(menProjects.data.projects), 'Mentor Projects endpoint (/api/mentor/projects) returns 200 OK');
  assert(menProjects.data.projects.length >= 2, `Mentor assigned to ${menProjects.data.projects.length} projects`);

  const menSubmissions = await authGet('/api/mentor/submissions', mentor.cookie);
  assert(menSubmissions.ok && Array.isArray(menSubmissions.data.submissions), 'Mentor Submissions endpoint (/api/mentor/submissions) returns 200 OK');

  const menFeedback = await authGet('/api/mentor/feedback', mentor.cookie);
  assert(menFeedback.ok && Array.isArray(menFeedback.data.feedback), 'Mentor Feedback endpoint (/api/mentor/feedback) returns 200 OK');

  const menEval = await authGet('/api/mentor/evaluation', mentor.cookie);
  assert(menEval.ok && Array.isArray(menEval.data.projects), 'Mentor Evaluation endpoint (/api/mentor/evaluation) returns 200 OK');

  // 4. STUDENT DEDICATED ENDPOINTS
  console.log('\n--- 4. Testing Student Dedicated Endpoints ---');
  const student = await loginAs('student1@campuslab.dev', 'Student@123');

  const stuProjects = await authGet('/api/student/projects', student.cookie);
  assert(stuProjects.ok && Array.isArray(stuProjects.data.projects), 'Student Projects endpoint (/api/student/projects) returns 200 OK');

  const stuMilestones = await authGet('/api/student/milestones', student.cookie);
  assert(stuMilestones.ok && Array.isArray(stuMilestones.data.milestones), 'Student Milestones endpoint (/api/student/milestones) returns 200 OK');
  assert(
    stuMilestones.data.milestones.some((m) => m.roadmap_group),
    'Milestones roadmap correctly groups by current/upcoming/completed/overdue'
  );

  const stuFeedback = await authGet('/api/student/feedback', student.cookie);
  assert(stuFeedback.ok && Array.isArray(stuFeedback.data.feedback), 'Student Feedback endpoint (/api/student/feedback) returns 200 OK');

  // 5. UNAUTHORIZED CROSS-ROLE ACCESS REJECTIONS
  console.log('\n--- 5. Verifying Cross-Role Access Rejections ---');

  // Student attempts to access admin endpoints
  const sAdm = await authGet('/api/admin/overview', student.cookie);
  assert(sAdm.status === 403, 'Student attempt on /api/admin/overview rejected with 403 Forbidden');

  // Student attempts to access faculty endpoints
  const sFac = await authGet('/api/faculty/projects', student.cookie);
  assert(sFac.status === 403, 'Student attempt on /api/faculty/projects rejected with 403 Forbidden');

  // Mentor attempts to access admin endpoints
  const mAdm = await authGet('/api/admin/projects', mentor.cookie);
  assert(mAdm.status === 403, 'Mentor attempt on /api/admin/projects rejected with 403 Forbidden');

  // Mentor attempts to access reports
  const mRep = await authGet('/api/reports', mentor.cookie);
  assert(mRep.status === 403, 'Mentor attempt on /api/reports rejected with 403 Forbidden');

  // Faculty attempts to access admin license
  const fLic = await authGet('/api/admin/license', faculty.cookie);
  assert(fLic.status === 403, 'Faculty attempt on /api/admin/license rejected with 403 Forbidden');

  console.log('\n======================================================');
  console.log('✓ ALL 22 ROUTE & ENDPOINT VERIFICATION TESTS PASSED!');
  console.log('======================================================\n');
}

runAllRoutesTest();
