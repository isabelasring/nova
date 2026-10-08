import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';

export function pageSlice<T>(
  items: readonly T[],
  page: number,
  pageSize: number
): T[] {

  const size = Math.max(1, pageSize);
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), pages);
  const start = (current - 1) * size;

  return items.slice(start, start + size);

}

@Component({
  selector: 'app-pager',
  standalone: true,
  templateUrl: './pager.html',
  styleUrl: './pager.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PagerComponent {

  readonly page = input(1);

  readonly pageSize = input(10);

  readonly total = input(0);

  readonly pageChange = output<number>();

  readonly pageSizeChange = output<number>();

  readonly sizes = [10, 20, 50];

  readonly pages = computed(() =>
    Math.max(1, Math.ceil(this.total() / Math.max(1, this.pageSize())))
  );

  readonly current = computed(() =>
    Math.min(Math.max(1, this.page()), this.pages())
  );

  previous(): void {

    const current = this.current();

    if (current > 1) {
      this.pageChange.emit(current - 1);
    }

  }

  next(): void {

    const current = this.current();

    if (current < this.pages()) {
      this.pageChange.emit(current + 1);
    }

  }

  changeSize(value: string): void {

    const size = Number(value);

    if (this.sizes.includes(size)) {
      this.pageSizeChange.emit(size);
    }

  }

}
