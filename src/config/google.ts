// Google Classroom Configuration
export const GOOGLE_CLASSROOM_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
  redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback',
  scopes: [
    'https://www.googleapis.com/auth/classroom.courses',
    'https://www.googleapis.com/auth/classroom.rosters',
    'https://www.googleapis.com/auth/classroom.coursework',
    'https://www.googleapis.com/auth/classroom.student-submissions',
    'https://www.googleapis.com/auth/classroom.profile.emails',
    'https://www.googleapis.com/auth/classroom.profile.photos'
  ]
};

// Verificar si la configuración está completa
export const isGoogleClassroomConfigured = () => {
  return !!(
    GOOGLE_CLASSROOM_CONFIG.clientId &&
    GOOGLE_CLASSROOM_CONFIG.apiKey &&
    GOOGLE_CLASSROOM_CONFIG.redirectUri
  );
};
