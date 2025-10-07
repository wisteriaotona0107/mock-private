const express = require("express");
const cors = require("cors");
const { v4: uuid } = require("uuid");
const seed = require("./seed");
const { toNextToken, fromNextToken, sliceWithToken } = require("./utils/paging");
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
  errorHandler,
  withLatency
} = require("./utils/errors");

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(withLatency());

let items = seed();

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateRequiredString(value, field, maxLength) {
  const trimmed = normalizeString(value);
  if (!trimmed) {
    throw new BadRequestError(`${field} is required`);
  }
  if (trimmed.length > maxLength) {
    throw new BadRequestError(`${field} must be <= ${maxLength} characters`);
  }
  return trimmed;
}

function validateOptionalString(value, field, maxLength) {
  const trimmed = normalizeString(value);
  if (!trimmed) return "";
  if (trimmed.length > maxLength) {
    throw new BadRequestError(`${field} must be <= ${maxLength} characters`);
  }
  return trimmed;
}

function parseEnabled(value, fallback = true) {
  if (value === undefined || value === null) return fallback;
  return Boolean(value);
}

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/items", (req, res) => {
  const q = normalizeString(req.query.q).toLowerCase();
  const limitParam = Number.parseInt(req.query.limit, 10);
  const limit = Number.isInteger(limitParam)
    ? Math.min(Math.max(limitParam, 1), 100)
    : 20;
  const token = fromNextToken(req.query.nextToken);

  let rows = [...items];
  if (q) {
    rows = rows.filter((item) => {
      const code = (item.code || "").toLowerCase();
      const name = (item.name || "").toLowerCase();
      return code.includes(q) || name.includes(q);
    });
  }

  const { slice, nextKey } = sliceWithToken(rows, token, limit);
  res.json({ items: slice, nextToken: toNextToken(nextKey) });
});

app.get("/items/:id", (req, res, next) => {
  const found = items.find((item) => item.id === req.params.id);
  if (!found) {
    return next(new NotFoundError());
  }
  res.json(found);
});

app.post("/items", (req, res, next) => {
  try {
    const code = validateRequiredString(req.body.code, "code", 64);
    const name = validateRequiredString(req.body.name, "name", 128);
    const description = validateOptionalString(req.body.description, "description", 512);
    const enabled = parseEnabled(req.body.enabled, true);

    const now = new Date().toISOString();
    const item = {
      id: uuid(),
      code,
      name,
      description,
      enabled,
      version: 1,
      createdAt: now,
      updatedAt: now
    };
    items = [item, ...items];
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

app.put("/items/:id", (req, res, next) => {
  try {
    const existingIndex = items.findIndex((item) => item.id === req.params.id);
    if (existingIndex === -1) {
      throw new NotFoundError();
    }
    const existing = items[existingIndex];

    if (req.body.version === undefined || req.body.version === null) {
      throw new BadRequestError("version is required");
    }
    const incomingVersion = Number(req.body.version);
    if (!Number.isInteger(incomingVersion)) {
      throw new BadRequestError("version must be an integer");
    }
    if (existing.version !== incomingVersion) {
      throw new ConflictError();
    }

    const now = new Date().toISOString();
    const patch = {};
    if (req.body.code !== undefined) {
      patch.code = validateRequiredString(req.body.code, "code", 64);
    }
    if (req.body.name !== undefined) {
      patch.name = validateRequiredString(req.body.name, "name", 128);
    }
    if (req.body.description !== undefined) {
      patch.description = validateOptionalString(
        req.body.description,
        "description",
        512
      );
    }
    if (req.body.enabled !== undefined) {
      patch.enabled = parseEnabled(req.body.enabled, existing.enabled);
    }

    const updated = {
      ...existing,
      ...patch,
      version: existing.version + 1,
      updatedAt: now
    };
    items[existingIndex] = updated;
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

app.delete("/items/:id", (req, res, next) => {
  try {
    const existingIndex = items.findIndex((item) => item.id === req.params.id);
    if (existingIndex === -1) {
      throw new NotFoundError();
    }
    const existing = items[existingIndex];

    if (req.query.version !== undefined) {
      const incomingVersion = Number(req.query.version);
      if (!Number.isInteger(incomingVersion)) {
        throw new BadRequestError("version must be an integer");
      }
      if (existing.version !== incomingVersion) {
        throw new ConflictError();
      }
    }

    items.splice(existingIndex, 1);
    res.json({ ok: true, deletedId: existing.id });
  } catch (error) {
    next(error);
  }
});

app.use((req, res, next) => {
  next(new NotFoundError());
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Mock API running at http://127.0.0.1:${PORT}`);
});
