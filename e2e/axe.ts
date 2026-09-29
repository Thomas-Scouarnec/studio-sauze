import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, type TestInfo } from '@playwright/test';
import { knownViolations } from './known-violations';

/** The rule set used by hand since Bolt 9: WCAG 2.0 to 2.2, A and AA, plus best practices. */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

/**
 * Runs AXE on the page and expects exactly the baseline listed for `name`
 * in known-violations.ts: nothing new, and nothing listed that no longer fails.
 */
export async function scan(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await settle(page);
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();

  const found = results.violations.flatMap((violation) =>
    violation.nodes.map((node) => key(violation.id, node.target)),
  );
  const expected = knownViolations[name] ?? [];

  // The details of anything unexpected, in the report, to say what to fix.
  const unexpected = results.violations
    .map((violation) => ({
      rule: violation.id,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes
        .filter((node) => !expected.includes(key(violation.id, node.target)))
        .map((node) => ({ target: key(violation.id, node.target), html: node.html, summary: node.failureSummary })),
    }))
    .filter((violation) => violation.nodes.length > 0);
  if (unexpected.length > 0) {
    await testInfo.attach(`axe — ${name}`, {
      body: JSON.stringify(unexpected, null, 2),
      contentType: 'application/json',
    });
  }

  expect(found.sort(), `AXE violations on « ${name} » (${testInfo.project.name})`).toEqual(
    [...expected].sort(),
  );
}

/**
 * `rule selector`, without the `_ngcontent-…` / `_nghost-…` attributes Angular
 * generates: they change from one build to the next.
 */
function key(rule: string, target: readonly unknown[]): string {
  const selector = target.join(' ').replace(/\[_ng(content|host)-[^\]]*\]/g, '');
  return `${rule} ${selector}`;
}

/** Waits for fonts and images, so contrast is measured on the final rendering. */
async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images)
        .filter((image) => !image.complete && image.loading !== 'lazy')
        .map((image) => new Promise((done) => image.addEventListener('loadend', done, { once: true }))),
    );
  });
}
