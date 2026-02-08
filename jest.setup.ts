import "@testing-library/jest-dom";
const util = require("util");
const {
  ReadableStream,
  WritableStream,
  TransformStream,
  TextEncoderStream,
  TextDecoderStream,
} = require("node:stream/web");

// 1. Үндсэн Web API-уудыг глобал болгох
global.TextEncoder = util.TextEncoder;
global.TextDecoder = util.TextDecoder;

// 2. structuredClone байхгүй бол нэмэх
if (typeof global.structuredClone === "undefined") {
  global.structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj));
}

// 3. Stream API-уудыг нэмэх
if (typeof global.ReadableStream === "undefined") {
  global.ReadableStream = ReadableStream;
  global.WritableStream = WritableStream;
  global.TransformStream = TransformStream;
  global.TextEncoderStream = TextEncoderStream;
  global.TextDecoderStream = TextDecoderStream;
}

// 4. Одоо Next.js Edge primitives-ийг аюулгүй дуудах
if (typeof global.Request === "undefined") {
  const {
    Request,
    Response,
    Headers,
    fetch,
  } = require("next/dist/compiled/@edge-runtime/primitives");

  global.Request = Request;
  global.Response = Response;
  global.Headers = Headers;
  global.fetch = fetch;
}
