import { SandboxInstance } from "@blaxel/core";

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function createPreview(sandboxName: string): Promise<string> {
  const sandbox = await SandboxInstance.get(sandboxName);
  try {
    await sandbox.previews.delete("telegram-webhook");
  } catch {
    // May not exist
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const preview = await sandbox.previews.create({
        metadata: { name: "telegram-webhook" },
        spec: { port: 8443, public: true },
      });
      return preview.spec.url!;
    } catch (err) {
      lastError = err;
      if (attempt < 2) await delay(1000 * 2 ** attempt);
    }
  }
  throw lastError;
}

export async function refreshPreviewWhenReady(sandboxName: string): Promise<string> {
  const sandbox = await SandboxInstance.get(sandboxName);
  await sandbox.process.exec({
    name: "wait-for-port",
    command: "bash -c 'for i in $(seq 1 30); do (echo > /dev/tcp/localhost/8443) 2>/dev/null && exit 0; sleep 1; done; exit 1'",
    waitForCompletion: true,
  });
  return createPreview(sandboxName);
}
