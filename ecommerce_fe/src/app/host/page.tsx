"use client"

import { usePropertyDashboardData } from "@/hooks/use-dashboard-data"
import { PropertySelector } from "@/components/host/property-selector"
import { NewSalesOverviewChart } from "@/components/host/dashboard/new-sales-overview-chart"
import { SummaryCards } from "@/components/host/dashboard/summary-cards"
import { OccupancyChart } from "@/components/host/dashboard/occupancy-chart"
import { useAuth } from "@/contexts/auth-context"

export default function HostDashboard() {
  const { user } = useAuth()
  const { properties, selectedProperty, setSelectedProperty, loading, error } = usePropertyDashboardData(parseInt(user?.id || "1"))

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-8 w-48"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (!selectedProperty) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center bg-gray-50 rounded-2xl p-8">
          <svg
            className="w-24 h-24 text-gray-400 mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            ></path>
          </svg>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Không có bất động sản nào được chọn
          </h2>
          <p className="text-gray-500 max-w-md mb-6">
            Bạn chưa chọn bất động sản nào để hiển thị dữ liệu. Hãy chọn một bất động sản từ danh sách hoặc thêm một bất động sản mới.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Property Performance Dashboard</h1>
        <div className="flex items-center space-x-4">
          <PropertySelector
            properties={properties.map(p => ({ id: p.id, name: p.name, location: p.location }))}
            selectedProperty={selectedProperty ? { id: selectedProperty.id, name: selectedProperty.name, location: selectedProperty.location } : null}
            onPropertyChange={(property) => {
              const fullProperty = properties.find(p => p.id === property.id)
              if (fullProperty) {
                setSelectedProperty(fullProperty)
              }
            }}
          />
        </div>
      </div>

      {/* Summary Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <SummaryCards
          expectedSales={selectedProperty.expectedSales}
          totalSales={selectedProperty.totalSales}
          salesIncrease={selectedProperty.salesIncrease}
        />
      </div>

      {/* Main Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NewSalesOverviewChart data={selectedProperty.chartData} />
        <OccupancyChart data={selectedProperty.occupancyData} />
      </div>
    </div>
  )
}