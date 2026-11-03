import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { User } from "@/lib/auth-context"
import { usersService } from "@/lib/services/users.service"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload } from "lucide-react"

interface ProfileEditDialogProps {
    user: User
    trigger?: React.ReactNode
    onProfileUpdated: () => void
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const profileSchema = z.object({
    fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
    phoneNumber: z.string().regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, "Số điện thoại không hợp lệ (VD: 0912345678)"),
    gender: z.enum(["Male", "Female", "Other"], { required_error: "Vui lòng chọn giới tính" }),
    dateOfBirth: z.string().refine((date) => {
        if (!date) return true; // Allow empty if optional, but checks elsewhere might require it
        return new Date(date) < new Date();
    }, "Ngày sinh phải nhỏ hơn ngày hiện tại"),
})

type ProfileFormData = z.infer<typeof profileSchema>

export function ProfileEditDialog({
    user,
    trigger,
    onProfileUpdated,
    open,
    onOpenChange,
}: ProfileEditDialogProps) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: user.fullName || "",
            phoneNumber: user.phone || "",
            // Start Case for existing data if needed, or default to Other
            gender: (user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1).toLowerCase() : "Other") as "Male" | "Female" | "Other",
            dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        },
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setAvatarFile(file)
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const onSubmit = async (data: ProfileFormData) => {
        setIsLoading(true)
        try {
            await usersService.updateProfile({
                fullName: data.fullName,
                phoneNumber: data.phoneNumber,
                gender: data.gender,
                dateOfBirth: data.dateOfBirth,
                avatar: avatarFile || undefined,
            })

            toast({
                title: "Thành công",
                description: "Cập nhật thông tin cá nhân thành công",
            })

            onProfileUpdated()
            if (onOpenChange) onOpenChange(false);
        } catch (error: any) {
            console.error("Profile update error:", error);
            toast({
                title: "Thất bại",
                description: error.message || "Có lỗi xảy ra khi cập nhật. Vui lòng kiểm tra lại thông tin.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Handle uncontrolled vs controlled state slightly different but for now assume controlled if open prop provided
    const showTrigger = !open && trigger;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {showTrigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa thông tin</DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin cá nhân của bạn tại đây.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border">
                            {(previewUrl || user.avatar) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={previewUrl || user.avatar || ""}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <span className="text-2xl text-muted-foreground">
                                        {user.fullName?.[0]?.toUpperCase() || "?"}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <Label
                                htmlFor="avatar"
                                className="cursor-pointer flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                            >
                                <Upload className="w-4 h-4" />
                                Thay đổi ảnh đại diện
                            </Label>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="fullName" className={errors.fullName ? "text-destructive" : ""}>Họ và tên</Label>
                        <Input id="fullName" {...register("fullName")} className={errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""} />
                        {errors.fullName && <span className="text-xs text-destructive">{errors.fullName.message}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phoneNumber" className={errors.phoneNumber ? "text-destructive" : ""}>Số điện thoại</Label>
                        <Input id="phoneNumber" {...register("phoneNumber")} className={errors.phoneNumber ? "border-destructive focus-visible:ring-destructive" : ""} />
                        {errors.phoneNumber && <span className="text-xs text-destructive">{errors.phoneNumber.message}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="gender" className={errors.gender ? "text-destructive" : ""}>Giới tính</Label>
                        <Select
                            defaultValue={user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1).toLowerCase() : "Other"}
                            onValueChange={(value) => setValue("gender", value as "Male" | "Female" | "Other")}
                        >
                            <SelectTrigger className={errors.gender ? "border-destructive focus:ring-destructive" : ""}>
                                <SelectValue placeholder="Chọn giới tính" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male">Nam</SelectItem>
                                <SelectItem value="Female">Nữ</SelectItem>
                                <SelectItem value="Other">Khác</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.gender && <span className="text-xs text-destructive">{errors.gender.message}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="dateOfBirth" className={errors.dateOfBirth ? "text-destructive" : ""}>Ngày sinh</Label>
                        <Input
                            id="dateOfBirth"
                            type="date"
                            {...register("dateOfBirth")}
                            className={errors.dateOfBirth ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {errors.dateOfBirth && <span className="text-xs text-destructive">{errors.dateOfBirth.message}</span>}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Lưu thay đổi
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
