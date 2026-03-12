module.exports = [
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[project]/apps/studio/src/app/process/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"403d607b492237631ad3dbef7c1cbee6d37e9ef6f0":"archiveInitiative","40a50a489797b946f81f1c68d388aa6640d2290b7a":"restoreInitiative","706a95f2136c3f9e756743173c2b9597e390605a37":"updateNodeStatus"},"",""] */ __turbopack_context__.s([
    "archiveInitiative",
    ()=>archiveInitiative,
    "restoreInitiative",
    ()=>restoreInitiative,
    "updateNodeStatus",
    ()=>updateNodeStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.1_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gray$2d$matter$40$4$2e$0$2e$3$2f$node_modules$2f$gray$2d$matter$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/gray-matter@4.0.3/node_modules/gray-matter/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.1_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.1_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
const WEB_ROOT = process.cwd();
const MONOREPO_ROOT = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(WEB_ROOT, "../..");
const CACHE_ROOT = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(WEB_ROOT, ".studio-cache");
/** Allowed source path prefixes to prevent path traversal. */ const ALLOWED_PREFIXES = [
    "docs/initiatives/"
];
/** Valid statuses per node kind. */ const VALID_STATUSES = {
    initiative: [
        "pending",
        "approved",
        "in-progress",
        "integrated",
        "declined",
        "archived"
    ],
    seed: [
        "seed",
        "launched"
    ]
};
async function updateNodeStatus(source, kind, newStatus) {
    // Validate kind supports status editing
    const validStatuses = VALID_STATUSES[kind];
    if (!validStatuses) {
        return {
            success: false,
            error: `Status editing not supported for ${kind}`
        };
    }
    // Validate status value
    if (!validStatuses.includes(newStatus)) {
        return {
            success: false,
            error: `Invalid status "${newStatus}" for ${kind}`
        };
    }
    // Validate source path (prevent path traversal)
    const normalized = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].normalize(source);
    if (normalized.includes("..") || !ALLOWED_PREFIXES.some((prefix)=>normalized.startsWith(prefix))) {
        return {
            success: false,
            error: "Invalid source path"
        };
    }
    try {
        // Read from the real monorepo file
        const realPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(MONOREPO_ROOT, normalized);
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(realPath)) {
            return {
                success: false,
                error: "Source file not found"
            };
        }
        const rawContent = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(realPath, "utf-8");
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gray$2d$matter$40$4$2e$0$2e$3$2f$node_modules$2f$gray$2d$matter$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(rawContent);
        // Update the status field
        parsed.data.status = newStatus;
        parsed.data.updated = new Date().toISOString().split("T")[0];
        // Write back to real file
        const updated = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gray$2d$matter$40$4$2e$0$2e$3$2f$node_modules$2f$gray$2d$matter$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].stringify(parsed.content, parsed.data);
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(realPath, updated, "utf-8");
        // Update cache copy
        const cachePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(CACHE_ROOT, normalized);
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(cachePath))) {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(cachePath, updated, "utf-8");
        }
        // Revalidate the process page
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/process");
        return {
            success: true
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error"
        };
    }
}
async function archiveInitiative(slug) {
    // Validate slug (no slashes, no dots, no traversal)
    if (!slug || slug.includes("/") || slug.includes("..") || slug.startsWith(".")) {
        return {
            success: false,
            error: "Invalid initiative slug"
        };
    }
    try {
        const srcDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(MONOREPO_ROOT, "docs/initiatives", slug);
        const archiveDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(MONOREPO_ROOT, "docs/initiatives/.archive");
        const destDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(archiveDir, slug);
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(srcDir)) {
            return {
                success: false,
                error: `Initiative "${slug}" not found`
            };
        }
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(destDir)) {
            return {
                success: false,
                error: `Archive already contains "${slug}"`
            };
        }
        // Update proposal.md status to archived before moving
        const proposalPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(srcDir, "proposal.md");
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(proposalPath)) {
            const rawContent = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(proposalPath, "utf-8");
            const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gray$2d$matter$40$4$2e$0$2e$3$2f$node_modules$2f$gray$2d$matter$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(rawContent);
            parsed.data.status = "archived";
            parsed.data.updated = new Date().toISOString().split("T")[0];
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(proposalPath, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gray$2d$matter$40$4$2e$0$2e$3$2f$node_modules$2f$gray$2d$matter$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].stringify(parsed.content, parsed.data), "utf-8");
        }
        // Ensure .archive/ directory exists
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(archiveDir)) {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(archiveDir, {
                recursive: true
            });
        }
        // Move directory
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].renameSync(srcDir, destDir);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/process");
        return {
            success: true
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error"
        };
    }
}
async function restoreInitiative(slug) {
    if (!slug || slug.includes("/") || slug.includes("..") || slug.startsWith(".")) {
        return {
            success: false,
            error: "Invalid initiative slug"
        };
    }
    try {
        const srcDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(MONOREPO_ROOT, "docs/initiatives/.archive", slug);
        const destDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(MONOREPO_ROOT, "docs/initiatives", slug);
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(srcDir)) {
            return {
                success: false,
                error: `Archived initiative "${slug}" not found`
            };
        }
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(destDir)) {
            return {
                success: false,
                error: `Active initiative "${slug}" already exists`
            };
        }
        // Update proposal.md status back to pending
        const proposalPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(srcDir, "proposal.md");
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(proposalPath)) {
            const rawContent = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(proposalPath, "utf-8");
            const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gray$2d$matter$40$4$2e$0$2e$3$2f$node_modules$2f$gray$2d$matter$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(rawContent);
            parsed.data.status = "pending";
            parsed.data.updated = new Date().toISOString().split("T")[0];
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(proposalPath, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gray$2d$matter$40$4$2e$0$2e$3$2f$node_modules$2f$gray$2d$matter$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].stringify(parsed.content, parsed.data), "utf-8");
        }
        // Move directory back
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].renameSync(srcDir, destDir);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/process");
        return {
            success: true
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error"
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    updateNodeStatus,
    archiveInitiative,
    restoreInitiative
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateNodeStatus, "706a95f2136c3f9e756743173c2b9597e390605a37", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(archiveInitiative, "403d607b492237631ad3dbef7c1cbee6d37e9ef6f0", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(restoreInitiative, "40a50a489797b946f81f1c68d388aa6640d2290b7a", null);
}),
"[project]/apps/studio/src/app/process/post-approval.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"60d125360e7de9f556f3f25de3313d8fa8de0b7535":"runPostApproval"},"",""] */ __turbopack_context__.s([
    "runPostApproval",
    ()=>runPostApproval
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.1_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.1_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.1_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
const MONOREPO_ROOT = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(process.cwd(), "../..");
const CACHE_ROOT = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(process.cwd(), ".studio-cache");
const LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions";
const LM_STUDIO_MODEL = "qwen2.5-coder-7b-instruct";
async function callLmStudio(prompt) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(()=>controller.abort(), 10000);
        const res = await fetch(LM_STUDIO_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: LM_STUDIO_MODEL,
                messages: [
                    {
                        role: "user",
                        content: prompt + " /no_think"
                    }
                ],
                temperature: 0.3,
                max_tokens: 2048
            }),
            signal: controller.signal
        });
        clearTimeout(timeout);
        if (!res.ok) return null;
        const data = await res.json();
        return data.choices?.[0]?.message?.content ?? null;
    } catch  {
        return null;
    }
}
function writeFileWithCache(relativePath, content) {
    const realPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(MONOREPO_ROOT, relativePath);
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(realPath), {
        recursive: true
    });
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(realPath, content, "utf-8");
    const cachePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(CACHE_ROOT, relativePath);
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(cachePath))) {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(cachePath, content, "utf-8");
    }
}
function readProjectFile(relativePath) {
    try {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(MONOREPO_ROOT, relativePath), "utf-8");
    } catch  {
        return null;
    }
}
async function runPostApproval(slug, _source) {
    const completed = [];
    const today = new Date().toISOString().split("T")[0];
    // 1. Create activity.md if it doesn't exist
    const activityPath = `docs/initiatives/${slug}/activity.md`;
    const existingActivity = readProjectFile(activityPath);
    if (!existingActivity) {
        const activityContent = [
            "---",
            `started: ${today}`,
            "worktree: null",
            "---",
            "",
            `# ${slug.replace(/-/g, " ").replace(/\b\w/g, (c)=>c.toUpperCase())}`,
            "",
            "## Activity Log",
            "",
            `- **${today}** — Proposal approved`,
            ""
        ].join("\n");
        writeFileWithCache(activityPath, activityContent);
        completed.push(`Created activity log: ${activityPath}`);
    } else {
        completed.push("Activity log already exists — skipped");
    }
    // 2. Scaffold plan.md if missing
    const planPath = `docs/initiatives/${slug}/plan.md`;
    const existingPlan = readProjectFile(planPath);
    if (!existingPlan) {
        const proposalSource = readProjectFile(`docs/initiatives/${slug}/proposal.md`);
        let planContent = null;
        if (proposalSource) {
            planContent = await callLmStudio(`You are a technical planner. Read this approved proposal and generate a plan skeleton in markdown. Include:\n- A title "# <Name> — Implementation Plan"\n- A "## Goal" section (1 sentence)\n- A "## Tasks" section with 3-5 numbered placeholder tasks as "### Task N: <name>" with a brief description\n- A "## Verification" section listing what to check\n\nOutput ONLY the markdown, no commentary.\n\n${proposalSource.slice(0, 4000)}`);
        }
        if (planContent && planContent.length > 50) {
            writeFileWithCache(planPath, planContent.trim() + "\n");
            completed.push(`Scaffolded plan: ${planPath} (via LM Studio)`);
        } else {
            // Fallback: minimal skeleton
            const fallback = [
                `# ${slug.replace(/-/g, " ").replace(/\b\w/g, (c)=>c.toUpperCase())} — Implementation Plan`,
                "",
                "## Goal",
                "",
                "<!-- Fill in from the approved proposal -->",
                "",
                "## Tasks",
                "",
                "### Task 1: TBD",
                "",
                "### Task 2: TBD",
                "",
                "## Verification",
                "",
                "- [ ] `pnpm check` passes",
                ""
            ].join("\n");
            writeFileWithCache(planPath, fallback);
            completed.push(`Scaffolded plan skeleton: ${planPath} (LM Studio unavailable — manual fill needed)`);
        }
    } else {
        completed.push("Plan already exists — skipped");
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/process");
    const hadLmStudioError = completed.some((t)=>t.includes("unavailable"));
    return {
        success: true,
        tasks: completed,
        error: hadLmStudioError ? "LM Studio was unreachable for some tasks. Scaffolds created with placeholders." : undefined
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    runPostApproval
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(runPostApproval, "60d125360e7de9f556f3f25de3313d8fa8de0b7535", null);
}),
"[project]/apps/studio/.next-internal/server/app/process/page/actions.js { ACTIONS_MODULE0 => \"[project]/apps/studio/src/app/process/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/apps/studio/src/app/process/post-approval.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$studio$2f$src$2f$app$2f$process$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/studio/src/app/process/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$studio$2f$src$2f$app$2f$process$2f$post$2d$approval$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/studio/src/app/process/post-approval.ts [app-rsc] (ecmascript)");
;
;
;
;
}),
"[project]/apps/studio/.next-internal/server/app/process/page/actions.js { ACTIONS_MODULE0 => \"[project]/apps/studio/src/app/process/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/apps/studio/src/app/process/post-approval.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "403d607b492237631ad3dbef7c1cbee6d37e9ef6f0",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$studio$2f$src$2f$app$2f$process$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["archiveInitiative"],
    "40a50a489797b946f81f1c68d388aa6640d2290b7a",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$studio$2f$src$2f$app$2f$process$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["restoreInitiative"],
    "60d125360e7de9f556f3f25de3313d8fa8de0b7535",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$studio$2f$src$2f$app$2f$process$2f$post$2d$approval$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["runPostApproval"],
    "706a95f2136c3f9e756743173c2b9597e390605a37",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$studio$2f$src$2f$app$2f$process$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateNodeStatus"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$studio$2f2e$next$2d$internal$2f$server$2f$app$2f$process$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$apps$2f$studio$2f$src$2f$app$2f$process$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$apps$2f$studio$2f$src$2f$app$2f$process$2f$post$2d$approval$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/apps/studio/.next-internal/server/app/process/page/actions.js { ACTIONS_MODULE0 => "[project]/apps/studio/src/app/process/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/apps/studio/src/app/process/post-approval.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$studio$2f$src$2f$app$2f$process$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/studio/src/app/process/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$studio$2f$src$2f$app$2f$process$2f$post$2d$approval$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/studio/src/app/process/post-approval.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d9fdc930._.js.map