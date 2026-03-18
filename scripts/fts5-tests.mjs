import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// ============================================================
// Test A2: Is FTS5 available in node:sqlite without extra compilation?
// ============================================================
console.log('='.repeat(70));
console.log('TEST A2: Is FTS5 available in node:sqlite?');
console.log('='.repeat(70));

try {
  const db = new DatabaseSync(':memory:');
  db.exec('CREATE VIRTUAL TABLE test_fts USING fts5(title, content)');
  db.exec("INSERT INTO test_fts(title, content) VALUES ('hello', 'world')");
  const rows = db.prepare("SELECT * FROM test_fts WHERE test_fts MATCH 'world'").all();
  console.log('RESULT: FTS5 IS AVAILABLE');
  console.log(`  - CREATE VIRTUAL TABLE ... USING fts5(): SUCCESS`);
  console.log(`  - INSERT: SUCCESS`);
  console.log(`  - MATCH query returned ${rows.length} row(s): ${JSON.stringify(rows)}`);
  db.close();
} catch (err) {
  console.log('RESULT: FTS5 IS NOT AVAILABLE');
  console.log(`  - Error: ${err.message}`);
}

// ============================================================
// Test A5: Does FTS5 return relevant results for domain-specific queries?
// ============================================================
console.log('\n' + '='.repeat(70));
console.log('TEST A5: FTS5 relevance for governance domain queries');
console.log('='.repeat(70));

const tmpDir = mkdtempSync(join(tmpdir(), 'fts5-test-'));
const dbPath = join(tmpDir, 'test.db');

try {
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode=WAL');

  db.exec(`
    CREATE VIRTUAL TABLE proposals USING fts5(
      slug,
      title,
      content,
      tokenize='porter ascii'
    )
  `);

  const docs = [
    {
      slug: 'mcp-coordination-layer',
      title: 'MCP Coordination Layer',
      content: 'This initiative establishes authority leases for MCP tool access, using a SQLite-backed coordination store to manage agent state mutations. When multiple agents need exclusive access to a resource, the coordination layer issues time-bounded authority leases that prevent conflicting mutations.'
    },
    {
      slug: 'sqlite-agentic-state-store',
      title: 'SQLite Agentic State Store',
      content: 'Proposes WAL mode SQLite as the persistence layer for concurrent agents. The filesystem-database duality means agents can observe state via file watchers while querying structured data through SQL. Concurrent writes are serialized by SQLite WAL mode, giving each agent a consistent snapshot.'
    },
    {
      slug: 'behavioral-agents',
      title: 'Behavioral Agents',
      content: 'Agent roles are defined through behavioral constraints and disposition settings, not identity claims. Each role definition specifies quality bars, fail triggers, and domain scoping. The behavioral approach is research-validated and avoids unpredictable persona activation.'
    },
    {
      slug: 'studio-dashboard',
      title: 'Studio Dashboard',
      content: 'The Studio dashboard provides UI components for visualizing agentic workflows. Built with shadcn component library, the sidebar navigation gives access to initiatives, tasks, dispatch, and research panels. Component architecture follows atomic design with Tailwind CSS.'
    },
    {
      slug: 'dispatch-center',
      title: 'Dispatch Center',
      content: 'The dispatch center handles task routing to backend workers. Backend selection considers task type, model availability, and cost. Worker processes execute in isolated worktrees. The dispatch queue manages pending tasks and routes them to claude, codex, gemini, or lm-studio backends.'
    },
    {
      slug: 'voice-and-tone',
      title: 'Voice and Tone',
      content: 'Content guidelines for Sherpa Consulting establish writing style conventions and an avoid-list of banned words. The voice is direct and evidence-based. Readability targets vary by content type. Headlines must pass the generic-pitch-deck test.'
    },
    {
      slug: 'parallel-workflow-governance',
      title: 'Parallel Workflow Governance',
      content: 'Governance for parallel work uses git worktrees for isolation. Initiative proposals go through integration review before merging. The directoturtle convention ensures each initiative directory contains proposal, plan, and activity documents with consistent frontmatter.'
    },
    {
      slug: 'design-system',
      title: 'Design System',
      content: 'The component library provides design tokens, accessible primitives, and composable patterns. Built on Radix UI with Tailwind CSS, the system ensures consistent visual language across Studio panels. Accessibility audits run on every component.'
    },
    {
      slug: 'scheduled-dispatch',
      title: 'Scheduled Dispatch',
      content: 'Adds cron job support for recurring tasks with time-based routing. Scheduled dispatch allows overnight research cycles, periodic health checks, and batch processing. The cron expression parser supports standard five-field syntax plus @daily/@hourly shortcuts.'
    },
    {
      slug: 'section-level-prose-sync',
      title: 'Section Level Prose Sync',
      content: 'Handles conflict resolution for collaborative editing at the section level. Uses CRDT-inspired merge strategies when multiple agents edit the same document. Section boundaries are detected via markdown headers, and each section can be independently locked and merged.'
    }
  ];

  const insert = db.prepare('INSERT INTO proposals(slug, title, content) VALUES (?, ?, ?)');
  for (const doc of docs) {
    insert.run(doc.slug, doc.title, doc.content);
  }

  const queries = [
    'authority',
    'concurrent writes',
    'dispatch tasks',
    'UI components',
  ];

  for (const query of queries) {
    console.log(`\n  Query: "${query}"`);
    console.log('  ' + '-'.repeat(50));

    try {
      const results = db.prepare(`
        SELECT slug, title, rank
        FROM proposals
        WHERE proposals MATCH ?
        ORDER BY rank
      `).all(query);

      if (results.length === 0) {
        console.log('  No results.');
      } else {
        for (const row of results) {
          console.log(`    rank=${row.rank.toFixed(4).padStart(8)}  ${row.slug} — "${row.title}"`);
        }
      }
      console.log(`  Total: ${results.length} result(s)`);
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
    }
  }

  // Also test BM25 explicitly
  console.log('\n  --- BM25 ranking test ---');
  const bm25Results = db.prepare(`
    SELECT slug, title, bm25(proposals, 0, 1.0, 2.0) as score
    FROM proposals
    WHERE proposals MATCH 'agent OR agents'
    ORDER BY score
  `).all();
  console.log(`  Query: "agent OR agents" with bm25(proposals, 0, 1.0, 2.0)`);
  for (const row of bm25Results) {
    console.log(`    score=${row.score.toFixed(4).padStart(9)}  ${row.slug} — "${row.title}"`);
  }
  console.log(`  Total: ${bm25Results.length} result(s)`);

  db.close();
} catch (err) {
  console.log(`FATAL ERROR in Test A5: ${err.message}`);
  console.log(err.stack);
}

// ============================================================
// Test A6: Does FTS5 external content mode corrupt on REPLACE?
// ============================================================
console.log('\n' + '='.repeat(70));
console.log('TEST A6: FTS5 external content mode — REPLACE corruption');
console.log('='.repeat(70));

try {
  const db = new DatabaseSync(':memory:');

  // Create content table and external-content FTS5 index
  db.exec(`
    CREATE TABLE files (
      path TEXT PRIMARY KEY,
      title TEXT,
      content TEXT
    )
  `);

  db.exec(`
    CREATE VIRTUAL TABLE files_fts USING fts5(
      path,
      title,
      content,
      content='files',
      content_rowid='rowid'
    )
  `);

  // We need triggers to keep FTS in sync with the content table.
  // Without triggers, external content FTS requires manual sync.
  // First test: WITHOUT triggers (manual sync) to see raw behavior.

  console.log('\n  --- Sub-test 1: Manual sync (no triggers) ---');

  // Insert a row into content table
  db.exec("INSERT INTO files(path, title, content) VALUES ('init.md', 'Initiative Proposal', 'This is about behavioral agents and role definitions')");

  // Get the rowid
  const rowid1 = db.prepare("SELECT rowid FROM files WHERE path = 'init.md'").get().rowid;
  console.log(`  Inserted row with rowid=${rowid1}`);

  // Manually sync to FTS
  db.exec("INSERT INTO files_fts(rowid, path, title, content) SELECT rowid, path, title, content FROM files WHERE path = 'init.md'");

  // Search — should work
  const r1 = db.prepare("SELECT path, title FROM files_fts WHERE files_fts MATCH 'behavioral'").all();
  console.log(`  Search for 'behavioral' after initial insert: ${r1.length} result(s) → ${JSON.stringify(r1)}`);

  // Now REPLACE the same row with different content
  console.log('\n  Performing INSERT OR REPLACE with same path, different content...');
  db.exec("INSERT OR REPLACE INTO files(path, title, content) VALUES ('init.md', 'Updated Proposal', 'This is about dispatch routing and cron scheduling')");

  const rowid2 = db.prepare("SELECT rowid FROM files WHERE path = 'init.md'").get().rowid;
  console.log(`  After REPLACE, rowid=${rowid2} (was ${rowid1})`);

  // Try to search WITHOUT re-syncing FTS
  console.log('\n  Searching FTS without re-sync...');
  try {
    const r2a = db.prepare("SELECT path, title FROM files_fts WHERE files_fts MATCH 'behavioral'").all();
    console.log(`  Search for 'behavioral' (old content): ${r2a.length} result(s) → ${JSON.stringify(r2a)}`);
  } catch (err) {
    console.log(`  Search for 'behavioral' ERROR: ${err.message}`);
  }

  try {
    const r2b = db.prepare("SELECT path, title FROM files_fts WHERE files_fts MATCH 'dispatch'").all();
    console.log(`  Search for 'dispatch' (new content): ${r2b.length} result(s) → ${JSON.stringify(r2b)}`);
  } catch (err) {
    console.log(`  Search for 'dispatch' ERROR: ${err.message}`);
  }

  db.close();

  // Sub-test 2: With triggers (the SQLite-recommended approach)
  console.log('\n  --- Sub-test 2: With triggers (recommended approach) ---');

  const db2 = new DatabaseSync(':memory:');

  db2.exec(`
    CREATE TABLE files (
      path TEXT PRIMARY KEY,
      title TEXT,
      content TEXT
    )
  `);

  db2.exec(`
    CREATE VIRTUAL TABLE files_fts USING fts5(
      path,
      title,
      content,
      content='files',
      content_rowid='rowid'
    )
  `);

  // Add triggers to keep FTS in sync
  db2.exec(`
    CREATE TRIGGER files_ai AFTER INSERT ON files BEGIN
      INSERT INTO files_fts(rowid, path, title, content)
        VALUES (new.rowid, new.path, new.title, new.content);
    END
  `);

  db2.exec(`
    CREATE TRIGGER files_ad AFTER DELETE ON files BEGIN
      INSERT INTO files_fts(files_fts, rowid, path, title, content)
        VALUES ('delete', old.rowid, old.path, old.title, old.content);
    END
  `);

  db2.exec(`
    CREATE TRIGGER files_au AFTER UPDATE ON files BEGIN
      INSERT INTO files_fts(files_fts, rowid, path, title, content)
        VALUES ('delete', old.rowid, old.path, old.title, old.content);
      INSERT INTO files_fts(rowid, path, title, content)
        VALUES (new.rowid, new.path, new.title, new.content);
    END
  `);

  // Insert
  db2.exec("INSERT INTO files(path, title, content) VALUES ('init.md', 'Initiative Proposal', 'This is about behavioral agents and role definitions')");

  const tr1 = db2.prepare("SELECT path, title FROM files_fts WHERE files_fts MATCH 'behavioral'").all();
  console.log(`  After INSERT, search 'behavioral': ${tr1.length} result(s) → ${JSON.stringify(tr1)}`);

  // REPLACE (INSERT OR REPLACE triggers DELETE then INSERT)
  console.log('\n  Performing INSERT OR REPLACE with triggers...');
  db2.exec("INSERT OR REPLACE INTO files(path, title, content) VALUES ('init.md', 'Updated Proposal', 'This is about dispatch routing and cron scheduling')");

  try {
    const tr2 = db2.prepare("SELECT path, title FROM files_fts WHERE files_fts MATCH 'behavioral'").all();
    console.log(`  Search 'behavioral' (old content): ${tr2.length} result(s) → ${JSON.stringify(tr2)}`);
  } catch (err) {
    console.log(`  Search 'behavioral' ERROR: ${err.message}`);
  }

  try {
    const tr3 = db2.prepare("SELECT path, title FROM files_fts WHERE files_fts MATCH 'dispatch'").all();
    console.log(`  Search 'dispatch' (new content): ${tr3.length} result(s) → ${JSON.stringify(tr3)}`);
  } catch (err) {
    console.log(`  Search 'dispatch' ERROR: ${err.message}`);
  }

  // Sub-test 3: DELETE + INSERT mitigation (without triggers)
  console.log('\n  --- Sub-test 3: DELETE + INSERT mitigation (no triggers) ---');

  const db3 = new DatabaseSync(':memory:');

  db3.exec(`
    CREATE TABLE files (
      path TEXT PRIMARY KEY,
      title TEXT,
      content TEXT
    )
  `);

  db3.exec(`
    CREATE VIRTUAL TABLE files_fts USING fts5(
      path,
      title,
      content,
      content='files',
      content_rowid='rowid'
    )
  `);

  // Insert
  db3.exec("INSERT INTO files(path, title, content) VALUES ('init.md', 'Initiative Proposal', 'This is about behavioral agents and role definitions')");
  const r3id1 = db3.prepare("SELECT rowid FROM files WHERE path = 'init.md'").get().rowid;
  db3.exec("INSERT INTO files_fts(rowid, path, title, content) SELECT rowid, path, title, content FROM files WHERE path = 'init.md'");

  const dr1 = db3.prepare("SELECT path, title FROM files_fts WHERE files_fts MATCH 'behavioral'").all();
  console.log(`  After INSERT, search 'behavioral': ${dr1.length} result(s)`);

  // DELETE from FTS first, then DELETE from content, then INSERT fresh
  console.log('  Performing explicit DELETE from FTS + DELETE from files + INSERT...');

  // Remove from FTS index (using the delete command)
  const oldRow = db3.prepare("SELECT rowid, path, title, content FROM files WHERE path = 'init.md'").get();
  db3.exec(`INSERT INTO files_fts(files_fts, rowid, path, title, content) VALUES ('delete', ${oldRow.rowid}, '${oldRow.path}', '${oldRow.title}', '${oldRow.content}')`);

  // Delete from content table
  db3.exec("DELETE FROM files WHERE path = 'init.md'");

  // Insert new row
  db3.exec("INSERT INTO files(path, title, content) VALUES ('init.md', 'Updated Proposal', 'This is about dispatch routing and cron scheduling')");
  db3.exec("INSERT INTO files_fts(rowid, path, title, content) SELECT rowid, path, title, content FROM files WHERE path = 'init.md'");

  try {
    const dr2 = db3.prepare("SELECT path, title FROM files_fts WHERE files_fts MATCH 'behavioral'").all();
    console.log(`  Search 'behavioral' (old): ${dr2.length} result(s)`);
  } catch (err) {
    console.log(`  Search 'behavioral' ERROR: ${err.message}`);
  }

  try {
    const dr3 = db3.prepare("SELECT path, title FROM files_fts WHERE files_fts MATCH 'dispatch'").all();
    console.log(`  Search 'dispatch' (new): ${dr3.length} result(s) → ${JSON.stringify(dr3)}`);
  } catch (err) {
    console.log(`  Search 'dispatch' ERROR: ${err.message}`);
  }

  db2.close();
  db3.close();

} catch (err) {
  console.log(`FATAL ERROR in Test A6: ${err.message}`);
  console.log(err.stack);
}

// Cleanup
try { rmSync(tmpDir, { recursive: true }); } catch {}

console.log('\n' + '='.repeat(70));
console.log('ALL TESTS COMPLETE');
console.log('='.repeat(70));
