// Prints the Lighthouse scores of each page (the median run lhci kept), and
// on GitHub adds them to the run's summary page. Run after `lhci upload`.
import { appendFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const reportDir = 'lighthouse-report';
const runs = JSON.parse(readFileSync(join(reportDir, 'manifest.json'), 'utf8'));
const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
const score = (value) => (value === null || value === undefined ? '—' : Math.round(value * 100));

const rows = runs
  .filter((run) => run.isRepresentativeRun)
  .map((run) => {
    const path = new URL(run.url).pathname;
    // Every run's performance, to see how much it varies on this machine.
    const performances = runs
      .filter((other) => other.url === run.url)
      .map((other) => score(other.summary.performance));
    return [
      path,
      ...categories.map((category) => score(run.summary[category])),
      performances.join(', '),
    ];
  });

const header = [
  'Page',
  'Performance',
  'Accessibility',
  'Best practices',
  'SEO',
  'Performance, every run',
];
console.table(rows.map((row) => Object.fromEntries(header.map((name, i) => [name, row[i]]))));

const summary = process.env['GITHUB_STEP_SUMMARY'];
if (summary) {
  const line = (cells) => `| ${cells.join(' | ')} |\n`;
  appendFileSync(
    summary,
    '## Lighthouse (median of 3 runs)\n\n' +
      line(header) +
      line(header.map(() => '---')) +
      rows.map(line).join(''),
  );
}
