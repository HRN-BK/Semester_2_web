"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function NewTaskPage() {
  const router = useRouter()

  return (
    <div className="max-w-2xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-6 -ml-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <h1 className="text-3xl font-bold mb-6">Thêm nhiệm vụ mới</h1>
      
      <form className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Tiêu đề</label>
            <Input placeholder="Nhập tiêu đề nhiệm vụ" required />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Mô tả</label>
            <Textarea 
              placeholder="Mô tả chi tiết nhiệm vụ..." 
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Hạn chót</label>
              <Input type="date" required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Môn học</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">Chọn môn học</option>
                <option value="math">Toán học</option>
                <option value="physics">Vật lý</option>
                <option value="chemistry">Hóa học</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
          >
            Hủy
          </Button>
          <Button type="submit">Lưu nhiệm vụ</Button>
        </div>
      </form>
    </div>
  )
}
