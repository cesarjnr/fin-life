import { Test } from '@nestjs/testing';

import { AssetsService } from '../assets/assets.service';
import { BuysSellsService } from '../buysSells/buysSells.service';
import { DateHelper } from '../common/helpers/date.helper';
import { ProfitabilitiesService } from './profitabilities.service';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
import { SplitHistoricalEvent } from '../splitHistoricalEvents/splitHistoricalEvent.entity';
import { Asset } from '../assets/asset.entity';
import { BuySell, BuySellTypes } from '../buysSells/buySell.entity';
import { PaginationResponse } from '../common/dto/pagination';

describe('ProfitabilitiesService', () => {
  let mockDateHelper: jest.Mocked<DateHelper>;
  let mockBuysSellsService: jest.Mocked<BuysSellsService>;
  let mockAssetsService: jest.Mocked<AssetsService>;
  let profitabilitiesService: ProfitabilitiesService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: DateHelper,
          useValue: {
            incrementDays: jest.fn()
          }
        },
        {
          provide: BuysSellsService,
          useValue: {
            get: jest.fn(),
            getAdjustedBuySell: jest.fn()
          }
        },
        {
          provide: AssetsService,
          useValue: {
            find: jest.fn()
          }
        },
        ProfitabilitiesService
      ]
    }).compile();

    mockDateHelper = moduleRef.get<jest.Mocked<DateHelper>>(DateHelper);
    mockBuysSellsService = moduleRef.get<jest.Mocked<BuysSellsService>>(BuysSellsService);
    mockAssetsService = moduleRef.get<jest.Mocked<AssetsService>>(AssetsService);
    profitabilitiesService = moduleRef.get<ProfitabilitiesService>(ProfitabilitiesService);
  });

  describe('getPortfolioAssetProfitability', () => {
    it('should successfully return a profitability of 5% for 1 day and based on 1 buy', async () => {
      const mockAssetHistoricalPrices = [
        {
          closingPrice: 2,
          date: '2024-06-01'
        },
        {
          closingPrice: 2.1,
          date: '2024-06-02'
        }
      ] as AssetHistoricalPrice[];
      const mockSplitHistoricalEvents = [{}] as SplitHistoricalEvent[];
      const mockAsset = {
        assetHistoricalPrices: mockAssetHistoricalPrices,
        splitHistoricalEvents: mockSplitHistoricalEvents
      } as Asset;
      const mockBuysSells = [
        {
          date: '2024-06-01',
          price: 2,
          quantity: 10,
          type: BuySellTypes.Buy
        },
        {
          date: '2024-06-03',
          price: 2.1,
          quantity: 10,
          type: BuySellTypes.Buy
        }
      ] as BuySell[];
      const assetId = 1;
      const portfolioId = 1;

      mockAssetsService.find.mockResolvedValue(mockAsset);
      mockBuysSellsService.get.mockResolvedValue({ data: mockBuysSells } as PaginationResponse<BuySell>);
      mockBuysSellsService.getAdjustedBuySell
        .mockReturnValueOnce(mockBuysSells[0])
        .mockReturnValueOnce(mockBuysSells[1]);
      mockDateHelper.incrementDays.mockReturnValue(new Date('2024-06-02'));

      const result = await profitabilitiesService.getPortfolioAssetProfitability(assetId, portfolioId);

      expect(result).toStrictEqual({
        timestamps: [1717286400000], // 02/06/2024
        values: [5]
      });
    });

    it('should successfully return a profitability of 5% for 1 day and based on 2 buys', async () => {
      const mockAssetHistoricalPrices = [
        {
          closingPrice: 4.9,
          date: '2024-06-01'
        },
        {
          closingPrice: 5.25,
          date: '2024-06-02'
        }
      ] as AssetHistoricalPrice[];
      const mockSplitHistoricalEvents = [{}] as SplitHistoricalEvent[];
      const mockAsset = {
        assetHistoricalPrices: mockAssetHistoricalPrices,
        splitHistoricalEvents: mockSplitHistoricalEvents
      } as Asset;
      const mockBuysSells = [
        {
          date: '2024-06-01',
          price: 5,
          quantity: 10,
          type: BuySellTypes.Buy
        },
        {
          date: '2024-06-02',
          price: 5,
          quantity: 10,
          type: BuySellTypes.Buy
        }
      ] as BuySell[];
      const assetId = 1;
      const portfolioId = 1;

      mockAssetsService.find.mockResolvedValue(mockAsset);
      mockBuysSellsService.get.mockResolvedValue({ data: mockBuysSells } as PaginationResponse<BuySell>);
      mockBuysSellsService.getAdjustedBuySell
        .mockReturnValueOnce(mockBuysSells[0])
        .mockReturnValueOnce(mockBuysSells[1]);
      mockDateHelper.incrementDays.mockReturnValue(new Date('2024-06-02'));

      const result = await profitabilitiesService.getPortfolioAssetProfitability(assetId, portfolioId);

      expect(result).toStrictEqual({
        timestamps: [1717286400000], // 02/06/2024
        values: [5]
      });
    });

    it('should successfully return a profitability of 5% for 1 day and based on 2 buys and 1 sale', async () => {
      const mockAssetHistoricalPrices = [
        {
          closingPrice: 4.9,
          date: '2024-06-01'
        },
        {
          closingPrice: 5,
          date: '2024-06-02'
        }
      ] as AssetHistoricalPrice[];
      const mockSplitHistoricalEvents = [{}] as SplitHistoricalEvent[];
      const mockAsset = {
        assetHistoricalPrices: mockAssetHistoricalPrices,
        splitHistoricalEvents: mockSplitHistoricalEvents
      } as Asset;
      const mockBuysSells = [
        {
          date: '2024-06-01',
          price: 5,
          quantity: 10,
          type: BuySellTypes.Buy
        },
        {
          date: '2024-06-02',
          price: 6,
          quantity: 5,
          type: BuySellTypes.Sell
        },
        {
          date: '2024-06-02',
          price: 5,
          quantity: 10,
          type: BuySellTypes.Buy
        }
      ] as BuySell[];
      const assetId = 1;
      const portfolioId = 1;

      mockAssetsService.find.mockResolvedValue(mockAsset);
      mockBuysSellsService.get.mockResolvedValue({ data: mockBuysSells } as PaginationResponse<BuySell>);
      mockBuysSellsService.getAdjustedBuySell
        .mockReturnValueOnce(mockBuysSells[0])
        .mockReturnValueOnce(mockBuysSells[1])
        .mockReturnValueOnce(mockBuysSells[2]);
      mockDateHelper.incrementDays.mockReturnValue(new Date('2024-06-02'));

      const result = await profitabilitiesService.getPortfolioAssetProfitability(assetId, portfolioId);

      expect(result).toStrictEqual({
        timestamps: [1717286400000], // 02/06/2024
        values: [5]
      });
    });

    it('should successfully return profitabilities of 5% and 6% for 2 days respectively and based on 1 buy', async () => {
      const mockAssetHistoricalPrices = [
        {
          closingPrice: 2,
          date: '2024-06-01'
        },
        {
          closingPrice: 2.1,
          date: '2024-06-02'
        },
        {
          closingPrice: 2.12,
          date: '2024-06-03'
        }
      ] as AssetHistoricalPrice[];
      const mockSplitHistoricalEvents = [{}] as SplitHistoricalEvent[];
      const mockAsset = {
        assetHistoricalPrices: mockAssetHistoricalPrices,
        splitHistoricalEvents: mockSplitHistoricalEvents
      } as Asset;
      const mockBuysSells = [
        {
          date: '2024-06-01',
          price: 2,
          quantity: 10,
          type: BuySellTypes.Buy
        },
        {
          date: '2024-06-04',
          price: 2.1,
          quantity: 10,
          type: BuySellTypes.Buy
        }
      ] as BuySell[];
      const assetId = 1;
      const portfolioId = 1;

      mockAssetsService.find.mockResolvedValue(mockAsset);
      mockBuysSellsService.get.mockResolvedValue({ data: mockBuysSells } as PaginationResponse<BuySell>);
      mockBuysSellsService.getAdjustedBuySell
        .mockReturnValueOnce(mockBuysSells[0])
        .mockReturnValueOnce(mockBuysSells[1]);
      mockDateHelper.incrementDays.mockReturnValue(new Date('2024-06-02'));

      const result = await profitabilitiesService.getPortfolioAssetProfitability(assetId, portfolioId);

      expect(result).toStrictEqual({
        timestamps: [1717286400000, 1717372800000], // 02/06/2024, 03/06/2024
        values: [5, 6]
      });
    });

    it('should successfully return profitabilities of 5% and 6% for 2 days respectively and based on 2 buys', async () => {
      const mockAssetHistoricalPrices = [
        {
          closingPrice: 2,
          date: '2024-06-01'
        },
        {
          closingPrice: 2.1,
          date: '2024-06-02'
        },
        {
          closingPrice: 2.12,
          date: '2024-06-03'
        }
      ] as AssetHistoricalPrice[];
      const mockSplitHistoricalEvents = [{}] as SplitHistoricalEvent[];
      const mockAsset = {
        assetHistoricalPrices: mockAssetHistoricalPrices,
        splitHistoricalEvents: mockSplitHistoricalEvents
      } as Asset;
      const mockBuysSells = [
        {
          date: '2024-06-01',
          price: 2,
          quantity: 10,
          type: BuySellTypes.Buy
        },
        {
          date: '2024-06-02',
          price: 2,
          quantity: 10,
          type: BuySellTypes.Buy
        }
      ] as BuySell[];
      const assetId = 1;
      const portfolioId = 1;

      mockAssetsService.find.mockResolvedValue(mockAsset);
      mockBuysSellsService.get.mockResolvedValue({ data: mockBuysSells } as PaginationResponse<BuySell>);
      mockBuysSellsService.getAdjustedBuySell
        .mockReturnValueOnce(mockBuysSells[0])
        .mockReturnValueOnce(mockBuysSells[1]);
      mockDateHelper.incrementDays.mockReturnValue(new Date('2024-06-02'));

      const result = await profitabilitiesService.getPortfolioAssetProfitability(assetId, portfolioId);

      expect(result).toStrictEqual({
        timestamps: [1717286400000, 1717372800000], // 02/06/2024, 03/06/2024
        values: [5, 6]
      });
    });

    it('should successfully return a profitability of 5% and 6% for 2 days and based on 2 buys and 1 sale', async () => {
      const mockAssetHistoricalPrices = [
        {
          closingPrice: 4.9,
          date: '2024-06-01'
        },
        {
          closingPrice: 2,
          date: '2024-06-02'
        },
        {
          closingPrice: 2.025,
          date: '2024-06-03'
        }
      ] as AssetHistoricalPrice[];
      const mockSplitHistoricalEvents = [{}] as SplitHistoricalEvent[];
      const mockAsset = {
        assetHistoricalPrices: mockAssetHistoricalPrices,
        splitHistoricalEvents: mockSplitHistoricalEvents
      } as Asset;
      const mockBuysSells = [
        {
          date: '2024-06-01',
          price: 2,
          quantity: 15,
          type: BuySellTypes.Buy
        },
        {
          date: '2024-06-02',
          price: 2.5,
          quantity: 5,
          type: BuySellTypes.Sell
        },
        {
          date: '2024-06-02',
          price: 2,
          quantity: 10,
          type: BuySellTypes.Buy
        }
      ] as BuySell[];
      const assetId = 1;
      const portfolioId = 1;

      mockAssetsService.find.mockResolvedValue(mockAsset);
      mockBuysSellsService.get.mockResolvedValue({ data: mockBuysSells } as PaginationResponse<BuySell>);
      mockBuysSellsService.getAdjustedBuySell
        .mockReturnValueOnce(mockBuysSells[0])
        .mockReturnValueOnce(mockBuysSells[1])
        .mockReturnValueOnce(mockBuysSells[2]);
      mockDateHelper.incrementDays.mockReturnValue(new Date('2024-06-02'));

      const result = await profitabilitiesService.getPortfolioAssetProfitability(assetId, portfolioId);

      expect(result).toStrictEqual({
        timestamps: [1717286400000, 1717372800000], // 02/06/2024, 03/06/2024
        values: [5, 6]
      });
    });
  });
});
