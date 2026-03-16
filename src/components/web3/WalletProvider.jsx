import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { web3Config } from '../web3/web3Config';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

class Web3ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      // Web3 failed to init — render children without Web3 context
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

function Web3Providers({ children }) {
  return (
    <WagmiProvider config={web3Config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#ff6600',
            accentColorForeground: 'black',
            borderRadius: 'none',
            fontStack: 'system',
          })}
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default function WalletProvider({ children }) {
  return (
    <Web3ErrorBoundary fallback={children}>
      <Web3Providers>{children}</Web3Providers>
    </Web3ErrorBoundary>
  );
}