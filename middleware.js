// Vercel Routing Middleware: runs before static files are served, only for the paths in `matcher`.
// Word lists are served when a page loads them with <script src>, and return 404 to anything else
// (typing the URL, links, fetch() calls, curl). This stops casual URL guessing, not a determined
// visitor: browsers must receive these files to run the games, and request headers can be faked.

const WORD_FILES = ["/anagrams-words.js", "/wordhunt-words.js"];

function isPageScriptLoad(request) {
  const dest = request.headers.get("sec-fetch-dest");
  if (dest) return dest === "script" && request.headers.get("sec-fetch-site") === "same-origin";

  // Browsers too old to send Sec-Fetch headers (Safari before 16.4) still send a Referer
  try {
    return new URL(request.headers.get("referer")).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export default function middleware(request) {
  const isWordFile = WORD_FILES.includes(new URL(request.url).pathname);
  if (isWordFile && isPageScriptLoad(request)) return; // no response: Vercel serves the file as normal
  return new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });
}

// /middleware.js is listed so this file can't be read if it's ever served statically
export const config = { matcher: ["/anagrams-words.js", "/wordhunt-words.js", "/middleware.js"] };
