"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function TasksPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Nhiệm vụ</h1>
          <p className="text-muted-foreground">Quản lý các nhiệm vụ học tập của bạn</p>
        </div>
        <Button asChild>
          <Link href="/tasks/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Thêm nhiệm vụ
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhiệm vụ</CardTitle>
          <CardDescription>
            Tất cả các nhiệm vụ học tập của bạn sẽ hiển thị ở đây
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Chưa có nhiệm vụ nào. Hãy tạo nhiệm vụ mới để bắt đầu!
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
