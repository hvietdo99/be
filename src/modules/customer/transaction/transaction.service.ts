import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import {
  Transaction,
  TransactionDocument,
  TransactionStatus,
  TransactionType,
} from '@modules/database/schemas/transaction.schema';
import mongoose, { ClientSession, FilterQuery, Model } from 'mongoose';
import { CreateTransactionDto } from '@modules/customer/transaction/dto/create-transaction.dto';
import { getErrorMessage } from '@common/utils/utils';
import { ErrorCode } from '@common/constants/error.constants';
import {
  FindAndCountResponse,
  Lang,
  PaginatedResponse,
} from '@common/classes/response.dto';
import {
  GetAllTransactionDto,
  GetAllTransactionResponseDto,
} from '@modules/customer/transaction/dto/get-all-transaction.dto';
import { FindAndCountDto } from '@common/classes/request.dto';
import { GetTransactionDetailResponseDto } from '@modules/customer/transaction/dto/get-transaction-detail.dto';
import { TransferDto } from './dto/transfer-dto.dto';
import {
  Network,
  User,
  UserDocument,
} from '@src/modules/database/schemas/user.schema';
import { CheckAddressDto } from './dto/check-address.dto';
import {
  estimateFee,
  getBalance,
  getLastBlock,
  getTokenBalance,
  getTokenTxs,
  sendNativeCoin,
  sendToken,
  contractConfig,
  getTokenTxsTron,
  removeHexPrefix,
} from '@common/utils/blockchain';
import { Block, BlockDocument } from '@src/modules/database/schemas/block.schema';
import { UserService } from '@src/modules/admin/user/user.service';
import { Config, ConfigDocument } from '@src/modules/database/schemas/config.schema';
import { sub } from '@common/utils/blockchain/math';
import {
  MasterWallet,
  MasterWalletDocument,
} from '@modules/database/schemas/master-wallet.schema';
import { WithdrawResponseDto } from '@modules/customer/transaction/dto/create-order.dto';
import { get2FASecret } from '@src/modules/auth/helpers/twoFA.helper';
import speakeasy from 'speakeasy';
import { AuthService } from '@src/modules/auth/auth.service';
import { TronWeb } from 'tronweb';
import moment from 'moment';
import { FiatDepositDto } from './dto/fiat-deposit.dto';

@Injectable()
export class TransactionService {
  private logger = new Logger('TransactionService');
  private userAddressMap: Map<string, string> = new Map();
  private ttl = 60 * 1000; // 1 minutes
  private lastCacheTime = 0;
  constructor(
    @InjectConnection()
    private readonly connection: mongoose.Connection,

    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(MasterWallet.name)
    private readonly masterWalletModel: Model<MasterWalletDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Block.name)
    private readonly blockModel: Model<BlockDocument>,
    @InjectModel(Config.name)
    private readonly configModel: Model<ConfigDocument>,

    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async findAndCount(
    dto: FindAndCountDto<TransactionDocument>,
  ): Promise<FindAndCountResponse<TransactionDocument>> {
    const { condition, limit, offset, sort } = dto;
    const data = await this.transactionModel
      .find(condition)
      .limit(limit)
      .skip(offset)
      .sort(sort)
      .exec();
    const total = await this.transactionModel.countDocuments(condition).exec();

    return new FindAndCountResponse<TransactionDocument>(data, total);
  }

  async getAll(
    userId: string,
    query: GetAllTransactionDto,
  ): Promise<PaginatedResponse<GetAllTransactionResponseDto>> {
    const masterWallet = await this.userService.findMaster();
    const reserveWallet = await this.userService.findReserveWallet();
    const address = await this.userService.getWalletAddressByUserId(userId);

    const condition: FilterQuery<TransactionDocument> = {
      $nor: [
        {
          type: TransactionType.DEPOSIT,
          toAddress: masterWallet.addresses[Network.BEP20],
        },
        {
          type: TransactionType.DEPOSIT,
          toAddress: masterWallet.addresses[Network.ERC20],
        },
        {
          type: TransactionType.DEPOSIT,
          toAddress: masterWallet.addresses[Network.TRC20],
        },
      ],
      $or: [{ fromAddress: address }, { toAddress: address }],
      type: {
        $in: [
          TransactionType.DEPOSIT,
          TransactionType.WITHDRAW,
          TransactionType.TRANSFER,
        ],
      },
      deletedAt: null,
    };

    if (query.search) {
      condition.tx = query.search;
    }

    if (query.status) {
      condition.status = query.status;
    }

    if (query.type) {
      condition.type = {
        $in: query.type,
      };
    }

    if (query.fromDate && query.toDate) {
      condition.createdAt = { $gte: query.fromDate, $lte: query.toDate };
    }

    const sort = { createdAt: query.order };

    const { data, total } = await this.findAndCount({
      condition,
      limit: query.limit,
      offset: query.offset,
      sort,
    });

    return new PaginatedResponse(
      data.map((item) => new GetAllTransactionResponseDto(item)),
      {
        page: query.page,
        limit: query.limit,
        total,
      },
    );
  }

  async getOne(id: string): Promise<GetTransactionDetailResponseDto> {
    const data = await this.transactionModel.findById(id).exec();
    return new GetTransactionDetailResponseDto(data);
  }

  async create(lang: Lang, data: CreateTransactionDto): Promise<boolean> {
    const existedTx = await this.transactionModel.findOne({ tx: data.tx });
    if (existedTx) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.TRANSACTION_TX_EXISTED, lang),
      );
    }

    await this.transactionModel.create({
      tx: data.tx,
      fromAddress: data.fromAddress,
      toAddress: data.toAddress,
      amount: data.amount,
      price: data.price,
      type: data.type,
      paymentMethod: data.paymentMethod,
      network: data.network,
    });

    return true;
  }

  async fiatDeposit(
    lang: Lang,
    dto: FiatDepositDto,
    userId: string,
  ): Promise<boolean> {
    // Check if the deposit is valid using the bank API
    const isValidDeposit = true;
    if (!isValidDeposit) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.INVALID_DEPOSIT, lang),
      );
    }

    let session = null;
    try {
      session = await this.connection.startSession();
      session.startTransaction();

      // Increase the user's fiat balance
      const user = await this.userModel
        .findByIdAndUpdate(
          userId,
          { $inc: { fiat: dto.amount } },
          { new: true, session },
        )
        .lean()
        .exec();

      if (!user) {
        throw new BadRequestException(
          getErrorMessage(ErrorCode.USER_NOT_FOUND, lang),
        );
      }

      // Proceed to create a transaction record for the fiat deposit
      await this.transactionModel.create(
        [
          {
            tx: crypto.randomUUID(),
            fromAddress: 'Bank Transfer', // Placeholder for bank transfer
            toAddress: userId,
            amount: dto.amount,
            type: TransactionType.FIAT_DEPOSIT,
            status: TransactionStatus.SUCCESS,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      return true;
    } catch (error) {
      if (session) await session.abortTransaction();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    } finally {
      if (session) await session.endSession();
    }
  }

  async transfer(lang: Lang, dto: TransferDto, userId: string): Promise<void> {
    const { to, amount, network } = dto;
    let session = null;
    try {
      session = await this.connection.startSession();
      session.startTransaction();

      const user = await this.userModel
        .findByIdAndUpdate(
          userId,
          { $inc: { [`balance.${network}`]: -amount } },
          { new: true, session },
        )
        .lean()
        .exec();

      if (!user) {
        throw new BadRequestException(
          getErrorMessage(ErrorCode.USER_NOT_FOUND, lang),
        );
      }

      if (user.addresses[network] === to)
        throw new BadRequestException(
          getErrorMessage(ErrorCode.CANNOT_TRANSFER_TO_ONESELF, lang),
        );

      if (!user.balance[dto.token] || user.balance[dto.token] < 0) {
        throw new BadRequestException(
          getErrorMessage(ErrorCode.INSUFFICIENT_BALANCE, lang),
        );
      }

      const receiver = await this.userModel
        .findOneAndUpdate(
          { address: to },
          { $inc: { [`balance.${network}`]: amount } },
          { new: true, session },
        )
        .lean()
        .exec();

      if (!receiver) {
        throw new BadRequestException(
          getErrorMessage(ErrorCode.RECEIVER_NOT_FOUND, lang),
        );
      }

      await this.transactionModel.create(
        [
          {
            tx: crypto.randomUUID(),
            type: TransactionType.TRANSFER,
            fromAddress: user.addresses[network],
            toAddress: receiver.addresses[network],
            amount,
            status: TransactionStatus.SUCCESS,
          },
        ],
        { session },
      );

      await session.commitTransaction();
    } catch (error) {
      if (session) await session.abortTransaction();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    } finally {
      if (session) await session.endSession();
    }
  }

  async checkAddress(dto: CheckAddressDto): Promise<boolean> {
    const { currency, address } = dto;
    try {
      const formData = new FormData();
      formData.append('address', address);
      formData.append('currency', currency);
      const response = await fetch('https://fixedfloat.com/ajax/exchCheckAddress', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      return !!data?.data?.valid;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async scheduleScanDepositTxs() {
    try {
      const BLOCKS = 10;

      // Handle each network in parallel
      await Promise.all(
        Object.values(Network).map(async (network) => {
          const block = await this.blockModel.findOne({ network }).lean().exec();
          let startBlock: number;
          let endBlock: number;

          if (network === Network.TRC20) {
            startBlock = Math.min(
              block?.lastScanBlock ?? 0,
              moment().subtract(20, 'minutes').valueOf(),
            );
            endBlock = moment().valueOf();
          } else {
            let lastBlock = await getLastBlock(network);

            startBlock = Math.min(block?.lastScanBlock ?? 0, lastBlock - 32);
            endBlock = Math.min(startBlock + BLOCKS, lastBlock);
          }

          if (startBlock < endBlock) {
            return await this.depositWeb3(startBlock, endBlock, network);
          }
        }),
      );

      return;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  private async initCacheIfNeed() {
    // Todo: use redis cache
    const isCacheExpired = Date.now() - this.lastCacheTime > this.ttl;
    if (this.userAddressMap.size > 0 && !isCacheExpired) {
      return;
    }

    const _userAddresses = await this.userModel.find().lean().exec();
    this.userAddressMap = _userAddresses.reduce((acc, cur) => {
      if (cur.addresses && Object.values(cur.addresses).some((address) => address)) {
        const firstAddress = Object.values(cur.addresses).find((address) => address);
        acc.set(firstAddress, cur.id);
      }
      return acc;
    }, new Map<string, string>());
    this.lastCacheTime = Date.now();
  }

  async depositWeb3(fromBlock: number, toBlock: number, network: Network) {
    let session: ClientSession;

    try {
      await this.initCacheIfNeed();

      const { address, abi } = contractConfig[network];
      const txs =
        network === Network.TRC20
          ? await getTokenTxsTron(address, fromBlock, toBlock)
          : await getTokenTxs(network, address, abi, fromBlock, toBlock);

      session = await this.connection.startSession();
      session.startTransaction();
      for (const tx of txs) {
        // check receiver is in our system across all networks
        let user = await this.userModel
          .findOne({
            $or: [
              { 'addresses.BEP20': tx.to },
              { 'addresses.ERC20': tx.to },
              { 'addresses.TRC20': tx.to },
            ],
          })
          .lean()
          .exec();

        if (user) {
          const isExisted = await this.transactionModel.findOne({
            tx: tx.hash,
          });
          if (isExisted) {
            continue;
          }

          await this.userModel.findByIdAndUpdate(
            user._id,
            {
              $inc: { [`balance.${network}`]: tx.value },
            },
            {
              session,
              new: true,
            },
          );
          await this.transactionModel.insertMany(
            [
              {
                tx: tx.hash,
                type: TransactionType.DEPOSIT,
                fromAddress: tx.from,
                toAddress: tx.to,
                amount: tx.value,
                status: TransactionStatus.SUCCESS,
                paymentMethod: contractConfig[network].address,
                network,
              },
            ],
            { session },
          );
        } else {
          const wallet = await this.masterWalletModel
            .findOne({
              $or: [
                { 'addresses.BEP20': tx.to },
                { 'addresses.ERC20': tx.to },
                { 'addresses.TRC20': tx.to },
              ],
            })
            .lean()
            .exec();

          if (wallet) {
            const existed = await this.transactionModel.findOne({
              tx: tx.hash,
            });
            if (existed) {
              continue;
            }

            await this.masterWalletModel.findByIdAndUpdate(
              wallet._id,
              {
                $inc: { [`balance.${network}`]: tx.value },
              },
              {
                session,
                new: true,
              },
            );
            await this.transactionModel.insertMany(
              [
                {
                  tx: tx.hash,
                  type: TransactionType.DEPOSIT,
                  fromAddress: tx.from,
                  toAddress: tx.to,
                  amount: tx.value,
                  status: TransactionStatus.SUCCESS,
                  paymentMethod: contractConfig[network].address,
                  network,
                },
              ],
              { session },
            );
          }
        }
      }

      await this.blockModel.findOneAndUpdate(
        { network },
        { lastScanBlock: toBlock },
        { upsert: true, session },
      );
      await session.commitTransaction();
    } catch (error) {
      if (session) await session.abortTransaction();
      console.error('@@== Err: ', error.message);
      // throw new HttpException(error, HttpStatus.BAD_REQUEST);
    } finally {
      if (session) await session.endSession();
    }
  }

  async withdrawWeb3(
    lang: Lang,
    userId: string,
    network: Network,
    amount: number,
    to: string,
    code?: string,
  ) {
    let session: ClientSession;
    try {
      // get master wallet
      const masterWallet = await this.userService.findMaster();
      const userBalance = await this.userModel.findById(userId).exec();

      if (!masterWallet) {
        throw new BadRequestException(
          getErrorMessage(ErrorCode.MASTER_WALLET_NOT_FOUND, lang),
        );
      }
      if (!userBalance) {
        throw new BadRequestException(
          getErrorMessage(ErrorCode.USER_NOT_FOUND, lang),
        );
      }

      if (userBalance.twoFA) {
        if (!code) {
          throw new BadRequestException(
            getErrorMessage(ErrorCode.CODE_NOT_FOUND, lang),
          );
        }

        const secret = get2FASecret(userId);
        const isVerified = speakeasy.totp.verify({
          secret,
          encoding: 'base32',
          token: code,
          window: 1,
        });
        if (!isVerified) {
          throw new BadRequestException(
            getErrorMessage(ErrorCode.TWO_FA_UNVERIFIED, lang),
          );
        }
      }

      if (!contractConfig[network]) {
        throw new BadRequestException(
          getErrorMessage(ErrorCode.UNSUPPORTED_NETWORK, lang),
        );
      }

      const { address: tokenAddress, abi: tokenABI } = contractConfig[network];

      if (!userBalance.balance.has(network)) {
        throw new BadRequestException(
          getErrorMessage(ErrorCode.USER_BALANCE_NOT_FOUND, lang),
        );
      }

      if (
        !userBalance.name ||
        !userBalance.email ||
        !userBalance.addresses[network]
      ) {
        throw new BadRequestException(
          getErrorMessage(ErrorCode.USER_INFORMATION_HAS_NOT_BEEN_UPDATED_YET, lang),
        );
      }

      // check balance
      const balance = await getTokenBalance(
        masterWallet.addresses[network],
        tokenAddress,
        tokenABI,
        network,
      ).catch((err) => {
        console.log('@@== Error: ', err);
        throw new BadRequestException(
          getErrorMessage(ErrorCode.GET_BALANCE_ERROR, lang),
        );
      });

      if (balance < amount) {
        throw new BadRequestException(
          getErrorMessage(ErrorCode.MASTER_WALLET_INSUFFICIENT_BALANCE, lang),
        );
      }

      // check user balance
      if (userBalance.balance.get(network) < amount) {
        throw new BadRequestException(
          getErrorMessage(ErrorCode.INSUFFICIENT_BALANCE, lang),
        );
      }

      const config = await this.configModel.findOne({}, {}, { upsert: true }).exec();
      const fee = config.withdrawFee;
      const feeAmount = (amount * +fee) / 100;
      const remaining = amount - feeAmount;

      // send tx
      const gasLimit = network === Network.ERC20 ? 100000 : 80000; // Adjust gas limit based on network
      const hash = await sendToken(
        network,
        masterWallet.addresses[network],
        this.authService.decryptPrivateKey(masterWallet.prvKey),
        tokenAddress,
        tokenABI,
        to,
        remaining,
        gasLimit,
      ).catch((err) => {
        console.log('@@== Error: ', err);
        throw new BadRequestException(
          getErrorMessage(ErrorCode.SEND_TRANSACTION_ERROR, lang),
        );
      });

      session = await this.connection.startSession();
      session.startTransaction();

      await this.userModel.findByIdAndUpdate(userBalance._id, {
        $inc: { [`balance.${network}`]: -amount },
      });

      await this.masterWalletModel.findByIdAndUpdate(masterWallet._id, {
        $inc: { [`balance.${network}`]: -remaining },
      });

      const transaction = await this.transactionModel.create(
        [
          {
            fromAddress: userBalance.addresses[network],
            tx: hash,
            amount,
            toAddress: to,
            type: TransactionType.WITHDRAW,
            status: TransactionStatus.SUCCESS,
            network,
            paymentMethod: tokenAddress,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      return new WithdrawResponseDto(transaction[0]);
    } catch (error) {
      console.error({ error });
      if (session) await session.abortTransaction();
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    } finally {
      if (session) await session.endSession();
    }
  }

  async collectToMasterWallet() {
    const minCollect = 10;
    let session: ClientSession;

    try {
      // Process each network in parallel
      await Promise.all(
        Object.values(Network).map(async (network) => {
          const { address: tokenAddress, abi: tokenABI } = contractConfig[network];

          // get all address where balance >= minCollect for this network
          const users = await this.userModel
            .find({
              [`balance.${network}`]: {
                $gte: minCollect,
              },
            })
            .exec();

          // get master wallet
          const masterWallet = await this.userService.findMaster();
          if (!masterWallet) {
            this.logger.error(
              getErrorMessage(ErrorCode.MASTER_WALLET_NOT_FOUND, Lang.EN),
            );
            return;
          }

          const gasLimit = network === Network.ERC20 ? 2100000 : 2000000;
          const collectTxInputs = [];

          for (const user of users) {
            if (!user.addresses[network]) {
              continue;
            }

            const balance = await getTokenBalance(
              user.addresses[network],
              tokenAddress,
              tokenABI,
              network,
            ).catch((err) => {
              this.logger.error(err);
              return 0;
            });

            if (balance < minCollect) {
              this.logger.debug(
                `[${user.addresses[network]}] balance: ${balance} < minCollect: ${minCollect}`,
              );
              continue;
            }

            // Check native token balance for fee
            const feeAmount = await getBalance(user.addresses[network], network);
            let fee: number;

            if (network === Network.TRC20) {
              // Calculate precise fee based on current network conditions
              const estimatedEnergy = 14_000; // Base energy cost for TRC20 transfer
              const energyFee = 420; // Current energy price in SUN (1 TRX = 1,000,000 SUN)
              fee = (estimatedEnergy * energyFee + 100_000) / 1_000_000; // Add 0.1 TRX buffer for bandwidth
            } else {
              fee = await estimateFee(gasLimit, network);
            }

            if (feeAmount < fee) {
              this.logger.debug(
                `[${user.addresses[network]}] feeAmount: ${feeAmount} < fee: ${fee}, send fee from master wallet`,
              );

              const payerAmount = await getBalance(
                masterWallet.addresses[network],
                network,
              );
              if (payerAmount < fee) {
                this.logger.error(
                  getErrorMessage(
                    ErrorCode.MASTER_WALLET_INSUFFICIENT_BALANCE,
                    Lang.EN,
                  ),
                );
                continue;
              }

              // Send native token for gas fee
              await sendNativeCoin(
                network,
                masterWallet.addresses[network],
                this.authService.decryptPrivateKey(masterWallet.prvKey),
                user.addresses[network],
                sub(fee, feeAmount).toString(),
                undefined,
                true, // waitSendSuccess
              );
            }

            const txhash = await sendToken(
              network,
              user.addresses[network],
              this.authService.decryptPrivateKey(user.prvKey),
              tokenAddress,
              tokenABI,
              masterWallet.addresses[network],
              balance,
              gasLimit,
            );

            // Increase master wallet balance
            await this.masterWalletModel.findByIdAndUpdate(masterWallet._id, {
              $inc: { [`balance.${network}`]: balance },
            });

            collectTxInputs.push({
              amount: balance,
              tx: txhash,
              status: TransactionStatus.SUCCESS,
              type: TransactionType.DEPOSIT,
              toAddress: masterWallet.addresses[network],
              fromAddress: user.addresses[network],
              paymentMethod: tokenAddress,
              network,
            });
          }

          // Create transactions in a session
          if (collectTxInputs.length !== 0) {
            session = await this.connection.startSession();
            session.startTransaction();
            await this.transactionModel.create(collectTxInputs, { session });
            await session.commitTransaction();
          }
        }),
      );

      return;
    } catch (error) {
      if (session) await session.abortTransaction();
      console.error({ error });
      throw new BadRequestException(error);
    } finally {
      if (session) await session.endSession();
    }
  }
}
