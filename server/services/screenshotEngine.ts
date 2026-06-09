import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const isVercel = !!process.env.VERCEL;
const screenshotsDir = isVercel 
  ? '/tmp' 
  : path.join(__dirname, '../public/screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Let's create a small valid base64 PNG of a red warning box (100x100 pixels) to avoid heavy strings:
const RED_WARNING_BASE64 = 
  'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5gYJDgocDw4b' +
  'VwAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLm4clQAAALNJREFUeNrt20ENwDAMwLD8O4srdGhgA4/s3g/oIsfK2n3e5/1r2dvn+Yx7' +
  'snaydrJ2snaydraltZO1k7WTtZO1sy2tney/2MnaSZmRspMyI2UnZUbKTsqMlJ2UGSk7KTNSdlJmpOyizEjZSZmRspMyI2UnZUbKTsqMlJ2UGSk7KTNSdlJm' +
  'pOyizEjZSZmRspMyI2UnZUbKTsqMlJ2UGSk7KTNSdlJmpOyizEjZSZmRspMyI2UnZUbKTsqMlF0O2QIAAP//AwAn4z7u4E3oGAAAAABJRU5ErkJggg==';

export const screenshotEngine = {
  capture: async (urlString: string): Promise<{ screenshotPath: string; thumbnailPath: string; screenshotUrl: string; thumbnailUrl: string }> => {
    // Generate a deterministic filename based on URL hash
    const hash = crypto.createHash('md5').update(urlString).digest('hex');
    const filename = `${hash}.png`;
    const filepath = path.join(screenshotsDir, filename);

    const thumbFilename = `${hash}_thumb.png`;
    const thumbFilepath = path.join(screenshotsDir, thumbFilename);

    const publicUrl = `https://api.microlink.io?url=${encodeURIComponent(urlString)}&screenshot=true&embed=screenshot.url`;
    const relativePath = isVercel ? publicUrl : `/public/screenshots/${filename}`;
    const relativeThumbPath = isVercel ? publicUrl : `/public/screenshots/${thumbFilename}`;

    try {
      // Clean URL for Microlink (ensure proper protocol encoding)
      const queryUrl = `https://api.microlink.io?url=${encodeURIComponent(urlString)}&screenshot=true&embed=screenshot.url&waitForTimeout=1000`;
      
      const response = await axios.get(queryUrl, { responseType: 'arraybuffer', timeout: 5000 });
      const buffer = Buffer.from(response.data);

      // Save screenshot
      fs.writeFileSync(filepath, buffer);
      // For thumbnail, since we don't use heavy libraries like sharp, we just copy the file and resize in HTML/CSS
      fs.writeFileSync(thumbFilepath, buffer);

      return {
        screenshotPath: filepath,
        thumbnailPath: thumbFilepath,
        screenshotUrl: relativePath,
        thumbnailUrl: relativeThumbPath
      };
    } catch (e) {
      // Fallback: write the warning base64 image if query fails
      const buffer = Buffer.from(RED_WARNING_BASE64, 'base64');
      try {
        fs.writeFileSync(filepath, buffer);
        fs.writeFileSync(thumbFilepath, buffer);
      } catch (err) {
        // Safe fail on read-only system if /tmp is full or has issues
      }

      const fallbackUrl = `data:image/png;base64,${RED_WARNING_BASE64}`;
      return {
        screenshotPath: filepath,
        thumbnailPath: thumbFilepath,
        screenshotUrl: isVercel ? fallbackUrl : relativePath,
        thumbnailUrl: isVercel ? fallbackUrl : relativeThumbPath
      };
    }
  }
};
