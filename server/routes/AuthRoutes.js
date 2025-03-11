import { Router } from 'express';
import { getUserInfo, login, signUp ,  logOut} from '../controllers/AuthController.js';
import { verifyToken } from '../middlewares/AuthMiddleware.js';
// import multer from 'multer';
// import { updateProfile , addProfileImage, removeProfileImage} from '../controllers/AuthController.js';



const authRoutes = Router();
// const upload = multer({ dest: 'uploads/profiles' });

authRoutes.post('/signup', signUp)
authRoutes.post('/login', login)
// Defined in AuthController.js
authRoutes.get('/user-info', verifyToken, getUserInfo)
// authRoutes.post('/update-profile', verifyToken, updateProfile)
// authRoutes.post('/add-profile-image', verifyToken, upload.single("profile-image"), addProfileImage)
// authRoutes.delete('/remove-profile-image', verifyToken, removeProfileImage)
authRoutes.post('/logout', logOut)
export default authRoutes;
