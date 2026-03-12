/**
 * src/middleware/security.js — Security middleware stack
 *
 * Returns an array of middleware to be spread into app.use().
 *
 * Includes:
 *   • helmet        — Sensible HTTP security headers
 *   • rate limiting  — Prevents brute-force / abuse
 *   • hpp           — Prevents HTTP parameter pollution
 *   • CORS          — Configured for the project
 *   • JSON body size cap
 */
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const express = require("express");

function buildSecurityMiddleware() {
  // ── Helmet: secure HTTP headers ──────────────────────
  const helmetMw = helmet({
    contentSecurityPolicy: false,   // API-only server, no HTML
    crossOriginEmbedderPolicy: false,
  });

  // ── CORS ─────────────────────────────────────────────
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
    : ["*"];

  const corsMw = cors({
    origin: allowedOrigins.includes("*") ? true : allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400, // preflight cache 24 h
  });

  // ── Rate limiter ─────────────────────────────────────
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 200,                // 200 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests — please try again shortly." },
  });

  // ── HPP: prevent parameter pollution ─────────────────
  const hppMw = hpp();

  // ── Body size cap ────────────────────────────────────
  const jsonParser = express.json({ limit: "1mb" });
  const urlParser  = express.urlencoded({ extended: false, limit: "1mb" });

  return [helmetMw, corsMw, limiter, hppMw, jsonParser, urlParser];
}

module.exports = buildSecurityMiddleware;
