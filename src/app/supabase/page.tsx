"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Database } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { DatabaseTables, TableName } from "@/lib/supabase/schema"

type TableData<T extends TableName> = {
  columns: string[]
  rows: DatabaseTables[T][]
}

export default function SupabaseAdminPage() {
  const [activeTab, setActiveTab] = useState<TableName>("subjects")
  const [data, setData] = useState<{ [key in TableName]?: TableData<key> }>({})
  const [loading, setLoading] = useState<{ [key in TableName]?: boolean }>({})
  const [error, setError] = useState<string | null>(null)

  const tableNames: TableName[] = ["subjects", "schedules", "notes", "lessons", "tasks"]

  const fetchTableData = async (tableName: TableName) => {
    try {
      setLoading(prev => ({ ...prev, [tableName]: true }))
      setError(null)

      const { data: tableData, error: fetchError } = await supabase
        .from(tableName)
        .select("*")
        .limit(100) // Limit to prevent over-fetching

      if (fetchError) throw fetchError

      const columns = tableData && tableData.length > 0 
        ? Object.keys(tableData[0]) 
        : []

      setData(prev => ({
        ...prev,
        [tableName]: {
          columns,
          rows: tableData || []
        }
      }))
    } catch (err) {
      console.error(`Error fetching ${tableName}:`, err)
      setError(`Failed to load ${tableName}: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(prev => ({ ...prev, [tableName]: false }))
    }
  }

  useEffect(() => {
    if (!data[activeTab]) {
      fetchTableData(activeTab)
    }
  }, [activeTab])

  const handleRefresh = () => {
    fetchTableData(activeTab)
  }

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return "null"
    if (Array.isArray(value)) return `[${value.join(", ")}]`
    if (typeof value === "object") return JSON.stringify(value)
    return String(value)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Database className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Database Manager</h1>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TableName)} className="space-y-4">
        <TabsList>
          {tableNames.map((table) => (
            <TabsTrigger key={table} value={table}>
              {table.charAt(0).toUpperCase() + table.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading[activeTab]}
          >
            {loading[activeTab] ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Refresh Data"
            )}
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {tableNames.map((table) => (
          <TabsContent key={table} value={table}>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  {table.charAt(0).toUpperCase() + table.slice(1)} Table
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({(data[table]?.rows?.length || 0)} rows)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {data[table]?.columns.map((column) => (
                            <th 
                              key={column}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loading[table] ? (
                          <tr>
                            <td colSpan={data[table]?.columns.length || 1} className="px-6 py-4 text-center">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                            </td>
                          </tr>
                        ) : data[table]?.rows.length ? (
                          data[table]?.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                              {data[table]?.columns.map((column) => (
                                <td 
                                  key={`${rowIndex}-${column}`}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate"
                                  title={formatValue((row as any)[column])}
                                >
                                  {formatValue((row as any)[column])}
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={data[table]?.columns.length || 1} className="px-6 py-4 text-center text-gray-500">
                              No data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
