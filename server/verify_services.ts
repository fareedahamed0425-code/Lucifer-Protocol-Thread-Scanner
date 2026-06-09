import { urlAnalyzer } from './services/urlAnalyzer';
import { whoisService } from './services/whoisService';
import { dnsService } from './services/dnsService';
import { ipService } from './services/ipService';
import { sslService } from './services/sslService';
import { contentAnalyzer } from './services/contentAnalyzer';
import { threatIntelService } from './services/threatIntelService';
import { riskEngine } from './services/riskEngine';

async function runTests() {
  console.log("\n============================================");
  console.log("🔥 RUNNING LUCIFER PROTOCOL v2 INTEGRITY AUDIT");
  console.log("============================================\n");

  const testUrl = "https://github.com";
  const testDomain = "github.com";

  try {
    // 1. URL Analysis
    console.log("🔍 [1/7] Testing URL Intelligence Engine...");
    const urlRes = urlAnalyzer.analyze(testUrl);
    console.log(`   - Score: ${urlRes.score}/100`);
    console.log(`   - Findings: ${urlRes.findings.length} found`);
    if (urlRes.score > 50) throw new Error("URL analyze score unexpectedly high for github.com");

    // 2. WHOIS Lookup
    console.log("\n🌐 [2/7] Testing WHOIS/RDAP Domain Intelligence...");
    const whoisRes = await whoisService.analyze(testDomain);
    console.log(`   - Score: ${whoisRes.score}/100`);
    console.log(`   - Registrar: ${whoisRes.rawData.registrar}`);
    console.log(`   - Age: ${whoisRes.rawData.domainAgeDays} days`);

    // 3. DNS lookup
    console.log("\n📡 [3/7] Testing DNS Record Auditing...");
    const dnsRes = await dnsService.analyze(testDomain);
    console.log(`   - Score: ${dnsRes.score}/100`);
    console.log(`   - SPF Status: ${dnsRes.rawData.securityChecks.spf.present ? 'Present' : 'Missing'}`);
    console.log(`   - DMARC Status: ${dnsRes.rawData.securityChecks.dmarc.present ? 'Present' : 'Missing'}`);

    // 4. IP Geolocation
    console.log("\n📍 [4/7] Testing Geolocation & IP Registry...");
    const ipRes = await ipService.analyze(testDomain);
    console.log(`   - Score: ${ipRes.score}/100`);
    console.log(`   - Country: ${ipRes.rawData.country}`);
    console.log(`   - ISP: ${ipRes.rawData.isp}`);
    console.log(`   - IP Address: ${ipRes.rawData.ipAddress}`);

    // 5. SSL Check
    console.log("\n🔒 [5/7] Testing TLS Socket Handshake...");
    const sslRes = await sslService.analyze(testDomain);
    console.log(`   - Score: ${sslRes.score}/100`);
    console.log(`   - TLS Version: ${sslRes.rawData.tlsVersion}`);
    console.log(`   - Issuer: ${sslRes.rawData.issuer}`);
    console.log(`   - Days Remaining: ${sslRes.rawData.daysRemaining}`);

    // 6. Content Analysis
    console.log("\n📝 [6/7] Testing HTML Scraping & Credentials Audit...");
    const contentRes = await contentAnalyzer.analyze(testUrl, testDomain);
    console.log(`   - Score: ${contentRes.score}/100`);
    console.log(`   - Password Fields: ${contentRes.rawData.hasPasswordFields ? 'Yes' : 'No'}`);
    console.log(`   - Script Count: ${contentRes.rawData.externalScriptCount}`);

    // 7. Threat Feeds
    console.log("\n🛡️ [7/7] Testing Reputation Threat Intelligence...");
    const activeIp = ipRes.rawData.ipAddress || "140.82.112.4";
    const threatRes = await threatIntelService.analyze(testUrl, testDomain, activeIp);
    console.log(`   - Score: ${threatRes.score}/100`);
    console.log(`   - VT Checked: ${threatRes.rawData.vtReported ? 'Malicious' : 'Safe'}`);

    // Risk Calculations
    console.log("\n⚡ Computing Final Risk Metric Consensus...");
    const riskReport = riskEngine.calculate({
      urlScore: urlRes.score,
      domainScore: whoisRes.score,
      dnsScore: dnsRes.score,
      ipScore: ipRes.score,
      sslScore: sslRes.score,
      contentScore: contentRes.score,
      threatIntelScore: threatRes.score
    });
    console.log(`   - Final Weighted Score: ${riskReport.score}/100`);
    console.log(`   - Risk Level: ${riskReport.level}`);

    console.log("\n============================================");
    console.log("✅ ALL INDEPENDENT MODULE TESTS COMPLETED SUCCESSFULLY");
    console.log("============================================\n");
  } catch (err: any) {
    console.error("\n❌ TEST FAILURE ENCOUNTERED:", err.message);
    process.exit(1);
  }
}

runTests();
