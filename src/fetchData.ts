import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://mcp.matriks.ai/claude';

interface ApiGainerLoser {
  symbol: string;
  changePercent: number;
  volume: number;
}

interface ApiVolumeLeader {
  symbol: string;
  volume: number;
}

interface MarketOverviewApiResponse {
  gainers: { list: ApiGainerLoser[] };
  losers: { list: ApiGainerLoser[] };
  marketBreadth: { today: { gainers: number; losers: number } };
  volumeLeaders: { list: ApiVolumeLeader[]; totalMarketVolume: number };
}

interface MarketPriceApiResponse {
  data: { price: number; changePercent: number };
}

interface MarketData {
  date: string;
  bist100: { price: number; changePercent: number };
  breadth: { gainers: number; losers: number };
  totalVolume: string;
  gainers: { symbol: string; changePercent: number }[];
  losers: { symbol: string; changePercent: number }[];
  volumeLeaders: { symbol: string; volume: string }[];
}

async function callApi<T>(
  endpoint: string,
  params: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`${endpoint} → HTTP ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

function formatVolume(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} Milyar TL`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} Milyon TL`;
  return `${n.toFixed(0)} TL`;
}

function formatDate(d: Date): string {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

async function main(): Promise<void> {
  console.log('Fetching BIST market data from Matriks AI...');

  const [priceRes, overviewRes] = await Promise.all([
    callApi<MarketPriceApiResponse>('/marketprice', {
      action: 'price',
      symbol: 'XU100',
      includeDetails: true,
    }),
    callApi<MarketOverviewApiResponse>('/marketoverview', {
      index: 'XU100',
      top: 5,
      includeGainers: true,
      includeLosers: true,
      includeVolume: true,
      includeMarketBreadth: true,
      includeSectors: false,
    }),
  ]);

  const marketData: MarketData = {
    date: formatDate(new Date()),
    bist100: {
      price: Math.round(priceRes.data.price * 100) / 100,
      changePercent: Math.round(priceRes.data.changePercent * 100) / 100,
    },
    breadth: {
      gainers: overviewRes.marketBreadth.today.gainers,
      losers: overviewRes.marketBreadth.today.losers,
    },
    totalVolume: formatVolume(overviewRes.volumeLeaders.totalMarketVolume),
    gainers: overviewRes.gainers.list.slice(0, 5).map((g) => ({
      symbol: g.symbol,
      changePercent: g.changePercent,
    })),
    losers: overviewRes.losers.list.slice(0, 5).map((l) => ({
      symbol: l.symbol,
      changePercent: l.changePercent,
    })),
    volumeLeaders: overviewRes.volumeLeaders.list.slice(0, 5).map((v) => ({
      symbol: v.symbol,
      volume: formatVolume(v.volume),
    })),
  };

  const outDir = path.join(__dirname, 'data');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'marketData.json');
  fs.writeFileSync(outPath, JSON.stringify(marketData, null, 2), 'utf-8');

  console.log(`Saved  → ${outPath}`);
  console.log(
    `BIST 100: ${marketData.bist100.price.toFixed(2)} ` +
    `(${marketData.bist100.changePercent > 0 ? '+' : ''}${marketData.bist100.changePercent.toFixed(2)}%)`,
  );
  console.log(
    `Breadth : ${marketData.breadth.gainers} yükselen / ${marketData.breadth.losers} düşen`,
  );
  console.log(`Volume  : ${marketData.totalVolume}`);
}

main().catch((err: unknown) => {
  console.error('Failed to fetch market data:', err);
  process.exit(1);
});
