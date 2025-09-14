// Google Classroom Configuration
export const GOOGLE_CLASSROOM_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
  redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback',
  scopes: [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.rosters.readonly',
    'https://www.googleapis.com/auth/classroom.coursework.readonly',
    'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
    'https://www.googleapis.com/auth/classroom.coursework.students.readonly'
  ]
};

// Verificar si la configuración está completa
export const isGoogleClassroomConfigured = () => {
  return !!(
    GOOGLE_CLASSROOM_CONFIG.clientId &&
    GOOGLE_CLASSROOM_CONFIG.clientSecret &&
    GOOGLE_CLASSROOM_CONFIG.redirectUri
  );
};
