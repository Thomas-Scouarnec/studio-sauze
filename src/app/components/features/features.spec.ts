import { TestBed } from '@angular/core/testing';
import { FeaturesComponent } from './features';

describe('FeaturesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturesComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(FeaturesComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render 6 feature cards', async () => {
    const fixture = TestBed.createComponent(FeaturesComponent);
    await fixture.whenStable();
    const cards = fixture.nativeElement.querySelectorAll('.feature-card');
    expect(cards.length).toBe(6);
  });

  it('should display a title and description for each card', async () => {
    const fixture = TestBed.createComponent(FeaturesComponent);
    await fixture.whenStable();
    const titles = fixture.nativeElement.querySelectorAll('.feature-title');
    const descs = fixture.nativeElement.querySelectorAll('.feature-desc');
    titles.forEach((el: HTMLElement) => expect(el.textContent?.trim().length).toBeGreaterThan(0));
    descs.forEach((el: HTMLElement) => expect(el.textContent?.trim().length).toBeGreaterThan(0));
  });

  it('should have the correct ARIA attributes on the host element', () => {
    const fixture = TestBed.createComponent(FeaturesComponent);
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('role')).toBe('region');
    expect(host.getAttribute('aria-labelledby')).toBe('features-heading');
  });

  it('should mark feature icons as aria-hidden', async () => {
    const fixture = TestBed.createComponent(FeaturesComponent);
    await fixture.whenStable();
    const icons = fixture.nativeElement.querySelectorAll('.feature-icon');
    icons.forEach((el: HTMLElement) => expect(el.getAttribute('aria-hidden')).toBe('true'));
  });
});
