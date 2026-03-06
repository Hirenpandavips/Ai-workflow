import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import * as userProfileService from '../services/user-profile.service';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await userProfileService.getUserProfile(req.user!.userId);
    res.json(profile);
  } catch (err) {
    const message = (err as Error).message;
    const status = message === 'User not found' ? 404 : 400;
    res.status(status).json({ message });
  }
});

router.put('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await userProfileService.updateUserProfile(
      req.user!.userId,
      req.body,
    );
    res.json(profile);
  } catch (err) {
    const message = (err as Error).message;
    let status = 400;
    if (message === 'User not found') status = 404;
    if (message === 'Email already in use') status = 409;
    res.status(status).json({ message });
  }
});

export default router;
