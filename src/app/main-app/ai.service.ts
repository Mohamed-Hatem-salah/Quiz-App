import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private apiKey =
    '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';

  constructor(private http: HttpClient) {}
createQuizAdvanced(
  topic: string,
  description: string,   // ✅ new param
  mcq: { easy: number; medium: number; hard: number },
  written: { easy: number; medium: number; hard: number }
): Observable<string | null> {
  const prompt = `
Create a quiz on the topic "${topic}".
Description: "${description}"

MCQ Questions: Easy ${mcq.easy}, Medium ${mcq.medium}, Hard ${mcq.hard}
Written Questions: Easy ${written.easy}, Medium ${written.medium}, Hard ${written.hard}

Constraints:
- Question text max 100 characters
- Do NOT end question text with a "?" character
- Each MCQ option max 50 characters
- Points per question: 1 to 100
- Each question MUST include its difficulty: "easy", "medium", or "hard"
- Return only a JSON array of questions like this:
[
  {
    "text": "...",
    "type": "mcq" | "written",
    "difficulty": "easy" | "medium" | "hard",
    "options": ["...", "...", "...", "..."], // only for MCQ
    "correctAnswer": "...",                  // only for MCQ
    "points": 0 // leave points blank, they will be assigned in app
  }
]
`;

  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.apiKey}`,
    'Content-Type': 'application/json',
  });

  const body = {
    model: 'deepseek/deepseek-chat-v3.1:free',
    messages: [{ role: 'user', content: prompt }],
  };

  return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
    map((res) => {
      console.log('✅ AI raw response:', res);

      if (!res?.choices?.length) {
        console.warn('⚠️ AI response has no choices.');
        return null;
      }

      return res.choices[0]?.message?.content || null;
    }),
    catchError((err) => {
      console.error('❌ AI request error:', err);
      return of(null);
    })
  );
}

}
