"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, Minus, Upload, MapPin, DollarSign, Home, ImageIcon } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import type { PropertyCreationModalProps } from "@/types/modal"
import type { Amenity, PropertyType, PropertyCategory } from "@/types/property"
import type { AmenityAPI, PropertyTypeAPI, PropertyCategoryAPI, PropertyAPI } from "@/types/api"
import AddressMap from "@/components/shared/map"
import type { AddressData } from "@/types/address"
import { useAuth } from "@/contexts/auth-context"

const apiUrl = process.env.NEXT_PUBLIC_API_URL
const AMENITIES_PER_PAGE = 50

export function PropertyCreationModal({ isOpen, onClose, onPropertyCreated }: PropertyCreationModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number | null>(null)
  const {user} = useAuth()
  const [host_id] = useState(Number(user?.id) || 1)
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    idImage: null as File | null,
    title: "",
    description: "",
    propertyType: "",
    category: "",
    addressLine1: "",
    city: "",
    state: null as string | null,
    country: "",
    postalCode: null as string | null,
    latitude: null as number | null,
    longitude: null as number | null,
    basePrice: 0,
    cleaningFee: 0,
    cancellationPolicy: "FLEXIBLE" as "FLEXIBLE" | "MODERATE" | "STRICT" | "SUPER_STRICT",
    instantBook: false,
    minimumStay: 1,
    maxGuests: 1,
    bedrooms: 1,
    bathrooms: 1,
    images: [] as File[],
    selectedAmenities: [] as string[],
  })

  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([])
  const [categories, setCategories] = useState<PropertyCategory[]>([])
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([])
  const [displayedAmenities, setDisplayedAmenities] = useState<Amenity[]>([])
  const [amenitySearch, setAmenitySearch] = useState("")
  const [amenityPage, setAmenityPage] = useState(1)
  const [hasMoreAmenities, setHasMoreAmenities] = useState(true)
  const [loadingAmenities, setLoadingAmenities] = useState(false)
  const [loadedAmenityCount, setLoadedAmenityCount] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const idInputRef = useRef<HTMLInputElement>(null)

  const fetchReferenceData = useCallback(async () => {
    setLoading(true)
    try {
      const [typesRes, categoriesRes] = await Promise.all([
        fetch(`${apiUrl}/property-types/available`),
        fetch(`${apiUrl}/property-categories/available`),
      ])

      if (!typesRes.ok || !categoriesRes.ok) {
        throw new Error("Không thể tải dữ liệu tham chiếu.")
      }

      const typesData: PropertyTypeAPI[] = await typesRes.json()
      const categoriesData: PropertyCategoryAPI[] = await categoriesRes.json()

      const typeIds = typesData.map((t) => t.id)
      const uniqueTypeIds = new Set(typeIds)
      if (typeIds.length !== uniqueTypeIds.size) {
        console.warn("Phát hiện ID trùng lặp trong propertyTypes:", typeIds)
      }

      setPropertyTypes(typesData)
      setCategories(categoriesData)
    } catch (err: any) {
      setError(err.message || "Không thể tải dữ liệu biểu mẫu.")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAmenities = useCallback(async (query: string, offset: number, limit: number) => {
    setLoadingAmenities(true)
    setError(null)
    try {
      const endpoint = query
        ? `${apiUrl}/property-amenities/search?query=${encodeURIComponent(query)}&offset=${offset}&limit=${limit}`
        : `${apiUrl}/property-amenities/available?offset=${offset}&limit=${limit}`
      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error(`Không thể tải tiện ích: ${response.statusText}`)
      }
      const data = await response.json()

      const amenitiesData: AmenityAPI[] = data.items || data
      const total: number = data.total || amenitiesData.length

      const mappedAmenities = amenitiesData.map((a) => ({ ...a, id: String(a.id) }))

      setAllAmenities((prev) => {
        const newAmenities = [...prev, ...mappedAmenities].reduce((unique, item) => {
          return unique.some((a) => a.id === item.id) ? unique : [...unique, item]
        }, [] as Amenity[])
        return newAmenities
      })

      setDisplayedAmenities((prev) => {
        if (query) {
          return mappedAmenities
        } else {
          const newAmenities = [...prev, ...mappedAmenities].reduce((unique, item) => {
            return unique.some((a) => a.id === item.id) ? unique : [...unique, item]
          }, [] as Amenity[])
          return newAmenities
        }
      })

      if (!query) {
        setLoadedAmenityCount((prev) => prev + amenitiesData.length)
      }

      setHasMoreAmenities(amenitiesData.length === limit)
    } catch (err: any) {
      console.error("Không thể tải tiện ích:", err)
      setError(err.message || "Không thể tải tiện ích")
    } finally {
      setLoadingAmenities(false)
    }
  }, [])

  const loadMoreAmenities = () => {
    setAmenityPage((prev) => prev + 1)
  }

  const clearSearch = () => {
    setAmenitySearch("")
    setAmenityPage(1)
    setDisplayedAmenities([])
    setAllAmenities([])
    setLoadedAmenityCount(0)
    setHasMoreAmenities(true)
  }

  const clearAllAmenities = () => {
    setFormData((prev) => ({ ...prev, selectedAmenities: [] }))
  }

  useEffect(() => {
    if (isOpen) {
      fetchReferenceData()
      setCurrentStep(1)
      setFormData({
        email: "",
        phone: "",
        idImage: null,
        title: "",
        description: "",
        propertyType: "",
        category: "",
        addressLine1: "",
        city: "",
        state: null,
        country: "",
        postalCode: null,
        latitude: null,
        longitude: null,
        basePrice: 0,
        cleaningFee: 0,
        cancellationPolicy: "FLEXIBLE",
        instantBook: false,
        minimumStay: 1,
        maxGuests: 1,
        bedrooms: 1,
        bathrooms: 1,
        images: [],
        selectedAmenities: [],
      })
      setError(null)
      setAmenitySearch("")
      setAmenityPage(1)
      setDisplayedAmenities([])
      setAllAmenities([])
      setHasMoreAmenities(true)
      setLoadedAmenityCount(0)
      setSelectedImage(null)
      setPrimaryImageIndex(null)
    }
  }, [isOpen, fetchReferenceData])

  useEffect(() => {
    if (isOpen) {
      fetchAmenities(amenitySearch, (amenityPage - 1) * AMENITIES_PER_PAGE, AMENITIES_PER_PAGE)
    }
  }, [isOpen, amenitySearch, amenityPage, fetchAmenities])

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCountChange = (field: "maxGuests" | "bedrooms" | "bathrooms", increment: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: increment ? prev[field] + 1 : Math.max(1, prev[field] - 1),
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files)
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }))
    }
  }

  const handleIdUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setFormData((prev) => ({ ...prev, idImage: event.target.files![0] }))
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(null)
    } else if (primaryImageIndex !== null && index < primaryImageIndex) {
      setPrimaryImageIndex((prev) => (prev !== null ? prev - 1 : null))
    }
  }

  const handleSetPrimary = (index: number) => {
    setPrimaryImageIndex(index)
    console.log("Đặt ảnh chính tại vị trí:", index)
  }

  const toggleAmenity = (amenityId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(amenityId)
        ? prev.selectedAmenities.filter((id) => id !== amenityId)
        : [...prev.selectedAmenities, amenityId],
    }))
  }

  const handleLocationSave = (data: AddressData) => {
    setFormData((prev) => ({
      ...prev,
      addressLine1: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postcode,
      latitude: data.latitude,
      longitude: data.longitude,
    }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.email && formData.phone && formData.idImage)
      case 2:
        return !!formData.propertyType
      case 3:
        return !!formData.category
      case 4:
        return !!(formData.latitude && formData.longitude)
      case 5:
        return formData.basePrice > 0
      case 6:
        return formData.maxGuests > 0 && formData.bedrooms >= 0 && formData.bathrooms >= 0
      case 7:
        return formData.images.length > 0
      case 8:
        return true
      case 9:
        return !!(formData.title && formData.description)
      default:
        return true
    }
  }

  const handleSubmit = async (publish = true) => {
    setLoading(true)
    setError(null)
    try {
      const formDataToSend = new FormData()
      const propertyData: PropertyAPI = {
        host_id: host_id,
        title: formData.title,
        description: formData.description || null,
        property_type: formData.propertyType,
        category: formData.category,
        max_guests: formData.maxGuests,
        bedrooms: formData.bedrooms || null,
        bathrooms: formData.bathrooms || null,
        address_line1: formData.addressLine1 || null,
        city: formData.city,
        state: formData.state || null,
        country: formData.country,
        postal_code: formData.postalCode || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        base_price: formData.basePrice,
        cleaning_fee: formData.cleaningFee || null,
        cancellation_policy: formData.cancellationPolicy,
        instant_book: formData.instantBook,
        minimum_stay: formData.minimumStay,
        status: publish ? "ACTIVE" : "DRAFT",
        amenities: formData.selectedAmenities,
        images: [],
        id: 0,
        created_at: "",
        updated_at: null,
      }

      if (!propertyData.images) {
        propertyData.images = []
      }

      if (formData.idImage) {
        propertyData.images.push({
          id: null,
          image_url: null,
          alt_text: formData.idImage.name,
          title: formData.idImage.name,
          display_order: 0,
          is_primary: false,
        })
      }

      formData.images.forEach((img, index) => {
        propertyData.images?.push({
          id: null,
          image_url: null,
          alt_text: img.name,
          title: img.name,
          display_order: formData.idImage ? index + 1 : index,
          is_primary: primaryImageIndex === index || (primaryImageIndex === null && index === 0),
        })
      })

      if (primaryImageIndex === null && propertyData.images.length > 0 && !formData.idImage) {
        propertyData.images[0].is_primary = true
      }

      console.group("=== Trước khi gửi yêu cầu tạo ===")
      console.log("PropertyData (Payload):", JSON.stringify(propertyData, null, 2))
      console.log("Tệp FormData:", [
        ...(formData.idImage ? [formData.idImage.name] : []),
        ...formData.images.map((file) => file.name),
      ])
      console.log("Số lượng ảnh mới:", propertyData.images.length)
      console.log("Số lượng ảnh với id: null:", propertyData.images.filter((img) => img.id === null).length)
      console.log("Vị trí ảnh chính:", primaryImageIndex)
      console.log("Tiện ích đã chọn:", formData.selectedAmenities)
      console.log("Dữ liệu FormData (JSON):", JSON.stringify(propertyData, null, 2))
      console.groupEnd()

      formDataToSend.append("data", JSON.stringify(propertyData))

      if (formData.idImage) {
        formDataToSend.append("files", formData.idImage)
      }

      formData.images.forEach((file) => {
        formDataToSend.append("files", file)
      })

      const response = await fetch(`${apiUrl}/properties-host/create`, {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail?.detail || "Không thể tạo bất động sản")
      }

      const newProperty = await response.json()
      onPropertyCreated(newProperty.id)
      onClose()
    } catch (err: any) {
      setError(err.message || "Không thể tạo bất động sản")
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    "Thông Tin Cơ Bản",
    "Loại Bất Động Sản",
    "Danh Mục",
    "Vị Trí",
    "Giá & Chính Sách",
    "Chi Tiết",
    "Hình Ảnh",
    "Tiện Ích",
    "Mô Tả",
  ]

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Thông Tin Cơ Bản</h2>
              <p className="text-gray-600 mb-6">Hãy bắt đầu với thông tin liên hệ và xác minh danh tính của bạn.</p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Địa Chỉ Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Số Điện Thoại</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    placeholder="+84 123 456 789"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="idImage">Tài Liệu Định Danh</Label>
                  <div
                    onClick={() => idInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Nhấn để tải lên tài liệu định danh</p>
                  </div>
                  <input
                    ref={idInputRef}
                    id="idImage"
                    type="file"
                    accept="image/*"
                    onChange={handleIdUpload}
                    className="hidden"
                    required
                  />
                  {formData.idImage && (
                    <div className="mt-4 relative group">
                      <img
                        src={URL.createObjectURL(formData.idImage) || "/placeholder.svg"}
                        alt="Tài Liệu Định Danh"
                        className="w-32 h-32 object-cover rounded-lg cursor-pointer"
                        onClick={() => formData.idImage && setSelectedImage(URL.createObjectURL(formData.idImage))}
                      />
                      <button
                        type="button"
                        onClick={() => updateFormData("idImage", null)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <Badge className="absolute bottom-2 left-2 bg-green-100 text-green-800">Tài Liệu Định Danh</Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Loại Bất Động Sản</h2>
              <p className="text-gray-600 mb-6">Bạn đang đăng ký loại bất động sản nào?</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {propertyTypes.length === 0 ? (
                  <p className="text-gray-500 col-span-full">Không có loại bất động sản nào.</p>
                ) : (
                  propertyTypes.map((type, index) => (
                    <button
                      key={type.id ?? `type-${index}`}
                      onClick={() => updateFormData("propertyType", type.name)}
                      className={`p-4 rounded-lg border-2 transition-all hover:border-gray-400 ${
                        formData.propertyType === type.name ? "border-cyan-500 bg-cyan-50" : "border-gray-200"
                      }`}
                    >
                      <Home className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                      <div className="text-sm font-medium">{type.name}</div>
                      {type.description && <div className="text-xs text-gray-500 mt-1">{type.description}</div>}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Danh Mục Bất Động Sản</h2>
              <p className="text-gray-600 mb-6">Danh mục nào mô tả tốt nhất nơi ở của bạn?</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((category, index) => (
                  <button
                    key={category.id ?? `category-${index}`}
                    onClick={() => updateFormData("category", category.name)}
                    className={`p-4 rounded-lg border-2 transition-all hover:border-gray-400 ${
                      formData.category === category.name ? "border-cyan-500 bg-cyan-50" : "border-gray-200"
                    }`}
                  >
                    <div className="text-2xl mb-2">🏠</div>
                    <div className="text-sm font-medium">{category.name}</div>
                    {category.description && <div className="text-xs text-gray-500 mt-1">{category.description}</div>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Vị Trí</h2>
              <p className="text-gray-600 mb-6">Đặt vị trí bất động sản của bạn bằng bản đồ.</p>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">Vị Trí Bản Đồ</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Kéo điểm đánh dấu hoặc tìm kiếm địa chỉ để đặt tọa độ chính xác.
                </p>
                <AddressMap
                  addressData={{
                    address: formData.addressLine1,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country,
                    postcode: formData.postalCode,
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                  }}
                  onSave={handleLocationSave}
                />
                {formData.addressLine1 && (
                  <div className="mt-4 text-sm text-gray-700">
                    <p>
                      <strong>Địa Chỉ Đã Chọn:</strong> {formData.addressLine1}, {formData.city},{" "}
                      {formData.state ? `${formData.state}, ` : ""}
                      {formData.postalCode}, {formData.country}
                    </p>
                    <p>
                      <strong>Tọa Độ:</strong> Vĩ độ {formData.latitude?.toFixed(4)}, Kinh độ{" "}
                      {formData.longitude?.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Giá & Chính Sách</h2>
              <p className="text-gray-600 mb-6">Thiết lập giá và chính sách đặt chỗ của bạn.</p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="basePrice">Giá Cơ Bản mỗi Đêm</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="basePrice"
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) => updateFormData("basePrice", Number.parseFloat(e.target.value) || 0)}
                      placeholder="100"
                      className="pl-10"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cleaningFee">Phí Dọn Dẹp (Tùy Chọn)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="cleaningFee"
                      type="number"
                      value={formData.cleaningFee}
                      onChange={(e) => updateFormData("cleaningFee", Number.parseFloat(e.target.value) || 0)}
                      placeholder="25"
                      className="pl-10"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cancellationPolicy">Chính Sách Hủy</Label>
                  <Select
                    value={formData.cancellationPolicy}
                    onValueChange={(value) => updateFormData("cancellationPolicy", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chính sách" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FLEXIBLE">Linh Hoạt - Hoàn tiền đầy đủ 1 ngày trước</SelectItem>
                      <SelectItem value="MODERATE">Trung Bình - Hoàn tiền đầy đủ 5 ngày trước</SelectItem>
                      <SelectItem value="STRICT">Nghiêm Ngặt - Hoàn 50% tiền đến 1 tuần trước</SelectItem>
                      <SelectItem value="SUPER_STRICT">Siêu Nghiêm Ngặt - Hoàn 50% tiền đến 30 ngày trước</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="minimumStay">Số Đêm Tối Thiểu</Label>
                  <Input
                    id="minimumStay"
                    type="number"
                    value={formData.minimumStay}
                    onChange={(e) => updateFormData("minimumStay", Number.parseInt(e.target.value) || 1)}
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Chi Tiết Bất Động Sản</h2>
              <p className="text-gray-600 mb-6">Cho chúng tôi biết về không gian và sức chứa.</p>

              <div className="space-y-6">
                {[
                  { field: "maxGuests", label: "Số Khách Tối Đa", icon: "👥" },
                  { field: "bedrooms", label: "Phòng Ngủ", icon: "🛏️" },
                  { field: "bathrooms", label: "Phòng Tắm", icon: "🚿" },
                ].map(({ field, label, icon }, index) => (
                  <div key={field} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{icon}</span>
                      <span className="font-medium">{label}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Button
                        type="button"
                        onClick={() => handleCountChange(field as "maxGuests" | "bedrooms" | "bathrooms", false)}
                        className="w-16 h-16 rounded-full border-2 border-gray-300 bg-white hover:bg-cyan-200 hover:border-cyan-700 text-gray-800 hover:text-cyan-800 font-bold shadow-sm flex items-center justify-center transition-all"
                        disabled={
                          (formData[field as keyof typeof formData] as number) <= 1 &&
                          field !== "bedrooms" &&
                          field !== "bathrooms"
                        }
                      >
                        <Minus className="h-8 w-8" strokeWidth={3.5} />
                      </Button>
                      <span className="w-8 text-center font-semibold">
                        {formData[field as keyof typeof formData] as number}
                      </span>
                      <Button
                        type="button"
                        onClick={() => handleCountChange(field as "maxGuests" | "bedrooms" | "bathrooms", true)}
                        className="w-16 h-16 rounded-full border-2 border-gray-300 bg-white hover:bg-cyan-200 hover:border-cyan-700 text-gray-800 hover:text-cyan-800 font-bold shadow-sm flex items-center justify-center transition-all"
                      >
                        <Plus className="h-8 w-8" strokeWidth={3.5} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Hình Ảnh Bất Động Sản</h2>
              <p className="text-gray-600 mb-6">Tải lên các ảnh chất lượng cao của bất động sản của bạn.</p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Nhấn để tải lên hình ảnh</p>
                <p className="text-sm text-gray-500">Tải lên nhiều hình ảnh (JPG, PNG, GIF)</p>
                {formData.images.length > 0 && (
                  <Badge className="mt-2 bg-green-100 text-green-800">✓ {formData.images.length} hình ảnh đã tải lên</Badge>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image) || "/placeholder.svg"}
                        alt={`Hình ảnh ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer"
                        onClick={() => setSelectedImage(URL.createObjectURL(image))}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {(primaryImageIndex === index || (primaryImageIndex === null && index === 0)) && (
                        <Badge className="absolute bottom-2 left-2 bg-cyan-500 text-white">Ảnh Chính</Badge>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(index)}
                        className={`absolute bottom-2 right-2 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${primaryImageIndex === index ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                        disabled={primaryImageIndex === index}
                      >
                        {primaryImageIndex === index ? "Ảnh Chính" : "Đặt làm Ảnh Chính"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Tiện Ích</h2>
              <p className="text-gray-600 mb-6">Tìm kiếm và chọn tiện ích cho bất động sản của bạn.</p>

              <div className="flex items-center gap-2 mb-4">
                <Input
                  placeholder="Tìm kiếm tiện ích..."
                  value={amenitySearch}
                  onChange={(e) => {
                    setAmenitySearch(e.target.value)
                    setAmenityPage(1)
                    setDisplayedAmenities([])
                    setAllAmenities([])
                    setLoadedAmenityCount(0)
                  }}
                  className="border-blue-300 max-w-md"
                />
                {amenitySearch && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSearch}
                    className="text-gray-600 border-gray-300 hover:bg-gray-50 bg-transparent"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Search
                  </Button>
                )}
                {formData.selectedAmenities.length > 0 && (
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
                    onClick={clearAllAmenities}
                  >
                    Xóa Tất Cả
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto border rounded-md p-2">
                {loadingAmenities ? (
                  <div className="col-span-full text-center text-gray-500">Đang tải tiện ích...</div>
                ) : displayedAmenities.length === 0 ? (
                  <div className="col-span-full text-center text-gray-500">Không tìm thấy tiện ích</div>
                ) : (
                  displayedAmenities.map((amenity) => (
                    <button
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${formData.selectedAmenities.includes(amenity.id) ? "border-blue-600 bg-blue-100" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className="text-sm font-medium">{amenity.name}</div>
                      <div className="text-xs text-gray-500">{amenity.category}</div>
                    </button>
                  ))
                )}
              </div>

              {hasMoreAmenities && !amenitySearch && (
                <Button
                  onClick={loadMoreAmenities}
                  className="w-full mt-4 bg-blue-100 text-blue-800 hover:bg-blue-200"
                  disabled={loadingAmenities}
                >
                  Tải Thêm
                </Button>
              )}

              {formData.selectedAmenities.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">
                    Tiện Ích Đã Chọn ({formData.selectedAmenities.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedAmenities.map((amenityId) => {
                      const amenity = allAmenities.find((a) => a.id === amenityId)
                      return amenity ? (
                        <Badge
                          key={amenityId}
                          className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                          onClick={() => toggleAmenity(amenityId)}
                        >
                          {amenity.name} ×
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 9:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Tiêu Đề & Mô Tả</h2>
              <p className="text-gray-600 mb-6">Tạo tiêu đề và mô tả hấp dẫn cho bất động sản của bạn.</p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Tiêu Đề Bất Động Sản</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateFormData("title", e.target.value)}
                    placeholder="Căn hộ ấm cúng ở trung tâm với tầm nhìn thành phố"
                    maxLength={100}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 ký tự</p>
                </div>

                <div>
                  <Label htmlFor="description">Mô Tả</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    placeholder="Mô tả không gian của bạn, điều gì làm nó đặc biệt, và những gì khách có thể mong đợi..."
                    rows={6}
                    maxLength={1000}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1000 ký tự</p>
                </div>
              </div>

              <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Xem Trước</h3>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-2">{formData.title || "Tiêu Đề Bất Động Sản Của Bạn"}</h4>
                  <p className="text-gray-600 text-sm mb-2">
                    {formData.city && formData.country ? `${formData.city}, ${formData.country}` : "Vị trí"}
                  </p>
                  <p className="text-gray-700 text-sm">
                    {formData.description || "Mô tả bất động sản của bạn sẽ xuất hiện ở đây..."}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {formData.maxGuests} khách • {formData.bedrooms} phòng ngủ • {formData.bathrooms} phòng tắm
                    </span>
                    <span className="font-semibold">${formData.basePrice}/đêm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Tạo Bất Động Sản Mới</DialogTitle>
        </VisuallyHidden>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tạo Bất Động Sản Mới</h1>
              <p className="text-gray-600">
                Bước {currentStep} / {steps.length}: {steps[currentStep - 1]}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2">
              {steps.map((step, index) => (
                <span
                  key={step}
                  className={`text-xs ${index + 1 <= currentStep ? "text-cyan-600 font-medium" : "text-gray-400"}`}
                >
                  {step}
                </span>
              ))}
            </div>
          </div>

          <div className="min-h-[400px] relative">
            {loading ? (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-lg font-medium text-gray-900 mb-2">Đang tạo bất động sản...</p>
                  <p className="text-sm text-gray-600">Vui lòng đợi, quá trình này có thể mất vài phút</p>
                </div>
              </div>
            ) : null}
            <div className={loading ? "opacity-50 pointer-events-none" : ""}>{renderStepContent()}</div>
          </div>

          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <VisuallyHidden>
              <DialogTitle>Ảnh Phóng To</DialogTitle>
            </VisuallyHidden>
            <DialogContent className="max-w-4xl p-0">
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Ảnh phóng to"
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            </DialogContent>
          </Dialog>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className={`flex justify-between pt-6 border-t ${loading ? "opacity-50" : ""}`}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1 || loading}
            >
              Trước
            </Button>

            <div className="flex gap-2">
              {currentStep === steps.length ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSubmit(false)}
                    disabled={loading || !validateStep(currentStep)}
                    className="relative"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent mr-2"></div>
                        Đang lưu nháp...
                      </>
                    ) : (
                      "Lưu Nháp"
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSubmit(true)}
                    disabled={loading || !validateStep(currentStep)}
                    className="bg-cyan-500 hover:bg-cyan-600 relative"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Đang xuất bản...
                      </>
                    ) : (
                      "Xuất Bản Bất Động Sản"
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                  disabled={!validateStep(currentStep) || loading}
                  className="bg-cyan-500 hover:bg-cyan-600"
                >
                  Tiếp Theo
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}