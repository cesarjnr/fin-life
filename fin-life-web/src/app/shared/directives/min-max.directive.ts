import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function minMaxValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value.minPercentage + control.value.maxPercentage > 100) {
      return { exceededLimit: true };
    }

    return null;
  };
}
