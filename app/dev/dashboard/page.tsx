"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  Database,
  Globe,
  Zap,
  FileText,
  Settings,
  TestTube,
} from "lucide-react"
import Link from "next/link"
import { NewsCRUD } from "@/components/admin/news-crud"

interface LogEntry {
  id: string
  timestamp: string
  type: "error" | "warning" | "info" | "api_call"
  source: string
  message: string
  details?: any
  statusCode?: number
  endpoint?: string
  responseTime?: number
}

interface LogStats {
  total: number
  errors: number
  warnings: number
  apiCalls: number
  recentErrors: number
  recentWarnings: number
}

export default function DevDashboardPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>("all")

  const fetchLogs = async (type?: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (type && type !== "all") params.append("type", type)
      params.append("limit", "100")

      const response = await fetch(`/api/dev/logs?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch logs")

      const data = await response.json()
      setLogs(data.logs || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error("Error fetching logs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs(selectedType !== "all" ? selectedType : undefined)
    const interval = setInterval(() => fetchLogs(selectedType !== "all" ? selectedType : undefined), 30000)
    return () => clearInterval(interval)
  }, [selectedType])

  const clearLogs = async (type?: string) => {
    if (!confirm(`Are you sure you want to clear ${type || "all"} logs?`)) return

    try {
      const params = new URLSearchParams()
      if (type) params.append("type", type)

      const response = await fetch(`/api/dev/logs?${params.toString()}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to clear logs")

      fetchLogs(selectedType !== "all" ? selectedType : undefined)
    } catch (error) {
      console.error("Error clearing logs:", error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case "info":
        return <CheckCircle className="w-4 h-4 text-blue-400" />
      case "api_call":
        return <Activity className="w-4 h-4 text-green-400" />
      default:
        return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "warning":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "info":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "api_call":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Developer Dashboard</h1>
              <p className="text-gray-400">Monitor system health, errors, and API calls</p>
            </div>
            <Button variant="outline" onClick={() => fetchLogs(selectedType !== "all" ? selectedType : undefined)}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">Total Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-red-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">{stats.errors}</div>
                <div className="text-xs text-gray-500 mt-1">{stats.recentErrors} in last 24h</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-yellow-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">Warnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">{stats.warnings}</div>
                <div className="text-xs text-gray-500 mt-1">{stats.recentWarnings} in last 24h</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-green-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">API Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{stats.apiCalls}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="logs" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="bg-gray-800">
              <TabsTrigger value="logs">System Logs</TabsTrigger>
              <TabsTrigger value="apis">API Monitoring</TabsTrigger>
              <TabsTrigger value="tests">Tests</TabsTrigger>
              <TabsTrigger value="news">News Management</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-700"
              >
                <option value="all">All Types</option>
                <option value="error">Errors</option>
                <option value="warning">Warnings</option>
                <option value="info">Info</option>
                <option value="api_call">API Calls</option>
              </select>
              <Button variant="outline" size="sm" onClick={() => clearLogs(selectedType !== "all" ? selectedType : undefined)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear {selectedType !== "all" ? selectedType : "All"}
              </Button>
            </div>
          </div>

          <TabsContent value="logs" className="space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>Real-time error and warning monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-400">Loading logs...</div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No logs found</div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-4 rounded-lg border ${getTypeColor(log.type)} flex items-start gap-4`}
                      >
                        <div className="mt-0.5">{getTypeIcon(log.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {log.type}
                            </Badge>
                            <span className="text-xs text-gray-500">{log.source}</span>
                            <span className="text-xs text-gray-600 ml-auto">{formatTimestamp(log.timestamp)}</span>
                          </div>
                          <div className="text-sm text-white mb-1">{log.message}</div>
                          {log.statusCode && (
                            <div className="text-xs text-gray-400">
                              Status: {log.statusCode} | Response Time: {log.responseTime}ms
                            </div>
                          )}
                          {log.endpoint && (
                            <div className="text-xs text-gray-400">Endpoint: {log.endpoint}</div>
                          )}
                          {log.details && (
                            <details className="mt-2">
                              <summary className="text-xs text-gray-400 cursor-pointer">Details</summary>
                              <pre className="mt-2 text-xs bg-gray-900 p-2 rounded overflow-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="apis">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle>API Monitoring</CardTitle>
                <CardDescription>Monitor API health and response times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400">
                  API monitoring dashboard - Coming soon
                  <br />
                  <Link href="/admin/api-health" className="text-blue-400 hover:underline mt-2 inline-block">
                    View legacy admin panel
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle>Test Runner</CardTitle>
                <CardDescription>Run tests for API endpoints, integrations, and components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400">
                  Test runner - Coming soon
                  <br />
                  <Button className="mt-4" variant="outline">
                    <TestTube className="w-4 h-4 mr-2" />
                    Run All Tests
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <NewsCRUD />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

