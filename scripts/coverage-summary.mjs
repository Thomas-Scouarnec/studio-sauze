// Prints the unit tests' coverage, and on GitHub adds it to the run's summary
// page. Run after `npm run test:coverage`, which writes the JSON summary.
import { appendFileSync, existsSync, readFileSync } from 'node:fs';

const file = 'coverage/studio-sauze/coverage-summary.json';
if (!existsSync(file)) {
  console.error(`${file} not found: the tests did not run to the end.`);
  process.exit(1);
}

const { total } = JSON.parse(readFileSync(file, 'utf8'));
// The floors are in angular.json (coverageThresholds).
const { coverageThresholds: floors } = JSON.parse(readFileSync('angular.json', 'utf8')).projects[
  'studio-sauze'
].architect.test.options;

const rows = ['lines', 'statements', 'branches', 'functions'].map((measure) => {
  const { pct, covered, total: all } = total[measure];
  return [
    measure,
    `${pct} %`,
    `${covered} / ${all}`,
    `${floors[measure]} %`,
    pct >= floors[measure] ? '✅' : '❌',
  ];
});
const header = ['Measure', 'Coverage', 'Covered', 'Floor', ''];
console.table(
  rows.map((row) => Object.fromEntries(header.map((name, i) => [name || 'Met', row[i]]))),
);

const summary = process.env['GITHUB_STEP_SUMMARY'];
if (summary) {
  const line = (cells) => `| ${cells.join(' | ')} |\n`;
  appendFileSync(
    summary,
    '## Unit test coverage\n\n' +
      line(header) +
      line(header.map(() => '---')) +
      rows.map(line).join(''),
  );
}
