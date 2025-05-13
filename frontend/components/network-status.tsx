"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { addLensTestnetToMetaMask } from "@/lib/contract-utils"
import { LENS_TESTNET_CHAIN_ID } from "@/lib/contract-config"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react"

export default function NetworkStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)
  const [account, setAccount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          setIsConnected(accounts.length > 0)
          if (accounts.length > 0) {
            setAccount(accounts[0])
          }

          // Check network
          const chainId = await window.ethereum.request({ method: "eth_chainId" })
          setIsCorrectNetwork(Number.parseInt(chainId, 16) === LENS_TESTNET_CHAIN_ID)

          // Listen for account changes
          window.ethereum.on("accountsChanged", (newAccounts) => {
            setIsConnected(newAccounts.length > 0)
            if (newAccounts.length > 0) {
              setAccount(newAccounts[0])
            } else {
              setAccount("")
            }
          })

          // Listen for chain changes
          window.ethereum.on("chainChanged", (chainId) => {
            setIsCorrectNetwork(Number.parseInt(chainId, 16) === LENS_TESTNET_CHAIN_ID)
          })
        } catch (error) {
          console.error("Error checking connection:", error)
        }
      }
    }

    checkConnection()

    return () => {
      // Clean up listeners
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged")
        window.ethereum.removeAllListeners("chainChanged")
      }
    }
  }, [])

  const connectToWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        setIsLoading(true)
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        setIsConnected(accounts.length > 0)
        if (accounts.length > 0) {
          setAccount(accounts[0])
          toast({
            title: "Wallet Connected",
            description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          })
        }
      } catch (error) {
        console.error("Error connecting to wallet:", error)
        toast({
          title: "Connection Error",
          description: "Failed to connect to wallet",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      toast({
        title: "Wallet Not Found",
        description: "Please install MetaMask or another Ethereum wallet",
        variant: "destructive",
      })
    }
  }

  const switchToLensTestnet = async () => {
    try {
      setIsLoading(true)
      const requiredChainIdHex = `0x${LENS_TESTNET_CHAIN_ID.toString(16)}`
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: requiredChainIdHex }],
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await addLensTestnetToMetaMask()
        } catch (addError) {
          console.error("Error adding Lens Testnet:", addError)
          toast({
            title: "Network Error",
            description: "Failed to add Lens Testnet to your wallet",
            variant: "destructive",
          })
        }
      } else {
        console.error("Error switching network:", switchError)
        toast({
          title: "Network Error",
          description: "Failed to switch to Lens Testnet",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant={isCorrectNetwork ? "default" : "destructive"}
                  className={`px-3 py-1 flex items-center gap-1 ${isCorrectNetwork ? "cyber-badge-green" : "cyber-badge-pink"}`}
                >
                  {isCorrectNetwork ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                  {isCorrectNetwork ? "Lens Testnet" : "Wrong Network"}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {isCorrectNetwork ? "Connected to Lens Testnet" : "Please switch to Lens Testnet"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="text-sm text-neon-blue">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
          {!isCorrectNetwork && (
            <Button
              size="sm"
              variant="outline"
              onClick={switchToLensTestnet}
              disabled={isLoading}
              className="h-8 cyber-button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Switching...
                </>
              ) : (
                "Switch Network"
              )}
            </Button>
          )}
        </>
      ) : (
        <Button size="sm" onClick={connectToWallet} disabled={isLoading} className="h-8 cyber-button">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Connecting...
            </>
          ) : (
            "Connect Wallet"
          )}
        </Button>
      )}
    </div>
  )
}
