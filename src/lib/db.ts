import { createClient, Client } from '@libsql/client';
import { InvoiceData, CompanySettings, DEFAULT_COMPANY_SETTINGS } from '@/types/invoice';
import fs from 'fs';
import path from 'path';

let client: Client | null = null;

function getClient(): Client {
  if (client) return client;

  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl) {
    client = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });
  } else {
    // In local dev or standalone node: use file:data/invoices.db
    // In Vercel serverless without Turso: use /tmp/invoices.db
    const isVercel = process.env.VERCEL === '1';
    let dbPath: string;

    if (isVercel) {
      dbPath = '/tmp/invoices.db';
    } else {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      dbPath = path.join(dataDir, 'invoices.db');
    }

    client = createClient({
      url: `file:${dbPath}`,
    });
  }

  return client;
}

let initialized = false;

export async function initDb(): Promise<void> {
  if (initialized) return;

  const db = getClient();

  // Create tables if they do not exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number INTEGER UNIQUE NOT NULL,
      invoice_date TEXT NOT NULL,
      customer_name TEXT,
      currency TEXT NOT NULL,
      grand_total REAL NOT NULL,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS invoice_sequence (
      name TEXT PRIMARY KEY,
      current_number INTEGER NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS company_settings (
      id TEXT PRIMARY KEY,
      settings_json TEXT NOT NULL
    );
  `);

  // Initialize sequence starting at 42646 so the next generated number is 42647
  await db.execute({
    sql: `INSERT OR IGNORE INTO invoice_sequence (name, current_number) VALUES ('invoice', 42646);`,
    args: [],
  });

  // Initialize default company settings if missing
  await db.execute({
    sql: `INSERT OR IGNORE INTO company_settings (id, settings_json) VALUES ('default', ?);`,
    args: [JSON.stringify(DEFAULT_COMPANY_SETTINGS)],
  });

  initialized = true;
}

export async function getNextInvoiceNumber(): Promise<number> {
  await initDb();
  const db = getClient();

  // Atomically increment and get the current number
  await db.execute(`
    UPDATE invoice_sequence
    SET current_number = current_number + 1
    WHERE name = 'invoice';
  `);

  const res = await db.execute(`
    SELECT current_number FROM invoice_sequence WHERE name = 'invoice';
  `);

  if (res.rows.length > 0 && res.rows[0].current_number !== null) {
    let nextNum = Number(res.rows[0].current_number);

    // Verify if this number already exists in the invoices table; if so, jump to max(invoice_number) + 1
    const checkMax = await db.execute(`SELECT MAX(invoice_number) as max_num FROM invoices;`);
    if (checkMax.rows.length > 0 && checkMax.rows[0].max_num !== null) {
      const maxNum = Number(checkMax.rows[0].max_num);
      if (maxNum >= nextNum) {
        nextNum = maxNum + 1;
        await db.execute({
          sql: `UPDATE invoice_sequence SET current_number = ? WHERE name = 'invoice';`,
          args: [nextNum],
        });
      }
    }

    return nextNum;
  }

  return 42647;
}

export async function checkInvoiceNumberExists(invoiceNumber: number, excludeId?: string): Promise<boolean> {
  await initDb();
  const db = getClient();

  let sql = `SELECT id FROM invoices WHERE invoice_number = ?`;
  const args: any[] = [invoiceNumber];

  if (excludeId) {
    sql += ` AND id != ?`;
    args.push(excludeId);
  }

  const res = await db.execute({ sql, args });
  return res.rows.length > 0;
}

export async function saveInvoice(invoice: InvoiceData): Promise<InvoiceData> {
  await initDb();
  const db = getClient();

  const now = new Date().toISOString();
  const createdAt = invoice.createdAt || now;
  const updatedAt = now;

  const dataToSave: InvoiceData = {
    ...invoice,
    createdAt,
    updatedAt,
  };

  await db.execute({
    sql: `
      INSERT INTO invoices (id, invoice_number, invoice_date, customer_name, currency, grand_total, data_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        invoice_number = excluded.invoice_number,
        invoice_date = excluded.invoice_date,
        customer_name = excluded.customer_name,
        currency = excluded.currency,
        grand_total = excluded.grand_total,
        data_json = excluded.data_json,
        updated_at = excluded.updated_at;
    `,
    args: [
      dataToSave.id,
      dataToSave.invoiceNumber,
      dataToSave.invoiceDate,
      dataToSave.customerName || '',
      dataToSave.paymentCurrency,
      dataToSave.grandTotal,
      JSON.stringify(dataToSave),
      createdAt,
      updatedAt,
    ],
  });

  // Also ensure sequence tracker doesn't fall behind this invoice number
  await db.execute({
    sql: `UPDATE invoice_sequence SET current_number = MAX(current_number, ?) WHERE name = 'invoice';`,
    args: [dataToSave.invoiceNumber],
  });

  return dataToSave;
}

export async function getInvoice(id: string): Promise<InvoiceData | null> {
  await initDb();
  const db = getClient();

  const res = await db.execute({
    sql: `SELECT data_json FROM invoices WHERE id = ?;`,
    args: [id],
  });

  if (res.rows.length === 0) return null;
  return JSON.parse(res.rows[0].data_json as string) as InvoiceData;
}

export async function getInvoiceByNumber(number: number): Promise<InvoiceData | null> {
  await initDb();
  const db = getClient();

  const res = await db.execute({
    sql: `SELECT data_json FROM invoices WHERE invoice_number = ?;`,
    args: [number],
  });

  if (res.rows.length === 0) return null;
  return JSON.parse(res.rows[0].data_json as string) as InvoiceData;
}

export async function listInvoices(search?: string, dateFilter?: string): Promise<InvoiceData[]> {
  await initDb();
  const db = getClient();

  let sql = `SELECT data_json FROM invoices`;
  const conditions: string[] = [];
  const args: any[] = [];

  if (search && search.trim()) {
    conditions.push(`(customer_name LIKE ? OR CAST(invoice_number AS TEXT) LIKE ?)`);
    args.push(`%${search.trim()}%`, `%${search.trim()}%`);
  }

  if (dateFilter && dateFilter.trim()) {
    conditions.push(`invoice_date = ?`);
    args.push(dateFilter.trim());
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(' AND ');
  }

  sql += ` ORDER BY invoice_number DESC;`;

  const res = await db.execute({ sql, args });
  return res.rows.map((row) => JSON.parse(row.data_json as string) as InvoiceData);
}

export async function deleteInvoice(id: string): Promise<boolean> {
  await initDb();
  const db = getClient();

  const res = await db.execute({
    sql: `DELETE FROM invoices WHERE id = ?;`,
    args: [id],
  });

  return res.rowsAffected > 0;
}

export async function getCompanySettings(): Promise<CompanySettings> {
  await initDb();
  const db = getClient();

  const res = await db.execute(`SELECT settings_json FROM company_settings WHERE id = 'default';`);
  if (res.rows.length === 0) return DEFAULT_COMPANY_SETTINGS;
  return JSON.parse(res.rows[0].settings_json as string) as CompanySettings;
}

export async function saveCompanySettings(settings: CompanySettings): Promise<CompanySettings> {
  await initDb();
  const db = getClient();

  await db.execute({
    sql: `
      INSERT INTO company_settings (id, settings_json) VALUES ('default', ?)
      ON CONFLICT(id) DO UPDATE SET settings_json = excluded.settings_json;
    `,
    args: [JSON.stringify(settings)],
  });

  return settings;
}
