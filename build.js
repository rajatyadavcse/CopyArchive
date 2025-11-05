const { execSync } = require("child_process");
const os = require("os");
const path = require("path");
const fs = require("fs");

const appName = "CopyCat";
const arch = os.arch() === "arm64" ? "arm64" : "x64";
const buildDir = path.join(__dirname, "build");

// Ensure build directory exists
if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir);

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

// ---------------------------
// 🧩 macOS Build (.app + .dmg)
// ---------------------------
function buildMac() {
  console.log(`🍎 Building ${appName} for macOS (${arch})...`);
  const iconPath = path.join(__dirname, "assets", "icon.icns");

  run(
    `npx electron-packager . ${appName} --platform=darwin --arch=${arch} --icon=${iconPath} --overwrite --out=${buildDir}`
  );

  const appPath = path.join(buildDir, `${appName}-darwin-${arch}`, `${appName}.app`);

  console.log("📦 Creating DMG installer...");
  run(
    `npx electron-installer-dmg "${appPath}" "CopyCat" --out="${buildDir}" --overwrite --icon=${iconPath}`
  );

  console.log(`✅ macOS build complete: ${buildDir}/${appName}.dmg`);
}

// ---------------------------
// 🪟 Windows Build (.exe)
// ---------------------------
function buildWindows() {
  console.log(`🪟 Building ${appName} for Windows (${arch})...`);
  const iconPath = path.join(__dirname, "assets", "icon.ico");

  run(
    `npx electron-packager . ${appName} --platform=win32 --arch=${arch} --icon=${iconPath} --overwrite --out=${buildDir}`
  );

  console.log(`✅ Windows build complete: ${buildDir}/${appName}-win32-${arch}/`);
}

// ---------------------------
// 🐧 Linux Build (.deb + .rpm)
// ---------------------------
function buildLinux() {
  console.log(`🐧 Building ${appName} for Linux (${arch})...`);
  const iconPath = path.join(__dirname, "assets", "icon_Linux.png");
  const linuxDir = path.join(buildDir, `${appName}-linux-${arch}`);

  run(
    `npx electron-packager . ${appName} --platform=linux --arch=${arch} --icon=${iconPath} --overwrite --out=${buildDir}`
  );

  console.log("📦 Creating .deb and .rpm installers...");
  run(
    `npx electron-installer-debian --src "${linuxDir}" --dest "${buildDir}" --arch ${arch} --config debian.json`
  );
  run(
    `npx electron-installer-redhat --src "${linuxDir}" --dest "${buildDir}" --arch ${arch} --config redhat.json`
  );

  console.log(`✅ Linux builds complete: ${buildDir}/${appName}.{deb,rpm}`);
}

// ---------------------------
// 🚀 Run all builds
// ---------------------------
try {
  buildMac();
  buildWindows();
  buildLinux();
  console.log("\n🎉 All builds completed successfully!");
} catch (err) {
  console.error("❌ Build failed:", err.message);
  process.exit(1);
}
