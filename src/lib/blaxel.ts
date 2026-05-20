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

export async function configureSandbox(
  sandboxName: string,
  envVars: Record<string, string>
) {
  const sandbox = await SandboxInstance.get(sandboxName);

  // Kill any existing hermes process (e.g. from Docker CMD)
  try {
    await sandbox.process.exec({
      name: "kill-hermes",
      command: "pkill -f 'hermes gateway' || true",
      waitForCompletion: true,
    });
  } catch {
    // Process may not exist
  }

  await sandbox.process.exec({
    name: "mkdir-data",
    command: "mkdir -p /opt/data",
  });

  const envContent = Object.entries(envVars)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  await sandbox.fs.write("/opt/data/.env", envContent);

  const hermesConfig = `
model:
  default: "${envVars.HERMES_INFERENCE_MODEL || "global.anthropic.claude-sonnet-4-6"}"
  provider: "bedrock"

platforms:
  telegram:
    extra:
      allow_admin_from: "0"
      user_allowed_commands:
        - help
        - new
        - reset
        - status
        - retry
        - undo
        - compress
        - usage
`;

  await sandbox.fs.write("/opt/data/config.yaml", hermesConfig.trim());
}

async function readEnvFromSandbox(sandbox: SandboxInstance): Promise<Record<string, string>> {
  const content = await sandbox.fs.read("/opt/data/.env");
  return Object.fromEntries(
    content.split("\n").filter(line => line.includes("=")).map(line => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx), line.slice(idx + 1)];
    })
  );
}

export async function startHermes(sandboxName: string, env?: Record<string, string>) {
  const sandbox = await SandboxInstance.get(sandboxName);
  const processEnv = env ?? await readEnvFromSandbox(sandbox);
  await sandbox.process.exec({
    name: "hermes-main",
    command: "bash -c 'set -a; . /opt/data/.env; set +a; source /usr/local/lib/hermes-agent/venv/bin/activate; exec hermes gateway run'",
    env: processEnv,
    keepAlive: true,
    timeout: 0,
    waitForPorts: [8443],
  });
}

export async function getSandboxStatus(sandboxName: string) {
  try {
    const sandbox = await SandboxInstance.get(sandboxName);
    return { status: sandbox.status || "unknown" };
  } catch {
    return { status: "error" };
  }
}

export async function updateSandboxModel(sandboxName: string, model: string) {
  const sandbox = await SandboxInstance.get(sandboxName);
  const env = await readEnvFromSandbox(sandbox);
  env.HERMES_INFERENCE_MODEL = model;

  const envContent = Object.entries(env)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  await sandbox.fs.write("/opt/data/.env", envContent);

  const hermesConfig = `
model:
  default: "${model}"
  provider: "bedrock"

platforms:
  telegram:
    extra:
      allow_admin_from: "0"
      user_allowed_commands:
        - help
        - new
        - reset
        - status
        - retry
        - undo
        - compress
        - usage
`;
  await sandbox.fs.write("/opt/data/config.yaml", hermesConfig.trim());
}

export async function restartHermes(sandboxName: string, env?: Record<string, string>) {
  const sandbox = await SandboxInstance.get(sandboxName);
  const processEnv = env ?? await readEnvFromSandbox(sandbox);
  try {
    await sandbox.process.kill("hermes-main");
  } catch {
    // Process may not exist
  }
  await sandbox.process.exec({
    name: "hermes-main",
    command: "bash -c 'set -a; . /opt/data/.env; set +a; source /usr/local/lib/hermes-agent/venv/bin/activate; exec hermes gateway run'",
    env: processEnv,
    keepAlive: true,
    timeout: 0,
  });
}

export async function getPublicWebhookUrl(sandboxName: string): Promise<string> {
  const sandbox = await SandboxInstance.get(sandboxName);
  const preview = await sandbox.previews.createIfNotExists({
    metadata: { name: "telegram-webhook" },
    spec: { port: 8443, public: true },
  });
  return preview.spec.url!;
}

export async function deleteSandbox(sandboxName: string) {
  await SandboxInstance.delete(sandboxName);
}
