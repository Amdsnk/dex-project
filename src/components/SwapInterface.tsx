'use client'

import { useState, useEffect } from 'react';
import { AlertCircle, ArrowDownCircle, Settings, Wallet } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

interface Token {
  symbol: string;
  address: string;
  logo: string;
  balance: string;
}

interface TokenSelectProps {
  token: Token | null;
  onSelect: (token: Token | null) => void;
  tokens: Token[];
}

// Token selection dropdown component
const TokenSelect: React.FC<TokenSelectProps> = ({ token, onSelect, tokens }) => (
  <div className="relative w-full">
    <button 
      className="w-full flex items-center justify-between bg-gray-800 rounded-lg p-4 hover:bg-gray-700"
      onClick={() => onSelect(token)}
    >
      {token ? (
        <>
          <div className="flex items-center">
            <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full mr-2" />
            <span className="text-lg font-semibold">{token.symbol}</span>
          </div>
          <span className="text-gray-400">{token.balance}</span>
        </>
      ) : (
        <span className="text-gray-400">Select a token</span>
      )}
    </button>
  </div>
);

// Main swap interface
const SwapInterface: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState('');
  const [tokenIn, setTokenIn] = useState<Token | null>(null);
  const [tokenOut, setTokenOut] = useState<Token | null>(null);
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [priceImpact, setPriceImpact] = useState(0);
  
  // Mock tokens data
  const tokens: Token[] = [
    { symbol: 'ETH', address: '0x...', logo: '/api/placeholder/32/32', balance: '1.5' },
    { symbol: 'USDC', address: '0x...', logo: '/api/placeholder/32/32', balance: '1000.0' },
    { symbol: 'USDT', address: '0x...', logo: '/api/placeholder/32/32', balance: '1000.0' },
  ];

  useEffect(() => {
    checkConnection();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setConnected(true);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setConnected(true);
    } else {
      setAccount('');
      setConnected(false);
    }
  };

  const handleConnect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this application');
      return;
    }

    try {
      setLoading(true);
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      setAccount(accounts[0]);
      setConnected(true);
    } catch (error) {
      console.error('Error connecting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!connected || !tokenIn || !tokenOut || !amount) return;
    
    try {
      setLoading(true);
      // Example of sending a transaction using window.ethereum
      const transactionParameters = {
        to: tokenIn.address,
        from: account,
        value: '0x00',
        data: '0x', // Contract interaction data would go here
      };

      // Send the transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      alert(`Transaction submitted: ${txHash}`);
    } catch (error) {
      console.error('Error executing swap:', error);
      alert('Swap failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      {/* Header */}
      <div className="w-full max-w-lg flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">DEX Exchange</h1>
        <button
          onClick={handleConnect}
          disabled={loading || connected}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg disabled:opacity-50"
        >
          <Wallet className="w-5 h-5" />
          {connected ? 'Connected' : 'Connect Wallet'}
        </button>
      </div>

      {/* Main swap card */}
      <Card className="w-full max-w-lg bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Swap</CardTitle>
          <CardDescription>Trade tokens instantly</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Token input */}
          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400">From</label>
                <span className="text-sm text-gray-400">Balance: {tokenIn?.balance || '0.0'}</span>
              </div>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-transparent text-2xl outline-none"
                />
                <TokenSelect token={tokenIn} onSelect={setTokenIn} tokens={tokens} />
              </div>
            </div>

            {/* Swap direction arrow */}
            <div className="flex justify-center -my-2">
              <button 
                className="bg-gray-700 p-2 rounded-full hover:bg-gray-600"
                onClick={() => {
                  const temp = tokenIn;
                  setTokenIn(tokenOut);
                  setTokenOut(temp);
                }}
              >
                <ArrowDownCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Token output */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400">To</label>
                <span className="text-sm text-gray-400">Balance: {tokenOut?.balance || '0.0'}</span>
              </div>
              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="0.0"
                  disabled
                  className="w-full bg-transparent text-2xl outline-none"
                  value={amount ? (Number(amount) * 0.98).toFixed(6) : ''} // Mock price calculation
                />
                <TokenSelect token={tokenOut} onSelect={setTokenOut} tokens={tokens} />
              </div>
            </div>

            {/* Price impact warning */}
            {priceImpact > 2 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>High Price Impact</AlertTitle>
                <AlertDescription>
                  This trade has a price impact of {priceImpact}%. Proceed with caution.
                </AlertDescription>
              </Alert>
            )}

            {/* Settings */}
            <div className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                <span>Slippage Tolerance</span>
              </div>
              <div className="flex gap-2">
                {[0.5, 1, 2].map((value) => (
                  <button
                    key={value}
                    onClick={() => setSlippage(value)}
                    className={`px-3 py-1 rounded-lg ${
                      slippage === value ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
              </div>
            </div>

            {/* Swap button */}
            <button
              onClick={handleSwap}
              disabled={!connected || !tokenIn || !tokenOut || !amount || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!connected 
                ? 'Connect Wallet' 
                : !tokenIn || !tokenOut 
                ? 'Select Tokens'
                : !amount 
                ? 'Enter Amount'
                : loading 
                ? 'Swapping...'
                : 'Swap'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Market info */}
      <Card className="w-full max-w-lg mt-4 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Market Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Price Impact</span>
              <span className={priceImpact > 2 ? 'text-red-500' : 'text-gray-200'}>
                {priceImpact}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Minimum Received</span>
              <span className="text-gray-200">
                {amount ? (Number(amount) * (1 - slippage / 100)).toFixed(6) : '0.0'} {tokenOut?.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Liquidity Provider Fee</span>
              <span className="text-gray-200">0.3%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SwapInterface;
