(() => {
  'use strict';

  const THEMES = {
    'macos-light': 'macOS Light',
    'apple-dark': 'Apple Dark',
    'titanium-mist': 'Titanium Mist',
    'deep-indigo': 'Deep Obsidian',
    'sage-minimal': 'Sage Minimal'
  };

  const FALLBACK_DOWNLOADS = {
    version: '0.1.5.0',
    channel: 'pre-release',
    signed: false,
    statusLabel: '0.1.5.0 (pre-release, unsigned)',
    packages: {
      standard: {
        id: 'standard',
        name: 'Standard',
        subtitle: 'Framework-dependent — requires .NET 9 Desktop Runtime',
        filename: 'ProjectLegion-win-x64-framework-dependent.zip',
        url: '#',
        sha256: 'PENDING_RELEASE_SHA256_PLACEHOLDER',
        size: 'Pending release'
      },
      standalone: {
        id: 'standalone',
        name: 'Standalone',
        subtitle: 'Self-contained — bundles Windows x64 .NET 9 Desktop Runtime',
        filename: 'ProjectLegion-win-x64-self-contained.zip',
        url: '#',
        sha256: 'PENDING_RELEASE_SHA256_PLACEHOLDER',
        size: 'Pending release'
      }
    }
  };

  const HERO_MODES = {
    Quiet: {
      subtitle: 'Quiet · Silent fans & battery-friendly clocks',
      cpu: 48,
      gpu: 42,
      cpuUtil: 16,
      gpuUtil: 6,
      ghz: '2.9',
      gpuGhz: '1.0',
      watts: 18,
      gpuWatts: 10,
      rpm: 1450,
      pct: 29,
      fanTag: 'Auto'
    },
    Balanced: {
      subtitle: 'Balanced · Quiet cooling & adaptive clocks',
      cpu: 56,
      gpu: 47,
      cpuUtil: 24,
      gpuUtil: 12,
      ghz: '3.8',
      gpuGhz: '1.4',
      watts: 28,
      gpuWatts: 18,
      rpm: 2100,
      pct: 42,
      fanTag: 'Auto'
    },
    Performance: {
      subtitle: 'Performance · Higher power budget & active cooling',
      cpu: 71,
      gpu: 63,
      cpuUtil: 62,
      gpuUtil: 48,
      ghz: '4.6',
      gpuGhz: '2.1',
      watts: 62,
      gpuWatts: 95,
      rpm: 3650,
      pct: 73,
      fanTag: 'Auto'
    },
    Custom: {
      subtitle: 'Custom · User fan curve & PL1/PL2 power limits',
      cpu: 60,
      gpu: 51,
      cpuUtil: 38,
      gpuUtil: 22,
      ghz: '4.1',
      gpuGhz: '1.7',
      watts: 42,
      gpuWatts: 40,
      rpm: 2450,
      pct: 49,
      fanTag: 'Curve'
    }
  };

  const PREVIEW_PAGES = {
    overview: {
      title: 'Overview',
      note: 'Overview: Power Mode and Refresh Rate pills above update this simulated preview.'
    },
    thermals: {
      title: 'Thermals',
      note: 'Thermals: CPU, GPU, and fan curves poll at 1 s only while Project Legion is focused.'
    },
    battery: {
      title: 'Battery',
      note: 'Battery: Conservation (80% cap), Normal, and Rapid Charge; telemetry refreshes every 5 s while focused.'
    },
    display: {
      title: 'Display & GPU',
      note: 'Display & GPU: Refresh rate, Overdrive, HDR, and on-demand dGPU wake process inspection.'
    },
    keyboard: {
      title: 'Keyboard',
      note: 'Keyboard: 4-Zone / Spectrum lighting presets plus the opt-in lid-open Preset 1 reset toggle.'
    },
    mouse: {
      title: 'Mouse',
      note: 'Mouse: Edit DPI stages and polling rate locally; hardware is queried on demand only.'
    },
    automation: {
      title: 'Automation',
      note: 'Automation: Event-driven triggers for AC/battery transitions, display changes, and game launches.'
    },
    packages: {
      title: 'Packages & Updater',
      note: 'Packages & Updater: Manage optional packages and verify SHA-256 checksums before staged updates.'
    }
  };

  const SIM_STATES = {
    focused: {
      thermals: 'Active · 1 s',
      thermalsOk: true,
      battery: 'Active · 5 s',
      batteryOk: true,
      gpu: 'On-Demand Only',
      dotColor: 'var(--ok)',
      note: 'While Project Legion is the active foreground window, Home and Thermals poll every 1 s and Battery refreshes every 5 s. Mouse settings remain on-demand only.'
    },
    minimized: {
      thermals: 'Paused · Window unfocused',
      thermalsOk: false,
      battery: 'Paused · Window unfocused',
      batteryOk: false,
      gpu: 'Paused / Cancelled',
      dotColor: 'var(--muted)',
      note: 'Minimizing, hiding, or losing focus pauses optional Home, Thermals, and Battery polling immediately with no stale UI updates.'
    },
    ingame: {
      thermals: 'Paused · Game detected (Valorant)',
      thermalsOk: false,
      battery: 'Paused · Game detected',
      batteryOk: false,
      gpu: 'Paused · Game detected',
      dotColor: 'var(--muted)',
      note: 'When a game such as Valorant is running in the background/foreground policy state, optional telemetry and GPU enumeration stay paused; mouse stays on-demand only.'
    }
  };

  const root = document.documentElement;
  const reducedMotionQuery = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  const lightSchemeQuery = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: light)')
    : null;

  /* 1. Theme switching (Apple Dark default unless user prefers light) */
  const themeDots = Array.from(document.querySelectorAll('.theme-dot'));
  const activeThemeNameEl = document.getElementById('active-theme-name');

  function applyTheme(themeKey) {
    if (!THEMES[themeKey]) return;
    root.setAttribute('data-theme', themeKey);
    themeDots.forEach((dot) => {
      dot.setAttribute('aria-pressed', String(dot.dataset.theme === themeKey));
    });
    if (activeThemeNameEl) {
      activeThemeNameEl.textContent = THEMES[themeKey];
    }
  }

  const initialTheme = lightSchemeQuery && lightSchemeQuery.matches ? 'macos-light' : 'apple-dark';
  applyTheme(initialTheme);

  themeDots.forEach((dot) => {
    dot.addEventListener('click', () => applyTheme(dot.dataset.theme));
  });

  /* 2. Hero App Preview (Power modes, refresh rate, sidebar, simulated sparklines) */
  const modeButtons = Array.from(document.querySelectorAll('.hero-mode'));
  const hzButtons = Array.from(document.querySelectorAll('.hz-pill'));
  const sidebarButtons = Array.from(document.querySelectorAll('.sidebar-item'));

  const hCpuT = document.getElementById('h-cpu-t');
  const hGpuT = document.getElementById('h-gpu-t');
  const hCpuUtil = document.getElementById('h-cpu-util');
  const hGpuUtil = document.getElementById('h-gpu-util');
  const hCpuSub = document.getElementById('h-cpu-sub');
  const hGpuSub = document.getElementById('h-gpu-sub');
  const hRpm = document.getElementById('h-rpm');
  const hFanBar = document.getElementById('h-fan-bar');
  const hFanSub = document.getElementById('h-fan-sub');
  const hFanTag = document.getElementById('h-fan-tag');
  const navTempBadge = document.getElementById('nav-temp-badge');
  const previewModeSub = document.getElementById('preview-mode-sub');
  const previewHzBadge = document.getElementById('preview-hz-badge');
  const previewPageTitle = document.getElementById('preview-page-title');
  const previewContextNote = document.getElementById('preview-context-note');
  const hCpuLine = document.getElementById('h-cpu-line');
  const hCpuArea = document.getElementById('h-cpu-area');
  const hGpuLine = document.getElementById('h-gpu-line');
  const hGpuArea = document.getElementById('h-gpu-area');

  let activeMode = 'Balanced';
  const cpuSpark = [12, 11, 13, 9, 10, 8, 11, 9, 10];
  const gpuSpark = [14, 14, 13, 13, 12, 13, 11, 12, 12];

  function renderSpark(points, lineEl, areaEl) {
    if (!lineEl || !areaEl) return;
    const coords = points.map((y, idx) => `${idx * 10},${y}`).join(' ');
    lineEl.setAttribute('points', coords);
    areaEl.setAttribute('points', `0,18 ${coords} 80,18`);
  }

  function updateHeroMode(modeName) {
    const m = HERO_MODES[modeName];
    if (!m) return;
    activeMode = modeName;
    modeButtons.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.mode === modeName));
    });
    if (hCpuT) hCpuT.textContent = `${m.cpu}°`;
    if (navTempBadge) navTempBadge.textContent = `${m.cpu}°`;
    if (hGpuT) hGpuT.textContent = `${m.gpu}°`;
    if (hCpuUtil) hCpuUtil.textContent = `${m.cpuUtil}%`;
    if (hGpuUtil) hGpuUtil.textContent = `${m.gpuUtil}%`;
    if (hCpuSub) hCpuSub.textContent = `${m.ghz} GHz · ${m.watts} W`;
    if (hGpuSub) hGpuSub.textContent = `${m.gpuGhz} GHz · ${m.gpuWatts} W`;
    if (hRpm) hRpm.textContent = m.rpm.toLocaleString('en-US');
    if (hFanBar) hFanBar.style.width = `${m.pct}%`;
    if (hFanSub) hFanSub.textContent = `RPM · ${modeName}`;
    if (hFanTag) hFanTag.textContent = m.fanTag;
    if (previewModeSub) previewModeSub.textContent = m.subtitle;
  }

  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => updateHeroMode(btn.dataset.mode));
  });

  hzButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const hz = btn.dataset.hz;
      hzButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      if (previewHzBadge) previewHzBadge.textContent = `Panel · ${hz} Hz`;
    });
  });

  sidebarButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const page = PREVIEW_PAGES[btn.dataset.page];
      if (!page) return;
      sidebarButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      if (previewPageTitle) previewPageTitle.textContent = page.title;
      if (previewContextNote) previewContextNote.textContent = page.note;
    });
  });

  /* Subtle simulated sparkline update when motion is permitted */
  let previewOffset = 0;
  setInterval(() => {
    if (reducedMotionQuery && reducedMotionQuery.matches) return;
    const m = HERO_MODES[activeMode];
    previewOffset = (previewOffset + 1) % 4;
    const jitter = [0, 1, -1, 0][previewOffset];
    const cpuY = Math.max(3, Math.min(15, 16 - Math.round(m.cpuUtil / 5) + jitter));
    const gpuY = Math.max(4, Math.min(16, 16 - Math.round(m.gpuUtil / 5) - jitter));
    cpuSpark.shift();
    cpuSpark.push(cpuY);
    gpuSpark.shift();
    gpuSpark.push(gpuY);
    renderSpark(cpuSpark, hCpuLine, hCpuArea);
    renderSpark(gpuSpark, hGpuLine, hGpuArea);
  }, 1500);

  /* 3. Telemetry Policy Simulator */
  const simButtons = Array.from(document.querySelectorAll('.sim-state'));
  const simThermals = document.getElementById('sim-thermals');
  const simBattery = document.getElementById('sim-battery');
  const simGpu = document.getElementById('sim-gpu');
  const simNote = document.getElementById('sim-note');
  const simDot = document.getElementById('sim-status-dot');
  const simTickCountEl = document.getElementById('sim-tick-count');
  const simCpuSampleEl = document.getElementById('sim-cpu-sample');
  const simBatSampleEl = document.getElementById('sim-bat-sample');

  let activeSimState = 'focused';
  let simTicks = 0;

  function applySimState(stateKey) {
    const s = SIM_STATES[stateKey];
    if (!s) return;
    activeSimState = stateKey;
    simButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sim === stateKey)));
    if (simThermals) {
      simThermals.textContent = s.thermals;
      simThermals.className = `policy-value mono tabular-nums ${s.thermalsOk ? 'policy-value-ok' : 'policy-value-muted'}`;
    }
    if (simBattery) {
      simBattery.textContent = s.battery;
      simBattery.className = `policy-value mono tabular-nums ${s.batteryOk ? 'policy-value-ok' : 'policy-value-muted'}`;
    }
    if (simGpu) simGpu.textContent = s.gpu;
    if (simNote) simNote.textContent = s.note;
    if (simDot) simDot.style.background = s.dotColor;
  }

  simButtons.forEach((btn) => {
    btn.addEventListener('click', () => applySimState(btn.dataset.sim));
  });

  setInterval(() => {
    if (activeSimState !== 'focused') return;
    simTicks += 1;
    if (simTickCountEl) simTickCountEl.textContent = String(simTicks);
    if (simCpuSampleEl) {
      const sampleTemp = 55 + (simTicks % 3);
      simCpuSampleEl.textContent = `${sampleTemp} °C`;
    }
    if (simBatSampleEl && simTicks % 5 === 0) {
      simBatSampleEl.textContent = '80%';
    }
  }, 1000);

  /* 4. Lid-Open Keyboard Reset Demo */
  const lidStage = document.getElementById('lid-stage');
  const lidOpenBtn = document.getElementById('lid-open-btn');
  const lidCloseBtn = document.getElementById('lid-close-btn');
  const lidBadge = document.getElementById('lid-badge');
  const lidStatus = document.getElementById('lid-status');
  const lidScreenTitle = document.getElementById('lid-screen-title');
  const lidScreenSub = document.getElementById('lid-screen-sub');

  let lidCountdownTimer = null;

  function clearLidTimer() {
    if (lidCountdownTimer !== null) {
      clearInterval(lidCountdownTimer);
      lidCountdownTimer = null;
    }
  }

  function resetLidClosed() {
    clearLidTimer();
    if (!lidStage) return;
    lidStage.setAttribute('data-lid', 'closed');
    lidStage.setAttribute('data-backlight', 'off');
    if (lidBadge) lidBadge.textContent = 'Lid Closed';
    if (lidScreenTitle) lidScreenTitle.textContent = 'Standby';
    if (lidScreenSub) lidScreenSub.textContent = 'Click Open to preview sequence';
    if (lidStatus) lidStatus.textContent = 'Lid closed · Click Open to simulate reset';
  }

  function runLidOpenDemo() {
    clearLidTimer();
    if (!lidStage) return;
    let remaining = 5;

    lidStage.setAttribute('data-lid', 'open');
    lidStage.setAttribute('data-backlight', 'off');
    if (lidBadge) lidBadge.textContent = `Backlight Off · ${remaining} s`;
    if (lidScreenTitle) lidScreenTitle.textContent = 'Lid Opened';
    if (lidScreenSub) lidScreenSub.textContent = `Resetting keyboard in ${remaining} s`;
    if (lidStatus) lidStatus.textContent = `Backlight Off · Restoring Preset 1 in ${remaining} s…`;

    lidCountdownTimer = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        if (lidBadge) lidBadge.textContent = `Backlight Off · ${remaining} s`;
        if (lidScreenSub) lidScreenSub.textContent = `Resetting keyboard in ${remaining} s`;
        if (lidStatus) lidStatus.textContent = `Backlight Off · Restoring Preset 1 in ${remaining} s…`;
      } else {
        clearLidTimer();
        lidStage.setAttribute('data-backlight', 'preset1');
        if (lidBadge) lidBadge.textContent = 'Preset 1 Active';
        if (lidScreenTitle) lidScreenTitle.textContent = 'Ready';
        if (lidScreenSub) lidScreenSub.textContent = 'Preset 1 restored';
        if (lidStatus) lidStatus.textContent = 'Preset 1 lit cleanly after 5 s reset.';
      }
    }, 1000);
  }

  if (lidOpenBtn) lidOpenBtn.addEventListener('click', runLidOpenDemo);
  if (lidCloseBtn) lidCloseBtn.addEventListener('click', resetLidClosed);

  /* 5. Downloads Loader (fetch downloads.json with file:// fallback) */
  const pkgButtons = Array.from(document.querySelectorAll('.pkg-btn'));
  const downloadCard = document.getElementById('download-card');
  const pkgFilenameEl = document.getElementById('pkg-filename');
  const pkgMetaEl = document.getElementById('pkg-meta');
  const dlActionBtn = document.getElementById('dl-action-btn');
  const verifyCmdEl = document.getElementById('verify-cmd');
  const copyCmdBtn = document.getElementById('copy-cmd-btn');
  const expectedHashEl = document.getElementById('expected-hash');
  const dlVersionLabelEl = document.getElementById('dl-version-label');
  const dlStatusNoteEl = document.getElementById('dl-status-note');
  const headerVersionCta = document.getElementById('header-version-cta');
  const previewVersionTag = document.getElementById('preview-version-tag');

  let downloadData = FALLBACK_DOWNLOADS;
  let activePkgKey = 'standard';
  let copyResetTimer = null;

  function buildVerifyCommand(filename) {
    return `Get-FileHash .\\${filename} -Algorithm SHA256`;
  }

  function renderDownloadPanel() {
    const pkg = downloadData.packages && downloadData.packages[activePkgKey];
    if (!pkg) return;

    const versionLabel = downloadData.statusLabel || `${downloadData.version} (${downloadData.channel}, ${downloadData.signed ? 'signed' : 'unsigned'})`;
    if (dlVersionLabelEl) dlVersionLabelEl.textContent = versionLabel;
    if (headerVersionCta) headerVersionCta.textContent = `Get ${downloadData.version}`;
    if (previewVersionTag) previewVersionTag.textContent = `${downloadData.version} · Simulated UI`;

    pkgButtons.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.pkg === activePkgKey));
    });

    if (downloadCard) {
      downloadCard.setAttribute('data-pkg', activePkgKey);
      downloadCard.setAttribute('data-sha256', pkg.sha256 || '');
    }

    if (pkgFilenameEl) pkgFilenameEl.textContent = pkg.filename;
    if (pkgMetaEl) pkgMetaEl.textContent = `${pkg.subtitle} · Size: ${pkg.size || 'TBD'}`;
    if (verifyCmdEl) verifyCmdEl.textContent = buildVerifyCommand(pkg.filename);
    if (expectedHashEl) expectedHashEl.textContent = pkg.sha256 || 'PENDING_RELEASE_SHA256_PLACEHOLDER';

    const hasRealUrl = Boolean(pkg.url && pkg.url !== '#');
    if (dlActionBtn) {
      if (hasRealUrl) {
        dlActionBtn.href = pkg.url;
        dlActionBtn.setAttribute('download', pkg.filename);
        dlActionBtn.removeAttribute('aria-disabled');
        dlActionBtn.textContent = `Download ${pkg.name} ZIP`;
      } else {
        dlActionBtn.href = '#download';
        dlActionBtn.removeAttribute('download');
        dlActionBtn.setAttribute('aria-disabled', 'true');
        dlActionBtn.textContent = 'Release Asset Pending';
      }
    }
  }

  pkgButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      activePkgKey = btn.dataset.pkg;
      renderDownloadPanel();
    });
  });

  if (dlActionBtn) {
    dlActionBtn.addEventListener('click', (e) => {
      if (dlActionBtn.getAttribute('aria-disabled') === 'true') {
        e.preventDefault();
        if (dlStatusNoteEl) {
          dlStatusNoteEl.textContent = 'This build is a placeholder in downloads.json. Add the real release ZIP URL and SHA-256 hash to downloads.json when published.';
        }
      }
    });
  }

  if (copyCmdBtn) {
    copyCmdBtn.addEventListener('click', async () => {
      const cmd = verifyCmdEl ? verifyCmdEl.textContent : '';
      if (!cmd) return;
      let copied = false;
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        try {
          await navigator.clipboard.writeText(cmd);
          copied = true;
        } catch {
          copied = false;
        }
      }
      if (!copied) {
        try {
          const area = document.createElement('textarea');
          area.value = cmd;
          area.setAttribute('readonly', '');
          area.style.position = 'fixed';
          area.style.opacity = '0';
          document.body.appendChild(area);
          area.select();
          copied = document.execCommand('copy');
          document.body.removeChild(area);
        } catch {
          copied = false;
        }
      }
      copyCmdBtn.textContent = copied ? 'Copied' : 'Copy manually';
      if (copyResetTimer) clearTimeout(copyResetTimer);
      copyResetTimer = setTimeout(() => {
        copyCmdBtn.textContent = 'Copy';
      }, 1500);
    });
  }

  async function loadDownloadsJson() {
    renderDownloadPanel();
    try {
      const response = await fetch('downloads.json', { cache: 'no-store' });
      if (!response.ok) return;
      const parsed = await response.json();
      if (parsed && parsed.packages && parsed.packages.standard && parsed.packages.standalone) {
        downloadData = parsed;
        renderDownloadPanel();
      }
    } catch {
      /* Expected on file:// in some browsers; FALLBACK_DOWNLOADS remains active. */
    }
  }

  loadDownloadsJson();
})();
