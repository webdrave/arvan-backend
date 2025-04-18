import { Router } from 'express';
import multer from 'multer';
import cloudinary from 'cloudinary';
import { RouteError } from '../common/routeerror.js';
import HttpStatusCodes from '../common/httpstatuscode.js';
const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: {
        fileSize: 30 * 1024 * 1024 // 30MB limit
    }
});

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

router.post("/", upload.single('file'), async (req, res, next) => {
    if (!req.file) {
        throw new RouteError(HttpStatusCodes.NOT_FOUND,"No file was uploaded");
    }

    const uploadResult = await new Promise<cloudinary.UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
            { 
                resource_type: "auto", 
                folder: "uploads", 
                timeout: 600000,
                chunk_size: 6000000 // 6MB chunks for better upload handling
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    reject(error);
                } else {
                    resolve(result!);
                }
            }
        );

        uploadStream.end(req.file?.buffer);
    });

    res.status(HttpStatusCodes.OK).json({ url: uploadResult.secure_url });
});

router.post("/multiple", upload.array('files', 10), async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        throw new RouteError(HttpStatusCodes.NOT_FOUND, "No files were uploaded");
    }

    const uploadPromises = (req.files as Express.Multer.File[]).map(file => {
        return new Promise<cloudinary.UploadApiResponse>((resolve, reject) => {
            const uploadStream = cloudinary.v2.uploader.upload_stream(
                { 
                    resource_type: "auto", 
                    folder: "uploads", 
                    timeout: 600000,
                    chunk_size: 6000000 // 6MB chunks for better upload handling
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary Upload Error:", error);
                        reject(error);
                    } else {
                        resolve(result!);
                    }
                }
            );

            uploadStream.end(file.buffer);
        });
    });

    const uploadResults = await Promise.all(uploadPromises);
    const urls = uploadResults.map(result => result.secure_url);

    res.status(HttpStatusCodes.OK).json({ urls });
});

export default router;