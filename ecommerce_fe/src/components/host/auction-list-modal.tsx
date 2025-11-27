"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CardContent } from "@/components/ui/card"
import { format, parseISO } from "date-fns"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AuctionListModalProps } from "@/types/modal"
import type { AuctionAPI } from "@/types/api"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export function AuctionListModal({ isOpen, onClose, propertyId }: AuctionListModalProps) {
  const [auctions, setAuctions] = useState<AuctionAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAuctions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${apiUrl}/auctions/property/${propertyId}`)
      if (!response.ok) {
        throw new Error(`Lỗi HTTP! trạng thái: ${response.status}`)
      }
      const data: AuctionAPI[] = await response.json()
      console.log("Danh sách phiên đấu giá nhận được:", data) // Debug dữ liệu nhận được
      setAuctions(data)
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách phiên đấu giá.")
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => {
    if (isOpen) {
      fetchAuctions()
    }
  }, [isOpen, fetchAuctions])

  // Hàm xử lý nút Xem
  const handleView = (auctionId: string) => {
    console.log(`Xem phiên đấu giá với ID: ${auctionId}`) // Debug
    // TODO: Thêm logic xử lý cho nút Xem
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-semibold text-gray-800">
            Danh Sách Phiên Đấu Giá cho Mã Bất Động Sản {propertyId}
          </DialogTitle>
        </DialogHeader>
        <div className="py-6 px-4">
          {loading ? (
            <div className="text-center text-gray-500 font-medium animate-pulse">
              Đang tải danh sách phiên đấu giá...
            </div>
          ) : error ? (
            <div className="text-center text-red-600 font-medium">{error}</div>
          ) : auctions.length === 0 ? (
            <div className="text-center text-gray-500 font-medium">
              Không tìm thấy phiên đấu giá nào cho bất động sản này.
            </div>
          ) : (
            <div className="space-y-4">
              {auctions.map((auction) => {
                console.log("Đang xử lý phiên đấu giá:", auction) // Debug từng auction
                const startDate = auction.start_date ? parseISO(auction.start_date) : null
                const endDate = auction.end_date ? parseISO(auction.end_date) : null
                const auctionStartTime = auction.auction_start_time ? parseISO(auction.auction_start_time) : null
                const auctionEndTime = auction.auction_end_time ? parseISO(auction.auction_end_time) : null
                const createdAt = auction.created_at ? parseISO(auction.created_at) : null

                return (
                  <Collapsible
                    key={auction.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <CollapsibleTrigger className="flex w-full items-center justify-between p-4 font-semibold text-gray-700 hover:text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-600">#{auction.id.slice(0, 8)}</span>
                        <span>-</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            auction.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : auction.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {auction.status === "PENDING" ? "ĐANG CHỜ" : auction.status === "ACTIVE" ? "ĐANG HOẠT ĐỘNG" : "ĐÃ KẾT THÚC"}
                        </span>
                      </div>
                      <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="p-4 bg-white border-t border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <strong className="text-gray-800">Ngày Bắt Đầu:</strong>{" "}
                            {startDate ? format(startDate, "MMM dd, yyyy") : "Không có"}
                          </div>
                          <div>
                            <strong className="text-gray-800">Ngày Kết Thúc:</strong>{" "}
                            {endDate ? format(endDate, "MMM dd, yyyy") : "Không có"}
                          </div>
                          <div>
                            <strong className="text-gray-800">Thời Gian Bắt Đầu Đấu Giá:</strong>{" "}
                            {auctionStartTime ? format(auctionStartTime, "MMM dd, yyyy HH:mm") : "Không có"}
                          </div>
                          <div>
                            <strong className="text-gray-800">Thời Gian Kết Thúc Đấu Giá:</strong>{" "}
                            {auctionEndTime ? format(auctionEndTime, "MMM dd, yyyy HH:mm") : "Không có"}
                          </div>
                          <div>
                            <strong className="text-gray-800">Giá Khởi Điểm:</strong>{" "}
                            ${auction.starting_price.toFixed(2)}
                          </div>
                          <div>
                            <strong className="text-gray-800">Giá Đặt Hiện Tại:</strong>{" "}
                            {auction.current_highest_bid?.toFixed(2) || "Không có"}
                          </div>
                          <div>
                            <strong className="text-gray-800">Thời Gian Tạo:</strong>{" "}
                            {createdAt ? format(createdAt, "MMM dd, yyyy HH:mm") : "Không có"}
                          </div>
                          <div>
                            <strong className="text-gray-800">Mục Tiêu:</strong>{" "}
                            {auction.objective === "HIGHEST_TOTAL" ? "Tổng Số Tiền Cao Nhất" : auction.objective === "HIGHEST_PER_NIGHT" ? "Giá Đêm Cao Nhất" : "Không có"}
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2 text-blue-600 border-blue-600 hover:bg-blue-50"
                            onClick={() => handleView(auction.id)}
                          >
                            <Eye className="h-4 w-4" />
                            <span>Xem</span>
                          </Button>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}