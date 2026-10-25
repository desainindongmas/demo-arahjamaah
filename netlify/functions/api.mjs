import { getStore } from "@netlify/blobs";
import { handleNetlifyRequest } from "../../src/netlify-api.js";
import { sendPilotEmail } from "../../src/pilot-email.js";

export default async function handler(request) {
  // Native Netlify Functions supplies the Blobs binding. No personal token
  // or database credential needs to be embedded in the site or source code.
  return handleNetlifyRequest(
    request,
    () => getStore({ name: "arah-jamaah-demo-v1", consistency: "strong" }),
    sendPilotEmail,
  );
}
