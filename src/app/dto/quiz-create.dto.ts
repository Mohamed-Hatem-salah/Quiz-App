// src/app/dto/quiz-create.dto.ts

// اختيار في سؤال الـMCQ
export interface OptionCreateDTO {
  answer: string;
  isCorrect: boolean;
}

// سؤال واحد
export interface QuestionCreateDTO {
  text: string;
  // في الفورم بنستخدم 'mcq' | 'written'؛ هنا نبعته uppercase
  type: 'MCQ' | 'WRITTEN';
  grade: number;
  // لو Written بتكون undefined
  options?: OptionCreateDTO[];
}

// إنشاء كويز
// ملاحظة: startTime/endTime يقبلوا string أو Date (السيرفس بيطبّعهم)
export interface QuizCreateDTO {
  title: string;
  description?: string;
  duration: number;
  startTime: string | Date;
  endTime?: string | Date;
  questions: QuestionCreateDTO[];
}

