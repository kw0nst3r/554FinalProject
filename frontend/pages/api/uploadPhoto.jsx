import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
import {promisify} from 'util';
import {exec} from 'child_process';

const execAsync = promisify(exec);

export const config = {api: {bodyParser: false}};

// Helper: parse the form using formidable
async function parseForm(req, uploadDir) {
  return new Promise((resolve, reject) => {
    formidable({uploadDir, keepExtensions: true}).parse(req, (err, fields, files) =>
      err ? reject(err) : resolve(files)
    );
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Only POST allowed');
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  fs.mkdirSync(uploadDir, {recursive: true});
  try {
    const files = await parseForm(req, uploadDir);
    const file = Array.isArray(files.profilePhoto) ? files.profilePhoto[0] : files.profilePhoto;
    const inputPath = file?.filepath;
    if (!inputPath || !fs.existsSync(inputPath)) {
      return res.status(400).json({ error: 'Invalid or missing file.' });
    }
    const outputFilename = `processed-${path.basename(inputPath)}`;
    const outputPath = path.join(uploadDir, outputFilename);
    await execAsync(`magick "${inputPath}" -resize 256x256^ -gravity center -extent 256x256 "${outputPath}"`);
    return res.status(200).json({ url: `/uploads/${outputFilename}` });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Upload failed.' });
  }
}
