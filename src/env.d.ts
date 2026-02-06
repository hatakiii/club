import { D1Database } from "@cloudflare/workers-types";

// Үүнийг global болгож өгснөөр бүх файл дээр танигдана
declare global {
  interface CloudflareEnv {
    DB: D1Database;
  }
}

// Энэ мөрийг заавал нэмж өгөөрэй (файлыг модуль гэж таниулахын тулд)
export {};
