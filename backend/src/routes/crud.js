import { Router } from 'express';
import { createHash } from 'node:crypto';
import { prisma } from '../config/prisma.js';

const router = Router();

function safeJsonParse(str, fallback = []) {
  if (typeof str !== 'string') return str || fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

// =============================================================================
// 1. SCAN REPORTS CRUD (/reports)
// =============================================================================

/**
 * GET /reports
 * List reports with filtering (riskLevel, inputType, target), pagination, and search.
 */
router.get('/reports', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      riskLevel,
      inputType,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const take = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = Math.max((parseInt(page, 10) - 1) * take, 0);

    const where = {};
    if (riskLevel) {
      where.riskLevel = { equals: String(riskLevel), mode: 'insensitive' };
    }
    if (inputType) {
      where.inputType = { equals: String(inputType), mode: 'insensitive' };
    }
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { target: { contains: q, mode: 'insensitive' } },
        { rawContent: { contains: q, mode: 'insensitive' } },
        { explanation: { contains: q, mode: 'insensitive' } },
      ];
    }

    const validSortFields = ['createdAt', 'reportCount', 'riskLevel', 'inputType'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const direction = sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [total, reports] = await Promise.all([
      prisma.scanReport.count({ where }),
      prisma.scanReport.findMany({
        where,
        take,
        skip,
        orderBy: { [orderField]: direction },
        include: {
          domainCache: {
            select: {
              domain: true,
              ageInDays: true,
              isWhitelisted: true,
              isBlacklisted: true,
              reportCount: true,
            },
          },
        },
      }),
    ]);

    const formatted = reports.map((r) => ({
      ...r,
      redFlags: safeJsonParse(r.redFlags, []),
      actionableGuidance: safeJsonParse(r.actionableGuidance, []),
    }));

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10) || 1,
      limit: take,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error('[crud:reports:list] error:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to retrieve reports: ${error.message}`,
    });
  }
});

/**
 * GET /reports/:id
 * Retrieve single report by ID (UUID) or contentHash.
 */
router.get('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const report = await prisma.scanReport.findFirst({
      where: {
        OR: [{ id }, { contentHash: id }, { targetEndpoint: id }],
      },
      include: {
        domainCache: true,
      },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: `Report '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...report,
        redFlags: safeJsonParse(report.redFlags, []),
        actionableGuidance: safeJsonParse(report.actionableGuidance, []),
      },
    });
  } catch (error) {
    console.error('[crud:reports:get] error:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to retrieve report: ${error.message}`,
    });
  }
});

/**
 * POST /reports
 * Create a new scan report entry in PostgreSQL.
 */
router.post('/reports', async (req, res) => {
  try {
    const {
      rawContent,
      content,
      inputType = 'text',
      riskLevel = 'Unknown',
      redFlags = [],
      explanation = 'Manual report entry.',
      actionableGuidance = [],
      target,
      targetEndpoint,
      reportCount = 1,
      domainCacheId,
    } = req.body ?? {};

    const textContent = rawContent || content;
    if (!textContent || typeof textContent !== 'string' || !textContent.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Field "rawContent" (or "content") must be a non-empty string.',
      });
    }

    const contentHash = createHash('sha256')
      .update(textContent.trim(), 'utf8')
      .digest('hex');

    // Create or connect domain cache if provided
    let linkedDomain = null;
    if (domainCacheId && typeof domainCacheId === 'string') {
      const cleanDomain = domainCacheId.trim().toLowerCase();
      await prisma.domainCache.upsert({
        where: { domain: cleanDomain },
        create: { domain: cleanDomain },
        update: {},
      });
      linkedDomain = cleanDomain;
    }

    const created = await prisma.scanReport.upsert({
      where: { contentHash },
      create: {
        contentHash,
        target: target || cleanDomainOrNull(textContent),
        targetEndpoint: targetEndpoint || null,
        reportCount: Math.max(Number(reportCount) || 1, 1),
        domainCacheId: linkedDomain,
        rawContent: textContent.trim(),
        inputType: String(inputType),
        riskLevel: String(riskLevel),
        redFlags: Array.isArray(redFlags) ? JSON.stringify(redFlags) : String(redFlags),
        explanation: String(explanation),
        actionableGuidance: Array.isArray(actionableGuidance)
          ? JSON.stringify(actionableGuidance)
          : String(actionableGuidance),
      },
      update: {
        target: target || undefined,
        targetEndpoint: targetEndpoint || undefined,
        reportCount: { increment: 1 },
        riskLevel: String(riskLevel),
        redFlags: Array.isArray(redFlags) ? JSON.stringify(redFlags) : String(redFlags),
        explanation: String(explanation),
        actionableGuidance: Array.isArray(actionableGuidance)
          ? JSON.stringify(actionableGuidance)
          : String(actionableGuidance),
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        ...created,
        redFlags: safeJsonParse(created.redFlags, []),
        actionableGuidance: safeJsonParse(created.actionableGuidance, []),
      },
    });
  } catch (error) {
    console.error('[crud:reports:create] error:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to create report: ${error.message}`,
    });
  }
});

/**
 * PUT /reports/:id
 * Update an existing scan report.
 */
router.put('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      riskLevel,
      redFlags,
      explanation,
      actionableGuidance,
      target,
      targetEndpoint,
      reportCount,
      domainCacheId,
    } = req.body ?? {};

    const existing = await prisma.scanReport.findFirst({
      where: { OR: [{ id }, { contentHash: id }] },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Report '${id}' not found.`,
      });
    }

    const data = {};
    if (riskLevel !== undefined) data.riskLevel = String(riskLevel);
    if (explanation !== undefined) data.explanation = String(explanation);
    if (target !== undefined) data.target = target;
    if (targetEndpoint !== undefined) data.targetEndpoint = targetEndpoint;
    if (reportCount !== undefined) data.reportCount = Math.max(Number(reportCount) || 1, 1);
    if (domainCacheId !== undefined) data.domainCacheId = domainCacheId;

    if (redFlags !== undefined) {
      data.redFlags = Array.isArray(redFlags) ? JSON.stringify(redFlags) : String(redFlags);
    }
    if (actionableGuidance !== undefined) {
      data.actionableGuidance = Array.isArray(actionableGuidance)
        ? JSON.stringify(actionableGuidance)
        : String(actionableGuidance);
    }

    const updated = await prisma.scanReport.update({
      where: { id: existing.id },
      data,
    });

    return res.status(200).json({
      success: true,
      data: {
        ...updated,
        redFlags: safeJsonParse(updated.redFlags, []),
        actionableGuidance: safeJsonParse(updated.actionableGuidance, []),
      },
    });
  } catch (error) {
    console.error('[crud:reports:update] error:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to update report: ${error.message}`,
    });
  }
});

/**
 * DELETE /reports/:id
 * Delete a scan report by ID or contentHash.
 */
router.delete('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.scanReport.findFirst({
      where: { OR: [{ id }, { contentHash: id }] },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Report '${id}' not found.`,
      });
    }

    await prisma.scanReport.delete({
      where: { id: existing.id },
    });

    return res.status(200).json({
      success: true,
      message: `Report '${id}' deleted successfully.`,
    });
  } catch (error) {
    console.error('[crud:reports:delete] error:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to delete report: ${error.message}`,
    });
  }
});

// =============================================================================
// 2. DOMAIN CACHE CRUD (/domains)
// =============================================================================

/**
 * GET /domains
 * List cached domains with search and whitelist/blacklist filter.
 */
router.get('/domains', async (req, res) => {
  try {
    const { q, isWhitelisted, isBlacklisted, limit = 50, offset = 0 } = req.query;
    const take = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
    const skip = Math.max(parseInt(offset, 10) || 0, 0);

    const where = {};
    if (q) {
      where.domain = { contains: String(q).trim().toLowerCase(), mode: 'insensitive' };
    }
    if (isWhitelisted !== undefined) {
      where.isWhitelisted = String(isWhitelisted).toLowerCase() === 'true';
    }
    if (isBlacklisted !== undefined) {
      where.isBlacklisted = String(isBlacklisted).toLowerCase() === 'true';
    }

    const [total, domains] = await Promise.all([
      prisma.domainCache.count({ where }),
      prisma.domainCache.findMany({
        where,
        take,
        skip,
        orderBy: { reportCount: 'desc' },
      }),
    ]);

    const formatted = domains.map((d) => ({
      ...d,
      dailyReports: safeJsonParse(d.dailyReports, []),
    }));

    return res.status(200).json({
      success: true,
      total,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error('[crud:domains:list] error:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to retrieve domains: ${error.message}`,
    });
  }
});

/**
 * GET /domains/:domain
 * Retrieve single domain cache entry with its reports.
 */
router.get('/domains/:domain', async (req, res) => {
  try {
    const domainName = req.params.domain.toLowerCase().trim();
    const domain = await prisma.domainCache.findUnique({
      where: { domain: domainName },
      include: {
        reports: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            targetEndpoint: true,
            riskLevel: true,
            reportCount: true,
            createdAt: true,
          },
        },
      },
    });

    if (!domain) {
      return res.status(404).json({
        success: false,
        error: `Domain '${domainName}' not found in cache.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...domain,
        dailyReports: safeJsonParse(domain.dailyReports, []),
      },
    });
  } catch (error) {
    console.error('[crud:domains:get] error:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to retrieve domain: ${error.message}`,
    });
  }
});

/**
 * POST /domains
 * Create or register a domain cache entry (e.g. whitelist or blacklist).
 */
router.post('/domains', async (req, res) => {
  try {
    const { domain, ageInDays, isWhitelisted = false, isBlacklisted = false } = req.body ?? {};
    if (!domain || typeof domain !== 'string' || !domain.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Field "domain" is required and must be a valid domain string.',
      });
    }

    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];

    const created = await prisma.domainCache.upsert({
      where: { domain: cleanDomain },
      create: {
        domain: cleanDomain,
        ageInDays: ageInDays !== undefined ? Number(ageInDays) : null,
        isWhitelisted: Boolean(isWhitelisted),
        isBlacklisted: Boolean(isBlacklisted),
      },
      update: {
        ageInDays: ageInDays !== undefined ? Number(ageInDays) : undefined,
        isWhitelisted: Boolean(isWhitelisted),
        isBlacklisted: Boolean(isBlacklisted),
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        ...created,
        dailyReports: safeJsonParse(created.dailyReports, []),
      },
    });
  } catch (error) {
    console.error('[crud:domains:create] error:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to create domain cache: ${error.message}`,
    });
  }
});

/**
 * PUT /domains/:domain
 * Update domain cache entry attributes.
 */
router.put('/domains/:domain', async (req, res) => {
  try {
    const domainName = req.params.domain.toLowerCase().trim();
    const { ageInDays, isWhitelisted, isBlacklisted, reportCount } = req.body ?? {};

    const existing = await prisma.domainCache.findUnique({
      where: { domain: domainName },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Domain '${domainName}' not found.`,
      });
    }

    const data = {};
    if (ageInDays !== undefined) data.ageInDays = Number(ageInDays);
    if (isWhitelisted !== undefined) data.isWhitelisted = Boolean(isWhitelisted);
    if (isBlacklisted !== undefined) data.isBlacklisted = Boolean(isBlacklisted);
    if (reportCount !== undefined) data.reportCount = Math.max(Number(reportCount) || 0, 0);

    const updated = await prisma.domainCache.update({
      where: { domain: domainName },
      data,
    });

    return res.status(200).json({
      success: true,
      data: {
        ...updated,
        dailyReports: safeJsonParse(updated.dailyReports, []),
      },
    });
  } catch (error) {
    console.error('[crud:domains:update] error:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to update domain: ${error.message}`,
    });
  }
});

/**
 * DELETE /domains/:domain
 * Delete a domain cache entry.
 */
router.delete('/domains/:domain', async (req, res) => {
  try {
    const domainName = req.params.domain.toLowerCase().trim();
    const existing = await prisma.domainCache.findUnique({
      where: { domain: domainName },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Domain '${domainName}' not found.`,
      });
    }

    await prisma.domainCache.delete({
      where: { domain: domainName },
    });

    return res.status(200).json({
      success: true,
      message: `Domain '${domainName}' deleted successfully.`,
    });
  } catch (error) {
    console.error('[crud:domains:delete] error:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to delete domain: ${error.message}`,
    });
  }
});

// =============================================================================
// 3. SCAM PATTERNS CRUD (/scam-patterns)
// =============================================================================

/**
 * GET /scam-patterns
 * Retrieve curated scam patterns from PostgreSQL.
 */
router.get('/scam-patterns', async (req, res) => {
  try {
    const { jobId, q, limit = 50, offset = 0 } = req.query;
    const where = {};

    if (jobId) {
      where.jobId = { equals: String(jobId).trim(), mode: 'insensitive' };
    }
    if (q) {
      const queryStr = String(q).trim();
      where.OR = [
        { title: { contains: queryStr, mode: 'insensitive' } },
        { financialTrap: { contains: queryStr, mode: 'insensitive' } },
        { salaryRange: { contains: queryStr, mode: 'insensitive' } },
      ];
    }

    const [total, patterns] = await Promise.all([
      prisma.scamPattern.count({ where }),
      prisma.scamPattern.findMany({
        where,
        take: Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100),
        skip: Math.max(parseInt(offset, 10) || 0, 0),
        orderBy: { jobId: 'asc' },
      }),
    ]);

    return res.status(200).json({
      success: true,
      total,
      count: patterns.length,
      data: patterns,
    });
  } catch (error) {
    console.error('[crud:scam-patterns:list] error:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to retrieve scam patterns: ${error.message}`,
    });
  }
});

/**
 * GET /scam-patterns/:jobId
 * Retrieve single scam pattern by jobId (e.g. IN-2001).
 */
router.get('/scam-patterns/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const pattern = await prisma.scamPattern.findUnique({
      where: { jobId: String(jobId).trim().toUpperCase() },
    });

    if (!pattern) {
      return res.status(404).json({
        success: false,
        error: `Scam pattern '${jobId}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: pattern,
    });
  } catch (error) {
    console.error('[crud:scam-patterns:get] error:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to retrieve scam pattern: ${error.message}`,
    });
  }
});

/**
 * POST /scam-patterns
 * Create or register a new scam pattern.
 */
router.post('/scam-patterns', async (req, res) => {
  try {
    const {
      jobId,
      title,
      commonLocations = [],
      communicationChannels = [],
      salaryRange = '',
      paymentMethods = [],
      behavioralFlags = [],
      financialTrap,
    } = req.body ?? {};

    if (!jobId || !title || !financialTrap) {
      return res.status(400).json({
        success: false,
        error: 'Fields "jobId", "title", and "financialTrap" are required.',
      });
    }

    const cleanJobId = String(jobId).trim().toUpperCase();

    const created = await prisma.scamPattern.upsert({
      where: { jobId: cleanJobId },
      create: {
        jobId: cleanJobId,
        title: String(title).trim(),
        commonLocations: Array.isArray(commonLocations) ? commonLocations : [String(commonLocations)],
        communicationChannels: Array.isArray(communicationChannels)
          ? communicationChannels
          : [String(communicationChannels)],
        salaryRange: String(salaryRange || ''),
        paymentMethods: Array.isArray(paymentMethods) ? paymentMethods : [String(paymentMethods)],
        behavioralFlags: Array.isArray(behavioralFlags) ? behavioralFlags : [String(behavioralFlags)],
        financialTrap: String(financialTrap).trim(),
      },
      update: {
        title: String(title).trim(),
        commonLocations: Array.isArray(commonLocations) ? commonLocations : [String(commonLocations)],
        communicationChannels: Array.isArray(communicationChannels)
          ? communicationChannels
          : [String(communicationChannels)],
        salaryRange: String(salaryRange || ''),
        paymentMethods: Array.isArray(paymentMethods) ? paymentMethods : [String(paymentMethods)],
        behavioralFlags: Array.isArray(behavioralFlags) ? behavioralFlags : [String(behavioralFlags)],
        financialTrap: String(financialTrap).trim(),
      },
    });

    return res.status(201).json({
      success: true,
      data: created,
    });
  } catch (error) {
    console.error('[crud:scam-patterns:create] error:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to create scam pattern: ${error.message}`,
    });
  }
});

/**
 * PUT /scam-patterns/:jobId
 * Update an existing scam pattern.
 */
router.put('/scam-patterns/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const cleanJobId = String(jobId).trim().toUpperCase();

    const existing = await prisma.scamPattern.findUnique({
      where: { jobId: cleanJobId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Scam pattern '${jobId}' not found.`,
      });
    }

    const data = {};
    if (req.body.title !== undefined) data.title = String(req.body.title).trim();
    if (req.body.financialTrap !== undefined) data.financialTrap = String(req.body.financialTrap).trim();
    if (req.body.salaryRange !== undefined) data.salaryRange = String(req.body.salaryRange);
    if (req.body.commonLocations !== undefined) {
      data.commonLocations = Array.isArray(req.body.commonLocations)
        ? req.body.commonLocations
        : [String(req.body.commonLocations)];
    }
    if (req.body.communicationChannels !== undefined) {
      data.communicationChannels = Array.isArray(req.body.communicationChannels)
        ? req.body.communicationChannels
        : [String(req.body.communicationChannels)];
    }
    if (req.body.paymentMethods !== undefined) {
      data.paymentMethods = Array.isArray(req.body.paymentMethods)
        ? req.body.paymentMethods
        : [String(req.body.paymentMethods)];
    }
    if (req.body.behavioralFlags !== undefined) {
      data.behavioralFlags = Array.isArray(req.body.behavioralFlags)
        ? req.body.behavioralFlags
        : [String(req.body.behavioralFlags)];
    }

    const updated = await prisma.scamPattern.update({
      where: { jobId: cleanJobId },
      data,
    });

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('[crud:scam-patterns:update] error:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to update scam pattern: ${error.message}`,
    });
  }
});

/**
 * DELETE /scam-patterns/:jobId
 * Delete a scam pattern.
 */
router.delete('/scam-patterns/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const cleanJobId = String(jobId).trim().toUpperCase();

    const existing = await prisma.scamPattern.findUnique({
      where: { jobId: cleanJobId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Scam pattern '${jobId}' not found.`,
      });
    }

    await prisma.scamPattern.delete({
      where: { jobId: cleanJobId },
    });

    return res.status(200).json({
      success: true,
      message: `Scam pattern '${jobId}' deleted successfully.`,
    });
  } catch (error) {
    console.error('[crud:scam-patterns:delete] error:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to delete scam pattern: ${error.message}`,
    });
  }
});

function cleanDomainOrNull(text) {
  if (typeof text !== 'string') return null;
  const match = text.match(/https?:\/\/([^/\s]+)/i);
  return match ? match[1].toLowerCase() : null;
}

export default router;
