/**
 * Staking Calculator
 * Project potential earnings from staking over time
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StakingCalculator({ totalStaked = 0, currentAPR = 0, avgTokenPrice = 0 }) {
  const [stakingAmount, setStakingAmount] = useState(totalStaked || 100);
  const [timePeriod, setTimePeriod] = useState(12); // months
  const [aprAssumption, setAprAssumption] = useState(currentAPR || 15);

  // Calculate compound growth
  const calculateProjection = () => {
    const monthlyRate = aprAssumption / 100 / 12;
    const data = [];

    for (let month = 0; month <= timePeriod; month++) {
      const balance = stakingAmount * Math.pow(1 + monthlyRate, month);
      const earned = balance - stakingAmount;
      const value = balance * avgTokenPrice;

      data.push({
        month,
        balance: parseFloat(balance.toFixed(2)),
        earned: parseFloat(earned.toFixed(2)),
        value: parseFloat(value.toFixed(2)),
        displayMonth: month === 0 ? 'Now' : `${month}m`,
      });
    }

    return data;
  };

  const projectionData = calculateProjection();
  const finalBalance = projectionData[projectionData.length - 1].balance;
  const totalEarned = projectionData[projectionData.length - 1].earned;
  const finalValue = projectionData[projectionData.length - 1].value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Staking Amount */}
        <div>
          <label className="block font-rajdhani font-bold text-green-400 mb-2">
            Tokens to Stake
          </label>
          <input
            type="number"
            min="0"
            value={stakingAmount}
            onChange={(e) => setStakingAmount(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full bg-green-500/10 border border-green-500/30 px-4 py-2 text-green-400 placeholder-green-400/30 font-rajdhani rounded focus:outline-none focus:border-green-500/50"
          />
          <p className="font-mono text-xs text-green-400/50 mt-1">
            ≈ €{(stakingAmount * avgTokenPrice).toFixed(2)}
          </p>
        </div>

        {/* Time Period */}
        <div>
          <label className="block font-rajdhani font-bold text-green-400 mb-2">
            Time Period (Months)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={timePeriod}
            onChange={(e) => setTimePeriod(Math.max(1, parseInt(e.target.value) || 12))}
            className="w-full bg-green-500/10 border border-green-500/30 px-4 py-2 text-green-400 placeholder-green-400/30 font-rajdhani rounded focus:outline-none focus:border-green-500/50"
          />
          <p className="font-mono text-xs text-green-400/50 mt-1">
            {Math.floor(timePeriod / 12)} years
          </p>
        </div>

        {/* APR Assumption */}
        <div>
          <label className="block font-rajdhani font-bold text-green-400 mb-2">
            Expected APR (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={aprAssumption}
            onChange={(e) => setAprAssumption(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full bg-green-500/10 border border-green-500/30 px-4 py-2 text-green-400 placeholder-green-400/30 font-rajdhani rounded focus:outline-none focus:border-green-500/50"
          />
          <p className="font-mono text-xs text-green-400/50 mt-1">
            Current: {currentAPR.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Projection Chart */}
      <div className="bg-black/40 border border-green-500/10 p-4 rounded-lg">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={projectionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,100,0.1)" />
            <XAxis
              dataKey="displayMonth"
              stroke="#00ff64"
              style={{ fontSize: 10, fontFamily: 'monospace' }}
            />
            <YAxis stroke="#00ff64" style={{ fontSize: 10, fontFamily: 'monospace' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(4,2,8,0.95)',
                border: '1px solid rgba(0,255,100,0.3)',
                fontFamily: 'monospace',
                fontSize: 11,
              }}
              formatter={(value) => value.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#00ff64"
              strokeWidth={2}
              dot={false}
              name="Token Balance"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg"
        >
          <p className="font-mono text-xs text-green-400/60 uppercase tracking-[1px] mb-2">
            Final Balance
          </p>
          <p className="font-orbitron font-black text-2xl text-green-400">
            {finalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="font-rajdhani text-xs text-green-400/50 mt-1">
            {(finalBalance / stakingAmount - 1).toFixed(2)}x growth
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg"
        >
          <p className="font-mono text-xs text-green-400/60 uppercase tracking-[1px] mb-2">
            Earned from Staking
          </p>
          <p className="font-orbitron font-black text-2xl text-green-400">
            {totalEarned.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="font-rajdhani text-xs text-green-400/50 mt-1">
            {((totalEarned / stakingAmount) * 100).toFixed(1)}% gain
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg"
        >
          <p className="font-mono text-xs text-green-400/60 uppercase tracking-[1px] mb-2">
            Est. EUR Value
          </p>
          <p className="font-orbitron font-black text-2xl text-green-400">
            €{finalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="font-rajdhani text-xs text-green-400/50 mt-1">
            At €{avgTokenPrice.toFixed(2)}/token
          </p>
        </motion.div>
      </div>

      {/* Disclaimer */}
      <div className="bg-orange-500/5 border border-orange-500/10 p-3 rounded">
        <p className="font-rajdhani text-xs text-orange-400/70">
          ⚠️ This is a projection based on constant APR. Actual returns may vary based on network activity, market conditions, and token price fluctuations.
        </p>
      </div>
    </motion.div>
  );
}