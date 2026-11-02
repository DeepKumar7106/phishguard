import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { EventEmitter } from 'node:events';

process.env.NODE_ENV = 'test';

const { default: app } = await import('../src/index.js');
const { prisma } = await import('../src/config/prisma.js');

function request(expressApp, { method = 'GET', url = '/', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const isBuffer = Buffer.isBuffer(body);
    const bodyBuffer = isBuffer
      ? body
      : Buffer.from(body !== null ? (typeof body === 'string' ? body : JSON.stringify(body)) : '', 'utf8');

    const req = new Readable({
      read() {
        if (bodyBuffer.length > 0) {
          this.push(bodyBuffer);
        }
        this.complete = true;
        this.push(null);
      },
    });

    req.method = method;
    req.url = url;
    req.originalUrl = url;
    req.headers = {
      'content-type': 'application/json',
      'content-length': bodyBuffer.length.toString(),
      ...headers,
    };

    let statusCode = 200;
    const responseHeaders = {};
    const responseChunks = [];

    const res = new EventEmitter();
    res.statusCode = 200;
    res.setHeader = (key, val) => {
      responseHeaders[key.toLowerCase()] = val;
    };
    res.getHeader = (key) => responseHeaders[key.toLowerCase()];
    res.set = (key, val) => {
      if (typeof key === 'object') {
        Object.entries(key).forEach(([k, v]) => {
          responseHeaders[k.toLowerCase()] = v;
        });
      } else {
        responseHeaders[key.toLowerCase()] = val;
      }
      return res;
    };
    res.status = (code) => {
      statusCode = code;
      res.statusCode = code;
      return res;
    };

    res.json = (data) => {
      res.setHeader('content-type', 'application/json');
      const jsonStr = JSON.stringify(data);
      res.emit('finish');
      resolve({
        status: statusCode,
        headers: responseHeaders,
        json: async () => data,
        text: async () => jsonStr,
      });
      return res;
    };

    res.send = (data) => {
      const text = typeof data === 'object' ? JSON.stringify(data) : String(data);
      res.emit('finish');
      resolve({
        status: statusCode,
        headers: responseHeaders,
        json: async () => {
          try {
            return JSON.parse(text);
          } catch {
            return text;
          }
        },
        text: async () => text,
      });
      return res;
    };

    try {
      expressApp.handle(req, res, (err) => {
        if (err) reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

test('5. PostgreSQL CRUD API Operations', async (t) => {
  const testJobId = `TEST-IN-${Date.now()}`;
  const testDomain = `test-crud-${Date.now()}.xyz`;
  let createdReportId = null;

  t.after(async () => {
    try {
      if (createdReportId) {
        await prisma.scanReport.deleteMany({ where: { id: createdReportId } });
      }
      await prisma.domainCache.deleteMany({ where: { domain: testDomain } });
      await prisma.scamPattern.deleteMany({ where: { jobId: testJobId } });
    } catch {
      // Best-effort cleanup
    }
  });

  // --- Reports CRUD ---
  await t.test('POST /api/reports should create a new scan report in PostgreSQL', async () => {
    const res = await request(app, {
      method: 'POST',
      url: '/api/reports',
      body: {
        rawContent: `Suspicious lottery SMS offering 10 crore from ${testDomain}`,
        inputType: 'text',
        riskLevel: 'High',
        explanation: 'Fake lottery scam lure',
        redFlags: ['Unsolicited lottery', 'Advance fee request'],
        actionableGuidance: ['Block sender', 'Do not transfer money'],
        domainCacheId: testDomain,
      },
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data?.id);
    assert.equal(body.data?.riskLevel, 'High');
    assert.equal(body.data?.redFlags?.length, 2);
    createdReportId = body.data.id;
  });

  await t.test('GET /api/reports should list reports with pagination and filtering', async () => {
    const res = await request(app, {
      method: 'GET',
      url: '/api/reports?limit=10&page=1',
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.total >= 1);
    assert.ok(Array.isArray(body.data));
  });

  await t.test('GET /api/reports/:id should retrieve the created report', async () => {
    assert.ok(createdReportId, 'Report ID must exist');
    const res = await request(app, {
      method: 'GET',
      url: `/api/reports/${createdReportId}`,
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.id, createdReportId);
    assert.equal(body.data.riskLevel, 'High');
  });

  await t.test('PUT /api/reports/:id should update report properties', async () => {
    const res = await request(app, {
      method: 'PUT',
      url: `/api/reports/${createdReportId}`,
      body: {
        riskLevel: 'Critical',
        explanation: 'Confirmed malicious threat by security analyst',
      },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.riskLevel, 'Critical');
    assert.equal(body.data.explanation, 'Confirmed malicious threat by security analyst');
  });

  // --- Domain Cache CRUD ---
  await t.test('POST /api/domains should create / register a domain in PostgreSQL', async () => {
    const res = await request(app, {
      method: 'POST',
      url: '/api/domains',
      body: {
        domain: testDomain,
        ageInDays: 3,
        isBlacklisted: true,
      },
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.domain, testDomain);
    assert.equal(body.data.isBlacklisted, true);
  });

  await t.test('GET /api/domains/:domain should fetch domain cache details', async () => {
    const res = await request(app, {
      method: 'GET',
      url: `/api/domains/${testDomain}`,
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.domain, testDomain);
  });

  await t.test('PUT /api/domains/:domain should update domain status', async () => {
    const res = await request(app, {
      method: 'PUT',
      url: `/api/domains/${testDomain}`,
      body: {
        isWhitelisted: false,
        isBlacklisted: true,
        reportCount: 15,
      },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.reportCount, 15);
  });

  // --- Scam Patterns CRUD ---
  await t.test('POST /api/scam-patterns should create a new pattern in PostgreSQL', async () => {
    const res = await request(app, {
      method: 'POST',
      url: '/api/scam-patterns',
      body: {
        jobId: testJobId,
        title: 'Electricity Bill Disconnection Threat',
        financialTrap: 'Urgent payment demanded via APK or unverified phone number',
        salaryRange: 'N/A',
        communicationChannels: ['SMS', 'WhatsApp'],
        behavioralFlags: ['Urgency trigger', 'Utility disconnection'],
      },
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.jobId, testJobId);
  });

  await t.test('GET /api/scam-patterns/:jobId should retrieve the pattern', async () => {
    const res = await request(app, {
      method: 'GET',
      url: `/api/scam-patterns/${testJobId}`,
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.jobId, testJobId);
  });

  await t.test('PUT /api/scam-patterns/:jobId should update the pattern', async () => {
    const res = await request(app, {
      method: 'PUT',
      url: `/api/scam-patterns/${testJobId}`,
      body: {
        title: 'Electricity Bill Disconnection Threat (Updated)',
      },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.title, 'Electricity Bill Disconnection Threat (Updated)');
  });

  // --- Cleanup DELETE operations ---
  await t.test('DELETE /api/reports/:id should delete report', async () => {
    const res = await request(app, {
      method: 'DELETE',
      url: `/api/reports/${createdReportId}`,
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    createdReportId = null;
  });

  await t.test('DELETE /api/domains/:domain should delete domain', async () => {
    const res = await request(app, {
      method: 'DELETE',
      url: `/api/domains/${testDomain}`,
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
  });

  await t.test('DELETE /api/scam-patterns/:jobId should delete pattern', async () => {
    const res = await request(app, {
      method: 'DELETE',
      url: `/api/scam-patterns/${testJobId}`,
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
  });

  after(async () => {
    try {
      await prisma.$disconnect();
    } catch {}
    setTimeout(() => process.exit(0), 100);
  });
});
