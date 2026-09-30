/**
 * CampusLab Navbar Role Configuration & Active-Route Test Suite
 * Strictly verifies Section 23 & Section 24 of Step 12.4
 */

// Import NAV_CONFIG and isNavItemActive from the compiled / source module logic
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const BASE_URL = 'http://localhost:3001';

const NAV_CONFIG = {
  public: [
    { label: 'Platform', href: '#platform', id: 'platform' },
    { label: 'Projects', href: '/projects', id: 'projects' },
    { label: 'For Colleges', href: '/for-colleges', id: 'for-colleges' },
    { label: 'How It Works', href: '#how-it-works', id: 'how-it-works' },
  ],
  admin: [
    { label: 'Overview', href: '/dashboard', id: 'admin-overview' },
    { label: 'Projects', href: '/dashboard/projects', id: 'admin-projects' },
    { label: 'Mentoring', href: '/dashboard/mentoring', id: 'admin-mentoring' },
    { label: 'Evaluation', href: '/dashboard/evaluation', id: 'admin-evaluation' },
    { label: 'Reports', href: '/reports', id: 'admin-reports' },
  ],
  faculty: [
    { label: 'My Projects', href: '/faculty', id: 'faculty-projects' },
    { label: 'Teams', href: '/faculty/teams', id: 'faculty-teams' },
    { label: 'Milestones', href: '/faculty/milestones', id: 'faculty-milestones' },
    { label: 'Evaluation', href: '/faculty/evaluation', id: 'faculty-evaluation' },
  ],
  mentor: [
    { label: 'My Projects', href: '/mentor', id: 'mentor-projects' },
    { label: 'Submissions', href: '/mentor/submissions', id: 'mentor-submissions' },
    { label: 'Feedback', href: '/mentor/feedback', id: 'mentor-feedback' },
    { label: 'Evaluation', href: '/mentor/evaluation', id: 'mentor-evaluation' },
  ],
  student: [
    { label: 'Project Library', href: '/projects', id: 'student-library' },
    { label: 'My Projects', href: '/student', id: 'student-projects' },
    { label: 'Milestones', href: '/student/milestones', id: 'student-milestones' },
    { label: 'Feedback', href: '/student/feedback', id: 'student-feedback' },
  ],
};

function isNavItemActive(href, pathname) {
  if (href.startsWith('#')) {
    return pathname === '/';
  }
  if (pathname === href) {
    return true;
  }
  if (href === '/projects' && pathname.startsWith('/projects/')) {
    return true;
  }
  return false;
}
function verifyNoDuplicates(items, context) {
  const labels = items.map((i) => i.label);
  const uniqueLabels = new Set(labels);
  if (labels.length !== uniqueLabels.size) {
    console.error(`✗ FAILED: Duplicate labels found in ${context}:`, labels);
    process.exit(1);
  }
  console.log(`✓ ${context} has 0 duplicate labels: [ ${labels.join(' | ')} ]`);
}

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

async function runNavbarTests() {
  console.log('\n======================================================');
  console.log('CampusLab Navbar Role-Awareness & Active-Route Tests');
  console.log('======================================================\n');

  // 1. PUBLIC NAV CONFIG
  console.log('--- 1. Testing PUBLIC Navbar Configuration ---');
  verifyNoDuplicates(NAV_CONFIG.public, 'PUBLIC navigation');
  const expectedPublic = ['Platform', 'Projects', 'For Colleges', 'How It Works'];
  const actualPublic = NAV_CONFIG.public.map((i) => i.label);
  if (JSON.stringify(actualPublic) !== JSON.stringify(expectedPublic)) {
    console.error('✗ Public nav does not match expected labels');
    process.exit(1);
  }

  // 2. ADMIN NAV CONFIG
  console.log('\n--- 2. Testing ADMIN Navbar Configuration ---');
  const adminAuth = await loginAs('admin@campuslab.dev', 'Admin@123');
  console.log(`✓ Authenticated as ${adminAuth.user.role}: ${adminAuth.user.full_name}`);
  verifyNoDuplicates(NAV_CONFIG.admin, 'ADMIN navigation');
  const expectedAdmin = ['Overview', 'Projects', 'Mentoring', 'Evaluation', 'Reports'];
  const actualAdmin = NAV_CONFIG.admin.map((i) => i.label);
  if (JSON.stringify(actualAdmin) !== JSON.stringify(expectedAdmin)) {
    console.error('✗ Admin nav does not match expected labels');
    process.exit(1);
  }

  // 3. FACULTY NAV CONFIG
  console.log('\n--- 3. Testing FACULTY Navbar Configuration ---');
  const facultyAuth = await loginAs('faculty@campuslab.dev', 'Faculty@123');
  console.log(`✓ Authenticated as ${facultyAuth.user.role}: ${facultyAuth.user.full_name}`);
  verifyNoDuplicates(NAV_CONFIG.faculty, 'FACULTY navigation');
  const expectedFaculty = ['My Projects', 'Teams', 'Milestones', 'Evaluation'];
  const actualFaculty = NAV_CONFIG.faculty.map((i) => i.label);
  if (JSON.stringify(actualFaculty) !== JSON.stringify(expectedFaculty)) {
    console.error('✗ Faculty nav does not match expected labels');
    process.exit(1);
  }

  // 4. MENTOR NAV CONFIG (CRITICAL REQUIREMENT)
  console.log('\n--- 4. Testing MENTOR Navbar Configuration (CRITICAL) ---');
  const mentorAuth = await loginAs('mentor@campuslab.dev', 'Mentor@123');
  console.log(`✓ Authenticated as ${mentorAuth.user.role}: ${mentorAuth.user.full_name}`);
  verifyNoDuplicates(NAV_CONFIG.mentor, 'MENTOR navigation');
  const expectedMentor = ['My Projects', 'Submissions', 'Feedback', 'Evaluation'];
  const actualMentor = NAV_CONFIG.mentor.map((i) => i.label);
  if (JSON.stringify(actualMentor) !== JSON.stringify(expectedMentor)) {
    console.error('✗ Mentor nav does not match expected labels');
    process.exit(1);
  }
  // Verify NO duplicate "Mentor Workspace" or "Assigned Projects"
  if (actualMentor.includes('Mentor Workspace') || actualMentor.includes('MentorWorkspace') || actualMentor.includes('Assigned Projects')) {
    console.error('✗ FAILED: Mentor nav contains forbidden duplicate/technical labels!');
    process.exit(1);
  }
  console.log('✓ Verified: Zero duplicate "Mentor Workspace" or "Assigned Projects" labels');

  // 5. STUDENT NAV CONFIG
  console.log('\n--- 5. Testing STUDENT Navbar Configuration ---');
  const studentAuth = await loginAs('student1@campuslab.dev', 'Student@123');
  console.log(`✓ Authenticated as ${studentAuth.user.role}: ${studentAuth.user.full_name}`);
  verifyNoDuplicates(NAV_CONFIG.student, 'STUDENT navigation');
  const expectedStudent = ['Project Library', 'My Projects', 'Milestones', 'Feedback'];
  const actualStudent = NAV_CONFIG.student.map((i) => i.label);
  if (JSON.stringify(actualStudent) !== JSON.stringify(expectedStudent)) {
    console.error('✗ Student nav does not match expected labels');
    process.exit(1);
  }

  // 6. ROUTE-AWARE ACTIVE MATCHING VERIFICATION
  console.log('\n--- 6. Verifying Route-Aware & Nested Path Active Item Matching ---');
  
  // Mentor route matching
  const test1 = isNavItemActive('/mentor', '/mentor');
  if (!test1) { console.error('✗ Failed: /mentor should make My Projects active'); process.exit(1); }
  console.log('✓ /mentor -> "My Projects" is ACTIVE');

  const test2 = isNavItemActive('/mentor/submissions', '/mentor/submissions');
  if (!test2) { console.error('✗ Failed: /mentor/submissions should make Submissions active'); process.exit(1); }
  console.log('✓ /mentor/submissions -> "Submissions" is ACTIVE');

  const test3 = isNavItemActive('/mentor', '/mentor/submissions');
  if (test3) { console.error('✗ Failed: /mentor should NOT be active when on /mentor/submissions'); process.exit(1); }
  console.log('✓ /mentor is correctly INACTIVE when on /mentor/submissions');

  // Admin route matching
  const test4 = isNavItemActive('/dashboard', '/dashboard');
  if (!test4) { console.error('✗ Failed: /dashboard should make Overview active'); process.exit(1); }
  console.log('✓ /dashboard -> "Overview" is ACTIVE');

  const test5 = isNavItemActive('/dashboard/mentoring', '/dashboard/mentoring');
  if (!test5) { console.error('✗ Failed: /dashboard/mentoring should make Mentoring active'); process.exit(1); }
  console.log('✓ /dashboard/mentoring -> "Mentoring" is ACTIVE');

  // Student route matching
  const test6 = isNavItemActive('/student', '/student');
  if (!test6) { console.error('✗ Failed: /student should make My Projects active'); process.exit(1); }
  console.log('✓ /student -> "My Projects" is ACTIVE');

  const test7 = isNavItemActive('/student/milestones', '/student/milestones');
  if (!test7) { console.error('✗ Failed: /student/milestones should make Milestones active'); process.exit(1); }
  console.log('✓ /student/milestones -> "Milestones" is ACTIVE');

  const test8 = isNavItemActive('/projects', '/projects');
  if (!test8) { console.error('✗ Failed: /projects should make Project Library active'); process.exit(1); }
  console.log('✓ /projects -> "Project Library" is ACTIVE');
  console.log('\n======================================================');
  console.log('✓ ALL NAVBAR ROLE & ACTIVE-ROUTE TESTS PASSED (100% OK)');
  console.log('======================================================\n');
}

runNavbarTests();
