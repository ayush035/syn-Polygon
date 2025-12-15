import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const BetHistory = ({ stats }) => {
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'won', 'lost'
  const [expandedBets, setExpandedBets] = useState(new Set());

  const toggleExpand = (pollId) => {
    const newExpanded = new Set(expandedBets);
    if (newExpanded.has(pollId)) {
      newExpanded.delete(pollId);
    } else {
      newExpanded.add(pollId);
    }
    setExpandedBets(newExpanded);
  };

  const renderBets = (bets, type) => {
    if (bets.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          <p>No {type} bets yet</p>
        </div>
      );
    }

    return bets.map((bet) => {
      const isExpanded = expandedBets.has(bet.pollId);
      const isPastEnd = Date.now() > bet.endTime;

      return (
        <div
          key={bet.pollId}
          className="bg-[#16030d] outline outline-2 outline-[#39071f] rounded-lg p-4 mb-3"
        >
          {/* Bet Header */}
          <div
            className="flex justify-between items-start cursor-pointer"
            onClick={() => toggleExpand(bet.pollId)}
          >
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-1">{bet.question}</h4>
              <div className="flex gap-4 text-sm">
                {bet.yesBet > 0 && (
                  <span className="text-green-400">YES: {bet.yesBet.toFixed(4)} ETH</span>
                )}
                {bet.noBet > 0 && (
                  <span className="text-red-400">NO: {bet.noBet.toFixed(4)} ETH</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {type === 'won' && (
                <span className="text-green-400 font-bold">
                  +{bet.profit.toFixed(4)} ETH
                </span>
              )}
              {type === 'lost' && (
                <span className="text-red-400 font-bold">
                  -{bet.loss.toFixed(4)} ETH
                </span>
              )}
              {type === 'active' && (
                <span className={`text-sm px-2 py-1 rounded ${isPastEnd ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                  {isPastEnd ? 'Ended' : 'Active'}
                </span>
              )}
              {isExpanded ? <ChevronUp className="h-5 w-5 text-white" /> : <ChevronDown className="h-5 w-5 text-white" />}
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-[#39071f] space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Poll ID:</span>
                <span className="font-mono">{bet.pollId}</span>
              </div>
              <div className="flex justify-between">
                <span>Target Price:</span>
                <span>{bet.targetPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Max Price Reached:</span>
                <span>{bet.maxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total YES Pool:</span>
                <span>{bet.totalYesPool.toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span>Total NO Pool:</span>
                <span>{bet.totalNoPool.toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span>End Time:</span>
                <span>{new Date(bet.endTime).toLocaleString()}</span>
              </div>
              {bet.isResolved && (
                <div className="flex justify-between">
                  <span>Outcome:</span>
                  <span className={bet.outcome ? 'text-green-400' : 'text-red-400'}>
                    {bet.outcome ? 'YES Won' : 'NO Won'}
                  </span>
                </div>
              )}
              {type === 'won' && (
                <>
                  <div className="flex justify-between">
                    <span>Bet Amount:</span>
                    <span>{bet.totalBet.toFixed(4)} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payout:</span>
                    <span className="text-green-400">{bet.payout.toFixed(4)} ETH</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Profit:</span>
                    <span className="text-green-400">+{bet.profit.toFixed(4)} ETH</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="bg-black rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-white mb-4">Betting History</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'active'
              ? 'bg-[#ED3968] text-white'
              : 'bg-[#16030d] text-white hover:bg-[#39071f]'
          }`}
        >
          Active ({stats.activeBets.length})
        </button>
        <button
          onClick={() => setActiveTab('won')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'won'
              ? 'bg-[#ED3968] text-white'
              : 'bg-[#16030d] text-white hover:bg-[#39071f]'
          }`}
        >
          Won ({stats.wonBets.length})
        </button>
        <button
          onClick={() => setActiveTab('lost')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'lost'
              ? 'bg-[#ED3968] text-white'
              : 'bg-[#16030d] text-white hover:bg-[#39071f]'
          }`}
        >
          Lost ({stats.lostBets.length})
        </button>
      </div>

      {/* Bet List */}
      <div className="max-h-[600px] overflow-y-auto">
        {stats.loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ED3968] mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your betting history...</p>
          </div>
        ) : (
          <>
            {activeTab === 'active' && renderBets(stats.activeBets, 'active')}
            {activeTab === 'won' && renderBets(stats.wonBets, 'won')}
            {activeTab === 'lost' && renderBets(stats.lostBets, 'lost')}
          </>
        )}
      </div>
    </div>
  );
};

export default BetHistory;