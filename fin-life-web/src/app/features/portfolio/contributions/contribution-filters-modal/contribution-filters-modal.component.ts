import {
  Component,
  inject,
  OnInit,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxMaskDirective } from 'ngx-mask';

import { AssetCategories, AssetClasses } from '../../../../core/dtos/asset.dto';
import { parseMonetaryValue } from '../../../../shared/utils/number';

export interface ContributionFiltersForm {
  groupBy: FormControl<string | null>;
  monthContribution: FormControl<string | null>;
  targetPercentages?: FormArray<
    FormGroup<{
      label: FormControl<string | null>;
      percentage: FormControl<number | null>;
    }>
  >;
}
export interface ContributionFiltersFormValues {
  groupBy: string;
  monthContribution: number;
  targetPercentages?: {
    label: string;
    percentage: number;
  }[];
}

@Component({
  selector: 'app-contribution-filters-modal',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    NgxMaskDirective,
  ],
  templateUrl: './contribution-filters-modal.component.html',
  styleUrls: ['./contribution-filters-modal.component.scss'],
})
export class ContributionFiltersModalComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  public readonly cancel = output<void>();
  public readonly apply = output<ContributionFiltersFormValues>();
  public readonly contributionFiltersModalContentTemplate = viewChild<
    TemplateRef<any>
  >('contributionFiltersModalContentTemplate');
  public readonly contributionFitltersModalActionsTemplate = viewChild<
    TemplateRef<any>
  >('contributionFitltersModalActionsTemplate');
  public readonly contributionFiltersForm =
    this.formBuilder.group<ContributionFiltersForm>({
      groupBy: this.formBuilder.control('portfolio'),
      monthContribution: this.formBuilder.control('0'),
    });
  public readonly groupByInputOptions = [
    { label: 'Portfólio', value: 'portfolio' },
    { label: 'Categoria', value: 'category' },
    { label: 'Classe', value: 'class' },
  ];

  public ngOnInit(): void {
    this.contributionFiltersForm.controls.groupBy.valueChanges.subscribe({
      next: () => {
        this.setupTargetPercentageForm();
      },
    });
  }

  public handleCancelButtonClick(): void {
    this.cancel.emit();
    this.contributionFiltersForm.reset({
      groupBy: 'portfolio',
      monthContribution: '0',
    });
  }

  public handleConfirmButtonClick(): void {
    const formValues = this.contributionFiltersForm.getRawValue();

    this.apply.emit({
      groupBy: formValues.groupBy!,
      monthContribution: parseMonetaryValue(formValues.monthContribution!),
      targetPercentages: formValues.targetPercentages?.map(
        (targetPercentage) => ({
          label: targetPercentage.label!,
          percentage: targetPercentage.percentage! / 100,
        }),
      ),
    });
  }

  private setupTargetPercentageForm(): void {
    this.contributionFiltersForm.removeControl('targetPercentages');

    if (
      this.contributionFiltersForm.controls.groupBy.value === 'category' ||
      this.contributionFiltersForm.controls.groupBy.value === 'class'
    ) {
      const enumToBeUsed =
        this.contributionFiltersForm.controls.groupBy.value === 'class'
          ? AssetClasses
          : AssetCategories;
      const percentageLabels: string[] = Object.values(enumToBeUsed);

      this.contributionFiltersForm.addControl(
        'targetPercentages',
        this.formBuilder.array(
          percentageLabels.map((label) =>
            this.formBuilder.group({
              label: this.formBuilder.control({ value: label, disabled: true }),
              percentage: this.formBuilder.control(0, Validators.required),
            }),
          ),
        ),
      );
    }
  }
}
