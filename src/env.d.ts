import { D1Database } from "@cloudflare/workers-types";

interface CloudflareEnv {
  DB: D1Database;
}

declare global {
  namespace Cloudflare {
    interface RequestContext {
      env: CloudflareEnv;
    }
  }
}
