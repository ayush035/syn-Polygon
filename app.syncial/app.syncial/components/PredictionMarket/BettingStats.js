import { Trophy, TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

const BettingStats = ({ stats }) => {
  const { activeBets, wonBets, lostBets, totalPnL, totalWagered, totalWon } = stats;

  const winRate = wonBets.length + lostBets.length > 0
    ? ((wonBets.length / (wonBets.length + lostBets.length)) * 100).toFixed(1)
    : 0;

  const roi = totalWagered > 0
    ? ((totalPnL / totalWagered) * 100).toFixed(1)
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {/* Active Bets */}
      <div className="bg-[#16030d] outline outline-2 outline-[#39071f] rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Active Bets</p>
            <p className="text-2xl font-bold text-[#ED3968]">{activeBets.length}</p>
          </div>
          <Activity className="h-8 w-8 text-pink-200" />
        </div>
      </div>

      {/* Won Bets */}
      <div className="bg-[#16030d] outline outline-2 outline-[#39071f] rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Bets Won</p>
            <p className="text-2xl font-bold text-green-400">{wonBets.length}</p>
          </div>
          <Trophy className="h-8 w-8 text-green-400" />
        </div>
      </div>

      {/* Lost Bets */}
      <div className="bg-[#16030d] outline outline-2 outline-[#39071f] rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Bets Lost</p>
            <p className="text-2xl font-bold text-red-400">{lostBets.length}</p>
          </div>
          <TrendingDown className="h-8 w-8 text-red-400" />
        </div>
      </div>

      {/* Win Rate */}
      <div className="bg-[#16030d] outline outline-2 outline-[#39071f] rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Win Rate</p>
            <p className="text-2xl font-bold text-white">{winRate}%</p>
          </div>
          <TrendingUp className="h-8 w-8 text-pink-200" />
        </div>
      </div>

      {/* Total PnL */}
      <div className="bg-[#16030d] outline outline-2 outline-[#39071f] rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Total P&L</p>
            <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(4)} ETH
            </p>
          </div>
          <DollarSign className={`h-8 w-8 ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`} />
        </div>
      </div>

      {/* ROI */}
      <div className="bg-[#16030d] outline outline-2 outline-[#39071f] rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">ROI</p>
            <p className={`text-2xl font-bold ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {roi >= 0 ? '+' : ''}{roi}%
            </p>
          </div>
          <TrendingUp className={`h-8 w-8 ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`} />
        </div>
      </div>
    </div>
  );
};

export default BettingStats;