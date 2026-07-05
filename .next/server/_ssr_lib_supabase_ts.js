"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "_ssr_lib_supabase_ts";
exports.ids = ["_ssr_lib_supabase_ts"];
exports.modules = {

/***/ "(ssr)/./lib/supabase.ts":
/*!*************************!*\
  !*** ./lib/supabase.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getSupabaseClient: () => (/* binding */ getSupabaseClient)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"(ssr)/./node_modules/@supabase/supabase-js/dist/index.mjs\");\n\nconst supabaseUrl = process.env.SUPABASE_URL ?? \"https://vjpwvnxiyfkcthhmtisf.supabase.co\";\nconst supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqcHd2bnhpeWZrY3RoaG10aXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4ODcxODcsImV4cCI6MjA5ODQ2MzE4N30.znYN9YTUx-nUaTaInPRyohkv5VuRkKVXP5BURwUtH1Q\";\nfunction getSupabaseClient() {\n    if (!supabaseUrl || !supabaseAnonKey) {\n        throw new Error(\"Supabase is not configured. Please create a .env.local file and set SUPABASE_URL / SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.\");\n    }\n    return (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(supabaseUrl, supabaseAnonKey, {\n        auth: {\n            persistSession: false,\n            autoRefreshToken: false\n        }\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9saWIvc3VwYWJhc2UudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBcUQ7QUFFckQsTUFBTUMsY0FBY0MsUUFBUUMsR0FBRyxDQUFDQyxZQUFZLElBQUlGLDBDQUFvQztBQUNwRixNQUFNSSxrQkFBa0JKLFFBQVFDLEdBQUcsQ0FBQ0ksaUJBQWlCLElBQUlMLGtOQUF5QztBQUUzRixTQUFTTztJQUNkLElBQUksQ0FBQ1IsZUFBZSxDQUFDSyxpQkFBaUI7UUFDcEMsTUFBTSxJQUFJSSxNQUNSO0lBRUo7SUFFQSxPQUFPVixtRUFBWUEsQ0FBQ0MsYUFBYUssaUJBQWlCO1FBQ2hESyxNQUFNO1lBQ0pDLGdCQUFnQjtZQUNoQkMsa0JBQWtCO1FBQ3BCO0lBQ0Y7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL2l0c20tdGlja2V0aW5nLXN5c3RlbS8uL2xpYi9zdXBhYmFzZS50cz9jOTlmIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyc7XHJcblxyXG5jb25zdCBzdXBhYmFzZVVybCA9IHByb2Nlc3MuZW52LlNVUEFCQVNFX1VSTCA/PyBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkw7XHJcbmNvbnN0IHN1cGFiYXNlQW5vbktleSA9IHByb2Nlc3MuZW52LlNVUEFCQVNFX0FOT05fS0VZID8/IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFN1cGFiYXNlQ2xpZW50KCkge1xyXG4gIGlmICghc3VwYWJhc2VVcmwgfHwgIXN1cGFiYXNlQW5vbktleSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAnU3VwYWJhc2UgaXMgbm90IGNvbmZpZ3VyZWQuIFBsZWFzZSBjcmVhdGUgYSAuZW52LmxvY2FsIGZpbGUgYW5kIHNldCBTVVBBQkFTRV9VUkwgLyBTVVBBQkFTRV9BTk9OX0tFWSBvciBORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwgLyBORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWS4nLFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHJldHVybiBjcmVhdGVDbGllbnQoc3VwYWJhc2VVcmwsIHN1cGFiYXNlQW5vbktleSwge1xyXG4gICAgYXV0aDoge1xyXG4gICAgICBwZXJzaXN0U2Vzc2lvbjogZmFsc2UsXHJcbiAgICAgIGF1dG9SZWZyZXNoVG9rZW46IGZhbHNlLFxyXG4gICAgfSxcclxuICB9KTtcclxufVxyXG4iXSwibmFtZXMiOlsiY3JlYXRlQ2xpZW50Iiwic3VwYWJhc2VVcmwiLCJwcm9jZXNzIiwiZW52IiwiU1VQQUJBU0VfVVJMIiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIiwic3VwYWJhc2VBbm9uS2V5IiwiU1VQQUJBU0VfQU5PTl9LRVkiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWSIsImdldFN1cGFiYXNlQ2xpZW50IiwiRXJyb3IiLCJhdXRoIiwicGVyc2lzdFNlc3Npb24iLCJhdXRvUmVmcmVzaFRva2VuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./lib/supabase.ts\n");

/***/ })

};
;