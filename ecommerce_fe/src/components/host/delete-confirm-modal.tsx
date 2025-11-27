"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  propertyTitle: string
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, propertyTitle }: DeleteConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">Xóa Bất Động Sản</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-600">
            Bạn có chắc chắn muốn xóa <span className="font-semibold">"{propertyTitle}"</span>? Hành động này không thể
            hoàn tác và sẽ xóa vĩnh viễn bất động sản cùng tất cả dữ liệu liên quan.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Xóa Bất Động Sản
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}