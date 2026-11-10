"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { demoLogin, fetchDemoAccounts, type DemoAccount } from "@/lib/demo-session"

interface DemoAccountsProps {
	/** Called after a successful demo sign-in (e.g. to close the modal). */
	onSignedIn?: () => void
}

/** "Try without signing up": one-click sign-in as a pre-filled guest or host account. */
export function DemoAccounts({ onSignedIn }: DemoAccountsProps) {
	const router = useRouter()
	const [accounts, setAccounts] = useState<DemoAccount[] | null>(null)
	const [loadingId, setLoadingId] = useState<number | null>(null)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let alive = true
		fetchDemoAccounts()
			.then((a) => alive && setAccounts(a))
			.catch(() => alive && setAccounts([]))
		return () => {
			alive = false
		}
	}, [])

	if (accounts === null || accounts.length === 0) return null // still loading, or demo login disabled

	const signIn = async (account: DemoAccount) => {
		setError(null)
		setLoadingId(account.id)
		try {
			await demoLogin(account.id)
			// Hosts land on their dashboard (pre-filled bookings); guests stay where they were.
			// Navigate before closing the dialog: closing unmounts this component.
			if (account.role === "host") router.push("/host")
			else router.refresh()
			onSignedIn?.()
		} catch {
			setError("Could not sign in with the demo account. Please try again.")
		} finally {
			setLoadingId(null)
		}
	}

	const sorted = [...accounts].sort((a, b) => (a.role === b.role ? 0 : a.role === "guest" ? -1 : 1))

	return (
		<div className="rounded-lg border border-dashed border-gray-300 p-4">
			<p className="text-sm font-semibold text-gray-800">Just looking around?</p>
			<p className="mb-3 text-xs text-gray-500">
				Try a demo account with sample data — no sign-up needed. Demo data resets every day.
			</p>
			<div className="grid grid-cols-2 gap-2">
				{sorted.map((a) => (
					<Button
						key={a.id}
						variant="outline"
						onClick={() => signIn(a)}
						disabled={loadingId !== null}
						className="h-auto flex-col items-start py-2 text-left"
					>
						<span className="flex items-center gap-2 font-semibold">
							{loadingId === a.id && <Loader2 className="h-3 w-3 animate-spin" />}
							{a.role === "host" ? "Demo host" : "Demo guest"}
						</span>
						<span className="text-xs font-normal text-gray-500">
							{a.role === "host" ? "Dashboard, bookings, auctions" : "Browse, bid, book & pay"}
						</span>
					</Button>
				))}
			</div>
			{error && <p className="mt-2 text-xs text-red-600">{error}</p>}
		</div>
	)
}
