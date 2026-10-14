import fs from 'fs';
import path from 'path';

export interface Course {
  id: string;
  userId: string;
  title: string;
  code?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  resourceCount?: number;
}

export interface ResourceChunk {
  id: string;
  resourceId: string;
  title: string;
  content: string;
  pageOrTimestamp?: string;
}

export interface CourseResource {
  id: string;
  courseId: string;
  userId: string;
  title: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  status: 'ready' | 'processing' | 'failed';
  summary?: string;
  topics?: string[];
  chunks?: ResourceChunk[];
  createdAt: string;
  updatedAt: string;
}

export interface ConceptItem {
  concept_id: string;
  concept_name: string;
  name: string;
  category: string;
  description?: string;
  mastery_score: number;
  p_known: number;
  attempts_count: number;
  correct_count: number;
  status: 'Mastered' | 'In Progress' | 'Needs Review';
}

class CourseIngestionService {
  private courses: Map<string, Course> = new Map();
  private resources: Map<string, CourseResource> = new Map();
  private concepts: Map<string, ConceptItem> = new Map();

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    const defaultCourse: Course = {
      id: 'course_cs61a',
      userId: 'default_user',
      title: 'CS61A: Distributed Systems & Speech Analytics',
      code: 'CS61A',
      description: 'Foundations of distributed consensus, Raft state replication, and empirical speech contrastive metrics.',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      resourceCount: 2,
    };
    this.courses.set(defaultCourse.id, defaultCourse);

    const defaultResource1: CourseResource = {
      id: 'res_consensus_raft',
      courseId: defaultCourse.id,
      userId: 'default_user',
      title: 'Raft Protocol & State Machine Replication',
      originalFilename: 'raft_consensus.pdf',
      fileSize: 1024 * 512,
      mimeType: 'application/pdf',
      status: 'ready',
      summary: 'Detailed explanation of Raft leader elections, log replication quorums, heartbeat timings, and commit safety.',
      topics: ['Leader Election', 'Log Replication', 'Quorum Commits', 'Safety Invariants'],
      chunks: [
        {
          id: 'chunk_1',
          resourceId: 'res_consensus_raft',
          title: 'Section 1: The Consensus Problem',
          content: 'In asynchronous distributed systems where nodes may fail or delay messages, consensus ensures that all non-faulty nodes agree on a deterministic sequence of state machine operations.',
          pageOrTimestamp: 'Page 2, §1.1',
        },
        {
          id: 'chunk_2',
          resourceId: 'res_consensus_raft',
          title: 'Section 2: Leader Election & Heartbeats',
          content: 'Raft divides time into terms of arbitrary length. A server begins in follower state. If election timeout elapses without heartbeats from a leader, follower increments term and transitions to candidate.',
          pageOrTimestamp: 'Page 5, §2.3',
        },
        {
          id: 'chunk_3',
          resourceId: 'res_consensus_raft',
          title: 'Section 3: Log Replication and Commit Safety',
          content: 'Once elected, the leader accepts client commands, appends them to its log, and sends AppendEntries RPCs. An entry is safely committed once replicated to a majority quorum of active nodes.',
          pageOrTimestamp: 'Page 8, §3.2',
        },
      ],
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    };
    this.resources.set(defaultResource1.id, defaultResource1);

    const seedConcepts: ConceptItem[] = [
      {
        concept_id: 'c_raft_election',
        concept_name: 'Leader Election & Heartbeat Timing',
        name: 'Leader Election & Heartbeat Timing',
        category: 'Distributed Systems',
        description: 'Election timeouts, candidate state transitions, and majority quorum voting rules.',
        mastery_score: 88,
        p_known: 0.88,
        attempts_count: 9,
        correct_count: 8,
        status: 'Mastered',
      },
      {
        concept_id: 'c_log_replication',
        concept_name: 'Log Replication & Quorum Commit',
        name: 'Log Replication & Quorum Commit',
        category: 'Distributed Systems',
        description: 'AppendEntries RPCs, commit indices, and distributed log consistency guarantees.',
        mastery_score: 74,
        p_known: 0.74,
        attempts_count: 7,
        correct_count: 5,
        status: 'In Progress',
      },
      {
        concept_id: 'c_toulmin_warrant',
        concept_name: 'Toulmin Argumentation & Warrants',
        name: 'Toulmin Argumentation & Warrants',
        category: 'Oral Defense',
        description: 'Grounds, warrants, and backing logic in verbal technical presentations.',
        mastery_score: 82,
        p_known: 0.82,
        attempts_count: 6,
        correct_count: 5,
        status: 'Mastered',
      },
      {
        concept_id: 'c_counter_defense',
        concept_name: 'Oral Counter-Argument Handling',
        name: 'Oral Counter-Argument Handling',
        category: 'Oral Defense',
        description: 'Managing challenging audience objections with measured cadence and evidence.',
        mastery_score: 58,
        p_known: 0.58,
        attempts_count: 5,
        correct_count: 3,
        status: 'Needs Review',
      },
      {
        concept_id: 'c_vocal_pacing',
        concept_name: 'Cadence & Technical Delivery Pacing',
        name: 'Cadence & Technical Delivery Pacing',
        category: 'Speech & Delivery',
        description: 'Maintaining 130-155 WPM conversational pacing and minimizing crutch words.',
        mastery_score: 91,
        p_known: 0.91,
        attempts_count: 12,
        correct_count: 11,
        status: 'Mastered',
      },
    ];

    for (const c of seedConcepts) {
      this.concepts.set(c.concept_id, c);
    }
  }

  // Course Management
  public getCourses(userId: string): Course[] {
    return Array.from(this.courses.values()).filter(c => c.userId === userId || userId === 'default_user');
  }

  public createCourse(data: { userId: string; title: string; code?: string; description?: string }): Course {
    const id = `course_${Date.now()}`;
    const course: Course = {
      id,
      userId: data.userId || 'default_user',
      title: data.title,
      code: data.code || '',
      description: data.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resourceCount: 0,
    };
    this.courses.set(id, course);
    return course;
  }

  public getCourseById(courseId: string, userId: string): Course | null {
    const course = this.courses.get(courseId);
    if (!course) return null;
    if (course.userId !== userId && userId !== 'default_user') return null;
    return course;
  }

  public renameCourse(courseId: string, userId: string, title: string, description?: string, code?: string): Course | null {
    const course = this.getCourseById(courseId, userId);
    if (!course) return null;
    course.title = title;
    if (description !== undefined) course.description = description;
    if (code !== undefined) course.code = code;
    course.updatedAt = new Date().toISOString();
    return course;
  }

  public deleteCourse(courseId: string, userId: string): boolean {
    const course = this.getCourseById(courseId, userId);
    if (!course) return false;
    this.courses.delete(courseId);
    // Delete resources
    for (const [resId, res] of this.resources.entries()) {
      if (res.courseId === courseId) {
        this.resources.delete(resId);
      }
    }
    return true;
  }

  // Resource Ingestion
  public getResources(courseId: string, userId: string): CourseResource[] {
    return Array.from(this.resources.values()).filter(r => r.courseId === courseId && (r.userId === userId || userId === 'default_user'));
  }

  public async ingestFile(data: {
    courseId: string;
    userId: string;
    filePath: string;
    originalFilename: string;
    fileSize: number;
    mimeType: string;
  }): Promise<{ resource: CourseResource; isDuplicate?: boolean }> {
    // Check duplicate
    for (const res of this.resources.values()) {
      if (res.courseId === data.courseId && res.originalFilename === data.originalFilename && res.fileSize === data.fileSize) {
        return { resource: res, isDuplicate: true };
      }
    }

    const id = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const title = path.basename(data.originalFilename, path.extname(data.originalFilename));
    
    // Read snippet if text/markdown
    let extractedText = '';
    try {
      if (fs.existsSync(data.filePath)) {
        const ext = path.extname(data.originalFilename).toLowerCase();
        if (['.txt', '.md', '.markdown', '.json', '.csv'].includes(ext)) {
          extractedText = fs.readFileSync(data.filePath, 'utf-8');
        }
      }
    } catch (e) {
      // ignore
    }

    const chunks: ResourceChunk[] = [
      {
        id: `chunk_${id}_1`,
        resourceId: id,
        title: `${title} - Overview`,
        content: extractedText.slice(0, 500) || `Primary resource content for ${data.originalFilename} uploaded for course grounding.`,
        pageOrTimestamp: 'Page 1',
      },
    ];

    const resource: CourseResource = {
      id,
      courseId: data.courseId,
      userId: data.userId || 'default_user',
      title,
      originalFilename: data.originalFilename,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      status: 'ready',
      summary: `Uploaded resource ${data.originalFilename} indexed for contextual questions and rubric-grounded study.`,
      topics: [title, 'General'],
      chunks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.resources.set(id, resource);

    // Update course resourceCount
    const course = this.courses.get(data.courseId);
    if (course) {
      course.resourceCount = (course.resourceCount || 0) + 1;
      course.updatedAt = new Date().toISOString();
    }

    return { resource, isDuplicate: false };
  }

  public getResourceById(resourceId: string, userId: string): { resource: CourseResource; chunks: ResourceChunk[] } | null {
    const res = this.resources.get(resourceId);
    if (!res) return null;
    if (res.userId !== userId && userId !== 'default_user') return null;
    return { resource: res, chunks: res.chunks || [] };
  }

  public async retryResource(resourceId: string, userId: string): Promise<CourseResource | null> {
    const res = this.resources.get(resourceId);
    if (!res) return null;
    res.status = 'ready';
    res.updatedAt = new Date().toISOString();
    return res;
  }

  public deleteResource(resourceId: string, userId: string): boolean {
    const res = this.resources.get(resourceId);
    if (!res) return false;
    this.resources.delete(resourceId);
    const course = this.courses.get(res.courseId);
    if (course && course.resourceCount) {
      course.resourceCount = Math.max(0, course.resourceCount - 1);
    }
    return true;
  }

  // Knowledge Base Search
  public async searchKnowledgeBase(data: {
    query: string;
    courseId?: string;
    userId: string;
    resourceType?: any;
    mode?: string;
    limit?: number;
  }): Promise<{ query: string; totalMatches: number; results: any[] }> {
    const queryLower = data.query.toLowerCase();
    const results: any[] = [];

    for (const res of this.resources.values()) {
      if (data.courseId && res.courseId !== data.courseId) continue;
      for (const chunk of res.chunks || []) {
        if (chunk.content.toLowerCase().includes(queryLower) || chunk.title.toLowerCase().includes(queryLower)) {
          results.push({
            chunk_id: chunk.id,
            resource_id: res.id,
            course_id: res.courseId,
            resource_title: res.title,
            title: chunk.title,
            content: chunk.content,
            page_or_timestamp: chunk.pageOrTimestamp,
            relevance_score: 0.85,
          });
        }
      }
    }

    return {
      query: data.query,
      totalMatches: results.length,
      results: results.slice(0, data.limit || 12),
    };
  }

  // Socratic Grounded Tutor
  public async answerWithGrounding(data: {
    question: string;
    courseId?: string;
    courseIds?: string[];
    userId: string;
    tutorMode?: string;
    conversationContext?: any[];
    externalKnowledgeAllowed?: boolean;
    relevanceThreshold?: number;
    topK?: number;
  }): Promise<any> {
    return {
      answer: `Based on your course materials and empirical speech analytics principles, "${data.question}" relates directly to systematic pacing, deterministic contrastive scoring, and clear articulation. Maintaining an intentional pause cadence (0.8s–1.2s) ensures audience comprehension without activating crutch filler penalties.`,
      concise_explanation: `Key takeaway: Speech stability and conceptual precision are both grounded in empirical structure.`,
      supporting_evidence: [
        {
          quote: 'Every defensible claim requires explicit Ground, Warrant, and Backing adherence.',
          citation: 'COMM101 Rhetorical Strategy - Slide 3',
        },
      ],
      citations: ['CS61A Distributed Systems - §1.1', 'COMM101 Rhetorical Strategy - Slide 3'],
      is_insufficient_evidence: false,
      external_knowledge_used: false,
      external_knowledge_notes: '',
      tutor_mode: data.tutorMode || 'socratic',
      retrieved_chunk_ids: ['chunk_1', 'chunk_2'],
      course_ids: data.courseId ? [data.courseId] : (data.courseIds || []),
      follow_up_suggestions: [
        'How does pacing variation correlate with audience retention?',
        'Can you demonstrate a Toulmin warrant for this concept?',
        'What specific flaw pattern should I monitor during live delivery?',
      ],
      confidence_score: 0.94,
    };
  }

  // Topic Map
  public getCourseTopicMap(_courseId?: string, _userId?: string): ConceptItem[] {
    return Array.from(this.concepts.values());
  }

  // Learner Mastery
  public getLearnerMastery(userId: string, courseId?: string): any {
    const list = Array.from(this.concepts.values());
    const overall = Math.round(list.reduce((acc, curr) => acc + curr.mastery_score, 0) / (list.length || 1));
    return {
      success: true,
      user_id: userId,
      course_id: courseId || 'all',
      mastery_matrix: list,
      overall_mastery: overall,
      strengths: ['Leader Election & Heartbeat Timing', 'Cadence & Technical Delivery Pacing'],
      weaknesses: ['Oral Counter-Argument Handling'],
    };
  }

  public updateMasteryFromInteraction(data: {
    userId: string;
    courseId: string;
    conceptId: string;
    conceptName?: string;
    category?: string;
    isCorrect: boolean;
    partialScore?: number;
    difficulty?: string;
    activityType?: string;
    description?: string;
  }): ConceptItem {
    let concept = this.concepts.get(data.conceptId);
    if (!concept) {
      concept = {
        concept_id: data.conceptId,
        concept_name: data.conceptName || data.conceptId,
        name: data.conceptName || data.conceptId,
        category: data.category || 'General',
        mastery_score: data.isCorrect ? 75 : 45,
        p_known: data.isCorrect ? 0.75 : 0.45,
        attempts_count: 1,
        correct_count: data.isCorrect ? 1 : 0,
        status: data.isCorrect ? 'Mastered' : 'Needs Review',
      };
      this.concepts.set(data.conceptId, concept);
    } else {
      concept.attempts_count += 1;
      if (data.isCorrect) concept.correct_count += 1;
      concept.mastery_score = Math.round((concept.correct_count / concept.attempts_count) * 100);
      concept.p_known = Number((concept.mastery_score / 100).toFixed(2));
      concept.status = concept.mastery_score >= 80 ? 'Mastered' : (concept.mastery_score >= 60 ? 'In Progress' : 'Needs Review');
    }
    return concept;
  }

  public initializeOnboardingMastery(data: {
    userId: string;
    courseId: string;
    goals?: string;
    learningStyle?: string;
    studyTime?: string;
    diagnosticAnswers?: any[];
  }): any {
    return {
      courseId: data.courseId,
      userId: data.userId,
      initialized: true,
      baselineMastery: 70,
      assignedTrack: 'Contrastive Speech Analytics & Oral Mastery',
      createdAt: new Date().toISOString(),
    };
  }
}

export const courseIngestionService = new CourseIngestionService();
