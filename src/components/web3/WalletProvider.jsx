import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { web3Config } from '../web3/web3Config';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

class WalletErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.children;
    return this.props.children;
  }
}

export default function WalletProvider({ children }) {
  try {
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
            <WalletErrorBoundary>{children}</WalletErrorBoundary>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    );
  } catch {
    return <>{children}</>;
  }
}