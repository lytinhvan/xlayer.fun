import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Wallet, ExternalLink, Copy, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { injected, metaMask } from 'wagmi/connectors';

interface WalletConnectionProps {}

const WalletConnection = ({}: WalletConnectionProps) => {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  
  const { data: balance } = useBalance({
    address,
  });

  const wallets = [
    {
      name: "Injected Wallet",
      icon: "🟡",
      description: "OKX Wallet or Browser Extension",
      preferred: true,
      connector: injected()
    },
    {
      name: "MetaMask",
      icon: "🦊",
      description: "Popular Web3 wallet",
      preferred: false,
      connector: metaMask()
    }
  ];

  const handleWalletConnect = async (connector: any, walletName: string) => {
    try {
      connect({ connector });
      setShowModal(false);
      
      toast({
        title: "Wallet Connected",
        description: `Successfully connected with ${walletName}`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-3">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-foreground">
            {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0.0000 OKB'}
          </p>
          <p className="text-xs text-muted-foreground">{formatAddress(address)}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAddress}
            className="border-xlayer-border hover:bg-xlayer-hover"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            className="border-xlayer-border hover:bg-xlayer-hover text-destructive"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Button 
        onClick={() => setShowModal(true)}
        variant="outline" 
        className="border-xlayer-border hover:bg-xlayer-hover"
      >
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[400px] bg-xlayer-card border-xlayer-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Connect Your Wallet</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-xlayer-gradient rounded-lg p-4 border border-xlayer-border">
              <h4 className="font-semibold text-foreground mb-2">Welcome to X Layer</h4>
              <p className="text-sm text-muted-foreground">
                Connect your wallet to create and trade tokens on the new money chain.
              </p>
            </div>

            <div className="space-y-3">
              {wallets.map((wallet) => (
                <Button
                  key={wallet.name}
                  variant="outline"
                  className="w-full justify-start p-4 h-auto border-xlayer-border hover:bg-xlayer-hover hover:border-primary/50 transition-all"
                  onClick={() => handleWalletConnect(wallet.connector, wallet.name)}
                  disabled={isPending}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{wallet.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-foreground">{wallet.name}</span>
                        {wallet.preferred && (
                          <Badge variant="secondary" className="bg-primary/20 text-primary border-0 text-xs">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{wallet.description}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Button>
              ))}
            </div>

            <div className="text-center pt-4 border-t border-xlayer-border">
              <p className="text-xs text-muted-foreground">
                By connecting, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletConnection;