import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import JSZip from 'jszip';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Save,
  Upload,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Copy,
  Printer,
  Image as ImageIcon,
  Calendar,
  ArrowDownToLine,
  Check,
  Laptop,
  FolderArchive,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  FileCode,
  Monitor,
  Terminal,
} from 'lucide-react';
import { Category, Expense, Currency, AlertSettings } from '../types';
import { formatCurrency, generateCSV } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedCategoryName } from '../utils/categoryLocalization';
import { AppLogo } from './AppLogo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface DownloadCenterProps {
  currentYearMonth: string;
  income: number;
  totalSpent: number;
  categories: Category[];
  expenses: Expense[];
  currency: Currency;
  alertSettings: AlertSettings;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onShowToast: (msg: string) => void;
}

export const DownloadCenter: React.FC<DownloadCenterProps> = ({
  currentYearMonth,
  income,
  totalSpent,
  categories,
  expenses,
  currency,
  alertSettings,
  onImportJSON,
  onShowToast,
}) => {
  const { language, formatMonth, t } = useLanguage();
  const isEs = language === 'es';
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [downloadingHtml, setDownloadingHtml] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // PWA Install Prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        // @ts-ignore
        window.navigator.standalone === true
      );
    }
    return false;
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  // Month filtered expenses
  const currentMonthExpenses = expenses.filter((e) => e.date.startsWith(currentYearMonth));
  const remainingCash = Math.max(0, income - totalSpent);
  const spentPct = income > 0 ? (totalSpent / income) * 100 : 0;

  // Generate Windows batch installer script
  const generateWindowsInstallerBat = (gastiUrl: string): string => {
    return `@echo off
chcp 65001 >nul
title Instalador Oficial de gasti
cls
echo =======================================================================
echo               INSTALADOR AUTOMATICO DE GASTI PARA PC
echo =======================================================================
echo.
echo  [1/4] Preparando carpeta del programa en tu equipo...
set "APP_DIR=%LOCALAPPDATA%\\gasti"
if not exist "%APP_DIR%" mkdir "%APP_DIR%"

echo  [2/4] Instalando aplicacion gasti en tu equipo...
if exist "%~dp0gasti.html" (
    copy /y "%~dp0gasti.html" "%APP_DIR%\\gasti.html" >nul
) else if exist "%USERPROFILE%\\Downloads\\gasti.html" (
    copy /y "%USERPROFILE%\\Downloads\\gasti.html" "%APP_DIR%\\gasti.html" >nul
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; try { (New-Object System.Net.WebClient).DownloadFile('${gastiUrl}', '%APP_DIR%\\gasti.html') } catch {}"
)

echo  [3/4] Creando Acceso Directo oficial en tu Escritorio...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [System.Environment]::GetFolderPath('Desktop'); $s = $ws.CreateShortcut((Join-Path $desktop 'gasti.lnk')); $browser = if (Test-Path 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe') { 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' } elseif (Test-Path 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe') { 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' } else { 'msedge.exe' }; $s.TargetPath = $browser; $s.Arguments = '--app=\"file:///' + ('%APP_DIR%\\gasti.html' -replace '\\\\', '/') + '\"'; $s.Description = 'gasti - Control de Gastos y Presupuestos'; $s.Save()"

echo  [4/4] Agregando al Menu Inicio de Windows...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $sm = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('StartMenu'), 'Programs'); $s = $ws.CreateShortcut((Join-Path $sm 'gasti.lnk')); $browser = if (Test-Path 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe') { 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' } elseif (Test-Path 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe') { 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' } else { 'msedge.exe' }; $s.TargetPath = $browser; $s.Arguments = '--app=\"file:///' + ('%APP_DIR%\\gasti.html' -replace '\\\\', '/') + '\"'; $s.Description = 'gasti - Control de Gastos y Presupuestos'; $s.Save()"

echo.
echo  =======================================================================
echo       [OK] GASTI SE HA INSTALADO CON EXITO EN TU DISPOSITIVO!
echo  =======================================================================
echo.
echo   [+] Acceso directo creado en tu Escritorio (Desktop)
echo   [+] Agregado al Menu Inicio de Windows
echo   [+] Aplicacion lista para usar 100%% offline y sin conexion
echo.
echo  Iniciando aplicacion en modo ventana...
start "" msedge.exe --app="file:///%APP_DIR:\\=/%/gasti.html" 2>nul || start "" chrome.exe --app="file:///%APP_DIR:\\=/%/gasti.html" 2>nul || start "" "%APP_DIR%\\gasti.html"
timeout /t 3 >nul
exit
`;
  };

  // Generate Mac installer command
  const generateMacInstallerCommand = (): string => {
    return `#!/bin/bash
DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
mkdir -p "$HOME/Applications"
if [ -f "$DIR/gasti.html" ]; then
  cp "$DIR/gasti.html" "$HOME/Applications/gasti.html"
fi
cat << 'EOF' > "$HOME/Applications/gasti.command"
#!/bin/bash
open -a "Google Chrome" --args --app="file://$HOME/Applications/gasti.html" 2>/dev/null || open -a "Microsoft Edge" --args --app="file://$HOME/Applications/gasti.html" 2>/dev/null || open "$HOME/Applications/gasti.html"
EOF
chmod +x "$HOME/Applications/gasti.command"
ln -sf "$HOME/Applications/gasti.command" "$HOME/Desktop/gasti"
echo "======================================================="
echo " ¡gasti se ha instalado con éxito en tu Mac!           "
echo " Se ha creado el acceso directo 'gasti' en tu Escritorio."
echo "======================================================="
open "$HOME/Applications/gasti.command"
`;
  };

  // Download Windows Installer (.bat)
  const handleDownloadWindowsInstaller = async () => {
    try {
      const gastiFullUrl = new URL('gasti.html', window.location.href).href;
      const batContent = generateWindowsInstallerBat(gastiFullUrl);
      const blob = new Blob([batContent], { type: 'application/x-bat;charset=utf-8' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'Instalar-gasti-Windows.bat';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      // Also trigger gasti.html so both files are together in Downloads
      handleDownloadHtmlFile();

      // Also trigger gasti.html so both files are together in Downloads
      handleDownloadHtmlFile();

      onShowToast(
        isEs
          ? '¡Instalador descargado! Haz doble clic en "Instalar-gasti-Windows.bat" para instalar.'
          : 'Installer downloaded! Double-click "Instalar-gasti-Windows.bat" to install.'
      );
    } catch (err) {
      console.error('Error downloading Windows installer:', err);
    }
  };

  // 1. Install App via PWA trigger
  const handleInstallApp = async () => {
    if (isInstalled) {
      onShowToast(t('download.installStatusInstalled'));
      return;
    }
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          onShowToast(isEs ? '¡Aplicación instalada exitosamente! 🎉' : 'App installed successfully! 🎉');
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('PWA install error:', err);
      }
    } else {
      const guideEl = document.getElementById('pwa-installation-guide');
      if (guideEl) {
        guideEl.scrollIntoView({ behavior: 'smooth' });
      }
      onShowToast(t('download.installStatusGuide'));
    }
  };

  // 2. Download Full Standalone App (.ZIP)
  const handleDownloadAppZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Fetch assets
      let logoSvg = '';
      let faviconSvg = '';
      let manifestJson = '';
      try {
        const [resLogo, resFav, resMan] = await Promise.all([
          fetch('/app-logo.svg'),
          fetch('/favicon.svg'),
          fetch('/manifest.webmanifest'),
        ]);
        if (resLogo.ok) logoSvg = await resLogo.text();
        if (resFav.ok) faviconSvg = await resFav.text();
        if (resMan.ok) manifestJson = await resMan.text();
      } catch {
        // Fallback gracefully
      }

      // Offline HTML launcher
      const offlineHtml = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>gasti - Control Inteligente de Presupuesto</title>
  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <link rel="manifest" href="manifest.webmanifest" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #09090b;
      color: #fafafa;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
      text-align: center;
    }
    .card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 24px;
      padding: 36px 28px;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);
    }
    h1 {
      color: #10b981;
      margin-top: 18px;
      margin-bottom: 8px;
      font-size: 30px;
      font-weight: 900;
      letter-spacing: -0.03em;
    }
    p {
      color: #a1a1aa;
      line-height: 1.6;
      font-size: 14px;
      margin: 8px 0 20px 0;
    }
    .btn {
      display: inline-block;
      background: #10b981;
      color: #ffffff;
      font-weight: 800;
      font-size: 15px;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 14px;
      transition: all 0.2s;
      cursor: pointer;
    }
    .btn:hover {
      background: #059669;
      transform: translateY(-2px);
    }
    .box {
      background: #09090b;
      border: 1px solid #27272a;
      border-radius: 16px;
      padding: 18px;
      margin: 24px 0;
      text-align: left;
      font-size: 13px;
    }
    ul {
      margin: 10px 0 0 0;
      padding-left: 20px;
      color: #d4d4d8;
    }
    li {
      margin-bottom: 8px;
      line-height: 1.5;
    }
    .badge {
      display: inline-block;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">App Portátil & Offline</span>
    <div style="margin-top: 16px;">
      <img src="app-logo.svg" width="96" height="96" alt="gasti logo" style="border-radius: 22px; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.2);" />
    </div>
    <h1>gasti</h1>
    <p>Paquete completo de gasti listo para utilizar en tu computadora, celular o servidor local sin depender de conexión a internet.</p>
    
    <div class="box">
      <strong style="color: #34d399; font-size: 14px;">📋 Instrucciones de Inicio Rápido:</strong>
      <ul>
        <li>Abre este archivo <strong>index.html</strong> con doble clic en Google Chrome, Microsoft Edge, Safari o Firefox.</li>
        <li>Tus registros se almacenan de manera local y 100% segura en tu navegador.</li>
        <li>En dispositivos móviles o de escritorio puedes añadir un acceso directo con el logo verde oficial.</li>
      </ul>
    </div>

    <a href="./index.html" class="btn">🚀 Abrir Aplicación gasti</a>
  </div>
</body>
</html>`;

      const readmeTxt = `=====================================================
GASTI - PAQUETE COMPLETO DE LA APLICACIÓN (.ZIP)
=====================================================

¡Gracias por descargar gasti!

Esta carpeta contiene todos los archivos necesarios para ejecutar la aplicación de forma autónoma:

1. ARCHIVOS INCLUIDOS:
   - index.html: Punto de entrada offline con la interfaz de gasti.
   - manifest.webmanifest: Configuración de PWA para instalación nativa.
   - app-logo.svg: Logotipo vectorial oficial de alta resolución.
   - favicon.svg: Ícono para pestañas de navegador.

2. CÓMO USARLA EN TU COMPUTADORA:
   - Descomprime este archivo .ZIP en cualquier carpeta.
   - Haz doble clic en "index.html".
   - ¡Listo! Se abrirá instantáneamente en tu navegador.

3. CÓMO INSTALARLA EN TU CELULAR (ANDROID / IPHONE):
   - Abre el enlace web de gasti en Chrome o Safari.
   - Android: Menú (3 puntos) > "Agregar a la pantalla principal" o "Instalar aplicación".
   - iPhone: Botón Compartir > "Agregar al inicio".

¡Controla tus gastos y reparte tus presupuestos en porcentaje de forma fácil y privada!
`;

      let gastiHtml = '';
      try {
        const resHtml = await fetch('/gasti.html');
        if (resHtml.ok) gastiHtml = await resHtml.text();
      } catch {
        // ignore
      }

      zip.file('index.html', gastiHtml || offlineHtml);
      zip.file('gasti.html', gastiHtml || offlineHtml);
      zip.file('1-CLIC-INSTALAR-WINDOWS.bat', generateWindowsInstallerBat(window.location.origin));
      zip.file('1-CLIC-INSTALAR-MAC.command', generateMacInstallerCommand());
      zip.file('LEEME_INSTRUCCIONES.txt', readmeTxt);
      zip.file('README.txt', readmeTxt);
      if (logoSvg) zip.file('app-logo.svg', logoSvg);
      if (faviconSvg) zip.file('favicon.svg', faviconSvg);
      if (manifestJson) zip.file('manifest.webmanifest', manifestJson);

      const blob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'gasti-instalador-dispositivo.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      onShowToast(t('download.zipSuccess'));
    } catch (err) {
      console.error('Error creating app ZIP:', err);
      onShowToast(isEs ? 'Error al generar el archivo ZIP de la app' : 'Error generating app ZIP');
    } finally {
      setIsZipping(false);
    }
  };

  // Primary Device Installer Action (Autodetects device and initiates installation)
  const handleInstallOnDevice = async () => {
    const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
    const isWindows = /windows|win32/i.test(navigator.userAgent);

    if (isMobile) {
      // Trigger PWA install on mobile
      await handleInstallApp();
      // Also download HTML file as offline backup
      handleDownloadHtmlFile();
    } else if (isWindows) {
      // Trigger Windows automatic installer + HTML
      handleDownloadWindowsInstaller();
    } else {
      // Mac / Linux or general desktop
      handleDownloadAppZip();
    }
  };

  // 2. Download Standalone Single HTML File
  const handleDownloadHtmlFile = async () => {
    setDownloadingHtml(true);
    try {
      let htmlText = '';
      const candidateUrls = [
        new URL('gasti.html', window.location.href).href,
        './gasti.html',
        'gasti.html',
        '/gasti.html',
      ];

      for (const candidate of candidateUrls) {
        try {
          const res = await fetch(candidate, { cache: 'no-store' });
          if (res.ok) {
            const text = await res.text();
            if (text && text.includes('<html') && text.length > 500) {
              htmlText = text;
              break;
            }
          }
        } catch {
          // try next
        }
      }

      if (!htmlText) {
        // Try current page html
        try {
          const resIndex = await fetch(new URL('index.html', window.location.href).href);
          if (resIndex.ok) {
            const indexText = await resIndex.text();
            if (indexText && indexText.includes('<html')) {
              htmlText = indexText;
            }
          }
        } catch {
          // fallback
        }
      }

      if (!htmlText || htmlText.length < 500) {
        htmlText = `<!DOCTYPE html>\n${document.documentElement.outerHTML}`;
      }

      const blob = new Blob([htmlText], { type: 'text/html;charset=utf-8' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'gasti.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      onShowToast(t('download.downloadHtmlSuccess'));
    } catch (err) {
      console.error('Error downloading HTML:', err);
      // Fallback direct navigation download
      const link = document.createElement('a');
      link.href = new URL('gasti.html', window.location.href).href;
      link.download = 'gasti.html';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowToast(isEs ? 'Iniciando descarga de gasti.html...' : 'Starting download of gasti.html...');
    } finally {
      setDownloadingHtml(false);
    }
  };

  // 3. Download SVG Logo
  const handleDownloadSvgLogo = () => {
    const link = document.createElement('a');
    link.href = '/app-logo.svg';
    link.download = 'gasti-app-logo.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(isEs ? '¡Logo SVG vectorial descargado! 🎨' : 'SVG vector logo downloaded! 🎨');
  };

  // 4. Download Favicon
  const handleDownloadFavicon = () => {
    const link = document.createElement('a');
    link.href = '/favicon.svg';
    link.download = 'gasti-favicon.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(isEs ? '¡Favicon descargado! 🔖' : 'Favicon downloaded! 🔖');
  };

  // 5. Download PNG High-Res Logo (512x512)
  const handleDownloadPngLogo = async () => {
    setDownloadingPng(true);
    try {
      const response = await fetch('/app-logo.svg');
      const svgText = await response.text();
      const img = new Image();
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 512, 512);
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = 'gasti-logo-512x512.png';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(blobURL);
          onShowToast(isEs ? '¡Logo PNG (512x512) descargado! 🚀' : 'High-res PNG logo downloaded! 🚀');
        }
        setDownloadingPng(false);
      };
      img.onerror = () => {
        setDownloadingPng(false);
        onShowToast(isEs ? 'Error al convertir a PNG' : 'Error converting to PNG');
      };
      img.src = blobURL;
    } catch {
      setDownloadingPng(false);
      onShowToast(isEs ? 'Error al descargar PNG' : 'Error downloading PNG');
    }
  };

  // 6. Download Monthly CSV
  const handleDownloadMonthlyCSV = () => {
    const csv = generateCSV(currentMonthExpenses, categories, currency);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gasti-gastos-${currentYearMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast(
      isEs
        ? `¡Gastos de ${formatMonth(currentYearMonth)} exportados a CSV! 📊`
        : `Expenses for ${formatMonth(currentYearMonth)} exported to CSV! 📊`
    );
  };

  // 7. Download All History CSV
  const handleDownloadAllCSV = () => {
    const csv = generateCSV(expenses, categories, currency);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gasti-historial-completo.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast(
      isEs ? '¡Historial completo exportado a CSV! 📊' : 'Full expense history exported to CSV! 📊'
    );
  };

  // 8. Download Full JSON Backup
  const handleDownloadJSONBackup = () => {
    const backupData = {
      app: 'gasti',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      income,
      currency,
      categories,
      expenses,
      alertSettings,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gasti-copia-seguridad-${currentYearMonth}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast(isEs ? '¡Copia de seguridad JSON descargada! 💾' : 'Full JSON backup downloaded! 💾');
  };

  // 9. Copy Text Summary
  const handleCopySummary = () => {
    const lines = [
      `🌟 GASTI — ${t('download.pdfCardTitle').toUpperCase()} (${formatMonth(currentYearMonth)})`,
      `=========================================`,
      `💰 ${t('overview.monthlyIncome')}: ${formatCurrency(income, currency)}`,
      `💸 ${t('overview.totalSpending')}: ${formatCurrency(totalSpent, currency)} (${spentPct.toFixed(1)}%)`,
      `💵 ${t('overview.remainingCash')}: ${formatCurrency(remainingCash, currency)}`,
      ``,
      `🎒 ${t('manager.title').toUpperCase()}:`,
      ...categories.map((c) => {
        const catName = getLocalizedCategoryName(c, language);
        const catSpent = currentMonthExpenses
          .filter((e) => e.categoryId === c.id)
          .reduce((sum, e) => sum + e.amount, 0);
        const catBudget = (income * c.percentage) / 100;
        const catPct = catBudget > 0 ? (catSpent / catBudget) * 100 : 0;
        return `• ${catName} (${c.percentage}%): ${formatCurrency(catSpent, currency)} / ${formatCurrency(
          catBudget,
          currency
        )} (${catPct.toFixed(0)}%)`;
      }),
      ``,
      `📅 Report Date: ${new Date().toLocaleDateString()}`,
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
    onShowToast(isEs ? '¡Resumen copiado al portapapeles! 📋' : 'Summary copied to clipboard! 📋');
  };

  // 10. Print / Save as PDF
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="download-center-section">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-zinc-950 border border-emerald-800/60 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-900/60 border border-emerald-600/60 flex items-center justify-center text-emerald-300 shadow-inner">
              <ArrowDownToLine className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{t('download.title')}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  {t('download.badge')}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-2xl">
                {t('download.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePrintReport}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm font-bold border border-zinc-700 shadow-md cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>{t('download.printPdfBtn')}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ================= HERO: DESCARGAR & INSTALAR LA APLICACIÓN ================= */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-zinc-950 rounded-2xl p-5 sm:p-6 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-950/40 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              <AppLogo className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-xl shadow-emerald-950/80 border border-emerald-600/50" />
              {isInstalled && (
                <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-zinc-950 p-1 rounded-full shadow-md">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {t('download.installCardTitle')}
                </h3>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    isInstalled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                  }`}
                >
                  {isInstalled ? t('download.installStatusInstalled') : t('download.installStatusReady')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                {t('download.installCardDesc')}
              </p>
              <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% Offline & Privado</span>
                </span>
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <Smartphone className="w-4 h-4 text-zinc-400" />
                  <span>Android, iOS & PC</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons for App Download/Install */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={downloadingHtml}
              onClick={handleDownloadHtmlFile}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-950/80 cursor-pointer transition-all border border-emerald-400/50"
            >
              <FileCode className="w-4 h-4 text-emerald-200" />
              <span>
                {downloadingHtml
                  ? (isEs ? 'Descargando gasti.html...' : 'Downloading...')
                  : (isEs ? 'Descargar App HTML (.html)' : 'Download App HTML (.html)')}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleDownloadWindowsInstaller}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-sm border border-zinc-700 shadow-md cursor-pointer transition-all"
            >
              <Laptop className="w-4 h-4 text-blue-400" />
              <span>{t('download.downloadInstallerBtn')}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleInstallApp}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-sm border border-zinc-700 shadow-md cursor-pointer transition-all"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>{t('download.installPwaBtn')}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isZipping}
              onClick={handleDownloadAppZip}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-sm border border-zinc-700 shadow-md cursor-pointer transition-all"
            >
              <FolderArchive className="w-4 h-4 text-emerald-400" />
              <span>{isZipping ? (isEs ? 'Empaquetando...' : 'Packing...') : t('download.downloadZipBtn')}</span>
            </motion.button>
          </div>
        </div>

        {/* 4 Direct Installation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-zinc-800/80">
          {/* Card 1: Windows PC Installer */}
          <div className="bg-zinc-950/80 rounded-xl p-3.5 border border-zinc-800 flex flex-col justify-between hover:border-blue-500/40 transition-colors">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="flex items-center gap-1.5 font-bold text-xs text-blue-400">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Windows (PC / Laptop)</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                  .BAT
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                {isEs
                  ? 'Descarga el instalador automático. Crea el acceso directo en tu Escritorio y Menú Inicio con 1 doble clic.'
                  : 'Downloads automatic installer. Creates Desktop and Start Menu shortcut with 1 double-click.'}
              </p>
            </div>
            <button
              onClick={handleDownloadWindowsInstaller}
              className="w-full py-2 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isEs ? 'Descargar Instalador PC' : 'Download PC Installer'}</span>
            </button>
          </div>

          {/* Card 2: Mobile / PWA */}
          <div className="bg-zinc-950/80 rounded-xl p-3.5 border border-zinc-800 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="flex items-center gap-1.5 font-bold text-xs text-emerald-400">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Android & iPhone</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  App PWA
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                {isEs
                  ? 'Instala en la pantalla principal de tu celular con ícono verde oficial y acceso rápido sin conexión.'
                  : 'Installs on your phone home screen with official green logo and fast offline access.'}
              </p>
            </div>
            <button
              onClick={handleInstallApp}
              className="w-full py-2 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isEs ? 'Instalar en Celular' : 'Install on Phone'}</span>
            </button>
          </div>

          {/* Card 3: Complete ZIP Package */}
          <div className="bg-zinc-950/80 rounded-xl p-3.5 border border-zinc-800 flex flex-col justify-between hover:border-teal-500/40 transition-colors">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="flex items-center gap-1.5 font-bold text-xs text-teal-400">
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>Paquete Completo</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
                  .ZIP
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                {isEs
                  ? 'Incluye instalador de Windows, script para Mac, archivo HTML autónomo, logos e instrucciones.'
                  : 'Includes Windows installer, Mac script, standalone HTML app, logos and guide.'}
              </p>
            </div>
            <button
              onClick={handleDownloadAppZip}
              disabled={isZipping}
              className="w-full py-2 px-3 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>{isZipping ? (isEs ? 'Empaquetando...' : 'Packing...') : (isEs ? 'Descargar Paquete ZIP' : 'Download ZIP')}</span>
            </button>
          </div>

          {/* Card 4: Standalone HTML */}
          <div className="bg-zinc-950/80 rounded-xl p-3.5 border-2 border-emerald-500/50 flex flex-col justify-between hover:border-emerald-400 transition-colors shadow-lg shadow-emerald-950/20">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="flex items-center gap-1.5 font-black text-xs text-emerald-400">
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{isEs ? 'App HTML Portátil' : 'Portable HTML App'}</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-bold">
                  .HTML
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed mb-3">
                {isEs
                  ? 'Archivo único independiente. Ábrelo con doble clic en cualquier laptop o teléfono, ejecútalo e instálalo como app.'
                  : 'Single independent file. Double click to run on any computer or phone, run and install as app.'}
              </p>
            </div>
            <button
              onClick={handleDownloadHtmlFile}
              disabled={downloadingHtml}
              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/50 text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingHtml ? (isEs ? 'Descargando...' : 'Downloading...') : (isEs ? 'Descargar gasti.html' : 'Download gasti.html')}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Grid of Download Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ================= 1. LOGO OFICIAL DE LA APP ================= */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-zinc-900/90 rounded-2xl p-5 border border-zinc-800 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {t('download.officialLogoTitle')}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {t('download.officialLogoDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Logo Preview */}
            <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/80 flex items-center justify-center gap-6 my-3">
              <div className="text-center">
                <AppLogo className="w-20 h-20 shadow-2xl shadow-emerald-950/80 mx-auto rounded-2xl" />
                <span className="text-[10px] font-bold text-zinc-400 block mt-1.5">
                  512 x 512 px
                </span>
              </div>
              <div className="space-y-1 text-xs text-zinc-300">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isEs ? 'Fondo verde bosque #166534' : 'Forest green #166534'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isEs ? 'Vectorial nítido escalable' : 'Scalable crisp vector'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isEs ? 'Formato Web, PWA y Móvil' : 'Web, PWA & Mobile ready'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-800/80">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadSvgLogo}
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('download.svgBtn')}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={downloadingPng}
              onClick={handleDownloadPngLogo}
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 shadow-md transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{downloadingPng ? (isEs ? 'Convirtiendo...' : 'Converting...') : t('download.pngBtn')}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadFavicon}
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs border border-zinc-700 shadow-md transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>{t('download.faviconBtn')}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* ================= 2. EXCEL / CSV DE GASTOS ================= */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-zinc-900/90 rounded-2xl p-5 border border-zinc-800 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {t('download.csvCardTitle')}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {t('download.csvCardDesc')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 rounded-xl p-3.5 border border-zinc-800/80 my-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-300">
                <span>{t('download.activeMonthExpenses')}</span>
                <strong className="text-emerald-400 font-mono font-bold">
                  {currentMonthExpenses.length} {t('download.records')} (
                  {formatCurrency(totalSpent, currency)})
                </strong>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>{t('download.totalHistoryExpenses')}</span>
                <span className="font-mono font-bold text-zinc-200">{expenses.length} {t('download.records')}</span>
              </div>
              <div className="text-[11px] text-zinc-500 pt-1 border-t border-zinc-850">
                {t('download.csvColsDesc')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-800/80">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadMonthlyCSV}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t('download.downloadMonthCsvBtn')}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadAllCSV}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 shadow-md transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{t('download.downloadAllCsvBtn')}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* ================= 3. INFORME MENSUAL IMPRIMIBLE / PDF ================= */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-zinc-900/90 rounded-2xl p-5 border border-zinc-800 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {t('download.pdfCardTitle')}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {t('download.pdfCardDesc')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 rounded-xl p-3.5 border border-zinc-800/80 my-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-200 font-bold">
                <span>{formatMonth(currentYearMonth)}</span>
                <span className="text-emerald-400 font-mono">
                  {formatCurrency(totalSpent, currency)} / {formatCurrency(income, currency)}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {isEs
                  ? 'Puedes imprimirlo directamente o guardarlo en formato PDF mediante el diálogo del navegador.'
                  : 'You can print it directly or save as PDF via your browser dialog.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-800/80">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrintReport}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>{t('download.printPdfBtn')}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCopySummary}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 shadow-md transition-colors cursor-pointer"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">{t('download.copiedBtn')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-teal-400" />
                  <span>{t('download.copySummaryBtn')}</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* ================= 4. COPIA DE SEGURIDAD JSON ================= */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-zinc-900/90 rounded-2xl p-5 border border-zinc-800 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-400">
                  <Save className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {t('download.backupCardTitle')}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {t('download.backupCardDesc')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 rounded-xl p-3.5 border border-zinc-800/80 my-3 space-y-2 text-xs">
              <p className="text-zinc-300">
                {t('download.backupDetails')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-800/80">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadJSONBackup}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t('download.downloadJsonBtn')}</span>
            </motion.button>

            <label className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 shadow-md transition-colors cursor-pointer">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>{t('download.restoreJsonBtn')}</span>
              <input
                type="file"
                accept=".json"
                onChange={onImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </motion.div>
      </div>

      {/* ================= 5. INSTALACIÓN SEGÚN DISPOSITIVO ================= */}
      <motion.div
        id="pwa-installation-guide"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-zinc-900/90 rounded-2xl p-5 sm:p-6 border border-zinc-800 shadow-lg scroll-mt-20"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white">
              {t('download.installCardTitle')}
            </h3>
            <p className="text-xs text-zinc-400">
              {t('download.installStatusGuide')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* Android */}
          <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-400 mb-2">
                <span>🤖 {t('download.androidTitle')}</span>
              </div>
              <ol className="text-xs text-zinc-300 space-y-2 list-decimal list-inside leading-relaxed">
                <li>{t('download.androidStep1')}</li>
                <li>{t('download.androidStep2')}</li>
                <li>{t('download.androidStep3')}</li>
              </ol>
            </div>
          </div>

          {/* iPhone / iOS */}
          <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-sm text-teal-400 mb-2">
                <span>🍎 {t('download.iosTitle')}</span>
              </div>
              <ol className="text-xs text-zinc-300 space-y-2 list-decimal list-inside leading-relaxed">
                <li>{t('download.iosStep1')}</li>
                <li>{t('download.iosStep2')}</li>
                <li>{t('download.iosStep3')}</li>
              </ol>
            </div>
          </div>

          {/* PC / Mac */}
          <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-sm text-blue-400 mb-2">
                <span>💻 {t('download.pcTitle')}</span>
              </div>
              <ol className="text-xs text-zinc-300 space-y-2 list-decimal list-inside leading-relaxed">
                <li>{t('download.pcStep1')}</li>
                <li>{t('download.pcStep2')}</li>
                <li>{t('download.pcStep3')}</li>
              </ol>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
