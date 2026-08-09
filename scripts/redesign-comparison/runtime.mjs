import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";

export function resolveRef(repositoryRoot, ref) {
  try {
    return execFileSync("git", ["rev-parse", "--verify", ref], {
      cwd: repositoryRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    throw new Error(
      `Git ref "${ref}" is unavailable. The redesign comparison requires full repository history; fetch it before running the test.`,
    );
  }
}

export function exportSnapshot(repositoryRoot, temporaryRoot, name, ref) {
  const snapshotRoot = path.join(temporaryRoot, name);
  const archivePath = path.join(temporaryRoot, `${name}.tar`);
  fs.mkdirSync(snapshotRoot, { recursive: true });

  execFileSync(
    "git",
    ["archive", "--format=tar", `--output=${archivePath}`, ref],
    { cwd: repositoryRoot },
  );
  execFileSync("tar", ["-xf", archivePath, "-C", snapshotRoot]);
  fs.rmSync(archivePath);

  // All snapshots use the current dependency runtime. This keeps the comparison
  // focused on application code and makes repeated historical runs fast/offline.
  fs.symlinkSync(
    path.join(repositoryRoot, "node_modules"),
    path.join(snapshotRoot, "node_modules"),
    process.platform === "win32" ? "junction" : "dir",
  );

  return snapshotRoot;
}

export function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

export function startVite(root, port) {
  const output = [];
  const processHandle = spawn(
    "npm",
    [
      "run",
      "dev",
      "--",
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--strictPort",
    ],
    {
      cwd: root,
      env: { ...process.env, FORCE_COLOR: "0" },
      stdio: ["ignore", "pipe", "pipe"],
      detached: process.platform !== "win32",
    },
  );

  for (const stream of [processHandle.stdout, processHandle.stderr]) {
    stream.on("data", (chunk) => {
      output.push(chunk.toString());
      if (output.length > 80) output.shift();
    });
  }

  return {
    processHandle,
    getOutput: () => output.join(""),
  };
}

export async function waitForServer(url, server, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (server.processHandle.exitCode !== null) {
      throw new Error(
        `Vite exited before becoming ready at ${url}\n${server.getOutput()}`,
      );
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(
    `Timed out waiting for Vite at ${url}\n${server.getOutput()}`,
  );
}

export async function stopServer(server) {
  if (server.processHandle.exitCode !== null) return;

  if (process.platform === "win32") {
    server.processHandle.kill("SIGTERM");
  } else {
    try {
      process.kill(-server.processHandle.pid, "SIGTERM");
    } catch {
      server.processHandle.kill("SIGTERM");
    }
  }

  await Promise.race([
    new Promise((resolve) => server.processHandle.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ]);
}
