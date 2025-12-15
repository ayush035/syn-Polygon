import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { PREDICTION_MARKET_ADDRESS } from '@/lib/config2';
import CONTRACT_ABI from '../abi/PredictionMarketplace.json';

export const useUserBettingStats = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [bettingStats, setBettingStats] = useState({
    activeBets: [],
    wonBets: [],
    lostBets: [],
    totalPnL: 0,
    totalWagered: 0,
    totalWon: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchUserBets = async () => {
      if (!address || !publicClient) {
        setBettingStats(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        console.log('🔍 Fetching user betting stats for:', address);
        
        // Get total poll count
        const pollCount = await publicClient.readContract({
          address: PREDICTION_MARKET_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'pollCount',
        });

        console.log('📊 Total polls:', pollCount.toString());

        const activeBets = [];
        const wonBets = [];
        const lostBets = [];
        let totalWagered = 0n;
        let totalWon = 0n;

        // Check each poll for user bets
        for (let i = 0; i < Number(pollCount); i++) {
          try {
            // Get user bets for this poll
            const userBets = await publicClient.readContract({
              address: PREDICTION_MARKET_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'getUserBets',
              args: [BigInt(i), address],
            });

            const yesBet = userBets[0];
            const noBet = userBets[1];

            // Skip if user has no bets in this poll
            if (yesBet === 0n && noBet === 0n) continue;

            // Get poll details
            const pollData = await publicClient.readContract({
              address: PREDICTION_MARKET_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'polls',
              args: [BigInt(i)],
            });

            const question = pollData[0];
            const endTime = Number(pollData[2]);
            const targetPrice = pollData[5];
            const maxPriceDuringPoll = pollData[6];
            const totalYes = pollData[7];
            const totalNo = pollData[8];
            const isResolved = pollData[9];

            const userTotalBet = yesBet + noBet;
            totalWagered += userTotalBet;

            const bet = {
              pollId: i,
              question,
              endTime: endTime * 1000, // Convert to milliseconds
              yesBet: Number(yesBet) / 1e8,
              noBet: Number(noBet) / 1e8,
              totalBet: Number(userTotalBet) / 1e8,
              targetPrice: Number(targetPrice) / 1e8,
              maxPrice: Number(maxPriceDuringPoll) / 1e8,
              totalYesPool: Number(totalYes) / 1e8,
              totalNoPool: Number(totalNo) / 1e8,
              isResolved,
              betOnYes: yesBet > 0n,
              betOnNo: noBet > 0n,
            };

            if (!isResolved) {
              // Active bet
              activeBets.push(bet);
            } else {
              // Resolved bet - determine if won or lost
              const outcome = maxPriceDuringPoll >= targetPrice; // true = YES won, false = NO won
              const userWon = (outcome && yesBet > 0n) || (!outcome && noBet > 0n);

              if (userWon) {
                // Calculate winnings
                const totalPool = totalYes + totalNo;
                const winningPool = outcome ? totalYes : totalNo;
                const userBetAmount = outcome ? yesBet : noBet;
                
                // Calculate fees (3% total: 2% host + 1% platform)
                const fees = (totalPool * 3n) / 100n;
                const remainingPool = totalPool - fees;
                
                // Check minimum volume requirement (4% each side)
                const minVolume = (totalPool * 4n) / 100n;
                const meetsMinimum = totalYes >= minVolume && totalNo >= minVolume;
                
                let payout = 0n;
                if (meetsMinimum && winningPool > 0n) {
                  payout = (userBetAmount * remainingPool) / winningPool;
                }

                const profit = payout - userBetAmount;
                totalWon += payout;

                wonBets.push({
                  ...bet,
                  outcome,
                  payout: Number(payout) / 1e8,
                  profit: Number(profit) / 1e8,
                });
              } else {
                // Lost bet
                lostBets.push({
                  ...bet,
                  outcome,
                  loss: Number(userTotalBet) / 1e8,
                });
              }
            }
          } catch (pollError) {
            console.error(`Error fetching poll ${i}:`, pollError);
          }
        }

        const totalPnL = Number(totalWon - totalWagered) / 1e8;

        console.log('✅ Betting stats loaded:', {
          activeBets: activeBets.length,
          wonBets: wonBets.length,
          lostBets: lostBets.length,
          totalPnL,
        });

        setBettingStats({
          activeBets,
          wonBets,
          lostBets,
          totalPnL,
          totalWagered: Number(totalWagered) / 1e8,
          totalWon: Number(totalWon) / 1e8,
          loading: false,
        });
      } catch (error) {
        console.error('❌ Error fetching betting stats:', error);
        setBettingStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchUserBets();

    // Refresh every 30 seconds
    const interval = setInterval(fetchUserBets, 30000);
    return () => clearInterval(interval);
  }, [address, publicClient]);

  return bettingStats;
};