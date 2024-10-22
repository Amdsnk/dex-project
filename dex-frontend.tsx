import React, { useState, useEffect } from 'react';
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

const TokenSelect = ({ 
  token, 
  onSelect, 
  tokens 
}: TokenSelectProps) => (
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

const SwapInterface = () => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState('');
  const [tokenIn, setTokenIn] = useState<Token | null>(null);
  const [tokenOut, setTokenOut] = useState<Token | null>(null);
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [priceImpact, setPriceImpact] = useState(0);

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

  const ethereum = window.ethereum as Ethereum | undefined;
  if (!ethereum) {
    alert('MetaMask is not installed. Please install it to use this feature.');
    return;
  }
  
  try {
    setLoading(true);
    const transactionParameters = {
      to: tokenIn.address,
      from: account,
      value: '0x00',
      data: '0x',
    };

    // Send the transaction only if ethereum is defined
    const txHash = await ethereum.request({
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
}

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
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
      <Card className="w-full max-w-lg bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Swap</CardTitle>
          <CardDescription>Trade tokens instantly</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Token input and swap button components go here */}
        </CardContent>
      </Card>
    </div>
  );
};

export default SwapInterface;
