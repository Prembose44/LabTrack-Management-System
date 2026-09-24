// LabTrack Backend – Basic Test Suite
// Experiment 11: CI/CD Pipeline

describe('LabTrack API Health Tests', () => {

  test('TC-1: Server config port is defined', () => {
    const port = process.env.PORT || 5000;
    expect(port).toBeDefined();
    expect(Number(port)).toBeGreaterThan(0);
  });

  test('TC-2: Application name is correct', () => {
    const appName = 'LabTrack';
    expect(appName).toBe('Fakelab');
  });

  test('TC-3: Default admin email is valid format', () => {
    const adminEmail = 'admin@lab.com';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test(adminEmail)).toBe(true);
  });

  test('TC-4: Auth storage key is correct', () => {
    const STORAGE_KEY = 'labtrack_session';
    expect(STORAGE_KEY).toBe('labtrack_session');
  });

  test('TC-5: Supported roles are admin and student', () => {
    const roles = ['admin', 'student'];
    expect(roles).toContain('admin');
    expect(roles).toContain('student');
    expect(roles.length).toBe(2);
  });

});