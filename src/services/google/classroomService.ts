import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLASSROOM_CONFIG } from '../../config/google';

export interface GoogleClassroomClass {
  id: string;
  name: string;
  description?: string;
  section?: string;
  room?: string;
  ownerId: string;
  creationTime: string;
  updateTime: string;
  enrollmentCode?: string;
  courseState: 'ACTIVE' | 'ARCHIVED' | 'PROVISIONED' | 'DECLINED' | 'SUSPENDED';
}

export interface GoogleClassroomStudent {
  userId: string;
  profile: {
    id: string;
    name: {
      givenName: string;
      familyName: string;
      fullName: string;
    };
    emailAddress: string;
    photoUrl?: string;
  };
  courseId: string;
}

export interface GoogleClassroomAssignment {
  id: string;
  title: string;
  description?: string;
  materials: any[];
  state: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  alternateLink?: string;
  courseId: string;
  creationTime: string;
  updateTime: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours: number;
    minutes: number;
    seconds: number;
    nanos: number;
  };
  maxPoints?: number;
  workType: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION';
}

class GoogleClassroomService {
  private oauth2Client: OAuth2Client | null = null;
  private classroom: any = null;

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    // Inicializar OAuth2 client
    this.oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLASSROOM_CONFIG.clientId,
      GOOGLE_CLASSROOM_CONFIG.clientSecret,
      GOOGLE_CLASSROOM_CONFIG.redirectUri
    );

    // Inicializar Classroom API
    this.classroom = google.classroom({ version: 'v1', auth: this.oauth2Client });
  }

  /**
   * Genera URL de autorización para Google Classroom
   */
  getAuthUrl(): string {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized');
    }

    const scopes = GOOGLE_CLASSROOM_CONFIG.scopes;

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  /**
   * Intercambia código de autorización por tokens
   */
  async exchangeCodeForTokens(code: string): Promise<void> {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized');
    }

    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      
      // Guardar tokens en localStorage
      localStorage.setItem('google_classroom_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  /**
   * Restaura tokens guardados
   */
  async restoreTokens(): Promise<boolean> {
    const tokens = localStorage.getItem('google_classroom_tokens');
    if (!tokens || !this.oauth2Client) {
      return false;
    }

    try {
      const parsedTokens = JSON.parse(tokens);
      this.oauth2Client.setCredentials(parsedTokens);
      
      // Verificar si los tokens siguen siendo válidos
      await this.classroom.courses.list({ pageSize: 1 });
      return true;
    } catch (error) {
      console.error('Error restoring tokens:', error);
      localStorage.removeItem('google_classroom_tokens');
      return false;
    }
  }

  /**
   * Obtiene todas las clases del usuario
   */
  async getClasses(): Promise<GoogleClassroomClass[]> {
    if (!this.classroom) {
      throw new Error('Classroom API not initialized');
    }

    try {
      const response = await this.classroom.courses.list({
        pageSize: 100,
        courseStates: ['ACTIVE', 'ARCHIVED']
      });

      return response.data.courses || [];
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  }

  /**
   * Obtiene estudiantes de una clase específica
   */
  async getClassStudents(courseId: string): Promise<GoogleClassroomStudent[]> {
    if (!this.classroom) {
      throw new Error('Classroom API not initialized');
    }

    try {
      const response = await this.classroom.courses.students.list({
        courseId: courseId,
        pageSize: 100
      });

      return response.data.students || [];
    } catch (error) {
      console.error('Error fetching class students:', error);
      throw error;
    }
  }

  /**
   * Obtiene tareas de una clase específica
   */
  async getClassAssignments(courseId: string): Promise<GoogleClassroomAssignment[]> {
    if (!this.classroom) {
      throw new Error('Classroom API not initialized');
    }

    try {
      const response = await this.classroom.courses.courseWork.list({
        courseId: courseId,
        pageSize: 100,
        orderBy: 'dueDate desc'
      });

      return response.data.courseWork || [];
    } catch (error) {
      console.error('Error fetching class assignments:', error);
      throw error;
    }
  }

  /**
   * Sincroniza una clase de Google Classroom con Happy Tribe
   */
  async syncClassToHappyTribe(googleClass: GoogleClassroomClass): Promise<any> {
    // Esta función se implementará para sincronizar con el backend de Happy Tribe
    const classData = {
      name: googleClass.name,
      description: googleClass.description || '',
      section: googleClass.section || '',
      room: googleClass.room || '',
      googleClassroomId: googleClass.id,
      googleClassroomUrl: `https://classroom.google.com/c/${googleClass.id}`
    };

    // Aquí se haría la llamada al backend de Happy Tribe
    console.log('Syncing class to Happy Tribe:', classData);
    return classData;
  }

  /**
   * Sincroniza estudiantes de Google Classroom con Happy Tribe
   */
  async syncStudentsToHappyTribe(students: GoogleClassroomStudent[], classId: string): Promise<any[]> {
    const studentsData = students.map(student => ({
      firstName: student.profile.name.givenName,
      lastName: student.profile.name.familyName,
      email: student.profile.emailAddress,
      googleClassroomId: student.userId,
      classId: classId,
      role: 'student'
    }));

    console.log('Syncing students to Happy Tribe:', studentsData);
    return studentsData;
  }

  /**
   * Sincroniza tareas de Google Classroom con Happy Tribe
   */
  async syncAssignmentsToHappyTribe(assignments: GoogleClassroomAssignment[], classId: string): Promise<any[]> {
    const assignmentsData = assignments.map(assignment => ({
      title: assignment.title,
      description: assignment.description || '',
      dueDate: assignment.dueDate ? new Date(
        assignment.dueDate.year,
        assignment.dueDate.month - 1,
        assignment.dueDate.day,
        assignment.dueTime?.hours || 0,
        assignment.dueTime?.minutes || 0
      ).toISOString() : null,
      maxPoints: assignment.maxPoints || 100,
      googleClassroomId: assignment.id,
      googleClassroomUrl: assignment.alternateLink,
      classId: classId,
      status: assignment.state === 'PUBLISHED' ? 'active' : 'draft'
    }));

    console.log('Syncing assignments to Happy Tribe:', assignmentsData);
    return assignmentsData;
  }

  /**
   * Cierra sesión y limpia tokens
   */
  logout(): void {
    localStorage.removeItem('google_classroom_tokens');
    this.oauth2Client?.revokeCredentials();
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('google_classroom_tokens');
  }
}

export const googleClassroomService = new GoogleClassroomService();
