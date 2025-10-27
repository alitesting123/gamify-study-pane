// src/components/Subscription.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const Subscription = () => {
  const currentPlan = "Pro";
  const billingDate = "March 15, 2025";
  const usagePercentage = 65;

  return (
    <div className="space-y-6 animate-fade-in-up max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and billing
        </p>
      </div>

      {/* Current Plan */}
      <Card className="p-6 border-2 border-primary">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary text-primary-foreground">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">Pro Plan</h2>
                <Badge className="bg-primary/10 text-primary border-primary/20">Current</Badge>
              </div>
              <p className="text-muted-foreground mt-1">Next billing date: {billingDate}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">$9.99</p>
            <p className="text-sm text-muted-foreground">per month</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Games Created This Month</span>
              <span className="font-semibold">13 / 20</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1">Change Plan</Button>
            <Button variant="outline" className="flex-1">Cancel Subscription</Button>
          </div>
        </div>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <Card className="p-6 relative">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">Free</h3>
                <p className="text-3xl font-bold mt-2">$0</p>
                <p className="text-sm text-muted-foreground">forever</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>5 games per month</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Basic game templates</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Community support</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </div>
          </Card>

          {/* Pro Plan */}
          <Card className="p-6 relative border-2 border-primary shadow-lg">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
              Most Popular
            </Badge>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">Pro</h3>
                <p className="text-3xl font-bold mt-2">$9.99</p>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>20 games per month</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>All game templates</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Advanced analytics</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Custom branding</span>
                </div>
              </div>

              <Button className="w-full" disabled>
                Current Plan
              </Button>
            </div>
          </Card>

          {/* Enterprise Plan */}
          <Card className="p-6 relative">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">Enterprise</h3>
                <p className="text-3xl font-bold mt-2">$29.99</p>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Unlimited games</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>All Pro features</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Dedicated support</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>API access</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Team collaboration</span>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                Upgrade
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Why Upgrade?</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">More Games</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Create more games per month to keep your learning momentum going
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Priority Support</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Get help faster with dedicated support from our team
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Advanced Features</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Access to all game templates and advanced analytics
            </p>
          </Card>
        </div>
      </div>

      {/* Billing History */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Billing History</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Pro Plan - February 2025</p>
              <p className="text-sm text-muted-foreground">Feb 15, 2025</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">$9.99</p>
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                Paid
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Pro Plan - January 2025</p>
              <p className="text-sm text-muted-foreground">Jan 15, 2025</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">$9.99</p>
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                Paid
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
