import register from './main/register';
import login from './main/login';
import get_user_by_id from './main/get_user_by_id';

const router = {
  main: {
    register,
    login,
    get_user_by_id,
  }
};

export default router;