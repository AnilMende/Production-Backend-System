import express from 'express';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { blockUser, deleteUserByAdmin, getAllUsers, unblockUser } from '../controllers/userController.js';

const adminRouter = express.Router();

//ADMIN ROUTES
adminRouter.get("/users", verifyAccessToken, authorizeRoles("admin"), getAllUsers);

adminRouter.delete("/user/:id", verifyAccessToken, authorizeRoles("admin"), deleteUserByAdmin);

adminRouter.put("/block/:id", verifyAccessToken, authorizeRoles("admin"), blockUser);

adminRouter.put("/unblock/:id", verifyAccessToken, authorizeRoles("admin"), unblockUser);

export default adminRouter;