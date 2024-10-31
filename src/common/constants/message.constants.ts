export interface ApiMessageLanguage {
  vi: string;
  en: string;
}

export enum ApiMessageKey {
  REGISTER_SUCCESS = 'REGISTER_SUCCESS',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  CHANGE_PASSWORD_SUCCESS = 'CHANGE_PASSWORD_SUCCESS',
  FORGOT_PASSWORD_SUCCESS = 'FORGOT_PASSWORD_SUCCESS',
  REFRESH_TOKEN_SUCCESS = 'REFRESH_TOKEN_SUCCESS',
  GET_ALL_USERS_SUCCESS = 'GET_ALL_USERS_SUCCESS',
  CREATE_ADMIN_SUCCESS = 'CREATE_ADMIN_SUCCESS',
  GET_2FA_SUCCESS = 'GET_2FA_SUCCESS',
  VERIFY_2FA_SUCCESS = 'VERIFY_2FA_SUCCESS',
  DISABLE_2FA_SUCCESS = 'DISABLE_2FA_SUCCESS',
  GET_USER_DETAIL_SUCCESS = 'GET_USER_DETAIL_SUCCESS',
  UPDATE_USER_SUCCESS = 'UPDATE_USER_SUCCESS',
  DELETE_USER_SUCCESS = 'DELETE_USER_SUCCESS',
  CREATE_USER_SUCCESS = 'CREATE_USER_SUCCESS',
  CONNECT_WALLET_SUCCESS = 'CONNECT_WALLET_SUCCESS',
  GET_ALL_WALLET_SUCCESS = 'GET_ALL_WALLET_SUCCESS',
  GET_ALL_ASSET_SUCCESS = 'GET_ALL_ASSET_SUCCESS',
  GET_ASSET_DETAIL_SUCCESS = 'GET_ASSET_DETAIL_SUCCESS',
  SAVE_ASSET_SUCCESS = 'SAVE_ASSET_SUCCESS',
  UPDATE_ASSET_SUCCESS = 'UPDATE_ASSET_SUCCESS',
  DELETE_ASSET_SUCCESS = 'DELETE_ASSET_SUCCESS',
  DEPOSIT_SUCCESS = 'DEPOSIT_SUCCESS',
  FIAT_DEPOSIT_SUCCESS = 'FIAT_DEPOSIT_SUCCESS',
  WITHDRAW_SUCCESS = 'WITHDRAW_SUCCESS',
  CREATE_TRANSACTION_SUCCESS = 'CREATE_TRANSACTION_SUCCESS',
  GET_ALL_TRANSACTION_SUCCESS = 'GET_ALL_TRANSACTION_SUCCESS',
  UPDATE_TRANSACTION_STATUS_SUCCESS = 'UPDATE_TRANSACTION_STATUS_SUCCESS',
  GET_SETTING_SUCCESS = 'GET_SETTING_SUCCESS',
  UPDATE_SETTING_SUCCESS = 'UPDATE_SETTING_SUCCESS',
  GET_ALL_STAKING_POOL_SUCCESS = 'GET_ALL_STAKING_POOL_SUCCESS',
  GET_STAKING_POOL_DETAIL_SUCCESS = 'GET_STAKING_POOL_DETAIL_SUCCESS',
  CREATE_STAKING_POOL_SUCCESS = 'CREATE_STAKING_POOL_SUCCESS',
  UPDATE_STAKING_POOL_SUCCESS = 'UPDATE_STAKING_POOL_SUCCESS',
  DELETE_STAKING_POOL_SUCCESS = 'DELETE_STAKING_POOL_SUCCESS',
  GET_TRANSACTION_DETAIL_SUCCESS = 'GET_TRANSACTION_DETAIL_SUCCESS',
  GET_ALL_VOLUME_SETTING_SUCCESS = 'GET_ALL_VOLUME_SETTING_SUCCESS',
  CREATE_VOLUME_SETTING_SUCCESS = 'CREATE_VOLUME_SETTING_SUCCESS',
  UPDATE_VOLUME_SETTING_SUCCESS = 'UPDATE_VOLUME_SETTING_SUCCESS',
  DELETE_VOLUME_SETTING_SUCCESS = 'DELETE_VOLUME_SETTING_SUCCESS',
  CREATE_PASSWORD_SUCCESS = 'CREATE_PASSWORD_SUCCESS',
  CHECK_RESERVE_WALLET_BALANCE_SUCCESS = 'CHECK_RESERVE_WALLET_BALANCE_SUCCESS',
  FIND_MASTER_WALLET_SUCCESS = 'FIND_MASTER_WALLET_SUCCESS',
  CREATE_MASTER_WALLET_SUCCESS = 'CREATE_MASTER_WALLET_SUCCESS',
  UPDATE_MASTER_WALLET_BALANCE_SUCCESS = 'UPDATE_MASTER_WALLET_BALANCE_SUCCESS',
  UPDATE_MASTER_WALLET_SUCCESS = 'UPDATE_MASTER_WALLET_SUCCESS',
  DELETE_MASTER_WALLET_SUCCESS = 'DELETE_MASTER_WALLET_SUCCESS',
}

export const apiMessage: Record<ApiMessageKey, ApiMessageLanguage> = {
  [ApiMessageKey.REGISTER_SUCCESS]: {
    vi: 'Đăng ký tài khoản thành công.',
    en: 'Registration successful.',
  },
  [ApiMessageKey.LOGIN_SUCCESS]: {
    vi: 'Đăng nhập thành công.',
    en: 'Logged in successfully.',
  },
  [ApiMessageKey.CHANGE_PASSWORD_SUCCESS]: {
    vi: 'Đổi mật khẩu thành công.',
    en: 'Changed password successfully.',
  },
  [ApiMessageKey.FORGOT_PASSWORD_SUCCESS]: {
    vi: 'Phục hồi mật khẩu thành công.',
    en: 'Reset password successfully.',
  },
  [ApiMessageKey.REFRESH_TOKEN_SUCCESS]: {
    vi: 'Refresh token thành công.',
    en: 'Refresh token successfully.',
  },
  [ApiMessageKey.GET_ALL_USERS_SUCCESS]: {
    vi: 'Lấy danh sách khách hàng thành công.',
    en: 'Get all users successfully.',
  },
  [ApiMessageKey.GET_2FA_SUCCESS]: {
    vi: 'Lấy 2FA thành công.',
    en: 'Get 2FA successfully.',
  },
  [ApiMessageKey.VERIFY_2FA_SUCCESS]: {
    vi: 'Xác minh 2FA thành công.',
    en: 'Verify 2FA successfully.',
  },
  [ApiMessageKey.DISABLE_2FA_SUCCESS]: {
    vi: 'Vô hiệu hóa 2FA thành công.',
    en: 'Disable 2FA successfully.',
  },
  [ApiMessageKey.CREATE_ADMIN_SUCCESS]: {
    vi: 'Tạo admin thành công.',
    en: 'Created admin successfully.',
  },
  [ApiMessageKey.GET_USER_DETAIL_SUCCESS]: {
    vi: 'Lấy thông tin chi tiết của khách hàng thành công.',
    en: 'Get user detail successfully.',
  },
  [ApiMessageKey.UPDATE_USER_SUCCESS]: {
    vi: 'Cập nhật thông tin khách hàng thành công.',
    en: 'Updated user successfully.',
  },
  [ApiMessageKey.DELETE_USER_SUCCESS]: {
    vi: 'Xóa khách hàng thành công.',
    en: 'Deleted user successfully.',
  },
  [ApiMessageKey.CREATE_USER_SUCCESS]: {
    vi: 'Thêm khách hàng mới thành công.',
    en: 'Created user successfully.',
  },
  [ApiMessageKey.CONNECT_WALLET_SUCCESS]: {
    vi: 'Kết nối ví thành công.',
    en: 'Connected wallet successfully.',
  },
  [ApiMessageKey.GET_ALL_WALLET_SUCCESS]: {
    vi: 'Lấy danh sách ví đã kết nối thành công.',
    en: 'Get all wallet successfully.',
  },
  [ApiMessageKey.GET_ALL_ASSET_SUCCESS]: {
    vi: 'Lấy danh sách assets thành công.',
    en: 'Get all assets successfully.',
  },
  [ApiMessageKey.GET_ASSET_DETAIL_SUCCESS]: {
    vi: 'Lấy chi tiết asset thành công.',
    en: 'Get asset detail successfully.',
  },
  [ApiMessageKey.SAVE_ASSET_SUCCESS]: {
    vi: 'Thêm asset mới thành công.',
    en: 'Saved asset successfully.',
  },
  [ApiMessageKey.UPDATE_ASSET_SUCCESS]: {
    vi: 'Cập nhật asset thành công.',
    en: 'Update asset successfully.',
  },
  [ApiMessageKey.DELETE_ASSET_SUCCESS]: {
    vi: 'Xóa asset thành công.',
    en: 'Delete asset successfully.',
  },
  [ApiMessageKey.DEPOSIT_SUCCESS]: {
    vi: 'Deposit token thành công.',
    en: 'Deposit token successfully.',
  },
  [ApiMessageKey.WITHDRAW_SUCCESS]: {
    vi: 'Withdraw token thành công.',
    en: 'Withdraw token successfully.',
  },
  [ApiMessageKey.CREATE_TRANSACTION_SUCCESS]: {
    vi: 'Tạo giao dịch thành công.',
    en: 'Create transaction successfully.',
  },
  [ApiMessageKey.GET_ALL_TRANSACTION_SUCCESS]: {
    vi: 'Lấy danh sách giao dịch thành công.',
    en: 'Get all transactions successfully.',
  },
  [ApiMessageKey.UPDATE_TRANSACTION_STATUS_SUCCESS]: {
    vi: 'Cập nhật trạng thái giao dịch thành công.',
    en: 'Updated transaction status successfully.',
  },
  [ApiMessageKey.GET_SETTING_SUCCESS]: {
    vi: 'Lấy setting thành công.',
    en: 'Get setting successfully.',
  },
  [ApiMessageKey.UPDATE_SETTING_SUCCESS]: {
    vi: 'Cập nhật setting thành công.',
    en: 'Updated setting successfully.',
  },
  [ApiMessageKey.GET_ALL_STAKING_POOL_SUCCESS]: {
    vi: 'Lấy danh sách staking pools thành công.',
    en: 'Get list staking pools successfully.',
  },
  [ApiMessageKey.GET_STAKING_POOL_DETAIL_SUCCESS]: {
    vi: 'Lấy chi tiết staking pool thành công.',
    en: 'Get staking pool detail successfully.',
  },
  [ApiMessageKey.CREATE_STAKING_POOL_SUCCESS]: {
    vi: 'Tạo staking pool thành công.',
    en: 'Created staking pool successfully.',
  },
  [ApiMessageKey.UPDATE_STAKING_POOL_SUCCESS]: {
    vi: 'Cập nhật staking pool thành công.',
    en: 'Updated staking pool successfully.',
  },
  [ApiMessageKey.DELETE_STAKING_POOL_SUCCESS]: {
    vi: 'Xóa staking pool thành công.',
    en: 'Deleted staking pool successfully.',
  },
  [ApiMessageKey.GET_TRANSACTION_DETAIL_SUCCESS]: {
    vi: 'Lấy chi tiết giao dịch thành công.',
    en: 'Get transaction detail successfully.',
  },
  [ApiMessageKey.GET_ALL_VOLUME_SETTING_SUCCESS]: {
    vi: 'Lấy volume setting thành công.',
    en: 'Get volume setting successfully.',
  },
  [ApiMessageKey.CREATE_VOLUME_SETTING_SUCCESS]: {
    vi: 'Tạo volume setting thành công.',
    en: 'Create volume setting successfully.',
  },
  [ApiMessageKey.UPDATE_VOLUME_SETTING_SUCCESS]: {
    vi: 'Cập nhật volume setting thành công.',
    en: 'Update volume setting successfully.',
  },
  [ApiMessageKey.DELETE_VOLUME_SETTING_SUCCESS]: {
    vi: 'Xóa volume setting thành công.',
    en: 'Delete volume setting successfully.',
  },
  [ApiMessageKey.CREATE_PASSWORD_SUCCESS]: {
    vi: 'Tạo mật khẩu thành công.',
    en: 'Created password successfully.',
  },
  [ApiMessageKey.CHECK_RESERVE_WALLET_BALANCE_SUCCESS]: {
    vi: 'Kiểm tra số dư reserve wallet thành công.',
    en: 'Check reserve wallet balance success.',
  },
  [ApiMessageKey.FIND_MASTER_WALLET_SUCCESS]: {
    vi: 'Lấy thông tin ví tổng thành công.',
    en: 'Find master wallet success.',
  },
  [ApiMessageKey.CREATE_MASTER_WALLET_SUCCESS]: {
    vi: 'Tạo ví tổng thành công.',
    en: 'Create master wallet success.',
  },
  [ApiMessageKey.UPDATE_MASTER_WALLET_BALANCE_SUCCESS]: {
    vi: 'Cập nhật số dư ví tổng thành công.',
    en: 'Update master wallet balance success.',
  },
  [ApiMessageKey.UPDATE_MASTER_WALLET_SUCCESS]: {
    vi: 'Cập nhật số master wallet thành công.',
    en: 'Update master wallet success.',
  },
  [ApiMessageKey.DELETE_MASTER_WALLET_SUCCESS]: {
    vi: 'Xóa master wallet thành công.',
    en: 'Delete master wallet success.',
  },
  [ApiMessageKey.FIAT_DEPOSIT_SUCCESS]: {
    vi: 'Nạp tiền fiat thành công.',
    en: 'Fiat deposit successful.',
  },
};
