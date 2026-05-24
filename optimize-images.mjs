import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const directories = [
    'src/assets',
    'src/assets/illustrations',
    'public'
];

async function optimizeImages() {
    for (const dir of directories) {
        if (!fs.existsSync(dir)) continue;
        
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            if (file.endsWith('.png')) {
                const filePath = path.join(dir, file);
                const tempPath = filePath + '.tmp';
                
                try {
                    const metadata = await sharp(filePath).metadata();
                    console.log(`Optimizing: ${filePath} (Original: ${(metadata.size / 1024).toFixed(2)} KB)`);
                    
                    await sharp(filePath)
                        .png({ quality: 60, compressionLevel: 8 })
                        .toFile(tempPath);
                        
                    fs.renameSync(tempPath, filePath);
                    
                    const newSize = fs.statSync(filePath).size;
                    console.log(`-> Done: ${(newSize / 1024).toFixed(2)} KB`);
                } catch (err) {
                    console.error(`Error processing ${filePath}:`, err);
                }
            }
        }
    }
}

optimizeImages();
