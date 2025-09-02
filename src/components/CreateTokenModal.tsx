import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Coins, TrendingUp, Lock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { usePumpFun } from "@/hooks/usePumpFun";
import { useWaitForTransactionReceipt } from 'wagmi';

interface CreateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTokenModal = ({ isOpen, onClose }: CreateTokenModalProps) => {
  const { toast } = useToast();
  const { createToken } = usePumpFun();
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    imageUri: "",
    initialPrice: "0.0001",
    creationFee: "0.001"
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUri = e.target?.result as string;
        setFormData(prev => ({ ...prev, imageUri }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateToken = async () => {
    setIsCreating(true);
    setStep(2);
    
    try {
      const hash = await createToken(
        formData.name,
        formData.symbol,
        formData.imageUri || "https://via.placeholder.com/200",
        formData.description
      );
      
      setTxHash(hash);
      
      toast({
        title: "Token Creation Initiated",
        description: "Waiting for transaction confirmation...",
      });
      
    } catch (error: any) {
      console.error("Token creation error:", error);
      toast({
        title: "Creation Failed",
        description: error?.message || "Failed to create token",
        variant: "destructive"
      });
      setIsCreating(false);
      setStep(1);
    }
  };

  if (isSuccess && step === 2) {
    setStep(3);
    toast({
      title: "Token Created Successfully!",
      description: `${formData.name} (${formData.symbol}) is now live on X Layer`,
    });
    
    setTimeout(() => {
      setIsCreating(false);
      setStep(1);
      setTxHash("");
      setFormData({
        name: "",
        symbol: "",
        description: "",
        imageUri: "",
        initialPrice: "0.0001",
        creationFee: "0.001"
      });
      onClose();
    }, 3000);
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Token Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Doge Coin"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="bg-xlayer-card border-xlayer-border focus:border-primary"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="symbol">Symbol *</Label>
          <Input
            id="symbol"
            placeholder="e.g., DOGE"
            value={formData.symbol}
            onChange={(e) => handleInputChange("symbol", e.target.value.toUpperCase())}
            className="bg-xlayer-card border-xlayer-border focus:border-primary"
            maxLength={6}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Tell the world about your token..."
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className="bg-xlayer-card border-xlayer-border focus:border-primary min-h-[100px]"
          maxLength={280}
        />
        <p className="text-xs text-muted-foreground text-right">
          {formData.description.length}/280
        </p>
      </div>

      <div className="space-y-2">
        <Label>Token Image *</Label>
        <div className="border-2 border-dashed border-xlayer-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {formData.imageUri ? "Image uploaded" : "Click to upload token image"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG up to 2MB
            </p>
          </label>
        </div>
      </div>

      <div className="bg-xlayer-gradient rounded-lg p-4 border border-xlayer-border">
        <h4 className="font-semibold text-foreground mb-3 flex items-center">
          <Coins className="w-4 h-4 mr-2 text-primary" />
          Bonding Curve Mechanics
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Creation Fee:</span>
            <span className="text-primary font-medium">{formData.creationFee} OKB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Initial Price:</span>
            <span className="text-foreground">{formData.initialPrice} OKB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Liquidity Pool:</span>
            <span className="text-foreground">80 OKB threshold</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Locked Liquidity:</span>
            <span className="text-accent">36 OKB (permanent)</span>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleCreateToken}
        disabled={!formData.name || !formData.symbol || !formData.description || isCreating || isConfirming}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
      >
        {isCreating || isConfirming ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {isConfirming ? "Confirming..." : "Creating..."}
          </>
        ) : (
          `Create Token for ${formData.creationFee} OKB`
        )}
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
        <TrendingUp className="w-8 h-8 text-primary animate-pulse" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Creating Your Token</h3>
        <p className="text-muted-foreground">Setting up bonding curve and initializing contract...</p>
      </div>
      <Progress value={75} className="w-full" />
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <span className="text-foreground">Deploying contract</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <span className="text-foreground">Setting up bonding curve</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-muted rounded-full"></div>
          <span className="text-muted-foreground">Initializing liquidity pool</span>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
        <Lock className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-primary mb-2">Token Created Successfully!</h3>
        <p className="text-muted-foreground">Your token is now live on X Layer</p>
      </div>
      <div className="bg-xlayer-card rounded-lg p-4 border border-xlayer-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted-foreground">Token:</span>
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            {formData.name} ({formData.symbol})
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Contract:</span>
          <span className="text-xs text-foreground font-mono">0x1234...5678</span>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-xlayer-card border-xlayer-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {step === 1 && "Create New Token"}
            {step === 2 && "Creating Token..."}
            {step === 3 && "Token Created!"}
          </DialogTitle>
        </DialogHeader>
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </DialogContent>
    </Dialog>
  );
};

export default CreateTokenModal;