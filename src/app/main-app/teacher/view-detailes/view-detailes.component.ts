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
import { ActivatedRoute, Router } from '@angular/router';
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
import { Location } from '@angular/common';
@Component({
  selector: 'app-view-detailes',
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
  templateUrl: './view-detailes.component.html',
  styleUrls: ['./view-detailes.component.css'],
})
export class ViewDetailesComponent {
  quizForm: FormGroup;
  isEditing = false;
  currentQuizId: string | null = null; // store the loaded quiz ID
  minDateTime!: string;

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

  /** Temporary MCQ state */
  tempOptionControls: FormArray<FormControl<string | null>>;
  tempCorrectIndex: number | null = null;

  @ViewChildren('optionInput') optionInputs!: QueryList<
    ElementRef<HTMLInputElement>
  >;

  constructor(
    private location: Location,
    private router: Router,
    private fb: FormBuilder,
    private quizDataService: QuizDataService,
    private route: ActivatedRoute // <-- inject ActivatedRoute
  ) {
    // Initialize quiz form
    this.quizForm = this.fb.nonNullable.group({
      title: ['', Validators.required],
      description: [''],
      duration: [30, [Validators.required, Validators.min(1)]],
      startTime: ['', [Validators.required, this.minDateTimeValidator]],
      questions: this.fb.array<FormGroup>([]),
    });

    // Initialize temporary MCQ options
    this.tempOptionControls = this.fb.array<FormControl<string | null>>([
      this.fb.control('', Validators.required),
      this.fb.control('', Validators.required),
      this.fb.control('', Validators.required),
      this.fb.control('', Validators.required),
    ]);

    // Load quiz from route param
    this.route.params.subscribe((params) => {
      const quizId = params['id'];
      if (!quizId) return;
      const quiz = this.quizDataService.getQuizById(quizId);
      if (quiz) {
        this.currentQuizId = quiz.id;
        this.loadQuiz(quiz);
      }
    });
  }

  /** Load quiz into the form */
  loadQuiz(quiz: Quiz) {
    this.currentQuizId = quiz.id;
    const startTimeLocal = new Date(quiz.startTime);
    const tzOffset = startTimeLocal.getTimezoneOffset() * 60000; // offset in ms
    const localISOTime = new Date(startTimeLocal.getTime() - tzOffset)
      .toISOString()
      .slice(0, 16);

    this.quizForm.patchValue({
      title: quiz.title,
      description: quiz.description,
      duration: quiz.duration,
      startTime: localISOTime,
    });

    const questionGroups = quiz.questions.map((q) =>
      this.fb.group({
        text: [q.text, Validators.required],
        type: [q.type, Validators.required],
        points: [q.points, [Validators.required, Validators.min(1)]],
        options: this.fb.array(
          (q.options ?? []).map((o) =>
            this.fb.group({
              text: [o.text, Validators.required],
              isCorrect: [o.isCorrect ?? false],
            })
          )
        ),
        correctAnswer: [q.correctAnswer],
      })
    );

    const questionsArray = this.fb.array(questionGroups);
    this.quizForm.setControl('questions', questionsArray);

    this.lockForm();
  }

  /** Get questions FormArray */
  get questions(): FormArray<FormGroup> {
    return this.quizForm.get('questions') as FormArray<FormGroup>;
  }

  /** Get options FormArray for a question */
  getOptions(questionIndex: number): FormArray<FormGroup> {
    return this.questions
      .at(questionIndex)
      .get('options') as FormArray<FormGroup>;
  }

  /** Mark option correct for saved question */
  setCorrectOption(questionIndex: number, optionIndex: number) {
    const options = this.getOptions(questionIndex);
    options.controls.forEach((opt, i) =>
      opt.patchValue({ isCorrect: i === optionIndex })
    );
    const correctAnswer = options.at(optionIndex).get('text')?.value ?? '';
    this.questions.at(questionIndex).patchValue({ correctAnswer });
  }

  /** Add new question */
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
          correctAnswer:
            this.tempOptionControls.at(this.tempCorrectIndex)?.value ?? '',
        });
      }
    }

    this.questions.push(questionGroup);

    // Reset temporary fields
    this.newQuestionText.reset('');
    this.newQuestionType.setValue('mcq');
    this.newQuestionPoints.setValue(1);
    this.tempOptionControls.controls.forEach((ctrl) => ctrl.reset(''));
    this.tempCorrectIndex = null;
  }

  /** Remove question */
  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  /** Set temporary correct option */
  setTempCorrect(index: number) {
    this.tempCorrectIndex = index;
  }

  /** Focus next input */
  focusNext(nextInput?: HTMLTextAreaElement | HTMLInputElement) {
    nextInput?.focus();
  }

  /** Enable form for editing */
  unlockForm() {
    this.quizForm.enable();
    this.isEditing = true;
  }

  /** Disable form */
  lockForm() {
    this.quizForm.disable();
    this.isEditing = false;
  }

  /** Submit new or updated quiz */
  updateQuiz() {
    if (this.quizForm.invalid || !this.currentQuizId) return;

    const rawValue = this.quizForm.getRawValue();
    const updatedQuiz: Partial<Quiz> = {
      title: rawValue.title,
      description: rawValue.description,
      duration: rawValue.duration,
      startTime: new Date(rawValue.startTime),
      questions: rawValue.questions,
    };

    this.quizDataService.updateQuiz(this.currentQuizId, updatedQuiz);
    this.router.navigate(['/teacher-dashboard']);
  }
  enableEdit() {
    this.quizForm.enable(); // Allow input fields to be edited
    this.isEditing = true; // Show the “Add Question” form and update button
  }
  /** Delete all quizzes */
  deleteQuiz() {
    if (!this.currentQuizId) return;
    this.quizDataService.deleteQuiz(this.currentQuizId);
    this.router.navigate(['/teacher-dashboard'], {
      replaceUrl: true,
    });
  }
  goBack() {
    this.location.back();
  }
}
