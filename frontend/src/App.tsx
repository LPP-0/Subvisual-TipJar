import { useState } from 'react'
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt
} from 'wagmi'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { parseEther, formatEther } from 'viem'
import { TIP_JAR_ADDRESS, TIP_JAR_ABI } from './constants'

type Tip = {
  from: string
  timestamp: bigint
  message: string
  amount: bigint
}

function App() {

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    cursor: 'pointer',
    border: 'none',
    boxSizing: 'border-box' as const,
  }

  const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '10px',
    borderRadius: '10px',
    border: '1px solid #ccc',
    boxSizing: 'border-box' as const,
  }

  const { address, isConnected } = useAccount()

  const [message, setMessage] = useState('')
  const [amount, setAmount] = useState('0.01')
  const [withdrawAmount, setWithdrawAmount] = useState('0.01')

  // READ: tips
  const { data: tips, refetch } = useReadContract({
    address: TIP_JAR_ADDRESS,
    abi: TIP_JAR_ABI,
    functionName: 'getTips',
  })

  // READ: owner
  const { data: owner } = useReadContract({
    address: TIP_JAR_ADDRESS,
    abi: TIP_JAR_ABI,
    functionName: 'owner',
  })

  const isOwner =
    address &&
    owner &&
    address.toLowerCase() === String(owner).toLowerCase()

  // WRITE: send tip
  const {
    data: hash,
    writeContract,
    isPending: isSending
  } = useWriteContract()

  // WRITE: withdraw
  const {
    writeContract: writeWithdraw,
    isPending: isWithdrawing
  } = useWriteContract()

  // TX status
  const { isLoading: isConfirming } =
    useWaitForTransactionReceipt({ hash })

  const handleSendTip = () => {
    writeContract({
      address: TIP_JAR_ADDRESS,
      abi: TIP_JAR_ABI,
      functionName: 'sendTip',
      args: [message],
      value: parseEther(amount),
    })
  }

  const typedTips = (tips ?? []) as Tip[]

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Subvisual TipJar ☕</h1>
        <ConnectButton />
      </header>

      {!isConnected ? (
        <p style={{ marginTop: '50px', textAlign: 'center', color: '#666' }}>
          Please connect your wallet.
        </p>
      ) : (
        <>
          {/* SEND TIP */}
          <div style={{ margin: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
            <h3>Send a Tip</h3>

            <input
              placeholder="Write a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={inputStyle}
            />

            <input
              placeholder="Amount in ETH"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={inputStyle}
            />

            <button
              onClick={handleSendTip}
              disabled={isSending || isConfirming}
              style={{
                ...buttonStyle,
                backgroundColor: '#0070f3',
                color: '#fff',
              }}
            >
              {isSending || isConfirming ? 'Processing...' : 'Send Tip'}
            </button>
          </div>

          {/* WITHDRAW (OWNER ONLY) */}
          {isOwner && (
            <div style={{ margin: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
              <h3>Withdraw (Owner)</h3>

              <input
                placeholder="Amount in ETH"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                style={inputStyle}
              />

              <button
                onClick={() =>
                  writeWithdraw({
                    address: TIP_JAR_ADDRESS,
                    abi: TIP_JAR_ABI,
                    functionName: 'withdraw',
                    args: [parseEther(withdrawAmount)],
                  })
                }
                disabled={isWithdrawing || !withdrawAmount}
                style={{
                  ...buttonStyle,
                  backgroundColor: '#000',
                  color: '#fff',
                  marginTop: '10px',
                }}
              >
                {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
              </button>
            </div>
          )}

          {/* TIPS */}
          <div style={{ margin: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>Recent Tips</h3>
              <button onClick={() => refetch()}>Refresh</button>
            </div>

            {typedTips.length === 0 ? (
              <p style={{ color: '#666' }}>No tips yet.</p>
            ) : (
              typedTips.slice().reverse().map((tip, i) => (
                <div key={i} style={{ padding: '15px 0', borderBottom: '1px solid #eee' }}>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    From: {tip.from.slice(0, 6)}...{tip.from.slice(-4)}
                  </p>
                  <p style={{ fontWeight: 'bold' }}>"{tip.message}"</p>
                  <p style={{ color: '#0070f3' }}>
                    {formatEther(tip.amount)} ETH
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default App