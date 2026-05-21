import { SandboxInstance } from "@blaxel/core";

export async function provisionSandbox(userId: string) {
  const sandboxName = `hermes-${userId.slice(0, 8)}-${Date.now()}`;

  const sandbox = await SandboxInstance.createIfNotExists({
    name: sandboxName,
    image: process.env.HERMES_DOCKER_IMAGE!,
    memory: 4096,
    ports: [{ target: 8443, protocol: "HTTP" }],
    region: process.env.BL_REGION || "us-pdx-1",
    envs: [
      { name: "AWS_ACCESS_KEY_ID", value: process.env.AWS_ACCESS_KEY_ID! },
      { name: "AWS_SECRET_ACCESS_KEY", value: process.env.AWS_SECRET_ACCESS_KEY! },
      { name: "AWS_REGION", value: process.env.AWS_REGION || "us-east-1" },
      { name: "HERMES_INFERENCE_PROVIDER", value: "bedrock" },
      { name: "HERMES_HOME", value: "/opt/data" },
    ],
    labels: { userId, app: "simplehermes" },
  });

  await sandbox.wait({ maxWait: 60_000 });

  const sandboxUrl = sandbox.metadata?.url;

  return { sandbox, sandboxName, sandboxUrl };
}

export async function getSandboxStatus(sandboxName: string) {
  try {
    const sandbox = await SandboxInstance.get(sandboxName);
    return { status: sandbox.status || "unknown" };
  } catch {
    return { status: "error" };
  }
}

export async function deleteSandbox(sandboxName: string) {
  await SandboxInstance.delete(sandboxName);
}
