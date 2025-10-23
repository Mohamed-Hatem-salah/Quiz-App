import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl,
} from '@angular/forms';
import {
  HlmDialog,
  HlmDialogContent,
  HlmDialogFooter,
  HlmDialogHeader,
} from '@spartan-ng/helm/dialog';
import { BrnDialogContent, BrnDialogTrigger } from '@spartan-ng/brain/dialog';

import { HlmInput } from '@spartan-ng/helm/input';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmButton } from '@spartan-ng/helm/button';
import { QuizDataService } from '../../quiz.service';
import { Quiz } from '../../quiz.model';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AiService } from '../../ai.service';
import { AuthService } from '../../../auth.service';
@Component({
  selector: 'app-quiz-form',
  standalone: true,
  imports: [
    HlmButton,
    CommonModule,
    ReactiveFormsModule,
    BrnSelectImports,
    HlmSelectImports,
    HlmInput,
    BrnDialogTrigger,
    BrnDialogContent,
    HlmDialog,
    HlmDialogContent,
    HlmDialogFooter,
    HlmDialogHeader,
  ],
  templateUrl: './quiz-form.component.html',
})
export class QuizFormComponent {
  quizForm: FormGroup;
  minDateTime!: string;

  aiMCQEasy = new FormControl(0, [Validators.required, Validators.min(0)]);
  aiMCQMedium = new FormControl(0, [Validators.required, Validators.min(0)]);
  aiMCQHard = new FormControl(0, [Validators.required, Validators.min(0)]);

  aiWrittenEasy = new FormControl(0, [Validators.required, Validators.min(0)]);
  aiWrittenMedium = new FormControl(0, [
    Validators.required,
    Validators.min(0),
  ]);
  aiWrittenHard = new FormControl(0, [Validators.required, Validators.min(0)]);
  aiMCQEasyPoints = new FormControl(null, [
    Validators.required,
    Validators.min(1),
  ]);
  aiMCQMediumPoints = new FormControl(null, [
    Validators.required,
    Validators.min(1),
  ]);
  aiMCQHardPoints = new FormControl(null, [
    Validators.required,
    Validators.min(1),
  ]);

  aiWrittenEasyPoints = new FormControl(null, [
    Validators.required,
    Validators.min(1),
  ]);
  aiWrittenMediumPoints = new FormControl(null, [
    Validators.required,
    Validators.min(1),
  ]);
  aiWrittenHardPoints = new FormControl(null, [
    Validators.required,
    Validators.min(1),
  ]);
  aiQuizTopic = new FormControl('', [Validators.required]);
  aiQuizDescription = new FormControl('', [Validators.maxLength(100)]);
  /** Temporary controls for the "Add Question" form */
  newQuestionType = new FormControl<'mcq' | 'written'>('mcq', {
    nonNullable: true,
  });
  newQuestionPoints = new FormControl<number>(1, { nonNullable: true });
  newQuestionText = new FormControl<string>('', {
    validators: Validators.required,
    nonNullable: true,
  });
  private minDateTimeValidator(control: FormControl) {
    if (!control.value) return null;
    const selected = new Date(control.value);
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return selected < now ? { minDateTime: true } : null;
  }

  /** ✅ Temporary MCQ state (always 4 options) */
  tempOptionControls: FormArray<FormControl<string>>;
  tempCorrectIndex: number | null = null;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private quizDataService: QuizDataService,
    private location: Location,
    private aiService: AiService,
    private authService: AuthService
  ) {
    this.quizForm = this.fb.nonNullable.group({
      title: ['', Validators.required],
      description: [''],
      duration: [30, [Validators.required, Validators.min(1)]],
      startTime: ['', [Validators.required, this.minDateTimeValidator]],
      questions: this.fb.array<FormGroup>([]),
    });

    // ✅ Initialize 4 empty option controls
    this.tempOptionControls = this.fb.array<FormControl<string>>([
      this.fb.control('', Validators.required) as FormControl<string>,
      this.fb.control('', Validators.required) as FormControl<string>,
      this.fb.control('', Validators.required) as FormControl<string>,
      this.fb.control('', Validators.required) as FormControl<string>,
    ]);
  }

  /** Getter for questions FormArray re*/
  get questions(): FormArray<FormGroup> {
    return this.quizForm.get('questions') as FormArray<FormGroup>;
  }

  /** Get options FormArray for a question */
  getOptions(questionIndex: number): FormArray<FormGroup> {
    return this.questions
      .at(questionIndex)
      .get('options') as FormArray<FormGroup>;
  }

  getOptionControl(questionIndex: number, optionIndex: number): FormControl {
    return this.getOptions(questionIndex)
      .at(optionIndex)
      ?.get('text') as FormControl;
  }

  /** Set a temporary correct option for MCQ creation */
  setTempCorrect(index: number) {
    this.tempCorrectIndex = index;
  }

  /** Add new question from "Add Question" form */
  addNewQuestion() {
    if (!this.newQuestionText.value) return;

    const questionGroup = this.fb.nonNullable.group({
      text: [this.newQuestionText.value, Validators.required],
      type: [this.newQuestionType.value, Validators.required],
      points: [
        this.newQuestionPoints.value,
        [Validators.required, Validators.min(1)],
      ],
      options: this.fb.array<FormGroup>([]),
      correctAnswer: [''],
    });

    if (this.newQuestionType.value === 'mcq') {
      const optsArray = questionGroup.get('options') as FormArray;

      this.tempOptionControls.controls.forEach((ctrl, i) => {
        optsArray.push(
          this.fb.group({
            text: [ctrl.value, Validators.required],
            isCorrect: [i === this.tempCorrectIndex],
          })
        );
      });

      if (this.tempCorrectIndex !== null) {
        questionGroup.patchValue({
          correctAnswer: this.tempOptionControls.at(this.tempCorrectIndex)
            .value,
        });
      }
    }

    this.questions.push(questionGroup);

    // Reset fields
    this.newQuestionText.reset('');
    this.newQuestionType.setValue('mcq');
    this.newQuestionPoints.setValue(1);

    this.tempOptionControls.controls.forEach((ctrl) => ctrl.reset(''));
    this.tempCorrectIndex = null;
  }

  /** Remove a question */
  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  /** Mark an option as correct (for saved questions) */
  setCorrectOption(questionIndex: number, optionIndex: number) {
    const options = this.getOptions(questionIndex);

    options.controls.forEach((opt, i) =>
      opt.patchValue({ isCorrect: i === optionIndex })
    );

    const correctAnswer = options.at(optionIndex).get('text')?.value;
    this.questions.at(questionIndex).patchValue({ correctAnswer });
  }
  @ViewChildren('optionInput') optionInputs!: QueryList<
    ElementRef<HTMLInputElement>
  >;

  /** Focus next input */
  focusNext(nextInput?: HTMLTextAreaElement | HTMLInputElement) {
    nextInput?.focus();
  }
  /** Submit handler */
  submit(ctx?: { close: () => void }) {
    if (!this.quizForm.valid) return;

    const rawValue = this.quizForm.getRawValue();
    const teacherId = this.authService.getUserId();
    
    if (!teacherId) {
      console.error('No teacher ID found');
      return;
    }

    const quiz: Quiz = {
      ...rawValue,
      id: crypto.randomUUID(),
      startTime: new Date(rawValue.startTime),
      teacherId: teacherId,
    };

    this.quizDataService.addQuiz(quiz);
    console.log(quiz);
    ctx?.close();

    this.router.navigate(['/teacher-dashboard'], {
      replaceUrl: true,
    });
  }
  private toggleFormControls(disabled: boolean) {
    const action = disabled ? 'disable' : 'enable';

    this.aiQuizTopic[action]();
    this.aiQuizDescription[action]();
    this.aiMCQEasy[action]();
    this.aiMCQMedium[action]();
    this.aiMCQHard[action]();
    this.aiWrittenEasy[action]();
    this.aiWrittenMedium[action]();
    this.aiWrittenHard[action]();
    this.aiMCQEasyPoints[action]();
    this.aiMCQMediumPoints[action]();
    this.aiMCQHardPoints[action]();
    this.aiWrittenEasyPoints[action]();
    this.aiWrittenMediumPoints[action]();
    this.aiWrittenHardPoints[action]();
  }
  isLoadingAI = false;

  createQuizByAI(
    formValues: {
      topic: string;
      description: string; // ✅ add this
      mcq: { easy: number; medium: number; hard: number };
      written: { easy: number; medium: number; hard: number };
      points: {
        mcq: { easy: number; medium: number; hard: number };
        written: { easy: number; medium: number; hard: number };
      };
    },
    ctx?: { close: () => void }
  ) {
    const { topic, description, mcq, written, points } = formValues;

    this.isLoadingAI = true;
    this.toggleFormControls(true);

    this.aiService
      .createQuizAdvanced(topic, description, mcq, written)
      .subscribe({
        next: (aiResponse: any) => {
          if (!aiResponse) {
            console.log('⚠️ AI API returned null or empty response.');
            this.isLoadingAI = false;
            this.toggleFormControls(false);
            return;
          }

          try {
            const jsonStart = aiResponse.indexOf('[');
            const jsonEnd = aiResponse.lastIndexOf(']');
            if (jsonStart === -1 || jsonEnd === -1)
              throw new Error('Invalid AI response format');

            const questions: any[] = JSON.parse(
              aiResponse.slice(jsonStart, jsonEnd + 1)
            );

            questions.forEach((q) => {
              this.newQuestionText.setValue(q.text || '');
              this.newQuestionType.setValue(q.type);

              const difficulty = (
                (q.difficulty || 'medium') as string
              ).toLowerCase() as 'easy' | 'medium' | 'hard';

              let questionPoints = 10; // fallback

              if (q.type?.toLowerCase() === 'mcq') {
                questionPoints = points.mcq[difficulty] ?? 10;
              } else if (q.type?.toLowerCase() === 'written') {
                questionPoints = points.written[difficulty] ?? 10;
              }

              this.newQuestionPoints.setValue(questionPoints);

              if (q.type?.toLowerCase() === 'mcq' && q.options) {
                this.tempOptionControls.controls.forEach((ctrl, i) => {
                  ctrl.setValue(q.options[i] || '');
                });
                this.tempCorrectIndex = q.options.indexOf(q.correctAnswer);
              }

              this.addNewQuestion();
            });

            console.log('✅ AI Quiz generated successfully.');

            // reset after generation
            this.aiQuizTopic.reset('');
            this.aiQuizDescription.reset('');
            this.aiMCQEasy.reset(0);
            this.aiMCQMedium.reset(0);
            this.aiMCQHard.reset(0);
            this.aiWrittenEasy.reset(0);
            this.aiWrittenMedium.reset(0);
            this.aiWrittenHard.reset(0);

            // reset points
            this.aiMCQEasyPoints.reset(null);
            this.aiMCQMediumPoints.reset(null);
            this.aiMCQHardPoints.reset(null);
            this.aiWrittenEasyPoints.reset(null);
            this.aiWrittenMediumPoints.reset(null);
            this.aiWrittenHardPoints.reset(null);

            ctx?.close();
          } catch (err: any) {
            console.error('❌ Error parsing AI response', err);
          } finally {
            this.isLoadingAI = false;
            this.toggleFormControls(false);
          }
        },
        error: (err: any) => {
          console.error('❌ AI service error:', err);
          this.isLoadingAI = false;
          this.toggleFormControls(false);
        },
      });
  }

  goBack() {
    this.location.back();
  }
}
