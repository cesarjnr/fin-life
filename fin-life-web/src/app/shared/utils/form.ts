import { FormGroup } from '@angular/forms';

export const getErrorMessage = (
  form: FormGroup,
  controlName: string,
  label: string,
): string => {
  const control = form.controls[controlName];
  let errorMessage = '';

  if (control.hasError('required')) {
    errorMessage = `${label} is required`;
  } else if (control.hasError('email')) {
    errorMessage = `${label} must be a valid email`;
  }

  return errorMessage;
};
