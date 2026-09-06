/**
 * Generated photographic imagery (AI-generated, prototype only, hosted on
 * Porter's permanent asset host). Each entry is rebuilt into the signed asset
 * URL at runtime; a missing or unreachable asset falls back to a studio scene render.
 */
const CO = "8ca34aaf-db66-4a8f-aa74-1c49c2f6e264";
const BUCKET = "gs://porter-mcp-higgsfield-prod";

type Asset = { job: string; file: string; sig: string };

const ASSETS: Record<string, Asset> = {
  // Photographic set (dark editorial). Generated with the Porter creative studio, prototype only.
  heroCommunity: { job: "6a75e7a7-b5f6-4bbd-9acf-ba7f6e0ddbd1", file: "6c93d349-4091-48f2-ba9c-e4daa00bd6b6", sig: "7483877229afea22a220ade7a645b5df36dd37e395005ed0fff91d0882a6ead9" },
  momentHair: { job: "ddddd8f4-28f9-46fc-a17c-180464e92581", file: "7c9b64a3-2d8a-4f05-bcce-2eff04ad46a6", sig: "9adafa67cb03f038b78a00c5111ed67ac64832e8454f1d4b6582e6f3f0397b84" },
  momentBreakfast: { job: "f8f6141f-a413-4456-b516-fe6e5829d393", file: "54322378-f1de-47dc-a6d5-dcd95f35a34d", sig: "5145d7d9a836f0ab77c37e57cb77122e74f45ecfecbba450ebd78e6c5d00c226" },
  momentSmile: { job: "255b1e0f-23ec-4d15-87f0-dc4adc16c50b", file: "c84acbf1-ccb3-461c-ae05-704b980b1062", sig: "f37bcee6a9f1e3156fc7127b520026ffd1b9bed0866bfe7d474b27d02daa0db2" },
  questFilming: { job: "19cbe9dc-fd43-490c-a3ec-8f09db0ab582", file: "d1e602e4-812f-4135-963f-ead09d138813", sig: "d3b49915b67199b20da1cf23f9dae55f02e55510fa6211b0d19ef61a957e7731" },
};

function encode(a: Asset): string {
  const payload = JSON.stringify({ co: CO, j: a.job, u: `${BUCKET}/${CO}/${a.job}/${a.file}.png`, k: "image" });
  const b64 = typeof btoa === "function" ? btoa(payload) : Buffer.from(payload).toString("base64");
  return `https://mcp.portermetrics.com/creative/asset/${b64.replace(/=+$/, "")}.${a.sig}`;
}

export const ART: Record<string, string | undefined> = Object.fromEntries(Object.entries(ASSETS).map(([k, a]) => [k, encode(a)]));
export type ArtKey = keyof typeof ASSETS;
