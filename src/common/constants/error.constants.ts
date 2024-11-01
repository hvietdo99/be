import { ApiMessageLanguage } from '@src/common/constants/message.constants';

export enum ErrorCode {
  INVALID_ACCESS_TOKEN = 'INVALID_ACCESS_TOKEN',
  EMAIL_HAS_BEEN_USED = 'EMAIL_HAS_BEEN_USED',
  EMAIL_NOT_EXISTED = 'EMAIL_NOT_EXISTED',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  TWO_FA_UNVERIFIED = 'TWO_FA_UNVERIFIED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  USER_INACTIVE = 'USER_INACTIVE',
  WALLET_HAS_BEEN_REGISTER = 'WALLET_HAS_BEEN_REGISTER',
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  TRANSACTION_NOT_FOUND = 'TRANSACTION_NOT_FOUND',
  ASSET_ADDRESS_EXISTED = 'ASSET_ADDRESS_EXISTED',
  ASSET_NOT_FOUND = 'ASSET_NOT_FOUND',
  INVALID_ASSET = 'INVALID_ASSET',
  TRANSACTION_TX_EXISTED = 'TRANSACTION_TX_EXISTED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SETTING_NOT_FOUND = 'SETTING_NOT_FOUND',
  POOL_NOT_FOUND = 'POOL_NOT_FOUND',
  TX_EXISTED = 'TX_EXISTED',
  VOLUME_TIER_EXISTED = 'VOLUME_TIER_EXISTED',
  VOLUME_SETTING_NOT_FOUND = 'VOLUME_SETTING_NOT_FOUND',
  MASTER_WALLET_NOT_FOUND = 'MASTER_WALLET_NOT_FOUND',
  CODE_NOT_FOUND = 'CODE_NOT_FOUND',
  RESERVE_WALLET_NOT_FOUND = 'RESERVE_WALLET_NOT_FOUND',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  MASTER_WALLET_INSUFFICIENT_BALANCE = 'MASTER_WALLET_INSUFFICIENT_BALANCE',
  RESERVE_WALLET_INSUFFICIENT_BALANCE = 'RESERVE_WALLET_INSUFFICIENT_BALANCE',
  GET_BALANCE_ERROR = 'GET_BALANCE_ERROR',
  USER_BALANCE_NOT_FOUND = 'USER_BALANCE_NOT_FOUND',
  USER_INFORMATION_HAS_NOT_BEEN_UPDATED_YET = 'USER_INFORMATION_HAS_NOT_BEEN_UPDATED_YET',
  SEND_TRANSACTION_ERROR = 'SEND_TRANSACTION_ERROR',
  CANNOT_TRANSFER_TO_ONESELF = 'CANNOT_TRANSFER_TO_ONESELF',
  RECEIVER_NOT_FOUND = 'RECEIVER_NOT_FOUND',
  DURATION_NOT_FOUND = 'DURATION_NOT_FOUND',
  USER_DOES_NOT_HAVE_A_PASSWORD = 'USER_DOES_NOT_HAVE_A_PASSWORD',
  USER_ALREADY_HAS_PASSWORD = 'USER_ALREADY_HAS_PASSWORD',
  MASTER_WALLET_EXISTED = 'MASTER_WALLET_EXISTED',
  ADDRESS_EXISTED = 'ADDRESS_EXISTED',
  UNSUPPORTED_NETWORK = 'UNSUPPORTED_NETWORK',
  INVALID_DEPOSIT = 'INVALID_DEPOSIT',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  INVALID_ORDER_STATE = 'INVALID_ORDER_STATE',
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  ORDER_LIMIT_EXCEEDED = 'ORDER_LIMIT_EXCEEDED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SECURITY_REQUIREMENTS_NOT_MET = 'SECURITY_REQUIREMENTS_NOT_MET',
  TRANSACTION_HISTORY_ERROR = 'TRANSACTION_HISTORY_ERROR',
  INVALID_RATE = 'INVALID_RATE',
  PRE_ORDER_PROCESSING_FAILED = 'PRE_ORDER_PROCESSING_FAILED',
  ORDER_PROCESSING_FAILED = 'ORDER_PROCESSING_FAILED',
}

export const errorMessage: Record<ErrorCode, ApiMessageLanguage> = {
  [ErrorCode.INVALID_ACCESS_TOKEN]: {
    vi: 'Access token không hợp lệ.',
    en: 'Invalid access token.',
  },
  [ErrorCode.INVALID_REFRESH_TOKEN]: {
    vi: 'Refresh token không hợp lệ.',
    en: 'Invalid refresh token.',
  },
  [ErrorCode.EMAIL_HAS_BEEN_USED]: {
    vi: 'Email đã được sử dụng.',
    en: 'Email has been used.',
  },
  [ErrorCode.EMAIL_NOT_EXISTED]: {
    vi: 'Email chưa được đăng ký.',
    en: 'Email not existed.',
  },
  [ErrorCode.INVALID_PASSWORD]: {
    vi: 'Mật khẩu không chính xác.',
    en: 'Invalid password.',
  },
  [ErrorCode.USER_NOT_FOUND]: {
    vi: 'Không tìm thấy khách hàng.',
    en: 'User not found.',
  },
  [ErrorCode.CODE_NOT_FOUND]: {
    vi: 'Không tìm thấy code.',
    en: 'Code not found.',
  },
  [ErrorCode.TWO_FA_UNVERIFIED]: {
    vi: 'Mã 2FA không hợp lệ.',
    en: 'Invalid 2FA code.',
  },
  [ErrorCode.UNAUTHORIZED]: {
    vi: 'Không được phép truy cập tài nguyên này.',
    en: 'Unauthorized.',
  },
  [ErrorCode.TOKEN_EXPIRED]: {
    vi: 'Token đã hết hạn.',
    en: 'Token has expired.',
  },
  [ErrorCode.USER_INACTIVE]: {
    vi: 'Tài khoản đã bị vô hiệu hóa.',
    en: 'Account has been disabled.',
  },
  [ErrorCode.WALLET_HAS_BEEN_REGISTER]: {
    vi: 'Địa chỉ ví đã được sử dụng.',
    en: 'Wallet address has been used.',
  },
  [ErrorCode.WALLET_NOT_FOUND]: {
    vi: 'Không tìm thấy ví.',
    en: 'Wallet not found.',
  },
  [ErrorCode.TRANSACTION_NOT_FOUND]: {
    vi: 'Không tìm thấy giao dịch.',
    en: 'Transaction not found.',
  },
  [ErrorCode.ASSET_ADDRESS_EXISTED]: {
    vi: 'Địa chỉ asset đã tồn tại.',
    en: 'Asset address existed.',
  },
  [ErrorCode.ASSET_NOT_FOUND]: {
    vi: 'Không tìm thấy asset.',
    en: 'Asset not found.',
  },
  [ErrorCode.INVALID_ASSET]: {
    vi: 'Asset không phù hợp.',
    en: 'Invalid asset.',
  },
  [ErrorCode.TRANSACTION_TX_EXISTED]: {
    vi: 'Địa chỉ giao dịch đã tồn tại.',
    en: 'Transaction tx existed.',
  },
  [ErrorCode.PERMISSION_DENIED]: {
    vi: 'Không có quyền truy cập tài nguyên này.',
    en: 'Permission denied.',
  },
  [ErrorCode.SETTING_NOT_FOUND]: {
    vi: 'Không tìm thấy setting.',
    en: 'Setting not found.',
  },
  [ErrorCode.POOL_NOT_FOUND]: {
    vi: 'Không tìm thấy staking pool.',
    en: 'Staking pool not found.',
  },
  [ErrorCode.TX_EXISTED]: {
    vi: 'Địa chỉ giao dịch đã tồn tại.',
    en: 'Tx existed.',
  },
  [ErrorCode.VOLUME_TIER_EXISTED]: {
    vi: 'Volume tier đẫ tồn tại.',
    en: 'Volume tier existed.',
  },
  [ErrorCode.VOLUME_SETTING_NOT_FOUND]: {
    vi: 'Không tìm thấy volume setting.',
    en: 'Volume setting not found.',
  },
  [ErrorCode.GET_BALANCE_ERROR]: {
    vi: 'Lấy số dư trong ví thất bại.',
    en: 'Get balance error.',
  },
  [ErrorCode.MASTER_WALLET_NOT_FOUND]: {
    vi: 'Không tìm thấy master wallet.',
    en: 'Master wallet not found.',
  },
  [ErrorCode.RESERVE_WALLET_NOT_FOUND]: {
    vi: 'Không tìm thấy reserve wallet.',
    en: 'Reserve wallet not found.',
  },
  [ErrorCode.INSUFFICIENT_BALANCE]: {
    vi: 'Không đủ số dư.',
    en: 'Insufficient balance.',
  },
  [ErrorCode.MASTER_WALLET_INSUFFICIENT_BALANCE]: {
    vi: 'Master wallet không đủ số dư.',
    en: 'Master wallet insufficient balance.',
  },
  [ErrorCode.RESERVE_WALLET_INSUFFICIENT_BALANCE]: {
    vi: 'Reserve wallet không đủ số dư.',
    en: 'Reserve wallet insufficient balance.',
  },
  [ErrorCode.USER_INFORMATION_HAS_NOT_BEEN_UPDATED_YET]: {
    vi: 'Thông tin khách hàng chưa được cập nhật đầy đủ.',
    en: 'User information has not been updated yet.',
  },
  [ErrorCode.USER_BALANCE_NOT_FOUND]: {
    vi: 'Không tìm thấy số dư của khách hàng.',
    en: 'User balance not found.',
  },
  [ErrorCode.SEND_TRANSACTION_ERROR]: {
    vi: 'Gửi giao dịch thất bại.',
    en: 'Send transaction error.',
  },
  [ErrorCode.CANNOT_TRANSFER_TO_ONESELF]: {
    vi: 'Không thể transfer cho chính mình.',
    en: 'Cannot transfer to oneself.',
  },
  [ErrorCode.RECEIVER_NOT_FOUND]: {
    vi: 'Không tìm thấy người nhận.',
    en: 'Receiver not found.',
  },
  [ErrorCode.DURATION_NOT_FOUND]: {
    vi: 'Không tìm thấy chu kỳ.',
    en: 'Duration not found.',
  },
  [ErrorCode.USER_DOES_NOT_HAVE_A_PASSWORD]: {
    vi: 'Khách hàng chưa tạo mật khẩu.',
    en: 'User does not have a password.',
  },
  [ErrorCode.USER_ALREADY_HAS_PASSWORD]: {
    vi: 'Tài khoản đã được cài đặt mật khẩu.',
    en: 'User already has password.',
  },
  [ErrorCode.MASTER_WALLET_EXISTED]: {
    vi: 'Master wallet đã tồn tại.',
    en: 'Master wallet existed.',
  },
  [ErrorCode.ADDRESS_EXISTED]: {
    vi: 'Địa chỉ đã tồn tại.',
    en: 'Address existed.',
  },
  [ErrorCode.UNSUPPORTED_NETWORK]: {
    vi: 'Mạng không được hỗ trợ.',
    en: 'Unsupported network.',
  },
  [ErrorCode.INVALID_DEPOSIT]: {
    vi: 'Invalid deposit.',
    en: 'Invalid deposit.',
  },
  [ErrorCode.TRANSACTION_FAILED]: {
    vi: 'Giao dịch thất bại.',
    en: 'Transaction failed.',
  },
  [ErrorCode.INVALID_ORDER_STATE]: {
    vi: 'Trạng thái đơn hàng không hợp lệ.',
    en: 'Invalid order state.',
  },
  [ErrorCode.ORDER_NOT_FOUND]: {
    vi: 'Không tìm thấy đơn hàng.',
    en: 'Order not found.',
  },
  [ErrorCode.ORDER_LIMIT_EXCEEDED]: {
    vi: 'Vượt quá giới hạn đơn hàng.',
    en: 'Order limit exceeded.',
  },
  [ErrorCode.RATE_LIMIT_EXCEEDED]: {
    vi: 'Vượt quá giới hạn tỷ lệ.',
    en: 'Rate limit exceeded.',
  },
  [ErrorCode.SECURITY_REQUIREMENTS_NOT_MET]: {
    vi: 'Yêu cầu bảo mật không được đáp ứng.',
    en: 'Security requirements not met.',
  },
  [ErrorCode.TRANSACTION_HISTORY_ERROR]: {
    vi: 'Lỗi khi lấy lịch sử giao dịch.',
    en: 'Error retrieving transaction history.',
  },
  [ErrorCode.INVALID_RATE]: {
    vi: 'Tỷ giá không hợp lệ.',
    en: 'Invalid rate.',
  },
  [ErrorCode.PRE_ORDER_PROCESSING_FAILED]: {
    vi: 'Xử lý đơn hàng trước thất bại.',
    en: 'Pre-order processing failed.',
  },
  [ErrorCode.ORDER_PROCESSING_FAILED]: {
    vi: 'Xử lý đơn hàng thất bại.',
    en: 'Order processing failed.',
  },
};
