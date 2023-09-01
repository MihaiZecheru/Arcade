// main
import register from './main/register';
import login from './main/login';
import get_user_by_id from './main/get_user_by_id';

// rps
import create_room from './rps/create_room';

const router = {
  main: {
    register,
    login,
    get_user_by_id,
  },
  rps: {
    create_room,
  }
};

export default router;