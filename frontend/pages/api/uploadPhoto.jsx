import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper: parse the form using formidable
function parseForm(req, uploadDir) {
  const form = formidable({
    uploadDir,
    keepExtensions: true,
  });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Only POST allowed');
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    // Ensure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    // Parse the incoming form
    const { files } = await parseForm(req, uploadDir);
    // Debug log to inspect file structure
    console.log('files:', files);
    // Safely extract the uploaded file
    const file = Array.isArray(files.profilePhoto)
      ? files.profilePhoto[0]
      : files.profilePhoto;
    if (!file || !file.filepath) {
      return res.status(400).json({ error: 'No file uploaded or invalid format.' });
    }
    const inputPath = file.filepath;
    const outputFilename = `processed-${path.basename(inputPath)}`;
    const outputPath = path.join(uploadDir, outputFilename);
    console.log('CWD:', process.cwd());
    console.log('Input path:', inputPath);
    console.log('Output path:', outputPath);
    // Confirm file exists
    if (!fs.existsSync(inputPath)) {
      return res.status(400).json({ error: `File not found at: ${inputPath}` });
    }
    // Process image with ImageMagick
    const cmd = `magick "${inputPath}" -resize 256x256^ -gravity center -extent 256x256 "${outputPath}"`;
    exec(cmd, (err) => {
      if (err) {
        console.error('ImageMagick error:', err);
        return res.status(500).json({ error: 'ImageMagick failed.' });
      }
      const publicUrl = `/uploads/${outputFilename}`;
      return res.status(200).json({ url: publicUrl });
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Upload failed.' });
  }
}
