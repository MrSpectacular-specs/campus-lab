/**
 * CampusLab Security & Resource-Level Authorization Test Suite
 * Strictly verifies the role permission matrix across Admin, Faculty, Mentor, and Student
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

async function runSecuritySuite() {
  console.log('\n======================================================');
  console.log('CampusLab Role Authorization & Security Test Suite');
  console.log('Testing against:', BASE_URL);
  console.log('======================================================\n');

  // Pre-seed known project IDs from seed.ts
  const PROJ_1_SUS = 'b0000000-0000-0000-0000-000000000001'; // Mentor Elena assigned
  const PROJ_2_ROV = 'b0000000-0000-0000-0000-000000000002'; // Mentor Elena assigned
  const PROJ_3_LED = 'b0000000-0000-0000-0000-000000000003'; // Faculty Aris created. UNASSIGNED to Elena!
  const PROJ_4_ACO = 'b0000000-0000-0000-0000-000000000004'; // Draft project. Faculty Aris created.

  // -------------------------------------------------------------------
  // 1. ADMIN AUTHORIZATION
  // -------------------------------------------------------------------
  console.log('--- 1. Testing ADMIN Permissions ---');
  const adminCookie = await loginAs('admin@campuslab.dev', 'Admin@123');
  assert(!!adminCookie, 'Admin authenticated with session cookie');

  const adminProjects = await authRequest('/api/projects', adminCookie);
  assert(adminProjects.ok, 'Admin can list all institution projects');
  assert(adminProjects.data.projects.length >= 5, `Admin receives ${adminProjects.data.projects.length} institution projects`);

  const adminReports = await authRequest('/api/reports', adminCookie);
  assert(adminReports.ok && adminReports.data.report.totalProjects >= 5, 'Admin can access institutional /api/reports');

  const adminMentors = await authRequest('/api/mentors/available', adminCookie);
  assert(adminMentors.ok, 'Admin can query /api/mentors/available');

  // -------------------------------------------------------------------
  // 2. FACULTY AUTHORIZATION
  // -------------------------------------------------------------------
  console.log('\n--- 2. Testing FACULTY Permissions & Restrictions ---');
  const facultyCookie = await loginAs('faculty@campuslab.dev', 'Faculty@123');
  assert(!!facultyCookie, 'Faculty authenticated with session cookie');

  const facultyReports = await authRequest('/api/reports', facultyCookie);
  assert(facultyReports.ok, 'Faculty can access institutional /api/reports');

  const facultyMentors = await authRequest('/api/mentors/available', facultyCookie);
  assert(facultyMentors.ok, 'Faculty can query /api/mentors/available');

  // Faculty can update their own project (PROJ_3_LED was created by faculty Aris)
  const facultyUpdateOwn = await authRequest(`/api/projects/${PROJ_3_LED}`, facultyCookie, {
    method: 'PATCH',
    body: JSON.stringify({ expected_outcome: 'Updated consensus benchmark specification.' }),
  });
  assert(facultyUpdateOwn.ok, 'Faculty CAN update project they created / coordinate');

  // Faculty ATTEMPT to update Admin's project (PROJ_1_SUS) -> MUST BE 403
  const facultyUpdateAdminProj = await authRequest(`/api/projects/${PROJ_1_SUS}`, facultyCookie, {
    method: 'PATCH',
    body: JSON.stringify({ title: 'Hacked Title' }),
  });
  assert(facultyUpdateAdminProj.status === 403, 'Faculty CANNOT modify project created by Admin (403 Forbidden)');

  // Faculty ATTEMPT to delete project -> MUST BE 403 (Admin only!)
  const facultyDeleteAttempt = await authRequest(`/api/projects/${PROJ_3_LED}`, facultyCookie, {
    method: 'DELETE',
  });
  assert(facultyDeleteAttempt.status === 403, 'Faculty CANNOT delete projects (403 Forbidden — Admin only)');

  // -------------------------------------------------------------------
  // 3. MENTOR AUTHORIZATION (ASSIGNED PROJECTS ONLY)
  // -------------------------------------------------------------------
  console.log('\n--- 3. Testing MENTOR Permissions & Strict Boundaries ---');
  const mentorCookie = await loginAs('mentor@campuslab.dev', 'Mentor@123');
  assert(!!mentorCookie, 'Mentor authenticated with session cookie');

  // Mentors query projects: must ONLY return assigned projects
  const mentorProjects = await authRequest('/api/projects', mentorCookie);
  assert(mentorProjects.ok, 'Mentor can query /api/projects');
  const assignedCodes = mentorProjects.data.projects.map((p) => p.code);
  assert(
    assignedCodes.includes('CL-SUS-101') && assignedCodes.includes('CL-ROV-204'),
    'Mentor receives assigned projects CL-SUS-101 and CL-ROV-204'
  );
  assert(
    !assignedCodes.includes('CL-LED-309'),
    'Mentor CANNOT see unassigned project CL-LED-309 in project listing'
  );

  // Mentor opens assigned project -> 200 OK
  const mentorAssignedProj = await authRequest(`/api/projects/${PROJ_1_SUS}`, mentorCookie);
  assert(mentorAssignedProj.ok, 'Mentor can open assigned project (200 OK)');

  // Mentor ATTEMPTS unassigned project PROJ_3_LED -> MUST BE 403 Forbidden!
  const mentorUnassignedProj = await authRequest(`/api/projects/${PROJ_3_LED}`, mentorCookie);
  assert(mentorUnassignedProj.status === 403, 'Mentor attempt on UNASSIGNED project is rejected with 403 Forbidden');

  // Mentor ATTEMPTS unassigned submissions -> MUST BE 403 Forbidden!
  const mentorUnassignedSubs = await authRequest(`/api/projects/${PROJ_3_LED}/submissions`, mentorCookie);
  assert(mentorUnassignedSubs.status === 403, 'Mentor attempt on UNASSIGNED submissions is rejected with 403 Forbidden');

  // Mentor ATTEMPTS unassigned feedback -> MUST BE 403 Forbidden!
  const mentorUnassignedFb = await authRequest(`/api/projects/${PROJ_3_LED}/feedback`, mentorCookie, {
    method: 'POST',
    body: JSON.stringify({ feedback: 'Unauthorized feedback' }),
  });
  assert(mentorUnassignedFb.status === 403, 'Mentor attempt to submit feedback on UNASSIGNED project is rejected with 403 Forbidden');

  // Mentor ATTEMPTS unassigned evaluation -> MUST BE 403 Forbidden!
  const mentorUnassignedEval = await authRequest(`/api/projects/${PROJ_3_LED}/evaluation`, mentorCookie);
  assert(mentorUnassignedEval.status === 403, 'Mentor attempt to inspect UNASSIGNED evaluation is rejected with 403 Forbidden');

  // Mentor ATTEMPTS project creation -> MUST BE 403 Forbidden!
  const mentorCreateProj = await authRequest('/api/projects', mentorCookie, {
    method: 'POST',
    body: JSON.stringify({ title: 'Mentor Project Attempt' }),
  });
  assert(mentorCreateProj.status === 403, 'Mentor attempt to CREATE project is rejected with 403 Forbidden');

  // Mentor ATTEMPTS reports -> MUST BE 403 Forbidden!
  const mentorReports = await authRequest('/api/reports', mentorCookie);
  assert(mentorReports.status === 403, 'Mentor attempt to query /api/reports is rejected with 403 Forbidden');

  // Mentor ATTEMPTS available mentors -> MUST BE 403 Forbidden!
  const mentorAvailable = await authRequest('/api/mentors/available', mentorCookie);
  assert(mentorAvailable.status === 403, 'Mentor attempt to query /api/mentors/available is rejected with 403 Forbidden');

  // -------------------------------------------------------------------
  // 4. STUDENT AUTHORIZATION (CONFIDENTIALITY & WORKFLOW)
  // -------------------------------------------------------------------
  console.log('\n--- 4. Testing STUDENT Permissions & Confidentiality ---');
  const student1Cookie = await loginAs('student1@campuslab.dev', 'Student@123');
  assert(!!student1Cookie, 'Student 1 authenticated with session cookie');

  // Student 1 can query public active projects
  const studentPubProjects = await authRequest('/api/projects', student1Cookie);
  assert(studentPubProjects.ok, 'Student can browse public library projects');

  // Student 1 enrolled projects: only joined projects
  const studentMyProjects = await authRequest('/api/projects?my=true', student1Cookie);
  assert(studentMyProjects.ok, 'Student can query enrolled projects');
  const enrolledIds = studentMyProjects.data.projects.map((p) => p.id);
  assert(enrolledIds.includes(PROJ_1_SUS), 'Student 1 sees enrolled project CL-SUS-101');
  assert(!enrolledIds.includes(PROJ_4_ACO), 'Student 1 DOES NOT see unjoined project CL-ACO-412 under enrolled');

  // Student 1 ATTEMPTS to view draft unjoined project (PROJ_4_ACO) -> 403 Forbidden!
  const studentDraftAttempt = await authRequest(`/api/projects/${PROJ_4_ACO}`, student1Cookie);
  assert(studentDraftAttempt.status === 403, 'Student cannot view draft projects they are not enrolled in (403 Forbidden)');

  // Student 1 ATTEMPTS project creation -> 403 Forbidden!
  const studentCreateAttempt = await authRequest('/api/projects', student1Cookie, {
    method: 'POST',
    body: JSON.stringify({ title: 'Student Project' }),
  });
  assert(studentCreateAttempt.status === 403, 'Student attempt to CREATE project is rejected with 403 Forbidden');

  // Student 1 ATTEMPTS project deletion -> 403 Forbidden!
  const studentDeleteAttempt = await authRequest(`/api/projects/${PROJ_1_SUS}`, student1Cookie, {
    method: 'DELETE',
  });
  assert(studentDeleteAttempt.status === 403, 'Student attempt to DELETE project is rejected with 403 Forbidden');

  // Student 1 ATTEMPTS /api/reports -> 403 Forbidden!
  const studentReportsAttempt = await authRequest('/api/reports', student1Cookie);
  assert(studentReportsAttempt.status === 403, 'Student attempt to access /api/reports is rejected with 403 Forbidden');

  // Student 1 ATTEMPTS /api/mentors/available -> 403 Forbidden!
  const studentMentorsAttempt = await authRequest('/api/mentors/available', student1Cookie);
  assert(studentMentorsAttempt.status === 403, 'Student attempt to query /api/mentors/available is rejected with 403 Forbidden');

  // Student 1 ATTEMPTS milestone creation -> 403 Forbidden!
  const studentMilestoneAttempt = await authRequest(`/api/projects/${PROJ_1_SUS}/milestones`, student1Cookie, {
    method: 'POST',
    body: JSON.stringify({ title: 'Hacked Milestone' }),
  });
  assert(studentMilestoneAttempt.status === 403, 'Student attempt to CREATE milestone is rejected with 403 Forbidden');

  // Student 1 evaluation results confidentiality:
  // When student 1 inspects evaluation, results must ONLY contain marks for student 1
  const studentEval = await authRequest(`/api/projects/${PROJ_1_SUS}/evaluation`, student1Cookie);
  assert(studentEval.ok, 'Student can query evaluation for enrolled project');
  const allBelongToStudent1 = studentEval.data.results.every(
    (r) => r.student_id === '00000000-0000-0000-0000-000000000004'
  );
  assert(allBelongToStudent1, 'Evaluation results are filtered: Student 1 ONLY receives their own marks, zero student data leaks');

  console.log('\n======================================================');
  console.log('✓ ALL 22 ROLE AUTHORIZATION & SECURITY CHECKS PASSED!');
  console.log('======================================================\n');
}

runSecuritySuite();
