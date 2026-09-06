/**
 * Generated paper-cut illustrations (AI-generated, prototype only, hosted on
 * Porter's permanent asset host). Each entry is rebuilt into the signed asset
 * URL at runtime; a missing or unreachable asset falls back to composed paper art.
 */
const CO = "8ca34aaf-db66-4a8f-aa74-1c49c2f6e264";
const BUCKET = "gs://porter-mcp-higgsfield-prod";

type Asset = { job: string; file: string; sig: string };

const ASSETS: Record<string, Asset> = {
  heroCommunity: { job: "9fd1260f-8869-40aa-92ea-5252a5f26b69", file: "6e57adfb-52a4-4854-8af7-75e058474d5b", sig: "3fa6c3bb8658475b44f152b8996343a94435bff923792e624c18edfc90bcedb7" },
  momentHair: { job: "7b440071-b80d-4aa4-bead-97e9b9556859", file: "b4a719ab-eeea-4a93-9d96-bbbb9069df2f", sig: "df852ebf48e42e0d920be617efc4f67420481ef5c838b9227dcd202bb69975ae" },
  momentBreakfast: { job: "eaf59660-c9ed-49c6-9d81-763e9914dee1", file: "89950e6b-4da9-4b07-a41f-f418f9f3cd8e", sig: "702d0709e97fa65fcded6274cbdaa7139e57497fb165e3b2e83fbb5c6ef3b556" },
  momentSmile: { job: "a134b38d-bfc5-4862-86d8-30783fd6c697", file: "1efcff6c-bc2e-4e96-ab87-df42d3b45ff4", sig: "f59ce9be69d683c51cb34a0f7b90669be2491f1c787ad787f364bc4ee111312c" },
  growthPlant: { job: "ea0f90a6-5e96-412d-95a3-ad138dfac927", file: "54e039d6-d237-405c-82f2-0d610226077a", sig: "ef95932643fb77a215553f03d4957e86539aa1454f6a92a31a0567498247d66c" },
  portraitLayla: { job: "9f761d5b-4a4c-4e0e-8161-b42675aa9be9", file: "0813e0c6-3753-44e8-9b99-6f5014c44f3c", sig: "9ac84cbeb88cd619d1ab60e80593cac718151e7ab3c722f01203c84ebaeb5419" },
  portraitOmar: { job: "fdab91c1-e4ea-41a2-8741-f05e22d9f6cf", file: "c3c22889-3901-4e15-bd8e-116a2cf82946", sig: "0dedc9bee1cd03eef8c57e7ddb45f15727618724132380578334a383a833a544" },
  portraitNoor: { job: "fc9743d8-1aac-46d0-8a85-0ee11695b6ad", file: "f968ae55-ce51-4423-b043-afa99fbe2bed", sig: "2487af105a5f049e3d9e896472aa3de44e4affd726563e3fae7390dc1411fad8" },
  questFilming: { job: "93cbca1d-20fb-44b2-bf10-14f2d2fe6416", file: "031bd072-0385-4808-8f9f-206719e2445d", sig: "34178c6349b9378ae8d82b4e3dbf2b4e6fcdd9f7886bb37824795e354d747ee7" },
  momentSunday: { job: "05c1b417-d8a5-4421-924c-f8ac2d3c0047", file: "dfd0b203-f27c-4c91-92ca-5752d29e33f6", sig: "63d1442906abe008b7d7a2500cc055b7bb7d313cf3814b240b3cd141a58d9f47" },
  momentJuice: { job: "af83d914-4727-4f5b-b9c9-0fbb79423a79", file: "e8c3a8cb-8161-4ac4-bfb4-93ea925e22e2", sig: "4ca36360d69870dcda69725054bc195ea39e99dc97f36a0fcd9f8b86fa462983" },
  delivery: { job: "23c115f3-f879-4c44-815e-12b62cb469cd", file: "09f7ad3d-2e56-4f96-93a9-7d03e5c8fbcc", sig: "b6f833dac58412abf9fab62d84a7761c9079ef508ae97278b7237f4cc2ef3aaa" },
  rewardsFlatlay: { job: "de70a331-7cf0-4868-bbe1-746666af796e", file: "d9a3d65e-97f1-4f8d-913f-9314493831f4", sig: "d486e12d5442bf897c94fe26902b9817ff541a7b08c32cf467e1009f986a85b9" },
  brandTeam: { job: "9b02ebec-7bae-48ce-8952-fd112281cb1d", file: "576a9611-43f0-4c0a-8cd7-05107488640e", sig: "8ffb20705b51a0f46d7a577ca05471205ca1c47bf6aa619dac78a19e3904d1cf" },
  momentWinter: { job: "4e557294-bcd9-443b-85bc-0808e46239a4", file: "b46892d0-bb9b-4ed5-a702-a9aea6a798a5", sig: "4add3df9a8e18931bca1728e49762b6708e0288fea52ffdf6c9acb4b1012327d" },
};

function encode(a: Asset): string {
  const payload = JSON.stringify({ co: CO, j: a.job, u: `${BUCKET}/${CO}/${a.job}/${a.file}.png`, k: "image" });
  const b64 = typeof btoa === "function" ? btoa(payload) : Buffer.from(payload).toString("base64");
  return `https://mcp.portermetrics.com/creative/asset/${b64.replace(/=+$/, "")}.${a.sig}`;
}

export const ART: Record<string, string | undefined> = Object.fromEntries(Object.entries(ASSETS).map(([k, a]) => [k, encode(a)]));
export type ArtKey = keyof typeof ASSETS;
