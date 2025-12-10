"use client";

import { useState, useEffect } from "react";
import { FileText, Bot, DollarSign, Percent } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { LicenseTerms } from "@/hooks/useStoryProtocol";

interface LicenseConfigurationProps {
  onLicenseChange: (terms: LicenseTerms) => void;
}

interface LicenseOption {
  type: "standard" | "ai-training";
  title: string;
  description: string;
  icon: React.ReactNode;
  defaultRoyalty?: number;
  flatFee?: number;
  features: string[];
  color: "orange" | "blue";
}

const LICENSE_OPTIONS: LicenseOption[] = [
  {
    type: "standard",
    title: "Standard License",
    description: "For social media & content creation",
    icon: <FileText className="h-6 w-6" />,
    defaultRoyalty: 5,
    features: [
      "Social media use allowed",
      "Non-commercial only",
      "Attribution required",
      "Royalty-based payment",
    ],
    color: "orange",
  },
  {
    type: "ai-training",
    title: "AI Training License",
    description: "For robotics & AI development",
    icon: <Bot className="h-6 w-6" />,
    flatFee: 1000,
    features: [
      "Commercial use allowed",
      "AI/ML training permitted",
      "Robotics applications",
      "One-time flat fee",
    ],
    color: "blue",
  },
];

export function LicenseConfiguration({ onLicenseChange }: LicenseConfigurationProps) {
  const [selectedType, setSelectedType] = useState<"standard" | "ai-training">("standard");
  const [royaltyPercentage, setRoyaltyPercentage] = useState(5);
  const [flatFee, setFlatFee] = useState(1000);
  const [customRoyalty, setCustomRoyalty] = useState(false);

  useEffect(() => {
    const terms: LicenseTerms = {
      type: selectedType,
      commercialUse: selectedType === "ai-training",
      socialMediaUse: selectedType === "standard",
      ...(selectedType === "standard" 
        ? { royaltyPercentage } 
        : { flatFee }
      ),
    };
    onLicenseChange(terms);
  }, [selectedType, royaltyPercentage, flatFee, onLicenseChange]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-mono text-lg font-bold mb-1">License Flavors</h3>
        <p className="font-mono text-xs text-muted-foreground">
          Choose how AI companies can license your training data
        </p>
      </div>

      {/* License Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LICENSE_OPTIONS.map((option) => {
          const isSelected = selectedType === option.type;
          const colorClasses = option.color === "orange" 
            ? {
                border: "border-neon-orange/50",
                bg: "bg-neon-orange/5",
                text: "text-neon-orange",
                glow: "glow-orange",
              }
            : {
                border: "border-electric-blue/50",
                bg: "bg-electric-blue/5",
                text: "text-electric-blue",
                glow: "glow-blue",
              };

          return (
            <Card
              key={option.type}
              onClick={() => setSelectedType(option.type)}
              className={cn(
                "cursor-pointer transition-all duration-300 border-2",
                isSelected 
                  ? `${colorClasses.border} ${colorClasses.bg}` 
                  : "border-border/50 hover:border-muted-foreground"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    isSelected ? colorClasses.bg : "bg-muted"
                  )}>
                    <div className={cn(
                      "transition-colors",
                      isSelected ? colorClasses.text : "text-muted-foreground"
                    )}>
                      {option.icon}
                    </div>
                  </div>
                  <Switch
                    checked={isSelected}
                    onCheckedChange={() => setSelectedType(option.type)}
                    className={cn(
                      isSelected && option.color === "orange" && "data-[state=checked]:bg-neon-orange",
                      isSelected && option.color === "blue" && "data-[state=checked]:bg-electric-blue"
                    )}
                  />
                </div>
                <CardTitle className={cn(
                  "font-mono text-base mt-3",
                  isSelected && colorClasses.text
                )}>
                  {option.title}
                </CardTitle>
                <CardDescription className="font-mono text-xs">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {option.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 font-mono text-xs">
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isSelected ? colorClasses.bg.replace("/5", "/50") : "bg-muted-foreground/50"
                      )} />
                      <span className={isSelected ? "text-foreground" : "text-muted-foreground"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Pricing Display */}
                <div className={cn(
                  "mt-4 p-3 rounded-lg border",
                  isSelected 
                    ? `${colorClasses.border} ${colorClasses.bg}` 
                    : "border-border bg-muted/30"
                )}>
                  {option.type === "standard" ? (
                    <div className="flex items-center gap-2">
                      <Percent className={cn("h-4 w-4", colorClasses.text)} />
                      <span className="font-mono text-lg font-bold">
                        {royaltyPercentage}%
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        Royalty
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <DollarSign className={cn("h-4 w-4", colorClasses.text)} />
                      <span className="font-mono text-lg font-bold">
                        {flatFee.toLocaleString()} USDC
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        Flat Fee
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Royalty Slider (for Standard License) */}
      {selectedType === "standard" && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-mono text-sm">Customize Royalty</CardTitle>
              <Switch
                checked={customRoyalty}
                onCheckedChange={setCustomRoyalty}
              />
            </div>
          </CardHeader>
          {customRoyalty && (
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono text-sm">
                  <span className="text-muted-foreground">Royalty Percentage</span>
                  <span className="text-neon-orange font-bold">{royaltyPercentage}%</span>
                </div>
                <Slider
                  value={[royaltyPercentage]}
                  onValueChange={([value]) => setRoyaltyPercentage(value)}
                  min={1}
                  max={25}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between font-mono text-xs text-muted-foreground">
                  <span>1%</span>
                  <span>25%</span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* License Summary */}
      <Card className="border-border/50 bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              License Summary
            </span>
          </div>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">License Type</span>
              <span className={selectedType === "ai-training" ? "text-electric-blue" : "text-neon-orange"}>
                {selectedType === "ai-training" ? "AI Training" : "Standard"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Commercial Use</span>
              <span>{selectedType === "ai-training" ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Model</span>
              <span>
                {selectedType === "ai-training" 
                  ? `${flatFee.toLocaleString()} USDC Flat` 
                  : `${royaltyPercentage}% Royalty`
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LicenseConfiguration;
