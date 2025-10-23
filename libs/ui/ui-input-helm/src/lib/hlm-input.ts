import {
  computed,
  Directive,
  type DoCheck,
  effect,
  forwardRef,
  inject,
  Injector,
  input,
  linkedSignal,
  untracked,
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { hlm } from '@spartan-ng/brain/core';
import { BrnFormFieldControl } from '@spartan-ng/brain/form-field';
import { ErrorStateMatcher, ErrorStateTracker } from '@spartan-ng/brain/forms';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const inputVariants = cva(
  'file:text-foreground placeholder:text-muted-foreground flex min-w-0 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50  border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary  duration-300 w-full',
  {
    variants: {
      error: {
        auto: '',
        true: 'placeholder:text-red-300 my-autofill-input bg-destructive-soft text-destructive/80 border-destructive focus-visible:ring-destructive focus-visible:border-destructive [&.ng-invalid.ng-touched]:text-destructive/60 dark:[&.ng-invalid.ng-touched]:text-destructive/80 [&.ng-invalid.ng-touched]:border-destructive [&.ng-invalid.ng-touched]:focus-visible:ring-destructive',
      },
    },
    defaultVariants: {
      error: 'auto',
    },
  }
);
type InputVariants = VariantProps<typeof inputVariants>;

@Directive({
  selector: '[hlmInput]',
  host: {
    '[class]': '_computedClass()',
  },
  providers: [
    {
      provide: BrnFormFieldControl,
      useExisting: forwardRef(() => HlmInput),
    },
  ],
})
export class HlmInput implements BrnFormFieldControl, DoCheck {
  public readonly error = input<InputVariants['error']>('auto');

  protected readonly _state = linkedSignal(() => ({ error: this.error() }));

  public readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly _computedClass = computed(() =>
    hlm(inputVariants({ error: this._state().error }), this.userClass())
  );

  private readonly _injector = inject(Injector);

  public readonly ngControl: NgControl | null = this._injector.get(
    NgControl,
    null
  );

  private readonly _errorStateTracker: ErrorStateTracker;

  private readonly _defaultErrorStateMatcher = inject(ErrorStateMatcher);
  private readonly _parentForm = inject(NgForm, { optional: true });
  private readonly _parentFormGroup = inject(FormGroupDirective, {
    optional: true,
  });

  public readonly errorState = computed(() =>
    this._errorStateTracker.errorState()
  );

  constructor() {
    this._errorStateTracker = new ErrorStateTracker(
      this._defaultErrorStateMatcher,
      this.ngControl,
      this._parentFormGroup,
      this._parentForm
    );

    effect(() => {
      const error = this._errorStateTracker.errorState();
      untracked(() => {
        if (this.ngControl) {
          const shouldShowError =
            error &&
            this.ngControl.invalid &&
            (this.ngControl.touched || this.ngControl.dirty);
          this._errorStateTracker.errorState.set(
            shouldShowError ? true : false
          );
          this.setError(shouldShowError ? true : 'auto');
        }
      });
    });
  }

  ngDoCheck() {
    this._errorStateTracker.updateErrorState();
  }

  setError(error: InputVariants['error']) {
    this._state.set({ error });
  }
}
