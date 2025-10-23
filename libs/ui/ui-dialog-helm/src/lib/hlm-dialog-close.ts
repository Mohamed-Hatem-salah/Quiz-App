import { Directive, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

@Directive({
  selector: '[hlmDialogClose],[brnDialogClose][hlm]',
  host: {
    '[class]': '_computedClass()',
  },
})
export class HlmDialogClose {
  public readonly userClass = input<ClassValue>('', { alias: 'class' });

  protected readonly _computedClass = computed(() =>
    hlm(
      'cursor-pointer absolute right-4 top-4 h-6 w-6 flex justify-center  items-center rounded-sm opacity-70 ring-offset-background transition-all' +
        'hover:opacity-100 hover:ring-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-primary focus:rounded-sm' +
        'disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground',
      this.userClass()
    )
  );
}
