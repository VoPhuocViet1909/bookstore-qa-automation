"use client"

import { useState, useRef, DragEvent, ChangeEvent } from "react"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
    onFileSelect?: (file: File) => void
    className?: string
    disabled?: boolean
}

export function ImageUpload({
    value,
    onChange,
    onFileSelect,
    className,
    disabled = false
}: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [preview, setPreview] = useState<string | undefined>(value)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (!disabled) {
            setIsDragging(true)
        }
    }

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (disabled) return

        const files = e.dataTransfer.files
        if (files && files.length > 0) {
            const file = files[0]
            handleFileSelection(file)
        }
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            const file = files[0]
            handleFileSelection(file)
        }
    }

    const handleFileSelection = (file: File) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Vui lòng chọn file ảnh")
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("Kích thước file không được vượt quá 5MB")
            return
        }

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Store file for later upload
        setSelectedFile(file)

        // Notify parent component
        if (onFileSelect) {
            onFileSelect(file)
        }
    }

    const handleRemove = () => {
        setPreview(undefined)
        setSelectedFile(null)
        onChange("")
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleClick = () => {
        if (!disabled) {
            fileInputRef.current?.click()
        }
    }

    // Update preview when value changes externally (after upload)
    if (value && value !== preview && !selectedFile) {
        setPreview(value)
    }

    return (
        <div className={cn("space-y-2", className)}>
            {/* Upload Area */}
            {!preview ? (
                <div
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer",
                        isDragging
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={disabled}
                    />

                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                        <div className="rounded-full bg-primary/10 p-3">
                            <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                Kéo thả ảnh vào đây hoặc nhấn để chọn
                            </p>
                            <p className="text-xs text-muted-foreground">
                                PNG, JPG, JPEG (tối đa 5MB)
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                /* Preview Area */
                <div className="relative group">
                    <div className="relative aspect-square w-full max-w-[300px] mx-auto overflow-hidden rounded-lg border bg-muted">
                        <img
                            src={preview}
                            alt="Preview"
                            className="h-full w-full object-cover"
                        />

                        {/* Overlay with actions */}
                        {!disabled && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleClick}
                                    className="rounded-full bg-white p-2 text-black hover:bg-gray-200 transition-colors"
                                    title="Thay đổi ảnh"
                                >
                                    <ImageIcon className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600 transition-colors"
                                    title="Xóa ảnh"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Hidden input for changing image */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={disabled}
                    />
                </div>
            )}

            {/* File info */}
            {selectedFile && (
                <div className="text-xs text-muted-foreground text-center">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </div>
            )}
        </div>
    )
}
