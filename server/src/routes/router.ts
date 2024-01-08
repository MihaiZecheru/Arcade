// main
import register from './main/register';
import login from './main/login';
import get_user_by_id from './main/get_user_by_id';

// money
import get_total_balance from './money/get_total_balance';
import get_bank_balance from './money/get_bank_balance';
import get_wallet_balance from './money/get_wallet_balance';
import deposit_money_to_bank from './money/deposit_money_to_bank';
import withdraw_money_from_bank from './money/withdraw_money_from_bank';

// rps
import create_room from './rps/create_room';
import get_all_rooms from './rps/get_all_rooms';
import get_room_by_id from './rps/get_room_by_id';
import rps_websocket from './rps/websocket';

const router = {
  main: {
    register,
    login,
    get_user_by_id,
  },
  money: {
    get_total_balance,
    get_bank_balance,
    get_wallet_balance,
    deposit_money_to_bank,
    withdraw_money_from_bank
  
  },
  rps: {
    create_room,
    get_all_rooms,
    get_room_by_id,
    websocket: rps_websocket,
  }
};

export default router;