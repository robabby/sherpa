module.exports = [
"[project]/node_modules/.pnpm/mermaid@11.13.0/node_modules/mermaid/dist/chunks/mermaid.core/chunk-AGHRB4JF.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__export",
    ()=>__export,
    "__name",
    ()=>__name,
    "log",
    ()=>log,
    "setLogLevel",
    ()=>setLogLevel
]);
// src/logger.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$dayjs$40$1$2e$11$2e$20$2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/dayjs@1.11.20/node_modules/dayjs/dayjs.min.js [app-ssr] (ecmascript)");
var __defProp = Object.defineProperty;
var __name = (target, value)=>__defProp(target, "name", {
        value,
        configurable: true
    });
var __export = (target, all)=>{
    for(var name in all)__defProp(target, name, {
        get: all[name],
        enumerable: true
    });
};
;
var LEVELS = {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    fatal: 5
};
var log = {
    trace: /* @__PURE__ */ __name((..._args)=>{}, "trace"),
    debug: /* @__PURE__ */ __name((..._args)=>{}, "debug"),
    info: /* @__PURE__ */ __name((..._args)=>{}, "info"),
    warn: /* @__PURE__ */ __name((..._args)=>{}, "warn"),
    error: /* @__PURE__ */ __name((..._args)=>{}, "error"),
    fatal: /* @__PURE__ */ __name((..._args)=>{}, "fatal")
};
var setLogLevel = /* @__PURE__ */ __name(function(level = "fatal") {
    let numericLevel = LEVELS.fatal;
    if (typeof level === "string") {
        if (level.toLowerCase() in LEVELS) {
            numericLevel = LEVELS[level];
        }
    } else if (typeof level === "number") {
        numericLevel = level;
    }
    log.trace = ()=>{};
    log.debug = ()=>{};
    log.info = ()=>{};
    log.warn = ()=>{};
    log.error = ()=>{};
    log.fatal = ()=>{};
    if (numericLevel <= LEVELS.fatal) {
        log.fatal = console.error ? console.error.bind(console, format("FATAL"), "color: orange") : console.log.bind(console, "\x1B[35m", format("FATAL"));
    }
    if (numericLevel <= LEVELS.error) {
        log.error = console.error ? console.error.bind(console, format("ERROR"), "color: orange") : console.log.bind(console, "\x1B[31m", format("ERROR"));
    }
    if (numericLevel <= LEVELS.warn) {
        log.warn = console.warn ? console.warn.bind(console, format("WARN"), "color: orange") : console.log.bind(console, `\x1B[33m`, format("WARN"));
    }
    if (numericLevel <= LEVELS.info) {
        log.info = console.info ? console.info.bind(console, format("INFO"), "color: lightblue") : console.log.bind(console, "\x1B[34m", format("INFO"));
    }
    if (numericLevel <= LEVELS.debug) {
        log.debug = console.debug ? console.debug.bind(console, format("DEBUG"), "color: lightgreen") : console.log.bind(console, "\x1B[32m", format("DEBUG"));
    }
    if (numericLevel <= LEVELS.trace) {
        log.trace = console.debug ? console.debug.bind(console, format("TRACE"), "color: lightgreen") : console.log.bind(console, "\x1B[32m", format("TRACE"));
    }
}, "setLogLevel");
var format = /* @__PURE__ */ __name((level)=>{
    const time = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$dayjs$40$1$2e$11$2e$20$2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])().format("ss.SSS");
    return `%c${time} : ${level} : `;
}, "format");
;
}),
"[project]/node_modules/.pnpm/mermaid@11.13.0/node_modules/mermaid/dist/chunks/mermaid.core/chunk-7R4GIKGN.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UnknownDiagramError",
    ()=>UnknownDiagramError,
    "addDirective",
    ()=>addDirective,
    "assignWithDepth_default",
    ()=>assignWithDepth_default,
    "calculateMathMLDimensions",
    ()=>calculateMathMLDimensions,
    "clear",
    ()=>clear,
    "commonDb_exports",
    ()=>commonDb_exports,
    "common_default",
    ()=>common_default,
    "configureSvgSize",
    ()=>configureSvgSize,
    "defaultConfig",
    ()=>defaultConfig,
    "defaultConfig2",
    ()=>defaultConfig2,
    "defaultConfig_default",
    ()=>defaultConfig_default,
    "detectType",
    ()=>detectType,
    "detectors",
    ()=>detectors,
    "directiveRegex",
    ()=>directiveRegex,
    "evaluate",
    ()=>evaluate,
    "frontMatterRegex",
    ()=>frontMatterRegex,
    "getAccDescription",
    ()=>getAccDescription,
    "getAccTitle",
    ()=>getAccTitle,
    "getConfig",
    ()=>getConfig,
    "getConfig2",
    ()=>getConfig2,
    "getDiagram",
    ()=>getDiagram,
    "getDiagramLoader",
    ()=>getDiagramLoader,
    "getDiagramTitle",
    ()=>getDiagramTitle,
    "getEffectiveHtmlLabels",
    ()=>getEffectiveHtmlLabels,
    "getSiteConfig",
    ()=>getSiteConfig,
    "getThemeVariables",
    ()=>getThemeVariables3,
    "getUrl",
    ()=>getUrl,
    "getUserDefinedConfig",
    ()=>getUserDefinedConfig,
    "hasKatex",
    ()=>hasKatex,
    "lineBreakRegex",
    ()=>lineBreakRegex,
    "parseGenericTypes",
    ()=>parseGenericTypes,
    "registerDiagram",
    ()=>registerDiagram,
    "registerLazyLoadedDiagrams",
    ()=>registerLazyLoadedDiagrams,
    "renderKatexSanitized",
    ()=>renderKatexSanitized,
    "reset",
    ()=>reset,
    "sanitizeDirective",
    ()=>sanitizeDirective,
    "sanitizeText",
    ()=>sanitizeText,
    "sanitizeText2",
    ()=>sanitizeText3,
    "saveConfigFromInitialize",
    ()=>saveConfigFromInitialize,
    "setAccDescription",
    ()=>setAccDescription,
    "setAccTitle",
    ()=>setAccTitle,
    "setConfig",
    ()=>setConfig,
    "setConfig2",
    ()=>setConfig2,
    "setDiagramTitle",
    ()=>setDiagramTitle,
    "setSiteConfig",
    ()=>setSiteConfig,
    "setupGraphViewbox",
    ()=>setupGraphViewbox,
    "setupGraphViewbox2",
    ()=>setupGraphViewbox2,
    "styles_default",
    ()=>styles_default,
    "themes_default",
    ()=>themes_default,
    "updateSiteConfig",
    ()=>updateSiteConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/mermaid@11.13.0/node_modules/mermaid/dist/chunks/mermaid.core/chunk-AGHRB4JF.mjs [app-ssr] (ecmascript)");
// src/themes/theme-base.js
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/khroma@2.1.0/node_modules/khroma/dist/methods/adjust.js [app-ssr] (ecmascript) <export default as adjust>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/khroma@2.1.0/node_modules/khroma/dist/methods/darken.js [app-ssr] (ecmascript) <export default as darken>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/khroma@2.1.0/node_modules/khroma/dist/methods/invert.js [app-ssr] (ecmascript) <export default as invert>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$is_dark$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__isDark$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/khroma@2.1.0/node_modules/khroma/dist/methods/is_dark.js [app-ssr] (ecmascript) <export default as isDark>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/khroma@2.1.0/node_modules/khroma/dist/methods/lighten.js [app-ssr] (ecmascript) <export default as lighten>");
// src/themes/theme-dark.js
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$rgba$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__rgba$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/khroma@2.1.0/node_modules/khroma/dist/methods/rgba.js [app-ssr] (ecmascript) <export default as rgba>");
// src/diagrams/common/common.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$dompurify$40$3$2e$3$2e$3$2f$node_modules$2f$dompurify$2f$dist$2f$purify$2e$es$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/dompurify@3.3.3/node_modules/dompurify/dist/purify.es.mjs [app-ssr] (ecmascript)");
;
// src/diagram-api/regexes.ts
var frontMatterRegex = /^-{3}\s*[\n\r](.*?)[\n\r]-{3}\s*[\n\r]+/s;
var directiveRegex = /%{2}{\s*(?:(\w+)\s*:|(\w+))\s*(?:(\w+)|((?:(?!}%{2}).|\r?\n)*))?\s*(?:}%{2})?/gi;
var anyCommentRegex = /\s*%%.*\n/gm;
// src/errors.ts
var UnknownDiagramError = class extends Error {
    static{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(this, "UnknownDiagramError");
    }
    constructor(message){
        super(message);
        this.name = "UnknownDiagramError";
    }
};
// src/diagram-api/detectType.ts
var detectors = {};
var detectType = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(text, config2) {
    text = text.replace(frontMatterRegex, "").replace(directiveRegex, "").replace(anyCommentRegex, "\n");
    for (const [key, { detector }] of Object.entries(detectors)){
        const diagram = detector(text, config2);
        if (diagram) {
            return key;
        }
    }
    throw new UnknownDiagramError(`No diagram type detected matching given configuration for text: ${text}`);
}, "detectType");
var registerLazyLoadedDiagrams = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((...diagrams2)=>{
    for (const { id, detector, loader } of diagrams2){
        addDetector(id, detector, loader);
    }
}, "registerLazyLoadedDiagrams");
var addDetector = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((key, detector, loader)=>{
    if (detectors[key]) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"].warn(`Detector with key ${key} already exists. Overwriting.`);
    }
    detectors[key] = {
        detector,
        loader
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"].debug(`Detector with key ${key} added${loader ? " with loader" : ""}`);
}, "addDetector");
var getDiagramLoader = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((key)=>{
    return detectors[key].loader;
}, "getDiagramLoader");
// src/assignWithDepth.ts
var assignWithDepth = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((dst, src, { depth = 2, clobber = false } = {})=>{
    const config2 = {
        depth,
        clobber
    };
    if (Array.isArray(src) && !Array.isArray(dst)) {
        src.forEach((s)=>assignWithDepth(dst, s, config2));
        return dst;
    } else if (Array.isArray(src) && Array.isArray(dst)) {
        src.forEach((s)=>{
            if (!dst.includes(s)) {
                dst.push(s);
            }
        });
        return dst;
    }
    if (dst === void 0 || depth <= 0) {
        if (dst !== void 0 && dst !== null && typeof dst === "object" && typeof src === "object") {
            return Object.assign(dst, src);
        } else {
            return src;
        }
    }
    if (src !== void 0 && typeof dst === "object" && typeof src === "object") {
        Object.keys(src).forEach((key)=>{
            if (typeof src[key] === "object" && src[key] !== null && (dst[key] === void 0 || typeof dst[key] === "object")) {
                if (dst[key] === void 0) {
                    dst[key] = Array.isArray(src[key]) ? [] : {};
                }
                dst[key] = assignWithDepth(dst[key], src[key], {
                    depth: depth - 1,
                    clobber
                });
            } else if (clobber || typeof dst[key] !== "object" && typeof src[key] !== "object") {
                dst[key] = src[key];
            }
        });
    }
    return dst;
}, "assignWithDepth");
var assignWithDepth_default = assignWithDepth;
;
// src/themes/erDiagram-oldHardcodedValues.ts
var oldAttributeBackgroundColorOdd = "#ffffff";
var oldAttributeBackgroundColorEven = "#f2f2f2";
;
var mkBorder = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((col, darkMode)=>darkMode ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(col, {
        s: -40,
        l: 10
    }) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(col, {
        s: -40,
        l: -10
    }), "mkBorder");
// src/themes/theme-base.js
var Theme = class {
    static{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(this, "Theme");
    }
    constructor(){
        this.background = "#f4f4f4";
        this.primaryColor = "#fff4dd";
        this.noteBkgColor = "#fff5ad";
        this.noteTextColor = "#333";
        this.THEME_COLOR_LIMIT = 12;
        this.fontFamily = '"trebuchet ms", verdana, arial, sans-serif';
        this.fontSize = "16px";
    }
    updateColors() {
        this.primaryTextColor = this.primaryTextColor || (this.darkMode ? "#eee" : "#333");
        this.secondaryColor = this.secondaryColor || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -120
        });
        this.tertiaryColor = this.tertiaryColor || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 180,
            l: 5
        });
        this.primaryBorderColor = this.primaryBorderColor || mkBorder(this.primaryColor, this.darkMode);
        this.secondaryBorderColor = this.secondaryBorderColor || mkBorder(this.secondaryColor, this.darkMode);
        this.tertiaryBorderColor = this.tertiaryBorderColor || mkBorder(this.tertiaryColor, this.darkMode);
        this.noteBorderColor = this.noteBorderColor || mkBorder(this.noteBkgColor, this.darkMode);
        this.noteBkgColor = this.noteBkgColor || "#fff5ad";
        this.noteTextColor = this.noteTextColor || "#333";
        this.secondaryTextColor = this.secondaryTextColor || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.secondaryColor);
        this.tertiaryTextColor = this.tertiaryTextColor || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.tertiaryColor);
        this.lineColor = this.lineColor || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.background);
        this.arrowheadColor = this.arrowheadColor || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.background);
        this.textColor = this.textColor || this.primaryTextColor;
        this.border2 = this.border2 || this.tertiaryBorderColor;
        this.nodeBkg = this.nodeBkg || this.primaryColor;
        this.mainBkg = this.mainBkg || this.primaryColor;
        this.nodeBorder = this.nodeBorder || this.primaryBorderColor;
        this.clusterBkg = this.clusterBkg || this.tertiaryColor;
        this.clusterBorder = this.clusterBorder || this.tertiaryBorderColor;
        this.defaultLinkColor = this.defaultLinkColor || this.lineColor;
        this.titleColor = this.titleColor || this.tertiaryTextColor;
        this.edgeLabelBackground = this.edgeLabelBackground || (this.darkMode ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.secondaryColor, 30) : this.secondaryColor);
        this.nodeTextColor = this.nodeTextColor || this.primaryTextColor;
        this.actorBorder = this.actorBorder || this.primaryBorderColor;
        this.actorBkg = this.actorBkg || this.mainBkg;
        this.actorTextColor = this.actorTextColor || this.primaryTextColor;
        this.actorLineColor = this.actorLineColor || this.actorBorder;
        this.labelBoxBkgColor = this.labelBoxBkgColor || this.actorBkg;
        this.signalColor = this.signalColor || this.textColor;
        this.signalTextColor = this.signalTextColor || this.textColor;
        this.labelBoxBorderColor = this.labelBoxBorderColor || this.actorBorder;
        this.labelTextColor = this.labelTextColor || this.actorTextColor;
        this.loopTextColor = this.loopTextColor || this.actorTextColor;
        this.activationBorderColor = this.activationBorderColor || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.secondaryColor, 10);
        this.activationBkgColor = this.activationBkgColor || this.secondaryColor;
        this.sequenceNumberColor = this.sequenceNumberColor || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.lineColor);
        this.sectionBkgColor = this.sectionBkgColor || this.tertiaryColor;
        this.altSectionBkgColor = this.altSectionBkgColor || "white";
        this.sectionBkgColor = this.sectionBkgColor || this.secondaryColor;
        this.sectionBkgColor2 = this.sectionBkgColor2 || this.primaryColor;
        this.excludeBkgColor = this.excludeBkgColor || "#eeeeee";
        this.taskBorderColor = this.taskBorderColor || this.primaryBorderColor;
        this.taskBkgColor = this.taskBkgColor || this.primaryColor;
        this.activeTaskBorderColor = this.activeTaskBorderColor || this.primaryColor;
        this.activeTaskBkgColor = this.activeTaskBkgColor || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.primaryColor, 23);
        this.gridColor = this.gridColor || "lightgrey";
        this.doneTaskBkgColor = this.doneTaskBkgColor || "lightgrey";
        this.doneTaskBorderColor = this.doneTaskBorderColor || "grey";
        this.critBorderColor = this.critBorderColor || "#ff8888";
        this.critBkgColor = this.critBkgColor || "red";
        this.todayLineColor = this.todayLineColor || "red";
        this.vertLineColor = this.vertLineColor || "navy";
        this.taskTextColor = this.taskTextColor || this.textColor;
        this.taskTextOutsideColor = this.taskTextOutsideColor || this.textColor;
        this.taskTextLightColor = this.taskTextLightColor || this.textColor;
        this.taskTextColor = this.taskTextColor || this.primaryTextColor;
        this.taskTextDarkColor = this.taskTextDarkColor || this.textColor;
        this.taskTextClickableColor = this.taskTextClickableColor || "#003163";
        this.personBorder = this.personBorder || this.primaryBorderColor;
        this.personBkg = this.personBkg || this.mainBkg;
        if (this.darkMode) {
            this.rowOdd = this.rowOdd || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.mainBkg, 5) || "#ffffff";
            this.rowEven = this.rowEven || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.mainBkg, 10);
        } else {
            this.rowOdd = this.rowOdd || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.mainBkg, 75) || "#ffffff";
            this.rowEven = this.rowEven || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.mainBkg, 5);
        }
        this.transitionColor = this.transitionColor || this.lineColor;
        this.transitionLabelColor = this.transitionLabelColor || this.textColor;
        this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor;
        this.stateBkg = this.stateBkg || this.mainBkg;
        this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg;
        this.compositeBackground = this.compositeBackground || this.background || this.tertiaryColor;
        this.altBackground = this.altBackground || this.tertiaryColor;
        this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg;
        this.compositeBorder = this.compositeBorder || this.nodeBorder;
        this.innerEndBackground = this.nodeBorder;
        this.errorBkgColor = this.errorBkgColor || this.tertiaryColor;
        this.errorTextColor = this.errorTextColor || this.tertiaryTextColor;
        this.transitionColor = this.transitionColor || this.lineColor;
        this.specialStateColor = this.lineColor;
        this.cScale0 = this.cScale0 || this.primaryColor;
        this.cScale1 = this.cScale1 || this.secondaryColor;
        this.cScale2 = this.cScale2 || this.tertiaryColor;
        this.cScale3 = this.cScale3 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 30
        });
        this.cScale4 = this.cScale4 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 60
        });
        this.cScale5 = this.cScale5 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 90
        });
        this.cScale6 = this.cScale6 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 120
        });
        this.cScale7 = this.cScale7 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 150
        });
        this.cScale8 = this.cScale8 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 210,
            l: 150
        });
        this.cScale9 = this.cScale9 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 270
        });
        this.cScale10 = this.cScale10 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 300
        });
        this.cScale11 = this.cScale11 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 330
        });
        if (this.darkMode) {
            for(let i = 0; i < this.THEME_COLOR_LIMIT; i++){
                this["cScale" + i] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this["cScale" + i], 75);
            }
        } else {
            for(let i = 0; i < this.THEME_COLOR_LIMIT; i++){
                this["cScale" + i] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this["cScale" + i], 25);
            }
        }
        for(let i = 0; i < this.THEME_COLOR_LIMIT; i++){
            this["cScaleInv" + i] = this["cScaleInv" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this["cScale" + i]);
        }
        for(let i = 0; i < this.THEME_COLOR_LIMIT; i++){
            if (this.darkMode) {
                this["cScalePeer" + i] = this["cScalePeer" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this["cScale" + i], 10);
            } else {
                this["cScalePeer" + i] = this["cScalePeer" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this["cScale" + i], 10);
            }
        }
        this.scaleLabelColor = this.scaleLabelColor || this.labelTextColor;
        for(let i = 0; i < this.THEME_COLOR_LIMIT; i++){
            this["cScaleLabel" + i] = this["cScaleLabel" + i] || this.scaleLabelColor;
        }
        const multiplier = this.darkMode ? -4 : -1;
        for(let i = 0; i < 5; i++){
            this["surface" + i] = this["surface" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.mainBkg, {
                h: 180,
                s: -15,
                l: multiplier * (5 + i * 3)
            });
            this["surfacePeer" + i] = this["surfacePeer" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.mainBkg, {
                h: 180,
                s: -15,
                l: multiplier * (8 + i * 3)
            });
        }
        this.classText = this.classText || this.textColor;
        this.fillType0 = this.fillType0 || this.primaryColor;
        this.fillType1 = this.fillType1 || this.secondaryColor;
        this.fillType2 = this.fillType2 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 64
        });
        this.fillType3 = this.fillType3 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            h: 64
        });
        this.fillType4 = this.fillType4 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -64
        });
        this.fillType5 = this.fillType5 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            h: -64
        });
        this.fillType6 = this.fillType6 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 128
        });
        this.fillType7 = this.fillType7 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            h: 128
        });
        this.pie1 = this.pie1 || this.primaryColor;
        this.pie2 = this.pie2 || this.secondaryColor;
        this.pie3 = this.pie3 || this.tertiaryColor;
        this.pie4 = this.pie4 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            l: -10
        });
        this.pie5 = this.pie5 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            l: -10
        });
        this.pie6 = this.pie6 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.tertiaryColor, {
            l: -10
        });
        this.pie7 = this.pie7 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 60,
            l: -10
        });
        this.pie8 = this.pie8 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -60,
            l: -10
        });
        this.pie9 = this.pie9 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 120,
            l: 0
        });
        this.pie10 = this.pie10 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 60,
            l: -20
        });
        this.pie11 = this.pie11 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -60,
            l: -20
        });
        this.pie12 = this.pie12 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 120,
            l: -10
        });
        this.pieTitleTextSize = this.pieTitleTextSize || "25px";
        this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor;
        this.pieSectionTextSize = this.pieSectionTextSize || "17px";
        this.pieSectionTextColor = this.pieSectionTextColor || this.textColor;
        this.pieLegendTextSize = this.pieLegendTextSize || "17px";
        this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor;
        this.pieStrokeColor = this.pieStrokeColor || "black";
        this.pieStrokeWidth = this.pieStrokeWidth || "2px";
        this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || "2px";
        this.pieOuterStrokeColor = this.pieOuterStrokeColor || "black";
        this.pieOpacity = this.pieOpacity || "0.7";
        this.venn1 = this.venn1 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            l: -30
        });
        this.venn2 = this.venn2 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            l: -30
        });
        this.venn3 = this.venn3 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.tertiaryColor, {
            l: -30
        });
        this.venn4 = this.venn4 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 60,
            l: -30
        });
        this.venn5 = this.venn5 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -60,
            l: -30
        });
        this.venn6 = this.venn6 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            h: 60,
            l: -30
        });
        this.venn7 = this.venn7 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 120,
            l: -30
        });
        this.venn8 = this.venn8 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            h: 120,
            l: -30
        });
        this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor;
        this.vennSetTextColor = this.vennSetTextColor ?? this.textColor;
        this.radar = {
            axisColor: this.radar?.axisColor || this.lineColor,
            axisStrokeWidth: this.radar?.axisStrokeWidth || 2,
            axisLabelFontSize: this.radar?.axisLabelFontSize || 12,
            curveOpacity: this.radar?.curveOpacity || 0.5,
            curveStrokeWidth: this.radar?.curveStrokeWidth || 2,
            graticuleColor: this.radar?.graticuleColor || "#DEDEDE",
            graticuleStrokeWidth: this.radar?.graticuleStrokeWidth || 1,
            graticuleOpacity: this.radar?.graticuleOpacity || 0.3,
            legendBoxSize: this.radar?.legendBoxSize || 12,
            legendFontSize: this.radar?.legendFontSize || 12
        };
        this.archEdgeColor = this.archEdgeColor || "#777";
        this.archEdgeArrowColor = this.archEdgeArrowColor || "#777";
        this.archEdgeWidth = this.archEdgeWidth || "3";
        this.archGroupBorderColor = this.archGroupBorderColor || "#000";
        this.archGroupBorderWidth = this.archGroupBorderWidth || "2px";
        this.quadrant1Fill = this.quadrant1Fill || this.primaryColor;
        this.quadrant2Fill = this.quadrant2Fill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            r: 5,
            g: 5,
            b: 5
        });
        this.quadrant3Fill = this.quadrant3Fill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            r: 10,
            g: 10,
            b: 10
        });
        this.quadrant4Fill = this.quadrant4Fill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            r: 15,
            g: 15,
            b: 15
        });
        this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor;
        this.quadrant2TextFill = this.quadrant2TextFill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryTextColor, {
            r: -5,
            g: -5,
            b: -5
        });
        this.quadrant3TextFill = this.quadrant3TextFill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryTextColor, {
            r: -10,
            g: -10,
            b: -10
        });
        this.quadrant4TextFill = this.quadrant4TextFill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryTextColor, {
            r: -15,
            g: -15,
            b: -15
        });
        this.quadrantPointFill = this.quadrantPointFill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$is_dark$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__isDark$3e$__["isDark"])(this.quadrant1Fill) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.quadrant1Fill) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.quadrant1Fill);
        this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor;
        this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor;
        this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor;
        this.quadrantInternalBorderStrokeFill = this.quadrantInternalBorderStrokeFill || this.primaryBorderColor;
        this.quadrantExternalBorderStrokeFill = this.quadrantExternalBorderStrokeFill || this.primaryBorderColor;
        this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor;
        this.xyChart = {
            backgroundColor: this.xyChart?.backgroundColor || this.background,
            titleColor: this.xyChart?.titleColor || this.primaryTextColor,
            xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
            xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
            xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
            xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
            yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
            yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
            yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
            yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
            plotColorPalette: this.xyChart?.plotColorPalette || "#FFF4DD,#FFD8B1,#FFA07A,#ECEFF1,#D6DBDF,#C3E0A8,#FFB6A4,#FFD74D,#738FA7,#FFFFF0"
        };
        this.requirementBackground = this.requirementBackground || this.primaryColor;
        this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor;
        this.requirementBorderSize = this.requirementBorderSize || "1";
        this.requirementTextColor = this.requirementTextColor || this.primaryTextColor;
        this.relationColor = this.relationColor || this.lineColor;
        this.relationLabelBackground = this.relationLabelBackground || (this.darkMode ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.secondaryColor, 30) : this.secondaryColor);
        this.relationLabelColor = this.relationLabelColor || this.actorTextColor;
        this.git0 = this.git0 || this.primaryColor;
        this.git1 = this.git1 || this.secondaryColor;
        this.git2 = this.git2 || this.tertiaryColor;
        this.git3 = this.git3 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -30
        });
        this.git4 = this.git4 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -60
        });
        this.git5 = this.git5 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -90
        });
        this.git6 = this.git6 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 60
        });
        this.git7 = this.git7 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 120
        });
        if (this.darkMode) {
            this.git0 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git0, 25);
            this.git1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git1, 25);
            this.git2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git2, 25);
            this.git3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git3, 25);
            this.git4 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git4, 25);
            this.git5 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git5, 25);
            this.git6 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git6, 25);
            this.git7 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git7, 25);
        } else {
            this.git0 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git0, 25);
            this.git1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git1, 25);
            this.git2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git2, 25);
            this.git3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git3, 25);
            this.git4 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git4, 25);
            this.git5 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git5, 25);
            this.git6 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git6, 25);
            this.git7 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git7, 25);
        }
        this.gitInv0 = this.gitInv0 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git0);
        this.gitInv1 = this.gitInv1 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git1);
        this.gitInv2 = this.gitInv2 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git2);
        this.gitInv3 = this.gitInv3 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git3);
        this.gitInv4 = this.gitInv4 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git4);
        this.gitInv5 = this.gitInv5 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git5);
        this.gitInv6 = this.gitInv6 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git6);
        this.gitInv7 = this.gitInv7 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git7);
        this.branchLabelColor = this.branchLabelColor || (this.darkMode ? "black" : this.labelTextColor);
        this.gitBranchLabel0 = this.gitBranchLabel0 || this.branchLabelColor;
        this.gitBranchLabel1 = this.gitBranchLabel1 || this.branchLabelColor;
        this.gitBranchLabel2 = this.gitBranchLabel2 || this.branchLabelColor;
        this.gitBranchLabel3 = this.gitBranchLabel3 || this.branchLabelColor;
        this.gitBranchLabel4 = this.gitBranchLabel4 || this.branchLabelColor;
        this.gitBranchLabel5 = this.gitBranchLabel5 || this.branchLabelColor;
        this.gitBranchLabel6 = this.gitBranchLabel6 || this.branchLabelColor;
        this.gitBranchLabel7 = this.gitBranchLabel7 || this.branchLabelColor;
        this.tagLabelColor = this.tagLabelColor || this.primaryTextColor;
        this.tagLabelBackground = this.tagLabelBackground || this.primaryColor;
        this.tagLabelBorder = this.tagBorder || this.primaryBorderColor;
        this.tagLabelFontSize = this.tagLabelFontSize || "10px";
        this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor;
        this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor;
        this.commitLabelFontSize = this.commitLabelFontSize || "10px";
        this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || oldAttributeBackgroundColorOdd;
        this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || oldAttributeBackgroundColorEven;
    }
    calculate(overrides) {
        if (typeof overrides !== "object") {
            this.updateColors();
            return;
        }
        const keys = Object.keys(overrides);
        keys.forEach((k)=>{
            this[k] = overrides[k];
        });
        this.updateColors();
        keys.forEach((k)=>{
            this[k] = overrides[k];
        });
    }
};
var getThemeVariables = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((userOverrides)=>{
    const theme = new Theme();
    theme.calculate(userOverrides);
    return theme;
}, "getThemeVariables");
;
var Theme2 = class {
    static{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(this, "Theme");
    }
    constructor(){
        this.background = "#333";
        this.primaryColor = "#1f2020";
        this.secondaryColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.primaryColor, 16);
        this.tertiaryColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -160
        });
        this.primaryBorderColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.background);
        this.secondaryBorderColor = mkBorder(this.secondaryColor, this.darkMode);
        this.tertiaryBorderColor = mkBorder(this.tertiaryColor, this.darkMode);
        this.primaryTextColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.primaryColor);
        this.secondaryTextColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.secondaryColor);
        this.tertiaryTextColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.tertiaryColor);
        this.lineColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.background);
        this.textColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.background);
        this.mainBkg = "#1f2020";
        this.secondBkg = "calculated";
        this.mainContrastColor = "lightgrey";
        this.darkTextColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])("#323D47"), 10);
        this.lineColor = "calculated";
        this.border1 = "#ccc";
        this.border2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$rgba$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__rgba$3e$__["rgba"])(255, 255, 255, 0.25);
        this.arrowheadColor = "calculated";
        this.fontFamily = '"trebuchet ms", verdana, arial, sans-serif';
        this.fontSize = "16px";
        this.labelBackground = "#181818";
        this.textColor = "#ccc";
        this.THEME_COLOR_LIMIT = 12;
        this.nodeBkg = "calculated";
        this.nodeBorder = "calculated";
        this.clusterBkg = "calculated";
        this.clusterBorder = "calculated";
        this.defaultLinkColor = "calculated";
        this.titleColor = "#F9FFFE";
        this.edgeLabelBackground = "calculated";
        this.actorBorder = "calculated";
        this.actorBkg = "calculated";
        this.actorTextColor = "calculated";
        this.actorLineColor = "calculated";
        this.signalColor = "calculated";
        this.signalTextColor = "calculated";
        this.labelBoxBkgColor = "calculated";
        this.labelBoxBorderColor = "calculated";
        this.labelTextColor = "calculated";
        this.loopTextColor = "calculated";
        this.noteBorderColor = "calculated";
        this.noteBkgColor = "#fff5ad";
        this.noteTextColor = "calculated";
        this.activationBorderColor = "calculated";
        this.activationBkgColor = "calculated";
        this.sequenceNumberColor = "black";
        this.sectionBkgColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])("#EAE8D9", 30);
        this.altSectionBkgColor = "calculated";
        this.sectionBkgColor2 = "#EAE8D9";
        this.excludeBkgColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.sectionBkgColor, 10);
        this.taskBorderColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$rgba$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__rgba$3e$__["rgba"])(255, 255, 255, 70);
        this.taskBkgColor = "calculated";
        this.taskTextColor = "calculated";
        this.taskTextLightColor = "calculated";
        this.taskTextOutsideColor = "calculated";
        this.taskTextClickableColor = "#003163";
        this.activeTaskBorderColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$rgba$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__rgba$3e$__["rgba"])(255, 255, 255, 50);
        this.activeTaskBkgColor = "#81B1DB";
        this.gridColor = "calculated";
        this.doneTaskBkgColor = "calculated";
        this.doneTaskBorderColor = "grey";
        this.critBorderColor = "#E83737";
        this.critBkgColor = "#E83737";
        this.taskTextDarkColor = "calculated";
        this.todayLineColor = "#DB5757";
        this.vertLineColor = "#00BFFF";
        this.personBorder = this.primaryBorderColor;
        this.personBkg = this.mainBkg;
        this.archEdgeColor = "calculated";
        this.archEdgeArrowColor = "calculated";
        this.archEdgeWidth = "3";
        this.archGroupBorderColor = this.primaryBorderColor;
        this.archGroupBorderWidth = "2px";
        this.rowOdd = this.rowOdd || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.mainBkg, 5) || "#ffffff";
        this.rowEven = this.rowEven || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.mainBkg, 10);
        this.labelColor = "calculated";
        this.errorBkgColor = "#a44141";
        this.errorTextColor = "#ddd";
    }
    updateColors() {
        this.secondBkg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.mainBkg, 16);
        this.lineColor = this.mainContrastColor;
        this.arrowheadColor = this.mainContrastColor;
        this.nodeBkg = this.mainBkg;
        this.nodeBorder = this.border1;
        this.clusterBkg = this.secondBkg;
        this.clusterBorder = this.border2;
        this.defaultLinkColor = this.lineColor;
        this.edgeLabelBackground = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.labelBackground, 25);
        this.actorBorder = this.border1;
        this.actorBkg = this.mainBkg;
        this.actorTextColor = this.mainContrastColor;
        this.actorLineColor = this.actorBorder;
        this.signalColor = this.mainContrastColor;
        this.signalTextColor = this.mainContrastColor;
        this.labelBoxBkgColor = this.actorBkg;
        this.labelBoxBorderColor = this.actorBorder;
        this.labelTextColor = this.mainContrastColor;
        this.loopTextColor = this.mainContrastColor;
        this.noteBorderColor = this.secondaryBorderColor;
        this.noteBkgColor = this.secondBkg;
        this.noteTextColor = this.secondaryTextColor;
        this.activationBorderColor = this.border1;
        this.activationBkgColor = this.secondBkg;
        this.altSectionBkgColor = this.background;
        this.taskBkgColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.mainBkg, 23);
        this.taskTextColor = this.darkTextColor;
        this.taskTextLightColor = this.mainContrastColor;
        this.taskTextOutsideColor = this.taskTextLightColor;
        this.gridColor = this.mainContrastColor;
        this.doneTaskBkgColor = this.mainContrastColor;
        this.taskTextDarkColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.doneTaskBkgColor);
        this.archEdgeColor = this.lineColor;
        this.archEdgeArrowColor = this.lineColor;
        this.transitionColor = this.transitionColor || this.lineColor;
        this.transitionLabelColor = this.transitionLabelColor || this.textColor;
        this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor;
        this.stateBkg = this.stateBkg || this.mainBkg;
        this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg;
        this.compositeBackground = this.compositeBackground || this.background || this.tertiaryColor;
        this.altBackground = this.altBackground || "#555";
        this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg;
        this.compositeBorder = this.compositeBorder || this.nodeBorder;
        this.innerEndBackground = this.primaryBorderColor;
        this.specialStateColor = "#f4f4f4";
        this.errorBkgColor = this.errorBkgColor || this.tertiaryColor;
        this.errorTextColor = this.errorTextColor || this.tertiaryTextColor;
        this.fillType0 = this.primaryColor;
        this.fillType1 = this.secondaryColor;
        this.fillType2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 64
        });
        this.fillType3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            h: 64
        });
        this.fillType4 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -64
        });
        this.fillType5 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            h: -64
        });
        this.fillType6 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 128
        });
        this.fillType7 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            h: 128
        });
        this.cScale1 = this.cScale1 || "#0b0000";
        this.cScale2 = this.cScale2 || "#4d1037";
        this.cScale3 = this.cScale3 || "#3f5258";
        this.cScale4 = this.cScale4 || "#4f2f1b";
        this.cScale5 = this.cScale5 || "#6e0a0a";
        this.cScale6 = this.cScale6 || "#3b0048";
        this.cScale7 = this.cScale7 || "#995a01";
        this.cScale8 = this.cScale8 || "#154706";
        this.cScale9 = this.cScale9 || "#161722";
        this.cScale10 = this.cScale10 || "#00296f";
        this.cScale11 = this.cScale11 || "#01629c";
        this.cScale12 = this.cScale12 || "#010029";
        this.cScale0 = this.cScale0 || this.primaryColor;
        this.cScale1 = this.cScale1 || this.secondaryColor;
        this.cScale2 = this.cScale2 || this.tertiaryColor;
        this.cScale3 = this.cScale3 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 30
        });
        this.cScale4 = this.cScale4 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 60
        });
        this.cScale5 = this.cScale5 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 90
        });
        this.cScale6 = this.cScale6 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 120
        });
        this.cScale7 = this.cScale7 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 150
        });
        this.cScale8 = this.cScale8 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 210
        });
        this.cScale9 = this.cScale9 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 270
        });
        this.cScale10 = this.cScale10 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 300
        });
        this.cScale11 = this.cScale11 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 330
        });
        for(let i = 0; i < this.THEME_COLOR_LIMIT; i++){
            this["cScaleInv" + i] = this["cScaleInv" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this["cScale" + i]);
        }
        for(let i = 0; i < this.THEME_COLOR_LIMIT; i++){
            this["cScalePeer" + i] = this["cScalePeer" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this["cScale" + i], 10);
        }
        for(let i = 0; i < 5; i++){
            this["surface" + i] = this["surface" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.mainBkg, {
                h: 30,
                s: -30,
                l: -(-10 + i * 4)
            });
            this["surfacePeer" + i] = this["surfacePeer" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.mainBkg, {
                h: 30,
                s: -30,
                l: -(-7 + i * 4)
            });
        }
        this.scaleLabelColor = this.scaleLabelColor || (this.darkMode ? "black" : this.labelTextColor);
        for(let i = 0; i < this.THEME_COLOR_LIMIT; i++){
            this["cScaleLabel" + i] = this["cScaleLabel" + i] || this.scaleLabelColor;
        }
        for(let i = 0; i < this.THEME_COLOR_LIMIT; i++){
            this["pie" + i] = this["cScale" + i];
        }
        this.pieTitleTextSize = this.pieTitleTextSize || "25px";
        this.pieTitleTextColor = this.pieTitleTextColor || this.mainContrastColor;
        this.pieSectionTextSize = this.pieSectionTextSize || "17px";
        this.pieSectionTextColor = this.pieSectionTextColor || this.textColor;
        this.pieLegendTextSize = this.pieLegendTextSize || "17px";
        this.pieLegendTextColor = this.pieLegendTextColor || this.mainContrastColor;
        this.pieStrokeColor = this.pieStrokeColor || "black";
        this.pieStrokeWidth = this.pieStrokeWidth || "2px";
        this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || "2px";
        this.pieOuterStrokeColor = this.pieOuterStrokeColor || "black";
        this.pieOpacity = this.pieOpacity || "0.7";
        for(let i = 0; i < 8; i++){
            this["venn" + (i + 1)] = this["venn" + (i + 1)] ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this["cScale" + i], 30);
        }
        this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor;
        this.vennSetTextColor = this.vennSetTextColor ?? this.textColor;
        this.quadrant1Fill = this.quadrant1Fill || this.primaryColor;
        this.quadrant2Fill = this.quadrant2Fill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            r: 5,
            g: 5,
            b: 5
        });
        this.quadrant3Fill = this.quadrant3Fill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            r: 10,
            g: 10,
            b: 10
        });
        this.quadrant4Fill = this.quadrant4Fill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            r: 15,
            g: 15,
            b: 15
        });
        this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor;
        this.quadrant2TextFill = this.quadrant2TextFill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryTextColor, {
            r: -5,
            g: -5,
            b: -5
        });
        this.quadrant3TextFill = this.quadrant3TextFill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryTextColor, {
            r: -10,
            g: -10,
            b: -10
        });
        this.quadrant4TextFill = this.quadrant4TextFill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryTextColor, {
            r: -15,
            g: -15,
            b: -15
        });
        this.quadrantPointFill = this.quadrantPointFill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$is_dark$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__isDark$3e$__["isDark"])(this.quadrant1Fill) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.quadrant1Fill) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.quadrant1Fill);
        this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor;
        this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor;
        this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor;
        this.quadrantInternalBorderStrokeFill = this.quadrantInternalBorderStrokeFill || this.primaryBorderColor;
        this.quadrantExternalBorderStrokeFill = this.quadrantExternalBorderStrokeFill || this.primaryBorderColor;
        this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor;
        this.xyChart = {
            backgroundColor: this.xyChart?.backgroundColor || this.background,
            titleColor: this.xyChart?.titleColor || this.primaryTextColor,
            xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
            xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
            xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
            xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
            yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
            yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
            yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
            yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
            plotColorPalette: this.xyChart?.plotColorPalette || "#3498db,#2ecc71,#e74c3c,#f1c40f,#bdc3c7,#ffffff,#34495e,#9b59b6,#1abc9c,#e67e22"
        };
        this.packet = {
            startByteColor: this.primaryTextColor,
            endByteColor: this.primaryTextColor,
            labelColor: this.primaryTextColor,
            titleColor: this.primaryTextColor,
            blockStrokeColor: this.primaryTextColor,
            blockFillColor: this.background
        };
        this.radar = {
            axisColor: this.radar?.axisColor || this.lineColor,
            axisStrokeWidth: this.radar?.axisStrokeWidth || 2,
            axisLabelFontSize: this.radar?.axisLabelFontSize || 12,
            curveOpacity: this.radar?.curveOpacity || 0.5,
            curveStrokeWidth: this.radar?.curveStrokeWidth || 2,
            graticuleColor: this.radar?.graticuleColor || "#DEDEDE",
            graticuleStrokeWidth: this.radar?.graticuleStrokeWidth || 1,
            graticuleOpacity: this.radar?.graticuleOpacity || 0.3,
            legendBoxSize: this.radar?.legendBoxSize || 12,
            legendFontSize: this.radar?.legendFontSize || 12
        };
        this.classText = this.primaryTextColor;
        this.requirementBackground = this.requirementBackground || this.primaryColor;
        this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor;
        this.requirementBorderSize = this.requirementBorderSize || "1";
        this.requirementTextColor = this.requirementTextColor || this.primaryTextColor;
        this.relationColor = this.relationColor || this.lineColor;
        this.relationLabelBackground = this.relationLabelBackground || (this.darkMode ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.secondaryColor, 30) : this.secondaryColor);
        this.relationLabelColor = this.relationLabelColor || this.actorTextColor;
        this.git0 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.secondaryColor, 20);
        this.git1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.pie2 || this.secondaryColor, 20);
        this.git2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.pie3 || this.tertiaryColor, 20);
        this.git3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.pie4 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -30
        }), 20);
        this.git4 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.pie5 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -60
        }), 20);
        this.git5 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.pie6 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -90
        }), 10);
        this.git6 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.pie7 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 60
        }), 10);
        this.git7 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.pie8 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 120
        }), 20);
        this.gitInv0 = this.gitInv0 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git0);
        this.gitInv1 = this.gitInv1 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git1);
        this.gitInv2 = this.gitInv2 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git2);
        this.gitInv3 = this.gitInv3 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git3);
        this.gitInv4 = this.gitInv4 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git4);
        this.gitInv5 = this.gitInv5 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git5);
        this.gitInv6 = this.gitInv6 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git6);
        this.gitInv7 = this.gitInv7 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git7);
        this.gitBranchLabel0 = this.gitBranchLabel0 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.labelTextColor);
        this.gitBranchLabel1 = this.gitBranchLabel1 || this.labelTextColor;
        this.gitBranchLabel2 = this.gitBranchLabel2 || this.labelTextColor;
        this.gitBranchLabel3 = this.gitBranchLabel3 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.labelTextColor);
        this.gitBranchLabel4 = this.gitBranchLabel4 || this.labelTextColor;
        this.gitBranchLabel5 = this.gitBranchLabel5 || this.labelTextColor;
        this.gitBranchLabel6 = this.gitBranchLabel6 || this.labelTextColor;
        this.gitBranchLabel7 = this.gitBranchLabel7 || this.labelTextColor;
        this.tagLabelColor = this.tagLabelColor || this.primaryTextColor;
        this.tagLabelBackground = this.tagLabelBackground || this.primaryColor;
        this.tagLabelBorder = this.tagBorder || this.primaryBorderColor;
        this.tagLabelFontSize = this.tagLabelFontSize || "10px";
        this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor;
        this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor;
        this.commitLabelFontSize = this.commitLabelFontSize || "10px";
        this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.background, 12);
        this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.background, 2);
        this.nodeBorder = this.nodeBorder || "#999";
    }
    calculate(overrides) {
        if (typeof overrides !== "object") {
            this.updateColors();
            return;
        }
        const keys = Object.keys(overrides);
        keys.forEach((k)=>{
            this[k] = overrides[k];
        });
        this.updateColors();
        keys.forEach((k)=>{
            this[k] = overrides[k];
        });
    }
};
var getThemeVariables2 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((userOverrides)=>{
    const theme = new Theme2();
    theme.calculate(userOverrides);
    return theme;
}, "getThemeVariables");
;
var Theme3 = class {
    static{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(this, "Theme");
    }
    constructor(){
        this.background = "#f4f4f4";
        this.primaryColor = "#ECECFF";
        this.secondaryColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 120
        });
        this.secondaryColor = "#ffffde";
        this.tertiaryColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -160
        });
        this.primaryBorderColor = mkBorder(this.primaryColor, this.darkMode);
        this.secondaryBorderColor = mkBorder(this.secondaryColor, this.darkMode);
        this.tertiaryBorderColor = mkBorder(this.tertiaryColor, this.darkMode);
        this.primaryTextColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.primaryColor);
        this.secondaryTextColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.secondaryColor);
        this.tertiaryTextColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.tertiaryColor);
        this.lineColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.background);
        this.textColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.background);
        this.background = "white";
        this.mainBkg = "#ECECFF";
        this.secondBkg = "#ffffde";
        this.lineColor = "#333333";
        this.border1 = "#9370DB";
        this.border2 = "#aaaa33";
        this.arrowheadColor = "#333333";
        this.fontFamily = '"trebuchet ms", verdana, arial, sans-serif';
        this.fontSize = "16px";
        this.labelBackground = "rgba(232,232,232, 0.8)";
        this.textColor = "#333";
        this.THEME_COLOR_LIMIT = 12;
        this.nodeBkg = "calculated";
        this.nodeBorder = "calculated";
        this.clusterBkg = "calculated";
        this.clusterBorder = "calculated";
        this.defaultLinkColor = "calculated";
        this.titleColor = "calculated";
        this.edgeLabelBackground = "calculated";
        this.actorBorder = "calculated";
        this.actorBkg = "calculated";
        this.actorTextColor = "black";
        this.actorLineColor = "calculated";
        this.signalColor = "calculated";
        this.signalTextColor = "calculated";
        this.labelBoxBkgColor = "calculated";
        this.labelBoxBorderColor = "calculated";
        this.labelTextColor = "calculated";
        this.loopTextColor = "calculated";
        this.noteBorderColor = "calculated";
        this.noteBkgColor = "#fff5ad";
        this.noteTextColor = "calculated";
        this.activationBorderColor = "#666";
        this.activationBkgColor = "#f4f4f4";
        this.sequenceNumberColor = "white";
        this.sectionBkgColor = "calculated";
        this.altSectionBkgColor = "calculated";
        this.sectionBkgColor2 = "calculated";
        this.excludeBkgColor = "#eeeeee";
        this.taskBorderColor = "calculated";
        this.taskBkgColor = "calculated";
        this.taskTextLightColor = "calculated";
        this.taskTextColor = this.taskTextLightColor;
        this.taskTextDarkColor = "calculated";
        this.taskTextOutsideColor = this.taskTextDarkColor;
        this.taskTextClickableColor = "calculated";
        this.activeTaskBorderColor = "calculated";
        this.activeTaskBkgColor = "calculated";
        this.gridColor = "calculated";
        this.doneTaskBkgColor = "calculated";
        this.doneTaskBorderColor = "calculated";
        this.critBorderColor = "calculated";
        this.critBkgColor = "calculated";
        this.todayLineColor = "calculated";
        this.vertLineColor = "calculated";
        this.sectionBkgColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$rgba$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__rgba$3e$__["rgba"])(102, 102, 255, 0.49);
        this.altSectionBkgColor = "white";
        this.sectionBkgColor2 = "#fff400";
        this.taskBorderColor = "#534fbc";
        this.taskBkgColor = "#8a90dd";
        this.taskTextLightColor = "white";
        this.taskTextColor = "calculated";
        this.taskTextDarkColor = "black";
        this.taskTextOutsideColor = "calculated";
        this.taskTextClickableColor = "#003163";
        this.activeTaskBorderColor = "#534fbc";
        this.activeTaskBkgColor = "#bfc7ff";
        this.gridColor = "lightgrey";
        this.doneTaskBkgColor = "lightgrey";
        this.doneTaskBorderColor = "grey";
        this.critBorderColor = "#ff8888";
        this.critBkgColor = "red";
        this.todayLineColor = "red";
        this.vertLineColor = "navy";
        this.personBorder = this.primaryBorderColor;
        this.personBkg = this.mainBkg;
        this.archEdgeColor = "calculated";
        this.archEdgeArrowColor = "calculated";
        this.archEdgeWidth = "3";
        this.archGroupBorderColor = this.primaryBorderColor;
        this.archGroupBorderWidth = "2px";
        this.rowOdd = "calculated";
        this.rowEven = "calculated";
        this.labelColor = "black";
        this.errorBkgColor = "#552222";
        this.errorTextColor = "#552222";
        this.updateColors();
    }
    updateColors() {
        this.cScale0 = this.cScale0 || this.primaryColor;
        this.cScale1 = this.cScale1 || this.secondaryColor;
        this.cScale2 = this.cScale2 || this.tertiaryColor;
        this.cScale3 = this.cScale3 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 30
        });
        this.cScale4 = this.cScale4 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 60
        });
        this.cScale5 = this.cScale5 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 90
        });
        this.cScale6 = this.cScale6 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 120
        });
        this.cScale7 = this.cScale7 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 150
        });
        this.cScale8 = this.cScale8 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 210
        });
        this.cScale9 = this.cScale9 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 270
        });
        this.cScale10 = this.cScale10 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 300
        });
        this.cScale11 = this.cScale11 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 330
        });
        this["cScalePeer1"] = this["cScalePeer1"] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.secondaryColor, 45);
        this["cScalePeer2"] = this["cScalePeer2"] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.tertiaryColor, 40);
        for(let i = 0; i < this.THEME_COLOR_LIMIT; i++){
            this["cScale" + i] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this["cScale" + i], 10);
            this["cScalePeer" + i] = this["cScalePeer" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this["cScale" + i], 25);
        }
        for(let i = 0; i < this.THEME_COLOR_LIMIT; i++){
            this["cScaleInv" + i] = this["cScaleInv" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this["cScale" + i], {
                h: 180
            });
        }
        for(let i = 0; i < 5; i++){
            this["surface" + i] = this["surface" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.mainBkg, {
                h: 30,
                l: -(5 + i * 5)
            });
            this["surfacePeer" + i] = this["surfacePeer" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.mainBkg, {
                h: 30,
                l: -(7 + i * 5)
            });
        }
        this.scaleLabelColor = this.scaleLabelColor !== "calculated" && this.scaleLabelColor ? this.scaleLabelColor : this.labelTextColor;
        if (this.labelTextColor !== "calculated") {
            this.cScaleLabel0 = this.cScaleLabel0 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.labelTextColor);
            this.cScaleLabel3 = this.cScaleLabel3 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.labelTextColor);
            for(let i = 0; i < this.THEME_COLOR_LIMIT; i++){
                this["cScaleLabel" + i] = this["cScaleLabel" + i] || this.labelTextColor;
            }
        }
        this.nodeBkg = this.mainBkg;
        this.nodeBorder = this.border1;
        this.clusterBkg = this.secondBkg;
        this.clusterBorder = this.border2;
        this.defaultLinkColor = this.lineColor;
        this.titleColor = this.textColor;
        this.edgeLabelBackground = this.labelBackground;
        this.actorBorder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.border1, 23);
        this.actorBkg = this.mainBkg;
        this.labelBoxBkgColor = this.actorBkg;
        this.signalColor = this.textColor;
        this.signalTextColor = this.textColor;
        this.labelBoxBorderColor = this.actorBorder;
        this.labelTextColor = this.actorTextColor;
        this.loopTextColor = this.actorTextColor;
        this.noteBorderColor = this.border2;
        this.noteTextColor = this.actorTextColor;
        this.actorLineColor = this.actorBorder;
        this.taskTextColor = this.taskTextLightColor;
        this.taskTextOutsideColor = this.taskTextDarkColor;
        this.archEdgeColor = this.lineColor;
        this.archEdgeArrowColor = this.lineColor;
        this.rowOdd = this.rowOdd || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.primaryColor, 75) || "#ffffff";
        this.rowEven = this.rowEven || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.primaryColor, 1);
        this.transitionColor = this.transitionColor || this.lineColor;
        this.transitionLabelColor = this.transitionLabelColor || this.textColor;
        this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor;
        this.stateBkg = this.stateBkg || this.mainBkg;
        this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg;
        this.compositeBackground = this.compositeBackground || this.background || this.tertiaryColor;
        this.altBackground = this.altBackground || "#f0f0f0";
        this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg;
        this.compositeBorder = this.compositeBorder || this.nodeBorder;
        this.innerEndBackground = this.nodeBorder;
        this.specialStateColor = this.lineColor;
        this.errorBkgColor = this.errorBkgColor || this.tertiaryColor;
        this.errorTextColor = this.errorTextColor || this.tertiaryTextColor;
        this.transitionColor = this.transitionColor || this.lineColor;
        this.classText = this.primaryTextColor;
        this.fillType0 = this.primaryColor;
        this.fillType1 = this.secondaryColor;
        this.fillType2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 64
        });
        this.fillType3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            h: 64
        });
        this.fillType4 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -64
        });
        this.fillType5 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            h: -64
        });
        this.fillType6 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 128
        });
        this.fillType7 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            h: 128
        });
        this.pie1 = this.pie1 || this.primaryColor;
        this.pie2 = this.pie2 || this.secondaryColor;
        this.pie3 = this.pie3 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.tertiaryColor, {
            l: -40
        });
        this.pie4 = this.pie4 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            l: -10
        });
        this.pie5 = this.pie5 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            l: -30
        });
        this.pie6 = this.pie6 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.tertiaryColor, {
            l: -20
        });
        this.pie7 = this.pie7 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 60,
            l: -20
        });
        this.pie8 = this.pie8 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -60,
            l: -40
        });
        this.pie9 = this.pie9 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 120,
            l: -40
        });
        this.pie10 = this.pie10 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 60,
            l: -40
        });
        this.pie11 = this.pie11 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -90,
            l: -40
        });
        this.pie12 = this.pie12 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 120,
            l: -30
        });
        this.pieTitleTextSize = this.pieTitleTextSize || "25px";
        this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor;
        this.pieSectionTextSize = this.pieSectionTextSize || "17px";
        this.pieSectionTextColor = this.pieSectionTextColor || this.textColor;
        this.pieLegendTextSize = this.pieLegendTextSize || "17px";
        this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor;
        this.pieStrokeColor = this.pieStrokeColor || "black";
        this.pieStrokeWidth = this.pieStrokeWidth || "2px";
        this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || "2px";
        this.pieOuterStrokeColor = this.pieOuterStrokeColor || "black";
        this.pieOpacity = this.pieOpacity || "0.7";
        this.venn1 = this.venn1 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            l: -30
        });
        this.venn2 = this.venn2 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            l: -30
        });
        this.venn3 = this.venn3 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.tertiaryColor, {
            l: -40
        });
        this.venn4 = this.venn4 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 60,
            l: -30
        });
        this.venn5 = this.venn5 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -60,
            l: -30
        });
        this.venn6 = this.venn6 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            h: 60,
            l: -30
        });
        this.venn7 = this.venn7 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 120,
            l: -30
        });
        this.venn8 = this.venn8 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            h: 120,
            l: -30
        });
        this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor;
        this.vennSetTextColor = this.vennSetTextColor ?? this.textColor;
        this.quadrant1Fill = this.quadrant1Fill || this.primaryColor;
        this.quadrant2Fill = this.quadrant2Fill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            r: 5,
            g: 5,
            b: 5
        });
        this.quadrant3Fill = this.quadrant3Fill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            r: 10,
            g: 10,
            b: 10
        });
        this.quadrant4Fill = this.quadrant4Fill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            r: 15,
            g: 15,
            b: 15
        });
        this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor;
        this.quadrant2TextFill = this.quadrant2TextFill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryTextColor, {
            r: -5,
            g: -5,
            b: -5
        });
        this.quadrant3TextFill = this.quadrant3TextFill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryTextColor, {
            r: -10,
            g: -10,
            b: -10
        });
        this.quadrant4TextFill = this.quadrant4TextFill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryTextColor, {
            r: -15,
            g: -15,
            b: -15
        });
        this.quadrantPointFill = this.quadrantPointFill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$is_dark$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__isDark$3e$__["isDark"])(this.quadrant1Fill) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.quadrant1Fill) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.quadrant1Fill);
        this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor;
        this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor;
        this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor;
        this.quadrantInternalBorderStrokeFill = this.quadrantInternalBorderStrokeFill || this.primaryBorderColor;
        this.quadrantExternalBorderStrokeFill = this.quadrantExternalBorderStrokeFill || this.primaryBorderColor;
        this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor;
        this.radar = {
            axisColor: this.radar?.axisColor || this.lineColor,
            axisStrokeWidth: this.radar?.axisStrokeWidth || 2,
            axisLabelFontSize: this.radar?.axisLabelFontSize || 12,
            curveOpacity: this.radar?.curveOpacity || 0.5,
            curveStrokeWidth: this.radar?.curveStrokeWidth || 2,
            graticuleColor: this.radar?.graticuleColor || "#DEDEDE",
            graticuleStrokeWidth: this.radar?.graticuleStrokeWidth || 1,
            graticuleOpacity: this.radar?.graticuleOpacity || 0.3,
            legendBoxSize: this.radar?.legendBoxSize || 12,
            legendFontSize: this.radar?.legendFontSize || 12
        };
        this.xyChart = {
            backgroundColor: this.xyChart?.backgroundColor || this.background,
            titleColor: this.xyChart?.titleColor || this.primaryTextColor,
            xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
            xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
            xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
            xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
            yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
            yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
            yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
            yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
            plotColorPalette: this.xyChart?.plotColorPalette || "#ECECFF,#8493A6,#FFC3A0,#DCDDE1,#B8E994,#D1A36F,#C3CDE6,#FFB6C1,#496078,#F8F3E3"
        };
        this.requirementBackground = this.requirementBackground || this.primaryColor;
        this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor;
        this.requirementBorderSize = this.requirementBorderSize || "1";
        this.requirementTextColor = this.requirementTextColor || this.primaryTextColor;
        this.relationColor = this.relationColor || this.lineColor;
        this.relationLabelBackground = this.relationLabelBackground || this.labelBackground;
        this.relationLabelColor = this.relationLabelColor || this.actorTextColor;
        this.git0 = this.git0 || this.primaryColor;
        this.git1 = this.git1 || this.secondaryColor;
        this.git2 = this.git2 || this.tertiaryColor;
        this.git3 = this.git3 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -30
        });
        this.git4 = this.git4 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -60
        });
        this.git5 = this.git5 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -90
        });
        this.git6 = this.git6 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 60
        });
        this.git7 = this.git7 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 120
        });
        if (this.darkMode) {
            this.git0 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git0, 25);
            this.git1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git1, 25);
            this.git2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git2, 25);
            this.git3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git3, 25);
            this.git4 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git4, 25);
            this.git5 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git5, 25);
            this.git6 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git6, 25);
            this.git7 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git7, 25);
        } else {
            this.git0 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git0, 25);
            this.git1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git1, 25);
            this.git2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git2, 25);
            this.git3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git3, 25);
            this.git4 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git4, 25);
            this.git5 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git5, 25);
            this.git6 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git6, 25);
            this.git7 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git7, 25);
        }
        this.gitInv0 = this.gitInv0 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git0), 25);
        this.gitInv1 = this.gitInv1 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git1);
        this.gitInv2 = this.gitInv2 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git2);
        this.gitInv3 = this.gitInv3 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git3);
        this.gitInv4 = this.gitInv4 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git4);
        this.gitInv5 = this.gitInv5 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git5);
        this.gitInv6 = this.gitInv6 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git6);
        this.gitInv7 = this.gitInv7 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git7);
        this.gitBranchLabel0 = this.gitBranchLabel0 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.labelTextColor);
        this.gitBranchLabel1 = this.gitBranchLabel1 || this.labelTextColor;
        this.gitBranchLabel2 = this.gitBranchLabel2 || this.labelTextColor;
        this.gitBranchLabel3 = this.gitBranchLabel3 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.labelTextColor);
        this.gitBranchLabel4 = this.gitBranchLabel4 || this.labelTextColor;
        this.gitBranchLabel5 = this.gitBranchLabel5 || this.labelTextColor;
        this.gitBranchLabel6 = this.gitBranchLabel6 || this.labelTextColor;
        this.gitBranchLabel7 = this.gitBranchLabel7 || this.labelTextColor;
        this.tagLabelColor = this.tagLabelColor || this.primaryTextColor;
        this.tagLabelBackground = this.tagLabelBackground || this.primaryColor;
        this.tagLabelBorder = this.tagBorder || this.primaryBorderColor;
        this.tagLabelFontSize = this.tagLabelFontSize || "10px";
        this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor;
        this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor;
        this.commitLabelFontSize = this.commitLabelFontSize || "10px";
        this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || oldAttributeBackgroundColorOdd;
        this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || oldAttributeBackgroundColorEven;
    }
    calculate(overrides) {
        Object.keys(this).forEach((k)=>{
            if (this[k] === "calculated") {
                this[k] = void 0;
            }
        });
        if (typeof overrides !== "object") {
            this.updateColors();
            return;
        }
        const keys = Object.keys(overrides);
        keys.forEach((k)=>{
            this[k] = overrides[k];
        });
        this.updateColors();
        keys.forEach((k)=>{
            this[k] = overrides[k];
        });
    }
};
var getThemeVariables3 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((userOverrides)=>{
    const theme = new Theme3();
    theme.calculate(userOverrides);
    return theme;
}, "getThemeVariables");
;
var Theme4 = class {
    static{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(this, "Theme");
    }
    constructor(){
        this.background = "#f4f4f4";
        this.primaryColor = "#cde498";
        this.secondaryColor = "#cdffb2";
        this.background = "white";
        this.mainBkg = "#cde498";
        this.secondBkg = "#cdffb2";
        this.lineColor = "green";
        this.border1 = "#13540c";
        this.border2 = "#6eaa49";
        this.arrowheadColor = "green";
        this.fontFamily = '"trebuchet ms", verdana, arial, sans-serif';
        this.fontSize = "16px";
        this.tertiaryColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])("#cde498", 10);
        this.primaryBorderColor = mkBorder(this.primaryColor, this.darkMode);
        this.secondaryBorderColor = mkBorder(this.secondaryColor, this.darkMode);
        this.tertiaryBorderColor = mkBorder(this.tertiaryColor, this.darkMode);
        this.primaryTextColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.primaryColor);
        this.secondaryTextColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.secondaryColor);
        this.tertiaryTextColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.primaryColor);
        this.lineColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.background);
        this.textColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.background);
        this.THEME_COLOR_LIMIT = 12;
        this.nodeBkg = "calculated";
        this.nodeBorder = "calculated";
        this.clusterBkg = "calculated";
        this.clusterBorder = "calculated";
        this.defaultLinkColor = "calculated";
        this.titleColor = "#333";
        this.edgeLabelBackground = "#e8e8e8";
        this.actorBorder = "calculated";
        this.actorBkg = "calculated";
        this.actorTextColor = "black";
        this.actorLineColor = "calculated";
        this.signalColor = "#333";
        this.signalTextColor = "#333";
        this.labelBoxBkgColor = "calculated";
        this.labelBoxBorderColor = "#326932";
        this.labelTextColor = "calculated";
        this.loopTextColor = "calculated";
        this.noteBorderColor = "calculated";
        this.noteBkgColor = "#fff5ad";
        this.noteTextColor = "calculated";
        this.activationBorderColor = "#666";
        this.activationBkgColor = "#f4f4f4";
        this.sequenceNumberColor = "white";
        this.sectionBkgColor = "#6eaa49";
        this.altSectionBkgColor = "white";
        this.sectionBkgColor2 = "#6eaa49";
        this.excludeBkgColor = "#eeeeee";
        this.taskBorderColor = "calculated";
        this.taskBkgColor = "#487e3a";
        this.taskTextLightColor = "white";
        this.taskTextColor = "calculated";
        this.taskTextDarkColor = "black";
        this.taskTextOutsideColor = "calculated";
        this.taskTextClickableColor = "#003163";
        this.activeTaskBorderColor = "calculated";
        this.activeTaskBkgColor = "calculated";
        this.gridColor = "lightgrey";
        this.doneTaskBkgColor = "lightgrey";
        this.doneTaskBorderColor = "grey";
        this.critBorderColor = "#ff8888";
        this.critBkgColor = "red";
        this.todayLineColor = "red";
        this.vertLineColor = "#00BFFF";
        this.personBorder = this.primaryBorderColor;
        this.personBkg = this.mainBkg;
        this.archEdgeColor = "calculated";
        this.archEdgeArrowColor = "calculated";
        this.archEdgeWidth = "3";
        this.archGroupBorderColor = this.primaryBorderColor;
        this.archGroupBorderWidth = "2px";
        this.labelColor = "black";
        this.errorBkgColor = "#552222";
        this.errorTextColor = "#552222";
    }
    updateColors() {
        this.actorBorder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.mainBkg, 20);
        this.actorBkg = this.mainBkg;
        this.labelBoxBkgColor = this.actorBkg;
        this.labelTextColor = this.actorTextColor;
        this.loopTextColor = this.actorTextColor;
        this.noteBorderColor = this.border2;
        this.noteTextColor = this.actorTextColor;
        this.actorLineColor = this.actorBorder;
        this.cScale0 = this.cScale0 || this.primaryColor;
        this.cScale1 = this.cScale1 || this.secondaryColor;
        this.cScale2 = this.cScale2 || this.tertiaryColor;
        this.cScale3 = this.cScale3 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 30
        });
        this.cScale4 = this.cScale4 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 60
        });
        this.cScale5 = this.cScale5 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 90
        });
        this.cScale6 = this.cScale6 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 120
        });
        this.cScale7 = this.cScale7 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 150
        });
        this.cScale8 = this.cScale8 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 210
        });
        this.cScale9 = this.cScale9 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 270
        });
        this.cScale10 = this.cScale10 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 300
        });
        this.cScale11 = this.cScale11 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 330
        });
        this["cScalePeer1"] = this["cScalePeer1"] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.secondaryColor, 45);
        this["cScalePeer2"] = this["cScalePeer2"] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.tertiaryColor, 40);
        for(let i = 0; i < this.THEME_COLOR_LIMIT; i++){
            this["cScale" + i] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this["cScale" + i], 10);
            this["cScalePeer" + i] = this["cScalePeer" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this["cScale" + i], 25);
        }
        for(let i = 0; i < this.THEME_COLOR_LIMIT; i++){
            this["cScaleInv" + i] = this["cScaleInv" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this["cScale" + i], {
                h: 180
            });
        }
        this.scaleLabelColor = this.scaleLabelColor !== "calculated" && this.scaleLabelColor ? this.scaleLabelColor : this.labelTextColor;
        for(let i = 0; i < this.THEME_COLOR_LIMIT; i++){
            this["cScaleLabel" + i] = this["cScaleLabel" + i] || this.scaleLabelColor;
        }
        for(let i = 0; i < 5; i++){
            this["surface" + i] = this["surface" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.mainBkg, {
                h: 30,
                s: -30,
                l: -(5 + i * 5)
            });
            this["surfacePeer" + i] = this["surfacePeer" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.mainBkg, {
                h: 30,
                s: -30,
                l: -(8 + i * 5)
            });
        }
        this.nodeBkg = this.mainBkg;
        this.nodeBorder = this.border1;
        this.clusterBkg = this.secondBkg;
        this.clusterBorder = this.border2;
        this.defaultLinkColor = this.lineColor;
        this.taskBorderColor = this.border1;
        this.taskTextColor = this.taskTextLightColor;
        this.taskTextOutsideColor = this.taskTextDarkColor;
        this.activeTaskBorderColor = this.taskBorderColor;
        this.activeTaskBkgColor = this.mainBkg;
        this.archEdgeColor = this.lineColor;
        this.archEdgeArrowColor = this.lineColor;
        this.rowOdd = this.rowOdd || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.mainBkg, 75) || "#ffffff";
        this.rowEven = this.rowEven || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.mainBkg, 20);
        this.transitionColor = this.transitionColor || this.lineColor;
        this.transitionLabelColor = this.transitionLabelColor || this.textColor;
        this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor;
        this.stateBkg = this.stateBkg || this.mainBkg;
        this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg;
        this.compositeBackground = this.compositeBackground || this.background || this.tertiaryColor;
        this.altBackground = this.altBackground || "#f0f0f0";
        this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg;
        this.compositeBorder = this.compositeBorder || this.nodeBorder;
        this.innerEndBackground = this.primaryBorderColor;
        this.specialStateColor = this.lineColor;
        this.errorBkgColor = this.errorBkgColor || this.tertiaryColor;
        this.errorTextColor = this.errorTextColor || this.tertiaryTextColor;
        this.transitionColor = this.transitionColor || this.lineColor;
        this.classText = this.primaryTextColor;
        this.fillType0 = this.primaryColor;
        this.fillType1 = this.secondaryColor;
        this.fillType2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 64
        });
        this.fillType3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            h: 64
        });
        this.fillType4 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -64
        });
        this.fillType5 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            h: -64
        });
        this.fillType6 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 128
        });
        this.fillType7 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            h: 128
        });
        this.pie1 = this.pie1 || this.primaryColor;
        this.pie2 = this.pie2 || this.secondaryColor;
        this.pie3 = this.pie3 || this.tertiaryColor;
        this.pie4 = this.pie4 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            l: -30
        });
        this.pie5 = this.pie5 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            l: -30
        });
        this.pie6 = this.pie6 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.tertiaryColor, {
            h: 40,
            l: -40
        });
        this.pie7 = this.pie7 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 60,
            l: -10
        });
        this.pie8 = this.pie8 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -60,
            l: -10
        });
        this.pie9 = this.pie9 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 120,
            l: 0
        });
        this.pie10 = this.pie10 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 60,
            l: -50
        });
        this.pie11 = this.pie11 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -60,
            l: -50
        });
        this.pie12 = this.pie12 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 120,
            l: -50
        });
        this.pieTitleTextSize = this.pieTitleTextSize || "25px";
        this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor;
        this.pieSectionTextSize = this.pieSectionTextSize || "17px";
        this.pieSectionTextColor = this.pieSectionTextColor || this.textColor;
        this.pieLegendTextSize = this.pieLegendTextSize || "17px";
        this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor;
        this.pieStrokeColor = this.pieStrokeColor || "black";
        this.pieStrokeWidth = this.pieStrokeWidth || "2px";
        this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || "2px";
        this.pieOuterStrokeColor = this.pieOuterStrokeColor || "black";
        this.pieOpacity = this.pieOpacity || "0.7";
        this.venn1 = this.venn1 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            l: -30
        });
        this.venn2 = this.venn2 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            l: -30
        });
        this.venn3 = this.venn3 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.tertiaryColor, {
            l: -30
        });
        this.venn4 = this.venn4 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 60,
            l: -30
        });
        this.venn5 = this.venn5 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -60,
            l: -30
        });
        this.venn6 = this.venn6 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            h: 60,
            l: -30
        });
        this.venn7 = this.venn7 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 120,
            l: -30
        });
        this.venn8 = this.venn8 ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            h: 120,
            l: -30
        });
        this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor;
        this.vennSetTextColor = this.vennSetTextColor ?? this.textColor;
        this.quadrant1Fill = this.quadrant1Fill || this.primaryColor;
        this.quadrant2Fill = this.quadrant2Fill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            r: 5,
            g: 5,
            b: 5
        });
        this.quadrant3Fill = this.quadrant3Fill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            r: 10,
            g: 10,
            b: 10
        });
        this.quadrant4Fill = this.quadrant4Fill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            r: 15,
            g: 15,
            b: 15
        });
        this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor;
        this.quadrant2TextFill = this.quadrant2TextFill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryTextColor, {
            r: -5,
            g: -5,
            b: -5
        });
        this.quadrant3TextFill = this.quadrant3TextFill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryTextColor, {
            r: -10,
            g: -10,
            b: -10
        });
        this.quadrant4TextFill = this.quadrant4TextFill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryTextColor, {
            r: -15,
            g: -15,
            b: -15
        });
        this.quadrantPointFill = this.quadrantPointFill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$is_dark$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__isDark$3e$__["isDark"])(this.quadrant1Fill) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.quadrant1Fill) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.quadrant1Fill);
        this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor;
        this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor;
        this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor;
        this.quadrantInternalBorderStrokeFill = this.quadrantInternalBorderStrokeFill || this.primaryBorderColor;
        this.quadrantExternalBorderStrokeFill = this.quadrantExternalBorderStrokeFill || this.primaryBorderColor;
        this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor;
        this.packet = {
            startByteColor: this.primaryTextColor,
            endByteColor: this.primaryTextColor,
            labelColor: this.primaryTextColor,
            titleColor: this.primaryTextColor,
            blockStrokeColor: this.primaryTextColor,
            blockFillColor: this.mainBkg
        };
        this.radar = {
            axisColor: this.radar?.axisColor || this.lineColor,
            axisStrokeWidth: this.radar?.axisStrokeWidth || 2,
            axisLabelFontSize: this.radar?.axisLabelFontSize || 12,
            curveOpacity: this.radar?.curveOpacity || 0.5,
            curveStrokeWidth: this.radar?.curveStrokeWidth || 2,
            graticuleColor: this.radar?.graticuleColor || "#DEDEDE",
            graticuleStrokeWidth: this.radar?.graticuleStrokeWidth || 1,
            graticuleOpacity: this.radar?.graticuleOpacity || 0.3,
            legendBoxSize: this.radar?.legendBoxSize || 12,
            legendFontSize: this.radar?.legendFontSize || 12
        };
        this.xyChart = {
            backgroundColor: this.xyChart?.backgroundColor || this.background,
            titleColor: this.xyChart?.titleColor || this.primaryTextColor,
            xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
            xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
            xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
            xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
            yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
            yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
            yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
            yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
            plotColorPalette: this.xyChart?.plotColorPalette || "#CDE498,#FF6B6B,#A0D2DB,#D7BDE2,#F0F0F0,#FFC3A0,#7FD8BE,#FF9A8B,#FAF3E0,#FFF176"
        };
        this.requirementBackground = this.requirementBackground || this.primaryColor;
        this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor;
        this.requirementBorderSize = this.requirementBorderSize || "1";
        this.requirementTextColor = this.requirementTextColor || this.primaryTextColor;
        this.relationColor = this.relationColor || this.lineColor;
        this.relationLabelBackground = this.relationLabelBackground || this.edgeLabelBackground;
        this.relationLabelColor = this.relationLabelColor || this.actorTextColor;
        this.git0 = this.git0 || this.primaryColor;
        this.git1 = this.git1 || this.secondaryColor;
        this.git2 = this.git2 || this.tertiaryColor;
        this.git3 = this.git3 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -30
        });
        this.git4 = this.git4 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -60
        });
        this.git5 = this.git5 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -90
        });
        this.git6 = this.git6 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 60
        });
        this.git7 = this.git7 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 120
        });
        if (this.darkMode) {
            this.git0 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git0, 25);
            this.git1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git1, 25);
            this.git2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git2, 25);
            this.git3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git3, 25);
            this.git4 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git4, 25);
            this.git5 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git5, 25);
            this.git6 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git6, 25);
            this.git7 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.git7, 25);
        } else {
            this.git0 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git0, 25);
            this.git1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git1, 25);
            this.git2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git2, 25);
            this.git3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git3, 25);
            this.git4 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git4, 25);
            this.git5 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git5, 25);
            this.git6 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git6, 25);
            this.git7 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.git7, 25);
        }
        this.gitInv0 = this.gitInv0 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git0);
        this.gitInv1 = this.gitInv1 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git1);
        this.gitInv2 = this.gitInv2 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git2);
        this.gitInv3 = this.gitInv3 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git3);
        this.gitInv4 = this.gitInv4 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git4);
        this.gitInv5 = this.gitInv5 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git5);
        this.gitInv6 = this.gitInv6 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git6);
        this.gitInv7 = this.gitInv7 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git7);
        this.gitBranchLabel0 = this.gitBranchLabel0 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.labelTextColor);
        this.gitBranchLabel1 = this.gitBranchLabel1 || this.labelTextColor;
        this.gitBranchLabel2 = this.gitBranchLabel2 || this.labelTextColor;
        this.gitBranchLabel3 = this.gitBranchLabel3 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.labelTextColor);
        this.gitBranchLabel4 = this.gitBranchLabel4 || this.labelTextColor;
        this.gitBranchLabel5 = this.gitBranchLabel5 || this.labelTextColor;
        this.gitBranchLabel6 = this.gitBranchLabel6 || this.labelTextColor;
        this.gitBranchLabel7 = this.gitBranchLabel7 || this.labelTextColor;
        this.tagLabelColor = this.tagLabelColor || this.primaryTextColor;
        this.tagLabelBackground = this.tagLabelBackground || this.primaryColor;
        this.tagLabelBorder = this.tagBorder || this.primaryBorderColor;
        this.tagLabelFontSize = this.tagLabelFontSize || "10px";
        this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor;
        this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor;
        this.commitLabelFontSize = this.commitLabelFontSize || "10px";
        this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || oldAttributeBackgroundColorOdd;
        this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || oldAttributeBackgroundColorEven;
    }
    calculate(overrides) {
        if (typeof overrides !== "object") {
            this.updateColors();
            return;
        }
        const keys = Object.keys(overrides);
        keys.forEach((k)=>{
            this[k] = overrides[k];
        });
        this.updateColors();
        keys.forEach((k)=>{
            this[k] = overrides[k];
        });
    }
};
var getThemeVariables4 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((userOverrides)=>{
    const theme = new Theme4();
    theme.calculate(userOverrides);
    return theme;
}, "getThemeVariables");
;
var Theme5 = class {
    static{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(this, "Theme");
    }
    constructor(){
        this.primaryColor = "#eee";
        this.contrast = "#707070";
        this.secondaryColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.contrast, 55);
        this.background = "#ffffff";
        this.tertiaryColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -160
        });
        this.primaryBorderColor = mkBorder(this.primaryColor, this.darkMode);
        this.secondaryBorderColor = mkBorder(this.secondaryColor, this.darkMode);
        this.tertiaryBorderColor = mkBorder(this.tertiaryColor, this.darkMode);
        this.primaryTextColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.primaryColor);
        this.secondaryTextColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.secondaryColor);
        this.tertiaryTextColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.tertiaryColor);
        this.lineColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.background);
        this.textColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.background);
        this.mainBkg = "#eee";
        this.secondBkg = "calculated";
        this.lineColor = "#666";
        this.border1 = "#999";
        this.border2 = "calculated";
        this.note = "#ffa";
        this.text = "#333";
        this.critical = "#d42";
        this.done = "#bbb";
        this.arrowheadColor = "#333333";
        this.fontFamily = '"trebuchet ms", verdana, arial, sans-serif';
        this.fontSize = "16px";
        this.THEME_COLOR_LIMIT = 12;
        this.nodeBkg = "calculated";
        this.nodeBorder = "calculated";
        this.clusterBkg = "calculated";
        this.clusterBorder = "calculated";
        this.defaultLinkColor = "calculated";
        this.titleColor = "calculated";
        this.edgeLabelBackground = "white";
        this.actorBorder = "calculated";
        this.actorBkg = "calculated";
        this.actorTextColor = "calculated";
        this.actorLineColor = this.actorBorder;
        this.signalColor = "calculated";
        this.signalTextColor = "calculated";
        this.labelBoxBkgColor = "calculated";
        this.labelBoxBorderColor = "calculated";
        this.labelTextColor = "calculated";
        this.loopTextColor = "calculated";
        this.noteBorderColor = "calculated";
        this.noteBkgColor = "calculated";
        this.noteTextColor = "calculated";
        this.activationBorderColor = "#666";
        this.activationBkgColor = "#f4f4f4";
        this.sequenceNumberColor = "white";
        this.sectionBkgColor = "calculated";
        this.altSectionBkgColor = "white";
        this.sectionBkgColor2 = "calculated";
        this.excludeBkgColor = "#eeeeee";
        this.taskBorderColor = "calculated";
        this.taskBkgColor = "calculated";
        this.taskTextLightColor = "white";
        this.taskTextColor = "calculated";
        this.taskTextDarkColor = "calculated";
        this.taskTextOutsideColor = "calculated";
        this.taskTextClickableColor = "#003163";
        this.activeTaskBorderColor = "calculated";
        this.activeTaskBkgColor = "calculated";
        this.gridColor = "calculated";
        this.doneTaskBkgColor = "calculated";
        this.doneTaskBorderColor = "calculated";
        this.critBkgColor = "calculated";
        this.critBorderColor = "calculated";
        this.todayLineColor = "calculated";
        this.vertLineColor = "calculated";
        this.personBorder = this.primaryBorderColor;
        this.personBkg = this.mainBkg;
        this.archEdgeColor = "calculated";
        this.archEdgeArrowColor = "calculated";
        this.archEdgeWidth = "3";
        this.archGroupBorderColor = this.primaryBorderColor;
        this.archGroupBorderWidth = "2px";
        this.rowOdd = this.rowOdd || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.mainBkg, 75) || "#ffffff";
        this.rowEven = this.rowEven || "#f4f4f4";
        this.labelColor = "black";
        this.errorBkgColor = "#552222";
        this.errorTextColor = "#552222";
    }
    updateColors() {
        this.secondBkg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.contrast, 55);
        this.border2 = this.contrast;
        this.actorBorder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.border1, 23);
        this.actorBkg = this.mainBkg;
        this.actorTextColor = this.text;
        this.actorLineColor = this.actorBorder;
        this.signalColor = this.text;
        this.signalTextColor = this.text;
        this.labelBoxBkgColor = this.actorBkg;
        this.labelBoxBorderColor = this.actorBorder;
        this.labelTextColor = this.text;
        this.loopTextColor = this.text;
        this.noteBorderColor = "#999";
        this.noteBkgColor = "#666";
        this.noteTextColor = "#fff";
        this.cScale0 = this.cScale0 || "#555";
        this.cScale1 = this.cScale1 || "#F4F4F4";
        this.cScale2 = this.cScale2 || "#555";
        this.cScale3 = this.cScale3 || "#BBB";
        this.cScale4 = this.cScale4 || "#777";
        this.cScale5 = this.cScale5 || "#999";
        this.cScale6 = this.cScale6 || "#DDD";
        this.cScale7 = this.cScale7 || "#FFF";
        this.cScale8 = this.cScale8 || "#DDD";
        this.cScale9 = this.cScale9 || "#BBB";
        this.cScale10 = this.cScale10 || "#999";
        this.cScale11 = this.cScale11 || "#777";
        for(let i = 0; i < this.THEME_COLOR_LIMIT; i++){
            this["cScaleInv" + i] = this["cScaleInv" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this["cScale" + i]);
        }
        for(let i = 0; i < this.THEME_COLOR_LIMIT; i++){
            if (this.darkMode) {
                this["cScalePeer" + i] = this["cScalePeer" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this["cScale" + i], 10);
            } else {
                this["cScalePeer" + i] = this["cScalePeer" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this["cScale" + i], 10);
            }
        }
        this.scaleLabelColor = this.scaleLabelColor || (this.darkMode ? "black" : this.labelTextColor);
        this.cScaleLabel0 = this.cScaleLabel0 || this.cScale1;
        this.cScaleLabel2 = this.cScaleLabel2 || this.cScale1;
        for(let i = 0; i < this.THEME_COLOR_LIMIT; i++){
            this["cScaleLabel" + i] = this["cScaleLabel" + i] || this.scaleLabelColor;
        }
        for(let i = 0; i < 5; i++){
            this["surface" + i] = this["surface" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.mainBkg, {
                l: -(5 + i * 5)
            });
            this["surfacePeer" + i] = this["surfacePeer" + i] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.mainBkg, {
                l: -(8 + i * 5)
            });
        }
        this.nodeBkg = this.mainBkg;
        this.nodeBorder = this.border1;
        this.clusterBkg = this.secondBkg;
        this.clusterBorder = this.border2;
        this.defaultLinkColor = this.lineColor;
        this.titleColor = this.text;
        this.sectionBkgColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.contrast, 30);
        this.sectionBkgColor2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.contrast, 30);
        this.taskBorderColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.contrast, 10);
        this.taskBkgColor = this.contrast;
        this.taskTextColor = this.taskTextLightColor;
        this.taskTextDarkColor = this.text;
        this.taskTextOutsideColor = this.taskTextDarkColor;
        this.activeTaskBorderColor = this.taskBorderColor;
        this.activeTaskBkgColor = this.mainBkg;
        this.gridColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.border1, 30);
        this.doneTaskBkgColor = this.done;
        this.doneTaskBorderColor = this.lineColor;
        this.critBkgColor = this.critical;
        this.critBorderColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.critBkgColor, 10);
        this.todayLineColor = this.critBkgColor;
        this.vertLineColor = this.critBkgColor;
        this.archEdgeColor = this.lineColor;
        this.archEdgeArrowColor = this.lineColor;
        this.transitionColor = this.transitionColor || "#000";
        this.transitionLabelColor = this.transitionLabelColor || this.textColor;
        this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor;
        this.stateBkg = this.stateBkg || this.mainBkg;
        this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg;
        this.compositeBackground = this.compositeBackground || this.background || this.tertiaryColor;
        this.altBackground = this.altBackground || "#f4f4f4";
        this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg;
        this.stateBorder = this.stateBorder || "#000";
        this.innerEndBackground = this.primaryBorderColor;
        this.specialStateColor = "#222";
        this.errorBkgColor = this.errorBkgColor || this.tertiaryColor;
        this.errorTextColor = this.errorTextColor || this.tertiaryTextColor;
        this.classText = this.primaryTextColor;
        this.fillType0 = this.primaryColor;
        this.fillType1 = this.secondaryColor;
        this.fillType2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 64
        });
        this.fillType3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            h: 64
        });
        this.fillType4 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -64
        });
        this.fillType5 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            h: -64
        });
        this.fillType6 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 128
        });
        this.fillType7 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.secondaryColor, {
            h: 128
        });
        for(let i = 0; i < this.THEME_COLOR_LIMIT; i++){
            this["pie" + i] = this["cScale" + i];
        }
        this.pie12 = this.pie0;
        this.pieTitleTextSize = this.pieTitleTextSize || "25px";
        this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor;
        this.pieSectionTextSize = this.pieSectionTextSize || "17px";
        this.pieSectionTextColor = this.pieSectionTextColor || this.textColor;
        this.pieLegendTextSize = this.pieLegendTextSize || "17px";
        this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor;
        this.pieStrokeColor = this.pieStrokeColor || "black";
        this.pieStrokeWidth = this.pieStrokeWidth || "2px";
        this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || "2px";
        this.pieOuterStrokeColor = this.pieOuterStrokeColor || "black";
        this.pieOpacity = this.pieOpacity || "0.7";
        for(let i = 0; i < 8; i++){
            this["venn" + (i + 1)] = this["venn" + (i + 1)] ?? this["cScale" + i];
        }
        this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor;
        this.vennSetTextColor = this.vennSetTextColor ?? this.textColor;
        this.quadrant1Fill = this.quadrant1Fill || this.primaryColor;
        this.quadrant2Fill = this.quadrant2Fill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            r: 5,
            g: 5,
            b: 5
        });
        this.quadrant3Fill = this.quadrant3Fill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            r: 10,
            g: 10,
            b: 10
        });
        this.quadrant4Fill = this.quadrant4Fill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            r: 15,
            g: 15,
            b: 15
        });
        this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor;
        this.quadrant2TextFill = this.quadrant2TextFill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryTextColor, {
            r: -5,
            g: -5,
            b: -5
        });
        this.quadrant3TextFill = this.quadrant3TextFill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryTextColor, {
            r: -10,
            g: -10,
            b: -10
        });
        this.quadrant4TextFill = this.quadrant4TextFill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryTextColor, {
            r: -15,
            g: -15,
            b: -15
        });
        this.quadrantPointFill = this.quadrantPointFill || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$is_dark$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__isDark$3e$__["isDark"])(this.quadrant1Fill) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$lighten$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__lighten$3e$__["lighten"])(this.quadrant1Fill) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.quadrant1Fill);
        this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor;
        this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor;
        this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor;
        this.quadrantInternalBorderStrokeFill = this.quadrantInternalBorderStrokeFill || this.primaryBorderColor;
        this.quadrantExternalBorderStrokeFill = this.quadrantExternalBorderStrokeFill || this.primaryBorderColor;
        this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor;
        this.xyChart = {
            backgroundColor: this.xyChart?.backgroundColor || this.background,
            titleColor: this.xyChart?.titleColor || this.primaryTextColor,
            xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
            xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
            xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
            xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
            yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
            yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
            yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
            yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
            plotColorPalette: this.xyChart?.plotColorPalette || "#EEE,#6BB8E4,#8ACB88,#C7ACD6,#E8DCC2,#FFB2A8,#FFF380,#7E8D91,#FFD8B1,#FAF3E0"
        };
        this.radar = {
            axisColor: this.radar?.axisColor || this.lineColor,
            axisStrokeWidth: this.radar?.axisStrokeWidth || 2,
            axisLabelFontSize: this.radar?.axisLabelFontSize || 12,
            curveOpacity: this.radar?.curveOpacity || 0.5,
            curveStrokeWidth: this.radar?.curveStrokeWidth || 2,
            graticuleColor: this.radar?.graticuleColor || "#DEDEDE",
            graticuleStrokeWidth: this.radar?.graticuleStrokeWidth || 1,
            graticuleOpacity: this.radar?.graticuleOpacity || 0.3,
            legendBoxSize: this.radar?.legendBoxSize || 12,
            legendFontSize: this.radar?.legendFontSize || 12
        };
        this.requirementBackground = this.requirementBackground || this.primaryColor;
        this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor;
        this.requirementBorderSize = this.requirementBorderSize || "1";
        this.requirementTextColor = this.requirementTextColor || this.primaryTextColor;
        this.relationColor = this.relationColor || this.lineColor;
        this.relationLabelBackground = this.relationLabelBackground || this.edgeLabelBackground;
        this.relationLabelColor = this.relationLabelColor || this.actorTextColor;
        this.git0 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$darken$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__darken$3e$__["darken"])(this.pie1, 25) || this.primaryColor;
        this.git1 = this.pie2 || this.secondaryColor;
        this.git2 = this.pie3 || this.tertiaryColor;
        this.git3 = this.pie4 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -30
        });
        this.git4 = this.pie5 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -60
        });
        this.git5 = this.pie6 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: -90
        });
        this.git6 = this.pie7 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 60
        });
        this.git7 = this.pie8 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$adjust$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__adjust$3e$__["adjust"])(this.primaryColor, {
            h: 120
        });
        this.gitInv0 = this.gitInv0 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git0);
        this.gitInv1 = this.gitInv1 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git1);
        this.gitInv2 = this.gitInv2 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git2);
        this.gitInv3 = this.gitInv3 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git3);
        this.gitInv4 = this.gitInv4 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git4);
        this.gitInv5 = this.gitInv5 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git5);
        this.gitInv6 = this.gitInv6 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git6);
        this.gitInv7 = this.gitInv7 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$khroma$40$2$2e$1$2e$0$2f$node_modules$2f$khroma$2f$dist$2f$methods$2f$invert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__invert$3e$__["invert"])(this.git7);
        this.branchLabelColor = this.branchLabelColor || this.labelTextColor;
        this.gitBranchLabel0 = this.branchLabelColor;
        this.gitBranchLabel1 = "white";
        this.gitBranchLabel2 = this.branchLabelColor;
        this.gitBranchLabel3 = "white";
        this.gitBranchLabel4 = this.branchLabelColor;
        this.gitBranchLabel5 = this.branchLabelColor;
        this.gitBranchLabel6 = this.branchLabelColor;
        this.gitBranchLabel7 = this.branchLabelColor;
        this.tagLabelColor = this.tagLabelColor || this.primaryTextColor;
        this.tagLabelBackground = this.tagLabelBackground || this.primaryColor;
        this.tagLabelBorder = this.tagBorder || this.primaryBorderColor;
        this.tagLabelFontSize = this.tagLabelFontSize || "10px";
        this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor;
        this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor;
        this.commitLabelFontSize = this.commitLabelFontSize || "10px";
        this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || oldAttributeBackgroundColorOdd;
        this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || oldAttributeBackgroundColorEven;
    }
    calculate(overrides) {
        if (typeof overrides !== "object") {
            this.updateColors();
            return;
        }
        const keys = Object.keys(overrides);
        keys.forEach((k)=>{
            this[k] = overrides[k];
        });
        this.updateColors();
        keys.forEach((k)=>{
            this[k] = overrides[k];
        });
    }
};
var getThemeVariables5 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((userOverrides)=>{
    const theme = new Theme5();
    theme.calculate(userOverrides);
    return theme;
}, "getThemeVariables");
// src/themes/index.js
var themes_default = {
    base: {
        getThemeVariables
    },
    dark: {
        getThemeVariables: getThemeVariables2
    },
    default: {
        getThemeVariables: getThemeVariables3
    },
    forest: {
        getThemeVariables: getThemeVariables4
    },
    neutral: {
        getThemeVariables: getThemeVariables5
    }
};
// src/schemas/config.schema.yaml?only-defaults=true
var config_schema_default = {
    "flowchart": {
        "useMaxWidth": true,
        "titleTopMargin": 25,
        "subGraphTitleMargin": {
            "top": 0,
            "bottom": 0
        },
        "diagramPadding": 8,
        "htmlLabels": null,
        "nodeSpacing": 50,
        "rankSpacing": 50,
        "curve": "basis",
        "padding": 15,
        "defaultRenderer": "dagre-wrapper",
        "wrappingWidth": 200,
        "inheritDir": false
    },
    "sequence": {
        "useMaxWidth": true,
        "hideUnusedParticipants": false,
        "activationWidth": 10,
        "diagramMarginX": 50,
        "diagramMarginY": 10,
        "actorMargin": 50,
        "width": 150,
        "height": 65,
        "boxMargin": 10,
        "boxTextMargin": 5,
        "noteMargin": 10,
        "messageMargin": 35,
        "messageAlign": "center",
        "mirrorActors": true,
        "forceMenus": false,
        "bottomMarginAdj": 1,
        "rightAngles": false,
        "showSequenceNumbers": false,
        "actorFontSize": 14,
        "actorFontFamily": '"Open Sans", sans-serif',
        "actorFontWeight": 400,
        "noteFontSize": 14,
        "noteFontFamily": '"trebuchet ms", verdana, arial, sans-serif',
        "noteFontWeight": 400,
        "noteAlign": "center",
        "messageFontSize": 16,
        "messageFontFamily": '"trebuchet ms", verdana, arial, sans-serif',
        "messageFontWeight": 400,
        "wrap": false,
        "wrapPadding": 10,
        "labelBoxWidth": 50,
        "labelBoxHeight": 20
    },
    "gantt": {
        "useMaxWidth": true,
        "titleTopMargin": 25,
        "barHeight": 20,
        "barGap": 4,
        "topPadding": 50,
        "rightPadding": 75,
        "leftPadding": 75,
        "gridLineStartPadding": 35,
        "fontSize": 11,
        "sectionFontSize": 11,
        "numberSectionStyles": 4,
        "axisFormat": "%Y-%m-%d",
        "topAxis": false,
        "displayMode": "",
        "weekday": "sunday"
    },
    "journey": {
        "useMaxWidth": true,
        "diagramMarginX": 50,
        "diagramMarginY": 10,
        "leftMargin": 150,
        "maxLabelWidth": 360,
        "width": 150,
        "height": 50,
        "boxMargin": 10,
        "boxTextMargin": 5,
        "noteMargin": 10,
        "messageMargin": 35,
        "messageAlign": "center",
        "bottomMarginAdj": 1,
        "rightAngles": false,
        "taskFontSize": 14,
        "taskFontFamily": '"Open Sans", sans-serif',
        "taskMargin": 50,
        "activationWidth": 10,
        "textPlacement": "fo",
        "actorColours": [
            "#8FBC8F",
            "#7CFC00",
            "#00FFFF",
            "#20B2AA",
            "#B0E0E6",
            "#FFFFE0"
        ],
        "sectionFills": [
            "#191970",
            "#8B008B",
            "#4B0082",
            "#2F4F4F",
            "#800000",
            "#8B4513",
            "#00008B"
        ],
        "sectionColours": [
            "#fff"
        ],
        "titleColor": "",
        "titleFontFamily": '"trebuchet ms", verdana, arial, sans-serif',
        "titleFontSize": "4ex"
    },
    "class": {
        "useMaxWidth": true,
        "titleTopMargin": 25,
        "arrowMarkerAbsolute": false,
        "dividerMargin": 10,
        "padding": 5,
        "textHeight": 10,
        "defaultRenderer": "dagre-wrapper",
        "htmlLabels": false,
        "hideEmptyMembersBox": false
    },
    "state": {
        "useMaxWidth": true,
        "titleTopMargin": 25,
        "dividerMargin": 10,
        "sizeUnit": 5,
        "padding": 8,
        "textHeight": 10,
        "titleShift": -15,
        "noteMargin": 10,
        "forkWidth": 70,
        "forkHeight": 7,
        "miniPadding": 2,
        "fontSizeFactor": 5.02,
        "fontSize": 24,
        "labelHeight": 16,
        "edgeLengthFactor": "20",
        "compositTitleSize": 35,
        "radius": 5,
        "defaultRenderer": "dagre-wrapper"
    },
    "er": {
        "useMaxWidth": true,
        "titleTopMargin": 25,
        "diagramPadding": 20,
        "layoutDirection": "TB",
        "minEntityWidth": 100,
        "minEntityHeight": 75,
        "entityPadding": 15,
        "nodeSpacing": 140,
        "rankSpacing": 80,
        "stroke": "gray",
        "fill": "honeydew",
        "fontSize": 12
    },
    "pie": {
        "useMaxWidth": true,
        "textPosition": 0.75
    },
    "quadrantChart": {
        "useMaxWidth": true,
        "chartWidth": 500,
        "chartHeight": 500,
        "titleFontSize": 20,
        "titlePadding": 10,
        "quadrantPadding": 5,
        "xAxisLabelPadding": 5,
        "yAxisLabelPadding": 5,
        "xAxisLabelFontSize": 16,
        "yAxisLabelFontSize": 16,
        "quadrantLabelFontSize": 16,
        "quadrantTextTopPadding": 5,
        "pointTextPadding": 5,
        "pointLabelFontSize": 12,
        "pointRadius": 5,
        "xAxisPosition": "top",
        "yAxisPosition": "left",
        "quadrantInternalBorderStrokeWidth": 1,
        "quadrantExternalBorderStrokeWidth": 2
    },
    "xyChart": {
        "useMaxWidth": true,
        "width": 700,
        "height": 500,
        "titleFontSize": 20,
        "titlePadding": 10,
        "showDataLabel": false,
        "showTitle": true,
        "xAxis": {
            "$ref": "#/$defs/XYChartAxisConfig",
            "showLabel": true,
            "labelFontSize": 14,
            "labelPadding": 5,
            "showTitle": true,
            "titleFontSize": 16,
            "titlePadding": 5,
            "showTick": true,
            "tickLength": 5,
            "tickWidth": 2,
            "showAxisLine": true,
            "axisLineWidth": 2
        },
        "yAxis": {
            "$ref": "#/$defs/XYChartAxisConfig",
            "showLabel": true,
            "labelFontSize": 14,
            "labelPadding": 5,
            "showTitle": true,
            "titleFontSize": 16,
            "titlePadding": 5,
            "showTick": true,
            "tickLength": 5,
            "tickWidth": 2,
            "showAxisLine": true,
            "axisLineWidth": 2
        },
        "chartOrientation": "vertical",
        "plotReservedSpacePercent": 50
    },
    "requirement": {
        "useMaxWidth": true,
        "rect_fill": "#f9f9f9",
        "text_color": "#333",
        "rect_border_size": "0.5px",
        "rect_border_color": "#bbb",
        "rect_min_width": 200,
        "rect_min_height": 200,
        "fontSize": 14,
        "rect_padding": 10,
        "line_height": 20
    },
    "mindmap": {
        "useMaxWidth": true,
        "padding": 10,
        "maxNodeWidth": 200,
        "layoutAlgorithm": "cose-bilkent"
    },
    "ishikawa": {
        "useMaxWidth": true,
        "diagramPadding": 20
    },
    "kanban": {
        "useMaxWidth": true,
        "padding": 8,
        "sectionWidth": 200,
        "ticketBaseUrl": ""
    },
    "timeline": {
        "useMaxWidth": true,
        "diagramMarginX": 50,
        "diagramMarginY": 10,
        "leftMargin": 150,
        "width": 150,
        "height": 50,
        "boxMargin": 10,
        "boxTextMargin": 5,
        "noteMargin": 10,
        "messageMargin": 35,
        "messageAlign": "center",
        "bottomMarginAdj": 1,
        "rightAngles": false,
        "taskFontSize": 14,
        "taskFontFamily": '"Open Sans", sans-serif',
        "taskMargin": 50,
        "activationWidth": 10,
        "textPlacement": "fo",
        "actorColours": [
            "#8FBC8F",
            "#7CFC00",
            "#00FFFF",
            "#20B2AA",
            "#B0E0E6",
            "#FFFFE0"
        ],
        "sectionFills": [
            "#191970",
            "#8B008B",
            "#4B0082",
            "#2F4F4F",
            "#800000",
            "#8B4513",
            "#00008B"
        ],
        "sectionColours": [
            "#fff"
        ],
        "disableMulticolor": false
    },
    "gitGraph": {
        "useMaxWidth": true,
        "titleTopMargin": 25,
        "diagramPadding": 8,
        "nodeLabel": {
            "width": 75,
            "height": 100,
            "x": -25,
            "y": 0
        },
        "mainBranchName": "main",
        "mainBranchOrder": 0,
        "showCommitLabel": true,
        "showBranches": true,
        "rotateCommitLabel": true,
        "parallelCommits": false,
        "arrowMarkerAbsolute": false
    },
    "c4": {
        "useMaxWidth": true,
        "diagramMarginX": 50,
        "diagramMarginY": 10,
        "c4ShapeMargin": 50,
        "c4ShapePadding": 20,
        "width": 216,
        "height": 60,
        "boxMargin": 10,
        "c4ShapeInRow": 4,
        "nextLinePaddingX": 0,
        "c4BoundaryInRow": 2,
        "personFontSize": 14,
        "personFontFamily": '"Open Sans", sans-serif',
        "personFontWeight": "normal",
        "external_personFontSize": 14,
        "external_personFontFamily": '"Open Sans", sans-serif',
        "external_personFontWeight": "normal",
        "systemFontSize": 14,
        "systemFontFamily": '"Open Sans", sans-serif',
        "systemFontWeight": "normal",
        "external_systemFontSize": 14,
        "external_systemFontFamily": '"Open Sans", sans-serif',
        "external_systemFontWeight": "normal",
        "system_dbFontSize": 14,
        "system_dbFontFamily": '"Open Sans", sans-serif',
        "system_dbFontWeight": "normal",
        "external_system_dbFontSize": 14,
        "external_system_dbFontFamily": '"Open Sans", sans-serif',
        "external_system_dbFontWeight": "normal",
        "system_queueFontSize": 14,
        "system_queueFontFamily": '"Open Sans", sans-serif',
        "system_queueFontWeight": "normal",
        "external_system_queueFontSize": 14,
        "external_system_queueFontFamily": '"Open Sans", sans-serif',
        "external_system_queueFontWeight": "normal",
        "boundaryFontSize": 14,
        "boundaryFontFamily": '"Open Sans", sans-serif',
        "boundaryFontWeight": "normal",
        "messageFontSize": 12,
        "messageFontFamily": '"Open Sans", sans-serif',
        "messageFontWeight": "normal",
        "containerFontSize": 14,
        "containerFontFamily": '"Open Sans", sans-serif',
        "containerFontWeight": "normal",
        "external_containerFontSize": 14,
        "external_containerFontFamily": '"Open Sans", sans-serif',
        "external_containerFontWeight": "normal",
        "container_dbFontSize": 14,
        "container_dbFontFamily": '"Open Sans", sans-serif',
        "container_dbFontWeight": "normal",
        "external_container_dbFontSize": 14,
        "external_container_dbFontFamily": '"Open Sans", sans-serif',
        "external_container_dbFontWeight": "normal",
        "container_queueFontSize": 14,
        "container_queueFontFamily": '"Open Sans", sans-serif',
        "container_queueFontWeight": "normal",
        "external_container_queueFontSize": 14,
        "external_container_queueFontFamily": '"Open Sans", sans-serif',
        "external_container_queueFontWeight": "normal",
        "componentFontSize": 14,
        "componentFontFamily": '"Open Sans", sans-serif',
        "componentFontWeight": "normal",
        "external_componentFontSize": 14,
        "external_componentFontFamily": '"Open Sans", sans-serif',
        "external_componentFontWeight": "normal",
        "component_dbFontSize": 14,
        "component_dbFontFamily": '"Open Sans", sans-serif',
        "component_dbFontWeight": "normal",
        "external_component_dbFontSize": 14,
        "external_component_dbFontFamily": '"Open Sans", sans-serif',
        "external_component_dbFontWeight": "normal",
        "component_queueFontSize": 14,
        "component_queueFontFamily": '"Open Sans", sans-serif',
        "component_queueFontWeight": "normal",
        "external_component_queueFontSize": 14,
        "external_component_queueFontFamily": '"Open Sans", sans-serif',
        "external_component_queueFontWeight": "normal",
        "wrap": true,
        "wrapPadding": 10,
        "person_bg_color": "#08427B",
        "person_border_color": "#073B6F",
        "external_person_bg_color": "#686868",
        "external_person_border_color": "#8A8A8A",
        "system_bg_color": "#1168BD",
        "system_border_color": "#3C7FC0",
        "system_db_bg_color": "#1168BD",
        "system_db_border_color": "#3C7FC0",
        "system_queue_bg_color": "#1168BD",
        "system_queue_border_color": "#3C7FC0",
        "external_system_bg_color": "#999999",
        "external_system_border_color": "#8A8A8A",
        "external_system_db_bg_color": "#999999",
        "external_system_db_border_color": "#8A8A8A",
        "external_system_queue_bg_color": "#999999",
        "external_system_queue_border_color": "#8A8A8A",
        "container_bg_color": "#438DD5",
        "container_border_color": "#3C7FC0",
        "container_db_bg_color": "#438DD5",
        "container_db_border_color": "#3C7FC0",
        "container_queue_bg_color": "#438DD5",
        "container_queue_border_color": "#3C7FC0",
        "external_container_bg_color": "#B3B3B3",
        "external_container_border_color": "#A6A6A6",
        "external_container_db_bg_color": "#B3B3B3",
        "external_container_db_border_color": "#A6A6A6",
        "external_container_queue_bg_color": "#B3B3B3",
        "external_container_queue_border_color": "#A6A6A6",
        "component_bg_color": "#85BBF0",
        "component_border_color": "#78A8D8",
        "component_db_bg_color": "#85BBF0",
        "component_db_border_color": "#78A8D8",
        "component_queue_bg_color": "#85BBF0",
        "component_queue_border_color": "#78A8D8",
        "external_component_bg_color": "#CCCCCC",
        "external_component_border_color": "#BFBFBF",
        "external_component_db_bg_color": "#CCCCCC",
        "external_component_db_border_color": "#BFBFBF",
        "external_component_queue_bg_color": "#CCCCCC",
        "external_component_queue_border_color": "#BFBFBF"
    },
    "sankey": {
        "useMaxWidth": true,
        "width": 600,
        "height": 400,
        "linkColor": "gradient",
        "nodeAlignment": "justify",
        "showValues": true,
        "prefix": "",
        "suffix": ""
    },
    "block": {
        "useMaxWidth": true,
        "padding": 8
    },
    "packet": {
        "useMaxWidth": true,
        "rowHeight": 32,
        "bitWidth": 32,
        "bitsPerRow": 32,
        "showBits": true,
        "paddingX": 5,
        "paddingY": 5
    },
    "architecture": {
        "useMaxWidth": true,
        "padding": 40,
        "iconSize": 80,
        "fontSize": 16
    },
    "radar": {
        "useMaxWidth": true,
        "width": 600,
        "height": 600,
        "marginTop": 50,
        "marginRight": 50,
        "marginBottom": 50,
        "marginLeft": 50,
        "axisScaleFactor": 1,
        "axisLabelFactor": 1.05,
        "curveTension": 0.17
    },
    "venn": {
        "useMaxWidth": true,
        "width": 800,
        "height": 450,
        "padding": 8,
        "useDebugLayout": false
    },
    "theme": "default",
    "look": "classic",
    "handDrawnSeed": 0,
    "layout": "dagre",
    "maxTextSize": 5e4,
    "maxEdges": 500,
    "darkMode": false,
    "fontFamily": '"trebuchet ms", verdana, arial, sans-serif;',
    "logLevel": 5,
    "securityLevel": "strict",
    "startOnLoad": true,
    "arrowMarkerAbsolute": false,
    "secure": [
        "secure",
        "securityLevel",
        "startOnLoad",
        "maxTextSize",
        "suppressErrorRendering",
        "maxEdges"
    ],
    "legacyMathML": false,
    "forceLegacyMathML": false,
    "deterministicIds": false,
    "fontSize": 16,
    "markdownAutoWrap": true,
    "suppressErrorRendering": false
};
// src/defaultConfig.ts
var config = {
    ...config_schema_default,
    // Set, even though they're `undefined` so that `configKeys` finds these keys
    // TODO: Should we replace these with `null` so that they can go in the JSON Schema?
    deterministicIDSeed: void 0,
    elk: {
        // mergeEdges is needed here to be considered
        mergeEdges: false,
        nodePlacementStrategy: "BRANDES_KOEPF",
        forceNodeModelOrder: false,
        considerModelOrder: "NODES_AND_EDGES"
    },
    themeCSS: void 0,
    // add non-JSON default config values
    themeVariables: themes_default.default.getThemeVariables(),
    sequence: {
        ...config_schema_default.sequence,
        messageFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.messageFontFamily,
                fontSize: this.messageFontSize,
                fontWeight: this.messageFontWeight
            };
        }, "messageFont"),
        noteFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.noteFontFamily,
                fontSize: this.noteFontSize,
                fontWeight: this.noteFontWeight
            };
        }, "noteFont"),
        actorFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.actorFontFamily,
                fontSize: this.actorFontSize,
                fontWeight: this.actorFontWeight
            };
        }, "actorFont")
    },
    class: {
        hideEmptyMembersBox: false
    },
    gantt: {
        ...config_schema_default.gantt,
        tickInterval: void 0,
        useWidth: void 0
    },
    c4: {
        ...config_schema_default.c4,
        useWidth: void 0,
        personFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.personFontFamily,
                fontSize: this.personFontSize,
                fontWeight: this.personFontWeight
            };
        }, "personFont"),
        flowchart: {
            ...config_schema_default.flowchart,
            inheritDir: false
        },
        external_personFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.external_personFontFamily,
                fontSize: this.external_personFontSize,
                fontWeight: this.external_personFontWeight
            };
        }, "external_personFont"),
        systemFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.systemFontFamily,
                fontSize: this.systemFontSize,
                fontWeight: this.systemFontWeight
            };
        }, "systemFont"),
        external_systemFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.external_systemFontFamily,
                fontSize: this.external_systemFontSize,
                fontWeight: this.external_systemFontWeight
            };
        }, "external_systemFont"),
        system_dbFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.system_dbFontFamily,
                fontSize: this.system_dbFontSize,
                fontWeight: this.system_dbFontWeight
            };
        }, "system_dbFont"),
        external_system_dbFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.external_system_dbFontFamily,
                fontSize: this.external_system_dbFontSize,
                fontWeight: this.external_system_dbFontWeight
            };
        }, "external_system_dbFont"),
        system_queueFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.system_queueFontFamily,
                fontSize: this.system_queueFontSize,
                fontWeight: this.system_queueFontWeight
            };
        }, "system_queueFont"),
        external_system_queueFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.external_system_queueFontFamily,
                fontSize: this.external_system_queueFontSize,
                fontWeight: this.external_system_queueFontWeight
            };
        }, "external_system_queueFont"),
        containerFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.containerFontFamily,
                fontSize: this.containerFontSize,
                fontWeight: this.containerFontWeight
            };
        }, "containerFont"),
        external_containerFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.external_containerFontFamily,
                fontSize: this.external_containerFontSize,
                fontWeight: this.external_containerFontWeight
            };
        }, "external_containerFont"),
        container_dbFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.container_dbFontFamily,
                fontSize: this.container_dbFontSize,
                fontWeight: this.container_dbFontWeight
            };
        }, "container_dbFont"),
        external_container_dbFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.external_container_dbFontFamily,
                fontSize: this.external_container_dbFontSize,
                fontWeight: this.external_container_dbFontWeight
            };
        }, "external_container_dbFont"),
        container_queueFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.container_queueFontFamily,
                fontSize: this.container_queueFontSize,
                fontWeight: this.container_queueFontWeight
            };
        }, "container_queueFont"),
        external_container_queueFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.external_container_queueFontFamily,
                fontSize: this.external_container_queueFontSize,
                fontWeight: this.external_container_queueFontWeight
            };
        }, "external_container_queueFont"),
        componentFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.componentFontFamily,
                fontSize: this.componentFontSize,
                fontWeight: this.componentFontWeight
            };
        }, "componentFont"),
        external_componentFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.external_componentFontFamily,
                fontSize: this.external_componentFontSize,
                fontWeight: this.external_componentFontWeight
            };
        }, "external_componentFont"),
        component_dbFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.component_dbFontFamily,
                fontSize: this.component_dbFontSize,
                fontWeight: this.component_dbFontWeight
            };
        }, "component_dbFont"),
        external_component_dbFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.external_component_dbFontFamily,
                fontSize: this.external_component_dbFontSize,
                fontWeight: this.external_component_dbFontWeight
            };
        }, "external_component_dbFont"),
        component_queueFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.component_queueFontFamily,
                fontSize: this.component_queueFontSize,
                fontWeight: this.component_queueFontWeight
            };
        }, "component_queueFont"),
        external_component_queueFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.external_component_queueFontFamily,
                fontSize: this.external_component_queueFontSize,
                fontWeight: this.external_component_queueFontWeight
            };
        }, "external_component_queueFont"),
        boundaryFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.boundaryFontFamily,
                fontSize: this.boundaryFontSize,
                fontWeight: this.boundaryFontWeight
            };
        }, "boundaryFont"),
        messageFont: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
            return {
                fontFamily: this.messageFontFamily,
                fontSize: this.messageFontSize,
                fontWeight: this.messageFontWeight
            };
        }, "messageFont")
    },
    pie: {
        ...config_schema_default.pie,
        useWidth: 984
    },
    xyChart: {
        ...config_schema_default.xyChart,
        useWidth: void 0
    },
    requirement: {
        ...config_schema_default.requirement,
        useWidth: void 0
    },
    packet: {
        ...config_schema_default.packet
    },
    radar: {
        ...config_schema_default.radar
    },
    ishikawa: {
        ...config_schema_default.ishikawa
    },
    treemap: {
        useMaxWidth: true,
        padding: 10,
        diagramPadding: 8,
        showValues: true,
        nodeWidth: 100,
        nodeHeight: 40,
        borderWidth: 1,
        valueFontSize: 12,
        labelFontSize: 14,
        valueFormat: ","
    },
    venn: {
        ...config_schema_default.venn
    }
};
var keyify = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((obj, prefix = "")=>Object.keys(obj).reduce((res, el)=>{
        if (Array.isArray(obj[el])) {
            return res;
        } else if (typeof obj[el] === "object" && obj[el] !== null) {
            return [
                ...res,
                prefix + el,
                ...keyify(obj[el], "")
            ];
        }
        return [
            ...res,
            prefix + el
        ];
    }, []), "keyify");
var configKeys = new Set(keyify(config, ""));
var defaultConfig_default = config;
// src/utils/sanitizeDirective.ts
var sanitizeDirective = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((args)=>{
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"].debug("sanitizeDirective called with", args);
    if (typeof args !== "object" || args == null) {
        return;
    }
    if (Array.isArray(args)) {
        args.forEach((arg)=>sanitizeDirective(arg));
        return;
    }
    for (const key of Object.keys(args)){
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"].debug("Checking key", key);
        if (key.startsWith("__") || key.includes("proto") || key.includes("constr") || !configKeys.has(key) || args[key] == null) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"].debug("sanitize deleting key: ", key);
            delete args[key];
            continue;
        }
        if (typeof args[key] === "object") {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"].debug("sanitizing object", key);
            sanitizeDirective(args[key]);
            continue;
        }
        const cssMatchers = [
            "themeCSS",
            "fontFamily",
            "altFontFamily"
        ];
        for (const cssKey of cssMatchers){
            if (key.includes(cssKey)) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"].debug("sanitizing css option", key);
                args[key] = sanitizeCss(args[key]);
            }
        }
    }
    if (args.themeVariables) {
        for (const k of Object.keys(args.themeVariables)){
            const val = args.themeVariables[k];
            if (val?.match && !val.match(/^[\d "#%(),.;A-Za-z]+$/)) {
                args.themeVariables[k] = "";
            }
        }
    }
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"].debug("After sanitization", args);
}, "sanitizeDirective");
var sanitizeCss = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((str)=>{
    let startCnt = 0;
    let endCnt = 0;
    for (const element of str){
        if (startCnt < endCnt) {
            return "{ /* ERROR: Unbalanced CSS */ }";
        }
        if (element === "{") {
            startCnt++;
        } else if (element === "}") {
            endCnt++;
        }
    }
    if (startCnt !== endCnt) {
        return "{ /* ERROR: Unbalanced CSS */ }";
    }
    return str;
}, "sanitizeCss");
// src/config.ts
var defaultConfig = Object.freeze(defaultConfig_default);
var evaluate = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((val)=>val === false || [
        "false",
        "null",
        "0"
    ].includes(String(val).trim().toLowerCase()) ? false : true, "evaluate");
var siteConfig = assignWithDepth_default({}, defaultConfig);
var configFromInitialize;
var directives = [];
var currentConfig = assignWithDepth_default({}, defaultConfig);
var updateCurrentConfig = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((siteCfg, _directives)=>{
    let cfg = assignWithDepth_default({}, siteCfg);
    let sumOfDirectives = {};
    for (const d of _directives){
        sanitize(d);
        sumOfDirectives = assignWithDepth_default(sumOfDirectives, d);
    }
    cfg = assignWithDepth_default(cfg, sumOfDirectives);
    if (sumOfDirectives.theme && sumOfDirectives.theme in themes_default) {
        const tmpConfigFromInitialize = assignWithDepth_default({}, configFromInitialize);
        const themeVariables = assignWithDepth_default(tmpConfigFromInitialize.themeVariables || {}, sumOfDirectives.themeVariables);
        if (cfg.theme && cfg.theme in themes_default) {
            cfg.themeVariables = themes_default[cfg.theme].getThemeVariables(themeVariables);
        }
    }
    currentConfig = cfg;
    checkConfig(currentConfig);
    return currentConfig;
}, "updateCurrentConfig");
var setSiteConfig = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((conf)=>{
    siteConfig = assignWithDepth_default({}, defaultConfig);
    siteConfig = assignWithDepth_default(siteConfig, conf);
    if (conf.theme && themes_default[conf.theme]) {
        siteConfig.themeVariables = themes_default[conf.theme].getThemeVariables(conf.themeVariables);
    }
    updateCurrentConfig(siteConfig, directives);
    return siteConfig;
}, "setSiteConfig");
var saveConfigFromInitialize = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((conf)=>{
    configFromInitialize = assignWithDepth_default({}, conf);
}, "saveConfigFromInitialize");
var updateSiteConfig = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((conf)=>{
    siteConfig = assignWithDepth_default(siteConfig, conf);
    updateCurrentConfig(siteConfig, directives);
    return siteConfig;
}, "updateSiteConfig");
var getSiteConfig = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(()=>{
    return assignWithDepth_default({}, siteConfig);
}, "getSiteConfig");
var setConfig = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((conf)=>{
    checkConfig(conf);
    assignWithDepth_default(currentConfig, conf);
    return getConfig();
}, "setConfig");
var getConfig = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(()=>{
    return assignWithDepth_default({}, currentConfig);
}, "getConfig");
var sanitize = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((options)=>{
    if (!options) {
        return;
    }
    [
        "secure",
        ...siteConfig.secure ?? []
    ].forEach((key)=>{
        if (Object.hasOwn(options, key)) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"].debug(`Denied attempt to modify a secure key ${key}`, options[key]);
            delete options[key];
        }
    });
    Object.keys(options).forEach((key)=>{
        if (key.startsWith("__")) {
            delete options[key];
        }
    });
    Object.keys(options).forEach((key)=>{
        if (typeof options[key] === "string" && (options[key].includes("<") || options[key].includes(">") || options[key].includes("url(data:"))) {
            delete options[key];
        }
        if (typeof options[key] === "object") {
            sanitize(options[key]);
        }
    });
}, "sanitize");
var addDirective = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((directive)=>{
    sanitizeDirective(directive);
    if (directive.fontFamily && !directive.themeVariables?.fontFamily) {
        directive.themeVariables = {
            ...directive.themeVariables,
            fontFamily: directive.fontFamily
        };
    }
    directives.push(directive);
    updateCurrentConfig(siteConfig, directives);
}, "addDirective");
var reset = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((config2 = siteConfig)=>{
    directives = [];
    updateCurrentConfig(config2, directives);
}, "reset");
var ConfigWarning = {
    LAZY_LOAD_DEPRECATED: "The configuration options lazyLoadedDiagrams and loadExternalDiagramsAtStartup are deprecated. Please use registerExternalDiagrams instead.",
    FLOWCHART_HTML_LABELS_DEPRECATED: "flowchart.htmlLabels is deprecated. Please use global htmlLabels instead."
};
var issuedWarnings = {};
var issueWarning = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((warning)=>{
    if (issuedWarnings[warning]) {
        return;
    }
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"].warn(ConfigWarning[warning]);
    issuedWarnings[warning] = true;
}, "issueWarning");
var checkConfig = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((config2)=>{
    if (!config2) {
        return;
    }
    if (config2.lazyLoadedDiagrams || config2.loadExternalDiagramsAtStartup) {
        issueWarning("LAZY_LOAD_DEPRECATED");
    }
}, "checkConfig");
var getUserDefinedConfig = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(()=>{
    let userConfig = {};
    if (configFromInitialize) {
        userConfig = assignWithDepth_default(userConfig, configFromInitialize);
    }
    for (const d of directives){
        userConfig = assignWithDepth_default(userConfig, d);
    }
    return userConfig;
}, "getUserDefinedConfig");
var getEffectiveHtmlLabels = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((config2)=>{
    if (config2.flowchart?.htmlLabels != void 0) {
        issueWarning("FLOWCHART_HTML_LABELS_DEPRECATED");
    }
    return evaluate(config2.htmlLabels ?? config2.flowchart?.htmlLabels ?? true);
}, "getEffectiveHtmlLabels");
;
var lineBreakRegex = /<br\s*\/?>/gi;
var getRows = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((s)=>{
    if (!s) {
        return [
            ""
        ];
    }
    const str = breakToPlaceholder(s).replace(/\\n/g, "#br#");
    return str.split("#br#");
}, "getRows");
var setupDompurifyHooksIfNotSetup = /* @__PURE__ */ (()=>{
    let setup = false;
    return ()=>{
        if (!setup) {
            setupDompurifyHooks();
            setup = true;
        }
    };
})();
function setupDompurifyHooks() {
    const TEMPORARY_ATTRIBUTE = "data-temp-href-target";
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$dompurify$40$3$2e$3$2e$3$2f$node_modules$2f$dompurify$2f$dist$2f$purify$2e$es$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].addHook("beforeSanitizeAttributes", (node)=>{
        if (node.tagName === "A" && node.hasAttribute("target")) {
            node.setAttribute(TEMPORARY_ATTRIBUTE, node.getAttribute("target") ?? "");
        }
    });
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$dompurify$40$3$2e$3$2e$3$2f$node_modules$2f$dompurify$2f$dist$2f$purify$2e$es$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].addHook("afterSanitizeAttributes", (node)=>{
        if (node.tagName === "A" && node.hasAttribute(TEMPORARY_ATTRIBUTE)) {
            node.setAttribute("target", node.getAttribute(TEMPORARY_ATTRIBUTE) ?? "");
            node.removeAttribute(TEMPORARY_ATTRIBUTE);
            if (node.getAttribute("target") === "_blank") {
                node.setAttribute("rel", "noopener");
            }
        }
    });
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(setupDompurifyHooks, "setupDompurifyHooks");
var removeScript = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((txt)=>{
    setupDompurifyHooksIfNotSetup();
    const sanitizedText = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$dompurify$40$3$2e$3$2e$3$2f$node_modules$2f$dompurify$2f$dist$2f$purify$2e$es$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].sanitize(txt);
    return sanitizedText;
}, "removeScript");
var sanitizeMore = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((text, config2)=>{
    if (getEffectiveHtmlLabels(config2)) {
        const level = config2.securityLevel;
        if (level === "antiscript" || level === "strict" || level === "sandbox") {
            text = removeScript(text);
        } else if (level !== "loose") {
            text = breakToPlaceholder(text);
            text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            text = text.replace(/=/g, "&equals;");
            text = placeholderToBreak(text);
        }
    }
    return text;
}, "sanitizeMore");
var sanitizeText = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((text, config2)=>{
    if (!text) {
        return text;
    }
    if (config2.dompurifyConfig) {
        text = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$dompurify$40$3$2e$3$2e$3$2f$node_modules$2f$dompurify$2f$dist$2f$purify$2e$es$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].sanitize(sanitizeMore(text, config2), config2.dompurifyConfig).toString();
    } else {
        text = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$dompurify$40$3$2e$3$2e$3$2f$node_modules$2f$dompurify$2f$dist$2f$purify$2e$es$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].sanitize(sanitizeMore(text, config2), {
            FORBID_TAGS: [
                "style"
            ]
        }).toString();
    }
    return text;
}, "sanitizeText");
var sanitizeTextOrArray = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((a, config2)=>{
    if (typeof a === "string") {
        return sanitizeText(a, config2);
    }
    return a.flat().map((x)=>sanitizeText(x, config2));
}, "sanitizeTextOrArray");
var hasBreaks = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((text)=>{
    return lineBreakRegex.test(text);
}, "hasBreaks");
var splitBreaks = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((text)=>{
    return text.split(lineBreakRegex);
}, "splitBreaks");
var placeholderToBreak = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((s)=>{
    return s.replace(/#br#/g, "<br/>");
}, "placeholderToBreak");
var breakToPlaceholder = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((s)=>{
    return s.replace(lineBreakRegex, "#br#");
}, "breakToPlaceholder");
var getUrl = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((useAbsolute)=>{
    let url = "";
    if (useAbsolute) {
        url = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search;
        url = CSS.escape(url);
    }
    return url;
}, "getUrl");
var getMax = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(...values) {
    const newValues = values.filter((value)=>{
        return !isNaN(value);
    });
    return Math.max(...newValues);
}, "getMax");
var getMin = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(...values) {
    const newValues = values.filter((value)=>{
        return !isNaN(value);
    });
    return Math.min(...newValues);
}, "getMin");
var parseGenericTypes = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(input) {
    const inputSets = input.split(/(,)/);
    const output = [];
    for(let i = 0; i < inputSets.length; i++){
        let thisSet = inputSets[i];
        if (thisSet === "," && i > 0 && i + 1 < inputSets.length) {
            const previousSet = inputSets[i - 1];
            const nextSet = inputSets[i + 1];
            if (shouldCombineSets(previousSet, nextSet)) {
                thisSet = previousSet + "," + nextSet;
                i++;
                output.pop();
            }
        }
        output.push(processSet(thisSet));
    }
    return output.join("");
}, "parseGenericTypes");
var countOccurrence = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((string, substring)=>{
    return Math.max(0, string.split(substring).length - 1);
}, "countOccurrence");
var shouldCombineSets = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((previousSet, nextSet)=>{
    const prevCount = countOccurrence(previousSet, "~");
    const nextCount = countOccurrence(nextSet, "~");
    return prevCount === 1 && nextCount === 1;
}, "shouldCombineSets");
var processSet = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((input)=>{
    const tildeCount = countOccurrence(input, "~");
    let hasStartingTilde = false;
    if (tildeCount <= 1) {
        return input;
    }
    if (tildeCount % 2 !== 0 && input.startsWith("~")) {
        input = input.substring(1);
        hasStartingTilde = true;
    }
    const chars = [
        ...input
    ];
    let first = chars.indexOf("~");
    let last = chars.lastIndexOf("~");
    while(first !== -1 && last !== -1 && first !== last){
        chars[first] = "<";
        chars[last] = ">";
        first = chars.indexOf("~");
        last = chars.lastIndexOf("~");
    }
    if (hasStartingTilde) {
        chars.unshift("~");
    }
    return chars.join("");
}, "processSet");
var isMathMLSupported = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(()=>window.MathMLElement !== void 0, "isMathMLSupported");
var katexRegex = /\$\$(.*)\$\$/g;
var hasKatex = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((text)=>(text.match(katexRegex)?.length ?? 0) > 0, "hasKatex");
var calculateMathMLDimensions = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(async (text, config2)=>{
    const divElem = document.createElement("div");
    divElem.innerHTML = await renderKatexSanitized(text, config2);
    divElem.id = "katex-temp";
    divElem.style.visibility = "hidden";
    divElem.style.position = "absolute";
    divElem.style.top = "0";
    const body = document.querySelector("body");
    body?.insertAdjacentElement("beforeend", divElem);
    const dim = {
        width: divElem.clientWidth,
        height: divElem.clientHeight
    };
    divElem.remove();
    return dim;
}, "calculateMathMLDimensions");
var renderKatexUnsanitized = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(async (text, config2)=>{
    if (!hasKatex(text)) {
        return text;
    }
    if (!(isMathMLSupported() || config2.legacyMathML || config2.forceLegacyMathML)) {
        return text.replace(katexRegex, "MathML is unsupported in this environment.");
    }
    if ("TURBOPACK compile-time truthy", 1) {
        const { default: katex } = await __turbopack_context__.A("[project]/node_modules/.pnpm/katex@0.16.38/node_modules/katex/dist/katex.mjs [app-ssr] (ecmascript, async loader)");
        const outputMode = config2.forceLegacyMathML || !isMathMLSupported() && config2.legacyMathML ? "htmlAndMathml" : "mathml";
        return text.split(lineBreakRegex).map((line)=>hasKatex(line) ? `<div style="display: flex; align-items: center; justify-content: center; white-space: nowrap;">${line}</div>` : `<div>${line}</div>`).join("").replace(katexRegex, (_, c)=>katex.renderToString(c, {
                throwOnError: true,
                displayMode: true,
                output: outputMode
            }).replace(/\n/g, " ").replace(/<annotation.*<\/annotation>/g, ""));
    }
    //TURBOPACK unreachable
    ;
}, "renderKatexUnsanitized");
var renderKatexSanitized = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(async (text, config2)=>{
    return sanitizeText(await renderKatexUnsanitized(text, config2), config2);
}, "renderKatexSanitized");
var common_default = {
    getRows,
    sanitizeText,
    sanitizeTextOrArray,
    hasBreaks,
    splitBreaks,
    lineBreakRegex,
    removeScript,
    getUrl,
    evaluate,
    getMax,
    getMin
};
// src/setupGraphViewbox.js
var d3Attrs = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(d3Elem, attrs) {
    for (let attr of attrs){
        d3Elem.attr(attr[0], attr[1]);
    }
}, "d3Attrs");
var calculateSvgSizeAttrs = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(height, width, useMaxWidth) {
    let attrs = /* @__PURE__ */ new Map();
    if (useMaxWidth) {
        attrs.set("width", "100%");
        attrs.set("style", `max-width: ${width}px;`);
    } else {
        attrs.set("height", height);
        attrs.set("width", width);
    }
    return attrs;
}, "calculateSvgSizeAttrs");
var configureSvgSize = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(svgElem, height, width, useMaxWidth) {
    const attrs = calculateSvgSizeAttrs(height, width, useMaxWidth);
    d3Attrs(svgElem, attrs);
}, "configureSvgSize");
var setupGraphViewbox = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(graph, svgElem, padding, useMaxWidth) {
    const svgBounds = svgElem.node().getBBox();
    const sWidth = svgBounds.width;
    const sHeight = svgBounds.height;
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"].info(`SVG bounds: ${sWidth}x${sHeight}`, svgBounds);
    let width = 0;
    let height = 0;
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"].info(`Graph bounds: ${width}x${height}`, graph);
    width = sWidth + padding * 2;
    height = sHeight + padding * 2;
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"].info(`Calculated bounds: ${width}x${height}`);
    configureSvgSize(svgElem, height, width, useMaxWidth);
    const vBox = `${svgBounds.x - padding} ${svgBounds.y - padding} ${svgBounds.width + 2 * padding} ${svgBounds.height + 2 * padding}`;
    svgElem.attr("viewBox", vBox);
}, "setupGraphViewbox");
// src/styles.ts
var themes = {};
var getStyles = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((type, userStyles, options)=>{
    let diagramStyles = "";
    if (type in themes && themes[type]) {
        diagramStyles = themes[type](options);
    } else {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"].warn(`No theme found for ${type}`);
    }
    return ` & {
    font-family: ${options.fontFamily};
    font-size: ${options.fontSize};
    fill: ${options.textColor}
  }
  @keyframes edge-animation-frame {
    from {
      stroke-dashoffset: 0;
    }
  }
  @keyframes dash {
    to {
      stroke-dashoffset: 0;
    }
  }
  & .edge-animation-slow {
    stroke-dasharray: 9,5 !important;
    stroke-dashoffset: 900;
    animation: dash 50s linear infinite;
    stroke-linecap: round;
  }
  & .edge-animation-fast {
    stroke-dasharray: 9,5 !important;
    stroke-dashoffset: 900;
    animation: dash 20s linear infinite;
    stroke-linecap: round;
  }
  /* Classes common for multiple diagrams */

  & .error-icon {
    fill: ${options.errorBkgColor};
  }
  & .error-text {
    fill: ${options.errorTextColor};
    stroke: ${options.errorTextColor};
  }

  & .edge-thickness-normal {
    stroke-width: 1px;
  }
  & .edge-thickness-thick {
    stroke-width: 3.5px
  }
  & .edge-pattern-solid {
    stroke-dasharray: 0;
  }
  & .edge-thickness-invisible {
    stroke-width: 0;
    fill: none;
  }
  & .edge-pattern-dashed{
    stroke-dasharray: 3;
  }
  .edge-pattern-dotted {
    stroke-dasharray: 2;
  }

  & .marker {
    fill: ${options.lineColor};
    stroke: ${options.lineColor};
  }
  & .marker.cross {
    stroke: ${options.lineColor};
  }

  & svg {
    font-family: ${options.fontFamily};
    font-size: ${options.fontSize};
  }
   & p {
    margin: 0
   }

  ${diagramStyles}

  ${userStyles}
`;
}, "getStyles");
var addStylesForDiagram = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((type, diagramTheme)=>{
    if (diagramTheme !== void 0) {
        themes[type] = diagramTheme;
    }
}, "addStylesForDiagram");
var styles_default = getStyles;
// src/diagrams/common/commonDb.ts
var commonDb_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__export"])(commonDb_exports, {
    clear: ()=>clear,
    getAccDescription: ()=>getAccDescription,
    getAccTitle: ()=>getAccTitle,
    getDiagramTitle: ()=>getDiagramTitle,
    setAccDescription: ()=>setAccDescription,
    setAccTitle: ()=>setAccTitle,
    setDiagramTitle: ()=>setDiagramTitle
});
var accTitle = "";
var diagramTitle = "";
var accDescription = "";
var sanitizeText2 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((txt)=>sanitizeText(txt, getConfig()), "sanitizeText");
var clear = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(()=>{
    accTitle = "";
    accDescription = "";
    diagramTitle = "";
}, "clear");
var setAccTitle = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((txt)=>{
    accTitle = sanitizeText2(txt).replace(/^\s+/g, "");
}, "setAccTitle");
var getAccTitle = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(()=>accTitle, "getAccTitle");
var setAccDescription = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((txt)=>{
    accDescription = sanitizeText2(txt).replace(/\n\s+/g, "\n");
}, "setAccDescription");
var getAccDescription = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(()=>accDescription, "getAccDescription");
var setDiagramTitle = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((txt)=>{
    diagramTitle = sanitizeText2(txt);
}, "setDiagramTitle");
var getDiagramTitle = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(()=>diagramTitle, "getDiagramTitle");
// src/diagram-api/diagramAPI.ts
var log2 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"];
var setLogLevel2 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setLogLevel"];
var getConfig2 = getConfig;
var setConfig2 = setConfig;
var defaultConfig2 = defaultConfig;
var sanitizeText3 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((text)=>sanitizeText(text, getConfig2()), "sanitizeText");
var setupGraphViewbox2 = setupGraphViewbox;
var getCommonDb = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(()=>{
    return commonDb_exports;
}, "getCommonDb");
var diagrams = {};
var registerDiagram = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((id, diagram, detector)=>{
    if (diagrams[id]) {
        log2.warn(`Diagram with id ${id} already registered. Overwriting.`);
    }
    diagrams[id] = diagram;
    if (detector) {
        addDetector(id, detector);
    }
    addStylesForDiagram(id, diagram.styles);
    diagram.injectUtils?.(log2, setLogLevel2, getConfig2, sanitizeText3, setupGraphViewbox2, getCommonDb(), ()=>{});
}, "registerDiagram");
var getDiagram = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((name)=>{
    if (name in diagrams) {
        return diagrams[name];
    }
    throw new DiagramNotFoundError(name);
}, "getDiagram");
var DiagramNotFoundError = class extends Error {
    static{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(this, "DiagramNotFoundError");
    }
    constructor(name){
        super(`Diagram ${name} not found.`);
    }
};
;
}),
"[project]/node_modules/.pnpm/mermaid@11.13.0/node_modules/mermaid/dist/chunks/mermaid.core/chunk-JSJVCQXG.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createTooltip",
    ()=>createTooltip,
    "drawBackgroundRect",
    ()=>drawBackgroundRect,
    "drawEmbeddedImage",
    ()=>drawEmbeddedImage,
    "drawImage",
    ()=>drawImage,
    "drawRect",
    ()=>drawRect,
    "drawText",
    ()=>drawText,
    "getNoteRect",
    ()=>getNoteRect,
    "getTextObj",
    ()=>getTextObj
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/mermaid@11.13.0/node_modules/mermaid/dist/chunks/mermaid.core/chunk-7R4GIKGN.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/mermaid@11.13.0/node_modules/mermaid/dist/chunks/mermaid.core/chunk-AGHRB4JF.mjs [app-ssr] (ecmascript)");
// src/diagrams/common/svgDrawCommon.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$braintree$2b$sanitize$2d$url$40$7$2e$1$2e$2$2f$node_modules$2f40$braintree$2f$sanitize$2d$url$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@braintree+sanitize-url@7.1.2/node_modules/@braintree/sanitize-url/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$40$7$2e$9$2e$0$2f$node_modules$2f$d3$2f$src$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3@7.9.0/node_modules/d3/src/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$selection$40$3$2e$0$2e$0$2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/select.js [app-ssr] (ecmascript) <export default as select>");
;
;
;
;
var drawRect = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((element, rectData)=>{
    const rectElement = element.append("rect");
    rectElement.attr("x", rectData.x);
    rectElement.attr("y", rectData.y);
    rectElement.attr("fill", rectData.fill);
    rectElement.attr("stroke", rectData.stroke);
    rectElement.attr("width", rectData.width);
    rectElement.attr("height", rectData.height);
    if (rectData.name) {
        rectElement.attr("name", rectData.name);
    }
    if (rectData.rx) {
        rectElement.attr("rx", rectData.rx);
    }
    if (rectData.ry) {
        rectElement.attr("ry", rectData.ry);
    }
    if (rectData.attrs !== void 0) {
        for(const attrKey in rectData.attrs){
            rectElement.attr(attrKey, rectData.attrs[attrKey]);
        }
    }
    if (rectData.class) {
        rectElement.attr("class", rectData.class);
    }
    return rectElement;
}, "drawRect");
var drawBackgroundRect = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((element, bounds)=>{
    const rectData = {
        x: bounds.startx,
        y: bounds.starty,
        width: bounds.stopx - bounds.startx,
        height: bounds.stopy - bounds.starty,
        fill: bounds.fill,
        stroke: bounds.stroke,
        class: "rect"
    };
    const rectElement = drawRect(element, rectData);
    rectElement.lower();
}, "drawBackgroundRect");
var drawText = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((element, textData)=>{
    const nText = textData.text.replace(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["lineBreakRegex"], " ");
    const textElem = element.append("text");
    textElem.attr("x", textData.x);
    textElem.attr("y", textData.y);
    textElem.attr("class", "legend");
    textElem.style("text-anchor", textData.anchor);
    if (textData.class) {
        textElem.attr("class", textData.class);
    }
    const tspan = textElem.append("tspan");
    tspan.attr("x", textData.x + textData.textMargin * 2);
    tspan.text(nText);
    return textElem;
}, "drawText");
var drawImage = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((elem, x, y, link)=>{
    const imageElement = elem.append("image");
    imageElement.attr("x", x);
    imageElement.attr("y", y);
    const sanitizedLink = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$braintree$2b$sanitize$2d$url$40$7$2e$1$2e$2$2f$node_modules$2f40$braintree$2f$sanitize$2d$url$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeUrl"])(link);
    imageElement.attr("xlink:href", sanitizedLink);
}, "drawImage");
var drawEmbeddedImage = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((element, x, y, link)=>{
    const imageElement = element.append("use");
    imageElement.attr("x", x);
    imageElement.attr("y", y);
    const sanitizedLink = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$braintree$2b$sanitize$2d$url$40$7$2e$1$2e$2$2f$node_modules$2f40$braintree$2f$sanitize$2d$url$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeUrl"])(link);
    imageElement.attr("xlink:href", `#${sanitizedLink}`);
}, "drawEmbeddedImage");
var getNoteRect = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(()=>{
    const noteRectData = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        fill: "#EDF2AE",
        stroke: "#666",
        anchor: "start",
        rx: 0,
        ry: 0
    };
    return noteRectData;
}, "getNoteRect");
var getTextObj = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(()=>{
    const testObject = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        "text-anchor": "start",
        style: "#666",
        textMargin: 0,
        rx: 0,
        ry: 0,
        tspan: true
    };
    return testObject;
}, "getTextObj");
var createTooltip = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(()=>{
    let tooltipElem = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$selection$40$3$2e$0$2e$0$2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(".mermaidTooltip");
    if (tooltipElem.empty()) {
        tooltipElem = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$selection$40$3$2e$0$2e$0$2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])("body").append("div").attr("class", "mermaidTooltip").style("opacity", 0).style("position", "absolute").style("text-align", "center").style("max-width", "200px").style("padding", "2px").style("font-size", "12px").style("background", "#ffffde").style("border", "1px solid #333").style("border-radius", "2px").style("pointer-events", "none").style("z-index", "100");
    }
    return tooltipElem;
}, "createTooltip");
;
}),
"[project]/node_modules/.pnpm/mermaid@11.13.0/node_modules/mermaid/dist/chunks/mermaid.core/chunk-GEFDOKGD.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ZERO_WIDTH_SPACE",
    ()=>ZERO_WIDTH_SPACE,
    "calculateTextHeight",
    ()=>calculateTextHeight,
    "calculateTextWidth",
    ()=>calculateTextWidth,
    "cleanAndMerge",
    ()=>cleanAndMerge,
    "decodeEntities",
    ()=>decodeEntities,
    "encodeEntities",
    ()=>encodeEntities,
    "generateId",
    ()=>generateId,
    "getEdgeId",
    ()=>getEdgeId,
    "getStylesFromArray",
    ()=>getStylesFromArray,
    "handleUndefinedAttr",
    ()=>handleUndefinedAttr,
    "interpolateToCurve",
    ()=>interpolateToCurve,
    "isDetailedError",
    ()=>isDetailedError,
    "parseFontSize",
    ()=>parseFontSize,
    "random",
    ()=>random,
    "removeDirectives",
    ()=>removeDirectives,
    "utils_default",
    ()=>utils_default,
    "wrapLabel",
    ()=>wrapLabel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/mermaid@11.13.0/node_modules/mermaid/dist/chunks/mermaid.core/chunk-7R4GIKGN.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/mermaid@11.13.0/node_modules/mermaid/dist/chunks/mermaid.core/chunk-AGHRB4JF.mjs [app-ssr] (ecmascript)");
// src/utils.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$braintree$2b$sanitize$2d$url$40$7$2e$1$2e$2$2f$node_modules$2f40$braintree$2f$sanitize$2d$url$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@braintree+sanitize-url@7.1.2/node_modules/@braintree/sanitize-url/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$40$7$2e$9$2e$0$2f$node_modules$2f$d3$2f$src$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3@7.9.0/node_modules/d3/src/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$basis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveBasis$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/curve/basis.js [app-ssr] (ecmascript) <export default as curveBasis>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$basisClosed$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveBasisClosed$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/curve/basisClosed.js [app-ssr] (ecmascript) <export default as curveBasisClosed>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$basisOpen$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveBasisOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/curve/basisOpen.js [app-ssr] (ecmascript) <export default as curveBasisOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$bump$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__bumpX__as__curveBumpX$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/curve/bump.js [app-ssr] (ecmascript) <export bumpX as curveBumpX>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$bump$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__bumpY__as__curveBumpY$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/curve/bump.js [app-ssr] (ecmascript) <export bumpY as curveBumpY>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$bundle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveBundle$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/curve/bundle.js [app-ssr] (ecmascript) <export default as curveBundle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$cardinalClosed$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveCardinalClosed$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/curve/cardinalClosed.js [app-ssr] (ecmascript) <export default as curveCardinalClosed>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$cardinalOpen$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveCardinalOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/curve/cardinalOpen.js [app-ssr] (ecmascript) <export default as curveCardinalOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$cardinal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveCardinal$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/curve/cardinal.js [app-ssr] (ecmascript) <export default as curveCardinal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$catmullRomClosed$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveCatmullRomClosed$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/curve/catmullRomClosed.js [app-ssr] (ecmascript) <export default as curveCatmullRomClosed>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$catmullRomOpen$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveCatmullRomOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/curve/catmullRomOpen.js [app-ssr] (ecmascript) <export default as curveCatmullRomOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$catmullRom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveCatmullRom$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/curve/catmullRom.js [app-ssr] (ecmascript) <export default as curveCatmullRom>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$linear$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveLinear$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/curve/linear.js [app-ssr] (ecmascript) <export default as curveLinear>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$linearClosed$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveLinearClosed$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/curve/linearClosed.js [app-ssr] (ecmascript) <export default as curveLinearClosed>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$monotone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__monotoneX__as__curveMonotoneX$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/curve/monotone.js [app-ssr] (ecmascript) <export monotoneX as curveMonotoneX>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$monotone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__monotoneY__as__curveMonotoneY$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/curve/monotone.js [app-ssr] (ecmascript) <export monotoneY as curveMonotoneY>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$natural$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveNatural$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/curve/natural.js [app-ssr] (ecmascript) <export default as curveNatural>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$step$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveStep$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/curve/step.js [app-ssr] (ecmascript) <export default as curveStep>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$step$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__stepAfter__as__curveStepAfter$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/curve/step.js [app-ssr] (ecmascript) <export stepAfter as curveStepAfter>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$step$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__stepBefore__as__curveStepBefore$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/curve/step.js [app-ssr] (ecmascript) <export stepBefore as curveStepBefore>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$selection$40$3$2e$0$2e$0$2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/select.js [app-ssr] (ecmascript) <export default as select>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lodash$2d$es$40$4$2e$17$2e$23$2f$node_modules$2f$lodash$2d$es$2f$memoize$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/memoize.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lodash$2d$es$40$4$2e$17$2e$23$2f$node_modules$2f$lodash$2d$es$2f$merge$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/merge.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
var ZERO_WIDTH_SPACE = "\u200B";
var d3CurveTypes = {
    curveBasis: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$basis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveBasis$3e$__["curveBasis"],
    curveBasisClosed: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$basisClosed$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveBasisClosed$3e$__["curveBasisClosed"],
    curveBasisOpen: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$basisOpen$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveBasisOpen$3e$__["curveBasisOpen"],
    curveBumpX: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$bump$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__bumpX__as__curveBumpX$3e$__["curveBumpX"],
    curveBumpY: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$bump$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__bumpY__as__curveBumpY$3e$__["curveBumpY"],
    curveBundle: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$bundle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveBundle$3e$__["curveBundle"],
    curveCardinalClosed: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$cardinalClosed$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveCardinalClosed$3e$__["curveCardinalClosed"],
    curveCardinalOpen: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$cardinalOpen$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveCardinalOpen$3e$__["curveCardinalOpen"],
    curveCardinal: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$cardinal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveCardinal$3e$__["curveCardinal"],
    curveCatmullRomClosed: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$catmullRomClosed$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveCatmullRomClosed$3e$__["curveCatmullRomClosed"],
    curveCatmullRomOpen: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$catmullRomOpen$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveCatmullRomOpen$3e$__["curveCatmullRomOpen"],
    curveCatmullRom: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$catmullRom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveCatmullRom$3e$__["curveCatmullRom"],
    curveLinear: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$linear$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveLinear$3e$__["curveLinear"],
    curveLinearClosed: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$linearClosed$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveLinearClosed$3e$__["curveLinearClosed"],
    curveMonotoneX: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$monotone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__monotoneX__as__curveMonotoneX$3e$__["curveMonotoneX"],
    curveMonotoneY: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$monotone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__monotoneY__as__curveMonotoneY$3e$__["curveMonotoneY"],
    curveNatural: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$natural$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveNatural$3e$__["curveNatural"],
    curveStep: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$step$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveStep$3e$__["curveStep"],
    curveStepAfter: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$step$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__stepAfter__as__curveStepAfter$3e$__["curveStepAfter"],
    curveStepBefore: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$step$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__stepBefore__as__curveStepBefore$3e$__["curveStepBefore"]
};
var directiveWithoutOpen = /\s*(?:(\w+)(?=:):|(\w+))\s*(?:(\w+)|((?:(?!}%{2}).|\r?\n)*))?\s*(?:}%{2})?/gi;
var detectInit = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(text, config) {
    const inits = detectDirective(text, /(?:init\b)|(?:initialize\b)/);
    let results = {};
    if (Array.isArray(inits)) {
        const args = inits.map((init)=>init.args);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeDirective"])(args);
        results = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assignWithDepth_default"])(results, [
            ...args
        ]);
    } else {
        results = inits.args;
    }
    if (!results) {
        return;
    }
    let type = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["detectType"])(text, config);
    const prop = "config";
    if (results[prop] !== void 0) {
        if (type === "flowchart-v2") {
            type = "flowchart";
        }
        results[type] = results[prop];
        delete results[prop];
    }
    return results;
}, "detectInit");
var detectDirective = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(text, type = null) {
    try {
        const commentWithoutDirectives = new RegExp(`[%]{2}(?![{]${directiveWithoutOpen.source})(?=[}][%]{2}).*
`, "ig");
        text = text.trim().replace(commentWithoutDirectives, "").replace(/'/gm, '"');
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"].debug(`Detecting diagram directive${type !== null ? " type:" + type : ""} based on the text:${text}`);
        let match;
        const result = [];
        while((match = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["directiveRegex"].exec(text)) !== null){
            if (match.index === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["directiveRegex"].lastIndex) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["directiveRegex"].lastIndex++;
            }
            if (match && !type || type && match[1]?.match(type) || type && match[2]?.match(type)) {
                const type2 = match[1] ? match[1] : match[2];
                const args = match[3] ? match[3].trim() : match[4] ? JSON.parse(match[4].trim()) : null;
                result.push({
                    type: type2,
                    args
                });
            }
        }
        if (result.length === 0) {
            return {
                type: text,
                args: null
            };
        }
        return result.length === 1 ? result[0] : result;
    } catch (error) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"].error(`ERROR: ${error.message} - Unable to parse directive type: '${type}' based on the text: '${text}'`);
        return {
            type: void 0,
            args: null
        };
    }
}, "detectDirective");
var removeDirectives = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(text) {
    return text.replace(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["directiveRegex"], "");
}, "removeDirectives");
var isSubstringInArray = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(str, arr) {
    for (const [i, element] of arr.entries()){
        if (element.match(str)) {
            return i;
        }
    }
    return -1;
}, "isSubstringInArray");
function interpolateToCurve(interpolate, defaultCurve) {
    if (!interpolate) {
        return defaultCurve;
    }
    const curveName = `curve${interpolate.charAt(0).toUpperCase() + interpolate.slice(1)}`;
    return d3CurveTypes[curveName] ?? defaultCurve;
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(interpolateToCurve, "interpolateToCurve");
function formatUrl(linkStr, config) {
    const url = linkStr.trim();
    if (!url) {
        return void 0;
    }
    if (config.securityLevel !== "loose") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$braintree$2b$sanitize$2d$url$40$7$2e$1$2e$2$2f$node_modules$2f40$braintree$2f$sanitize$2d$url$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeUrl"])(url);
    }
    return url;
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(formatUrl, "formatUrl");
var runFunc = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((functionName, ...params)=>{
    const arrPaths = functionName.split(".");
    const len = arrPaths.length - 1;
    const fnName = arrPaths[len];
    let obj = window;
    for(let i = 0; i < len; i++){
        obj = obj[arrPaths[i]];
        if (!obj) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"].error(`Function name: ${functionName} not found in window`);
            return;
        }
    }
    obj[fnName](...params);
}, "runFunc");
function distance(p1, p2) {
    if (!p1 || !p2) {
        return 0;
    }
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(distance, "distance");
function traverseEdge(points) {
    let prevPoint;
    let totalDistance = 0;
    points.forEach((point)=>{
        totalDistance += distance(point, prevPoint);
        prevPoint = point;
    });
    const remainingDistance = totalDistance / 2;
    return calculatePoint(points, remainingDistance);
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(traverseEdge, "traverseEdge");
function calcLabelPosition(points) {
    if (points.length === 1) {
        return points[0];
    }
    return traverseEdge(points);
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(calcLabelPosition, "calcLabelPosition");
var roundNumber = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((num, precision = 2)=>{
    const factor = Math.pow(10, precision);
    return Math.round(num * factor) / factor;
}, "roundNumber");
var calculatePoint = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((points, distanceToTraverse)=>{
    let prevPoint = void 0;
    let remainingDistance = distanceToTraverse;
    for (const point of points){
        if (prevPoint) {
            const vectorDistance = distance(point, prevPoint);
            if (vectorDistance === 0) {
                return prevPoint;
            }
            if (vectorDistance < remainingDistance) {
                remainingDistance -= vectorDistance;
            } else {
                const distanceRatio = remainingDistance / vectorDistance;
                if (distanceRatio <= 0) {
                    return prevPoint;
                }
                if (distanceRatio >= 1) {
                    return {
                        x: point.x,
                        y: point.y
                    };
                }
                if (distanceRatio > 0 && distanceRatio < 1) {
                    return {
                        x: roundNumber((1 - distanceRatio) * prevPoint.x + distanceRatio * point.x, 5),
                        y: roundNumber((1 - distanceRatio) * prevPoint.y + distanceRatio * point.y, 5)
                    };
                }
            }
        }
        prevPoint = point;
    }
    throw new Error("Could not find a suitable point for the given distance");
}, "calculatePoint");
var calcCardinalityPosition = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((isRelationTypePresent, points, initialPosition)=>{
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"].info(`our points ${JSON.stringify(points)}`);
    if (points[0] !== initialPosition) {
        points = points.reverse();
    }
    const distanceToCardinalityPoint = 25;
    const center = calculatePoint(points, distanceToCardinalityPoint);
    const d = isRelationTypePresent ? 10 : 5;
    const angle = Math.atan2(points[0].y - center.y, points[0].x - center.x);
    const cardinalityPosition = {
        x: 0,
        y: 0
    };
    cardinalityPosition.x = Math.sin(angle) * d + (points[0].x + center.x) / 2;
    cardinalityPosition.y = -Math.cos(angle) * d + (points[0].y + center.y) / 2;
    return cardinalityPosition;
}, "calcCardinalityPosition");
function calcTerminalLabelPosition(terminalMarkerSize, position, _points) {
    const points = structuredClone(_points);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"].info("our points", points);
    if (position !== "start_left" && position !== "start_right") {
        points.reverse();
    }
    const distanceToCardinalityPoint = 25 + terminalMarkerSize;
    const center = calculatePoint(points, distanceToCardinalityPoint);
    const d = 10 + terminalMarkerSize * 0.5;
    const angle = Math.atan2(points[0].y - center.y, points[0].x - center.x);
    const cardinalityPosition = {
        x: 0,
        y: 0
    };
    if (position === "start_left") {
        cardinalityPosition.x = Math.sin(angle + Math.PI) * d + (points[0].x + center.x) / 2;
        cardinalityPosition.y = -Math.cos(angle + Math.PI) * d + (points[0].y + center.y) / 2;
    } else if (position === "end_right") {
        cardinalityPosition.x = Math.sin(angle - Math.PI) * d + (points[0].x + center.x) / 2 - 5;
        cardinalityPosition.y = -Math.cos(angle - Math.PI) * d + (points[0].y + center.y) / 2 - 5;
    } else if (position === "end_left") {
        cardinalityPosition.x = Math.sin(angle) * d + (points[0].x + center.x) / 2 - 5;
        cardinalityPosition.y = -Math.cos(angle) * d + (points[0].y + center.y) / 2 - 5;
    } else {
        cardinalityPosition.x = Math.sin(angle) * d + (points[0].x + center.x) / 2;
        cardinalityPosition.y = -Math.cos(angle) * d + (points[0].y + center.y) / 2;
    }
    return cardinalityPosition;
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(calcTerminalLabelPosition, "calcTerminalLabelPosition");
function getStylesFromArray(arr) {
    let style = "";
    let labelStyle = "";
    for (const element of arr){
        if (element !== void 0) {
            if (element.startsWith("color:") || element.startsWith("text-align:")) {
                labelStyle = labelStyle + element + ";";
            } else {
                style = style + element + ";";
            }
        }
    }
    return {
        style,
        labelStyle
    };
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(getStylesFromArray, "getStylesFromArray");
var cnt = 0;
var generateId = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(()=>{
    cnt++;
    return "id-" + Math.random().toString(36).substr(2, 12) + "-" + cnt;
}, "generateId");
function makeRandomHex(length) {
    let result = "";
    const characters = "0123456789abcdef";
    const charactersLength = characters.length;
    for(let i = 0; i < length; i++){
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(makeRandomHex, "makeRandomHex");
var random = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((options)=>{
    return makeRandomHex(options.length);
}, "random");
var getTextObj = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
    return {
        x: 0,
        y: 0,
        fill: void 0,
        anchor: "start",
        style: "#666",
        width: 100,
        height: 100,
        textMargin: 0,
        rx: 0,
        ry: 0,
        valign: void 0,
        text: ""
    };
}, "getTextObj");
var drawSimpleText = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(elem, textData) {
    const nText = textData.text.replace(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["common_default"].lineBreakRegex, " ");
    const [, _fontSizePx] = parseFontSize(textData.fontSize);
    const textElem = elem.append("text");
    textElem.attr("x", textData.x);
    textElem.attr("y", textData.y);
    textElem.style("text-anchor", textData.anchor);
    textElem.style("font-family", textData.fontFamily);
    textElem.style("font-size", _fontSizePx);
    textElem.style("font-weight", textData.fontWeight);
    textElem.attr("fill", textData.fill);
    if (textData.class !== void 0) {
        textElem.attr("class", textData.class);
    }
    const span = textElem.append("tspan");
    span.attr("x", textData.x + textData.textMargin * 2);
    span.attr("fill", textData.fill);
    span.text(nText);
    return textElem;
}, "drawSimpleText");
var wrapLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lodash$2d$es$40$4$2e$17$2e$23$2f$node_modules$2f$lodash$2d$es$2f$memoize$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])((label, maxWidth, config)=>{
    if (!label) {
        return label;
    }
    config = Object.assign({
        fontSize: 12,
        fontWeight: 400,
        fontFamily: "Arial",
        joinWith: "<br/>"
    }, config);
    if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["common_default"].lineBreakRegex.test(label)) {
        return label;
    }
    const words = label.split(" ").filter(Boolean);
    const completedLines = [];
    let nextLine = "";
    words.forEach((word, index)=>{
        const wordLength = calculateTextWidth(`${word} `, config);
        const nextLineLength = calculateTextWidth(nextLine, config);
        if (wordLength > maxWidth) {
            const { hyphenatedStrings, remainingWord } = breakString(word, maxWidth, "-", config);
            completedLines.push(nextLine, ...hyphenatedStrings);
            nextLine = remainingWord;
        } else if (nextLineLength + wordLength >= maxWidth) {
            completedLines.push(nextLine);
            nextLine = word;
        } else {
            nextLine = [
                nextLine,
                word
            ].filter(Boolean).join(" ");
        }
        const currentWord = index + 1;
        const isLastWord = currentWord === words.length;
        if (isLastWord) {
            completedLines.push(nextLine);
        }
    });
    return completedLines.filter((line)=>line !== "").join(config.joinWith);
}, (label, maxWidth, config)=>`${label}${maxWidth}${config.fontSize}${config.fontWeight}${config.fontFamily}${config.joinWith}`);
var breakString = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lodash$2d$es$40$4$2e$17$2e$23$2f$node_modules$2f$lodash$2d$es$2f$memoize$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])((word, maxWidth, hyphenCharacter = "-", config)=>{
    config = Object.assign({
        fontSize: 12,
        fontWeight: 400,
        fontFamily: "Arial",
        margin: 0
    }, config);
    const characters = [
        ...word
    ];
    const lines = [];
    let currentLine = "";
    characters.forEach((character, index)=>{
        const nextLine = `${currentLine}${character}`;
        const lineWidth = calculateTextWidth(nextLine, config);
        if (lineWidth >= maxWidth) {
            const currentCharacter = index + 1;
            const isLastLine = characters.length === currentCharacter;
            const hyphenatedNextLine = `${nextLine}${hyphenCharacter}`;
            lines.push(isLastLine ? nextLine : hyphenatedNextLine);
            currentLine = "";
        } else {
            currentLine = nextLine;
        }
    });
    return {
        hyphenatedStrings: lines,
        remainingWord: currentLine
    };
}, (word, maxWidth, hyphenCharacter = "-", config)=>`${word}${maxWidth}${hyphenCharacter}${config.fontSize}${config.fontWeight}${config.fontFamily}`);
function calculateTextHeight(text, config) {
    return calculateTextDimensions(text, config).height;
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(calculateTextHeight, "calculateTextHeight");
function calculateTextWidth(text, config) {
    return calculateTextDimensions(text, config).width;
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(calculateTextWidth, "calculateTextWidth");
var calculateTextDimensions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lodash$2d$es$40$4$2e$17$2e$23$2f$node_modules$2f$lodash$2d$es$2f$memoize$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])((text, config)=>{
    const { fontSize = 12, fontFamily = "Arial", fontWeight = 400 } = config;
    if (!text) {
        return {
            width: 0,
            height: 0
        };
    }
    const [, _fontSizePx] = parseFontSize(fontSize);
    const fontFamilies = [
        "sans-serif",
        fontFamily
    ];
    const lines = text.split(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["common_default"].lineBreakRegex);
    const dims = [];
    const body = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$selection$40$3$2e$0$2e$0$2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])("body");
    if (!body.remove) {
        return {
            width: 0,
            height: 0,
            lineHeight: 0
        };
    }
    const g = body.append("svg");
    for (const fontFamily2 of fontFamilies){
        let cHeight = 0;
        const dim = {
            width: 0,
            height: 0,
            lineHeight: 0
        };
        for (const line of lines){
            const textObj = getTextObj();
            textObj.text = line || ZERO_WIDTH_SPACE;
            const textElem = drawSimpleText(g, textObj).style("font-size", _fontSizePx).style("font-weight", fontWeight).style("font-family", fontFamily2);
            const bBox = (textElem._groups || textElem)[0][0].getBBox();
            if (bBox.width === 0 && bBox.height === 0) {
                throw new Error("svg element not in render tree");
            }
            dim.width = Math.round(Math.max(dim.width, bBox.width));
            cHeight = Math.round(bBox.height);
            dim.height += cHeight;
            dim.lineHeight = Math.round(Math.max(dim.lineHeight, cHeight));
        }
        dims.push(dim);
    }
    g.remove();
    const index = isNaN(dims[1].height) || isNaN(dims[1].width) || isNaN(dims[1].lineHeight) || dims[0].height > dims[1].height && dims[0].width > dims[1].width && dims[0].lineHeight > dims[1].lineHeight ? 0 : 1;
    return dims[index];
}, (text, config)=>`${text}${config.fontSize}${config.fontWeight}${config.fontFamily}`);
var InitIDGenerator = class {
    constructor(deterministic = false, seed){
        this.count = 0;
        this.count = seed ? seed.length : 0;
        this.next = deterministic ? ()=>this.count++ : ()=>Date.now();
    }
    static{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(this, "InitIDGenerator");
    }
};
var decoder;
var entityDecode = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(html) {
    decoder = decoder || document.createElement("div");
    html = escape(html).replace(/%26/g, "&").replace(/%23/g, "#").replace(/%3B/g, ";");
    decoder.innerHTML = html;
    return unescape(decoder.textContent);
}, "entityDecode");
function isDetailedError(error) {
    return "str" in error;
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(isDetailedError, "isDetailedError");
var insertTitle = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((parent, cssClass, titleTopMargin, title)=>{
    if (!title) {
        return;
    }
    const bounds = parent.node()?.getBBox();
    if (!bounds) {
        return;
    }
    parent.append("text").text(title).attr("text-anchor", "middle").attr("x", bounds.x + bounds.width / 2).attr("y", -titleTopMargin).attr("class", cssClass);
}, "insertTitle");
var parseFontSize = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((fontSize)=>{
    if (typeof fontSize === "number") {
        return [
            fontSize,
            fontSize + "px"
        ];
    }
    const fontSizeNumber = parseInt(fontSize ?? "", 10);
    if (Number.isNaN(fontSizeNumber)) {
        return [
            void 0,
            void 0
        ];
    } else if (fontSize === String(fontSizeNumber)) {
        return [
            fontSizeNumber,
            fontSize + "px"
        ];
    } else {
        return [
            fontSizeNumber,
            fontSize
        ];
    }
}, "parseFontSize");
function cleanAndMerge(defaultData, data) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lodash$2d$es$40$4$2e$17$2e$23$2f$node_modules$2f$lodash$2d$es$2f$merge$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({}, defaultData, data);
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(cleanAndMerge, "cleanAndMerge");
var utils_default = {
    assignWithDepth: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assignWithDepth_default"],
    wrapLabel,
    calculateTextHeight,
    calculateTextWidth,
    calculateTextDimensions,
    cleanAndMerge,
    detectInit,
    detectDirective,
    isSubstringInArray,
    interpolateToCurve,
    calcLabelPosition,
    calcCardinalityPosition,
    calcTerminalLabelPosition,
    formatUrl,
    getStylesFromArray,
    generateId,
    random,
    runFunc,
    entityDecode,
    insertTitle,
    isLabelCoordinateInPath,
    parseFontSize,
    InitIDGenerator
};
var encodeEntities = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(text) {
    let txt = text;
    txt = txt.replace(/style.*:\S*#.*;/g, function(s) {
        return s.substring(0, s.length - 1);
    });
    txt = txt.replace(/classDef.*:\S*#.*;/g, function(s) {
        return s.substring(0, s.length - 1);
    });
    txt = txt.replace(/#\w+;/g, function(s) {
        const innerTxt = s.substring(1, s.length - 1);
        const isInt = /^\+?\d+$/.test(innerTxt);
        if (isInt) {
            return "\uFB02\xB0\xB0" + innerTxt + "\xB6\xDF";
        } else {
            return "\uFB02\xB0" + innerTxt + "\xB6\xDF";
        }
    });
    return txt;
}, "encodeEntities");
var decodeEntities = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(text) {
    return text.replace(/ﬂ°°/g, "&#").replace(/ﬂ°/g, "&").replace(/¶ß/g, ";");
}, "decodeEntities");
var getEdgeId = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((from, to, { counter = 0, prefix, suffix }, id)=>{
    if (id) {
        return id;
    }
    return `${prefix ? `${prefix}_` : ""}${from}_${to}_${counter}${suffix ? `_${suffix}` : ""}`;
}, "getEdgeId");
function handleUndefinedAttr(attrValue) {
    return attrValue ?? null;
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(handleUndefinedAttr, "handleUndefinedAttr");
function isLabelCoordinateInPath(point, dAttr) {
    const roundedX = Math.round(point.x);
    const roundedY = Math.round(point.y);
    const sanitizedD = dAttr.replace(/(\d+\.\d+)/g, (match)=>Math.round(parseFloat(match)).toString());
    return sanitizedD.includes(roundedX.toString()) || sanitizedD.includes(roundedY.toString());
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(isLabelCoordinateInPath, "isLabelCoordinateInPath");
;
}),
"[project]/node_modules/.pnpm/mermaid@11.13.0/node_modules/mermaid/dist/chunks/mermaid.core/c4Diagram-IC4MRINW.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "diagram",
    ()=>diagram
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$JSJVCQXG$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/mermaid@11.13.0/node_modules/mermaid/dist/chunks/mermaid.core/chunk-JSJVCQXG.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$GEFDOKGD$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/mermaid@11.13.0/node_modules/mermaid/dist/chunks/mermaid.core/chunk-GEFDOKGD.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/mermaid@11.13.0/node_modules/mermaid/dist/chunks/mermaid.core/chunk-7R4GIKGN.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/mermaid@11.13.0/node_modules/mermaid/dist/chunks/mermaid.core/chunk-AGHRB4JF.mjs [app-ssr] (ecmascript)");
// src/diagrams/c4/c4Renderer.js
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$40$7$2e$9$2e$0$2f$node_modules$2f$d3$2f$src$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3@7.9.0/node_modules/d3/src/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$selection$40$3$2e$0$2e$0$2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/select.js [app-ssr] (ecmascript) <export default as select>");
// src/diagrams/c4/svgDraw.js
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$braintree$2b$sanitize$2d$url$40$7$2e$1$2e$2$2f$node_modules$2f40$braintree$2f$sanitize$2d$url$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@braintree+sanitize-url@7.1.2/node_modules/@braintree/sanitize-url/dist/index.js [app-ssr] (ecmascript)");
;
;
;
;
// src/diagrams/c4/parser/c4Diagram.jison
var parser = function() {
    var o = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(k, v, o2, l) {
        for(o2 = o2 || {}, l = k.length; l--; o2[k[l]] = v);
        return o2;
    }, "o"), $V0 = [
        1,
        24
    ], $V1 = [
        1,
        25
    ], $V2 = [
        1,
        26
    ], $V3 = [
        1,
        27
    ], $V4 = [
        1,
        28
    ], $V5 = [
        1,
        63
    ], $V6 = [
        1,
        64
    ], $V7 = [
        1,
        65
    ], $V8 = [
        1,
        66
    ], $V9 = [
        1,
        67
    ], $Va = [
        1,
        68
    ], $Vb = [
        1,
        69
    ], $Vc = [
        1,
        29
    ], $Vd = [
        1,
        30
    ], $Ve = [
        1,
        31
    ], $Vf = [
        1,
        32
    ], $Vg = [
        1,
        33
    ], $Vh = [
        1,
        34
    ], $Vi = [
        1,
        35
    ], $Vj = [
        1,
        36
    ], $Vk = [
        1,
        37
    ], $Vl = [
        1,
        38
    ], $Vm = [
        1,
        39
    ], $Vn = [
        1,
        40
    ], $Vo = [
        1,
        41
    ], $Vp = [
        1,
        42
    ], $Vq = [
        1,
        43
    ], $Vr = [
        1,
        44
    ], $Vs = [
        1,
        45
    ], $Vt = [
        1,
        46
    ], $Vu = [
        1,
        47
    ], $Vv = [
        1,
        48
    ], $Vw = [
        1,
        50
    ], $Vx = [
        1,
        51
    ], $Vy = [
        1,
        52
    ], $Vz = [
        1,
        53
    ], $VA = [
        1,
        54
    ], $VB = [
        1,
        55
    ], $VC = [
        1,
        56
    ], $VD = [
        1,
        57
    ], $VE = [
        1,
        58
    ], $VF = [
        1,
        59
    ], $VG = [
        1,
        60
    ], $VH = [
        14,
        42
    ], $VI = [
        14,
        34,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        62,
        63,
        64,
        65,
        66,
        67,
        68,
        69,
        70,
        71,
        72,
        73,
        74
    ], $VJ = [
        12,
        14,
        34,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        62,
        63,
        64,
        65,
        66,
        67,
        68,
        69,
        70,
        71,
        72,
        73,
        74
    ], $VK = [
        1,
        82
    ], $VL = [
        1,
        83
    ], $VM = [
        1,
        84
    ], $VN = [
        1,
        85
    ], $VO = [
        12,
        14,
        42
    ], $VP = [
        12,
        14,
        33,
        42
    ], $VQ = [
        12,
        14,
        33,
        42,
        76,
        77,
        79,
        80
    ], $VR = [
        12,
        33
    ], $VS = [
        34,
        36,
        37,
        38,
        39,
        40,
        41,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        62,
        63,
        64,
        65,
        66,
        67,
        68,
        69,
        70,
        71,
        72,
        73,
        74
    ];
    var parser2 = {
        trace: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function trace() {}, "trace"),
        yy: {},
        symbols_: {
            "error": 2,
            "start": 3,
            "mermaidDoc": 4,
            "direction": 5,
            "direction_tb": 6,
            "direction_bt": 7,
            "direction_rl": 8,
            "direction_lr": 9,
            "graphConfig": 10,
            "C4_CONTEXT": 11,
            "NEWLINE": 12,
            "statements": 13,
            "EOF": 14,
            "C4_CONTAINER": 15,
            "C4_COMPONENT": 16,
            "C4_DYNAMIC": 17,
            "C4_DEPLOYMENT": 18,
            "otherStatements": 19,
            "diagramStatements": 20,
            "otherStatement": 21,
            "title": 22,
            "accDescription": 23,
            "acc_title": 24,
            "acc_title_value": 25,
            "acc_descr": 26,
            "acc_descr_value": 27,
            "acc_descr_multiline_value": 28,
            "boundaryStatement": 29,
            "boundaryStartStatement": 30,
            "boundaryStopStatement": 31,
            "boundaryStart": 32,
            "LBRACE": 33,
            "ENTERPRISE_BOUNDARY": 34,
            "attributes": 35,
            "SYSTEM_BOUNDARY": 36,
            "BOUNDARY": 37,
            "CONTAINER_BOUNDARY": 38,
            "NODE": 39,
            "NODE_L": 40,
            "NODE_R": 41,
            "RBRACE": 42,
            "diagramStatement": 43,
            "PERSON": 44,
            "PERSON_EXT": 45,
            "SYSTEM": 46,
            "SYSTEM_DB": 47,
            "SYSTEM_QUEUE": 48,
            "SYSTEM_EXT": 49,
            "SYSTEM_EXT_DB": 50,
            "SYSTEM_EXT_QUEUE": 51,
            "CONTAINER": 52,
            "CONTAINER_DB": 53,
            "CONTAINER_QUEUE": 54,
            "CONTAINER_EXT": 55,
            "CONTAINER_EXT_DB": 56,
            "CONTAINER_EXT_QUEUE": 57,
            "COMPONENT": 58,
            "COMPONENT_DB": 59,
            "COMPONENT_QUEUE": 60,
            "COMPONENT_EXT": 61,
            "COMPONENT_EXT_DB": 62,
            "COMPONENT_EXT_QUEUE": 63,
            "REL": 64,
            "BIREL": 65,
            "REL_U": 66,
            "REL_D": 67,
            "REL_L": 68,
            "REL_R": 69,
            "REL_B": 70,
            "REL_INDEX": 71,
            "UPDATE_EL_STYLE": 72,
            "UPDATE_REL_STYLE": 73,
            "UPDATE_LAYOUT_CONFIG": 74,
            "attribute": 75,
            "STR": 76,
            "STR_KEY": 77,
            "STR_VALUE": 78,
            "ATTRIBUTE": 79,
            "ATTRIBUTE_EMPTY": 80,
            "$accept": 0,
            "$end": 1
        },
        terminals_: {
            2: "error",
            6: "direction_tb",
            7: "direction_bt",
            8: "direction_rl",
            9: "direction_lr",
            11: "C4_CONTEXT",
            12: "NEWLINE",
            14: "EOF",
            15: "C4_CONTAINER",
            16: "C4_COMPONENT",
            17: "C4_DYNAMIC",
            18: "C4_DEPLOYMENT",
            22: "title",
            23: "accDescription",
            24: "acc_title",
            25: "acc_title_value",
            26: "acc_descr",
            27: "acc_descr_value",
            28: "acc_descr_multiline_value",
            33: "LBRACE",
            34: "ENTERPRISE_BOUNDARY",
            36: "SYSTEM_BOUNDARY",
            37: "BOUNDARY",
            38: "CONTAINER_BOUNDARY",
            39: "NODE",
            40: "NODE_L",
            41: "NODE_R",
            42: "RBRACE",
            44: "PERSON",
            45: "PERSON_EXT",
            46: "SYSTEM",
            47: "SYSTEM_DB",
            48: "SYSTEM_QUEUE",
            49: "SYSTEM_EXT",
            50: "SYSTEM_EXT_DB",
            51: "SYSTEM_EXT_QUEUE",
            52: "CONTAINER",
            53: "CONTAINER_DB",
            54: "CONTAINER_QUEUE",
            55: "CONTAINER_EXT",
            56: "CONTAINER_EXT_DB",
            57: "CONTAINER_EXT_QUEUE",
            58: "COMPONENT",
            59: "COMPONENT_DB",
            60: "COMPONENT_QUEUE",
            61: "COMPONENT_EXT",
            62: "COMPONENT_EXT_DB",
            63: "COMPONENT_EXT_QUEUE",
            64: "REL",
            65: "BIREL",
            66: "REL_U",
            67: "REL_D",
            68: "REL_L",
            69: "REL_R",
            70: "REL_B",
            71: "REL_INDEX",
            72: "UPDATE_EL_STYLE",
            73: "UPDATE_REL_STYLE",
            74: "UPDATE_LAYOUT_CONFIG",
            76: "STR",
            77: "STR_KEY",
            78: "STR_VALUE",
            79: "ATTRIBUTE",
            80: "ATTRIBUTE_EMPTY"
        },
        productions_: [
            0,
            [
                3,
                1
            ],
            [
                3,
                1
            ],
            [
                5,
                1
            ],
            [
                5,
                1
            ],
            [
                5,
                1
            ],
            [
                5,
                1
            ],
            [
                4,
                1
            ],
            [
                10,
                4
            ],
            [
                10,
                4
            ],
            [
                10,
                4
            ],
            [
                10,
                4
            ],
            [
                10,
                4
            ],
            [
                13,
                1
            ],
            [
                13,
                1
            ],
            [
                13,
                2
            ],
            [
                19,
                1
            ],
            [
                19,
                2
            ],
            [
                19,
                3
            ],
            [
                21,
                1
            ],
            [
                21,
                1
            ],
            [
                21,
                2
            ],
            [
                21,
                2
            ],
            [
                21,
                1
            ],
            [
                29,
                3
            ],
            [
                30,
                3
            ],
            [
                30,
                3
            ],
            [
                30,
                4
            ],
            [
                32,
                2
            ],
            [
                32,
                2
            ],
            [
                32,
                2
            ],
            [
                32,
                2
            ],
            [
                32,
                2
            ],
            [
                32,
                2
            ],
            [
                32,
                2
            ],
            [
                31,
                1
            ],
            [
                20,
                1
            ],
            [
                20,
                2
            ],
            [
                20,
                3
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                1
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                43,
                2
            ],
            [
                35,
                1
            ],
            [
                35,
                2
            ],
            [
                75,
                1
            ],
            [
                75,
                2
            ],
            [
                75,
                1
            ],
            [
                75,
                1
            ]
        ],
        performAction: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
            var $0 = $$.length - 1;
            switch(yystate){
                case 3:
                    yy.setDirection("TB");
                    break;
                case 4:
                    yy.setDirection("BT");
                    break;
                case 5:
                    yy.setDirection("RL");
                    break;
                case 6:
                    yy.setDirection("LR");
                    break;
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                    yy.setC4Type($$[$0 - 3]);
                    break;
                case 19:
                    yy.setTitle($$[$0].substring(6));
                    this.$ = $$[$0].substring(6);
                    break;
                case 20:
                    yy.setAccDescription($$[$0].substring(15));
                    this.$ = $$[$0].substring(15);
                    break;
                case 21:
                    this.$ = $$[$0].trim();
                    yy.setTitle(this.$);
                    break;
                case 22:
                case 23:
                    this.$ = $$[$0].trim();
                    yy.setAccDescription(this.$);
                    break;
                case 28:
                    $$[$0].splice(2, 0, "ENTERPRISE");
                    yy.addPersonOrSystemBoundary(...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 29:
                    $$[$0].splice(2, 0, "SYSTEM");
                    yy.addPersonOrSystemBoundary(...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 30:
                    yy.addPersonOrSystemBoundary(...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 31:
                    $$[$0].splice(2, 0, "CONTAINER");
                    yy.addContainerBoundary(...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 32:
                    yy.addDeploymentNode("node", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 33:
                    yy.addDeploymentNode("nodeL", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 34:
                    yy.addDeploymentNode("nodeR", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 35:
                    yy.popBoundaryParseStack();
                    break;
                case 39:
                    yy.addPersonOrSystem("person", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 40:
                    yy.addPersonOrSystem("external_person", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 41:
                    yy.addPersonOrSystem("system", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 42:
                    yy.addPersonOrSystem("system_db", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 43:
                    yy.addPersonOrSystem("system_queue", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 44:
                    yy.addPersonOrSystem("external_system", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 45:
                    yy.addPersonOrSystem("external_system_db", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 46:
                    yy.addPersonOrSystem("external_system_queue", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 47:
                    yy.addContainer("container", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 48:
                    yy.addContainer("container_db", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 49:
                    yy.addContainer("container_queue", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 50:
                    yy.addContainer("external_container", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 51:
                    yy.addContainer("external_container_db", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 52:
                    yy.addContainer("external_container_queue", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 53:
                    yy.addComponent("component", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 54:
                    yy.addComponent("component_db", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 55:
                    yy.addComponent("component_queue", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 56:
                    yy.addComponent("external_component", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 57:
                    yy.addComponent("external_component_db", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 58:
                    yy.addComponent("external_component_queue", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 60:
                    yy.addRel("rel", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 61:
                    yy.addRel("birel", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 62:
                    yy.addRel("rel_u", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 63:
                    yy.addRel("rel_d", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 64:
                    yy.addRel("rel_l", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 65:
                    yy.addRel("rel_r", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 66:
                    yy.addRel("rel_b", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 67:
                    $$[$0].splice(0, 1);
                    yy.addRel("rel", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 68:
                    yy.updateElStyle("update_el_style", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 69:
                    yy.updateRelStyle("update_rel_style", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 70:
                    yy.updateLayoutConfig("update_layout_config", ...$$[$0]);
                    this.$ = $$[$0];
                    break;
                case 71:
                    this.$ = [
                        $$[$0]
                    ];
                    break;
                case 72:
                    $$[$0].unshift($$[$0 - 1]);
                    this.$ = $$[$0];
                    break;
                case 73:
                case 75:
                    this.$ = $$[$0].trim();
                    break;
                case 74:
                    let kv = {};
                    kv[$$[$0 - 1].trim()] = $$[$0].trim();
                    this.$ = kv;
                    break;
                case 76:
                    this.$ = "";
                    break;
            }
        }, "anonymous"),
        table: [
            {
                3: 1,
                4: 2,
                5: 3,
                6: [
                    1,
                    5
                ],
                7: [
                    1,
                    6
                ],
                8: [
                    1,
                    7
                ],
                9: [
                    1,
                    8
                ],
                10: 4,
                11: [
                    1,
                    9
                ],
                15: [
                    1,
                    10
                ],
                16: [
                    1,
                    11
                ],
                17: [
                    1,
                    12
                ],
                18: [
                    1,
                    13
                ]
            },
            {
                1: [
                    3
                ]
            },
            {
                1: [
                    2,
                    1
                ]
            },
            {
                1: [
                    2,
                    2
                ]
            },
            {
                1: [
                    2,
                    7
                ]
            },
            {
                1: [
                    2,
                    3
                ]
            },
            {
                1: [
                    2,
                    4
                ]
            },
            {
                1: [
                    2,
                    5
                ]
            },
            {
                1: [
                    2,
                    6
                ]
            },
            {
                12: [
                    1,
                    14
                ]
            },
            {
                12: [
                    1,
                    15
                ]
            },
            {
                12: [
                    1,
                    16
                ]
            },
            {
                12: [
                    1,
                    17
                ]
            },
            {
                12: [
                    1,
                    18
                ]
            },
            {
                13: 19,
                19: 20,
                20: 21,
                21: 22,
                22: $V0,
                23: $V1,
                24: $V2,
                26: $V3,
                28: $V4,
                29: 49,
                30: 61,
                32: 62,
                34: $V5,
                36: $V6,
                37: $V7,
                38: $V8,
                39: $V9,
                40: $Va,
                41: $Vb,
                43: 23,
                44: $Vc,
                45: $Vd,
                46: $Ve,
                47: $Vf,
                48: $Vg,
                49: $Vh,
                50: $Vi,
                51: $Vj,
                52: $Vk,
                53: $Vl,
                54: $Vm,
                55: $Vn,
                56: $Vo,
                57: $Vp,
                58: $Vq,
                59: $Vr,
                60: $Vs,
                61: $Vt,
                62: $Vu,
                63: $Vv,
                64: $Vw,
                65: $Vx,
                66: $Vy,
                67: $Vz,
                68: $VA,
                69: $VB,
                70: $VC,
                71: $VD,
                72: $VE,
                73: $VF,
                74: $VG
            },
            {
                13: 70,
                19: 20,
                20: 21,
                21: 22,
                22: $V0,
                23: $V1,
                24: $V2,
                26: $V3,
                28: $V4,
                29: 49,
                30: 61,
                32: 62,
                34: $V5,
                36: $V6,
                37: $V7,
                38: $V8,
                39: $V9,
                40: $Va,
                41: $Vb,
                43: 23,
                44: $Vc,
                45: $Vd,
                46: $Ve,
                47: $Vf,
                48: $Vg,
                49: $Vh,
                50: $Vi,
                51: $Vj,
                52: $Vk,
                53: $Vl,
                54: $Vm,
                55: $Vn,
                56: $Vo,
                57: $Vp,
                58: $Vq,
                59: $Vr,
                60: $Vs,
                61: $Vt,
                62: $Vu,
                63: $Vv,
                64: $Vw,
                65: $Vx,
                66: $Vy,
                67: $Vz,
                68: $VA,
                69: $VB,
                70: $VC,
                71: $VD,
                72: $VE,
                73: $VF,
                74: $VG
            },
            {
                13: 71,
                19: 20,
                20: 21,
                21: 22,
                22: $V0,
                23: $V1,
                24: $V2,
                26: $V3,
                28: $V4,
                29: 49,
                30: 61,
                32: 62,
                34: $V5,
                36: $V6,
                37: $V7,
                38: $V8,
                39: $V9,
                40: $Va,
                41: $Vb,
                43: 23,
                44: $Vc,
                45: $Vd,
                46: $Ve,
                47: $Vf,
                48: $Vg,
                49: $Vh,
                50: $Vi,
                51: $Vj,
                52: $Vk,
                53: $Vl,
                54: $Vm,
                55: $Vn,
                56: $Vo,
                57: $Vp,
                58: $Vq,
                59: $Vr,
                60: $Vs,
                61: $Vt,
                62: $Vu,
                63: $Vv,
                64: $Vw,
                65: $Vx,
                66: $Vy,
                67: $Vz,
                68: $VA,
                69: $VB,
                70: $VC,
                71: $VD,
                72: $VE,
                73: $VF,
                74: $VG
            },
            {
                13: 72,
                19: 20,
                20: 21,
                21: 22,
                22: $V0,
                23: $V1,
                24: $V2,
                26: $V3,
                28: $V4,
                29: 49,
                30: 61,
                32: 62,
                34: $V5,
                36: $V6,
                37: $V7,
                38: $V8,
                39: $V9,
                40: $Va,
                41: $Vb,
                43: 23,
                44: $Vc,
                45: $Vd,
                46: $Ve,
                47: $Vf,
                48: $Vg,
                49: $Vh,
                50: $Vi,
                51: $Vj,
                52: $Vk,
                53: $Vl,
                54: $Vm,
                55: $Vn,
                56: $Vo,
                57: $Vp,
                58: $Vq,
                59: $Vr,
                60: $Vs,
                61: $Vt,
                62: $Vu,
                63: $Vv,
                64: $Vw,
                65: $Vx,
                66: $Vy,
                67: $Vz,
                68: $VA,
                69: $VB,
                70: $VC,
                71: $VD,
                72: $VE,
                73: $VF,
                74: $VG
            },
            {
                13: 73,
                19: 20,
                20: 21,
                21: 22,
                22: $V0,
                23: $V1,
                24: $V2,
                26: $V3,
                28: $V4,
                29: 49,
                30: 61,
                32: 62,
                34: $V5,
                36: $V6,
                37: $V7,
                38: $V8,
                39: $V9,
                40: $Va,
                41: $Vb,
                43: 23,
                44: $Vc,
                45: $Vd,
                46: $Ve,
                47: $Vf,
                48: $Vg,
                49: $Vh,
                50: $Vi,
                51: $Vj,
                52: $Vk,
                53: $Vl,
                54: $Vm,
                55: $Vn,
                56: $Vo,
                57: $Vp,
                58: $Vq,
                59: $Vr,
                60: $Vs,
                61: $Vt,
                62: $Vu,
                63: $Vv,
                64: $Vw,
                65: $Vx,
                66: $Vy,
                67: $Vz,
                68: $VA,
                69: $VB,
                70: $VC,
                71: $VD,
                72: $VE,
                73: $VF,
                74: $VG
            },
            {
                14: [
                    1,
                    74
                ]
            },
            o($VH, [
                2,
                13
            ], {
                43: 23,
                29: 49,
                30: 61,
                32: 62,
                20: 75,
                34: $V5,
                36: $V6,
                37: $V7,
                38: $V8,
                39: $V9,
                40: $Va,
                41: $Vb,
                44: $Vc,
                45: $Vd,
                46: $Ve,
                47: $Vf,
                48: $Vg,
                49: $Vh,
                50: $Vi,
                51: $Vj,
                52: $Vk,
                53: $Vl,
                54: $Vm,
                55: $Vn,
                56: $Vo,
                57: $Vp,
                58: $Vq,
                59: $Vr,
                60: $Vs,
                61: $Vt,
                62: $Vu,
                63: $Vv,
                64: $Vw,
                65: $Vx,
                66: $Vy,
                67: $Vz,
                68: $VA,
                69: $VB,
                70: $VC,
                71: $VD,
                72: $VE,
                73: $VF,
                74: $VG
            }),
            o($VH, [
                2,
                14
            ]),
            o($VI, [
                2,
                16
            ], {
                12: [
                    1,
                    76
                ]
            }),
            o($VH, [
                2,
                36
            ], {
                12: [
                    1,
                    77
                ]
            }),
            o($VJ, [
                2,
                19
            ]),
            o($VJ, [
                2,
                20
            ]),
            {
                25: [
                    1,
                    78
                ]
            },
            {
                27: [
                    1,
                    79
                ]
            },
            o($VJ, [
                2,
                23
            ]),
            {
                35: 80,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 86,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 87,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 88,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 89,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 90,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 91,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 92,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 93,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 94,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 95,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 96,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 97,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 98,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 99,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 100,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 101,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 102,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 103,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 104,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            o($VO, [
                2,
                59
            ]),
            {
                35: 105,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 106,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 107,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 108,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 109,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 110,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 111,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 112,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 113,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 114,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 115,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                20: 116,
                29: 49,
                30: 61,
                32: 62,
                34: $V5,
                36: $V6,
                37: $V7,
                38: $V8,
                39: $V9,
                40: $Va,
                41: $Vb,
                43: 23,
                44: $Vc,
                45: $Vd,
                46: $Ve,
                47: $Vf,
                48: $Vg,
                49: $Vh,
                50: $Vi,
                51: $Vj,
                52: $Vk,
                53: $Vl,
                54: $Vm,
                55: $Vn,
                56: $Vo,
                57: $Vp,
                58: $Vq,
                59: $Vr,
                60: $Vs,
                61: $Vt,
                62: $Vu,
                63: $Vv,
                64: $Vw,
                65: $Vx,
                66: $Vy,
                67: $Vz,
                68: $VA,
                69: $VB,
                70: $VC,
                71: $VD,
                72: $VE,
                73: $VF,
                74: $VG
            },
            {
                12: [
                    1,
                    118
                ],
                33: [
                    1,
                    117
                ]
            },
            {
                35: 119,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 120,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 121,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 122,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 123,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 124,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                35: 125,
                75: 81,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            },
            {
                14: [
                    1,
                    126
                ]
            },
            {
                14: [
                    1,
                    127
                ]
            },
            {
                14: [
                    1,
                    128
                ]
            },
            {
                14: [
                    1,
                    129
                ]
            },
            {
                1: [
                    2,
                    8
                ]
            },
            o($VH, [
                2,
                15
            ]),
            o($VI, [
                2,
                17
            ], {
                21: 22,
                19: 130,
                22: $V0,
                23: $V1,
                24: $V2,
                26: $V3,
                28: $V4
            }),
            o($VH, [
                2,
                37
            ], {
                19: 20,
                20: 21,
                21: 22,
                43: 23,
                29: 49,
                30: 61,
                32: 62,
                13: 131,
                22: $V0,
                23: $V1,
                24: $V2,
                26: $V3,
                28: $V4,
                34: $V5,
                36: $V6,
                37: $V7,
                38: $V8,
                39: $V9,
                40: $Va,
                41: $Vb,
                44: $Vc,
                45: $Vd,
                46: $Ve,
                47: $Vf,
                48: $Vg,
                49: $Vh,
                50: $Vi,
                51: $Vj,
                52: $Vk,
                53: $Vl,
                54: $Vm,
                55: $Vn,
                56: $Vo,
                57: $Vp,
                58: $Vq,
                59: $Vr,
                60: $Vs,
                61: $Vt,
                62: $Vu,
                63: $Vv,
                64: $Vw,
                65: $Vx,
                66: $Vy,
                67: $Vz,
                68: $VA,
                69: $VB,
                70: $VC,
                71: $VD,
                72: $VE,
                73: $VF,
                74: $VG
            }),
            o($VJ, [
                2,
                21
            ]),
            o($VJ, [
                2,
                22
            ]),
            o($VO, [
                2,
                39
            ]),
            o($VP, [
                2,
                71
            ], {
                75: 81,
                35: 132,
                76: $VK,
                77: $VL,
                79: $VM,
                80: $VN
            }),
            o($VQ, [
                2,
                73
            ]),
            {
                78: [
                    1,
                    133
                ]
            },
            o($VQ, [
                2,
                75
            ]),
            o($VQ, [
                2,
                76
            ]),
            o($VO, [
                2,
                40
            ]),
            o($VO, [
                2,
                41
            ]),
            o($VO, [
                2,
                42
            ]),
            o($VO, [
                2,
                43
            ]),
            o($VO, [
                2,
                44
            ]),
            o($VO, [
                2,
                45
            ]),
            o($VO, [
                2,
                46
            ]),
            o($VO, [
                2,
                47
            ]),
            o($VO, [
                2,
                48
            ]),
            o($VO, [
                2,
                49
            ]),
            o($VO, [
                2,
                50
            ]),
            o($VO, [
                2,
                51
            ]),
            o($VO, [
                2,
                52
            ]),
            o($VO, [
                2,
                53
            ]),
            o($VO, [
                2,
                54
            ]),
            o($VO, [
                2,
                55
            ]),
            o($VO, [
                2,
                56
            ]),
            o($VO, [
                2,
                57
            ]),
            o($VO, [
                2,
                58
            ]),
            o($VO, [
                2,
                60
            ]),
            o($VO, [
                2,
                61
            ]),
            o($VO, [
                2,
                62
            ]),
            o($VO, [
                2,
                63
            ]),
            o($VO, [
                2,
                64
            ]),
            o($VO, [
                2,
                65
            ]),
            o($VO, [
                2,
                66
            ]),
            o($VO, [
                2,
                67
            ]),
            o($VO, [
                2,
                68
            ]),
            o($VO, [
                2,
                69
            ]),
            o($VO, [
                2,
                70
            ]),
            {
                31: 134,
                42: [
                    1,
                    135
                ]
            },
            {
                12: [
                    1,
                    136
                ]
            },
            {
                33: [
                    1,
                    137
                ]
            },
            o($VR, [
                2,
                28
            ]),
            o($VR, [
                2,
                29
            ]),
            o($VR, [
                2,
                30
            ]),
            o($VR, [
                2,
                31
            ]),
            o($VR, [
                2,
                32
            ]),
            o($VR, [
                2,
                33
            ]),
            o($VR, [
                2,
                34
            ]),
            {
                1: [
                    2,
                    9
                ]
            },
            {
                1: [
                    2,
                    10
                ]
            },
            {
                1: [
                    2,
                    11
                ]
            },
            {
                1: [
                    2,
                    12
                ]
            },
            o($VI, [
                2,
                18
            ]),
            o($VH, [
                2,
                38
            ]),
            o($VP, [
                2,
                72
            ]),
            o($VQ, [
                2,
                74
            ]),
            o($VO, [
                2,
                24
            ]),
            o($VO, [
                2,
                35
            ]),
            o($VS, [
                2,
                25
            ]),
            o($VS, [
                2,
                26
            ], {
                12: [
                    1,
                    138
                ]
            }),
            o($VS, [
                2,
                27
            ])
        ],
        defaultActions: {
            2: [
                2,
                1
            ],
            3: [
                2,
                2
            ],
            4: [
                2,
                7
            ],
            5: [
                2,
                3
            ],
            6: [
                2,
                4
            ],
            7: [
                2,
                5
            ],
            8: [
                2,
                6
            ],
            74: [
                2,
                8
            ],
            126: [
                2,
                9
            ],
            127: [
                2,
                10
            ],
            128: [
                2,
                11
            ],
            129: [
                2,
                12
            ]
        },
        parseError: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function parseError(str, hash) {
            if (hash.recoverable) {
                this.trace(str);
            } else {
                var error = new Error(str);
                error.hash = hash;
                throw error;
            }
        }, "parseError"),
        parse: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function parse(input) {
            var self = this, stack = [
                0
            ], tstack = [], vstack = [
                null
            ], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
            var args = lstack.slice.call(arguments, 1);
            var lexer2 = Object.create(this.lexer);
            var sharedState = {
                yy: {}
            };
            for(var k in this.yy){
                if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
                    sharedState.yy[k] = this.yy[k];
                }
            }
            lexer2.setInput(input, sharedState.yy);
            sharedState.yy.lexer = lexer2;
            sharedState.yy.parser = this;
            if (typeof lexer2.yylloc == "undefined") {
                lexer2.yylloc = {};
            }
            var yyloc = lexer2.yylloc;
            lstack.push(yyloc);
            var ranges = lexer2.options && lexer2.options.ranges;
            if (typeof sharedState.yy.parseError === "function") {
                this.parseError = sharedState.yy.parseError;
            } else {
                this.parseError = Object.getPrototypeOf(this).parseError;
            }
            function popStack(n) {
                stack.length = stack.length - 2 * n;
                vstack.length = vstack.length - n;
                lstack.length = lstack.length - n;
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(popStack, "popStack");
            function lex() {
                var token;
                token = tstack.pop() || lexer2.lex() || EOF;
                if (typeof token !== "number") {
                    if (token instanceof Array) {
                        tstack = token;
                        token = tstack.pop();
                    }
                    token = self.symbols_[token] || token;
                }
                return token;
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(lex, "lex");
            var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
            while(true){
                state = stack[stack.length - 1];
                if (this.defaultActions[state]) {
                    action = this.defaultActions[state];
                } else {
                    if (symbol === null || typeof symbol == "undefined") {
                        symbol = lex();
                    }
                    action = table[state] && table[state][symbol];
                }
                if (typeof action === "undefined" || !action.length || !action[0]) {
                    var errStr = "";
                    expected = [];
                    for(p in table[state]){
                        if (this.terminals_[p] && p > TERROR) {
                            expected.push("'" + this.terminals_[p] + "'");
                        }
                    }
                    if (lexer2.showPosition) {
                        errStr = "Parse error on line " + (yylineno + 1) + ":\n" + lexer2.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                    } else {
                        errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == EOF ? "end of input" : "'" + (this.terminals_[symbol] || symbol) + "'");
                    }
                    this.parseError(errStr, {
                        text: lexer2.match,
                        token: this.terminals_[symbol] || symbol,
                        line: lexer2.yylineno,
                        loc: yyloc,
                        expected
                    });
                }
                if (action[0] instanceof Array && action.length > 1) {
                    throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
                }
                switch(action[0]){
                    case 1:
                        stack.push(symbol);
                        vstack.push(lexer2.yytext);
                        lstack.push(lexer2.yylloc);
                        stack.push(action[1]);
                        symbol = null;
                        if (!preErrorSymbol) {
                            yyleng = lexer2.yyleng;
                            yytext = lexer2.yytext;
                            yylineno = lexer2.yylineno;
                            yyloc = lexer2.yylloc;
                            if (recovering > 0) {
                                recovering--;
                            }
                        } else {
                            symbol = preErrorSymbol;
                            preErrorSymbol = null;
                        }
                        break;
                    case 2:
                        len = this.productions_[action[1]][1];
                        yyval.$ = vstack[vstack.length - len];
                        yyval._$ = {
                            first_line: lstack[lstack.length - (len || 1)].first_line,
                            last_line: lstack[lstack.length - 1].last_line,
                            first_column: lstack[lstack.length - (len || 1)].first_column,
                            last_column: lstack[lstack.length - 1].last_column
                        };
                        if (ranges) {
                            yyval._$.range = [
                                lstack[lstack.length - (len || 1)].range[0],
                                lstack[lstack.length - 1].range[1]
                            ];
                        }
                        r = this.performAction.apply(yyval, [
                            yytext,
                            yyleng,
                            yylineno,
                            sharedState.yy,
                            action[1],
                            vstack,
                            lstack
                        ].concat(args));
                        if (typeof r !== "undefined") {
                            return r;
                        }
                        if (len) {
                            stack = stack.slice(0, -1 * len * 2);
                            vstack = vstack.slice(0, -1 * len);
                            lstack = lstack.slice(0, -1 * len);
                        }
                        stack.push(this.productions_[action[1]][0]);
                        vstack.push(yyval.$);
                        lstack.push(yyval._$);
                        newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
                        stack.push(newState);
                        break;
                    case 3:
                        return true;
                }
            }
            return true;
        }, "parse")
    };
    var lexer = /* @__PURE__ */ function() {
        var lexer2 = {
            EOF: 1,
            parseError: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function parseError(str, hash) {
                if (this.yy.parser) {
                    this.yy.parser.parseError(str, hash);
                } else {
                    throw new Error(str);
                }
            }, "parseError"),
            // resets the lexer, sets new input
            setInput: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(input, yy) {
                this.yy = yy || this.yy || {};
                this._input = input;
                this._more = this._backtrack = this.done = false;
                this.yylineno = this.yyleng = 0;
                this.yytext = this.matched = this.match = "";
                this.conditionStack = [
                    "INITIAL"
                ];
                this.yylloc = {
                    first_line: 1,
                    first_column: 0,
                    last_line: 1,
                    last_column: 0
                };
                if (this.options.ranges) {
                    this.yylloc.range = [
                        0,
                        0
                    ];
                }
                this.offset = 0;
                return this;
            }, "setInput"),
            // consumes and returns one char from the input
            input: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
                var ch = this._input[0];
                this.yytext += ch;
                this.yyleng++;
                this.offset++;
                this.match += ch;
                this.matched += ch;
                var lines = ch.match(/(?:\r\n?|\n).*/g);
                if (lines) {
                    this.yylineno++;
                    this.yylloc.last_line++;
                } else {
                    this.yylloc.last_column++;
                }
                if (this.options.ranges) {
                    this.yylloc.range[1]++;
                }
                this._input = this._input.slice(1);
                return ch;
            }, "input"),
            // unshifts one char (or a string) into the input
            unput: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(ch) {
                var len = ch.length;
                var lines = ch.split(/(?:\r\n?|\n)/g);
                this._input = ch + this._input;
                this.yytext = this.yytext.substr(0, this.yytext.length - len);
                this.offset -= len;
                var oldLines = this.match.split(/(?:\r\n?|\n)/g);
                this.match = this.match.substr(0, this.match.length - 1);
                this.matched = this.matched.substr(0, this.matched.length - 1);
                if (lines.length - 1) {
                    this.yylineno -= lines.length - 1;
                }
                var r = this.yylloc.range;
                this.yylloc = {
                    first_line: this.yylloc.first_line,
                    last_line: this.yylineno + 1,
                    first_column: this.yylloc.first_column,
                    last_column: lines ? (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length : this.yylloc.first_column - len
                };
                if (this.options.ranges) {
                    this.yylloc.range = [
                        r[0],
                        r[0] + this.yyleng - len
                    ];
                }
                this.yyleng = this.yytext.length;
                return this;
            }, "unput"),
            // When called from action, caches matched text and appends it on next action
            more: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
                this._more = true;
                return this;
            }, "more"),
            // When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
            reject: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
                if (this.options.backtrack_lexer) {
                    this._backtrack = true;
                } else {
                    return this.parseError("Lexical error on line " + (this.yylineno + 1) + ". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n" + this.showPosition(), {
                        text: "",
                        token: null,
                        line: this.yylineno
                    });
                }
                return this;
            }, "reject"),
            // retain first n characters of the match
            less: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(n) {
                this.unput(this.match.slice(n));
            }, "less"),
            // displays already matched input, i.e. for error messages
            pastInput: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
                var past = this.matched.substr(0, this.matched.length - this.match.length);
                return (past.length > 20 ? "..." : "") + past.substr(-20).replace(/\n/g, "");
            }, "pastInput"),
            // displays upcoming input, i.e. for error messages
            upcomingInput: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
                var next = this.match;
                if (next.length < 20) {
                    next += this._input.substr(0, 20 - next.length);
                }
                return (next.substr(0, 20) + (next.length > 20 ? "..." : "")).replace(/\n/g, "");
            }, "upcomingInput"),
            // displays the character position where the lexing error occurred, i.e. for error messages
            showPosition: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
                var pre = this.pastInput();
                var c2 = new Array(pre.length + 1).join("-");
                return pre + this.upcomingInput() + "\n" + c2 + "^";
            }, "showPosition"),
            // test the lexed token: return FALSE when not a match, otherwise return token
            test_match: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(match, indexed_rule) {
                var token, lines, backup;
                if (this.options.backtrack_lexer) {
                    backup = {
                        yylineno: this.yylineno,
                        yylloc: {
                            first_line: this.yylloc.first_line,
                            last_line: this.last_line,
                            first_column: this.yylloc.first_column,
                            last_column: this.yylloc.last_column
                        },
                        yytext: this.yytext,
                        match: this.match,
                        matches: this.matches,
                        matched: this.matched,
                        yyleng: this.yyleng,
                        offset: this.offset,
                        _more: this._more,
                        _input: this._input,
                        yy: this.yy,
                        conditionStack: this.conditionStack.slice(0),
                        done: this.done
                    };
                    if (this.options.ranges) {
                        backup.yylloc.range = this.yylloc.range.slice(0);
                    }
                }
                lines = match[0].match(/(?:\r\n?|\n).*/g);
                if (lines) {
                    this.yylineno += lines.length;
                }
                this.yylloc = {
                    first_line: this.yylloc.last_line,
                    last_line: this.yylineno + 1,
                    first_column: this.yylloc.last_column,
                    last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length
                };
                this.yytext += match[0];
                this.match += match[0];
                this.matches = match;
                this.yyleng = this.yytext.length;
                if (this.options.ranges) {
                    this.yylloc.range = [
                        this.offset,
                        this.offset += this.yyleng
                    ];
                }
                this._more = false;
                this._backtrack = false;
                this._input = this._input.slice(match[0].length);
                this.matched += match[0];
                token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
                if (this.done && this._input) {
                    this.done = false;
                }
                if (token) {
                    return token;
                } else if (this._backtrack) {
                    for(var k in backup){
                        this[k] = backup[k];
                    }
                    return false;
                }
                return false;
            }, "test_match"),
            // return next match in input
            next: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
                if (this.done) {
                    return this.EOF;
                }
                if (!this._input) {
                    this.done = true;
                }
                var token, match, tempMatch, index;
                if (!this._more) {
                    this.yytext = "";
                    this.match = "";
                }
                var rules = this._currentRules();
                for(var i = 0; i < rules.length; i++){
                    tempMatch = this._input.match(this.rules[rules[i]]);
                    if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                        match = tempMatch;
                        index = i;
                        if (this.options.backtrack_lexer) {
                            token = this.test_match(tempMatch, rules[i]);
                            if (token !== false) {
                                return token;
                            } else if (this._backtrack) {
                                match = false;
                                continue;
                            } else {
                                return false;
                            }
                        } else if (!this.options.flex) {
                            break;
                        }
                    }
                }
                if (match) {
                    token = this.test_match(match, rules[index]);
                    if (token !== false) {
                        return token;
                    }
                    return false;
                }
                if (this._input === "") {
                    return this.EOF;
                } else {
                    return this.parseError("Lexical error on line " + (this.yylineno + 1) + ". Unrecognized text.\n" + this.showPosition(), {
                        text: "",
                        token: null,
                        line: this.yylineno
                    });
                }
            }, "next"),
            // return next match that has a token
            lex: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function lex() {
                var r = this.next();
                if (r) {
                    return r;
                } else {
                    return this.lex();
                }
            }, "lex"),
            // activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
            begin: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function begin(condition) {
                this.conditionStack.push(condition);
            }, "begin"),
            // pop the previously active lexer condition state off the condition stack
            popState: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function popState() {
                var n = this.conditionStack.length - 1;
                if (n > 0) {
                    return this.conditionStack.pop();
                } else {
                    return this.conditionStack[0];
                }
            }, "popState"),
            // produce the lexer rule set which is active for the currently active lexer condition state
            _currentRules: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function _currentRules() {
                if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
                    return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
                } else {
                    return this.conditions["INITIAL"].rules;
                }
            }, "_currentRules"),
            // return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
            topState: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function topState(n) {
                n = this.conditionStack.length - 1 - Math.abs(n || 0);
                if (n >= 0) {
                    return this.conditionStack[n];
                } else {
                    return "INITIAL";
                }
            }, "topState"),
            // alias for begin(condition)
            pushState: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function pushState(condition) {
                this.begin(condition);
            }, "pushState"),
            // return the number of states currently on the stack
            stateStackSize: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function stateStackSize() {
                return this.conditionStack.length;
            }, "stateStackSize"),
            options: {},
            performAction: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {
                var YYSTATE = YY_START;
                switch($avoiding_name_collisions){
                    case 0:
                        return 6;
                        //TURBOPACK unreachable
                        ;
                    case 1:
                        return 7;
                        //TURBOPACK unreachable
                        ;
                    case 2:
                        return 8;
                        //TURBOPACK unreachable
                        ;
                    case 3:
                        return 9;
                        //TURBOPACK unreachable
                        ;
                    case 4:
                        return 22;
                        //TURBOPACK unreachable
                        ;
                    case 5:
                        return 23;
                        //TURBOPACK unreachable
                        ;
                    case 6:
                        this.begin("acc_title");
                        return 24;
                        //TURBOPACK unreachable
                        ;
                    case 7:
                        this.popState();
                        return "acc_title_value";
                        //TURBOPACK unreachable
                        ;
                    case 8:
                        this.begin("acc_descr");
                        return 26;
                        //TURBOPACK unreachable
                        ;
                    case 9:
                        this.popState();
                        return "acc_descr_value";
                        //TURBOPACK unreachable
                        ;
                    case 10:
                        this.begin("acc_descr_multiline");
                        break;
                    case 11:
                        this.popState();
                        break;
                    case 12:
                        return "acc_descr_multiline_value";
                        //TURBOPACK unreachable
                        ;
                    case 13:
                        break;
                    case 14:
                        c;
                        break;
                    case 15:
                        return 12;
                        //TURBOPACK unreachable
                        ;
                    case 16:
                        break;
                    case 17:
                        return 11;
                        //TURBOPACK unreachable
                        ;
                    case 18:
                        return 15;
                        //TURBOPACK unreachable
                        ;
                    case 19:
                        return 16;
                        //TURBOPACK unreachable
                        ;
                    case 20:
                        return 17;
                        //TURBOPACK unreachable
                        ;
                    case 21:
                        return 18;
                        //TURBOPACK unreachable
                        ;
                    case 22:
                        this.begin("person_ext");
                        return 45;
                        //TURBOPACK unreachable
                        ;
                    case 23:
                        this.begin("person");
                        return 44;
                        //TURBOPACK unreachable
                        ;
                    case 24:
                        this.begin("system_ext_queue");
                        return 51;
                        //TURBOPACK unreachable
                        ;
                    case 25:
                        this.begin("system_ext_db");
                        return 50;
                        //TURBOPACK unreachable
                        ;
                    case 26:
                        this.begin("system_ext");
                        return 49;
                        //TURBOPACK unreachable
                        ;
                    case 27:
                        this.begin("system_queue");
                        return 48;
                        //TURBOPACK unreachable
                        ;
                    case 28:
                        this.begin("system_db");
                        return 47;
                        //TURBOPACK unreachable
                        ;
                    case 29:
                        this.begin("system");
                        return 46;
                        //TURBOPACK unreachable
                        ;
                    case 30:
                        this.begin("boundary");
                        return 37;
                        //TURBOPACK unreachable
                        ;
                    case 31:
                        this.begin("enterprise_boundary");
                        return 34;
                        //TURBOPACK unreachable
                        ;
                    case 32:
                        this.begin("system_boundary");
                        return 36;
                        //TURBOPACK unreachable
                        ;
                    case 33:
                        this.begin("container_ext_queue");
                        return 57;
                        //TURBOPACK unreachable
                        ;
                    case 34:
                        this.begin("container_ext_db");
                        return 56;
                        //TURBOPACK unreachable
                        ;
                    case 35:
                        this.begin("container_ext");
                        return 55;
                        //TURBOPACK unreachable
                        ;
                    case 36:
                        this.begin("container_queue");
                        return 54;
                        //TURBOPACK unreachable
                        ;
                    case 37:
                        this.begin("container_db");
                        return 53;
                        //TURBOPACK unreachable
                        ;
                    case 38:
                        this.begin("container");
                        return 52;
                        //TURBOPACK unreachable
                        ;
                    case 39:
                        this.begin("container_boundary");
                        return 38;
                        //TURBOPACK unreachable
                        ;
                    case 40:
                        this.begin("component_ext_queue");
                        return 63;
                        //TURBOPACK unreachable
                        ;
                    case 41:
                        this.begin("component_ext_db");
                        return 62;
                        //TURBOPACK unreachable
                        ;
                    case 42:
                        this.begin("component_ext");
                        return 61;
                        //TURBOPACK unreachable
                        ;
                    case 43:
                        this.begin("component_queue");
                        return 60;
                        //TURBOPACK unreachable
                        ;
                    case 44:
                        this.begin("component_db");
                        return 59;
                        //TURBOPACK unreachable
                        ;
                    case 45:
                        this.begin("component");
                        return 58;
                        //TURBOPACK unreachable
                        ;
                    case 46:
                        this.begin("node");
                        return 39;
                        //TURBOPACK unreachable
                        ;
                    case 47:
                        this.begin("node");
                        return 39;
                        //TURBOPACK unreachable
                        ;
                    case 48:
                        this.begin("node_l");
                        return 40;
                        //TURBOPACK unreachable
                        ;
                    case 49:
                        this.begin("node_r");
                        return 41;
                        //TURBOPACK unreachable
                        ;
                    case 50:
                        this.begin("rel");
                        return 64;
                        //TURBOPACK unreachable
                        ;
                    case 51:
                        this.begin("birel");
                        return 65;
                        //TURBOPACK unreachable
                        ;
                    case 52:
                        this.begin("rel_u");
                        return 66;
                        //TURBOPACK unreachable
                        ;
                    case 53:
                        this.begin("rel_u");
                        return 66;
                        //TURBOPACK unreachable
                        ;
                    case 54:
                        this.begin("rel_d");
                        return 67;
                        //TURBOPACK unreachable
                        ;
                    case 55:
                        this.begin("rel_d");
                        return 67;
                        //TURBOPACK unreachable
                        ;
                    case 56:
                        this.begin("rel_l");
                        return 68;
                        //TURBOPACK unreachable
                        ;
                    case 57:
                        this.begin("rel_l");
                        return 68;
                        //TURBOPACK unreachable
                        ;
                    case 58:
                        this.begin("rel_r");
                        return 69;
                        //TURBOPACK unreachable
                        ;
                    case 59:
                        this.begin("rel_r");
                        return 69;
                        //TURBOPACK unreachable
                        ;
                    case 60:
                        this.begin("rel_b");
                        return 70;
                        //TURBOPACK unreachable
                        ;
                    case 61:
                        this.begin("rel_index");
                        return 71;
                        //TURBOPACK unreachable
                        ;
                    case 62:
                        this.begin("update_el_style");
                        return 72;
                        //TURBOPACK unreachable
                        ;
                    case 63:
                        this.begin("update_rel_style");
                        return 73;
                        //TURBOPACK unreachable
                        ;
                    case 64:
                        this.begin("update_layout_config");
                        return 74;
                        //TURBOPACK unreachable
                        ;
                    case 65:
                        return "EOF_IN_STRUCT";
                        //TURBOPACK unreachable
                        ;
                    case 66:
                        this.begin("attribute");
                        return "ATTRIBUTE_EMPTY";
                        //TURBOPACK unreachable
                        ;
                    case 67:
                        this.begin("attribute");
                        break;
                    case 68:
                        this.popState();
                        this.popState();
                        break;
                    case 69:
                        return 80;
                        //TURBOPACK unreachable
                        ;
                    case 70:
                        break;
                    case 71:
                        return 80;
                        //TURBOPACK unreachable
                        ;
                    case 72:
                        this.begin("string");
                        break;
                    case 73:
                        this.popState();
                        break;
                    case 74:
                        return "STR";
                        //TURBOPACK unreachable
                        ;
                    case 75:
                        this.begin("string_kv");
                        break;
                    case 76:
                        this.begin("string_kv_key");
                        return "STR_KEY";
                        //TURBOPACK unreachable
                        ;
                    case 77:
                        this.popState();
                        this.begin("string_kv_value");
                        break;
                    case 78:
                        return "STR_VALUE";
                        //TURBOPACK unreachable
                        ;
                    case 79:
                        this.popState();
                        this.popState();
                        break;
                    case 80:
                        return "STR";
                        //TURBOPACK unreachable
                        ;
                    case 81:
                        return "LBRACE";
                        //TURBOPACK unreachable
                        ;
                    case 82:
                        return "RBRACE";
                        //TURBOPACK unreachable
                        ;
                    case 83:
                        return "SPACE";
                        //TURBOPACK unreachable
                        ;
                    case 84:
                        return "EOL";
                        //TURBOPACK unreachable
                        ;
                    case 85:
                        return 14;
                        //TURBOPACK unreachable
                        ;
                }
            }, "anonymous"),
            rules: [
                /^(?:.*direction\s+TB[^\n]*)/,
                /^(?:.*direction\s+BT[^\n]*)/,
                /^(?:.*direction\s+RL[^\n]*)/,
                /^(?:.*direction\s+LR[^\n]*)/,
                /^(?:title\s[^#\n;]+)/,
                /^(?:accDescription\s[^#\n;]+)/,
                /^(?:accTitle\s*:\s*)/,
                /^(?:(?!\n||)*[^\n]*)/,
                /^(?:accDescr\s*:\s*)/,
                /^(?:(?!\n||)*[^\n]*)/,
                /^(?:accDescr\s*\{\s*)/,
                /^(?:[\}])/,
                /^(?:[^\}]*)/,
                /^(?:%%(?!\{)*[^\n]*(\r?\n?)+)/,
                /^(?:%%[^\n]*(\r?\n)*)/,
                /^(?:\s*(\r?\n)+)/,
                /^(?:\s+)/,
                /^(?:C4Context\b)/,
                /^(?:C4Container\b)/,
                /^(?:C4Component\b)/,
                /^(?:C4Dynamic\b)/,
                /^(?:C4Deployment\b)/,
                /^(?:Person_Ext\b)/,
                /^(?:Person\b)/,
                /^(?:SystemQueue_Ext\b)/,
                /^(?:SystemDb_Ext\b)/,
                /^(?:System_Ext\b)/,
                /^(?:SystemQueue\b)/,
                /^(?:SystemDb\b)/,
                /^(?:System\b)/,
                /^(?:Boundary\b)/,
                /^(?:Enterprise_Boundary\b)/,
                /^(?:System_Boundary\b)/,
                /^(?:ContainerQueue_Ext\b)/,
                /^(?:ContainerDb_Ext\b)/,
                /^(?:Container_Ext\b)/,
                /^(?:ContainerQueue\b)/,
                /^(?:ContainerDb\b)/,
                /^(?:Container\b)/,
                /^(?:Container_Boundary\b)/,
                /^(?:ComponentQueue_Ext\b)/,
                /^(?:ComponentDb_Ext\b)/,
                /^(?:Component_Ext\b)/,
                /^(?:ComponentQueue\b)/,
                /^(?:ComponentDb\b)/,
                /^(?:Component\b)/,
                /^(?:Deployment_Node\b)/,
                /^(?:Node\b)/,
                /^(?:Node_L\b)/,
                /^(?:Node_R\b)/,
                /^(?:Rel\b)/,
                /^(?:BiRel\b)/,
                /^(?:Rel_Up\b)/,
                /^(?:Rel_U\b)/,
                /^(?:Rel_Down\b)/,
                /^(?:Rel_D\b)/,
                /^(?:Rel_Left\b)/,
                /^(?:Rel_L\b)/,
                /^(?:Rel_Right\b)/,
                /^(?:Rel_R\b)/,
                /^(?:Rel_Back\b)/,
                /^(?:RelIndex\b)/,
                /^(?:UpdateElementStyle\b)/,
                /^(?:UpdateRelStyle\b)/,
                /^(?:UpdateLayoutConfig\b)/,
                /^(?:$)/,
                /^(?:[(][ ]*[,])/,
                /^(?:[(])/,
                /^(?:[)])/,
                /^(?:,,)/,
                /^(?:,)/,
                /^(?:[ ]*["]["])/,
                /^(?:[ ]*["])/,
                /^(?:["])/,
                /^(?:[^"]*)/,
                /^(?:[ ]*[\$])/,
                /^(?:[^=]*)/,
                /^(?:[=][ ]*["])/,
                /^(?:[^"]+)/,
                /^(?:["])/,
                /^(?:[^,]+)/,
                /^(?:\{)/,
                /^(?:\})/,
                /^(?:[\s]+)/,
                /^(?:[\n\r]+)/,
                /^(?:$)/
            ],
            conditions: {
                "acc_descr_multiline": {
                    "rules": [
                        11,
                        12
                    ],
                    "inclusive": false
                },
                "acc_descr": {
                    "rules": [
                        9
                    ],
                    "inclusive": false
                },
                "acc_title": {
                    "rules": [
                        7
                    ],
                    "inclusive": false
                },
                "string_kv_value": {
                    "rules": [
                        78,
                        79
                    ],
                    "inclusive": false
                },
                "string_kv_key": {
                    "rules": [
                        77
                    ],
                    "inclusive": false
                },
                "string_kv": {
                    "rules": [
                        76
                    ],
                    "inclusive": false
                },
                "string": {
                    "rules": [
                        73,
                        74
                    ],
                    "inclusive": false
                },
                "attribute": {
                    "rules": [
                        68,
                        69,
                        70,
                        71,
                        72,
                        75,
                        80
                    ],
                    "inclusive": false
                },
                "update_layout_config": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "update_rel_style": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "update_el_style": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "rel_b": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "rel_r": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "rel_l": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "rel_d": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "rel_u": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "rel_bi": {
                    "rules": [],
                    "inclusive": false
                },
                "rel": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "node_r": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "node_l": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "node": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "index": {
                    "rules": [],
                    "inclusive": false
                },
                "rel_index": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "component_ext_queue": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "component_ext_db": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "component_ext": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "component_queue": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "component_db": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "component": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "container_boundary": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "container_ext_queue": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "container_ext_db": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "container_ext": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "container_queue": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "container_db": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "container": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "birel": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "system_boundary": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "enterprise_boundary": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "boundary": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "system_ext_queue": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "system_ext_db": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "system_ext": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "system_queue": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "system_db": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "system": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "person_ext": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "person": {
                    "rules": [
                        65,
                        66,
                        67,
                        68
                    ],
                    "inclusive": false
                },
                "INITIAL": {
                    "rules": [
                        0,
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        8,
                        10,
                        13,
                        14,
                        15,
                        16,
                        17,
                        18,
                        19,
                        20,
                        21,
                        22,
                        23,
                        24,
                        25,
                        26,
                        27,
                        28,
                        29,
                        30,
                        31,
                        32,
                        33,
                        34,
                        35,
                        36,
                        37,
                        38,
                        39,
                        40,
                        41,
                        42,
                        43,
                        44,
                        45,
                        46,
                        47,
                        48,
                        49,
                        50,
                        51,
                        52,
                        53,
                        54,
                        55,
                        56,
                        57,
                        58,
                        59,
                        60,
                        61,
                        62,
                        63,
                        64,
                        81,
                        82,
                        83,
                        84,
                        85
                    ],
                    "inclusive": true
                }
            }
        };
        return lexer2;
    }();
    parser2.lexer = lexer;
    function Parser() {
        this.yy = {};
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(Parser, "Parser");
    Parser.prototype = parser2;
    parser2.Parser = Parser;
    return new Parser();
}();
parser.parser = parser;
var c4Diagram_default = parser;
// src/diagrams/c4/c4Db.js
var c4ShapeArray = [];
var boundaryParseStack = [
    ""
];
var currentBoundaryParse = "global";
var parentBoundaryParse = "";
var boundaries = [
    {
        alias: "global",
        label: {
            text: "global"
        },
        type: {
            text: "global"
        },
        tags: null,
        link: null,
        parentBoundary: ""
    }
];
var rels = [];
var title = "";
var wrapEnabled = false;
var c4ShapeInRow = 4;
var c4BoundaryInRow = 2;
var c4Type;
var getC4Type = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
    return c4Type;
}, "getC4Type");
var setC4Type = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(c4TypeParam) {
    let sanitizedText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeText"])(c4TypeParam, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getConfig2"])());
    c4Type = sanitizedText;
}, "setC4Type");
var addRel = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(type, from, to, label, techn, descr, sprite, tags, link) {
    if (type === void 0 || type === null || from === void 0 || from === null || to === void 0 || to === null || label === void 0 || label === null) {
        return;
    }
    let rel = {};
    const old = rels.find((rel2)=>rel2.from === from && rel2.to === to);
    if (old) {
        rel = old;
    } else {
        rels.push(rel);
    }
    rel.type = type;
    rel.from = from;
    rel.to = to;
    rel.label = {
        text: label
    };
    if (techn === void 0 || techn === null) {
        rel.techn = {
            text: ""
        };
    } else {
        if (typeof techn === "object") {
            let [key, value] = Object.entries(techn)[0];
            rel[key] = {
                text: value
            };
        } else {
            rel.techn = {
                text: techn
            };
        }
    }
    if (descr === void 0 || descr === null) {
        rel.descr = {
            text: ""
        };
    } else {
        if (typeof descr === "object") {
            let [key, value] = Object.entries(descr)[0];
            rel[key] = {
                text: value
            };
        } else {
            rel.descr = {
                text: descr
            };
        }
    }
    if (typeof sprite === "object") {
        let [key, value] = Object.entries(sprite)[0];
        rel[key] = value;
    } else {
        rel.sprite = sprite;
    }
    if (typeof tags === "object") {
        let [key, value] = Object.entries(tags)[0];
        rel[key] = value;
    } else {
        rel.tags = tags;
    }
    if (typeof link === "object") {
        let [key, value] = Object.entries(link)[0];
        rel[key] = value;
    } else {
        rel.link = link;
    }
    rel.wrap = autoWrap();
}, "addRel");
var addPersonOrSystem = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(typeC4Shape, alias, label, descr, sprite, tags, link) {
    if (alias === null || label === null) {
        return;
    }
    let personOrSystem = {};
    const old = c4ShapeArray.find((personOrSystem2)=>personOrSystem2.alias === alias);
    if (old && alias === old.alias) {
        personOrSystem = old;
    } else {
        personOrSystem.alias = alias;
        c4ShapeArray.push(personOrSystem);
    }
    if (label === void 0 || label === null) {
        personOrSystem.label = {
            text: ""
        };
    } else {
        personOrSystem.label = {
            text: label
        };
    }
    if (descr === void 0 || descr === null) {
        personOrSystem.descr = {
            text: ""
        };
    } else {
        if (typeof descr === "object") {
            let [key, value] = Object.entries(descr)[0];
            personOrSystem[key] = {
                text: value
            };
        } else {
            personOrSystem.descr = {
                text: descr
            };
        }
    }
    if (typeof sprite === "object") {
        let [key, value] = Object.entries(sprite)[0];
        personOrSystem[key] = value;
    } else {
        personOrSystem.sprite = sprite;
    }
    if (typeof tags === "object") {
        let [key, value] = Object.entries(tags)[0];
        personOrSystem[key] = value;
    } else {
        personOrSystem.tags = tags;
    }
    if (typeof link === "object") {
        let [key, value] = Object.entries(link)[0];
        personOrSystem[key] = value;
    } else {
        personOrSystem.link = link;
    }
    personOrSystem.typeC4Shape = {
        text: typeC4Shape
    };
    personOrSystem.parentBoundary = currentBoundaryParse;
    personOrSystem.wrap = autoWrap();
}, "addPersonOrSystem");
var addContainer = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(typeC4Shape, alias, label, techn, descr, sprite, tags, link) {
    if (alias === null || label === null) {
        return;
    }
    let container = {};
    const old = c4ShapeArray.find((container2)=>container2.alias === alias);
    if (old && alias === old.alias) {
        container = old;
    } else {
        container.alias = alias;
        c4ShapeArray.push(container);
    }
    if (label === void 0 || label === null) {
        container.label = {
            text: ""
        };
    } else {
        container.label = {
            text: label
        };
    }
    if (techn === void 0 || techn === null) {
        container.techn = {
            text: ""
        };
    } else {
        if (typeof techn === "object") {
            let [key, value] = Object.entries(techn)[0];
            container[key] = {
                text: value
            };
        } else {
            container.techn = {
                text: techn
            };
        }
    }
    if (descr === void 0 || descr === null) {
        container.descr = {
            text: ""
        };
    } else {
        if (typeof descr === "object") {
            let [key, value] = Object.entries(descr)[0];
            container[key] = {
                text: value
            };
        } else {
            container.descr = {
                text: descr
            };
        }
    }
    if (typeof sprite === "object") {
        let [key, value] = Object.entries(sprite)[0];
        container[key] = value;
    } else {
        container.sprite = sprite;
    }
    if (typeof tags === "object") {
        let [key, value] = Object.entries(tags)[0];
        container[key] = value;
    } else {
        container.tags = tags;
    }
    if (typeof link === "object") {
        let [key, value] = Object.entries(link)[0];
        container[key] = value;
    } else {
        container.link = link;
    }
    container.wrap = autoWrap();
    container.typeC4Shape = {
        text: typeC4Shape
    };
    container.parentBoundary = currentBoundaryParse;
}, "addContainer");
var addComponent = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(typeC4Shape, alias, label, techn, descr, sprite, tags, link) {
    if (alias === null || label === null) {
        return;
    }
    let component = {};
    const old = c4ShapeArray.find((component2)=>component2.alias === alias);
    if (old && alias === old.alias) {
        component = old;
    } else {
        component.alias = alias;
        c4ShapeArray.push(component);
    }
    if (label === void 0 || label === null) {
        component.label = {
            text: ""
        };
    } else {
        component.label = {
            text: label
        };
    }
    if (techn === void 0 || techn === null) {
        component.techn = {
            text: ""
        };
    } else {
        if (typeof techn === "object") {
            let [key, value] = Object.entries(techn)[0];
            component[key] = {
                text: value
            };
        } else {
            component.techn = {
                text: techn
            };
        }
    }
    if (descr === void 0 || descr === null) {
        component.descr = {
            text: ""
        };
    } else {
        if (typeof descr === "object") {
            let [key, value] = Object.entries(descr)[0];
            component[key] = {
                text: value
            };
        } else {
            component.descr = {
                text: descr
            };
        }
    }
    if (typeof sprite === "object") {
        let [key, value] = Object.entries(sprite)[0];
        component[key] = value;
    } else {
        component.sprite = sprite;
    }
    if (typeof tags === "object") {
        let [key, value] = Object.entries(tags)[0];
        component[key] = value;
    } else {
        component.tags = tags;
    }
    if (typeof link === "object") {
        let [key, value] = Object.entries(link)[0];
        component[key] = value;
    } else {
        component.link = link;
    }
    component.wrap = autoWrap();
    component.typeC4Shape = {
        text: typeC4Shape
    };
    component.parentBoundary = currentBoundaryParse;
}, "addComponent");
var addPersonOrSystemBoundary = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(alias, label, type, tags, link) {
    if (alias === null || label === null) {
        return;
    }
    let boundary = {};
    const old = boundaries.find((boundary2)=>boundary2.alias === alias);
    if (old && alias === old.alias) {
        boundary = old;
    } else {
        boundary.alias = alias;
        boundaries.push(boundary);
    }
    if (label === void 0 || label === null) {
        boundary.label = {
            text: ""
        };
    } else {
        boundary.label = {
            text: label
        };
    }
    if (type === void 0 || type === null) {
        boundary.type = {
            text: "system"
        };
    } else {
        if (typeof type === "object") {
            let [key, value] = Object.entries(type)[0];
            boundary[key] = {
                text: value
            };
        } else {
            boundary.type = {
                text: type
            };
        }
    }
    if (typeof tags === "object") {
        let [key, value] = Object.entries(tags)[0];
        boundary[key] = value;
    } else {
        boundary.tags = tags;
    }
    if (typeof link === "object") {
        let [key, value] = Object.entries(link)[0];
        boundary[key] = value;
    } else {
        boundary.link = link;
    }
    boundary.parentBoundary = currentBoundaryParse;
    boundary.wrap = autoWrap();
    parentBoundaryParse = currentBoundaryParse;
    currentBoundaryParse = alias;
    boundaryParseStack.push(parentBoundaryParse);
}, "addPersonOrSystemBoundary");
var addContainerBoundary = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(alias, label, type, tags, link) {
    if (alias === null || label === null) {
        return;
    }
    let boundary = {};
    const old = boundaries.find((boundary2)=>boundary2.alias === alias);
    if (old && alias === old.alias) {
        boundary = old;
    } else {
        boundary.alias = alias;
        boundaries.push(boundary);
    }
    if (label === void 0 || label === null) {
        boundary.label = {
            text: ""
        };
    } else {
        boundary.label = {
            text: label
        };
    }
    if (type === void 0 || type === null) {
        boundary.type = {
            text: "container"
        };
    } else {
        if (typeof type === "object") {
            let [key, value] = Object.entries(type)[0];
            boundary[key] = {
                text: value
            };
        } else {
            boundary.type = {
                text: type
            };
        }
    }
    if (typeof tags === "object") {
        let [key, value] = Object.entries(tags)[0];
        boundary[key] = value;
    } else {
        boundary.tags = tags;
    }
    if (typeof link === "object") {
        let [key, value] = Object.entries(link)[0];
        boundary[key] = value;
    } else {
        boundary.link = link;
    }
    boundary.parentBoundary = currentBoundaryParse;
    boundary.wrap = autoWrap();
    parentBoundaryParse = currentBoundaryParse;
    currentBoundaryParse = alias;
    boundaryParseStack.push(parentBoundaryParse);
}, "addContainerBoundary");
var addDeploymentNode = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(nodeType, alias, label, type, descr, sprite, tags, link) {
    if (alias === null || label === null) {
        return;
    }
    let boundary = {};
    const old = boundaries.find((boundary2)=>boundary2.alias === alias);
    if (old && alias === old.alias) {
        boundary = old;
    } else {
        boundary.alias = alias;
        boundaries.push(boundary);
    }
    if (label === void 0 || label === null) {
        boundary.label = {
            text: ""
        };
    } else {
        boundary.label = {
            text: label
        };
    }
    if (type === void 0 || type === null) {
        boundary.type = {
            text: "node"
        };
    } else {
        if (typeof type === "object") {
            let [key, value] = Object.entries(type)[0];
            boundary[key] = {
                text: value
            };
        } else {
            boundary.type = {
                text: type
            };
        }
    }
    if (descr === void 0 || descr === null) {
        boundary.descr = {
            text: ""
        };
    } else {
        if (typeof descr === "object") {
            let [key, value] = Object.entries(descr)[0];
            boundary[key] = {
                text: value
            };
        } else {
            boundary.descr = {
                text: descr
            };
        }
    }
    if (typeof tags === "object") {
        let [key, value] = Object.entries(tags)[0];
        boundary[key] = value;
    } else {
        boundary.tags = tags;
    }
    if (typeof link === "object") {
        let [key, value] = Object.entries(link)[0];
        boundary[key] = value;
    } else {
        boundary.link = link;
    }
    boundary.nodeType = nodeType;
    boundary.parentBoundary = currentBoundaryParse;
    boundary.wrap = autoWrap();
    parentBoundaryParse = currentBoundaryParse;
    currentBoundaryParse = alias;
    boundaryParseStack.push(parentBoundaryParse);
}, "addDeploymentNode");
var popBoundaryParseStack = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
    currentBoundaryParse = parentBoundaryParse;
    boundaryParseStack.pop();
    parentBoundaryParse = boundaryParseStack.pop();
    boundaryParseStack.push(parentBoundaryParse);
}, "popBoundaryParseStack");
var updateElStyle = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(typeC4Shape, elementName, bgColor, fontColor, borderColor, shadowing, shape, sprite, techn, legendText, legendSprite) {
    let old = c4ShapeArray.find((element)=>element.alias === elementName);
    if (old === void 0) {
        old = boundaries.find((element)=>element.alias === elementName);
        if (old === void 0) {
            return;
        }
    }
    if (bgColor !== void 0 && bgColor !== null) {
        if (typeof bgColor === "object") {
            let [key, value] = Object.entries(bgColor)[0];
            old[key] = value;
        } else {
            old.bgColor = bgColor;
        }
    }
    if (fontColor !== void 0 && fontColor !== null) {
        if (typeof fontColor === "object") {
            let [key, value] = Object.entries(fontColor)[0];
            old[key] = value;
        } else {
            old.fontColor = fontColor;
        }
    }
    if (borderColor !== void 0 && borderColor !== null) {
        if (typeof borderColor === "object") {
            let [key, value] = Object.entries(borderColor)[0];
            old[key] = value;
        } else {
            old.borderColor = borderColor;
        }
    }
    if (shadowing !== void 0 && shadowing !== null) {
        if (typeof shadowing === "object") {
            let [key, value] = Object.entries(shadowing)[0];
            old[key] = value;
        } else {
            old.shadowing = shadowing;
        }
    }
    if (shape !== void 0 && shape !== null) {
        if (typeof shape === "object") {
            let [key, value] = Object.entries(shape)[0];
            old[key] = value;
        } else {
            old.shape = shape;
        }
    }
    if (sprite !== void 0 && sprite !== null) {
        if (typeof sprite === "object") {
            let [key, value] = Object.entries(sprite)[0];
            old[key] = value;
        } else {
            old.sprite = sprite;
        }
    }
    if (techn !== void 0 && techn !== null) {
        if (typeof techn === "object") {
            let [key, value] = Object.entries(techn)[0];
            old[key] = value;
        } else {
            old.techn = techn;
        }
    }
    if (legendText !== void 0 && legendText !== null) {
        if (typeof legendText === "object") {
            let [key, value] = Object.entries(legendText)[0];
            old[key] = value;
        } else {
            old.legendText = legendText;
        }
    }
    if (legendSprite !== void 0 && legendSprite !== null) {
        if (typeof legendSprite === "object") {
            let [key, value] = Object.entries(legendSprite)[0];
            old[key] = value;
        } else {
            old.legendSprite = legendSprite;
        }
    }
}, "updateElStyle");
var updateRelStyle = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(typeC4Shape, from, to, textColor, lineColor, offsetX, offsetY) {
    const old = rels.find((rel)=>rel.from === from && rel.to === to);
    if (old === void 0) {
        return;
    }
    if (textColor !== void 0 && textColor !== null) {
        if (typeof textColor === "object") {
            let [key, value] = Object.entries(textColor)[0];
            old[key] = value;
        } else {
            old.textColor = textColor;
        }
    }
    if (lineColor !== void 0 && lineColor !== null) {
        if (typeof lineColor === "object") {
            let [key, value] = Object.entries(lineColor)[0];
            old[key] = value;
        } else {
            old.lineColor = lineColor;
        }
    }
    if (offsetX !== void 0 && offsetX !== null) {
        if (typeof offsetX === "object") {
            let [key, value] = Object.entries(offsetX)[0];
            old[key] = parseInt(value);
        } else {
            old.offsetX = parseInt(offsetX);
        }
    }
    if (offsetY !== void 0 && offsetY !== null) {
        if (typeof offsetY === "object") {
            let [key, value] = Object.entries(offsetY)[0];
            old[key] = parseInt(value);
        } else {
            old.offsetY = parseInt(offsetY);
        }
    }
}, "updateRelStyle");
var updateLayoutConfig = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(typeC4Shape, c4ShapeInRowParam, c4BoundaryInRowParam) {
    let c4ShapeInRowValue = c4ShapeInRow;
    let c4BoundaryInRowValue = c4BoundaryInRow;
    if (typeof c4ShapeInRowParam === "object") {
        const value = Object.values(c4ShapeInRowParam)[0];
        c4ShapeInRowValue = parseInt(value);
    } else {
        c4ShapeInRowValue = parseInt(c4ShapeInRowParam);
    }
    if (typeof c4BoundaryInRowParam === "object") {
        const value = Object.values(c4BoundaryInRowParam)[0];
        c4BoundaryInRowValue = parseInt(value);
    } else {
        c4BoundaryInRowValue = parseInt(c4BoundaryInRowParam);
    }
    if (c4ShapeInRowValue >= 1) {
        c4ShapeInRow = c4ShapeInRowValue;
    }
    if (c4BoundaryInRowValue >= 1) {
        c4BoundaryInRow = c4BoundaryInRowValue;
    }
}, "updateLayoutConfig");
var getC4ShapeInRow = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
    return c4ShapeInRow;
}, "getC4ShapeInRow");
var getC4BoundaryInRow = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
    return c4BoundaryInRow;
}, "getC4BoundaryInRow");
var getCurrentBoundaryParse = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
    return currentBoundaryParse;
}, "getCurrentBoundaryParse");
var getParentBoundaryParse = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
    return parentBoundaryParse;
}, "getParentBoundaryParse");
var getC4ShapeArray = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(parentBoundary) {
    if (parentBoundary === void 0 || parentBoundary === null) {
        return c4ShapeArray;
    } else {
        return c4ShapeArray.filter((personOrSystem)=>{
            return personOrSystem.parentBoundary === parentBoundary;
        });
    }
}, "getC4ShapeArray");
var getC4Shape = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(alias) {
    return c4ShapeArray.find((personOrSystem)=>personOrSystem.alias === alias);
}, "getC4Shape");
var getC4ShapeKeys = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(parentBoundary) {
    return Object.keys(getC4ShapeArray(parentBoundary));
}, "getC4ShapeKeys");
var getBoundaries = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(parentBoundary) {
    if (parentBoundary === void 0 || parentBoundary === null) {
        return boundaries;
    } else {
        return boundaries.filter((boundary)=>boundary.parentBoundary === parentBoundary);
    }
}, "getBoundaries");
var getBoundarys = getBoundaries;
var getRels = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
    return rels;
}, "getRels");
var getTitle = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
    return title;
}, "getTitle");
var setWrap = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(wrapSetting) {
    wrapEnabled = wrapSetting;
}, "setWrap");
var autoWrap = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
    return wrapEnabled;
}, "autoWrap");
var clear = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function() {
    c4ShapeArray = [];
    boundaries = [
        {
            alias: "global",
            label: {
                text: "global"
            },
            type: {
                text: "global"
            },
            tags: null,
            link: null,
            parentBoundary: ""
        }
    ];
    parentBoundaryParse = "";
    currentBoundaryParse = "global";
    boundaryParseStack = [
        ""
    ];
    rels = [];
    boundaryParseStack = [
        ""
    ];
    title = "";
    wrapEnabled = false;
    c4ShapeInRow = 4;
    c4BoundaryInRow = 2;
}, "clear");
var LINETYPE = {
    SOLID: 0,
    DOTTED: 1,
    NOTE: 2,
    SOLID_CROSS: 3,
    DOTTED_CROSS: 4,
    SOLID_OPEN: 5,
    DOTTED_OPEN: 6,
    LOOP_START: 10,
    LOOP_END: 11,
    ALT_START: 12,
    ALT_ELSE: 13,
    ALT_END: 14,
    OPT_START: 15,
    OPT_END: 16,
    ACTIVE_START: 17,
    ACTIVE_END: 18,
    PAR_START: 19,
    PAR_AND: 20,
    PAR_END: 21,
    RECT_START: 22,
    RECT_END: 23,
    SOLID_POINT: 24,
    DOTTED_POINT: 25
};
var ARROWTYPE = {
    FILLED: 0,
    OPEN: 1
};
var PLACEMENT = {
    LEFTOF: 0,
    RIGHTOF: 1,
    OVER: 2
};
var setTitle = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(txt) {
    let sanitizedText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeText"])(txt, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getConfig2"])());
    title = sanitizedText;
}, "setTitle");
var c4Db_default = {
    addPersonOrSystem,
    addPersonOrSystemBoundary,
    addContainer,
    addContainerBoundary,
    addComponent,
    addDeploymentNode,
    popBoundaryParseStack,
    addRel,
    updateElStyle,
    updateRelStyle,
    updateLayoutConfig,
    autoWrap,
    setWrap,
    getC4ShapeArray,
    getC4Shape,
    getC4ShapeKeys,
    getBoundaries,
    getBoundarys,
    getCurrentBoundaryParse,
    getParentBoundaryParse,
    getRels,
    getTitle,
    getC4Type,
    getC4ShapeInRow,
    getC4BoundaryInRow,
    setAccTitle: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAccTitle"],
    getAccTitle: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAccTitle"],
    getAccDescription: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAccDescription"],
    setAccDescription: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAccDescription"],
    getConfig: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getConfig2"])().c4, "getConfig"),
    clear,
    LINETYPE,
    ARROWTYPE,
    PLACEMENT,
    setTitle,
    setC4Type
};
;
;
var drawRect2 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(elem, rectData) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$JSJVCQXG$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["drawRect"])(elem, rectData);
}, "drawRect");
var drawImage = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(elem, width, height, x, y, link) {
    const imageElem = elem.append("image");
    imageElem.attr("width", width);
    imageElem.attr("height", height);
    imageElem.attr("x", x);
    imageElem.attr("y", y);
    let sanitizedLink = link.startsWith("data:image/png;base64") ? link : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$braintree$2b$sanitize$2d$url$40$7$2e$1$2e$2$2f$node_modules$2f40$braintree$2f$sanitize$2d$url$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeUrl"])(link);
    imageElem.attr("xlink:href", sanitizedLink);
}, "drawImage");
var drawRels = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((elem, rels2, conf2)=>{
    const relsElem = elem.append("g");
    let i = 0;
    for (let rel of rels2){
        let textColor = rel.textColor ? rel.textColor : "#444444";
        let strokeColor = rel.lineColor ? rel.lineColor : "#444444";
        let offsetX = rel.offsetX ? parseInt(rel.offsetX) : 0;
        let offsetY = rel.offsetY ? parseInt(rel.offsetY) : 0;
        let url = "";
        if (i === 0) {
            let line = relsElem.append("line");
            line.attr("x1", rel.startPoint.x);
            line.attr("y1", rel.startPoint.y);
            line.attr("x2", rel.endPoint.x);
            line.attr("y2", rel.endPoint.y);
            line.attr("stroke-width", "1");
            line.attr("stroke", strokeColor);
            line.style("fill", "none");
            if (rel.type !== "rel_b") {
                line.attr("marker-end", "url(" + url + "#arrowhead)");
            }
            if (rel.type === "birel" || rel.type === "rel_b") {
                line.attr("marker-start", "url(" + url + "#arrowend)");
            }
            i = -1;
        } else {
            let line = relsElem.append("path");
            line.attr("fill", "none").attr("stroke-width", "1").attr("stroke", strokeColor).attr("d", "Mstartx,starty Qcontrolx,controly stopx,stopy ".replaceAll("startx", rel.startPoint.x).replaceAll("starty", rel.startPoint.y).replaceAll("controlx", rel.startPoint.x + (rel.endPoint.x - rel.startPoint.x) / 2 - (rel.endPoint.x - rel.startPoint.x) / 4).replaceAll("controly", rel.startPoint.y + (rel.endPoint.y - rel.startPoint.y) / 2).replaceAll("stopx", rel.endPoint.x).replaceAll("stopy", rel.endPoint.y));
            if (rel.type !== "rel_b") {
                line.attr("marker-end", "url(" + url + "#arrowhead)");
            }
            if (rel.type === "birel" || rel.type === "rel_b") {
                line.attr("marker-start", "url(" + url + "#arrowend)");
            }
        }
        let messageConf = conf2.messageFont();
        _drawTextCandidateFunc(conf2)(rel.label.text, relsElem, Math.min(rel.startPoint.x, rel.endPoint.x) + Math.abs(rel.endPoint.x - rel.startPoint.x) / 2 + offsetX, Math.min(rel.startPoint.y, rel.endPoint.y) + Math.abs(rel.endPoint.y - rel.startPoint.y) / 2 + offsetY, rel.label.width, rel.label.height, {
            fill: textColor
        }, messageConf);
        if (rel.techn && rel.techn.text !== "") {
            messageConf = conf2.messageFont();
            _drawTextCandidateFunc(conf2)("[" + rel.techn.text + "]", relsElem, Math.min(rel.startPoint.x, rel.endPoint.x) + Math.abs(rel.endPoint.x - rel.startPoint.x) / 2 + offsetX, Math.min(rel.startPoint.y, rel.endPoint.y) + Math.abs(rel.endPoint.y - rel.startPoint.y) / 2 + conf2.messageFontSize + 5 + offsetY, Math.max(rel.label.width, rel.techn.width), rel.techn.height, {
                fill: textColor,
                "font-style": "italic"
            }, messageConf);
        }
    }
}, "drawRels");
var drawBoundary = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(elem, boundary, conf2) {
    const boundaryElem = elem.append("g");
    let fillColor = boundary.bgColor ? boundary.bgColor : "none";
    let strokeColor = boundary.borderColor ? boundary.borderColor : "#444444";
    let fontColor = boundary.fontColor ? boundary.fontColor : "black";
    let attrsValue = {
        "stroke-width": 1,
        "stroke-dasharray": "7.0,7.0"
    };
    if (boundary.nodeType) {
        attrsValue = {
            "stroke-width": 1
        };
    }
    let rectData = {
        x: boundary.x,
        y: boundary.y,
        fill: fillColor,
        stroke: strokeColor,
        width: boundary.width,
        height: boundary.height,
        rx: 2.5,
        ry: 2.5,
        attrs: attrsValue
    };
    drawRect2(boundaryElem, rectData);
    let boundaryConf = conf2.boundaryFont();
    boundaryConf.fontWeight = "bold";
    boundaryConf.fontSize = boundaryConf.fontSize + 2;
    boundaryConf.fontColor = fontColor;
    _drawTextCandidateFunc(conf2)(boundary.label.text, boundaryElem, boundary.x, boundary.y + boundary.label.Y, boundary.width, boundary.height, {
        fill: "#444444"
    }, boundaryConf);
    if (boundary.type && boundary.type.text !== "") {
        boundaryConf = conf2.boundaryFont();
        boundaryConf.fontColor = fontColor;
        _drawTextCandidateFunc(conf2)(boundary.type.text, boundaryElem, boundary.x, boundary.y + boundary.type.Y, boundary.width, boundary.height, {
            fill: "#444444"
        }, boundaryConf);
    }
    if (boundary.descr && boundary.descr.text !== "") {
        boundaryConf = conf2.boundaryFont();
        boundaryConf.fontSize = boundaryConf.fontSize - 2;
        boundaryConf.fontColor = fontColor;
        _drawTextCandidateFunc(conf2)(boundary.descr.text, boundaryElem, boundary.x, boundary.y + boundary.descr.Y, boundary.width, boundary.height, {
            fill: "#444444"
        }, boundaryConf);
    }
}, "drawBoundary");
var drawC4Shape = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(elem, c4Shape, conf2) {
    let fillColor = c4Shape.bgColor ? c4Shape.bgColor : conf2[c4Shape.typeC4Shape.text + "_bg_color"];
    let strokeColor = c4Shape.borderColor ? c4Shape.borderColor : conf2[c4Shape.typeC4Shape.text + "_border_color"];
    let fontColor = c4Shape.fontColor ? c4Shape.fontColor : "#FFFFFF";
    let personImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAIAAADYYG7QAAACD0lEQVR4Xu2YoU4EMRCGT+4j8Ai8AhaH4QHgAUjQuFMECUgMIUgwJAgMhgQsAYUiJCiQIBBY+EITsjfTdme6V24v4c8vyGbb+ZjOtN0bNcvjQXmkH83WvYBWto6PLm6v7p7uH1/w2fXD+PBycX1Pv2l3IdDm/vn7x+dXQiAubRzoURa7gRZWd0iGRIiJbOnhnfYBQZNJjNbuyY2eJG8fkDE3bbG4ep6MHUAsgYxmE3nVs6VsBWJSGccsOlFPmLIViMzLOB7pCVO2AtHJMohH7Fh6zqitQK7m0rJvAVYgGcEpe//PLdDz65sM4pF9N7ICcXDKIB5Nv6j7tD0NoSdM2QrU9Gg0ewE1LqBhHR3BBdvj2vapnidjHxD/q6vd7Pvhr31AwcY8eXMTXAKECZZJFXuEq27aLgQK5uLMohCenGGuGewOxSjBvYBqeG6B+Nqiblggdjnc+ZXDy+FNFpFzw76O3UBAROuXh6FoiAcf5g9eTvUgzy0nWg6I8cXHRUpg5bOVBCo+KDpFajOf23GgPme7RSQ+lacIENUgJ6gg1k6HjgOlqnLqip4tEuhv0hNEMXUD0clyXE3p6pZA0S2nnvTlXwLJEZWlb7cTQH1+USgTN4VhAenm/wea1OCAOmqo6fE1WCb9WSKBah+rbUWPWAmE2Rvk0ApiB45eOyNAzU8xcTvj8KvkKEoOaIYeHNA3ZuygAvFMUO0AAAAASUVORK5CYII=";
    switch(c4Shape.typeC4Shape.text){
        case "person":
            personImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAIAAADYYG7QAAACD0lEQVR4Xu2YoU4EMRCGT+4j8Ai8AhaH4QHgAUjQuFMECUgMIUgwJAgMhgQsAYUiJCiQIBBY+EITsjfTdme6V24v4c8vyGbb+ZjOtN0bNcvjQXmkH83WvYBWto6PLm6v7p7uH1/w2fXD+PBycX1Pv2l3IdDm/vn7x+dXQiAubRzoURa7gRZWd0iGRIiJbOnhnfYBQZNJjNbuyY2eJG8fkDE3bbG4ep6MHUAsgYxmE3nVs6VsBWJSGccsOlFPmLIViMzLOB7pCVO2AtHJMohH7Fh6zqitQK7m0rJvAVYgGcEpe//PLdDz65sM4pF9N7ICcXDKIB5Nv6j7tD0NoSdM2QrU9Gg0ewE1LqBhHR3BBdvj2vapnidjHxD/q6vd7Pvhr31AwcY8eXMTXAKECZZJFXuEq27aLgQK5uLMohCenGGuGewOxSjBvYBqeG6B+Nqiblggdjnc+ZXDy+FNFpFzw76O3UBAROuXh6FoiAcf5g9eTvUgzy0nWg6I8cXHRUpg5bOVBCo+KDpFajOf23GgPme7RSQ+lacIENUgJ6gg1k6HjgOlqnLqip4tEuhv0hNEMXUD0clyXE3p6pZA0S2nnvTlXwLJEZWlb7cTQH1+USgTN4VhAenm/wea1OCAOmqo6fE1WCb9WSKBah+rbUWPWAmE2Rvk0ApiB45eOyNAzU8xcTvj8KvkKEoOaIYeHNA3ZuygAvFMUO0AAAAASUVORK5CYII=";
            break;
        case "external_person":
            personImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAIAAADYYG7QAAAB6ElEQVR4Xu2YLY+EMBCG9+dWr0aj0Wg0Go1Go0+j8Xdv2uTCvv1gpt0ebHKPuhDaeW4605Z9mJvx4AdXUyTUdd08z+u6flmWZRnHsWkafk9DptAwDPu+f0eAYtu2PEaGWuj5fCIZrBAC2eLBAnRCsEkkxmeaJp7iDJ2QMDdHsLg8SxKFEJaAo8lAXnmuOFIhTMpxxKATebo4UiFknuNo4OniSIXQyRxEA3YsnjGCVEjVXD7yLUAqxBGUyPv/Y4W2beMgGuS7kVQIBycH0fD+oi5pezQETxdHKmQKGk1eQEYldK+jw5GxPfZ9z7Mk0Qnhf1W1m3w//EUn5BDmSZsbR44QQLBEqrBHqOrmSKaQAxdnLArCrxZcM7A7ZKs4ioRq8LFC+NpC3WCBJsvpVw5edm9iEXFuyNfxXAgSwfrFQ1c0iNda8AdejvUgnktOtJQQxmcfFzGglc5WVCj7oDgFqU18boeFSs52CUh8LE8BIVQDT1ABrB0HtgSEYlX5doJnCwv9TXocKCaKbnwhdDKPq4lf3SwU3HLq4V/+WYhHVMa/3b4IlfyikAduCkcBc7mQ3/z/Qq/cTuikhkzB12Ae/mcJC9U+Vo8Ej1gWAtgbeGgFsAMHr50BIWOLCbezvhpBFUdY6EJuJ/QDW0XoMX60zZ0AAAAASUVORK5CYII=";
            break;
    }
    const c4ShapeElem = elem.append("g");
    c4ShapeElem.attr("class", "person-man");
    const rect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$JSJVCQXG$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getNoteRect"])();
    switch(c4Shape.typeC4Shape.text){
        case "person":
        case "external_person":
        case "system":
        case "external_system":
        case "container":
        case "external_container":
        case "component":
        case "external_component":
            rect.x = c4Shape.x;
            rect.y = c4Shape.y;
            rect.fill = fillColor;
            rect.width = c4Shape.width;
            rect.height = c4Shape.height;
            rect.stroke = strokeColor;
            rect.rx = 2.5;
            rect.ry = 2.5;
            rect.attrs = {
                "stroke-width": 0.5
            };
            drawRect2(c4ShapeElem, rect);
            break;
        case "system_db":
        case "external_system_db":
        case "container_db":
        case "external_container_db":
        case "component_db":
        case "external_component_db":
            c4ShapeElem.append("path").attr("fill", fillColor).attr("stroke-width", "0.5").attr("stroke", strokeColor).attr("d", "Mstartx,startyc0,-10 half,-10 half,-10c0,0 half,0 half,10l0,heightc0,10 -half,10 -half,10c0,0 -half,0 -half,-10l0,-height".replaceAll("startx", c4Shape.x).replaceAll("starty", c4Shape.y).replaceAll("half", c4Shape.width / 2).replaceAll("height", c4Shape.height));
            c4ShapeElem.append("path").attr("fill", "none").attr("stroke-width", "0.5").attr("stroke", strokeColor).attr("d", "Mstartx,startyc0,10 half,10 half,10c0,0 half,0 half,-10".replaceAll("startx", c4Shape.x).replaceAll("starty", c4Shape.y).replaceAll("half", c4Shape.width / 2));
            break;
        case "system_queue":
        case "external_system_queue":
        case "container_queue":
        case "external_container_queue":
        case "component_queue":
        case "external_component_queue":
            c4ShapeElem.append("path").attr("fill", fillColor).attr("stroke-width", "0.5").attr("stroke", strokeColor).attr("d", "Mstartx,startylwidth,0c5,0 5,half 5,halfc0,0 0,half -5,halfl-width,0c-5,0 -5,-half -5,-halfc0,0 0,-half 5,-half".replaceAll("startx", c4Shape.x).replaceAll("starty", c4Shape.y).replaceAll("width", c4Shape.width).replaceAll("half", c4Shape.height / 2));
            c4ShapeElem.append("path").attr("fill", "none").attr("stroke-width", "0.5").attr("stroke", strokeColor).attr("d", "Mstartx,startyc-5,0 -5,half -5,halfc0,half 5,half 5,half".replaceAll("startx", c4Shape.x + c4Shape.width).replaceAll("starty", c4Shape.y).replaceAll("half", c4Shape.height / 2));
            break;
    }
    let c4ShapeFontConf = getC4ShapeFont(conf2, c4Shape.typeC4Shape.text);
    c4ShapeElem.append("text").attr("fill", fontColor).attr("font-family", c4ShapeFontConf.fontFamily).attr("font-size", c4ShapeFontConf.fontSize - 2).attr("font-style", "italic").attr("lengthAdjust", "spacing").attr("textLength", c4Shape.typeC4Shape.width).attr("x", c4Shape.x + c4Shape.width / 2 - c4Shape.typeC4Shape.width / 2).attr("y", c4Shape.y + c4Shape.typeC4Shape.Y).text("<<" + c4Shape.typeC4Shape.text + ">>");
    switch(c4Shape.typeC4Shape.text){
        case "person":
        case "external_person":
            drawImage(c4ShapeElem, 48, 48, c4Shape.x + c4Shape.width / 2 - 24, c4Shape.y + c4Shape.image.Y, personImg);
            break;
    }
    let textFontConf = conf2[c4Shape.typeC4Shape.text + "Font"]();
    textFontConf.fontWeight = "bold";
    textFontConf.fontSize = textFontConf.fontSize + 2;
    textFontConf.fontColor = fontColor;
    _drawTextCandidateFunc(conf2)(c4Shape.label.text, c4ShapeElem, c4Shape.x, c4Shape.y + c4Shape.label.Y, c4Shape.width, c4Shape.height, {
        fill: fontColor
    }, textFontConf);
    textFontConf = conf2[c4Shape.typeC4Shape.text + "Font"]();
    textFontConf.fontColor = fontColor;
    if (c4Shape.techn && c4Shape.techn?.text !== "") {
        _drawTextCandidateFunc(conf2)(c4Shape.techn.text, c4ShapeElem, c4Shape.x, c4Shape.y + c4Shape.techn.Y, c4Shape.width, c4Shape.height, {
            fill: fontColor,
            "font-style": "italic"
        }, textFontConf);
    } else if (c4Shape.type && c4Shape.type.text !== "") {
        _drawTextCandidateFunc(conf2)(c4Shape.type.text, c4ShapeElem, c4Shape.x, c4Shape.y + c4Shape.type.Y, c4Shape.width, c4Shape.height, {
            fill: fontColor,
            "font-style": "italic"
        }, textFontConf);
    }
    if (c4Shape.descr && c4Shape.descr.text !== "") {
        textFontConf = conf2.personFont();
        textFontConf.fontColor = fontColor;
        _drawTextCandidateFunc(conf2)(c4Shape.descr.text, c4ShapeElem, c4Shape.x, c4Shape.y + c4Shape.descr.Y, c4Shape.width, c4Shape.height, {
            fill: fontColor
        }, textFontConf);
    }
    return c4Shape.height;
}, "drawC4Shape");
var insertDatabaseIcon = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(elem) {
    elem.append("defs").append("symbol").attr("id", "database").attr("fill-rule", "evenodd").attr("clip-rule", "evenodd").append("path").attr("transform", "scale(.5)").attr("d", "M12.258.001l.256.004.255.005.253.008.251.01.249.012.247.015.246.016.242.019.241.02.239.023.236.024.233.027.231.028.229.031.225.032.223.034.22.036.217.038.214.04.211.041.208.043.205.045.201.046.198.048.194.05.191.051.187.053.183.054.18.056.175.057.172.059.168.06.163.061.16.063.155.064.15.066.074.033.073.033.071.034.07.034.069.035.068.035.067.035.066.035.064.036.064.036.062.036.06.036.06.037.058.037.058.037.055.038.055.038.053.038.052.038.051.039.05.039.048.039.047.039.045.04.044.04.043.04.041.04.04.041.039.041.037.041.036.041.034.041.033.042.032.042.03.042.029.042.027.042.026.043.024.043.023.043.021.043.02.043.018.044.017.043.015.044.013.044.012.044.011.045.009.044.007.045.006.045.004.045.002.045.001.045v17l-.001.045-.002.045-.004.045-.006.045-.007.045-.009.044-.011.045-.012.044-.013.044-.015.044-.017.043-.018.044-.02.043-.021.043-.023.043-.024.043-.026.043-.027.042-.029.042-.03.042-.032.042-.033.042-.034.041-.036.041-.037.041-.039.041-.04.041-.041.04-.043.04-.044.04-.045.04-.047.039-.048.039-.05.039-.051.039-.052.038-.053.038-.055.038-.055.038-.058.037-.058.037-.06.037-.06.036-.062.036-.064.036-.064.036-.066.035-.067.035-.068.035-.069.035-.07.034-.071.034-.073.033-.074.033-.15.066-.155.064-.16.063-.163.061-.168.06-.172.059-.175.057-.18.056-.183.054-.187.053-.191.051-.194.05-.198.048-.201.046-.205.045-.208.043-.211.041-.214.04-.217.038-.22.036-.223.034-.225.032-.229.031-.231.028-.233.027-.236.024-.239.023-.241.02-.242.019-.246.016-.247.015-.249.012-.251.01-.253.008-.255.005-.256.004-.258.001-.258-.001-.256-.004-.255-.005-.253-.008-.251-.01-.249-.012-.247-.015-.245-.016-.243-.019-.241-.02-.238-.023-.236-.024-.234-.027-.231-.028-.228-.031-.226-.032-.223-.034-.22-.036-.217-.038-.214-.04-.211-.041-.208-.043-.204-.045-.201-.046-.198-.048-.195-.05-.19-.051-.187-.053-.184-.054-.179-.056-.176-.057-.172-.059-.167-.06-.164-.061-.159-.063-.155-.064-.151-.066-.074-.033-.072-.033-.072-.034-.07-.034-.069-.035-.068-.035-.067-.035-.066-.035-.064-.036-.063-.036-.062-.036-.061-.036-.06-.037-.058-.037-.057-.037-.056-.038-.055-.038-.053-.038-.052-.038-.051-.039-.049-.039-.049-.039-.046-.039-.046-.04-.044-.04-.043-.04-.041-.04-.04-.041-.039-.041-.037-.041-.036-.041-.034-.041-.033-.042-.032-.042-.03-.042-.029-.042-.027-.042-.026-.043-.024-.043-.023-.043-.021-.043-.02-.043-.018-.044-.017-.043-.015-.044-.013-.044-.012-.044-.011-.045-.009-.044-.007-.045-.006-.045-.004-.045-.002-.045-.001-.045v-17l.001-.045.002-.045.004-.045.006-.045.007-.045.009-.044.011-.045.012-.044.013-.044.015-.044.017-.043.018-.044.02-.043.021-.043.023-.043.024-.043.026-.043.027-.042.029-.042.03-.042.032-.042.033-.042.034-.041.036-.041.037-.041.039-.041.04-.041.041-.04.043-.04.044-.04.046-.04.046-.039.049-.039.049-.039.051-.039.052-.038.053-.038.055-.038.056-.038.057-.037.058-.037.06-.037.061-.036.062-.036.063-.036.064-.036.066-.035.067-.035.068-.035.069-.035.07-.034.072-.034.072-.033.074-.033.151-.066.155-.064.159-.063.164-.061.167-.06.172-.059.176-.057.179-.056.184-.054.187-.053.19-.051.195-.05.198-.048.201-.046.204-.045.208-.043.211-.041.214-.04.217-.038.22-.036.223-.034.226-.032.228-.031.231-.028.234-.027.236-.024.238-.023.241-.02.243-.019.245-.016.247-.015.249-.012.251-.01.253-.008.255-.005.256-.004.258-.001.258.001zm-9.258 20.499v.01l.001.021.003.021.004.022.005.021.006.022.007.022.009.023.01.022.011.023.012.023.013.023.015.023.016.024.017.023.018.024.019.024.021.024.022.025.023.024.024.025.052.049.056.05.061.051.066.051.07.051.075.051.079.052.084.052.088.052.092.052.097.052.102.051.105.052.11.052.114.051.119.051.123.051.127.05.131.05.135.05.139.048.144.049.147.047.152.047.155.047.16.045.163.045.167.043.171.043.176.041.178.041.183.039.187.039.19.037.194.035.197.035.202.033.204.031.209.03.212.029.216.027.219.025.222.024.226.021.23.02.233.018.236.016.24.015.243.012.246.01.249.008.253.005.256.004.259.001.26-.001.257-.004.254-.005.25-.008.247-.011.244-.012.241-.014.237-.016.233-.018.231-.021.226-.021.224-.024.22-.026.216-.027.212-.028.21-.031.205-.031.202-.034.198-.034.194-.036.191-.037.187-.039.183-.04.179-.04.175-.042.172-.043.168-.044.163-.045.16-.046.155-.046.152-.047.148-.048.143-.049.139-.049.136-.05.131-.05.126-.05.123-.051.118-.052.114-.051.11-.052.106-.052.101-.052.096-.052.092-.052.088-.053.083-.051.079-.052.074-.052.07-.051.065-.051.06-.051.056-.05.051-.05.023-.024.023-.025.021-.024.02-.024.019-.024.018-.024.017-.024.015-.023.014-.024.013-.023.012-.023.01-.023.01-.022.008-.022.006-.022.006-.022.004-.022.004-.021.001-.021.001-.021v-4.127l-.077.055-.08.053-.083.054-.085.053-.087.052-.09.052-.093.051-.095.05-.097.05-.1.049-.102.049-.105.048-.106.047-.109.047-.111.046-.114.045-.115.045-.118.044-.12.043-.122.042-.124.042-.126.041-.128.04-.13.04-.132.038-.134.038-.135.037-.138.037-.139.035-.142.035-.143.034-.144.033-.147.032-.148.031-.15.03-.151.03-.153.029-.154.027-.156.027-.158.026-.159.025-.161.024-.162.023-.163.022-.165.021-.166.02-.167.019-.169.018-.169.017-.171.016-.173.015-.173.014-.175.013-.175.012-.177.011-.178.01-.179.008-.179.008-.181.006-.182.005-.182.004-.184.003-.184.002h-.37l-.184-.002-.184-.003-.182-.004-.182-.005-.181-.006-.179-.008-.179-.008-.178-.01-.176-.011-.176-.012-.175-.013-.173-.014-.172-.015-.171-.016-.17-.017-.169-.018-.167-.019-.166-.02-.165-.021-.163-.022-.162-.023-.161-.024-.159-.025-.157-.026-.156-.027-.155-.027-.153-.029-.151-.03-.15-.03-.148-.031-.146-.032-.145-.033-.143-.034-.141-.035-.14-.035-.137-.037-.136-.037-.134-.038-.132-.038-.13-.04-.128-.04-.126-.041-.124-.042-.122-.042-.12-.044-.117-.043-.116-.045-.113-.045-.112-.046-.109-.047-.106-.047-.105-.048-.102-.049-.1-.049-.097-.05-.095-.05-.093-.052-.09-.051-.087-.052-.085-.053-.083-.054-.08-.054-.077-.054v4.127zm0-5.654v.011l.001.021.003.021.004.021.005.022.006.022.007.022.009.022.01.022.011.023.012.023.013.023.015.024.016.023.017.024.018.024.019.024.021.024.022.024.023.025.024.024.052.05.056.05.061.05.066.051.07.051.075.052.079.051.084.052.088.052.092.052.097.052.102.052.105.052.11.051.114.051.119.052.123.05.127.051.131.05.135.049.139.049.144.048.147.048.152.047.155.046.16.045.163.045.167.044.171.042.176.042.178.04.183.04.187.038.19.037.194.036.197.034.202.033.204.032.209.03.212.028.216.027.219.025.222.024.226.022.23.02.233.018.236.016.24.014.243.012.246.01.249.008.253.006.256.003.259.001.26-.001.257-.003.254-.006.25-.008.247-.01.244-.012.241-.015.237-.016.233-.018.231-.02.226-.022.224-.024.22-.025.216-.027.212-.029.21-.03.205-.032.202-.033.198-.035.194-.036.191-.037.187-.039.183-.039.179-.041.175-.042.172-.043.168-.044.163-.045.16-.045.155-.047.152-.047.148-.048.143-.048.139-.05.136-.049.131-.05.126-.051.123-.051.118-.051.114-.052.11-.052.106-.052.101-.052.096-.052.092-.052.088-.052.083-.052.079-.052.074-.051.07-.052.065-.051.06-.05.056-.051.051-.049.023-.025.023-.024.021-.025.02-.024.019-.024.018-.024.017-.024.015-.023.014-.023.013-.024.012-.022.01-.023.01-.023.008-.022.006-.022.006-.022.004-.021.004-.022.001-.021.001-.021v-4.139l-.077.054-.08.054-.083.054-.085.052-.087.053-.09.051-.093.051-.095.051-.097.05-.1.049-.102.049-.105.048-.106.047-.109.047-.111.046-.114.045-.115.044-.118.044-.12.044-.122.042-.124.042-.126.041-.128.04-.13.039-.132.039-.134.038-.135.037-.138.036-.139.036-.142.035-.143.033-.144.033-.147.033-.148.031-.15.03-.151.03-.153.028-.154.028-.156.027-.158.026-.159.025-.161.024-.162.023-.163.022-.165.021-.166.02-.167.019-.169.018-.169.017-.171.016-.173.015-.173.014-.175.013-.175.012-.177.011-.178.009-.179.009-.179.007-.181.007-.182.005-.182.004-.184.003-.184.002h-.37l-.184-.002-.184-.003-.182-.004-.182-.005-.181-.007-.179-.007-.179-.009-.178-.009-.176-.011-.176-.012-.175-.013-.173-.014-.172-.015-.171-.016-.17-.017-.169-.018-.167-.019-.166-.02-.165-.021-.163-.022-.162-.023-.161-.024-.159-.025-.157-.026-.156-.027-.155-.028-.153-.028-.151-.03-.15-.03-.148-.031-.146-.033-.145-.033-.143-.033-.141-.035-.14-.036-.137-.036-.136-.037-.134-.038-.132-.039-.13-.039-.128-.04-.126-.041-.124-.042-.122-.043-.12-.043-.117-.044-.116-.044-.113-.046-.112-.046-.109-.046-.106-.047-.105-.048-.102-.049-.1-.049-.097-.05-.095-.051-.093-.051-.09-.051-.087-.053-.085-.052-.083-.054-.08-.054-.077-.054v4.139zm0-5.666v.011l.001.02.003.022.004.021.005.022.006.021.007.022.009.023.01.022.011.023.012.023.013.023.015.023.016.024.017.024.018.023.019.024.021.025.022.024.023.024.024.025.052.05.056.05.061.05.066.051.07.051.075.052.079.051.084.052.088.052.092.052.097.052.102.052.105.051.11.052.114.051.119.051.123.051.127.05.131.05.135.05.139.049.144.048.147.048.152.047.155.046.16.045.163.045.167.043.171.043.176.042.178.04.183.04.187.038.19.037.194.036.197.034.202.033.204.032.209.03.212.028.216.027.219.025.222.024.226.021.23.02.233.018.236.017.24.014.243.012.246.01.249.008.253.006.256.003.259.001.26-.001.257-.003.254-.006.25-.008.247-.01.244-.013.241-.014.237-.016.233-.018.231-.02.226-.022.224-.024.22-.025.216-.027.212-.029.21-.03.205-.032.202-.033.198-.035.194-.036.191-.037.187-.039.183-.039.179-.041.175-.042.172-.043.168-.044.163-.045.16-.045.155-.047.152-.047.148-.048.143-.049.139-.049.136-.049.131-.051.126-.05.123-.051.118-.052.114-.051.11-.052.106-.052.101-.052.096-.052.092-.052.088-.052.083-.052.079-.052.074-.052.07-.051.065-.051.06-.051.056-.05.051-.049.023-.025.023-.025.021-.024.02-.024.019-.024.018-.024.017-.024.015-.023.014-.024.013-.023.012-.023.01-.022.01-.023.008-.022.006-.022.006-.022.004-.022.004-.021.001-.021.001-.021v-4.153l-.077.054-.08.054-.083.053-.085.053-.087.053-.09.051-.093.051-.095.051-.097.05-.1.049-.102.048-.105.048-.106.048-.109.046-.111.046-.114.046-.115.044-.118.044-.12.043-.122.043-.124.042-.126.041-.128.04-.13.039-.132.039-.134.038-.135.037-.138.036-.139.036-.142.034-.143.034-.144.033-.147.032-.148.032-.15.03-.151.03-.153.028-.154.028-.156.027-.158.026-.159.024-.161.024-.162.023-.163.023-.165.021-.166.02-.167.019-.169.018-.169.017-.171.016-.173.015-.173.014-.175.013-.175.012-.177.01-.178.01-.179.009-.179.007-.181.006-.182.006-.182.004-.184.003-.184.001-.185.001-.185-.001-.184-.001-.184-.003-.182-.004-.182-.006-.181-.006-.179-.007-.179-.009-.178-.01-.176-.01-.176-.012-.175-.013-.173-.014-.172-.015-.171-.016-.17-.017-.169-.018-.167-.019-.166-.02-.165-.021-.163-.023-.162-.023-.161-.024-.159-.024-.157-.026-.156-.027-.155-.028-.153-.028-.151-.03-.15-.03-.148-.032-.146-.032-.145-.033-.143-.034-.141-.034-.14-.036-.137-.036-.136-.037-.134-.038-.132-.039-.13-.039-.128-.041-.126-.041-.124-.041-.122-.043-.12-.043-.117-.044-.116-.044-.113-.046-.112-.046-.109-.046-.106-.048-.105-.048-.102-.048-.1-.05-.097-.049-.095-.051-.093-.051-.09-.052-.087-.052-.085-.053-.083-.053-.08-.054-.077-.054v4.153zm8.74-8.179l-.257.004-.254.005-.25.008-.247.011-.244.012-.241.014-.237.016-.233.018-.231.021-.226.022-.224.023-.22.026-.216.027-.212.028-.21.031-.205.032-.202.033-.198.034-.194.036-.191.038-.187.038-.183.04-.179.041-.175.042-.172.043-.168.043-.163.045-.16.046-.155.046-.152.048-.148.048-.143.048-.139.049-.136.05-.131.05-.126.051-.123.051-.118.051-.114.052-.11.052-.106.052-.101.052-.096.052-.092.052-.088.052-.083.052-.079.052-.074.051-.07.052-.065.051-.06.05-.056.05-.051.05-.023.025-.023.024-.021.024-.02.025-.019.024-.018.024-.017.023-.015.024-.014.023-.013.023-.012.023-.01.023-.01.022-.008.022-.006.023-.006.021-.004.022-.004.021-.001.021-.001.021.001.021.001.021.004.021.004.022.006.021.006.023.008.022.01.022.01.023.012.023.013.023.014.023.015.024.017.023.018.024.019.024.02.025.021.024.023.024.023.025.051.05.056.05.06.05.065.051.07.052.074.051.079.052.083.052.088.052.092.052.096.052.101.052.106.052.11.052.114.052.118.051.123.051.126.051.131.05.136.05.139.049.143.048.148.048.152.048.155.046.16.046.163.045.168.043.172.043.175.042.179.041.183.04.187.038.191.038.194.036.198.034.202.033.205.032.21.031.212.028.216.027.22.026.224.023.226.022.231.021.233.018.237.016.241.014.244.012.247.011.25.008.254.005.257.004.26.001.26-.001.257-.004.254-.005.25-.008.247-.011.244-.012.241-.014.237-.016.233-.018.231-.021.226-.022.224-.023.22-.026.216-.027.212-.028.21-.031.205-.032.202-.033.198-.034.194-.036.191-.038.187-.038.183-.04.179-.041.175-.042.172-.043.168-.043.163-.045.16-.046.155-.046.152-.048.148-.048.143-.048.139-.049.136-.05.131-.05.126-.051.123-.051.118-.051.114-.052.11-.052.106-.052.101-.052.096-.052.092-.052.088-.052.083-.052.079-.052.074-.051.07-.052.065-.051.06-.05.056-.05.051-.05.023-.025.023-.024.021-.024.02-.025.019-.024.018-.024.017-.023.015-.024.014-.023.013-.023.012-.023.01-.023.01-.022.008-.022.006-.023.006-.021.004-.022.004-.021.001-.021.001-.021-.001-.021-.001-.021-.004-.021-.004-.022-.006-.021-.006-.023-.008-.022-.01-.022-.01-.023-.012-.023-.013-.023-.014-.023-.015-.024-.017-.023-.018-.024-.019-.024-.02-.025-.021-.024-.023-.024-.023-.025-.051-.05-.056-.05-.06-.05-.065-.051-.07-.052-.074-.051-.079-.052-.083-.052-.088-.052-.092-.052-.096-.052-.101-.052-.106-.052-.11-.052-.114-.052-.118-.051-.123-.051-.126-.051-.131-.05-.136-.05-.139-.049-.143-.048-.148-.048-.152-.048-.155-.046-.16-.046-.163-.045-.168-.043-.172-.043-.175-.042-.179-.041-.183-.04-.187-.038-.191-.038-.194-.036-.198-.034-.202-.033-.205-.032-.21-.031-.212-.028-.216-.027-.22-.026-.224-.023-.226-.022-.231-.021-.233-.018-.237-.016-.241-.014-.244-.012-.247-.011-.25-.008-.254-.005-.257-.004-.26-.001-.26.001z");
}, "insertDatabaseIcon");
var insertComputerIcon = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(elem) {
    elem.append("defs").append("symbol").attr("id", "computer").attr("width", "24").attr("height", "24").append("path").attr("transform", "scale(.5)").attr("d", "M2 2v13h20v-13h-20zm18 11h-16v-9h16v9zm-10.228 6l.466-1h3.524l.467 1h-4.457zm14.228 3h-24l2-6h2.104l-1.33 4h18.45l-1.297-4h2.073l2 6zm-5-10h-14v-7h14v7z");
}, "insertComputerIcon");
var insertClockIcon = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(elem) {
    elem.append("defs").append("symbol").attr("id", "clock").attr("width", "24").attr("height", "24").append("path").attr("transform", "scale(.5)").attr("d", "M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.848 12.459c.202.038.202.333.001.372-1.907.361-6.045 1.111-6.547 1.111-.719 0-1.301-.582-1.301-1.301 0-.512.77-5.447 1.125-7.445.034-.192.312-.181.343.014l.985 6.238 5.394 1.011z");
}, "insertClockIcon");
var insertArrowHead = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(elem) {
    elem.append("defs").append("marker").attr("id", "arrowhead").attr("refX", 9).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto").append("path").attr("d", "M 0 0 L 10 5 L 0 10 z");
}, "insertArrowHead");
var insertArrowEnd = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(elem) {
    elem.append("defs").append("marker").attr("id", "arrowend").attr("refX", 1).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto").append("path").attr("d", "M 10 0 L 0 5 L 10 10 z");
}, "insertArrowEnd");
var insertArrowFilledHead = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(elem) {
    elem.append("defs").append("marker").attr("id", "filled-head").attr("refX", 18).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L14,7 L9,1 Z");
}, "insertArrowFilledHead");
var insertDynamicNumber = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(elem) {
    elem.append("defs").append("marker").attr("id", "sequencenumber").attr("refX", 15).attr("refY", 15).attr("markerWidth", 60).attr("markerHeight", 40).attr("orient", "auto").append("circle").attr("cx", 15).attr("cy", 15).attr("r", 6);
}, "insertDynamicNumber");
var insertArrowCrossHead = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(elem) {
    const defs = elem.append("defs");
    const marker = defs.append("marker").attr("id", "crosshead").attr("markerWidth", 15).attr("markerHeight", 8).attr("orient", "auto").attr("refX", 16).attr("refY", 4);
    marker.append("path").attr("fill", "black").attr("stroke", "#000000").style("stroke-dasharray", "0, 0").attr("stroke-width", "1px").attr("d", "M 9,2 V 6 L16,4 Z");
    marker.append("path").attr("fill", "none").attr("stroke", "#000000").style("stroke-dasharray", "0, 0").attr("stroke-width", "1px").attr("d", "M 0,1 L 6,7 M 6,1 L 0,7");
}, "insertArrowCrossHead");
var getC4ShapeFont = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((cnf, typeC4Shape)=>{
    return {
        fontFamily: cnf[typeC4Shape + "FontFamily"],
        fontSize: cnf[typeC4Shape + "FontSize"],
        fontWeight: cnf[typeC4Shape + "FontWeight"]
    };
}, "getC4ShapeFont");
var _drawTextCandidateFunc = /* @__PURE__ */ function() {
    function byText(content, g, x, y, width, height, textAttrs) {
        const text = g.append("text").attr("x", x + width / 2).attr("y", y + height / 2 + 5).style("text-anchor", "middle").text(content);
        _setTextAttrs(text, textAttrs);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(byText, "byText");
    function byTspan(content, g, x, y, width, height, textAttrs, conf2) {
        const { fontSize, fontFamily, fontWeight } = conf2;
        const lines = content.split(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["common_default"].lineBreakRegex);
        for(let i = 0; i < lines.length; i++){
            const dy = i * fontSize - fontSize * (lines.length - 1) / 2;
            const text = g.append("text").attr("x", x + width / 2).attr("y", y).style("text-anchor", "middle").attr("dominant-baseline", "middle").style("font-size", fontSize).style("font-weight", fontWeight).style("font-family", fontFamily);
            text.append("tspan").attr("dy", dy).text(lines[i]).attr("alignment-baseline", "mathematical");
            _setTextAttrs(text, textAttrs);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(byTspan, "byTspan");
    function byFo(content, g, x, y, width, height, textAttrs, conf2) {
        const s = g.append("switch");
        const f = s.append("foreignObject").attr("x", x).attr("y", y).attr("width", width).attr("height", height);
        const text = f.append("xhtml:div").style("display", "table").style("height", "100%").style("width", "100%");
        text.append("div").style("display", "table-cell").style("text-align", "center").style("vertical-align", "middle").text(content);
        byTspan(content, s, x, y, width, height, textAttrs, conf2);
        _setTextAttrs(text, textAttrs);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(byFo, "byFo");
    function _setTextAttrs(toText, fromTextAttrsDict) {
        for(const key in fromTextAttrsDict){
            if (fromTextAttrsDict.hasOwnProperty(key)) {
                toText.attr(key, fromTextAttrsDict[key]);
            }
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(_setTextAttrs, "_setTextAttrs");
    return function(conf2) {
        return conf2.textPlacement === "fo" ? byFo : conf2.textPlacement === "old" ? byText : byTspan;
    };
}();
var svgDraw_default = {
    drawRect: drawRect2,
    drawBoundary,
    drawC4Shape,
    drawRels,
    drawImage,
    insertArrowHead,
    insertArrowEnd,
    insertArrowFilledHead,
    insertDynamicNumber,
    insertArrowCrossHead,
    insertDatabaseIcon,
    insertComputerIcon,
    insertClockIcon
};
// src/diagrams/c4/c4Renderer.js
var globalBoundaryMaxX = 0;
var globalBoundaryMaxY = 0;
var c4ShapeInRow2 = 4;
var c4BoundaryInRow2 = 2;
parser.yy = c4Db_default;
var conf = {};
var Bounds = class {
    static{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(this, "Bounds");
    }
    constructor(diagObj){
        this.name = "";
        this.data = {};
        this.data.startx = void 0;
        this.data.stopx = void 0;
        this.data.starty = void 0;
        this.data.stopy = void 0;
        this.data.widthLimit = void 0;
        this.nextData = {};
        this.nextData.startx = void 0;
        this.nextData.stopx = void 0;
        this.nextData.starty = void 0;
        this.nextData.stopy = void 0;
        this.nextData.cnt = 0;
        setConf(diagObj.db.getConfig());
    }
    setData(startx, stopx, starty, stopy) {
        this.nextData.startx = this.data.startx = startx;
        this.nextData.stopx = this.data.stopx = stopx;
        this.nextData.starty = this.data.starty = starty;
        this.nextData.stopy = this.data.stopy = stopy;
    }
    updateVal(obj, key, val, fun) {
        if (obj[key] === void 0) {
            obj[key] = val;
        } else {
            obj[key] = fun(val, obj[key]);
        }
    }
    insert(c4Shape) {
        this.nextData.cnt = this.nextData.cnt + 1;
        let _startx = this.nextData.startx === this.nextData.stopx ? this.nextData.stopx + c4Shape.margin : this.nextData.stopx + c4Shape.margin * 2;
        let _stopx = _startx + c4Shape.width;
        let _starty = this.nextData.starty + c4Shape.margin * 2;
        let _stopy = _starty + c4Shape.height;
        if (_startx >= this.data.widthLimit || _stopx >= this.data.widthLimit || this.nextData.cnt > c4ShapeInRow2) {
            _startx = this.nextData.startx + c4Shape.margin + conf.nextLinePaddingX;
            _starty = this.nextData.stopy + c4Shape.margin * 2;
            this.nextData.stopx = _stopx = _startx + c4Shape.width;
            this.nextData.starty = this.nextData.stopy;
            this.nextData.stopy = _stopy = _starty + c4Shape.height;
            this.nextData.cnt = 1;
        }
        c4Shape.x = _startx;
        c4Shape.y = _starty;
        this.updateVal(this.data, "startx", _startx, Math.min);
        this.updateVal(this.data, "starty", _starty, Math.min);
        this.updateVal(this.data, "stopx", _stopx, Math.max);
        this.updateVal(this.data, "stopy", _stopy, Math.max);
        this.updateVal(this.nextData, "startx", _startx, Math.min);
        this.updateVal(this.nextData, "starty", _starty, Math.min);
        this.updateVal(this.nextData, "stopx", _stopx, Math.max);
        this.updateVal(this.nextData, "stopy", _stopy, Math.max);
    }
    init(diagObj) {
        this.name = "";
        this.data = {
            startx: void 0,
            stopx: void 0,
            starty: void 0,
            stopy: void 0,
            widthLimit: void 0
        };
        this.nextData = {
            startx: void 0,
            stopx: void 0,
            starty: void 0,
            stopy: void 0,
            cnt: 0
        };
        setConf(diagObj.db.getConfig());
    }
    bumpLastMargin(margin) {
        this.data.stopx += margin;
        this.data.stopy += margin;
    }
};
var setConf = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(cnf) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assignWithDepth_default"])(conf, cnf);
    if (cnf.fontFamily) {
        conf.personFontFamily = conf.systemFontFamily = conf.messageFontFamily = cnf.fontFamily;
    }
    if (cnf.fontSize) {
        conf.personFontSize = conf.systemFontSize = conf.messageFontSize = cnf.fontSize;
    }
    if (cnf.fontWeight) {
        conf.personFontWeight = conf.systemFontWeight = conf.messageFontWeight = cnf.fontWeight;
    }
}, "setConf");
var c4ShapeFont = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((cnf, typeC4Shape)=>{
    return {
        fontFamily: cnf[typeC4Shape + "FontFamily"],
        fontSize: cnf[typeC4Shape + "FontSize"],
        fontWeight: cnf[typeC4Shape + "FontWeight"]
    };
}, "c4ShapeFont");
var boundaryFont = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((cnf)=>{
    return {
        fontFamily: cnf.boundaryFontFamily,
        fontSize: cnf.boundaryFontSize,
        fontWeight: cnf.boundaryFontWeight
    };
}, "boundaryFont");
var messageFont = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((cnf)=>{
    return {
        fontFamily: cnf.messageFontFamily,
        fontSize: cnf.messageFontSize,
        fontWeight: cnf.messageFontWeight
    };
}, "messageFont");
function calcC4ShapeTextWH(textType, c4Shape, c4ShapeTextWrap, textConf, textLimitWidth) {
    if (!c4Shape[textType].width) {
        if (c4ShapeTextWrap) {
            c4Shape[textType].text = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$GEFDOKGD$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wrapLabel"])(c4Shape[textType].text, textLimitWidth, textConf);
            c4Shape[textType].textLines = c4Shape[textType].text.split(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["common_default"].lineBreakRegex).length;
            c4Shape[textType].width = textLimitWidth;
            c4Shape[textType].height = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$GEFDOKGD$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateTextHeight"])(c4Shape[textType].text, textConf);
        } else {
            let lines = c4Shape[textType].text.split(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["common_default"].lineBreakRegex);
            c4Shape[textType].textLines = lines.length;
            let lineHeight = 0;
            c4Shape[textType].height = 0;
            c4Shape[textType].width = 0;
            for (const line of lines){
                c4Shape[textType].width = Math.max((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$GEFDOKGD$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateTextWidth"])(line, textConf), c4Shape[textType].width);
                lineHeight = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$GEFDOKGD$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateTextHeight"])(line, textConf);
                c4Shape[textType].height = c4Shape[textType].height + lineHeight;
            }
        }
    }
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(calcC4ShapeTextWH, "calcC4ShapeTextWH");
var drawBoundary2 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(diagram2, boundary, bounds) {
    boundary.x = bounds.data.startx;
    boundary.y = bounds.data.starty;
    boundary.width = bounds.data.stopx - bounds.data.startx;
    boundary.height = bounds.data.stopy - bounds.data.starty;
    boundary.label.y = conf.c4ShapeMargin - 35;
    let boundaryTextWrap = boundary.wrap && conf.wrap;
    let boundaryLabelConf = boundaryFont(conf);
    boundaryLabelConf.fontSize = boundaryLabelConf.fontSize + 2;
    boundaryLabelConf.fontWeight = "bold";
    let textLimitWidth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$GEFDOKGD$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateTextWidth"])(boundary.label.text, boundaryLabelConf);
    calcC4ShapeTextWH("label", boundary, boundaryTextWrap, boundaryLabelConf, textLimitWidth);
    svgDraw_default.drawBoundary(diagram2, boundary, conf);
}, "drawBoundary");
var drawC4ShapeArray = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(currentBounds, diagram2, c4ShapeArray2, c4ShapeKeys) {
    let Y = 0;
    for (const c4ShapeKey of c4ShapeKeys){
        Y = 0;
        const c4Shape = c4ShapeArray2[c4ShapeKey];
        let c4ShapeTypeConf = c4ShapeFont(conf, c4Shape.typeC4Shape.text);
        c4ShapeTypeConf.fontSize = c4ShapeTypeConf.fontSize - 2;
        c4Shape.typeC4Shape.width = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$GEFDOKGD$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateTextWidth"])("\xAB" + c4Shape.typeC4Shape.text + "\xBB", c4ShapeTypeConf);
        c4Shape.typeC4Shape.height = c4ShapeTypeConf.fontSize + 2;
        c4Shape.typeC4Shape.Y = conf.c4ShapePadding;
        Y = c4Shape.typeC4Shape.Y + c4Shape.typeC4Shape.height - 4;
        c4Shape.image = {
            width: 0,
            height: 0,
            Y: 0
        };
        switch(c4Shape.typeC4Shape.text){
            case "person":
            case "external_person":
                c4Shape.image.width = 48;
                c4Shape.image.height = 48;
                c4Shape.image.Y = Y;
                Y = c4Shape.image.Y + c4Shape.image.height;
                break;
        }
        if (c4Shape.sprite) {
            c4Shape.image.width = 48;
            c4Shape.image.height = 48;
            c4Shape.image.Y = Y;
            Y = c4Shape.image.Y + c4Shape.image.height;
        }
        let c4ShapeTextWrap = c4Shape.wrap && conf.wrap;
        let textLimitWidth = conf.width - conf.c4ShapePadding * 2;
        let c4ShapeLabelConf = c4ShapeFont(conf, c4Shape.typeC4Shape.text);
        c4ShapeLabelConf.fontSize = c4ShapeLabelConf.fontSize + 2;
        c4ShapeLabelConf.fontWeight = "bold";
        calcC4ShapeTextWH("label", c4Shape, c4ShapeTextWrap, c4ShapeLabelConf, textLimitWidth);
        c4Shape.label.Y = Y + 8;
        Y = c4Shape.label.Y + c4Shape.label.height;
        if (c4Shape.type && c4Shape.type.text !== "") {
            c4Shape.type.text = "[" + c4Shape.type.text + "]";
            let c4ShapeTypeConf2 = c4ShapeFont(conf, c4Shape.typeC4Shape.text);
            calcC4ShapeTextWH("type", c4Shape, c4ShapeTextWrap, c4ShapeTypeConf2, textLimitWidth);
            c4Shape.type.Y = Y + 5;
            Y = c4Shape.type.Y + c4Shape.type.height;
        } else if (c4Shape.techn && c4Shape.techn.text !== "") {
            c4Shape.techn.text = "[" + c4Shape.techn.text + "]";
            let c4ShapeTechnConf = c4ShapeFont(conf, c4Shape.techn.text);
            calcC4ShapeTextWH("techn", c4Shape, c4ShapeTextWrap, c4ShapeTechnConf, textLimitWidth);
            c4Shape.techn.Y = Y + 5;
            Y = c4Shape.techn.Y + c4Shape.techn.height;
        }
        let rectHeight = Y;
        let rectWidth = c4Shape.label.width;
        if (c4Shape.descr && c4Shape.descr.text !== "") {
            let c4ShapeDescrConf = c4ShapeFont(conf, c4Shape.typeC4Shape.text);
            calcC4ShapeTextWH("descr", c4Shape, c4ShapeTextWrap, c4ShapeDescrConf, textLimitWidth);
            c4Shape.descr.Y = Y + 20;
            Y = c4Shape.descr.Y + c4Shape.descr.height;
            rectWidth = Math.max(c4Shape.label.width, c4Shape.descr.width);
            rectHeight = Y - c4Shape.descr.textLines * 5;
        }
        rectWidth = rectWidth + conf.c4ShapePadding;
        c4Shape.width = Math.max(c4Shape.width || conf.width, rectWidth, conf.width);
        c4Shape.height = Math.max(c4Shape.height || conf.height, rectHeight, conf.height);
        c4Shape.margin = c4Shape.margin || conf.c4ShapeMargin;
        currentBounds.insert(c4Shape);
        svgDraw_default.drawC4Shape(diagram2, c4Shape, conf);
    }
    currentBounds.bumpLastMargin(conf.c4ShapeMargin);
}, "drawC4ShapeArray");
var Point = class {
    static{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(this, "Point");
    }
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
};
var getIntersectPoint = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(fromNode, endPoint) {
    let x1 = fromNode.x;
    let y1 = fromNode.y;
    let x2 = endPoint.x;
    let y2 = endPoint.y;
    let fromCenterX = x1 + fromNode.width / 2;
    let fromCenterY = y1 + fromNode.height / 2;
    let dx = Math.abs(x1 - x2);
    let dy = Math.abs(y1 - y2);
    let tanDYX = dy / dx;
    let fromDYX = fromNode.height / fromNode.width;
    let returnPoint = null;
    if (y1 == y2 && x1 < x2) {
        returnPoint = new Point(x1 + fromNode.width, fromCenterY);
    } else if (y1 == y2 && x1 > x2) {
        returnPoint = new Point(x1, fromCenterY);
    } else if (x1 == x2 && y1 < y2) {
        returnPoint = new Point(fromCenterX, y1 + fromNode.height);
    } else if (x1 == x2 && y1 > y2) {
        returnPoint = new Point(fromCenterX, y1);
    }
    if (x1 > x2 && y1 < y2) {
        if (fromDYX >= tanDYX) {
            returnPoint = new Point(x1, fromCenterY + tanDYX * fromNode.width / 2);
        } else {
            returnPoint = new Point(fromCenterX - dx / dy * fromNode.height / 2, y1 + fromNode.height);
        }
    } else if (x1 < x2 && y1 < y2) {
        if (fromDYX >= tanDYX) {
            returnPoint = new Point(x1 + fromNode.width, fromCenterY + tanDYX * fromNode.width / 2);
        } else {
            returnPoint = new Point(fromCenterX + dx / dy * fromNode.height / 2, y1 + fromNode.height);
        }
    } else if (x1 < x2 && y1 > y2) {
        if (fromDYX >= tanDYX) {
            returnPoint = new Point(x1 + fromNode.width, fromCenterY - tanDYX * fromNode.width / 2);
        } else {
            returnPoint = new Point(fromCenterX + fromNode.height / 2 * dx / dy, y1);
        }
    } else if (x1 > x2 && y1 > y2) {
        if (fromDYX >= tanDYX) {
            returnPoint = new Point(x1, fromCenterY - fromNode.width / 2 * tanDYX);
        } else {
            returnPoint = new Point(fromCenterX - fromNode.height / 2 * dx / dy, y1);
        }
    }
    return returnPoint;
}, "getIntersectPoint");
var getIntersectPoints = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(fromNode, endNode) {
    let endIntersectPoint = {
        x: 0,
        y: 0
    };
    endIntersectPoint.x = endNode.x + endNode.width / 2;
    endIntersectPoint.y = endNode.y + endNode.height / 2;
    let startPoint = getIntersectPoint(fromNode, endIntersectPoint);
    endIntersectPoint.x = fromNode.x + fromNode.width / 2;
    endIntersectPoint.y = fromNode.y + fromNode.height / 2;
    let endPoint = getIntersectPoint(endNode, endIntersectPoint);
    return {
        startPoint,
        endPoint
    };
}, "getIntersectPoints");
var drawRels2 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(diagram2, rels2, getC4ShapeObj, diagObj) {
    let i = 0;
    for (let rel of rels2){
        i = i + 1;
        let relTextWrap = rel.wrap && conf.wrap;
        let relConf = messageFont(conf);
        let diagramType = diagObj.db.getC4Type();
        if (diagramType === "C4Dynamic") {
            rel.label.text = i + ": " + rel.label.text;
        }
        let textLimitWidth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$GEFDOKGD$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateTextWidth"])(rel.label.text, relConf);
        calcC4ShapeTextWH("label", rel, relTextWrap, relConf, textLimitWidth);
        if (rel.techn && rel.techn.text !== "") {
            textLimitWidth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$GEFDOKGD$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateTextWidth"])(rel.techn.text, relConf);
            calcC4ShapeTextWH("techn", rel, relTextWrap, relConf, textLimitWidth);
        }
        if (rel.descr && rel.descr.text !== "") {
            textLimitWidth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$GEFDOKGD$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateTextWidth"])(rel.descr.text, relConf);
            calcC4ShapeTextWH("descr", rel, relTextWrap, relConf, textLimitWidth);
        }
        let fromNode = getC4ShapeObj(rel.from);
        let endNode = getC4ShapeObj(rel.to);
        let points = getIntersectPoints(fromNode, endNode);
        rel.startPoint = points.startPoint;
        rel.endPoint = points.endPoint;
    }
    svgDraw_default.drawRels(diagram2, rels2, conf);
}, "drawRels");
function drawInsideBoundary(diagram2, parentBoundaryAlias, parentBounds, currentBoundaries, diagObj) {
    let currentBounds = new Bounds(diagObj);
    currentBounds.data.widthLimit = parentBounds.data.widthLimit / Math.min(c4BoundaryInRow2, currentBoundaries.length);
    for (let [i, currentBoundary] of currentBoundaries.entries()){
        let Y = 0;
        currentBoundary.image = {
            width: 0,
            height: 0,
            Y: 0
        };
        if (currentBoundary.sprite) {
            currentBoundary.image.width = 48;
            currentBoundary.image.height = 48;
            currentBoundary.image.Y = Y;
            Y = currentBoundary.image.Y + currentBoundary.image.height;
        }
        let currentBoundaryTextWrap = currentBoundary.wrap && conf.wrap;
        let currentBoundaryLabelConf = boundaryFont(conf);
        currentBoundaryLabelConf.fontSize = currentBoundaryLabelConf.fontSize + 2;
        currentBoundaryLabelConf.fontWeight = "bold";
        calcC4ShapeTextWH("label", currentBoundary, currentBoundaryTextWrap, currentBoundaryLabelConf, currentBounds.data.widthLimit);
        currentBoundary.label.Y = Y + 8;
        Y = currentBoundary.label.Y + currentBoundary.label.height;
        if (currentBoundary.type && currentBoundary.type.text !== "") {
            currentBoundary.type.text = "[" + currentBoundary.type.text + "]";
            let currentBoundaryTypeConf = boundaryFont(conf);
            calcC4ShapeTextWH("type", currentBoundary, currentBoundaryTextWrap, currentBoundaryTypeConf, currentBounds.data.widthLimit);
            currentBoundary.type.Y = Y + 5;
            Y = currentBoundary.type.Y + currentBoundary.type.height;
        }
        if (currentBoundary.descr && currentBoundary.descr.text !== "") {
            let currentBoundaryDescrConf = boundaryFont(conf);
            currentBoundaryDescrConf.fontSize = currentBoundaryDescrConf.fontSize - 2;
            calcC4ShapeTextWH("descr", currentBoundary, currentBoundaryTextWrap, currentBoundaryDescrConf, currentBounds.data.widthLimit);
            currentBoundary.descr.Y = Y + 20;
            Y = currentBoundary.descr.Y + currentBoundary.descr.height;
        }
        if (i == 0 || i % c4BoundaryInRow2 === 0) {
            let _x = parentBounds.data.startx + conf.diagramMarginX;
            let _y = parentBounds.data.stopy + conf.diagramMarginY + Y;
            currentBounds.setData(_x, _x, _y, _y);
        } else {
            let _x = currentBounds.data.stopx !== currentBounds.data.startx ? currentBounds.data.stopx + conf.diagramMarginX : currentBounds.data.startx;
            let _y = currentBounds.data.starty;
            currentBounds.setData(_x, _x, _y, _y);
        }
        currentBounds.name = currentBoundary.alias;
        let currentPersonOrSystemArray = diagObj.db.getC4ShapeArray(currentBoundary.alias);
        let currentPersonOrSystemKeys = diagObj.db.getC4ShapeKeys(currentBoundary.alias);
        if (currentPersonOrSystemKeys.length > 0) {
            drawC4ShapeArray(currentBounds, diagram2, currentPersonOrSystemArray, currentPersonOrSystemKeys);
        }
        parentBoundaryAlias = currentBoundary.alias;
        let nextCurrentBoundaries = diagObj.db.getBoundaries(parentBoundaryAlias);
        if (nextCurrentBoundaries.length > 0) {
            drawInsideBoundary(diagram2, parentBoundaryAlias, currentBounds, nextCurrentBoundaries, diagObj);
        }
        if (currentBoundary.alias !== "global") {
            drawBoundary2(diagram2, currentBoundary, currentBounds);
        }
        parentBounds.data.stopy = Math.max(currentBounds.data.stopy + conf.c4ShapeMargin, parentBounds.data.stopy);
        parentBounds.data.stopx = Math.max(currentBounds.data.stopx + conf.c4ShapeMargin, parentBounds.data.stopx);
        globalBoundaryMaxX = Math.max(globalBoundaryMaxX, parentBounds.data.stopx);
        globalBoundaryMaxY = Math.max(globalBoundaryMaxY, parentBounds.data.stopy);
    }
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(drawInsideBoundary, "drawInsideBoundary");
var draw = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(function(_text, id, _version, diagObj) {
    conf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getConfig2"])().c4;
    const securityLevel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getConfig2"])().securityLevel;
    let sandboxElement;
    if (securityLevel === "sandbox") {
        sandboxElement = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$selection$40$3$2e$0$2e$0$2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])("#i" + id);
    }
    const root = securityLevel === "sandbox" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$selection$40$3$2e$0$2e$0$2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(sandboxElement.nodes()[0].contentDocument.body) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$selection$40$3$2e$0$2e$0$2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])("body");
    let db = diagObj.db;
    diagObj.db.setWrap(conf.wrap);
    c4ShapeInRow2 = db.getC4ShapeInRow();
    c4BoundaryInRow2 = db.getC4BoundaryInRow();
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"].debug(`C:${JSON.stringify(conf, null, 2)}`);
    const diagram2 = securityLevel === "sandbox" ? root.select(`[id="${id}"]`) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$selection$40$3$2e$0$2e$0$2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(`[id="${id}"]`);
    svgDraw_default.insertComputerIcon(diagram2);
    svgDraw_default.insertDatabaseIcon(diagram2);
    svgDraw_default.insertClockIcon(diagram2);
    let screenBounds = new Bounds(diagObj);
    screenBounds.setData(conf.diagramMarginX, conf.diagramMarginX, conf.diagramMarginY, conf.diagramMarginY);
    screenBounds.data.widthLimit = screen.availWidth;
    globalBoundaryMaxX = conf.diagramMarginX;
    globalBoundaryMaxY = conf.diagramMarginY;
    const title2 = diagObj.db.getTitle();
    let currentBoundaries = diagObj.db.getBoundaries("");
    drawInsideBoundary(diagram2, "", screenBounds, currentBoundaries, diagObj);
    svgDraw_default.insertArrowHead(diagram2);
    svgDraw_default.insertArrowEnd(diagram2);
    svgDraw_default.insertArrowCrossHead(diagram2);
    svgDraw_default.insertArrowFilledHead(diagram2);
    drawRels2(diagram2, diagObj.db.getRels(), diagObj.db.getC4Shape, diagObj);
    screenBounds.data.stopx = globalBoundaryMaxX;
    screenBounds.data.stopy = globalBoundaryMaxY;
    const box = screenBounds.data;
    let boxHeight = box.stopy - box.starty;
    let height = boxHeight + 2 * conf.diagramMarginY;
    let boxWidth = box.stopx - box.startx;
    const width = boxWidth + 2 * conf.diagramMarginX;
    if (title2) {
        diagram2.append("text").text(title2).attr("x", (box.stopx - box.startx) / 2 - 4 * conf.diagramMarginX).attr("y", box.starty + conf.diagramMarginY);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$7R4GIKGN$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["configureSvgSize"])(diagram2, height, width, conf.useMaxWidth);
    const extraVertForTitle = title2 ? 60 : 0;
    diagram2.attr("viewBox", box.startx - conf.diagramMarginX + " -" + (conf.diagramMarginY + extraVertForTitle) + " " + width + " " + (height + extraVertForTitle));
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["log"].debug(`models:`, box);
}, "draw");
var c4Renderer_default = {
    drawPersonOrSystemArray: drawC4ShapeArray,
    drawBoundary: drawBoundary2,
    setConf,
    draw
};
// src/diagrams/c4/styles.js
var getStyles = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])((options)=>`.person {
    stroke: ${options.personBorder};
    fill: ${options.personBkg};
  }
`, "getStyles");
var styles_default = getStyles;
// src/diagrams/c4/c4Diagram.ts
var diagram = {
    parser: c4Diagram_default,
    db: c4Db_default,
    renderer: c4Renderer_default,
    styles: styles_default,
    init: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mermaid$40$11$2e$13$2e$0$2f$node_modules$2f$mermaid$2f$dist$2f$chunks$2f$mermaid$2e$core$2f$chunk$2d$AGHRB4JF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["__name"])(({ c4, wrap })=>{
        c4Renderer_default.setConf(c4);
        c4Db_default.setWrap(wrap);
    }, "init")
};
;
}),
];

//# sourceMappingURL=13f8e_mermaid_dist_chunks_mermaid_core_0a640120._.js.map