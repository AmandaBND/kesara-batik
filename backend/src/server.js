const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const cron = require("node-cron");
const connectDB = require("./config/db");
const { logEmailConfiguration } = require("./services/emailService");
const {
  isPublicRenderingResource,
  buildBackendRobotsTxt,
} = require("./config/robotsPolicy");

dotenv.config();
connectDB();

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "https://www.kesarabathik.com",
      "https://kesarabathik.com",
    ],
    credentials: true,
  }),
);

// Rate Limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use("/api/", limiter);

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// The public storefront is hosted on Vercel, so API responses must never be
// indexed as standalone search results. Public read-only JSON endpoints remain
// crawlable because Googlebot needs them to render the React storefront.
app.use((req, res, next) => {
  const robotsHeader = isPublicRenderingResource(req)
    ? "noindex, noarchive"
    : "noindex, nofollow, noarchive";
  res.set("X-Robots-Tag", robotsHeader);
  next();
});

// Internet-facing services are continuously scanned for unrelated admin,
// crypto, CMS and malware paths. They should still receive a real 404, but the
// known high-volume scanner noise does not need to flood Railway deploy logs.
const scannerNoisePattern = new RegExp(
  [
    "^/(?:app|h5|wap|pc|mobile|im|apps|html|page|xy|syn|dwcc|jym-wn|snake)(?:/|$)",
    "^/(?:index/login|home/index|f/user/index|join_room|platform|categories)$",
    "^/(?:zz\\.php|api\\.php|AppInfo\\.aspx|user/reg\\.php)$",
    "^/(?:config(?:\\.js|\\.json)?|conf\\.js|lang\\.js|site\\.js|style\\.css)$",
    "^/(?:static|dist|js|css|img|S1|new|nyyh|CCB)(?:/|$)",
  ].join("|"),
  "i",
);

app.use(
  morgan("dev", {
    skip: (req, res) =>
      process.env.NODE_ENV === "production" &&
      res.statusCode === 404 &&
      scannerNoisePattern.test(req.path),
  }),
);

// Static
app.use("/uploads", express.static("uploads"));

const healthPayload = () => ({
  status: "OK",
  name: "Kesara Bathik API",
  version: "1.0.0",
  timestamp: new Date().toISOString(),
});

// Friendly service and health endpoints. These remove legitimate Railway/root
// 404 checks without pretending that unrelated scanner paths exist.
app.get("/", (req, res) =>
  res.status(200).json({
    name: "Kesara Bathik API",
    status: "online",
    health: "/api/health",
    storefront: "https://www.kesarabathik.com",
  }),
);
app.get(["/health", "/health-check", "/healthz"], (req, res) =>
  res.status(200).json(healthPayload()),
);
app.get(["/api", "/api/"], (req, res) =>
  res.status(200).json({
    name: "Kesara Bathik API",
    status: "online",
    health: "/api/health",
  }),
);
app.get("/favicon.ico", (req, res) => res.status(204).end());

// Prevent the Railway API hostname from being indexed as a separate website,
// while allowing only the public GET resources used during storefront rendering.
// The public shop robots.txt is served by Vercel at kesarabathik.com.
app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send(buildBackendRobotsTxt());
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/currency", require("./routes/currencyRoutes"));

// Health Check
app.get("/api/health", (req, res) =>
  res.status(200).json(healthPayload()),
);

// 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Error Handler
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error("[Error Handler]", {
    status,
    message,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    errorDetails: {
      code: err.code,
      errors: err.errors,
    },
    stack: err.stack,
  });

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === "development" && {
      code: err.code,
      errors: err.errors,
      stack: err.stack,
    }),
  });
});

// CRON: Monthly Statement on 20th at 9am
cron.schedule("0 9 20 * *", async () => {
  const { generateMonthlyStatement } = require("./utils/reportGenerator");
  await generateMonthlyStatement();
  console.log("Monthly statement generated and emailed.");
});

// CRON: Update exchange rates every hour
const { updateExchangeRates } = require("./services/exchangeRateService");
updateExchangeRates();
cron.schedule("0 * * * *", async () => {
  await updateExchangeRates();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🦁 Kesara Batik Server running on port ${PORT}`);
  logEmailConfiguration();
});

module.exports = app;
