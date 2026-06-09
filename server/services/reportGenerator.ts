import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const reportGenerator = {
  generate: async (data: any, outputPath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 0, // Set margin to 0 to prevent PDFKit auto-page breaks on absolute coordinates
          info: {
            Title: `Lucifer Protocol Security Scan - ${data.domain}`,
            Author: 'Lucifer Protocol Threat Scanner v2',
            Subject: 'Website Forensics & Threat Assessment Report'
          }
        });

        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        // Dark HUD Aesthetic Color System
        const darkBg = '#0A0A0B'; // Deep Slate Black
        const cardBg = '#161617'; // Surface Charcoal
        const borderColor = '#27272A'; // Dark Zinc Border
        const primaryColor = '#FF3131'; // Threat Red
        const secondaryColor = '#FF8C00'; // Caution Orange
        const successColor = '#10B981'; // Secure Green
        const textWhite = '#FFFFFF';
        const textGray = '#A1A1AA';
        const textDarkGray = '#71717A';

        // Helper to draw dark background on the page
        const addPageBackground = (d: any) => {
          d.rect(0, 0, d.page.width, d.page.height).fill(darkBg);
        };

        // Event listener to automatically fill backgrounds on new pages
        doc.on('pageAdded', () => {
          addPageBackground(doc);
        });

        // Initialize First Page Background
        addPageBackground(doc);

        // ==========================================
        // PAGE 1: EXECUTIVE SECURITY BRIEFING HUD
        // ==========================================

        // 1. HUD Header Banner
        doc.rect(50, 25, 495, 80).fill(cardBg);
        doc.rect(50, 25, 495, 80).lineWidth(1).stroke(borderColor);

        doc.fillColor(primaryColor)
           .fontSize(20)
           .font('Helvetica-Bold')
           .text('LUCIFER PROTOCOL v2', 70, 40);

        doc.fontSize(8)
           .font('Helvetica-Bold')
           .fillColor(textGray)
           .text('ILLUMINATING THREATS HIDDEN IN PLAIN SIGHT', 70, 65, { characterSpacing: 1.5 });

        const reportTimeStr = data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString();
        doc.fillColor(textDarkGray)
           .fontSize(7.5)
           .font('Helvetica')
           .text(`REPORT GENERATED: ${reportTimeStr.toUpperCase()}`, 330, 45, { align: 'right', width: 200 });

        doc.fillColor(textGray)
           .fontSize(8.5)
           .font('Courier-Bold')
           .text(`TARGET HOST: ${data.domain?.toUpperCase()}`, 330, 62, { align: 'right', width: 200 });


        // 2. Executive Risk HUD Card
        doc.rect(50, 120, 495, 100).fill(cardBg);
        doc.rect(50, 120, 495, 100).lineWidth(1).stroke(borderColor);

        // Score determination
        const riskScore = data.riskScore !== undefined ? data.riskScore : 0;
        const riskColor = riskScore > 60 ? primaryColor : riskScore > 20 ? secondaryColor : successColor;

        // Custom Vector-Drawn Circular Gauge
        const gaugeX = 110;
        const gaugeY = 170;
        const radius = 35;

        // Background track circle
        doc.circle(gaugeX, gaugeY, radius).lineWidth(6).stroke(borderColor);

        // Foreground active arc path based on score using SVG arcs
        if (riskScore === 100) {
          doc.circle(gaugeX, gaugeY, radius).lineWidth(6).stroke(riskColor);
        } else if (riskScore > 0) {
          const angleRad = (riskScore / 100) * 2 * Math.PI - Math.PI / 2;
          const endX = gaugeX + radius * Math.cos(angleRad);
          const endY = gaugeY + radius * Math.sin(angleRad);
          const largeArcFlag = riskScore > 50 ? 1 : 0;
          const pathString = `M 110 135 A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`;
          doc.path(pathString)
             .lineWidth(6)
             .stroke(riskColor);
        }

        // Center Score labels
        doc.fillColor(riskColor)
           .fontSize(20)
           .font('Helvetica-Bold')
           .text(String(riskScore), 92, 158, { width: 36, align: 'center' });

        doc.fillColor(textDarkGray)
           .fontSize(7)
           .font('Helvetica-Bold')
           .text('THREAT INDEX', 80, 182, { width: 60, align: 'center' });

        // HUD Text Meta values
        doc.fillColor(riskColor)
           .fontSize(12)
           .font('Helvetica-Bold')
           .text(`CLASSIFICATION: ${data.riskLevel?.toUpperCase() || 'UNKNOWN'}`, 180, 140);

        doc.fillColor(textWhite)
           .fontSize(8.5)
           .font('Courier')
           .text(`TARGET URL: ${data.url}`, 180, 160, { width: 345, height: 22 });

        doc.fillColor(secondaryColor)
           .fontSize(8.5)
           .font('Helvetica-Bold')
           .text(`RECOMMENDED DISPOSITION: SECURE ACTION HIGHLY ADVISED`, 180, 190);


        // 3. Deep AI Website Profiler Panel
        doc.rect(50, 235, 495, 100).fill(cardBg);
        doc.rect(50, 235, 495, 100).lineWidth(1).stroke(borderColor);

        // Column 1: Website Purpose Profile
        doc.fillColor(primaryColor)
           .fontSize(8)
           .font('Helvetica-Bold')
           .text('WEBSITE PURPOSE PROFILE', 65, 248);

        doc.fillColor(textWhite)
           .fontSize(7.5)
           .font('Helvetica')
           .text(data.websitePurpose || 'Resolving purpose analysis...', 65, 262, { width: 145, lineGap: 2 });

        // Column 2: User Data Footprint
        doc.fillColor(primaryColor)
           .fontSize(8)
           .font('Helvetica-Bold')
           .text('USER DATA FOOTPRINT', 230, 248);

        let dataY = 262;
        const collectedList = data.dataCollected || [];
        if (collectedList.length > 0) {
          collectedList.slice(0, 5).forEach((item: string) => {
            doc.fontSize(7).font('Courier-Bold').fillColor(textWhite).text(`• ${item.toUpperCase()}`, 230, dataY, { width: 135 });
            dataY += 11;
          });
        } else {
          doc.fontSize(7).font('Helvetica-Oblique').fillColor(textDarkGray).text('No data inputs gathered.', 230, 262);
        }

        // Column 3: Identified Attack Vectors
        doc.fillColor(primaryColor)
           .fontSize(8)
           .font('Helvetica-Bold')
           .text('IDENTIFIED RISK TAGS', 385, 248);

        let threatY = 262;
        const threatsList = data.threatsFound || [];
        if (threatsList.length > 0) {
          threatsList.slice(0, 5).forEach((item: string) => {
            doc.fontSize(7).font('Courier-Bold').fillColor(secondaryColor).text(`⚠️ ${item.toUpperCase()}`, 385, threatY, { width: 135 });
            threatY += 11;
          });
        } else {
          doc.fontSize(7).font('Helvetica-Oblique').fillColor(textDarkGray).text('No threat anomalies tagged.', 385, 262);
        }


        // 4. Network Geolocation Infrastructure Grid
        doc.rect(50, 350, 495, 130).fill(cardBg);
        doc.rect(50, 350, 495, 130).lineWidth(1).stroke(borderColor);

        doc.fillColor(textWhite)
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('NETWORK INFRASTRUCTURE & GEOLOCATION REPORT', 65, 362);

        const drawNetworkRow = (label: string, value: string, rowY: number) => {
          doc.fontSize(8).font('Helvetica-Bold').fillColor(textDarkGray).text(label, 65, rowY);
          doc.font('Courier').fillColor(textWhite).text(value, 210, rowY, { width: 310 });
        };

        const countryStr = data.modules?.ip?.rawData?.country || data.country || 'Unknown';
        const ispStr = data.modules?.ip?.rawData?.isp || data.isp || 'Unknown';
        const asnStr = data.modules?.ip?.rawData?.asn || data.asn || 'Unknown';
        const sslIssuerStr = data.modules?.ssl?.rawData?.issuer || data.sslIssuer || 'No Valid SSL Cert Handshake';
        const domainAgeStr = data.modules?.domain?.rawData?.domainAgeDays !== undefined 
          ? `${data.modules.domain.rawData.domainAgeDays} days (Registered)` 
          : 'Unknown Age / Redacted';

        drawNetworkRow('RESOLVED IP ADDRESS', data.resolvedIp || 'UNRESOLVED / SSRF GUARD ACTIVE', 380);
        drawNetworkRow('COUNTRY OF ORIGIN', countryStr.toUpperCase(), 395);
        drawNetworkRow('ISP PROVIDER', ispStr.toUpperCase(), 410);
        drawNetworkRow('AUTONOMOUS SYSTEM (ASN)', asnStr.toUpperCase(), 425);
        drawNetworkRow('SSL AUTHORITY (CN)', sslIssuerStr.toUpperCase(), 440);
        drawNetworkRow('DOMAIN AGE / REGISTRATION', domainAgeStr.toUpperCase(), 455);


        // 5. AI Security Analyst Summary Card
        doc.rect(50, 495, 495, 150).fill(cardBg);
        doc.rect(50, 495, 495, 150).lineWidth(1).stroke(borderColor);
        doc.rect(50, 495, 4, 150).fill(riskColor); // Side Accent Line

        doc.fillColor(primaryColor)
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('AI INTELLIGENCE EXECUTIVE OPINION', 65, 507);

        doc.fillColor(textWhite)
           .fontSize(8.5)
           .font('Helvetica-Oblique')
           .text(data.aiSummary || 'Analysis processing consensus pending.', 65, 525, { width: 465, lineGap: 3 });

        // Recommendation Box
        doc.rect(65, 590, 465, 45).fill('#1E1B1C');
        doc.rect(65, 590, 465, 45).lineWidth(1).stroke(borderColor);

        doc.fontSize(7.5).font('Helvetica-Bold').fillColor(secondaryColor).text('RECOMMENDED REMEDIATION:', 75, 598);
        doc.fontSize(8).font('Helvetica-Bold').fillColor(textWhite).text(data.recommendation || 'No threats found. Standard traffic logs monitored.', 75, 610, { width: 445 });


        // 6. Explainable Findings Alerts
        doc.fillColor(textWhite)
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('EXPLAINABLE RISK DETECTIONS', 50, 660);

        doc.moveTo(50, 675).lineTo(545, 675).lineWidth(0.5).stroke(borderColor);

        let findingY = 685;
        const reasonsList = data.reasons || [];
        if (reasonsList.length > 0) {
          reasonsList.slice(0, 4).forEach((reason: string) => {
            doc.fontSize(8).font('Courier-Bold').fillColor(primaryColor).text('[!]', 50, findingY);
            doc.font('Helvetica').fillColor(textGray).text(reason, 70, findingY, { width: 475 });
            findingY += 18;
          });
        } else {
          doc.fontSize(8).font('Helvetica-Oblique').fillColor(textDarkGray).text('No alert events generated by modular cores.', 50, 685);
        }

        // Page 1 Footer
        doc.moveTo(50, 775).lineTo(545, 775).lineWidth(0.5).stroke(borderColor);
        doc.fontSize(6.5)
           .font('Helvetica')
           .fillColor(textDarkGray)
           .text('LUCIFER PROTOCOL v2 - CERTIFIED WEB FORENSIC REPORT', 50, 788);

        doc.text('PAGE 1 OF 2', doc.page.width - 150, 788, { align: 'right', width: 100 });


        // ==========================================
        // PAGE 2: EVIDENCE CAPTURE & MODULAR METRICS
        // ==========================================
        doc.addPage();

        // 1. HUD Page 2 Header
        doc.rect(50, 25, 495, 50).fill(cardBg);
        doc.rect(50, 25, 495, 50).lineWidth(1).stroke(borderColor);

        doc.fillColor(textWhite)
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('FORENSIC CAPTURED EVIDENCE & SCORES', 70, 35);

        doc.fillColor(primaryColor)
           .fontSize(8.5)
           .font('Courier-Bold')
           .text(data.domain?.toUpperCase() || 'HOST', 330, 45, { align: 'right', width: 200 });


        // 2. Screenshot evidence card
        doc.rect(50, 90, 310, 210).fill(cardBg);
        doc.rect(50, 90, 310, 210).lineWidth(1).stroke(borderColor);

        doc.fillColor(textGray)
           .fontSize(8)
           .font('Helvetica-Bold')
           .text('FORENSIC WEBPAGE CAPTURE', 65, 102);

        // Embed Screenshot
        let hasScreenshot = false;
        if (data.screenshotPath && fs.existsSync(data.screenshotPath)) {
          try {
            doc.image(data.screenshotPath, 65, 118, { width: 280, height: 165 });
            hasScreenshot = true;
          } catch (e) {
            hasScreenshot = false;
          }
        }

        if (!hasScreenshot) {
          doc.rect(65, 118, 280, 165).fill('#0B0B0C');
          doc.rect(65, 118, 280, 165).lineWidth(1).stroke(borderColor);
          doc.fillColor(textDarkGray)
             .fontSize(8)
             .font('Courier')
             .text('SCREENSHOT LOG ACQUISITION\nFAILED / OVERRIDDEN BY RULES', 85, 185, { align: 'center', width: 240 });
        }


        // 3. Visual similarity brand analysis card
        doc.rect(375, 90, 170, 210).fill(cardBg);
        doc.rect(375, 90, 170, 210).lineWidth(1).stroke(borderColor);

        doc.fillColor(textGray)
           .fontSize(8)
           .font('Helvetica-Bold')
           .text('VISUAL SPOOFING ENGINE', 387, 102);

        const simRaw = data.modules?.visualSimilarity?.rawData || {};
        if (simRaw.impersonatedBrand) {
          doc.rect(387, 120, 146, 40).fill('#1E1B1C');
          doc.rect(387, 120, 146, 40).lineWidth(1).stroke(borderColor);

          doc.fillColor(primaryColor)
             .fontSize(7)
             .font('Helvetica-Bold')
             .text('SPOOFED TARGET BRAND:', 392, 126);

          doc.fillColor(textWhite)
             .fontSize(9.5)
             .font('Helvetica-Bold')
             .text(simRaw.impersonatedBrand.toUpperCase(), 392, 138);

          doc.fillColor(textDarkGray)
             .fontSize(7)
             .font('Helvetica-Bold')
             .text('LAYOUT SIMILARITY:', 387, 175);

          const simScore = simRaw.visualSimilarityScore || 0;
          doc.fillColor(primaryColor)
             .fontSize(18)
             .font('Helvetica-Bold')
             .text(`${simScore}%`, 387, 187);

          // Bar gauge
          doc.rect(387, 210, 146, 4).fill(borderColor);
          doc.rect(387, 210, Math.round(146 * (simScore / 100)), 4).fill(primaryColor);

          // Analysis log summary
          doc.fillColor(textGray)
             .fontSize(7)
             .font('Courier')
             .text(simRaw.details || 'No structural spoof anomalies identified.', 387, 222, { width: 146, lineGap: 1.5 });

        } else {
          doc.fillColor(textDarkGray)
             .fontSize(7.5)
             .font('Helvetica-Oblique')
             .text('NO BRAND IMPERSONATION\nSPOOF ANOMALIES IDENTIFIED\nBY GEMINI VISION LOGIC', 387, 160, { align: 'center', width: 146 });
        }


        // 4. Modular Telemetry checklist rows
        doc.rect(50, 315, 495, 445).fill(cardBg);
        doc.rect(50, 315, 495, 445).lineWidth(1).stroke(borderColor);

        doc.fillColor(textWhite)
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('MODULAR SECURITY ENGINE DATA PENETRATION LOGS', 65, 327);

        doc.moveTo(50, 340).lineTo(545, 340).lineWidth(0.5).stroke(borderColor);

        const modulesToRender = [
          {
            name: 'URL HEURISTICS & ATTRIBUTE DETECTIONS',
            key: 'url',
            getMetrics: (raw: any) => `LENGTH: ${data.url?.length || 0} chars\nSUBDOMAINS: ${raw.subdomain || 'NONE'}\nPUNYCODE: ${raw.isPunycode ? 'YES' : 'NO'}`
          },
          {
            name: 'WHOIS DOMAIN REGISTRATION RECORDS',
            key: 'domain',
            getMetrics: (raw: any) => `REGISTRAR: ${(raw.registrar || 'N/A').substring(0, 18).toUpperCase()}\nAGE: ${raw.domainAgeDays !== undefined ? `${raw.domainAgeDays} days` : 'N/A'}\nWHOIS PRIVACY: ${raw.isHiddenWhois ? 'YES' : 'NO'}`
          },
          {
            name: 'DNS RECORD & SPF/DMARC AUDITING',
            key: 'dns',
            getMetrics: (raw: any) => `A RECORDS: ${raw.aRecords?.length || 0} resolved\nSPF POLICY: ${raw.securityChecks?.spf?.present ? 'VERIFIED' : 'MISSING'}\nDMARC POLICY: ${raw.securityChecks?.dmarc?.present ? 'VERIFIED' : 'MISSING'}`
          },
          {
            name: 'IP REGISTRY & GEOLOCATION FEED',
            key: 'ip',
            getMetrics: (raw: any) => `RESOLVED IP: ${raw.ipAddress || 'N/A'}\nCOUNTRY: ${(raw.country || 'N/A').toUpperCase()}\nISP: ${(raw.isp || 'N/A').substring(0, 18).toUpperCase()}`
          },
          {
            name: 'SSL/TLS SOCKET HANDSHAKE AUDIT',
            key: 'ssl',
            getMetrics: (raw: any) => `VERSION: ${raw.tlsVersion || 'N/A'}\nVALIDITY: ${raw.daysRemaining !== undefined ? `${raw.daysRemaining} days` : 'N/A'}\nALGORITHM: ${raw.signatureAlgorithm || 'N/A'}`
          },
          {
            name: 'HTML CONTENT & CREDENTIAL AUDIT',
            key: 'content',
            getMetrics: (raw: any) => `CREDENTIAL FORM: ${raw.hasPasswordFields ? 'DETECTED' : 'NONE'}\nHIDDEN FIELDS: ${raw.hiddenFieldsCount || 0}\nOBFUSCATED JS: ${raw.hasObfuscatedJS ? 'YES' : 'NO'}`
          },
          {
            name: 'REPUTATION BLACKLISTS & THREAT FEEDS',
            key: 'threatIntel',
            getMetrics: (raw: any) => `VIRUSTOTAL: ${raw.vtReported ? 'MALICIOUS' : 'CLEAN'}\nABUSE DECAY: ${raw.abuseReportsCount || 0} reports\nPHISHTANK: ${raw.phishTankListed ? 'LISTED' : 'CLEAN'}`
          }
        ];

        let yPos = 345;
        modulesToRender.forEach((item) => {
          const modData = data.modules?.[item.key] || { score: 0, findings: [], rawData: {} };
          const mScore = modData.score || 0;
          const modColor = mScore > 60 ? primaryColor : mScore > 20 ? secondaryColor : successColor;
          const modSymbol = mScore > 60 ? '[!]' : mScore > 20 ? '[~]' : '[✓]';

          doc.fillColor(textWhite)
             .fontSize(8)
             .font('Helvetica-Bold')
             .text(item.name, 65, yPos + 6);

          doc.fillColor(modColor)
             .fontSize(7.5)
             .font('Courier-Bold')
             .text(`${modSymbol} SCORE: ${mScore}/100`, 65, yPos + 18);

          const findingsText = modData.findings && modData.findings.length > 0 
            ? modData.findings.slice(0, 2).join(' | ') 
            : 'No vulnerability anomalies detected.';
          
          doc.fillColor(textGray)
             .fontSize(7.5)
             .font('Helvetica')
             .text(findingsText, 65, yPos + 28, { width: 230, height: 20 });

          // Monospaced metrics columns
          const metricsStr = item.getMetrics(modData.rawData || {});
          doc.fillColor(textGray)
             .fontSize(7)
             .font('Courier')
             .text(metricsStr, 310, yPos + 8, { width: 215, lineGap: 2 });

          // Draw separator row
          doc.moveTo(50, yPos + 55).lineTo(545, yPos + 55).lineWidth(0.5).stroke(borderColor);
          yPos += 56;
        });


        // Page 2 Footer
        doc.moveTo(50, 775).lineTo(545, 775).lineWidth(0.5).stroke(borderColor);
        doc.fontSize(6.5)
           .font('Helvetica')
           .fillColor(textDarkGray)
           .text('LUCIFER PROTOCOL v2 - CERTIFIED WEB FORENSIC REPORT', 50, 788);

        doc.text('PAGE 2 OF 2', doc.page.width - 150, 788, { align: 'right', width: 100 });

        doc.end();

        writeStream.on('finish', () => resolve());
        writeStream.on('error', (err) => reject(err));
      } catch (e) {
        reject(e);
      }
    });
  }
};
