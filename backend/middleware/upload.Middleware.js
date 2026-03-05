
import multer from "multer";

//memomry storage helps to store files in memory as Buffer objects not in disk

//When you use a middleware like Multer with memoryStorage, 
// the uploaded file is stored temporarily in your server's RAM as a Buffer (raw binary data).
const storage = multer.memoryStorage();

//1. Clients sends image data
//2. Multer catches it and puts it into req.file.buffer.
export const upload = multer({
    storage,
    //object specifying the size limits
    //fieldSize -> is the maximum size of each form field i.e. 2 MB limit
    limits : { fieldSize : 2 * 1024 * 1024 },
    //fileFilter -> a function t control which files should be uploaded and which should be skipped
    fileFilter : (req, file, cb) => {
        if(!file.mimetype.startsWith("image/")){
            return cb(new Error("Only image files are allowed"), false);
        }
        cb(null, true);
    }
});