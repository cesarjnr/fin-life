import { FormGroup } from '@angular/forms';

type NonNullish<T> = {
  [K in keyof T]: Exclude<T[K], null | undefined>;
};

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

export const removeNullishValues = <T extends object>(
  formValue: T,
): NonNullish<T> => {
  return Object.fromEntries(
    Object.entries(formValue).filter(([, value]) => value != null),
  ) as NonNullish<T>;
};
